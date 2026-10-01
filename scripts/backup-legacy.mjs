import fs from "node:fs/promises";
import crypto from "node:crypto";
import { request, ensure } from "./server-client.mjs";
const dir = ".private/backups/" + new Date().toISOString().replaceAll(":", "-");
await fs.mkdir(dir, { recursive: true });
const tables = [
  "employees",
  "leave_requests",
  "resignation_requests",
  "point_assets",
  "profile_update_requests",
  "user_profiles",
  "work_points",
  "point_transfers",
  "point_teams",
];
const manifest = {
  created_at: new Date().toISOString(),
  tables: [],
  note: "Database rows only. Browser-local records and file bytes require separate collection before any deletion.",
};
for (const table of tables) {
  const rows = [];
  for (let offset = 0; ; offset += 1000) {
    const page = ensure(
      await request(`/rest/v1/${table}?select=*&limit=1000&offset=${offset}`),
    );
    if (!Array.isArray(page)) throw new Error("Unexpected response");
    rows.push(...page);
    if (page.length < 1000) break;
  }
  const text = JSON.stringify(rows, null, 2);
  await fs.writeFile(`${dir}/${table}.json`, text);
  manifest.tables.push({
    table,
    count: rows.length,
    sha256: crypto.createHash("sha256").update(text).digest("hex"),
  });
}
await fs.writeFile(`${dir}/manifest.json`, JSON.stringify(manifest, null, 2));
console.log(
  JSON.stringify(
    {
      backup: dir,
      counts: manifest.tables.map((t) => ({ table: t.table, count: t.count })),
      deletions: 0,
    },
    null,
    2,
  ),
);
