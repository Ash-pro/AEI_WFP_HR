import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
const db = new PGlite();
await db.exec(`
create role anon; create role authenticated; create role service_role bypassrls;
create schema auth; create schema storage;
create table auth.users(id uuid primary key);
create table auth.sessions(id uuid primary key,user_id uuid references auth.users(id));
create function auth.uid() returns uuid language sql as $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
create function auth.jwt() returns jsonb language sql as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),''),'{}')::jsonb $$;
create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
create table storage.objects(id uuid,name text,bucket_id text);
alter table storage.objects enable row level security;
create function storage.foldername(text) returns text[] language sql as $$ select string_to_array($1,'/') $$;
grant usage on schema public,auth,storage to authenticated,anon;
`);
for (const file of (await fs.readdir("supabase/migrations")).sort())
  await db.exec(await fs.readFile("supabase/migrations/" + file, "utf8"));
const admin = "00000000-0000-4000-8000-000000000001",
  observer = "00000000-0000-4000-8000-000000000002",
  supervisor = "00000000-0000-4000-8000-000000000003",
  worker = "00000000-0000-4000-8000-000000000004";
await db.exec(`insert into auth.users values('${admin}'),('${observer}'),('${supervisor}'),('${worker}');
insert into hr_profiles(id,name,role,must_change_password) values('${admin}','Admin','super_admin',false),('${observer}','Observer','hr_observer',false),('${supervisor}','Supervisor','supervisor',false);
insert into hr_points(id,name) values('a','Point A'),('b','Point B');
insert into hr_profile_points values('${supervisor}','a');`);
const today = (
  await db.query(`select (now() at time zone 'Asia/Hebron')::date::text as d`)
).rows[0].d;
const month = today.slice(0, 7) + "-01";
async function as(id) {
  await db.exec(
    `reset role; select set_config('request.jwt.claim.sub','${id}',false); set role authenticated;`,
  );
}
async function rpc(action, id, payload) {
  return (
    await db.query("select hr_mutate($1,$2,$3) as result", [
      action,
      id,
      JSON.stringify(payload),
    ])
  ).rows[0].result;
}
await as(admin);
const a = await rpc("employee_save", null, {
  national_id: "111111111",
  point_id: "a",
  started_on: today,
  data: {
    full_name_ar: "Employee A",
    phone: "0590000000",
    job_title: "Field worker",
  },
  reason: "initial",
});
const b = await rpc("employee_save", null, {
  national_id: "222222222",
  point_id: "b",
  started_on: today,
  data: {
    full_name_ar: "Employee B",
    phone: "0591111111",
    job_title: "Field worker",
  },
  reason: "initial",
});
await rpc("employee_approve", a.id, { version: a.version, reason: "verified" });
await rpc("employee_approve", b.id, { version: b.version, reason: "verified" });

