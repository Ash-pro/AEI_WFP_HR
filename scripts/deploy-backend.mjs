import fs from "node:fs/promises";
import crypto from "node:crypto";
import { request, ensure, config } from "./server-client.mjs";
if (!config.SUPABASE_ACCESS_TOKEN)
  throw new Error("Set SUPABASE_ACCESS_TOKEN in .env.server. No changes made.");
const ref = config.SUPABASE_PROJECT_REF;
if (!/^[a-z0-9]{20}$/.test(ref || "")) throw new Error("Invalid project ref");
async function sql(query) {
  return ensure(
    await request(`/v1/projects/${ref}/database/query`, {
      management: true,
      method: "POST",
      body: { query },
    }),
  );
}
await sql(
  `create table if not exists public.hr_schema_versions(name text primary key,sha256 text not null,applied_at timestamptz not null default now());alter table public.hr_schema_versions enable row level security;revoke all on public.hr_schema_versions from anon,authenticated;`,
);
const applied = await sql("select name,sha256 from public.hr_schema_versions");
for (const file of (await fs.readdir("supabase/migrations")).sort()) {
  const content = await fs.readFile("supabase/migrations/" + file, "utf8");
  const hash = crypto.createHash("sha256").update(content).digest("hex");
  const found = applied.find((x) => x.name === file);
  if (found) {
    if (found.sha256 !== hash)
      throw new Error(`Applied migration changed: ${file}`);
    continue;
  }
  if (!/^[a-z0-9_.]+$/.test(file))
    throw new Error("Invalid migration filename");
  const query = content.replace(
    /commit;\s*$/i,
    `insert into public.hr_schema_versions(name,sha256) values('${file}','${hash}');commit;`,
  );
  await sql(query);
  console.log("Applied " + file);
}
await sql(await fs.readFile("supabase/operations/enable-cron.sql", "utf8"));
const source = await fs.readFile(
  "supabase/functions/hr-accounts/index.ts",
  "utf8",
);
const boundary = "hr" + crypto.randomBytes(16).toString("hex");
const metadata = JSON.stringify({
  name: "hr-accounts",
  entrypoint_path: "index.ts",
  verify_jwt: false,
});
const body = `--${boundary}\r\nContent-Disposition: form-data; name="metadata"\r\n\r\n${metadata}\r\n--${boundary}\r\nContent-Disposition: form-data; name="file"; filename="index.ts"\r\nContent-Type: application/typescript\r\n\r\n${source}\r\n--${boundary}--\r\n`;
ensure(
  await request(`/v1/projects/${ref}/functions/deploy?slug=hr-accounts`, {
    management: true,
    method: "POST",
    rawBody: body,
    headers: { "Content-Type": `multipart/form-data; boundary=${boundary}` },
  }),
);
console.log(
  "Backend migrations, scheduler and account function deployed. Activate reviewed data and accounts next.",
);
