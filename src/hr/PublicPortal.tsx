import React, { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  UserRound,
  UserPlus,
  FileText,
  ArrowLeft,
  ShieldCheck,
} from "lucide-react";
import { account } from "./api";
import { employeeFields, message, type Values } from "./model";

export function PublicHome() {
  const services = [
    {
      title: "دخول الموظف",
      text: "ادخل برقم هويتك ورمز PIN لمتابعة ملفك وطلباتك.",
      to: "/login?account=employee",
      Icon: UserRound,
    },
    {
      title: "طلب إجازة",
      text: "قدّم طلب إجازة وتابع مراحل اعتماده من حسابك.",
      to: "/login?account=employee&next=leaves",
      Icon: CalendarDays,
    },
    {
      title: "طلب استقالة",
      text: "أرسل طلبك ومرفقاته وتابع إجراءاته لدى الإدارة.",
      to: "/login?account=employee&next=resignations",
      Icon: FileText,
    },
    {
      title: "تسجيل موظف جديد",
      text: "سجّل بياناتك واختر PIN خاصًا بك، ثم انتظر اعتماد الإدارة.",
      to: "/register",
      Icon: UserPlus,
    },
  ];
  return (
    <div className="hr-app public-portal">
      <header className="public-header">
        <Link className="hr-brand" to="/" aria-label="الصفحة الرئيسية">
          <img src="/branding/aei_wfp_hr_icon.jpg" alt="شعار أرض الإنسان" />
          <div>
            <strong>أرض الإنسان</strong>
            <small>مشروع الغذاء العالمي · WFP</small>
          </div>
        </Link>
        <Link className="button" to="/login?account=admin">
          دخول الإدارة
        </Link>
      </header>
      <main className="public-main">
        <section className="public-hero">
          <div>
            <span className="public-eyebrow">بوابة خدمات الموظفين</span>
            <h1>
              كل ما يخص عملك،
              <br />
              في مكان واحد.
            </h1>
            <p>
              بوابة الموارد البشرية لجمعية أرض الإنسان — مشروع الغذاء العالمي.
              وصول سهل إلى بياناتك، وطلباتك، ومتابعة إجراءاتك مع الإدارة.
            </p>
            <div className="actions">
              <Link className="button primary" to="/login?account=employee">
                الدخول إلى حسابي <ArrowLeft size={18} />
              </Link>
              <Link className="button" to="/register">
                تسجيل موظف جديد
              </Link>
            </div>
          </div>
          <aside className="public-intro">
            <ShieldCheck size={38} />
            <h2>حسابك، بياناتك، متابعتك</h2>
            <p>
              ادخل برقم الهوية وPIN الذي تختاره. تبقى طلباتك مرتبطة بحسابك
              ويمكنك متابعة حالتها بعد الإرسال.
            </p>
            <small>
              الموظف الحالي: احصل على رمز دخول مؤقت من الإدارة، ثم اختر PIN
              الخاص بك عند أول دخول.
            </small>
          </aside>
        </section>
        <section aria-labelledby="services-title">
          <div className="public-section-head">
            <h2 id="services-title">كيف يمكننا مساعدتك؟</h2>
            <p>اختر الخدمة التي تحتاجها للبدء.</p>
          </div>
          <div className="public-services">
            {services.map(({ title, text, to, Icon }) => (
              <Link className="public-service" key={to} to={to}>
                <span className="service-icon">
                  <Icon size={26} />
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
                <span className="service-go">
                  ابدأ الآن <ArrowLeft size={18} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <section className="public-steps">
          <h2>خطوات بسيطة لمتابعة طلبك</h2>
          <ol>
            <li>
              <strong>ادخل إلى حسابك</strong>
              <span>استخدم رقم الهوية ورمز PIN.</span>
            </li>
            <li>
              <strong>أكمل بيانات الطلب</strong>
              <span>حدّد التفاصيل وأرفق المستندات المطلوبة.</span>
            </li>
            <li>
              <strong>تابع حالة الاعتماد</strong>
              <span>ارجع إلى حسابك للاطلاع على قرار الإدارة.</span>
            </li>
          </ol>
        </section>
      </main>
      <footer className="public-footer">
        جمعية أرض الإنسان · مشروع الغذاء العالمي WFP{" "}
        <span>بوابة الموارد البشرية وخدمات الموظفين</span>
      </footer>
    </div>
  );
}

export function PublicRegistration() {
  const [data, setData] = useState<Values>({});
  const [nid, setNid] = useState("");
  const [pin, setPin] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);
  const [lookup, setLookup] = useState<{
    exists: boolean;
    can_verify: boolean;
  } | null>(null);
  const [checking, setChecking] = useState(false);
  const [retry, setRetry] = useState(0);
  const [existing, setExisting] = useState<{
    version: number;
    request_revision: number | null;
    status: string;
  } | null>(null);
  const latestNid = useRef(nid);
  latestNid.current = nid;
  useEffect(() => {
    let alive = true;
    setLookup(null);
    setExisting(null);
    setData({});
    setPin("");
    setConfirm("");
    setError("");
    setDone(false);
    if (!/^\d{9}$/.test(nid)) {
      setChecking(false);
      return;
    }
    setChecking(true);
    const timer = setTimeout(() => {
      void account("employee_registration_check", { national_id: nid })
        .then((result) => {
          if (alive) setLookup(result);
        })
        .catch((err) => {
          if (alive) setError(message(err));
        })
        .finally(() => {
          if (alive) setChecking(false);
        });
    }, 450);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [nid, retry]);
  const fields = employeeFields
    .filter(
      (f) =>
        f.type !== "file" &&
        (!!existing ||
          !["supervisor_name", "department", "category", "notes"].includes(
            f.key,
          )),
    )
    .map((f) =>
      f.key === "job_title"
        ? {
            ...f,
            options: [
              "منسق مشروع",
              "قائد فرق ميدانية",
              "عامل صحة ميداني",
              "متطوع",
              "أمن",
            ],
          }
        : f,
    );
  return (
    <div className="hr-app">
      <main className="hr-main">
        <Link className="button" to="/">
          العودة للرئيسية
        </Link>
        <section className="panel registration-panel">
          <h1>تسجيل موظف جديد</h1>
          {!done && (
            <section className="panel">
              <label>
                رقم الهوية — ابدأ من هنا
                <input
                  required
                  pattern="[0-9]{9}"
                  maxLength={9}
                  inputMode="numeric"
                  autoComplete="username"
                  dir="ltr"
                  value={nid}
                  disabled={busy}
                  onChange={(e) => setNid(e.target.value)}
                />
              </label>
              <small>
                نفحص وجود ملف سابق تلقائيًا عند اكتمال رقم الهوية، قبل تعبئة
                البيانات.
              </small>
              {checking && <p role="status">جارٍ فحص رقم الهوية…</p>}
              {lookup && !lookup.exists && (
                <p role="status">
                  لا يوجد ملف سابق. يمكنك تعبئة تسجيل جديد أدناه.
                </p>
              )}
              {lookup?.exists && !existing && (
                <>
                  <p className="notice">
                    يوجد ملف مسجّل بهذه الهوية.
                    {lookup.can_verify
                      ? " أدخل PIN لعرض بياناتك واستكمال تعديلها."
                      : " راجع الإدارة لإصدار رمز الدخول لحسابك، ثم اختر PIN الخاص بك من صفحة الدخول."}
                  </p>
                  {lookup.can_verify ? (
                    <form
                      onSubmit={async (e) => {
                        e.preventDefault();
                        setBusy(true);
                        setError("");
                        const checked = nid;
                        try {
                          const result = await account(
                            "employee_registration_read",
                            { national_id: nid, password: pin },
                          );
                          if (latestNid.current !== checked) return;
                          setData(result.data);
                          setExisting({
                            version: result.version,
                            request_revision: result.request_revision,
                            status: result.status,
                          });
                        } catch (err) {
                          setError(message(err));
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <label>
                        رمز PIN الحالي
                        <input
                          type="password"
                          required
                          autoComplete="current-password"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                        />
                      </label>
                      <button className="primary" disabled={busy}>
                        {busy ? "جارٍ التحقق…" : "عرض بياناتي وتعديلها"}
                      </button>
                    </form>
                  ) : null}
                  <Link to="/login?account=employee">
                    الدخول للحساب أو تغيير الرمز المؤقت
                  </Link>
                </>
              )}
              {error && (!lookup || (lookup.exists && !existing)) && (
                <p role="alert" className="notice error">
                  {error}
                </p>
              )}
              {!checking && !lookup && /^\d{9}$/.test(nid) && error && (
                <button type="button" onClick={() => setRetry((v) => v + 1)}>
                  إعادة فحص الهوية
                </button>
              )}
            </section>
          )}
          {done ? (
            <div role="status">
              <h2>
                {existing
                  ? "تم حفظ التعديلات للمراجعة"
                  : "تم استلام طلب التسجيل"}
              </h2>
              <p>
                {existing?.status === "نشط"
                  ? "أُرسلت التعديلات إلى الإدارة. تبقى بياناتك الحالية معتمدة حتى الموافقة على التعديل."
                  : "ستراجع الإدارة بياناتك. بعد اعتماد ملفك يمكنك الدخول برقم الهوية وPIN الذي اخترته."}
              </p>
              <Link className="button primary" to="/login?account=employee">
                الدخول إلى حساب الموظف
              </Link>
            </div>
          ) : lookup && (!lookup.exists || existing) ? (
            <>
              <p>
                {existing
                  ? "تم تحميل بيانات ملفك. عدّل الحقول ثم احفظ؛ تعديلات الملف النشط تحتاج اعتماد الإدارة."
                  : "أكمل بياناتك واختر رمز PIN خاصًا بك. يخضع التسجيل لاعتماد الإدارة قبل تفعيل الحساب."}
              </p>
              <p className="notice">
                يمكنك استكمال المرفقات من حسابك بعد التفعيل. تعديل هذا النموذج
                لا يغيّر رقم الهوية أو رمز PIN أو الصلاحيات.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setBusy(true);
                  try {
                    if (!existing && pin !== confirm)
                      throw new Error("تأكيد PIN غير مطابق");
                    await account(
                      existing
                        ? "employee_registration_save"
                        : "employee_register",
                      {
                        national_id: nid,
                        password: pin,
                        data,
                        version: existing?.version,
                        request_revision: existing?.request_revision,
                      },
                    );
                    setPin("");
                    setConfirm("");
                    setDone(true);
                  } catch (err) {
                    setError(message(err));
                  } finally {
                    setBusy(false);
                  }
                }}
              >
                {!existing && (
                  <fieldset>
                    <legend>بيانات الدخول</legend>
                    <div className="form-grid">
                      <label>
                        رقم الهوية
                        <input
                          required
                          pattern="[0-9]{9}"
                          maxLength={9}
                          inputMode="numeric"
                          autoComplete="username"
                          dir="ltr"
                          value={nid}
                          readOnly
                        />
                      </label>
                      <label>
                        اختر PIN (8 إلى 12 رقمًا)
                        <input
                          required
                          type="password"
                          inputMode="numeric"
                          pattern="[0-9]{8,12}"
                          autoComplete="new-password"
                          value={pin}
                          onChange={(e) => setPin(e.target.value)}
                        />
                      </label>
                      <label>
                        تأكيد PIN
                        <input
                          required
                          type="password"
                          inputMode="numeric"
                          autoComplete="new-password"
                          value={confirm}
                          onChange={(e) => setConfirm(e.target.value)}
                        />
                      </label>
                    </div>
                  </fieldset>
                )}
                {[...new Set(fields.map((f) => f.group))].map((group) => (
                  <fieldset key={group}>
                    <legend>{group}</legend>
                    <div className="form-grid">
                      {fields
                        .filter((f) => f.group === group)
                        .map((f) => (
                          <label key={f.key}>
                            {f.label}
                            {f.required ? " *" : ""}
                            {f.options ? (
                              <select
                                disabled={
                                  !!existing &&
                                  [
                                    "supervisor_name",
                                    "department",
                                    "category",
                                    "notes",
                                  ].includes(f.key)
                                }
                                required={f.required}
                                value={String(data[f.key] || "")}
                                onChange={(e) =>
                                  setData({ ...data, [f.key]: e.target.value })
                                }
                              >
                                <option value="">اختر</option>
                                {f.key === "job_title" &&
                                  data[f.key] &&
                                  !f.options.includes(String(data[f.key])) && (
                                    <option
                                      value={String(data[f.key])}
                                      disabled
                                    >
                                      {String(data[f.key])} — اختر المسمى
                                      المحدّث
                                    </option>
                                  )}
                                {f.options.map((o) => (
                                  <option key={o}>{o}</option>
                                ))}
                              </select>
                            ) : f.type === "checkbox" ? (
                              <input
                                type="checkbox"
                                required={f.required}
                                checked={!!data[f.key]}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    [f.key]: e.target.checked,
                                  })
                                }
                              />
                            ) : (
                              <input
                                required={f.required}
                                type={f.type || "text"}
                                readOnly={
                                  !!existing &&
                                  [
                                    "supervisor_name",
                                    "department",
                                    "category",
                                    "notes",
                                  ].includes(f.key)
                                }
                                min={f.type === "number" ? 0 : undefined}
                                maxLength={
                                  f.type === "number" ? undefined : 300
                                }
                                value={String(data[f.key] ?? "")}
                                onChange={(e) =>
                                  setData({
                                    ...data,
                                    [f.key]:
                                      f.type === "number"
                                        ? e.target.value === ""
                                          ? null
                                          : Number(e.target.value)
                                        : e.target.value,
                                  })
                                }
                              />
                            )}
                          </label>
                        ))}
                    </div>
                  </fieldset>
                ))}
                {error && (
                  <p role="alert" className="notice error">
                    {error}
                  </p>
                )}
                <button className="primary" disabled={busy}>
                  {busy
                    ? "جارٍ الحفظ…"
                    : existing
                      ? "حفظ تعديلات الملف"
                      : "إرسال التسجيل للمراجعة"}
                </button>
              </form>
            </>
          ) : null}
        </section>
      </main>
    </div>
  );
}
