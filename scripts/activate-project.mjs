import fs from "node:fs/promises";
import ts from "typescript";
import crypto from "node:crypto";
import { request, ensure, config } from "./server-client.mjs";
const dry = process.argv.includes("--dry-run");
const startedOn = config.HR_IMPORT_STARTED_ON;
if (
  !dry &&
  (!/^\d{4}-\d{2}-\d{2}$/.test(startedOn || "") ||
    Number.isNaN(Date.parse(startedOn)))
)
  throw new Error(
    "Set reviewed HR_IMPORT_STARTED_ON in .env.server before activation.",
  );
const code = ts.transpileModule(
  await fs.readFile("src/lib/realData.ts", "utf8"),
  { compilerOptions: { module: ts.ModuleKind.ES2020 } },
).outputText;
const dataUrl =
  "data:text/javascript;base64," + Buffer.from(code).toString("base64");
const { REAL_EMPLOYEES } = await import(dataUrl);
const constants = ts
  .transpileModule(await fs.readFile("src/lib/constants.ts", "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ES2020 },
  })
  .outputText.replace("'./realData'", JSON.stringify(dataUrl));
const { INITIAL_WORK_POINTS } = await import(
  "data:text/javascript;base64," + Buffer.from(constants).toString("base64")
);
const normalize = (s) =>
  String(s || "")
    .replace(/[أإآ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/\s/g, "");
const points = INITIAL_WORK_POINTS.map((p) => ({
  id: p.id,
  name: p.name,
  status: "نشطة",
  data: {
    governorate: p.governorate,
    supervisor_name: p.supervisor_name || p.supervisor || "",
    programs: p.programs_supported.join(" / "),
    address: p.address_details || "",
    shared_base_point_id: p.shared_base_point_id || null,
  },
}));
const issues = [];
const rows = REAL_EMPLOYEES.map((e) => {
  let candidates = points.filter(
    (p) => normalize(p.name) === normalize(e.point_name),
  );
  if (normalize(e.point_name) === normalize("إداري")) {
    candidates = points.filter((p) => p.id === "pt-admin");
  }
  if (candidates.length !== 1) {
    const key = normalize(e.supervisor_name).slice(0, 4);
    candidates = candidates.filter((p) =>
      normalize(p.data.supervisor_name).startsWith(key),
    );
  }
  if (candidates.length !== 1) {
    issues.push({
      national_id: e.national_id,
      point_name: e.point_name,
      supervisor: e.supervisor_name,
      candidates: candidates.map((p) => p.id),
    });
  }
  return {
    national_id: e.national_id,
    point_id: candidates.length === 1 ? candidates[0].id : null,
    status: "نشط",
    started_on: startedOn || null,
    data: {
      full_name_ar: e.full_name_ar,
      phone: e.phone,
      department: e.department,
      category: e.category,
      job_title:
        e.category === "منسق"
          ? "منسقة المشروع"
          : e.category === "أمن"
            ? "أمن"
            : e.category === "متطوع"
              ? "متطوع"
              : "كادر ميداني",
      supervisor_name: e.supervisor_name,
    },
  };
});
await fs.mkdir(".private", { recursive: true });
await fs.writeFile(
  ".private/import-review.json",
  JSON.stringify(
    { issues, employees: rows.length, points: points.length },
    null,
    2,
  ),
);
console.log({
  employees: rows.length,
  points: points.length,
  unresolved: issues.length,
  dryRun: dry,
});
if (dry) process.exit(0);
if (issues.length)
  throw new Error(
    "Resolve point mappings in .private/import-review.json before activation.",
  );
const users = JSON.parse(
  await fs.readFile(".credentials/initial-accounts.json", "utf8"),
);
const mappings = users
  .filter((u) => u.role === "supervisor")
  .flatMap((u) =>
    points
      .filter((p) => p.data.supervisor_name.includes(u.match))
      .map((p) => ({ profile_id: u.id, point_id: p.id })),
  );
const bundle = {
  points,
  employees: rows,
  profiles: users.map(({ id, name, role }) => ({ id, name, role })),
  assignments: mappings,
};
const id = crypto
  .createHash("sha256")
  .update(JSON.stringify(bundle))
  .digest("hex");
ensure(
  await request("/rest/v1/rpc/hr_bootstrap", {
    method: "POST",
    body: { p_id: id, p_bundle: bundle },
  }),
);
console.log({
  activated: true,
  employees: rows.length,
  points: points.length,
  accounts: users.length,
  leaves: 0,
  resignations: 0,
  legacyDeletion: false,
});
