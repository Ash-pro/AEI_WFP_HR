import fs from "node:fs/promises";
import crypto from "node:crypto";
import { request, ensure } from "./server-client.mjs";
const definitions = [
  {
    username: "admin.hr",
    name: "إدارة نظام الموارد البشرية",
    role: "super_admin",
  },
  {
    username: "project.coordinator",
    name: "تنسيق مشروع الغذاء العالمي",
    role: "coordinator",
  },
  {
    username: "hr.followup",
    name: "متابعة الإدارة العليا للموارد البشرية",
    role: "hr_observer",
  },
  {
    username: "supervisor.ashraf",
    name: "المشرف الميداني أشرف",
    role: "supervisor",
    match: "أشرف",
  },
  {
    username: "supervisor.baraa",
    name: "المشرف الميداني براء",
    role: "supervisor",
    match: "براء",
  },
  {
    username: "supervisor.hadi",
    name: "المشرف الميداني هادي",
    role: "supervisor",
    match: "هادي",
  },
  {
    username: "supervisor.yasmine",
    name: "المشرفة الميدانية ياسمين",
    role: "supervisor",
    match: "ياسمين",
  },
];
await fs.mkdir(".credentials", { recursive: true });
const path = ".credentials/initial-accounts.json";
let stored = [];
try {
  stored = JSON.parse(await fs.readFile(path, "utf8"));
} catch (e) {
  if (e.code !== "ENOENT") throw e;
}
const existing = [];
for (let page = 1; ; page++) {
  const data = ensure(
    await request(`/auth/v1/admin/users?page=${page}&per_page=100`),
  );
  existing.push(...data.users);
  if (data.users.length < 100) break;
}
for (const definition of definitions) {
  const email = definition.username + "@accounts.aei.invalid";
  let user = existing.find((u) => u.email === email);
  let saved = stored.find((u) => u.username === definition.username);
  if (!user) {
    const password = crypto.randomBytes(24).toString("base64url");
    user = ensure(
      await request("/auth/v1/admin/users", {
        method: "POST",
        body: {
          email,
          password,
          email_confirm: true,
          app_metadata: { hr_session_version: 0 },
        },
      }),
    );
    saved = { ...definition, id: user.id, password };
    stored.push(saved);
    await fs.writeFile(path, JSON.stringify(stored, null, 2), { mode: 0o600 });
  } else if (!saved) {
    saved = { ...definition, id: user.id, password: null };
    stored.push(saved);
    await fs.writeFile(path, JSON.stringify(stored, null, 2), { mode: 0o600 });
  }
}
console.log(
  JSON.stringify(
    {
      created_or_existing: definitions.length,
      credentials_file: path,
      passwords_printed: false,
      roles_applied: false,
      note: "Auth identities only. Run activation after SQL migrations.",
    },
    null,
    2,
  ),
);