test("observer cannot write, including direct tables and RPC", async () => {
  await as(observer);
  assert.equal((await db.query("select * from hr_employees")).rows.length, 2);
  await assert.rejects(() =>
    db.query(`update hr_employees set status='مرفوض'`),
  );
  await assert.rejects(
    () => rpc("employee_save", a.id, { version: 2, reason: "attempt" }),
    /صلاحية/,
  );
  await assert.rejects(
    () => db.query("select hr_raw_report($1)", [month]),
    /permission denied/,
  );
});
test("supervisor sees assigned point only in table and report", async () => {
  await as(supervisor);
  assert.equal((await db.query("select * from hr_employees")).rows.length, 1);
  const r = (await db.query("select hr_report($1) as r", [month])).rows[0].r;
  assert.equal(r.employees.length, 1);
  assert.equal(r.employees[0].id, a.id);
  await assert.rejects(
    () => rpc("employee_approve", b.id, { version: 2, reason: "outside" }),
    /الإدارة/,
  );
});
test("optimistic locking and required fields enforce validation", async () => {
  await as(admin);
  await assert.rejects(
    () =>
      rpc("employee_save", a.id, { version: null, reason: "invalid version" }),
    /تغير السجل/,
  );
  await assert.rejects(
    () => rpc("employee_save", a.id, { version: 1, reason: "stale" }),
    /تغير السجل/,
  );
  await assert.rejects(() =>
    rpc("employee_save", null, {
      national_id: "abc",
      started_on: today,
      data: { full_name_ar: "X" },
      reason: "bad",
    }),
  );
});
test("leave submission idempotency, stage approval, observer filtering", async () => {
  await as(admin);
  const id = "10000000-0000-4000-8000-000000000001";
  const payload = {
    employee_id: a.id,
    start_date: today,
    end_date: today,
    leave_type: "سنوية",
  };
  await rpc("leave_submit", id, payload);
  await rpc("leave_submit", id, payload);
  assert.equal((await db.query("select * from hr_leaves")).rows.length, 1);
  await as(observer);
  assert.equal((await db.query("select * from hr_leaves")).rows.length, 0);
  await as(supervisor);
  await rpc("leave_approve", id, { version: 1 });
  await assert.rejects(
    () => rpc("leave_approve", id, { version: 2 }),
    /الاعتماد النهائي/,
  );
  await as(admin);
  await rpc("leave_approve", id, { version: 2 });
  await as(observer);
  assert.equal((await db.query("select * from hr_leaves")).rows.length, 1);
  assert.equal(
    (await db.query("select hr_report($1) as r", [month])).rows[0].r.leaves
      .length,
    1,
  );
});
test("overlapping leave rejected and medical report required", async () => {
  await as(admin);
  await assert.rejects(
    () =>
      rpc("leave_submit", "10000000-0000-4000-8000-000000000002", {
        employee_id: a.id,
        start_date: today,
        end_date: today,
        leave_type: "سنوية",
      }),
    /متداخلة/,
  );
  await assert.rejects(
    () =>
      rpc("leave_submit", "10000000-0000-4000-8000-000000000003", {
        employee_id: b.id,
        start_date: today,
        end_date: today,
        leave_type: "مرضية",
      }),
    /التقرير الطبي/,
  );
});
test("resignation requires returned custody and different active replacement", async () => {
  await as(admin);
  const asset = await rpc("asset_add", null, {
    employee_id: a.id,
    point_id: "a",
    name: "Tablet",
    quantity: 1,
  });
  await db.exec("reset role");
  await db.query(
    "insert into storage.objects(name,bucket_id) values($1,'hr-private-documents')",
    [a.id + "/letter.pdf"],
  );
  await as(admin);
  const id = "20000000-0000-4000-8000-000000000001";
  await rpc("resignation_submit", id, {
    employee_id: a.id,
    last_working_date: today,
    reason: "Leaving",
    document_path: a.id + "/letter.pdf",
  });
  await assert.rejects(
    () => rpc("resignation_approve", id, { version: 1, replacement_id: b.id }),
    /عهد/,
  );
  await rpc("asset_return", asset.id, {});
  await assert.rejects(
    () => rpc("resignation_approve", id, { version: 1, replacement_id: a.id }),
    /بديل/,
  );
  await rpc("resignation_approve", id, { version: 1, replacement_id: b.id });
  assert.equal(
    (
      await db.query("select ended_on::text from hr_employees where id=$1", [
        a.id,
      ])
    ).rows[0].ended_on,
    today,
  );
});
test("historical snapshot is stable and scoped", async () => {
  await db.exec("reset role");
  const previous = (
    await db.query(`select ($1::date-interval '1 month')::date::text as d`, [
      month,
    ])
  ).rows[0].d;
  await db.query(`insert into hr_periods(month,status) values($1,'closed')`, [
    previous,
  ]);
  await db.query(
    `insert into hr_snapshots(month,report) values($1,hr_raw_report($2))`,
    [previous, month],
  );
  await as(admin);
  const before = (await db.query("select hr_report($1) as r", [previous]))
    .rows[0].r;
  const existing = (
    await db.query("select * from hr_employees where id=$1", [b.id])
  ).rows[0];
  await rpc("employee_save", b.id, {
    version: existing.version,
    national_id: b.national_id,
    point_id: "b",
    started_on: today,
    data: { ...b.data, full_name_ar: "Renamed" },
    reason: "correction",
  });
  const after = (await db.query("select hr_report($1) as r", [previous]))
    .rows[0].r;
  assert.deepEqual(after.employees, before.employees);
  await as(supervisor);
  const scoped = (await db.query("select hr_report($1) as r", [previous]))
    .rows[0].r;
  assert.equal(scoped.employees.length, 1);
});
test("audit captures mutations without passwords", async () => {
  await as(admin);
  const rows = (await db.query("select * from hr_audit")).rows;
  assert.ok(rows.length > 5);
  assert.ok(!JSON.stringify(rows).includes('"pin"'));
});
test("temporary credentials and revoked sessions cannot read HR records", async () => {
  await db.exec("reset role");
  await db.query(
    "update hr_profiles set must_change_password=true where id=$1",
    [observer],
  );
  await as(observer);
  assert.equal((await db.query("select * from hr_employees")).rows.length, 0);
  await assert.rejects(
    () => db.query("select hr_report($1)", [month]),
    /غير مصرح/,
  );
  await db.exec("reset role");
  await db.query(
    "update hr_profiles set must_change_password=false where id=$1",
    [observer],
  );
  const sid = "90000000-0000-4000-8000-000000000001";
  await db.query("insert into auth.sessions values($1,$2)", [sid, observer]);
  await db.query("select hr_invalidate_sessions($1)", [observer]);
  await as(observer);
  await db.query("select set_config('request.jwt.claims',$1,false)", [
    JSON.stringify({ session_id: sid }),
  ]);
  assert.equal((await db.query("select * from hr_employees")).rows.length, 0);
  await db.exec("select set_config('request.jwt.claims','{}',false)");
});
test("employee can only submit own profile changes, reviewed by management", async () => {
  await db.exec("reset role");
  await db.query(
    "insert into hr_profiles(id,name,role,employee_id,must_change_password) values($1,'Employee','employee',$2,false)",
    [worker, b.id],
  );
  await as(worker);
  assert.equal((await db.query("select * from hr_employees")).rows.length, 1);
  await assert.rejects(
    () =>
      db.query("select hr_profile_change($1,$2,$3)", [
        a.id,
        JSON.stringify({ full_name_ar: "Fake", phone: "0" }),
        "change",
      ]),
    /غير مصرح/,
  );
  const request = (
    await db.query("select hr_profile_change($1,$2,$3) as id", [
      b.id,
      JSON.stringify({
        full_name_ar: "Updated by employee",
        phone: "000",
        department: "unauthorized",
        pin: "secret",
      }),
      "contact update",
    ])
  ).rows[0].id;
  await assert.rejects(
    () =>
      db.query("select hr_review_profile($1,true,$2)", [
        request,
        "self approve",
      ]),
    /غير مصرح/,
  );
  await as(admin);
  await db.query("select hr_review_profile($1,true,$2)", [
    request,
    "approved after review",
  ]);
  const record = (
    await db.query("select data from hr_employees where id=$1", [b.id])
  ).rows[0].data;
  assert.equal(record.full_name_ar, "Updated by employee");
  assert.equal(record.pin, undefined);
  assert.notEqual(record.department, "unauthorized");
});
test("opening current period is idempotent and freezes previous open periods", async () => {
  await db.exec("reset role");
  const past = (
    await db.query("select ($1::date-interval '2 months')::date::text as d", [
      month,
    ])
  ).rows[0].d;
  await db.query("insert into hr_periods(month,status) values($1,'open')", [
    past,
  ]);
  await as(admin);
  await db.query("select hr_list_periods()");
  await db.query("select hr_list_periods()");
  assert.equal(
    (await db.query("select * from hr_periods where month=$1", [month])).rows
      .length,
    1,
  );
  assert.equal(
    (await db.query("select status from hr_periods where month=$1", [past]))
      .rows[0].status,
    "review",
  );
});
test("Excel import is transactional and retry does not duplicate employees", async () => {
  await as(admin);
  const batch = "80000000-0000-4000-8000-000000000001";
  const row = {
    national_id: "333333333",
    point_id: "b",
    started_on: today,
    data: {
      full_name_ar: "Imported employee",
      phone: "0592222222",
      job_title: "Worker",
    },
  };
  const call = (rows) =>
    db.query("select hr_import_employees($1,$2,$3) as result", [
      JSON.stringify(rows),
      "reviewed spreadsheet",
      batch,
    ]);
  await assert.rejects(() => call([row, { ...row, national_id: "bad" }]));
  assert.equal(
    (
      await db.query(
        "select id from hr_employees where national_id='333333333'",
      )
    ).rows.length,
    0,
  );
  assert.equal((await call([row])).rows[0].result.saved, 1);
  await call([row]);
  assert.equal(
    (
      await db.query(
        "select id from hr_employees where national_id='333333333'",
      )
    ).rows.length,
    1,
  );
  await as(observer);
  await assert.rejects(() => call([row]), /غير مصرح/);
});
test("closed periods reject changes and reopening preserves prior revision", async () => {
  await as(admin);
  const previous = (
    await db.query("select ($1::date-interval '1 month')::date::text as d", [
      month,
    ])
  ).rows[0].d;
  await assert.rejects(
    () => db.query("select hr_reopen_period($1,$2)", [previous, "short"]),
    /سبب/,
  );
  await db.exec("reset role");
  await assert.rejects(
    () => db.query("select hr_assert_mutable($1,$1)", [previous]),
    /مغلقة/,
  );
  const before = (
    await db.query("select report from hr_snapshots where month=$1", [previous])
  ).rows[0].report;
  await as("00000000-0000-4000-8000-000000000099");
  await assert.rejects(
    () =>
      db.query("select hr_reopen_period($1,$2)", [
        previous,
        "unauthorized correction",
      ]),
    /مدير النظام/,
  );
  await as(admin);
  await db.query("select hr_reopen_period($1,$2)", [
    previous,
    "documented correction",
  ]);
  assert.equal(
    (
      await db.query("select revision,status from hr_periods where month=$1", [
        previous,
      ])
    ).rows[0].status,
    "review",
  );
  await db.exec("reset role");
  assert.deepEqual(
    (
      await db.query("select report from hr_report_versions where month=$1", [
        previous,
      ])
    ).rows[0].report,
    before,
  );
  await db.query("select hr_assert_mutable($1,$1)", [previous]);
  await as(observer);
  await assert.rejects(
    () => db.query("select * from hr_report_versions"),
    /permission denied/,
  );
});
test("bootstrap cannot be invoked by user accounts or overwrite existing data", async () => {
  await as(admin);
  await assert.rejects(
    () => db.query("select hr_bootstrap($1,$2)", ["a".repeat(64), "{}"]),
    /permission denied/,
  );
  await db.exec("reset role");
  await assert.rejects(
    () => db.query("select hr_bootstrap($1,$2)", ["a".repeat(64), "{}"]),
    /already contains/,
  );
});
test("public registration is service-only, pending, and cannot claim an existing employee", async () => {
  const newUser = "00000000-0000-4000-8000-000000000050";
  const payload = {
    full_name_ar: "New applicant",
    phone: "0593333333",
    job_title: "Worker",
    pin: "not-stored",
    role: "super_admin",
    supervisor_name: "forged",
    department: "forged",
  };
  await as(admin);
  await assert.rejects(
    () =>
      db.query("select hr_register_employee($1,$2,$3)", [
        newUser,
        "444444444",
        JSON.stringify(payload),
      ]),
    /permission denied/,
  );
  await db.exec("reset role");
  await db.query("insert into auth.users values($1)", [newUser]);
  const registered = (
    await db.query("select hr_register_employee($1,$2,$3) as id", [
      newUser,
      "444444444",
      JSON.stringify(payload),
    ])
  ).rows[0].id;
  const e = (
    await db.query("select * from hr_employees where id=$1", [registered])
  ).rows[0];
  assert.equal(e.status, "معلق");
  assert.equal(e.point_id, null);
  assert.equal(e.data.pin, undefined);
  assert.equal(e.data.role, undefined);
  assert.equal(e.data.supervisor_name, undefined);
  const p = (await db.query("select * from hr_profiles where id=$1", [newUser]))
    .rows[0];
  assert.equal(p.role, "employee");
  assert.equal(p.employee_id, registered);
  assert.equal(p.must_change_password, false);
  await assert.rejects(
    () =>
      db.query("select hr_register_employee($1,$2,$3)", [
        newUser,
        "111111111",
        JSON.stringify(payload),
      ]),
    /duplicate/,
  );
  assert.equal(
    (await db.query("select data from hr_employees where id=$1", [a.id]))
      .rows[0].data.full_name_ar,
    "Employee A",
  );
  await as(newUser);
  await assert.rejects(
    () =>
      rpc("leave_submit", "10000000-0000-4000-8000-000000000050", {
        employee_id: registered,
        start_date: today,
        end_date: today,
        leave_type: "سنوية",
      }),
    /غير نشط/,
  );
  await as(admin);
  await rpc("employee_approve", registered, {
    version: 1,
    reason: "verified applicant",
  });
  await as(newUser);
  const report = (await db.query("select hr_report($1) as r", [month])).rows[0]
    .r;
  assert.equal(report.employees.length, 1);
  assert.equal(report.employees[0].id, registered);
});
test.after(async () => await db.close());
