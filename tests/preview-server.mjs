// Loopback-only preview with synthetic records. Never deployed or imported by src.
import { PGlite } from "@electric-sql/pglite";
import fs from "node:fs/promises";
import http from "node:http";
import { spawn } from "node:child_process";
const db = new PGlite();
await db.exec(
  `create role anon;create role authenticated;create role service_role bypassrls;create schema auth;create schema storage;create table auth.users(id uuid primary key);create table auth.sessions(id uuid primary key,user_id uuid);create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);create table storage.objects(id uuid,name text,bucket_id text);alter table storage.objects enable row level security;create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;grant usage on schema public,auth,storage to authenticated,anon;`,
);
for (const file of (await fs.readdir("supabase/migrations")).sort())
  await db.exec(await fs.readFile("supabase/migrations/" + file, "utf8"));
const users = [
  {
    id: "00000000-0000-4000-8000-000000000001",
    name: "إدارة الاختبار المحلي",
    role: "super_admin",
    email: "admin.hr@accounts.aei.invalid",
  },
  {
    id: "00000000-0000-4000-8000-000000000002",
    name: "متابعة الموارد البشرية — تجربة محلية",
    role: "hr_observer",
    email: "hr.followup@accounts.aei.invalid",
  },
];
for (const u of users) {
  await db.query("insert into auth.users values($1)", [u.id]);
  await db.query(
    "insert into hr_profiles(id,name,role,must_change_password) values($1,$2,$3,false)",
    [u.id, u.name, u.role],
  );
}
await db.exec(
  `insert into hr_points(id,name,data) values('point-a','نقطة تجريبية — الوسطى','{"governorate":"الوسطى","supervisor_name":"مشرف تجريبي أول","programs":"TSFP","address":"عنوان تجريبي لا يمثل موقعًا فعليًا"}'),('point-b','نقطة تجريبية — غزة','{"governorate":"غزة","supervisor_name":"مشرف تجريبي ثانٍ","programs":"BSFP"}');`,
);
const month = (
  await db.query(
    `select date_trunc('month',now() at time zone 'Asia/Hebron')::date::text as m`,
  )
).rows[0].m;
for (let i = 1; i <= 3; i++)
  await db.query(
    `insert into hr_employees(national_id,point_id,data,status,started_on) values($1,$2,$3,'نشط',$4)`,
    [
      String(100000000 + i),
      i === 3 ? null : i === 1 ? "point-a" : "point-b",
      JSON.stringify({
        full_name_ar: `موظف اختباري ${i}`,
        full_name_en: `Test Employee ${i}`,
        phone: "0000000000",
        job_title: "كادر ميداني تجريبي",
        department: "التغذية",
        family_count: 0,
        children_under_5: 0,
      }),
      month,
    ],
  );
const emps = (await db.query("select * from hr_employees order by national_id"))
  .rows;
