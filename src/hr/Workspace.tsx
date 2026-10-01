import React, { useEffect, useState, useRef } from "react";
import {
  useLocation,
  useNavigate,
  useSearchParams,
  NavLink,
} from "react-router-dom";
import {
  account,
  db,
  downloadReport,
  mutate,
  openDocument,
  periods as getPeriods,
  report as getReport,
  rpc,
  upload,
} from "./api";
import {
  canManage,
  currentMonth,
  daysInMonth,
  employeeFields,
  employmentLabel,
  message,
  monthLabel,
  roleLabels,
  type Asset,
  type Employee,
  type Period,
  type Profile,
  type Report,
  type Request,
  type Values,
} from "./model";
import { Badge, Dialog, Empty, MonthPicker } from "./ui";
import { EmployeeEditor } from "./EmployeeEditor";
import { ImportEmployees } from "./ImportEmployees";

export function Workspace({
  user,
  onLogout,
}: {
  user: Profile;
  onLogout: () => Promise<void>;
}) {
  const location = useLocation();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const [periods, setPeriods] = useState<Period[]>([]);
  const [month, setMonth] = useState(params.get("month") || currentMonth());
  const [data, setData] = useState<Report | null>(null);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [pointFilter, setPointFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Employee | null>(null);
  const [editing, setEditing] = useState<Employee | "new" | null>(null);
  const [importing, setImporting] = useState(false);
  const [action, setAction] = useState<{
    name: string;
    id: string | null;
    version?: number;
  } | null>(null);
  const [reason, setReason] = useState("");
  const [target, setTarget] = useState("");
  const [requestForm, setRequestForm] = useState<
    "leave" | "resignation" | null
  >(null);
  const [requestValues, setRequestValues] = useState<Values>({});
  const [requestId, setRequestId] = useState(crypto.randomUUID());
  const loadVersion = useRef(0);
  const [pending, setPending] = useState<(Request & { kind: string })[]>([]);
  const [changes, setChanges] = useState<
    {
      id: string;
      employee_id: string;
      data: Values;
      status: string;
      reason: string;
    }[]
  >([]);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [accounts, setAccounts] = useState<Profile[]>([]);
  const [credentials, setCredentials] = useState<{
    username: string;
    password: string;
  } | null>(null);
  const observer = user.role === "hr_observer";
  const employee = user.role === "employee";
  const manage = canManage(user.role);
  const tab = location.pathname.split("/").pop() || "points";
  const links = observer
    ? [
        ["points", "النقاط والموظفون"],
        ["leaves", "الإجازات المعتمدة"],
        ["resignations", "الاستقالات المعتمدة"],
      ]
    : employee
      ? [
          ["employees", "ملفي"],
          ["leaves", "إجازاتي"],
          ["resignations", "استقالتي"],
          ["assets", "عهدي"],
        ]
      : [
          ["employees", "الموظفون"],
          ["points", "النقاط"],
          ["approvals", "الاعتمادات"],
          ["leaves", "الإجازات"],
          ["resignations", "الاستقالات"],
          ["assets", "العهد"],
          ["reports", "التقارير والأشهر"],
          ...(user.role === "super_admin" ? [["accounts", "الحسابات"]] : []),
        ];
  async function refresh() {
    const version = ++loadVersion.current;
    setLoading(true);
    setError("");
    try {
      const list = await getPeriods();
      setPeriods(list);
      if (!list.some((p) => p.month === month)) {
        setMonth(list[0]?.month || currentMonth());
        return;
      }
      const result = await getReport(month);
      if (version !== loadVersion.current) return;
      setData(result);
      if (!observer) {
        const a = await db
          .from("hr_assets")
          .select("*")
          .order("created_at", { ascending: false });
        if (a.error) throw a.error;
        setAssets(a.data || []);
        const ch = await db.from("hr_profile_requests").select("*");
        if (ch.error) throw ch.error;
        setChanges(ch.data || []);
        if (!employee) {
          const [ls, rs] = await Promise.all([
            db
              .from("hr_leaves")
              .select("*")
              .in("status", ["معلق", "معتمد_مشرف"]),
            db.from("hr_resignations").select("*").eq("status", "معلق"),
          ]);
          if (ls.error || rs.error) throw ls.error || rs.error;
          setPending([
            ...(ls.data || []).map((x) => ({ ...x, kind: "leave" })),
            ...(rs.data || []).map((x) => ({ ...x, kind: "resignation" })),
          ]);
        }
      }
      if (user.role === "super_admin") {
        const a = await db.from("hr_profiles").select("*");
        if (a.error) throw a.error;
        setAccounts(a.data || []);
      }
    } catch (e) {
      if (version === loadVersion.current) {
        setData(null);
        setError(message(e));
      }
    } finally {
      if (version === loadVersion.current) setLoading(false);
    }
  }
  useEffect(() => {
    void refresh();
  }, [month]);
  useEffect(() => {
    if (!links.some(([key]) => key === tab))
      navigate(`/workspace/${links[0][0]}?month=${month}`, { replace: true });
    setSearch("");
    setPointFilter("");
    setStatusFilter("");
    setPage(0);
  }, [tab]);
  useEffect(() => {
    const requested = params.get("month");
    if (requested && /^\d{4}-\d{2}-01$/.test(requested) && requested !== month)
      setMonth(requested);
  }, [params]);
  useEffect(() => {
    let previous = currentMonth();
    const check = () => {
      const now = currentMonth();
      if (now !== previous) {
        if (month === previous) {
          setMonth(now);
          setParams({ month: now });
        } else setInfo("بدأ شهر جديد؛ يمكنك الانتقال إليه من محدد الشهر.");
        previous = now;
      }
    };
    const id = setInterval(check, 30000);
    window.addEventListener("focus", check);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", check);
    };
  }, [month]);
  useEffect(() => setPage(0), [search, pointFilter, statusFilter, month]);
  async function viewDocument(path: string) {
    setError("");
    try {
      await openDocument(path);
    } catch (e) {
      setError(message(e));
    }
  }
  async function run(work: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    setInfo("");
    try {
      await work();
      setAction(null);
      setInfo("تم تنفيذ العملية وحفظها على الخادم.");
      await refresh();
      return true;
    } catch (e) {
      setError(message(e));
      return false;
    } finally {
      setBusy(false);
    }
  }
  function begin(name: string, id: string | null, version?: number) {
    setReason("");
    setTarget("");
    setAction({ name, id, version });
  }
  function chooseMonth(value: string) {
    setMonth(value);
    setParams({ month: value });
    setSelected(null);
  }
  const filteredEmployees =
    data?.employees.filter(
      (e) =>
        (!pointFilter || e.point_id === pointFilter) &&
        (!statusFilter || e.status === statusFilter) &&
        `${e.data.full_name_ar} ${e.national_id} ${e.data.phone}`.includes(
          search,
        ),
    ) || [];
  const list = (tab === "leaves" ? data?.leaves : data?.resignations) || [];
  const filteredRequests = list.filter(
    (r) =>
      (!pointFilter || r.point_id === pointFilter) &&
      (!statusFilter || r.status === statusFilter) &&
      `${r.employee_name} ${r.national_id}`.includes(search),
  );
  const visiblePoints =
    data?.points.filter(
      (p) =>
        (!pointFilter || p.id === pointFilter) &&
        (!statusFilter || p.status === statusFilter) &&
        `${p.name} ${p.data.governorate} ${p.data.supervisor_name} ${p.data.programs}`.includes(
          search,
        ),
    ) || [];
  const open = data?.period.status === "open";
  const reviewable = data?.period.status !== "closed";
  const pointEmployees =
    data?.employees.filter(
      (e) =>
        (!pointFilter || e.point_id === pointFilter) &&
        ((!search && !statusFilter) ||
          visiblePoints.some((p) => p.id === e.point_id)),
    ) || [];
  async function exportRows(
    kind: "employees" | "leaves" | "resignations" | "all",
    filtered = false,
  ) {
    if (!data) return;
    setBusy(true);
    setError("");
    try {
      let rows: Values[] | undefined;
      if (filtered) {
        const lib = await import("./excel");
        const subset = {
          ...data,
          employees: tab === "points" ? pointEmployees : filteredEmployees,
          leaves: filteredRequests,
          resignations: filteredRequests,
        };
        rows =
          kind === "employees"
            ? lib.employeeRows(subset)
            : lib.requestRows(subset, kind as "leaves" | "resignations");
      }
      await downloadReport(data, kind, rows);
      setInfo("تم إعداد ملف Excel وبدء تنزيله.");
    } catch (error) {
      setError(message(error));
    } finally {
      setBusy(false);
    }
  }
  function employeesTable(rows: Employee[]) {
    return rows.length ? (
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>الموظف</th>
              <th>رقم الهوية</th>
              <th>النقطة</th>
              <th>حالة الملف</th>
              <th>التفاصيل</th>
            </tr>
          </thead>
          <tbody>
            {rows.slice(page * 25, (page + 1) * 25).map((e) => (
              <tr key={e.id}>
                <td>
                  <strong>{String(e.data.full_name_ar || "")}</strong>
                  <small>{String(e.data.job_title || "")}</small>
                </td>
                <td dir="ltr">{e.national_id}</td>
                <td>
                  {data?.points.find((p) => p.id === e.point_id)?.name ||
                    "غير مرتبط"}
                </td>
                <td>
                  <Badge>{employmentLabel(e, data!)}</Badge>
                </td>
                <td>
                  <button onClick={() => setSelected(e)}>عرض الملف</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {rows.length > 25 && (
          <div className="pagination">
            <button disabled={!page} onClick={() => setPage((p) => p - 1)}>
              السابق
            </button>
            <span>
              {page + 1} / {Math.ceil(rows.length / 25)}
            </span>
            <button
              disabled={(page + 1) * 25 >= rows.length}
              onClick={() => setPage((p) => p + 1)}
            >
              التالي
            </button>
          </div>
        )}
      </div>
    ) : (
      <Empty />
    );
  }
  return (
    <div className="hr-app">
      <header className="hr-header">
        <div className="hr-brand">
          <img src="/branding/aei_wfp_hr_icon.jpg" alt="شعار الجمعية" />
          <div>
            <strong>أرض الإنسان · الموارد البشرية</strong>
            <small>مشروع الغذاء العالمي WFP</small>
          </div>
        </div>
        <div className="actions">
          <div>
            <strong>{user.name}</strong>
            <small>{roleLabels[user.role]}</small>
          </div>
          <button onClick={() => begin("password", null)}>كلمة المرور</button>
          <button onClick={() => void onLogout()}>خروج</button>
        </div>
      </header>
      <nav className="hr-nav" aria-label="القائمة الرئيسية">
        {links.map(([key, label]) => (
          <NavLink key={key} to={`/workspace/${key}?month=${month}`}>
            {label}
          </NavLink>
        ))}
      </nav>
      <main className="hr-main">
        {periods.length > 0 && (
          <MonthPicker periods={periods} value={month} onChange={chooseMonth} />
        )}
        {error && (
          <div className="notice error" role="alert">
            {error}
            <button onClick={() => void refresh()}>إعادة تحميل البيانات</button>
          </div>
        )}
        {info && (
          <p role="status" className="notice success">
            {info}
          </p>
        )}
        {loading ? (
          <p role="status" className="panel">
            جارٍ تحميل بيانات الشهر من الخادم…
          </p>
        ) : (
          data && (
            <>
              <div className="page-head">
                <div>
                  <h1>{links.find(([key]) => key === tab)?.[1]}</h1>
                  <small>
                    {monthLabel(month)} ·{" "}
                    {data.period.status === "open"
                      ? "مفتوح"
                      : data.period.status === "review"
                        ? "قيد المراجعة"
                        : "مغلق ومعتمد"}{" "}
                    · الإصدار {data.period.revision}
                  </small>
                </div>
                <div className="actions">
                  <button disabled={busy} onClick={() => void refresh()}>
                    تحديث
                  </button>
                  {manage && open && tab === "employees" && (
                    <button
                      className="primary"
                      onClick={() => setEditing("new")}
                    >
                      إضافة موظف
                    </button>
                  )}
                  {manage && open && tab === "employees" && (
                    <button onClick={() => setImporting(true)}>
                      استيراد Excel
                    </button>
                  )}
                  {(tab === "leaves" || tab === "resignations") &&
                    !observer &&
                    open && (
                      <button
                        className="primary"
                        onClick={() => {
                          setRequestId(crypto.randomUUID());
                          setRequestValues({
                            employee_id: employee ? user.employee_id || "" : "",
                            leave_type: "سنوية",
                          });
                          setRequestForm(
                            tab === "leaves" ? "leave" : "resignation",
                          );
                        }}
                      >
                        طلب جديد
                      </button>
                    )}
                  {!employee &&
                    ["employees", "points", "leaves", "resignations"].includes(
                      tab,
                    ) && (
                      <button
                        disabled={busy}
                        onClick={() =>
                          void exportRows(
                            tab === "points"
                              ? "employees"
                              : (tab as
                                  "employees" | "leaves" | "resignations"),
                          )
                        }
                      >
                        تصدير Excel للشهر كاملًا
                      </button>
                    )}
                </div>
              </div>
              {["employees", "points", "leaves", "resignations"].includes(
                tab,
              ) && (
                <div className="filters">
                  <label>
                    بحث
                    <input
                      placeholder={
                        tab === "points"
                          ? "النقطة أو المحافظة أو المشرف أو البرنامج"
                          : "الاسم أو رقم الهوية"
                      }
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </label>
                  <label>
                    النقطة
                    <select
                      value={pointFilter}
                      onChange={(e) => setPointFilter(e.target.value)}
                    >
                      <option value="">جميع النقاط</option>
                      {data.points.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    الحالة
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                    >
                      <option value="">جميع الحالات</option>
                      {[
                        ...new Set(
                          tab === "employees"
                            ? data.employees.map((e) => e.status)
                            : tab === "points"
                              ? data.points.map((p) => p.status)
                              : list.map((r) => r.status),
                        ),
                      ].map((s) => (
                        <option key={s}>{s}</option>
                      ))}
                    </select>
                  </label>
                </div>
              )}
              {tab === "employees" && (
                <>
                  {!employee && (
                    <div className="actions">
                      <span>{filteredEmployees.length} موظفًا</span>
                      <button
                        disabled={busy}
                        onClick={() => void exportRows("employees", true)}
                      >
                        تصدير النتائج
                      </button>
                    </div>
                  )}
                  {employeesTable(filteredEmployees)}
                  {employee && changes.length > 0 && (
                    <div className="panel">
                      <h2>طلبات تعديل ملفي</h2>
                      {changes.map((c) => (
                        <p key={c.id}>
                          <Badge>{c.status}</Badge> {c.reason}
                        </p>
                      ))}
                    </div>
                  )}
                </>
              )}
              {tab === "points" && (
                <>
                  <div className="grid">
                    {visiblePoints.map((p) => (
                      <article className="point-card" key={p.id}>
                        <Badge>{p.status}</Badge>
                        <h2>{p.name}</h2>
                        <p>
                          {String(p.data.governorate || "")} ·{" "}
                          {String(p.data.programs || "")}
                        </p>
                        <small>
                          المشرف: {String(p.data.supervisor_name || "غير محدد")}
                        </small>
                        <p>{String(p.data.address || "")}</p>
                        <strong>
                          {
                            data.employees.filter((e) => e.point_id === p.id)
                              .length
                          }{" "}
                          موظفًا خلال الشهر
                        </strong>
                        <div className="actions">
                          <button
                            onClick={() => {
                              setPointFilter(p.id);
                              setSearch("");
                              setPage(0);
                            }}
                          >
                            عرض الموظفين
                          </button>
                          {manage && open && (
                            <button
                              onClick={() => {
                                begin("point_save", null);
                                setRequestValues({
                                  point_id: p.id,
                                  name: p.name,
                                  status: p.status,
                                  ...p.data,
                                });
                              }}
                            >
                              تعديل النقطة
                            </button>
                          )}
                        </div>
                      </article>
                    ))}
                  </div>
                  {!visiblePoints.length && <Empty />}
                  <div className="page-head">
                    <h2>
                      {pointFilter
                        ? "موظفو النقطة المحددة"
                        : "جميع موظفي الشهر"}
                    </h2>
                    <button
                      disabled={busy}
                      onClick={() => void exportRows("employees", true)}
                    >
                      تصدير قائمة الموظفين المعروضة
                    </button>
                  </div>
                  {employeesTable(pointEmployees)}
                </>
              )}
              {(tab === "leaves" || tab === "resignations") && (
                <>
                  {!employee && (
                    <div className="actions">
                      <span>{filteredRequests.length} طلبًا</span>
                      <button
                        disabled={busy}
                        onClick={() => void exportRows(tab, true)}
                      >
                        تصدير النتائج
                      </button>
                    </div>
                  )}
                  {filteredRequests.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>الموظف</th>
                            <th>
                              {tab === "leaves" ? "الفترة" : "آخر يوم عمل"}
                            </th>
                            <th>
                              {tab === "leaves" ? "الأيام في الشهر" : "البديل"}
                            </th>
                            <th>الحالة</th>
                            <th>التفاصيل والإجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {filteredRequests.map((r) => (
                            <tr key={r.id}>
                              <td>
                                {r.employee_name}
                                <small>
                                  {r.national_id} ·{" "}
                                  {
                                    data.points.find((p) => p.id === r.point_id)
                                      ?.name
                                  }
                                </small>
                              </td>
                              <td>
                                {tab === "leaves"
                                  ? `${r.start_date} — ${r.end_date}`
                                  : r.last_working_date}
                                <small>
                                  {String(
                                    r.data.leave_type || r.data.reason || "",
                                  )}
                                </small>
                              </td>
                              <td>
                                {tab === "leaves"
                                  ? daysInMonth(
                                      r.start_date!,
                                      r.end_date!,
                                      month,
                                    )
                                  : String(r.data.replacement_name || "—")}
                              </td>
                              <td>
                                <Badge>{r.status.split("_").join(" ")}</Badge>
                                <small>
                                  {String(r.data.review_reason || "")}
                                </small>
                              </td>
                              <td>
                                <div className="actions">
                                  {r.data.document_path && (
                                    <button
                                      onClick={() =>
                                        void viewDocument(
                                          String(r.data.document_path),
                                        )
                                      }
                                    >
                                      المرفق
                                    </button>
                                  )}
                                  {!observer &&
                                    !employee &&
                                    reviewable &&
                                    ["معلق", "معتمد_مشرف"].includes(
                                      r.status,
                                    ) && (
                                      <>
                                        <button
                                          disabled={
                                            busy ||
                                            (!manage &&
                                              tab === "resignations") ||
                                            (!manage &&
                                              r.status === "معتمد_مشرف")
                                          }
                                          onClick={() =>
                                            begin(
                                              tab === "leaves"
                                                ? "leave_approve"
                                                : "resignation_approve",
                                              r.id,
                                              r.version,
                                            )
                                          }
                                        >
                                          {r.status === "معلق" &&
                                          tab === "leaves"
                                            ? "اعتماد المرحلة الأولى"
                                            : "اعتماد نهائي"}
                                        </button>
                                        <button
                                          disabled={
                                            busy ||
                                            (!manage && tab === "resignations")
                                          }
                                          className="danger"
                                          onClick={() =>
                                            begin(
                                              tab === "leaves"
                                                ? "leave_reject"
                                                : "resignation_reject",
                                              r.id,
                                              r.version,
                                            )
                                          }
                                        >
                                          رفض
                                        </button>
                                      </>
                                    )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </>
              )}
              {tab === "approvals" && (
                <>
                  <p className="notice">
                    قائمة متابعة لجميع الطلبات غير المحسومة، بما فيها طلبات
                    الأشهر السابقة والمستقبلية. التقارير الشهرية مستقلة عن هذه
                    القائمة.
                  </p>
                  <h2>طلبات الإجازة والاستقالة</h2>
                  {pending.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>الموظف</th>
                            <th>النوع والفترة</th>
                            <th>الحالة</th>
                            <th>الإجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pending.map((r) => (
                            <tr key={r.id}>
                              <td>{r.employee_name}</td>
                              <td>
                                {r.kind === "leave" ? "إجازة" : "استقالة"}
                                <small>
                                  {r.start_date || r.last_working_date}
                                </small>
                              </td>
                              <td>{r.status}</td>
                              <td>
                                <div className="actions">
                                  <button
                                    disabled={
                                      busy ||
                                      (!manage &&
                                        (r.kind === "resignation" ||
                                          r.status === "معتمد_مشرف"))
                                    }
                                    onClick={() =>
                                      begin(
                                        r.kind + "_approve",
                                        r.id,
                                        r.version,
                                      )
                                    }
                                  >
                                    اعتماد
                                  </button>
                                  <button
                                    disabled={
                                      busy ||
                                      (!manage && r.kind === "resignation")
                                    }
                                    onClick={() =>
                                      begin(r.kind + "_reject", r.id, r.version)
                                    }
                                  >
                                    رفض
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Empty />
                  )}
                  <h2>تعديلات الملفات</h2>
                  {changes
                    .filter((c) => c.status === "معلق")
                    .map((c) => (
                      <article className="panel" key={c.id}>
                        <strong>
                          {String(
                            data.employees.find((e) => e.id === c.employee_id)
                              ?.data.full_name_ar || "ملف موظف",
                          )}
                        </strong>
                        <p>{c.reason}</p>
                        <details>
                          <summary>عرض البيانات المقترحة</summary>
                          <div className="detail-grid">
                            {employeeFields
                              .filter((f) => c.data[f.key] !== undefined)
                              .map((f) => (
                                <div key={f.key}>
                                  <small>{f.label}</small>
                                  <span>
                                    {f.type === "file"
                                      ? "مرفق محدث"
                                      : String(c.data[f.key] ?? "")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </details>
                        {manage && (
                          <div className="actions">
                            <button
                              onClick={() => begin("profile_approve", c.id)}
                            >
                              اعتماد التعديل
                            </button>
                            <button
                              onClick={() => begin("profile_reject", c.id)}
                            >
                              رفض التعديل
                            </button>
                          </div>
                        )}
                      </article>
                    ))}
                </>
              )}
              {tab === "assets" && (
                <>
                  <p className="notice">
                    العهد تعرض الوضع الحالي، وتستمر عبر الأشهر حتى تسجيل
                    إرجاعها.
                  </p>
                  {manage && (
                    <button
                      onClick={() => {
                        begin("asset_add", null);
                        setRequestValues({ quantity: 1 });
                      }}
                    >
                      إضافة عهدة
                    </button>
                  )}
                  {assets.length ? (
                    <div className="table-wrap">
                      <table>
                        <thead>
                          <tr>
                            <th>العهدة</th>
                            <th>الكمية</th>
                            <th>المسؤول</th>
                            <th>الحالة</th>
                            <th>الإجراء</th>
                          </tr>
                        </thead>
                        <tbody>
                          {assets.map((a) => (
                            <tr key={a.id}>
                              <td>
                                {a.name}
                                <small>{a.id.slice(0, 8)}</small>
                              </td>
                              <td>{a.quantity}</td>
                              <td>
                                {String(
                                  data.employees.find(
                                    (e) => e.id === a.employee_id,
                                  )?.data.full_name_ar || "عهدة نقطة",
                                )}
                              </td>
                              <td>{a.returned ? "مُعادة" : "بعهدة المستلم"}</td>
                              <td>
                                {manage && !a.returned && (
                                  <button
                                    onClick={() => begin("asset_return", a.id)}
                                  >
                                    تسجيل الإرجاع
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <Empty />
                  )}
                </>
              )}
              {tab === "reports" && (
                <div className="panel">
                  <h2>التقرير الشهري</h2>
                  <p>
                    يتضمن جميع بيانات الموظفين والإجازات والاستقالات والتنقلات
                    ضمن نطاق صلاحياتك.
                  </p>
                  <div className="grid">
                    {[
                      ["موظفو الشهر", data.employees.length],
                      [
                        "الإجازات المعتمدة",
                        data.leaves.filter((r) => r.status === "معتمد_نهائي")
                          .length,
                      ],
                      [
                        "الاستقالات المعتمدة",
                        data.resignations.filter((r) => r.status === "معتمد")
                          .length,
                      ],
                    ].map(([label, count]) => (
                      <div className="panel" key={label}>
                        <small>{label}</small>
                        <div className="stat">{count}</div>
                      </div>
                    ))}
                  </div>
                  <div className="actions">
                    <button
                      className="primary"
                      disabled={busy}
                      onClick={() => void exportRows("all")}
                    >
                      تصدير المصنف الشهري الكامل
                    </button>
                    {manage && data.period.status === "review" && (
                      <button onClick={() => begin("period_close", null)}>
                        اعتماد وإغلاق الشهر
                      </button>
                    )}
                    {user.role === "super_admin" &&
                      data.period.status === "closed" && (
                        <button onClick={() => begin("period_reopen", null)}>
                          فتح إصدار تصحيح جديد
                        </button>
                      )}
                  </div>
                  <p className="muted">
                    الأشهر السابقة تحتفظ بنسخها عند الانتقال للشهر التالي.
                    الإغلاق متاح بعد تسوية الطلبات المعلقة.
                  </p>
                </div>
              )}
              {tab === "accounts" && user.role === "super_admin" && (
                <>
                  <button
                    onClick={() => {
                      begin("account_create", null);
                      setRequestValues({ role: "hr_observer" });
                    }}
                  >
                    إنشاء حساب رسمي
                  </button>
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>الاسم</th>
                          <th>الدور</th>
                          <th>الحالة</th>
                          <th>الإجراءات</th>
                        </tr>
                      </thead>
                      <tbody>
                        {accounts.map((a) => (
                          <tr key={a.id}>
                            <td>{a.name}</td>
                            <td>{roleLabels[a.role]}</td>
                            <td>{a.active ? "نشط" : "موقوف"}</td>
                            <td>
                              <div className="actions">
                                <button
                                  disabled={a.id === user.id}
                                  onClick={() => begin("account_reset", a.id)}
                                >
                                  إعادة تعيين المرور
                                </button>
                                <button
                                  disabled={a.id === user.id}
                                  onClick={() => {
                                    begin("account_toggle", a.id);
                                    setRequestValues({ active: !a.active });
                                  }}
                                >
                                  {a.active ? "إيقاف" : "تفعيل"}
                                </button>
                                {a.role === "supervisor" && (
                                  <button
                                    onClick={() => {
                                      begin("assign_points", a.id);
                                      setRequestValues({ points: "" });
                                    }}
                                  >
                                    تعيين نقاط المشرف
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </>
          )
        )}
      </main>
      {selected && data && (
        <Dialog
          title={String(selected.data.full_name_ar)}
          onClose={() => setSelected(null)}
        >
          <div className="actions">
            <Badge>{selected.national_id}</Badge>
            {employee && open && (
              <button
                onClick={() => {
                  setEditing(selected);
                  setSelected(null);
                }}
              >
                استكمال الملف أو طلب تعديل البيانات
              </button>
            )}
            {manage && open && (
              <>
                <button
                  onClick={() => {
                    setEditing(selected);
                    setSelected(null);
                  }}
                >
                  تعديل جميع البيانات
                </button>
                <button
                  onClick={() => {
                    begin("transfer", selected.id, selected.version);
                    setSelected(null);
                  }}
                >
                  نقل الموظف
                </button>
                <button
                  onClick={() => {
                    begin("employee_pin", selected.id);
                    setSelected(null);
                  }}
                >
                  إعادة تعيين PIN
                </button>
                {selected.status === "معلق" && (
                  <>
                    <button
                      onClick={() => {
                        begin(
                          "employee_approve",
                          selected.id,
                          selected.version,
                        );
                        setSelected(null);
                      }}
                    >
                      اعتماد الملف
                    </button>
                    <button
                      onClick={() => {
                        begin("employee_reject", selected.id, selected.version);
                        setSelected(null);
                      }}
                    >
                      رفض
                    </button>
                  </>
                )}
              </>
            )}
          </div>
          <div className="detail-grid">
            {employeeFields.map((f) => (
              <div key={f.key}>
                <small>{f.label}</small>
                {f.type === "file" ? (
                  selected.data[f.key] ? (
                    <button
                      onClick={() =>
                        void viewDocument(String(selected.data[f.key]))
                      }
                    >
                      فتح المرفق
                    </button>
                  ) : (
                    "—"
                  )
                ) : (
                  <strong>
                    {typeof selected.data[f.key] === "boolean"
                      ? selected.data[f.key]
                        ? "نعم"
                        : "لا"
                      : String(selected.data[f.key] ?? "—")}
                  </strong>
                )}
              </div>
            ))}
          </div>
        </Dialog>
      )}
      {importing && data && (
        <Dialog
          title="استيراد الموظفين ومراجعة الفروق"
          onClose={() => setImporting(false)}
        >
          <ImportEmployees
            employees={data.employees}
            points={data.points}
            month={month}
            onSaved={() => {
              setImporting(false);
              void refresh();
            }}
          />
        </Dialog>
      )}
      {editing && data && (
        <Dialog
          title={editing === "new" ? "إضافة موظف" : "تعديل ملف الموظف"}
          onClose={() => setEditing(null)}
        >
          <EmployeeEditor
            self={employee}
            employee={editing === "new" ? undefined : editing}
            points={data.points}
            onSaved={() => {
              setEditing(null);
              void refresh();
            }}
          />
        </Dialog>
      )}
      {requestForm && data && (
        <Dialog
          title={requestForm === "leave" ? "طلب إجازة" : "طلب استقالة"}
          onClose={() => setRequestForm(null)}
        >
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              if (
                await run(() =>
                  mutate(
                    requestForm === "leave"
                      ? "leave_submit"
                      : "resignation_submit",
                    requestId,
                    requestValues,
                  ),
                )
              )
                setRequestForm(null);
            }}
          >
            <div className="form-grid">
              <label>
                الموظف
                <select
                  required
                  value={String(requestValues.employee_id || "")}
                  onChange={(e) =>
                    setRequestValues({
                      ...requestValues,
                      employee_id: e.target.value,
                    })
                  }
                >
                  <option value="">اختر الموظف</option>
                  {data.employees
                    .filter((e) => e.status === "نشط")
                    .map((e) => (
                      <option key={e.id} value={e.id}>
                        {String(e.data.full_name_ar)}
                      </option>
                    ))}
                </select>
              </label>
              {requestForm === "leave" ? (
                <>
                  <label>
                    نوع الإجازة
                    <select
                      value={String(requestValues.leave_type)}
                      onChange={(e) =>
                        setRequestValues({
                          ...requestValues,
                          leave_type: e.target.value,
                        })
                      }
                    >
                      {["سنوية", "مرضية", "طارئة", "أمومة", "أخرى"].map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  {["start_date", "end_date"].map((key, i) => (
                    <label key={key}>
                      {i ? "إلى" : "من"}
                      <input
                        required
                        type="date"
                        value={String(requestValues[key] || "")}
                        onChange={(e) =>
                          setRequestValues({
                            ...requestValues,
                            [key]: e.target.value,
                          })
                        }
                      />
                    </label>
                  ))}
                </>
              ) : (
                <label>
                  آخر يوم عمل
                  <input
                    required
                    type="date"
                    value={String(requestValues.last_working_date || "")}
                    onChange={(e) =>
                      setRequestValues({
                        ...requestValues,
                        last_working_date: e.target.value,
                      })
                    }
                  />
                </label>
              )}
              <label className="wide">
                {requestForm === "leave" ? "ملاحظات" : "سبب الاستقالة"}
                <textarea
                  required={requestForm === "resignation"}
                  onChange={(e) =>
                    setRequestValues({
                      ...requestValues,
                      [requestForm === "leave" ? "notes" : "reason"]:
                        e.target.value,
                    })
                  }
                />
              </label>
              <label>
                المرفق
                <input
                  type="file"
                  accept="image/jpeg,image/png,application/pdf"
                  disabled={!requestValues.employee_id || busy}
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setBusy(true);
                    try {
                      const path = await upload(
                        f,
                        String(requestValues.employee_id),
                      );
                      setRequestValues((old) => ({
                        ...old,
                        document_path: path,
                      }));
                    } catch (err) {
                      setError(message(err));
                    } finally {
                      setBusy(false);
                    }
                  }}
                />
                <small>
                  {requestValues.document_path
                    ? "اكتمل رفع المرفق"
                    : "التقرير إلزامي للمرضية والخطاب إلزامي للاستقالة"}
                </small>
              </label>
            </div>
            {error && (
              <p className="notice error" role="alert">
                {error}
              </p>
            )}
            <button className="primary" disabled={busy}>
              إرسال وحفظ الطلب
            </button>
          </form>
        </Dialog>
      )}
      {action && data && (
        <Dialog title="تنفيذ إجراء" onClose={() => !busy && setAction(null)}>
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              await run(async () => {
                if (
                  action.name === "profile_approve" ||
                  action.name === "profile_reject"
                )
                  await rpc("hr_review_profile", {
                    p_id: action.id,
                    p_approve: action.name === "profile_approve",
                    p_reason: reason,
                  });
                else if (action.name === "password") {
                  await account("change_password", {
                    old_password: requestValues.old_password,
                    new_password: requestValues.new_password,
                  });
                } else if (action.name === "period_reopen")
                  await rpc("hr_reopen_period", {
                    p_month: month,
                    p_reason: reason,
                  });
                else if (action.name === "period_close")
                  await rpc("hr_close_period", { p_month: month });
                else if (action.name === "account_create") {
                  const c = await account("create", requestValues);
                  setCredentials(c);
                } else if (
                  action.name === "account_reset" ||
                  action.name === "employee_pin"
                ) {
                  const c = await account(
                    action.name === "employee_pin" ? "employee_pin" : "reset",
                    { id: action.id },
                  );
                  setCredentials(c);
                } else if (action.name === "account_toggle")
                  await account("toggle", {
                    id: action.id,
                    active: requestValues.active,
                  });
                else if (action.name === "assign_points")
                  await account("assign_points", {
                    id: action.id,
                    points: String(requestValues.points || "")
                      .split(",")
                      .filter(Boolean),
                  });
                else
                  await mutate(action.name, action.id, {
                    ...requestValues,
                    reason,
                    version: action.version,
                    point_id:
                      action.name === "transfer"
                        ? target
                        : requestValues.point_id,
                    replacement_id: target,
                  });
              });
            }}
          >
            <p className="notice">
              {action.name === "period_close"
                ? "سيصبح الشهر معتمدًا للقراءة فقط."
                : action.name === "employee_pin"
                  ? "سيتم إصدار رمز مؤقت جديد. سلّمه للموظف بشكل خاص."
                  : action.name === "asset_return"
                    ? "تأكيد استلام العهدة كاملة من الموظف."
                    : "راجع البيانات ثم أكد الإجراء."}
            </p>
            {action.name === "password" && (
              <>
                <label>
                  كلمة المرور الحالية
                  <input
                    type="password"
                    required
                    autoComplete="current-password"
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        old_password: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  كلمة المرور الجديدة
                  <input
                    type="password"
                    required
                    minLength={12}
                    autoComplete="new-password"
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        new_password: e.target.value,
                      }))
                    }
                  />
                </label>
              </>
            )}
            {(action.name === "transfer" ||
              action.name === "resignation_approve") && (
              <label>
                {action.name === "transfer"
                  ? "النقطة الجديدة"
                  : "الموظف البديل"}
                <select
                  required
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                >
                  <option value="">اختر</option>
                  {action.name === "transfer"
                    ? data.points.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))
                    : data.employees
                        .filter((e) => e.status === "نشط")
                        .map((e) => (
                          <option key={e.id} value={e.id}>
                            {String(e.data.full_name_ar)}
                          </option>
                        ))}
                </select>
              </label>
            )}
            {action.name === "account_create" && (
              <>
                <label>
                  اسم الحساب
                  <input
                    required
                    onChange={(e) =>
                      setRequestValues((v) => ({ ...v, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  اسم الدخول
                  <input
                    dir="ltr"
                    pattern="[a-z0-9._-]{3,40}"
                    required
                    placeholder="hr.followup"
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        username: e.target.value,
                      }))
                    }
                  />
                </label>
                <label>
                  الدور
                  <select
                    value={String(requestValues.role)}
                    onChange={(e) =>
                      setRequestValues((v) => ({ ...v, role: e.target.value }))
                    }
                  >
                    {Object.entries(roleLabels)
                      .filter(([r]) => r !== "employee")
                      .map(([r, label]) => (
                        <option key={r} value={r}>
                          {label}
                        </option>
                      ))}
                  </select>
                </label>
              </>
            )}
            {action.name === "assign_points" && (
              <fieldset>
                <legend>نطاق المشرف — يحل محل التعيين السابق</legend>
                {data.points.map((p) => (
                  <label key={p.id}>
                    <span>
                      <input
                        type="checkbox"
                        onChange={(e) => {
                          const ids = String(requestValues.points || "")
                            .split(",")
                            .filter(Boolean);
                          setRequestValues({
                            points: (e.target.checked
                              ? [...ids, p.id]
                              : ids.filter((id) => id !== p.id)
                            ).join(","),
                          });
                        }}
                      />{" "}
                      {p.name}
                    </span>
                  </label>
                ))}
              </fieldset>
            )}
            {action.name === "point_save" && (
              <div className="form-grid">
                {[
                  ["name", "اسم النقطة"],
                  ["governorate", "المحافظة"],
                  ["supervisor_name", "المشرف"],
                  ["programs", "البرامج"],
                  ["address", "العنوان"],
                ].map(([key, label]) => (
                  <label key={key}>
                    {label}
                    <input
                      value={String(requestValues[key] || "")}
                      onChange={(e) =>
                        setRequestValues((v) => ({
                          ...v,
                          [key]: e.target.value,
                        }))
                      }
                    />
                  </label>
                ))}
                <label>
                  الحالة
                  <select
                    value={String(requestValues.status)}
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        status: e.target.value,
                      }))
                    }
                  >
                    {["نشطة", "معلقة", "مغلقة"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {action.name === "asset_add" && (
              <div className="form-grid">
                <label>
                  اسم العهدة
                  <input
                    required
                    onChange={(e) =>
                      setRequestValues((v) => ({ ...v, name: e.target.value }))
                    }
                  />
                </label>
                <label>
                  الكمية
                  <input
                    required
                    type="number"
                    min={1}
                    value={String(requestValues.quantity)}
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        quantity: Number(e.target.value),
                      }))
                    }
                  />
                </label>
                <label>
                  النقطة
                  <select
                    required
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        point_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">اختر</option>
                    {data.points.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  الموظف المسؤول
                  <select
                    onChange={(e) =>
                      setRequestValues((v) => ({
                        ...v,
                        employee_id: e.target.value,
                      }))
                    }
                  >
                    <option value="">عهدة نقطة</option>
                    {data.employees.map((e) => (
                      <option key={e.id} value={e.id}>
                        {String(e.data.full_name_ar)}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            )}
            {![
              "password",
              "account_create",
              "account_reset",
              "account_toggle",
              "employee_pin",
              "assign_points",
              "period_close",
              "asset_return",
              "asset_add",
            ].includes(action.name) && (
              <label>
                سبب الإجراء أو ملاحظات المراجعة
                <textarea
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </label>
            )}
            {error && (
              <p role="alert" className="notice error">
                {error}
              </p>
            )}
            <div className="actions">
              <button className="primary" disabled={busy}>
                {busy ? "جارٍ التنفيذ…" : "تأكيد وحفظ"}
              </button>
            </div>
          </form>
        </Dialog>
      )}
      {credentials && (
        <Dialog
          title="بيانات دخول مؤقتة — تظهر مرة واحدة"
          onClose={() => setCredentials(null)}
        >
          <p>سلّمها لصاحب الحساب بطريقة خاصة. سيُطلب تغييرها عند أول دخول.</p>
          <label>
            اسم الدخول
            <input readOnly value={credentials.username} />
          </label>
          <label>
            كلمة المرور أو الرمز المؤقت
            <input readOnly dir="ltr" value={credentials.password} />
          </label>
          <button onClick={() => setCredentials(null)}>تم الاستلام</button>
        </Dialog>
      )}
    </div>
  );
}
