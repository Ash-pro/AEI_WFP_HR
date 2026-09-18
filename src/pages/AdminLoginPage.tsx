import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Lock, UserCheck, ArrowRight, LogOut, CheckCircle2, AlertCircle, KeyRound, Sparkles } from 'lucide-react';
import { storageService, PREDEFINED_ADMINS } from '../lib/storageService';
import { BrandLogo } from '../components/common/BrandLogo';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [currentSession, setCurrentSession] = useState(storageService.getCurrentAdminSession());

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!identifier.trim() || !password.trim()) {
      setErrorMsg('يرجى إدخال البريد الإلكتروني أو رقم الهوية وكلمة المرور / الرمز.');
      return;
    }

    const res = storageService.loginAdmin(identifier, password);
    if (res.success && res.user) {
      setSuccessMsg(`أهلاً بك، ${res.user.name} (${res.user.role_display})`);
      setCurrentSession(storageService.getCurrentAdminSession());
      setTimeout(() => {
        navigate('/admin');
      }, 700);
    } else {
      setErrorMsg(res.message);
    }
  };

  const handleQuickLogin = (adminUser: typeof PREDEFINED_ADMINS[0], defaultPass: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const loginId = adminUser.email || adminUser.national_id || '';
    const res = storageService.loginAdmin(loginId, defaultPass);
    if (res.success && res.user) {
      setSuccessMsg(`تم الدخول السريع: ${res.user.name}`);
      setCurrentSession(storageService.getCurrentAdminSession());
      setTimeout(() => {
        navigate('/admin');
      }, 500);
    }
  };

  const handleLogout = () => {
    storageService.logoutAdmin();
    setCurrentSession(null);
    setSuccessMsg('تم تسجيل الخروج بنجاح.');
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-slate-50">
      <div className="max-w-xl w-full space-y-6">
        {/* بطاقة الهوية والشعار */}
        <div className="text-center space-y-3">
          <div className="flex justify-center">
            <BrandLogo size="lg" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center justify-center gap-2">
            <Shield className="w-6 h-6 text-aei-purple" />
            بوابة الإدارة المركزية والرقابة الميدانية
          </h1>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            نظام إدارة الموارد البشرية واللوجستية - شراكة جمعية أرض الإنسان الخيرية مع برنامج الأغذية العالمي WFP
          </p>
        </div>

        {/* تنبيه إذا كان المستخدم مسجل دخوله مسبقاً */}
        {currentSession ? (
          <div className="bg-white rounded-3xl p-8 shadow-xl border border-emerald-100 text-center space-y-5">
            <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
              <UserCheck className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                جلسة إدارية نشطة
              </span>
              <h3 className="text-lg font-black text-slate-800 mt-2">{currentSession.user.name}</h3>
              <p className="text-xs text-slate-500 font-semibold">{currentSession.user.role_display}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
              <button
                onClick={() => navigate('/admin')}
                className="px-6 py-2.5 rounded-xl bg-aei-purple text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-opacity-95 shadow-md cursor-pointer"
              >
                الدخول للوحة التحكم
                <ArrowRight className="w-4 h-4 rotate-180" />
              </button>
              <button
                onClick={handleLogout}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-200 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                تبديل الحساب / تسجيل خروج
              </button>
            </div>
          </div>
        ) : (
          /* استمارة تسجيل الدخول */
          <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البريد الإلكتروني أو رقم الهوية (9 أرقام)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="مثال: ashraf.2lsalibi@gmail.com أو 402938682"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 focus:border-aei-purple"
                    dir="ltr"
                  />
                  <Shield className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  كلمة المرور أو رمز المرور (PIN)
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 focus:border-aei-purple"
                    dir="ltr"
                  />
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-aei-purple hover:bg-opacity-95 text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <KeyRound className="w-4 h-4" />
                تسجيل الدخول الإداري
              </button>
            </form>

            {/* أزرار الدخول السريع التجريبي لاختبار الأدوار والصلاحيات بسهولة */}
            <div className="border-t border-slate-100 pt-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-slate-700 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  تسجيل دخول تجريبي سريع (حسب الدور والصلاحيات):
                </span>
                <span className="text-[10px] text-slate-400 font-mono">1-Click RBAC</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* 1. سوبر أدمن */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[0], 'admin2026')}
                  className="text-right p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 hover:bg-purple-100/60 transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-purple-900 flex items-center justify-between">
                    <span>أ. أشرف الصليبي</span>
                    <span className="text-[9px] bg-purple-200 text-purple-800 px-1.5 py-0.5 rounded font-bold">سوبر أدمن</span>
                  </div>
                  <div className="text-[10px] text-purple-700">ashraf.2lsalibi@gmail.com</div>
                </button>

                {/* 2. المنسقة */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[1], 'amal2026')}
                  className="text-right p-2.5 rounded-xl border border-blue-200 bg-blue-50/60 hover:bg-blue-100/60 transition-colors cursor-pointer group"
                >
                  <div className="text-xs font-bold text-blue-900 flex items-center justify-between">
                    <span>أ. أمل عوض</span>
                    <span className="text-[9px] bg-blue-200 text-blue-800 px-1.5 py-0.5 rounded font-bold">منسقة المشروع</span>
                  </div>
                  <div className="text-[10px] text-blue-700">amal.awad@aei.ps</div>
                </button>

                {/* 3. مشرف أشرف */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[2], '2026')}
                  className="text-right p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>أشرف الصليبي</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">مشرف الوسطى</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">الهوية: 402938682</div>
                </button>

                {/* 4. مشرف براء */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[3], '2026')}
                  className="text-right p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>براء الأسطل</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">مشرف خانيونس</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">الهوية: 403703689</div>
                </button>

                {/* 5. مشرف هادي */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[4], '2026')}
                  className="text-right p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>هادي الأحول</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">مشرف غزة</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">الهوية: 411100480</div>
                </button>

                {/* 6. مشرفة ياسمين */}
                <button
                  type="button"
                  onClick={() => handleQuickLogin(PREDEFINED_ADMINS[5], '2026')}
                  className="text-right p-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <div className="text-xs font-bold text-slate-800 flex items-center justify-between">
                    <span>ياسمين النجيلي</span>
                    <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-bold">مشرفة رفح</span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">الهوية: 402963664</div>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
