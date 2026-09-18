import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BrandLogo } from '../common/BrandLogo';
import { 
  UserCheck, 
  LogIn, 
  Menu, 
  X, 
  FileText, 
  UserPlus, 
  Calendar, 
  AlertCircle, 
  Building2, 
  Package, 
  ShieldCheck,
  LayoutDashboard, 
  Shield, 
  LogOut,
  User
} from 'lucide-react';
import { PortalModal } from '../common/PortalModal';
import { storageService } from '../../lib/storageService';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showPortalModal, setShowPortalModal] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const [adminSession, setAdminSession] = useState(storageService.getCurrentAdminSession());
  const [employeeSession, setEmployeeSession] = useState(storageService.getCurrentSession());
  
  const location = useLocation();
  const navigate = useNavigate();

  const updateNavbarState = () => {
    const emps = storageService.getPendingEmployees().length;
    const edits = storageService.getPendingUpdateRequests().length;
    const leaves = storageService.getLeaves().filter(l => l.status === 'معلق').length;
    const resignations = storageService.getResignations().filter(r => r.status === 'معلق').length;
    setPendingCount(emps + edits + leaves + resignations);
    
    setAdminSession(storageService.getCurrentAdminSession());
    setEmployeeSession(storageService.getCurrentSession());
  };

  useEffect(() => {
    updateNavbarState();
    const interval = setInterval(updateNavbarState, 2000);
    return () => clearInterval(interval);
  }, [location.pathname]);

  const handleAdminLogout = () => {
    storageService.logoutAdmin();
    setAdminSession(null);
    navigate('/login');
  };

  const handleEmployeeLogout = () => {
    storageService.clearSession();
    setEmployeeSession(null);
    navigate('/');
  };

  const isActive = (path: string) => location.pathname === path;

  interface NavLinkItem {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }

  // 1. روابط الزائر العام (Public / Guest Links)
  const publicLinks: NavLinkItem[] = [
    { name: 'الرئيسية', path: '/', icon: FileText },
    { name: 'تسجيل كادر', path: '/register', icon: UserPlus },
    { name: 'طلب إجازة', path: '/leave-request', icon: Calendar },
    { name: 'طلب استقالة', path: '/resignation', icon: AlertCircle },
  ];

  // 2. روابط الموظف الميداني المسجل دخوله (Employee Links)
  const employeeLinks: NavLinkItem[] = [
    { name: 'الرئيسية', path: '/', icon: FileText },
    { name: 'ملفي وبطاقتي (QR)', path: '/portal', icon: UserCheck },
    { name: 'طلب إجازة', path: '/leave-request', icon: Calendar },
    { name: 'طلب استقالة', path: '/resignation', icon: AlertCircle },
  ];

  // 3. روابط الإدارة والمشرفين (Admin & Supervisor Links)
  const adminLinks: NavLinkItem[] = [
    { name: 'لوحة التحكم', path: '/admin', icon: LayoutDashboard },
    { name: 'مركز الاعتمادات', path: '/admin/approvals', icon: ShieldCheck, badge: pendingCount },
    { name: 'النقاط والفرق', path: '/admin/points', icon: Building2 },
    { name: 'حصر الأصول والعهد', path: '/admin/assets', icon: Package },
  ];

  // تحديد الروابط المناسبة للحالة الحالية لمنع التداخل والازدحام
  const currentNavLinks: NavLinkItem[] = adminSession
    ? adminLinks
    : employeeSession
    ? employeeLinks
    : publicLinks;

  return (
    <>
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <BrandLogo size="md" />

            {/* Desktop Navigation Links - مرتبة بحسب الدور دون أي ازدحام */}
            <nav className="hidden md:flex items-center gap-1.5">
              {currentNavLinks.map((link) => {
                const Icon = link.icon;
                const active = isActive(link.path);
                return (
                  <Link
                    key={link.path}
                    to={link.path}
                    className={`relative flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                      active
                        ? 'bg-aei-purple text-white shadow-xs'
                        : 'text-slate-600 hover:text-aei-purple hover:bg-slate-100/80'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{link.name}</span>
                    {link.badge !== undefined && link.badge > 0 && (
                      <span className="px-1.5 py-0.2 rounded-full text-[9px] font-black bg-amber-400 text-slate-950 animate-pulse">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </nav>

            {/* أزرار الإجراءات في اليسار (مخصصة لكل دور بدقة) */}
            <div className="hidden sm:flex items-center gap-3">
              {/* الحالة أ: مسجل دخول كإداري / مشرف / منسقة */}
              {adminSession ? (
                <div className="flex items-center gap-2 bg-purple-50/80 border border-purple-200/80 rounded-2xl px-3.5 py-1.5">
                  <div className="w-8 h-8 rounded-xl bg-aei-purple text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <Shield className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-purple-950 leading-tight">
                      {adminSession.user.name}
                    </span>
                    <span className="block text-[10px] text-purple-700 font-bold leading-none mt-0.5">
                      {adminSession.user.role_display.split('(')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleAdminLogout}
                    className="mr-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="تسجيل الخروج الإداري"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : employeeSession ? (
                /* الحالة ب: مسجل دخول كموظف ميداني (عبر الـ PIN) */
                <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl px-3.5 py-1.5">
                  <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    <User className="w-4 h-4" />
                  </div>
                  <div className="text-right">
                    <span className="block text-xs font-black text-emerald-950 leading-tight">
                      {employeeSession.full_name_ar}
                    </span>
                    <span className="block text-[10px] text-emerald-700 font-bold leading-none mt-0.5">
                      كادر ميداني • {employeeSession.current_point_name?.split('-')[0]}
                    </span>
                  </div>
                  <button
                    onClick={handleEmployeeLogout}
                    className="mr-1 p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                    title="تسجيل الخروج من البوابة"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* الحالة ج: زائر عام غير مسجل - زرين واضحين ومرتبين فقط */
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowPortalModal(true)}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-aei-purple bg-aei-purple/10 hover:bg-aei-purple/20 border border-aei-purple/20 rounded-xl transition-all shadow-xs cursor-pointer"
                  >
                    <UserCheck className="w-4 h-4 text-aei-purple" />
                    <span>بوابة الكادر (PIN)</span>
                  </button>

                  <Link
                    to="/login"
                    className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-all shadow-sm cursor-pointer"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>دخول الإدارة</span>
                  </Link>
                </div>
              )}
            </div>

            {/* زر القائمة للشاشات الصغيرة */}
            <div className="flex md:hidden items-center gap-2">
              {!adminSession && !employeeSession && (
                <button
                  onClick={() => setShowPortalModal(true)}
                  className="p-2 text-aei-purple bg-aei-purple/10 rounded-lg"
                  title="بوابة الكادر"
                >
                  <UserCheck className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* القائمة المنسدلة للشاشات الصغيرة */}
        {isOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
            {currentNavLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`flex items-center justify-between px-4 py-2.5 rounded-xl text-xs font-bold ${
                  isActive(link.path)
                    ? 'bg-aei-purple text-white'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <link.icon className="w-4 h-4" />
                  <span>{link.name}</span>
                </div>
                {link.badge !== undefined && link.badge > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
                    {link.badge}
                  </span>
                )}
              </Link>
            ))}

            <div className="pt-3 border-t border-slate-100 space-y-2">
              {adminSession ? (
                <div className="flex items-center justify-between p-3 bg-purple-50 rounded-xl border border-purple-200">
                  <div>
                    <span className="text-xs font-black text-purple-900 block">{adminSession.user.name}</span>
                    <span className="text-[10px] text-purple-600 font-bold">{adminSession.user.role_display}</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleAdminLogout();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold"
                  >
                    خروج
                  </button>
                </div>
              ) : employeeSession ? (
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <div>
                    <span className="text-xs font-black text-emerald-900 block">{employeeSession.full_name_ar}</span>
                    <span className="text-[10px] text-emerald-600 font-bold">كادر ميداني</span>
                  </div>
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      handleEmployeeLogout();
                    }}
                    className="px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 text-xs font-bold"
                  >
                    خروج
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      setShowPortalModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-aei-purple/10 text-aei-purple font-bold text-xs"
                  >
                    <UserCheck className="w-4 h-4" />
                    دخول (PIN)
                  </button>
                  <Link
                    to="/login"
                    onClick={() => setIsOpen(false)}
                    className="w-full flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs"
                  >
                    <LogIn className="w-4 h-4" />
                    دخول الإدارة
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* نافذة التحقق الصارم بالـ PIN لبوابة الكادر */}
      {showPortalModal && (
        <PortalModal onClose={() => setShowPortalModal(false)} />
      )}
    </>
  );
};
