import React, { lazy, Suspense, useEffect, useState } from "react";
import {
  BrowserRouter,
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import { account, configured, db, profile } from "./api";
import { message, type Profile } from "./model";
import "./hr.css";
import { LegacyBackup } from "./LegacyBackup";
import { PublicHome, PublicRegistration } from "./PublicPortal";
const Workspace = lazy(() =>
  import("./Workspace").then((m) => ({ default: m.Workspace })),
);
function SessionApp() {
  const location = useLocation();
  const [user, setUser] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [staff, setStaff] = useState(false);
  const [show, setShow] = useState(false);
  const navigate = useNavigate();
  const requestedTab = new URLSearchParams(location.search).get("next");
  useEffect(() => {
    if (location.pathname === "/login")
      setStaff(
        new URLSearchParams(location.search).get("account") === "employee",
      );
  }, [location.pathname, location.search]);
  useEffect(() => {
    if (user && !user.must_change_password && location.pathname === "/login") {
      const target =
        user.role === "employee" &&
        ["leaves", "resignations"].includes(requestedTab || "")
          ? `/workspace/${requestedTab}?new=1`
          : `/workspace/${user.role === "hr_observer" ? "points" : "employees"}`;
      navigate(target, { replace: true });
    }
  }, [user, location.pathname, requestedTab]);
  async function restore() {
    try {
      setUser(await profile());
    } catch (e) {
      setError(message(e));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => {
    void restore();
    const {
      data: { subscription },
    } = db.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        setUser(null);
        setLoading(false);
      } else setTimeout(() => void restore(), 0);
    });
    return () => subscription.unsubscribe();
  }, []);
  async function login(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      if (!configured)
        throw new Error("إعدادات الاتصال غير متوفرة. راجع مسؤول النظام.");
      if (staff) {
        const session = await account("employee_login", {
          national_id: identifier,
          password,
        });
        const { error } = await db.auth.setSession(session);
        if (error) throw error;
      } else {
        const email = identifier.includes("@")
          ? identifier.trim()
          : `${identifier.trim().toLowerCase()}@accounts.aei.invalid`;
        const { error } = await db.auth.signInWithPassword({ email, password });
        if (error)
          throw new Error(
            "تعذر الدخول. تحقق من البيانات والاتصال وحالة الحساب.",
          );
      }
      const p = await profile();
      if (!p) throw new Error("الحساب غير مفعّل");
      setUser(p);
      setPassword("");
      navigate(
        p.role === "employee" &&
          ["leaves", "resignations"].includes(requestedTab || "")
          ? `/workspace/${requestedTab}?new=1`
          : `/workspace/${p.role === "hr_observer" ? "points" : "employees"}`,
        { replace: true },
      );
    } catch (e) {
      setError(message(e));
    } finally {
      setBusy(false);
    }
  }
  async function logout() {
    await db.auth.signOut();
    setUser(null);
    setPassword("");
    navigate("/login", { replace: true });
  }
  if (location.pathname === "/") return <PublicHome />;
  if (location.pathname === "/register") return <PublicRegistration />;
  if (loading)
    return (
      <div className="hr-app">
        <main className="hr-main">
          <p role="status" className="panel">
            جارٍ التحقق من الجلسة…
          </p>
        </main>
      </div>
    );
  if (user && !user.must_change_password)
    return (
      <Suspense fallback={<p>جارٍ فتح لوحة العمل…</p>}>
        <Workspace user={user} onLogout={logout} />
      </Suspense>
    );
  return (
    <div className="hr-app">
      <main className="hr-main">
        <Link className="button" to="/">
          العودة للرئيسية
        </Link>
        <div className="panel auth">
          <div className="hr-brand">
            <img src="/branding/aei_wfp_hr_icon.jpg" alt="شعار أرض الإنسان" />
            <div>
              <h1>بوابة الموارد البشرية</h1>
              <small>أرض الإنسان · مشروع الغذاء العالمي</small>
            </div>
          </div>
          <p className="notice">
            {user
              ? "غيّر بيانات الدخول المؤقتة قبل بدء العمل."
              : "حسابات رسمية للموظفين والإدارة ومتابعة الموارد البشرية."}
          </p>
          {error && (
            <p role="alert" className="notice error">
              {error}
            </p>
          )}
          {user ? (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setBusy(true);
                setError("");
                try {
                  if (newPassword !== confirm)
                    throw new Error("تأكيد كلمة المرور غير مطابق");
                  await account("change_password", {
                    old_password: password,
                    new_password: newPassword,
                  });
                  setPassword("");
                  setNewPassword("");
                  setConfirm("");
                  await restore();
                } catch (err) {
                  setError(message(err));
                } finally {
                  setBusy(false);
                }
              }}
            >
              <label>
                كلمة المرور أو الرمز المؤقت
                <input
                  required
                  type="password"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label>
                {user.role === "employee"
                  ? "رمز PIN جديد (8 أرقام على الأقل)"
                  : "كلمة مرور جديدة (12 حرفًا على الأقل)"}
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  minLength={user.role === "employee" ? 8 : 12}
                  pattern={user.role === "employee" ? "[0-9]{8,12}" : undefined}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </label>
              <label>
                تأكيد القيمة الجديدة
                <input
                  required
                  type="password"
                  autoComplete="new-password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </label>
              <button className="primary" disabled={busy}>
                تغيير ومتابعة
              </button>
              <button type="button" onClick={() => void logout()}>
                خروج
              </button>
            </form>
          ) : (
            <form onSubmit={login}>
              <label>
                نوع الحساب
                <select
                  value={staff ? "employee" : "admin"}
                  onChange={(e) => {
                    setStaff(e.target.value === "employee");
                    setIdentifier("");
                    setPassword("");
                  }}
                >
                  <option value="admin">الإدارة والمتابعة</option>
                  <option value="employee">موظف — الهوية وPIN</option>
                </select>
              </label>
              <label>
                {staff ? "رقم الهوية" : "اسم الدخول أو البريد"}
                <input
                  required
                  autoComplete="username"
                  dir="ltr"
                  value={identifier}
                  pattern={staff ? "[0-9]{9}" : undefined}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </label>
              <label>
                {staff ? "رمز PIN" : "كلمة المرور"}
                <input
                  required
                  type={show ? "text" : "password"}
                  autoComplete="current-password"
                  dir="ltr"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </label>
              <label>
                <span>
                  <input
                    type="checkbox"
                    checked={show}
                    onChange={(e) => setShow(e.target.checked)}
                  />{" "}
                  إظهار كلمة المرور
                </span>
              </label>
              <button className="primary" disabled={busy}>
                {busy ? "جارٍ التحقق…" : "تسجيل الدخول"}
              </button>
              <small>
                {staff
                  ? "للموظف الحالي: استخدم الرمز المؤقت الذي تسلمته من الإدارة، ثم اختر PIN الخاص بك عند أول دخول. لاستعادة الوصول راجع الإدارة."
                  : "استخدم حساب الإدارة المعتمد. يمكنك تغيير كلمة المرور من داخل حسابك."}
              </small>
              {staff && (
                <Link to="/register">موظف جديد؟ سجّل بياناتك واختر PIN</Link>
              )}
            </form>
          )}
        </div>
        {!user && <LegacyBackup />}
      </main>
    </div>
  );
}
export function Application() {
  return (
    <BrowserRouter>
      <SessionApp />
    </BrowserRouter>
  );
}