await db.query(
  `insert into hr_leaves(employee_id,point_id,employee_name,national_id,start_date,end_date,status,data) values($1,'point-a','موظف اختباري 1','100000001',$2,$2::date+2,'معتمد_نهائي','{"leave_type":"سنوية"}'),($3,'point-b','موظف اختباري 2','100000002',$2::date+4,$2::date+5,'معلق','{"leave_type":"طارئة"}')`,
  [emps[0].id, month, emps[1].id],
);
await db.query(
  `insert into hr_resignations(employee_id,point_id,employee_name,national_id,last_working_date,status,data) values($1,'point-b','موظف اختباري 2','100000002',$2::date+10,'معتمد','{"reason":"بيانات عرض تجريبية","replacement_name":"بديل تجريبي","clearance_completed":true}')`,
  [emps[1].id, month],
);
await db.exec("select hr_ensure_period()");
const prev = (
  await db.query(`select ($1::date-interval '1 month')::date::text as m`, [
    month,
  ])
).rows[0].m;
await db.query(`insert into hr_periods(month,status) values($1,'closed');`, [
  prev,
]);
await db.query(`insert into hr_snapshots values($1,hr_raw_report($2),now())`, [
  prev,
  month,
]);
function token(u) {
  return (
    Buffer.from(JSON.stringify({ alg: "HS256", typ: "JWT" })).toString(
      "base64url",
    ) +
    "." +
    Buffer.from(
      JSON.stringify({
        sub: u.id,
        email: u.email,
        role: "authenticated",
        exp: Math.floor(Date.now() / 1000) + 3600,
        iat: Math.floor(Date.now() / 1000),
        app_metadata: { hr_session_version: 0 },
      }),
    ).toString("base64url") +
    "." +
    Buffer.from("local-preview-signature-32-bytes!!").toString("base64url")
  );
}
let queue = Promise.resolve();
const server = http.createServer((req, res) => {
  const task = async () => {
    const headers = {
      "Access-Control-Allow-Origin": "http://127.0.0.1:3100",
      "Access-Control-Allow-Headers":
        "authorization,apikey,content-type,x-client-info,prefer,accept-profile,content-profile,x-supabase-api-version",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      "Content-Type": "application/json",
    };
    function send(value, status = 200) {
      res.writeHead(status, headers);
      res.end(JSON.stringify(value));
    }
    if (req.method === "OPTIONS") return send({});
    let body = "";
    for await (const chunk of req) body += chunk;
    const args = body ? JSON.parse(body) : {};
    const url = new URL(req.url, "http://127.0.0.1:54329");
    const u =
      users.find((u) => req.headers.authorization === `Bearer ${token(u)}`) ||
      users.find((u) => {
        try {
          return (
            JSON.parse(
              Buffer.from(
                (req.headers.authorization || "").split(".")[1],
                "base64url",
              ),
            ).sub === u.id
          );
        } catch {
          return false;
        }
      });
    try {
      if (url.pathname === "/auth/v1/token") {
        const user = users.find((u) => u.email === args.email);
        if (!user || args.password !== "local-preview-only")
          return send({ message: "Invalid test credentials" }, 400);
        return send({
          access_token: token(user),
          refresh_token: "local-refresh",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user: {
            ...user,
            aud: "authenticated",
            app_metadata: { hr_session_version: 0 },
            user_metadata: {},
            created_at: new Date().toISOString(),
          },
        });
      }
      if (!u) return send({ message: "No local session" }, 401);
      if (url.pathname === "/auth/v1/user")
        return send({
          ...u,
          aud: "authenticated",
          app_metadata: { hr_session_version: 0 },
          user_metadata: {},
          created_at: new Date().toISOString(),
        });
      if (url.pathname === "/auth/v1/logout") return send({});
      await db.exec("reset role");
      await db.query(`select set_config('request.jwt.claim.sub',$1,false)`, [
        u.id,
      ]);
      await db.exec("set role authenticated");
      if (url.pathname.startsWith("/rest/v1/rpc/")) {
        const name = url.pathname.split("/").pop();
        const allowed = [
          "hr_report",
          "hr_list_periods",
          "hr_mutate",
          "hr_log_export",
          "hr_close_period",
          "hr_reopen_period",
          "hr_profile_change",
          "hr_review_profile",
        ];
        if (!allowed.includes(name)) return send({}, 403);
        const keys = Object.keys(args);
        const result = await db.query(
          `select ${name}(${keys.map((k, i) => `${k}=>$${i + 1}`).join(",")}) as value`,
          Object.values(args).map((v) =>
            typeof v === "object" ? JSON.stringify(v) : v,
          ),
        );
        return send(result.rows[0].value);
      }
      const table = url.pathname.split("/").pop();
      if (
        ![
          "hr_profiles",
          "hr_assets",
          "hr_leaves",
          "hr_resignations",
          "hr_profile_requests",
        ].includes(table)
      )
        return send({}, 404);
      let rows = (await db.query(`select * from ${table}`)).rows;
      for (const [key, value] of url.searchParams)
        if (value.startsWith("eq."))
          rows = rows.filter((r) => String(r[key]) === value.slice(3));
      if (req.headers.accept?.includes("vnd.pgrst.object"))
        return send(rows[0]);
      return send(rows);
    } catch (error) {
      send({ message: error.message, code: "LOCAL_PREVIEW" }, 400);
    }
  };
  queue = queue.then(task, task);
});
server.listen(54329, "127.0.0.1", () =>
  console.log("Synthetic API on loopback 54329; preview http://127.0.0.1:3100"),
);
const vite = spawn(
  process.execPath,
  ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "3100"],
  {
    env: {
      ...process.env,
      VITE_SUPABASE_URL: "http://127.0.0.1:3100/mock",
      VITE_SUPABASE_ANON_KEY: "local-test-only",
      HR_LOCAL_PREVIEW: "1",
    },
    stdio: "inherit",
  },
);
process.on("SIGINT", () => {
  vite.kill();
  server.close();
  void db.close();
});
