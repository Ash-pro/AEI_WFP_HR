import React, { useState } from "react";
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
  const fields = employeeFields.filter(
    (f) =>
      f.type !== "file" &&
      !["supervisor_name", "department", "category", "notes"].includes(f.key),
  );
  return (
    <div className="hr-app">
      <main className="hr-main">
        <Link className="button" to="/">
          العودة للرئيسية
        </Link>
        <section className="panel registration-panel">
          <h1>تسجيل موظف جديد</h1>
          {done ? (
            <div role="status">
              <h2>تم استلام طلب التسجيل</h2>
              <p>
                ستراجع الإدارة بياناتك. بعد اعتماد ملفك يمكنك الدخول برقم الهوية
                وPIN الذي اخترته.
              </p>
              <Link className="button primary" to="/login?account=employee">
                الدخول إلى حساب الموظف
              </Link>
            </div>
          ) : (
            <>
              <p>
                أكمل بياناتك واختر رمز PIN خاصًا بك. يخضع التسجيل لاعتماد
                الإدارة قبل تفعيل الحساب.
              </p>
              <p className="notice">
                إذا كان لديك ملف سابق، استخدم صفحة الدخول واطلب رمزًا مؤقتًا من
                الإدارة. لا تنشئ ملفًا جديدًا لنفس الهوية. يمكنك استكمال
                المرفقات من حسابك بعد التفعيل.
              </p>
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setError("");
                  setBusy(true);
                  try {
                    if (pin !== confirm) throw new Error("تأكيد PIN غير مطابق");
                    await account("employee_register", {
                      national_id: nid,
                      password: pin,
                      data,
                    });
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
                        onChange={(e) => setNid(e.target.value)}
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
                                required={f.required}
                                value={String(data[f.key] || "")}
                                onChange={(e) =>
                                  setData({ ...data, [f.key]: e.target.value })
                                }
                              >
                                <option value="">اختر</option>
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
                  {busy ? "جارٍ إرسال التسجيل…" : "إرسال التسجيل للمراجعة"}
                </button>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}
