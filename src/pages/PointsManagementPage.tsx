import React, { useState, useMemo, useEffect } from 'react';
import { PALESTINE_GOVERNORATES } from '../lib/constants';
import { REAL_SUPERVISORS, REAL_COORDINATOR } from '../lib/realData';
import { storageService, PREDEFINED_ADMINS } from '../lib/storageService';
import { WorkPoint, Employee, PointStatus, AdminSession, AdminUser } from '../lib/types';
import { 
  Building2, 
  MapPin, 
  Users, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  Filter, 
  ShieldCheck, 
  Layers, 
  Phone, 
  User, 
  Eye, 
  X, 
  Sparkles,
  ArrowRight,
  Stethoscope,
  HeartHandshake,
  Coins,
  Navigation,
  ExternalLink,
  Edit3,
  Power,
  AlertTriangle,
  XCircle,
  RotateCcw,
  Sliders,
  Check,
  Lock,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface SupervisorConfig {
  id: string;
  name: string;
  shortName: string;
  national_id: string;
  phone: string;
  role: string;
  zones: string;
  program: string;
  gradient: string;
  borderAccent: string;
  badgeBg: string;
  badgeText: string;
  lightBg: string;
}

const SUPERVISOR_CONFIGS: SupervisorConfig[] = [
  {
    id: 'sup-ashraf',
    name: 'أشرف أسامة دياب الصليبي',
    shortName: 'أشرف',
    national_id: '402938682',
    phone: '0598466903',
    role: 'مشرف ميداني معتمد',
    zones: 'المحافظة الوسطى، دير البلح، القرارة',
    program: 'BSFP (وقائي) + Cash (كاش)',
    gradient: 'from-purple-900 via-indigo-900 to-slate-900',
    borderAccent: 'border-purple-200 hover:border-purple-400',
    badgeBg: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeText: 'text-purple-600',
    lightBg: 'bg-purple-50/40'
  },
  {
    id: 'sup-baraa',
    name: 'براء محمد قاسم الاسطل',
    shortName: 'براء',
    national_id: '403703689',
    phone: '0592238075',
    role: 'مشرف ميداني معتمد',
    zones: 'محافظة الوسطى، البريج، غزة',
    program: 'BSFP (وقائي) + Cash (كاش)',
    gradient: 'from-emerald-900 via-teal-900 to-slate-900',
    borderAccent: 'border-emerald-200 hover:border-emerald-400',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeText: 'text-emerald-600',
    lightBg: 'bg-emerald-50/40'
  },
  {
    id: 'sup-hadi',
    name: 'هادي عيسى سعيد الأحول',
    shortName: 'هادي',
    national_id: '411100480',
    phone: '0597828787',
    role: 'مشرف ميداني معتمد',
    zones: 'الوسطى، خانيونس، غزة (العيادات العلاجية)',
    program: 'TSFP (علاجي سريري) + BSFP (وقائي)',
    gradient: 'from-blue-900 via-cyan-950 to-slate-900',
    borderAccent: 'border-blue-200 hover:border-blue-400',
    badgeBg: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeText: 'text-blue-600',
    lightBg: 'bg-blue-50/40'
  },
  {
    id: 'sup-yasmine',
    name: 'ياسمين مجدي محمد النجيلي',
    shortName: 'ياسمين',
    national_id: '402963664',
    phone: '0597233284',
    role: 'مشرفة ميدانية معتمدة',
    zones: 'محافظة خانيونس، رفح، مواصي خانيونس',
    program: 'BSFP (وقائي) + Cash (كاش)',
    gradient: 'from-rose-900 via-pink-950 to-slate-900',
    borderAccent: 'border-rose-200 hover:border-rose-400',
    badgeBg: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeText: 'text-rose-600',
    lightBg: 'bg-rose-50/40'
  },
  {
    id: 'sup-amal',
    name: 'أمل سمير اسماعيل عوض',
    shortName: 'أمل',
    national_id: '949827901',
    phone: '0599481714',
    role: 'منسقة المشروع (إدارة عليا)',
    zones: 'المقر الإداري الرئيسي - دير البلح (كافة المحافظات)',
    program: 'إدارة وتنسيق عام وشامل',
    gradient: 'from-slate-900 via-slate-800 to-purple-950',
    borderAccent: 'border-slate-300 hover:border-slate-500',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeText: 'text-slate-700',
    lightBg: 'bg-slate-50'
  }
];

export const PointsManagementPage: React.FC = () => {
  // بيانات النقاط المخزنة في النظام
  const [points, setPoints] = useState<WorkPoint[]>(() => storageService.getAllPoints());
  const allStaff = storageService.getAllEmployees();

  // جلسة الإدارة الحالية والصلاحيات RBAC
  const [adminSession, setAdminSession] = useState<AdminSession>(() => {
    const existing = storageService.getCurrentAdminSession();
    if (existing) return existing;
    const defaultSuper = PREDEFINED_ADMINS[0];
    const newSession: AdminSession = {
      user: defaultSuper,
      token: `token-admin-${Date.now()}`,
      login_at: new Date().toISOString()
    };
    localStorage.setItem('aei_wfp_admin_session_v2', JSON.stringify(newSession));
    return newSession;
  });

  const currentUser = adminSession.user;
  const isSuperAdmin = currentUser.role === 'سوبر_أدمن';
  const isCoordinator = currentUser.role === 'منسق_مشروع';
  const isSupervisor = currentUser.role === 'مشرف_ميداني';
  const canManageAllPoints = isSuperAdmin || isCoordinator;

  // فلاتر البحث
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('all');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('all');

  // نوافذ التحكم والمودال
  const [inspectingPoint, setInspectingPoint] = useState<WorkPoint | null>(null);
  const [editingPoint, setEditingPoint] = useState<WorkPoint | null>(null);
  const [statusModalPoint, setStatusModalPoint] = useState<WorkPoint | null>(null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  // حالة استمارة التعديل
  const [editForm, setEditForm] = useState<Partial<WorkPoint>>({});
  const [editError, setEditError] = useState<string | null>(null);

  // حالة استمارة تغيير الحالة
  const [targetStatus, setTargetStatus] = useState<PointStatus>('نشطة');
  const [statusReason, setStatusReason] = useState('');
  const [statusError, setStatusError] = useState<string | null>(null);

  // تحديث قائمة النقاط عند أي تغيير
  const refreshPoints = () => {
    setPoints(storageService.getAllPoints());
  };

  // التحقق هل المشرف الحالي مسؤول عن هذه النقطة
  const isPointUnderCurrentSupervisor = (pt: WorkPoint): boolean => {
    if (canManageAllPoints) return true;
    if (!isSupervisor) return false;
    const supField = (pt.supervisor || pt.supervisor_name || '').trim();
    return (
      supField.includes(currentUser.name) ||
      currentUser.name.includes(supField) ||
      (currentUser.national_id === '402938682' && supField.includes('أشرف')) ||
      (currentUser.national_id === '403703689' && supField.includes('براء')) ||
      (currentUser.national_id === '411100480' && supField.includes('هادي')) ||
      (currentUser.national_id === '402963664' && supField.includes('ياسمين'))
    );
  };

  // التحقق من صلاحية تعديل النقطة
  const canEditPoint = (pt: WorkPoint): boolean => {
    if (canManageAllPoints) return true;
    return isPointUnderCurrentSupervisor(pt);
  };

  // جلب الكوادر العاملة في نقطة معينة بحسب المشرف المسؤول
  const getPointStaff = (pt: WorkPoint): Employee[] => {
    return allStaff.filter((e) => {
      if (pt.id === 'pt-admin') {
        return e.category === 'منسق' || e.supervisor_name?.includes('إداري') || e.department === 'إدارة عليا';
      }
      if (e.current_point_id === pt.id) {
        return true;
      }
      const nameMatch = (
        e.current_point_name === pt.name ||
        (e.current_point_name && pt.name.includes(e.current_point_name)) ||
        (e.current_point_name && e.current_point_name.includes(pt.name))
      );
      if (!nameMatch) return false;

      const ptSup = (pt.supervisor || pt.supervisor_name || '');
      const empSup = (e.supervisor_name || '');
      if (pt.is_shared) {
        return (
          (ptSup.includes('هادي') && empSup.includes('هادي')) ||
          (ptSup.includes('أشرف') && empSup.includes('أشرف')) ||
          (ptSup.includes('براء') && empSup.includes('براء')) ||
          (ptSup.includes('ياسمين') && empSup.includes('ياسمين'))
        );
      }
      return true;
    });
  };

  // جلب الكوادر الشريكة في النقطة المشتركة (مثلاً كوادر هادي العلاجية عند عرض نقطة المشرف الوقائي، أو العكس)
  const getPartnerStaff = (pt: WorkPoint): Employee[] => {
    if (!pt.is_shared) return [];
    return allStaff.filter((e) => {
      const nameMatch = (
        e.current_point_name === pt.name ||
        (e.current_point_name && pt.name.includes(e.current_point_name)) ||
        (e.current_point_name && e.current_point_name.includes(pt.name))
      );
      if (!nameMatch) return false;

      const ptSup = (pt.supervisor || pt.supervisor_name || '');
      const empSup = (e.supervisor_name || '');
      if (ptSup.includes('هادي')) {
        return !empSup.includes('هادي');
      } else {
        return empSup.includes('هادي');
      }
    });
  };

  // تصفية كتل المشرفين بحسب الصلاحيات RBAC:
  // "كل مشرف تعرض فقط نقاطه وتعدل فقط في نقاطه، والسوبر ادمن والمنسقة تظهر كافة الصلاحيات لكافة النقاط"
  const accessibleSupervisorConfigs = useMemo(() => {
    if (canManageAllPoints) {
      return SUPERVISOR_CONFIGS;
    }
    // للمشرف الميداني: نعرض فقط كتلته هو الخاصة به
    return SUPERVISOR_CONFIGS.filter((sup) => {
      return (
        sup.national_id === currentUser.national_id ||
        currentUser.name.includes(sup.shortName) ||
        sup.name.includes(currentUser.name)
      );
    });
  }, [canManageAllPoints, currentUser]);

  // تصفية النقاط بحسب معايير البحث والفلترة والصلاحيات
  const filteredPoints = useMemo(() => {
    return points.filter((pt) => {
      // للمشرف الميداني: حصر النقاط المعروضة بنقاطه فقط
      if (isSupervisor && !isPointUnderCurrentSupervisor(pt)) {
        return false;
      }

      const matchSearch = 
        pt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (pt.point_area && pt.point_area.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (pt.address_details && pt.address_details.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (pt.supervisor && pt.supervisor.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchZone = selectedZone === 'all' || pt.geo_zone === selectedZone;
      const matchProg = selectedProgram === 'all' || pt.programs_supported.includes(selectedProgram);
      const ptStatus = pt.status || 'نشطة';
      const matchStatus = selectedStatusFilter === 'all' || ptStatus === selectedStatusFilter;
      
      return matchSearch && matchZone && matchProg && matchStatus;
    });
  }, [points, isSupervisor, currentUser, searchTerm, selectedZone, selectedProgram, selectedStatusFilter]);

  // تجميع النقاط تحت المشرفين المتاحين بحسب الصلاحية
  const groupedSupervisors = useMemo(() => {
    return accessibleSupervisorConfigs.map((sup) => {
      const supervisorPoints = filteredPoints.filter((pt) => {
        const supField = (pt.supervisor || pt.supervisor_name || '').trim();
        return supField.includes(sup.shortName);
      });

      const totalSupervisorStaff = supervisorPoints.reduce((acc, pt) => {
        return acc + getPointStaff(pt).length;
      }, 0);

      const tsfpPointsCount = supervisorPoints.filter(p => p.programs_supported.includes('TSFP')).length;
      const bsfpPointsCount = supervisorPoints.filter(p => p.programs_supported.includes('BSFP')).length;
      const sharedPointsCount = supervisorPoints.filter(p => p.is_shared || (p.programs_supported.includes('TSFP') && p.programs_supported.includes('BSFP'))).length;
      const activeCount = supervisorPoints.filter(p => (p.status || 'نشطة') === 'نشطة').length;
      const suspendedCount = supervisorPoints.filter(p => p.status === 'معلقة_مؤقتاً').length;
      const closedCount = supervisorPoints.filter(p => p.status === 'مغلقة').length;

      return {
        ...sup,
        points: supervisorPoints,
        totalStaff: totalSupervisorStaff,
        tsfpPointsCount,
        bsfpPointsCount,
        sharedPointsCount,
        activeCount,
        suspendedCount,
        closedCount
      };
    }).filter((group) => {
      if (selectedSupervisorId !== 'all') {
        return group.id === selectedSupervisorId;
      }
      if (searchTerm.trim() || selectedZone !== 'all' || selectedProgram !== 'all' || selectedStatusFilter !== 'all') {
        return group.points.length > 0;
      }
      return true;
    });
  }, [filteredPoints, accessibleSupervisorConfigs, selectedSupervisorId, searchTerm, selectedZone, selectedProgram, selectedStatusFilter]);

  // إحصائيات عامة للنقاط والعيادات المعتمدة في النظام
  const totalLocationsCount = useMemo(() => {
    // عدد المواقع الجغرافية الفعلية (28 ميدانية + 1 إدارة = 29)
    const set = new Set(points.map(p => p.shared_base_point_id || p.id));
    return set.size;
  }, [points]);

  // عيادات ونقاط TSFP (علاجي سريري): 4 مخصصة + 5 مشتركة = 9
  const tsfpClinicsCount = useMemo(() => {
    return points.filter(p => (p.supervisor?.includes('هادي') || p.supervisor_name?.includes('هادي')) && p.programs_supported?.includes('TSFP')).length;
  }, [points]);

  // نقاط وقائي وكاش BSFP: 19 مخصصة + 5 مشتركة = 24
  const bsfpPointsCount = useMemo(() => {
    return points.filter(p => p.programs_supported?.includes('BSFP') && !p.id.endsWith('-hadi')).length;
  }, [points]);

  const totalPointsCount = points.length;
  const activePointsCount = points.filter(p => (p.status || 'نشطة') === 'نشطة').length;
  const suspendedPointsCount = points.filter(p => p.status === 'معلقة_مؤقتاً').length;
  const closedPointsCount = points.filter(p => p.status === 'مغلقة').length;

  // تبديل الحساب الإداري (للمعاينة السريعة واختبار الصلاحيات)
  const switchRole = (admin: AdminUser) => {
    const newSession: AdminSession = {
      user: admin,
      token: `token-sim-${Date.now()}`,
      login_at: new Date().toISOString()
    };
    localStorage.setItem('aei_wfp_admin_session_v2', JSON.stringify(newSession));
    setAdminSession(newSession);
    setSelectedSupervisorId('all');
    setActionSuccessMsg(`تم التبديل إلى حساب: ${admin.name} (${admin.role_display})`);
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  // فتح نافذة تعديل بيانات النقطة
  const handleOpenEditModal = (pt: WorkPoint) => {
    if (!canEditPoint(pt)) {
      alert('عذراً، ليس لديك صلاحية لتعديل هذه النقطة.');
      return;
    }
    setEditingPoint(pt);
    setEditForm({
      name: pt.name,
      governorate: pt.governorate,
      geo_zone: pt.geo_zone,
      point_area: pt.point_area,
      address_details: pt.address_details,
      latitude: pt.latitude,
      longitude: pt.longitude,
      supervisor: pt.supervisor,
      programs_supported: [...pt.programs_supported],
      notes: pt.notes || ''
    });
    setEditError(null);
  };

  // حفظ تعديلات النقطة
  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPoint) return;

    if (!editForm.name?.trim()) {
      setEditError('اسم النقطة إلزامي.');
      return;
    }
    if (!editForm.address_details?.trim()) {
      setEditError('العنوان الجغرافي التفصيلي إلزامي.');
      return;
    }
    if (!editForm.programs_supported || editForm.programs_supported.length === 0) {
      setEditError('يجب اختيار برنامج غذائي واحد على الأقل مدعوم في هذه النقطة.');
      return;
    }

    const res = storageService.updatePoint(
      editingPoint.id,
      {
        ...editForm,
        supervisor_name: editForm.supervisor
      },
      `${currentUser.name} (${currentUser.role_display})`
    );

    if (res.success) {
      refreshPoints();
      setEditingPoint(null);
      setActionSuccessMsg(`تم حفظ وتحديث بيانات نقطة (${editForm.name}) بنجاح.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } else {
      setEditError(res.message);
    }
  };

  // فتح نافذة التحكم في الحالة التشغيلية
  const handleOpenStatusModal = (pt: WorkPoint) => {
    if (!canEditPoint(pt)) {
      alert('عذراً، ليس لديك صلاحية لتعديل حالة هذه النقطة.');
      return;
    }
    setStatusModalPoint(pt);
    setTargetStatus(pt.status || 'نشطة');
    setStatusReason(pt.status_reason || '');
    setStatusError(null);
  };

  // حفظ الحالة التشغيلية الجديدة
  const handleSaveStatus = (e: React.FormEvent) => {
    e.preventDefault();
    if (!statusModalPoint) return;

    if (targetStatus !== 'نشطة' && !statusReason.trim()) {
      setStatusError('يرجى كتابة سبب التعليق أو الإغلاق التشغيلي للنقطة لتوثيق القرار الإداري.');
      return;
    }

    const res = storageService.setPointStatus(
      statusModalPoint.id,
      targetStatus,
      statusReason,
      `${currentUser.name} (${currentUser.role_display})`
    );

    if (res.success) {
      refreshPoints();
      setStatusModalPoint(null);
      const statusTitle = targetStatus === 'نشطة' ? 'تفعيل وتشغيل' : targetStatus === 'معلقة_مؤقتاً' ? 'تعليق مؤقت للعمل' : 'إغلاق النقطة';
      setActionSuccessMsg(`تم تغيير حالة نقطة (${statusModalPoint.name}) إلى [${statusTitle}] بنجاح.`);
      setTimeout(() => setActionSuccessMsg(null), 3500);
    } else {
      setStatusError(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* إشعار نجاح العمليات */}
      {actionSuccessMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-bold flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2.5">
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
          <button onClick={() => setActionSuccessMsg(null)} className="text-emerald-600 hover:text-emerald-900 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* شريط الجلسة والصلاحيات والتبديل السريع (RBAC Role Switcher Banner) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-white shrink-0 ${
            isSuperAdmin ? 'bg-gradient-to-br from-purple-700 to-indigo-800' :
            isCoordinator ? 'bg-gradient-to-br from-slate-800 to-purple-900' :
            'bg-gradient-to-br from-emerald-600 to-teal-800'
          }`}>
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400 font-bold">أنت متصل حالياً بصلاحية:</span>
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black ${
                isSuperAdmin ? 'bg-purple-100 text-purple-800 border border-purple-200' :
                isCoordinator ? 'bg-slate-100 text-slate-800 border border-slate-300' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                {currentUser.role_display}
              </span>
            </div>
            <h3 className="text-sm font-black text-slate-900">{currentUser.name}</h3>
            <p className="text-[11px] text-slate-500">
              {canManageAllPoints 
                ? '⭐ صلاحية شاملة: يمكنك عرض وتعديل بيانات وحالة كافة النقاط والعيادات لجميع المشرفين.' 
                : '📍 صلاحية مقيدة: تُعرض فقط نقاطك الميدانية الخاصة وتملك صلاحية التعديل عليها فقط.'}
            </p>
          </div>
        </div>

        {/* محاكي تبديل الصلاحيات السريع للفحص الفوري */}
        <div className="flex flex-wrap items-center gap-1.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-100">
          <span className="text-[11px] font-bold text-slate-400 ml-1">تبديل الحساب للمعاينة:</span>
          {PREDEFINED_ADMINS.map((admin) => {
            const isActive = currentUser.national_id === admin.national_id && currentUser.role === admin.role;
            return (
              <button
                key={admin.id}
                onClick={() => switchRole(admin)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs ring-2 ring-purple-400'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                title={`التبديل إلى ${admin.role_display}`}
              >
                <span>{admin.role === 'سوبر_أدمن' ? '👑' : admin.role === 'منسق_مشروع' ? '📋' : '📍'}</span>
                <span>{admin.name.split(' ')[0]}</span>
                <span className="text-[9px] opacity-70">({admin.role === 'سوبر_أدمن' ? 'سوبر' : admin.role === 'منسق_مشروع' ? 'منسقة' : 'مشرف'})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* الترويسة الرئيسية والروابط */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-aei-purple border border-purple-200">
            <Building2 className="w-3.5 h-3.5" />
            الهيكل التنظيمي والتحكم التشغيلي بالنقاط
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            إدارة نقاط التوزيع والعيادات التغذوية
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            تحكم شامل في بيانات النقاط وإحداثياتها، التعليق المؤقت، الإغلاق وإعادة التفعيل بحسب صلاحيات المشرفين
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <a
            href="/admin"
            className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            لوحة التحكم
          </a>
          <a
            href="/admin/assets"
            className="px-4 py-2.5 rounded-xl bg-aei-purple hover:bg-opacity-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Layers className="w-4 h-4" />
            حصر الأصول والعهد
          </a>
        </div>
      </div>

      {/* كروت الإحصائيات السريعة للنقاط والعيادات التغذوية */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. إجمالي النقاط والمقار */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">إجمالي النقاط والمقار</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">{totalLocationsCount}</span>
            <span className="text-xs font-bold text-purple-700">موقعاً جغرافياً</span>
          </div>
          <span className="text-[10px] text-slate-500 block">28 ميدانية + 1 إدارة (33 نقطة للمشرفين)</span>
        </div>

        {/* 2. المشرفون الميدانيون */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-1">
          <span className="text-xs font-bold text-slate-400 block">المشرفون الميدانيون</span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900">4</span>
            <span className="text-xs font-bold text-slate-700">مشرفين معتمدين</span>
          </div>
          <span className="text-[10px] text-slate-500 block">+ منسقة المشروع (إدارة عليا)</span>
        </div>

        {/* 3. عيادات TSFP (علاجي) */}
        <div className="bg-white p-5 rounded-2xl border border-rose-200 shadow-2xs space-y-1 bg-rose-50/25">
          <span className="text-xs font-bold text-rose-700 flex items-center gap-1.5">
            <Stethoscope className="w-4 h-4 text-rose-600" />
            عيادات TSFP (علاجي)
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-rose-700">{tsfpClinicsCount}</span>
            <span className="text-xs font-bold text-rose-800">عيادات ونقاط</span>
          </div>
          <span className="text-[10px] text-rose-600 block">4 مخصصة + 5 مشتركة مع BSFP</span>
        </div>

        {/* 4. نقاط وقائي وكاش BSFP */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-2xs space-y-1 bg-emerald-50/25">
          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
            <HeartHandshake className="w-4 h-4 text-emerald-600" />
            نقاط وقائي وكاش BSFP
          </span>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-700">{bsfpPointsCount}</span>
            <span className="text-xs font-bold text-emerald-800">نقطة توزيع</span>
          </div>
          <span className="text-[10px] text-emerald-600 block">19 مخصصة + 5 مشتركة مع TSFP</span>
        </div>
      </div>

      {/* شريط الجاهزية والحالة التشغيلية الميدانية */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-3.5 px-5 rounded-2xl border border-slate-200/80 shadow-2xs">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-slate-500">مؤشرات الجاهزية التشغيلية للنقاط:</span>
        </div>
        <div className="flex items-center gap-4 text-xs font-bold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            <span>نشطة وتعمل: {activePointsCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-700">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
            <span>معلقة مؤقتاً: {suspendedPointsCount}</span>
          </div>
          <div className="flex items-center gap-1.5 text-rose-700">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
            <span>مغلقة: {closedPointsCount}</span>
          </div>
        </div>
      </div>

      {/* بطاقة قواعد حوكمة البروتوكول التغذوي المعتمد */}
      <div className="p-5 rounded-3xl bg-gradient-to-l from-slate-900 via-indigo-950 to-purple-950 text-white shadow-md border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shrink-0 mt-0.5">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-black text-amber-300">
              قواعد حوكمة البرامج التغذوية الصارمة (Strict Protocol Separation)
            </h3>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed max-w-3xl">
              • <strong>عيادات TSFP (علاجي سريري):</strong> علاج سوء التغذية الحاد والمتوسط — يُحظر دمج توزيع الكاش أو المساعدات الوقائية بها.<br />
              • <strong>نقاط BSFP (وقائي + كاش):</strong> برامج التغذية الوقائية العامة والمساعدات النقدية الرقمية المشتركة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" />
            TSFP علاجي
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            BSFP وقائي
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold flex items-center gap-1">
            <Coins className="w-3.5 h-3.5" />
            Cash كاش
          </span>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* شريط البحث والفلاتر */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* البحث النصي */}
          <div className="relative">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم النقطة، الحي، المشرف، العنوان..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-aei-purple/20 focus:border-aei-purple"
            />
          </div>

          {/* فلتر المحافظة / المنطقة */}
          <div>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">كافة المناطق والمحافظات</option>
              <option value="الوسطى">الوسطى (دير البلح والنصيرات)</option>
              <option value="خانيونس">خان يونس والمواصي</option>
              <option value="غزة">غزة وشمال غزة</option>
              <option value="رفح">رفح</option>
              <option value="إداري">المكتب الإداري والتنسيق</option>
            </select>
          </div>

          {/* فلتر البرنامج التغذوي */}
          <div>
            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">كافة البرامج التغذوية</option>
              <option value="TSFP">عيادات TSFP (علاجي سريري فقط)</option>
              <option value="BSFP">نقاط BSFP (وقائي)</option>
              <option value="Cash">نقاط توزيع Cash (كاش)</option>
            </select>
          </div>

          {/* فلتر الحالة التشغيلية */}
          <div>
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">كافة الحالات التشغيلية</option>
              <option value="نشطة">🟢 نشطة وتعمل فقط</option>
              <option value="معلقة_مؤقتاً">🟡 معلقة مؤقتاً للعمل</option>
              <option value="مغلقة">🔴 مغلقة حالياً</option>
            </select>
          </div>
        </div>

        {/* أزرار التبديل السريع بين كتل المشرفين المتاحة بحسب الصلاحية */}
        {canManageAllPoints && (
          <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 ml-2">فلترة سريعة بحسب المشرف:</span>
            <button
              onClick={() => setSelectedSupervisorId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSupervisorId === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              عرض كافة المشرفين ({points.length} نقطة)
            </button>
            {accessibleSupervisorConfigs.map((sup) => (
              <button
                key={sup.id}
                onClick={() => setSelectedSupervisorId(sup.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedSupervisorId === sup.id
                    ? 'bg-aei-purple text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                }`}
              >
                {sup.name} ({sup.shortName})
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* عرض كتل المشرفين المتميزة (كل مشرف وتحته كافة النقاط التابعة له) */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        {groupedSupervisors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لا توجد نقاط مطابقة لمعايير البحث أو الصلاحية الحالية</h3>
            <p className="text-xs text-slate-400">يرجى تعديل مصطلح البحث أو الفلاتر المختارة.</p>
          </div>
        ) : (
          groupedSupervisors.map((group) => (
            <section 
              key={group.id} 
              className="bg-white rounded-3xl p-6 sm:p-7 shadow-sm border border-slate-100 space-y-6 relative overflow-hidden"
            >
              {/* الترويسة القيادية لكتلة المشرف (Supervisor Hero Card) */}
              <div className={`rounded-2xl p-5 sm:p-6 bg-gradient-to-r ${group.gradient} text-white shadow-md relative overflow-hidden`}>
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-white flex items-center justify-center font-black text-xl shrink-0 shadow-inner">
                      {group.name.charAt(0)}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h2 className="text-lg sm:text-xl font-black tracking-tight">{group.name}</h2>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-white/20 text-white border border-white/30">
                          {group.role}
                        </span>
                      </div>
                      <div className="text-xs text-slate-300 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-mono" dir="ltr">
                          <Phone className="w-3.5 h-3.5 text-amber-400" />
                          <a href={`tel:${group.phone}`} className="hover:underline text-slate-200">
                            {group.phone}
                          </a>
                        </span>
                        <span>•</span>
                        <span className="text-slate-200 font-semibold">{group.zones}</span>
                      </div>
                      <p className="text-[11px] text-slate-300/90 pt-0.5">
                        <span className="font-bold text-amber-300">البرامج الإشرافية:</span> {group.program}
                      </p>
                    </div>
                  </div>

                  {/* شارات الإحصائيات الخاصة بالمشرف */}
                  <div className="flex items-center gap-2.5 flex-wrap shrink-0">
                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[80px]">
                      <span className="block text-lg font-black text-white">{group.points.length}</span>
                      <span className="text-[10px] text-slate-300 font-bold">نقاط تابعة</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[80px]">
                      <span className="block text-lg font-black text-amber-300">{group.totalStaff}</span>
                      <span className="text-[10px] text-slate-300 font-bold">كادراً ميدانياً</span>
                    </div>

                    {group.activeCount > 0 && (
                      <div className="bg-emerald-500/20 backdrop-blur-md px-3 py-2 rounded-xl border border-emerald-400/30 text-center">
                        <span className="block text-sm font-black text-emerald-200">{group.activeCount}</span>
                        <span className="text-[9px] text-emerald-300 font-bold">نشطة</span>
                      </div>
                    )}

                    {group.suspendedCount > 0 && (
                      <div className="bg-amber-500/20 backdrop-blur-md px-3 py-2 rounded-xl border border-amber-400/30 text-center">
                        <span className="block text-sm font-black text-amber-200">{group.suspendedCount}</span>
                        <span className="text-[9px] text-amber-300 font-bold">معلقة</span>
                      </div>
                    )}

                    {group.closedCount > 0 && (
                      <div className="bg-rose-500/20 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-400/30 text-center">
                        <span className="block text-sm font-black text-rose-200">{group.closedCount}</span>
                        <span className="text-[9px] text-rose-300 font-bold">مغلقة</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* شبكة النقاط التابعة لهذا المشرف */}
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <h3 className="text-xs font-black text-slate-700 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-aei-purple" />
                    <span>النقاط والعيادات الميدانية التابعة لإشراف ({group.name.split(' ')[0]}):</span>
                  </h3>
                  <span className="text-[11px] font-bold text-slate-400 font-mono">
                    {group.points.length} نقاط مسجلة
                  </span>
                </div>

                {group.points.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-400 font-bold">
                    لا توجد نقاط مطابقة للمشرف بحسب معايير البحث الحالية
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {group.points.map((pt) => {
                      const staffInPoint = getPointStaff(pt);
                      const partnerStaff = getPartnerStaff(pt);
                      const isShared = Boolean(pt.is_shared || (pt.programs_supported?.includes('TSFP') && pt.programs_supported?.includes('BSFP')));
                      const isDedicatedTsfp = pt.programs_supported?.includes('TSFP') && !pt.programs_supported?.includes('BSFP');
                      const ptStatus = pt.status || 'نشطة';
                      const isPointActive = ptStatus === 'نشطة';
                      const isPointSuspended = ptStatus === 'معلقة_مؤقتاً';
                      const isPointClosed = ptStatus === 'مغلقة';
                      const userCanEdit = canEditPoint(pt);

                      return (
                        <div
                          key={pt.id}
                          className={`rounded-2xl p-5 border transition-all flex flex-col justify-between space-y-4 group ${
                            isPointSuspended
                              ? 'bg-amber-50/40 border-amber-200 hover:border-amber-400 shadow-2xs'
                              : isPointClosed
                              ? 'bg-rose-50/40 border-rose-200 hover:border-rose-400 opacity-90'
                              : 'bg-slate-50/70 hover:bg-white border-slate-200/90 hover:border-aei-purple/40 hover:shadow-md'
                          }`}
                        >
                          <div className="space-y-3">
                            {/* شارة المعرف والمنطقة وشارة الحالة التشغيلية */}
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 block shadow-2xs">
                                {pt.geo_zone} • {pt.point_area}
                              </span>

                              {/* شارة الحالة التشغيلية البارزة */}
                              <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border flex items-center gap-1 ${
                                isPointActive
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                  : isPointSuspended
                                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                  : 'bg-rose-100 text-rose-900 border-rose-300'
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${
                                  isPointActive ? 'bg-emerald-600' : isPointSuspended ? 'bg-amber-600' : 'bg-rose-600'
                                }`} />
                                {isPointActive ? 'نشطة وتعمل' : isPointSuspended ? 'تعليق مؤقت' : 'مغلقة'}
                              </span>
                            </div>

                            {/* اسم النقطة وكودها */}
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1">
                                <h4 className="text-sm font-black text-slate-900 group-hover:text-aei-purple transition-colors leading-snug">
                                  {pt.name}
                                </h4>
                                <span className="font-mono text-[10px] font-black text-slate-400 group-hover:text-aei-purple transition-colors shrink-0">
                                  {pt.id}
                                </span>
                              </div>

                              {/* شريط تنبيه إذا كانت النقطة معلقة أو مغلقة */}
                              {!isPointActive && (
                                <div className={`p-2 rounded-xl text-[11px] font-bold border my-1.5 flex items-start gap-1.5 ${
                                  isPointSuspended ? 'bg-amber-100/90 text-amber-950 border-amber-300' : 'bg-rose-100/90 text-rose-950 border-rose-300'
                                }`}>
                                  <AlertCircle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                                  <div className="leading-tight">
                                    <span className="block text-[10px] opacity-80">
                                      {isPointSuspended ? 'سبب التعليق المؤقت:' : 'سبب الإغلاق:'}
                                    </span>
                                    <span>{pt.status_reason || 'قرار إداري معتمد'}</span>
                                    {pt.status_updated_by && (
                                      <span className="block text-[9px] text-slate-500 mt-0.5">
                                        بواسطة: {pt.status_updated_by}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>

                            {/* شارات البرامج التغذوية المعتمدة والتمييز البارز للنقاط المشتركة */}
                            <div className="space-y-2">
                              {isShared ? (
                                <div className="space-y-1.5">
                                  <div className="flex flex-wrap items-center gap-1.5">
                                    <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-purple-700 via-rose-600 to-emerald-600 text-white shadow-xs flex items-center gap-1">
                                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
                                      TSFP + BSFP (مشتركة)
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                                      <Stethoscope className="w-3 h-3" />
                                      علاجي TSFP
                                    </span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                                      <HeartHandshake className="w-3 h-3" />
                                      وقائي BSFP
                                    </span>
                                  </div>
                                  <div className="text-[10px] font-bold text-slate-600 bg-purple-50/70 border border-purple-200/70 p-1.5 rounded-lg flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-purple-600 shrink-0"></span>
                                    <span>
                                      {pt.supervisor?.includes('هادي') ? (
                                        <>عيادة علاجي TSFP مشتركة مع فريق الوقائي: <strong className="text-purple-900">{pt.partner_supervisor || 'الوقائي'}</strong></>
                                      ) : (
                                        <>مركز وقائي BSFP مشترك مع: <strong className="text-rose-900">هادي الأحول (عيادة TSFP علاجية)</strong></>
                                      )}
                                    </span>
                                  </div>
                                </div>
                              ) : isDedicatedTsfp ? (
                                <div className="flex flex-wrap gap-1.5">
                                  <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 flex items-center gap-1">
                                    <Stethoscope className="w-3.5 h-3.5 text-rose-600" />
                                    عيادة TSFP (علاجي سريري مخصص)
                                  </span>
                                </div>
                              ) : (
                                <div className="flex flex-wrap gap-1.5">
                                  {pt.programs_supported.map((prog, idx) => (
                                    <span
                                      key={idx}
                                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                                        prog === 'TSFP'
                                          ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                          : prog === 'Cash'
                                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                          : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                      }`}
                                    >
                                      {prog === 'TSFP' ? 'علاجي TSFP' : prog === 'Cash' ? 'كاش Cash' : 'وقائي BSFP'}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>

                            {/* عنوان النقطة وإحداثياتها */}
                            <div className="pt-2 border-t border-slate-200/70 space-y-2">
                              {/* 1. عنوان النقطة */}
                              <div className="flex items-start gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200/80 shadow-2xs">
                                <MapPin className="w-4 h-4 text-aei-purple shrink-0 mt-0.5" />
                                <div className="space-y-0.5 min-w-0 flex-1">
                                  <span className="text-[10px] text-slate-400 block font-bold leading-none">عنوان النقطة:</span>
                                  <span className="font-bold text-slate-800 text-xs leading-relaxed block break-words">
                                    {pt.address_details}
                                  </span>
                                </div>
                              </div>

                              {/* 2. إحداثيات النقطة */}
                              <div className="flex items-center justify-between gap-2 bg-emerald-50/70 p-2 rounded-xl border border-emerald-200/70 text-xs">
                                <div className="flex items-center gap-1.5 min-w-0">
                                  <Navigation className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <div className="min-w-0">
                                    <span className="text-[9px] text-emerald-800 font-bold block leading-none">إحداثيات النقطة:</span>
                                    <span className="font-mono text-[11px] font-black text-emerald-950 block pt-0.5" dir="ltr">
                                      {pt.latitude ? `${pt.latitude.toFixed(4)}, ${pt.longitude?.toFixed(4)}` : 'غير محدد'}
                                    </span>
                                  </div>
                                </div>

                                {pt.latitude && pt.longitude && (
                                  <a
                                    href={`https://maps.google.com/?q=${pt.latitude},${pt.longitude}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all shrink-0 shadow-2xs cursor-pointer"
                                    title="فتح الموقع على خرائط Google"
                                  >
                                    <span>خرائط Google</span>
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                )}
                              </div>
                            </div>

                            {/* بيانات الكادر العامل في النقطة */}
                            <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1.5">
                              <div className="flex items-center justify-between text-slate-600">
                                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                                  <Users className="w-3.5 h-3.5" />
                                  كادر المشرف ({group.shortName}):
                                </span>
                                <span className="font-black text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px]">
                                  {staffInPoint.length} كادر
                                </span>
                              </div>

                              {isShared && partnerStaff.length > 0 && (
                                <div className="flex items-center justify-between text-slate-500 bg-purple-50/50 p-1.5 rounded-lg border border-purple-100 text-[10px]">
                                  <span className="flex items-center gap-1 font-bold text-purple-900">
                                    <Sparkles className="w-3 h-3 text-purple-600 shrink-0" />
                                    <span>كادر الشريك ({pt.supervisor?.includes('هادي') ? pt.partner_supervisor : 'هادي الأحول'}):</span>
                                  </span>
                                  <span className="font-black text-purple-950 px-1.5 py-0.5 rounded bg-white border border-purple-200">
                                    +{partnerStaff.length} كادر
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* أزرار الإجراءات والتحكم الكامل بالنقطة */}
                          <div className="pt-3 border-t border-slate-200/70 space-y-2">
                            {userCanEdit && (
                              <div className="grid grid-cols-2 gap-2">
                                {/* زر تعديل بيانات النقطة */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenEditModal(pt)}
                                  className="py-2 px-2.5 rounded-xl bg-purple-50 hover:bg-aei-purple text-aei-purple hover:text-white border border-purple-200 hover:border-aei-purple font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                  <span>تعديل النقطة</span>
                                </button>

                                {/* زر التحكم بالحالة (تعليق مؤقت / إغلاق / تفعيل) */}
                                <button
                                  type="button"
                                  onClick={() => handleOpenStatusModal(pt)}
                                  className={`py-2 px-2.5 rounded-xl border font-bold text-[11px] transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs ${
                                    isPointActive
                                      ? 'bg-amber-50 hover:bg-amber-600 text-amber-800 hover:text-white border-amber-200 hover:border-amber-600'
                                      : isPointSuspended
                                      ? 'bg-emerald-50 hover:bg-emerald-600 text-emerald-800 hover:text-white border-emerald-200 hover:border-emerald-600'
                                      : 'bg-rose-50 hover:bg-rose-600 text-rose-800 hover:text-white border-rose-200 hover:border-rose-600'
                                  }`}
                                >
                                  <Sliders className="w-3.5 h-3.5" />
                                  <span>{isPointActive ? 'تعليق / إغلاق' : 'تغيير الحالة'}</span>
                                </button>
                              </div>
                            )}

                            {/* زر استعراض كوادر النقطة */}
                            <button
                              type="button"
                              onClick={() => setInspectingPoint(pt)}
                              className="w-full py-2 rounded-xl bg-white hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-200 hover:border-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>استعراض كوادر النقطة ({staffInPoint.length})</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </section>
          ))
        )}
      </div>

      {/* ========================================================================= */}
      {/* مودال تعديل بيانات النقطة الكاملة (Edit Point Modal) */}
      {/* ========================================================================= */}
      {editingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-purple-100 text-aei-purple flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-aei-purple block">لوحة التحكم بالنقطة الميدانية</span>
                  <h3 className="font-black text-lg text-slate-900">تعديل بيانات: {editingPoint.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setEditingPoint(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {editError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2 shrink-0">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={handleSaveEdit} className="overflow-y-auto flex-1 space-y-4 pr-1 pl-1">
              {/* اسم النقطة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  اسم النقطة / العيادة الميدانية <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20"
                  required
                />
              </div>

              {/* المحافظة والمنطقة الجغرافية */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المحافظة</label>
                  <select
                    value={editForm.governorate || 'دير البلح / الوسطى'}
                    onChange={(e) => setEditForm({ ...editForm, governorate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    {PALESTINE_GOVERNORATES.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">المنطقة الجغرافية (Geo Zone)</label>
                  <select
                    value={editForm.geo_zone || 'الوسطى'}
                    onChange={(e) => setEditForm({ ...editForm, geo_zone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    <option value="الوسطى">الوسطى</option>
                    <option value="خانيونس">خانيونس</option>
                    <option value="غزة">غزة</option>
                    <option value="شمال غزة">شمال غزة</option>
                    <option value="رفح">رفح</option>
                    <option value="إداري">إداري</option>
                  </select>
                </div>
              </div>

              {/* اسم الحي / المخيم */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">الحي / المخيم / المنطقة التفصيلية</label>
                <input
                  type="text"
                  value={editForm.point_area || ''}
                  onChange={(e) => setEditForm({ ...editForm, point_area: e.target.value })}
                  placeholder="مثلاً: مخيم النصيرات، البريج، المواصي..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-aei-purple"
                />
              </div>

              {/* العنوان الجغرافي التفصيلي */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  العنوان الجغرافي التفصيلي ومعالم الوصول <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={editForm.address_details || ''}
                  onChange={(e) => setEditForm({ ...editForm, address_details: e.target.value })}
                  placeholder="مثال: مخيم النصيرات - شارع السوق، بالقرب من مركز البرامج النسائية ومستوصف الأونروا..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-aei-purple"
                  required
                />
              </div>

              {/* إحداثيات GPS */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80 space-y-2">
                <span className="text-xs font-black text-emerald-900 block flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-emerald-700" />
                  إحداثيات الموقع على الخريطة (GPS Coordinates):
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">خط العرض (Latitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.latitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, latitude: parseFloat(e.target.value) || undefined })}
                      placeholder="مثال: 31.4485"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">خط الطول (Longitude)</label>
                    <input
                      type="number"
                      step="any"
                      value={editForm.longitude || ''}
                      onChange={(e) => setEditForm({ ...editForm, longitude: parseFloat(e.target.value) || undefined })}
                      placeholder="مثال: 34.3912"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white"
                      dir="ltr"
                    />
                  </div>
                </div>
                {editForm.latitude && editForm.longitude && (
                  <div className="pt-1">
                    <a
                      href={`https://maps.google.com/?q=${editForm.latitude},${editForm.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      اختبار فتح الإحداثيات على خرائط Google
                    </a>
                  </div>
                )}
              </div>

              {/* المشرف المسؤول */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">المشرف الميداني المسؤول عن النقطة</label>
                {canManageAllPoints ? (
                  <select
                    value={editForm.supervisor || ''}
                    onChange={(e) => setEditForm({ ...editForm, supervisor: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold bg-white"
                  >
                    {SUPERVISOR_CONFIGS.map((s) => (
                      <option key={s.id} value={s.name}>{s.name} ({s.zones})</option>
                    ))}
                  </select>
                ) : (
                  <input
                    type="text"
                    value={editForm.supervisor || currentUser.name}
                    readOnly
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-100 text-xs font-bold text-slate-600 cursor-not-allowed"
                  />
                )}
              </div>

              {/* البرامج التغذوية المدعومة */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  البرامج التغذوية المدعومة في هذه النقطة: <span className="text-rose-500">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {['TSFP', 'BSFP', 'Cash'].map((prog) => {
                    const isChecked = editForm.programs_supported?.includes(prog);
                    return (
                      <label
                        key={prog}
                        className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-purple-50 border-aei-purple text-aei-purple'
                            : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const currentProgs = editForm.programs_supported || [];
                            if (e.target.checked) {
                              setEditForm({ ...editForm, programs_supported: [...currentProgs, prog] });
                            } else {
                              setEditForm({ ...editForm, programs_supported: currentProgs.filter(p => p !== prog) });
                            }
                          }}
                          className="rounded text-aei-purple focus:ring-aei-purple"
                        />
                        <span>
                          {prog === 'TSFP' ? 'علاجي TSFP' : prog === 'Cash' ? 'كاش Cash' : 'وقائي BSFP'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* ملاحظات تشغيلية */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">ملاحظات تشغيلية أو لوجستية خاصة</label>
                <textarea
                  rows={2}
                  value={editForm.notes || ''}
                  onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                  placeholder="ملاحظات حول سعة الاستيعاب، أوقات الدوام، أو شروط التوزيع..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-aei-purple"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingPoint(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light text-white font-bold text-xs hover:shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>حفظ التعديلات</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* مودال التحكم بالحالة التشغيلية للنقطة (Status Control Modal) */}
      {/* ========================================================================= */}
      {statusModalPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-white ${
                  targetStatus === 'نشطة' ? 'bg-emerald-600' : targetStatus === 'معلقة_مؤقتاً' ? 'bg-amber-600' : 'bg-rose-600'
                }`}>
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 block">التحكم في الجاهزية الميدانية</span>
                  <h3 className="font-black text-base text-slate-900">{statusModalPoint.name}</h3>
                </div>
              </div>
              <button 
                onClick={() => setStatusModalPoint(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {statusError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{statusError}</span>
              </div>
            )}

            <form onSubmit={handleSaveStatus} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">اختر الحالة التشغيلية المطلوبة للنقطة:</label>
                <div className="grid grid-cols-1 gap-2.5">
                  {/* 1. نشطة وتعمل */}
                  <div
                    onClick={() => {
                      setTargetStatus('نشطة');
                      setStatusReason('استئناف العمل والتشغيل الميداني كالمعتاد وعودة الاستقرار');
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      targetStatus === 'نشطة'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-white">
                        {targetStatus === 'نشطة' && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-black text-xs block">🟢 نشطة وتعمل (Active)</span>
                        <span className="text-[11px] text-slate-500">مفتوحة وتستقبل المستفيدين بكامل طاقتها التشغيلية</span>
                      </div>
                    </div>
                  </div>

                  {/* 2. تعليق مؤقت للعمل */}
                  <div
                    onClick={() => {
                      setTargetStatus('معلقة_مؤقتاً');
                      setStatusReason('أوضاع أمنية غير مستقرة في محيط النقطة وتأمين سلامة الكوادر');
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      targetStatus === 'معلقة_مؤقتاً'
                        ? 'bg-amber-50 border-amber-500 text-amber-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-amber-500 flex items-center justify-center text-white">
                        {targetStatus === 'معلقة_مؤقتاً' && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-black text-xs block">🟡 تعليق مؤقت للعمل (Suspended)</span>
                        <span className="text-[11px] text-slate-500">إيقاف مؤقت لأسباب أمنية أو لوجستية مع بقاء النقطة مسجلة</span>
                      </div>
                    </div>
                  </div>

                  {/* 3. إغلاق النقطة */}
                  <div
                    onClick={() => {
                      setTargetStatus('مغلقة');
                      setStatusReason('إغلاق النقطة رسمياً لانتهاء الخطة الميدانية أو نزوح السكان بالكامل');
                    }}
                    className={`p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between cursor-pointer ${
                      targetStatus === 'مغلقة'
                        ? 'bg-rose-50 border-rose-500 text-rose-950 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full bg-rose-500 flex items-center justify-center text-white">
                        {targetStatus === 'مغلقة' && <Check className="w-3 h-3" />}
                      </div>
                      <div>
                        <span className="font-black text-xs block">🔴 إغلاق النقطة (Closed)</span>
                        <span className="text-[11px] text-slate-500">إلغاء تفعيل النقطة وإيقاف دوام الفرق الميدانية فيها</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* حقل كتابة وتفصيل السبب */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  سبب القرار التشغيلي / التوضيح الإداري: <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="اكتب التوضيح الإداري لسبب تغيير حالة النقطة..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:border-aei-purple"
                  required
                />
              </div>

              {/* أزرار سريعة للنماذج المعتمدة للسبب */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold text-slate-400 block">أسباب شائعة بنقرة زر:</span>
                <div className="flex flex-wrap gap-1">
                  {[
                    'أوضاع أمنية خطرة في محيط النقطة',
                    'نقص حاد في الإمدادات والمكملات الغذائية',
                    'أعمال صيانة وتجهيز في المركز',
                    'استئناف العمل واستقرار الأوضاع الميدانية'
                  ].map((tpl) => (
                    <button
                      key={tpl}
                      type="button"
                      onClick={() => setStatusReason(tpl)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[10px] font-bold text-slate-600 transition-colors cursor-pointer"
                    >
                      + {tpl}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 text-[10px] text-slate-400 border-t border-slate-100 flex items-center justify-between">
                <span>المسؤول عن التغيير: {currentUser.name}</span>
                <span>التوقيت: {new Date().toLocaleDateString('ar-EG')}</span>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setStatusModalPoint(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className={`px-6 py-2.5 rounded-xl text-white font-bold text-xs shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    targetStatus === 'نشطة'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : targetStatus === 'معلقة_مؤقتاً'
                      ? 'bg-amber-600 hover:bg-amber-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  <Check className="w-4 h-4" />
                  <span>تأكيد اعتماد الحالة</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* نافذة استعراض كوادر النقطة المحددة (Inspect Point Staff Modal) */}
      {/* ========================================================================= */}
      {inspectingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-100 pb-4 shrink-0">
              <div>
                <span className="text-xs font-bold text-aei-purple block mb-1">بيانات نقطة العمل الميدانية</span>
                <h3 className="font-black text-lg text-slate-900">{inspectingPoint.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {inspectingPoint.geo_zone} - منطقة {inspectingPoint.point_area} • المشرف المسؤول: {inspectingPoint.supervisor}
                </p>
              </div>
              <button 
                onClick={() => setInspectingPoint(null)} 
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* بطاقة الحالة والعنوان والإحداثيات في المودال */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 shrink-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500">الحالة التشغيلية للنقطة:</span>
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${
                  (inspectingPoint.status || 'نشطة') === 'نشطة'
                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                    : inspectingPoint.status === 'معلقة_مؤقتاً'
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-rose-100 text-rose-900 border-rose-300'
                }`}>
                  {(inspectingPoint.status || 'نشطة') === 'نشطة' ? '🟢 نشطة وتعمل' : inspectingPoint.status === 'معلقة_مؤقتاً' ? '🟡 تعليق مؤقت للعمل' : '🔴 مغلقة'}
                </span>
              </div>

              {inspectingPoint.status_reason && (
                <div className="text-xs p-2 rounded-xl bg-white border border-slate-200 text-slate-700">
                  <span className="font-bold text-slate-500">التوضيح التشغيلي: </span>
                  <span>{inspectingPoint.status_reason}</span>
                </div>
              )}

              <div className="flex items-start gap-2.5 text-xs pt-1 border-t border-slate-200/80">
                <MapPin className="w-4 h-4 text-aei-purple shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">العنوان الجغرافي التفصيلي:</span>
                  <span className="font-bold text-slate-800 text-xs leading-relaxed">{inspectingPoint.address_details}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-800 font-bold" dir="ltr">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>GPS: {inspectingPoint.latitude ? `${inspectingPoint.latitude.toFixed(4)}, ${inspectingPoint.longitude?.toFixed(4)}` : 'غير محدد'}</span>
                </div>

                {inspectingPoint.latitude && inspectingPoint.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${inspectingPoint.latitude},${inspectingPoint.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs"
                  >
                    <span>خرائط Google</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-5">
              {/* قسم كوادر المشرف المسؤول المباشر */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-aei-purple" />
                    <span>
                      كادر المشرف المسؤول ({inspectingPoint.supervisor}) — ({getPointStaff(inspectingPoint).length} كادر):
                    </span>
                  </h4>
                  <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                    inspectingPoint.supervisor?.includes('هادي')
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}>
                    {inspectingPoint.supervisor?.includes('هادي') ? 'عيادة التغذية العلاجية TSFP' : 'فريق التغذية الوقائية BSFP'}
                  </span>
                </div>

                {getPointStaff(inspectingPoint).length > 0 ? (
                  <div className="space-y-2">
                    {getPointStaff(inspectingPoint).map((emp) => (
                      <div key={emp.national_id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{emp.full_name_ar}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 font-semibold">
                              {emp.category}
                            </span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                              emp.status === 'نشط'
                                ? 'bg-emerald-100 text-emerald-800'
                                : emp.status === 'معلق_قيد_الاعتماد'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}>
                              {emp.status === 'نشط' ? 'نشط' : emp.status === 'معلق_قيد_الاعتماد' ? 'معلق' : emp.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-aei-purple font-bold block mt-1">
                            {emp.job_title} • قسم: {emp.department}
                          </span>
                        </div>
                        <div className="text-left" dir="ltr">
                          <span className="font-mono font-bold text-slate-700 block">{emp.phone}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {emp.national_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                    لا توجد كوادر مسجلة حالياً لهذا المشرف في هذه النقطة
                  </div>
                )}
              </div>

              {/* قسم كوادر الشريك في الموقع (للنقاط المشتركة TSFP + BSFP) */}
              {inspectingPoint.is_shared && getPartnerStaff(inspectingPoint).length > 0 && (
                <div className="space-y-2.5 pt-4 border-t border-purple-100">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black text-purple-950 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>
                        فريق الشريك في نفس الموقع ({inspectingPoint.supervisor?.includes('هادي') ? inspectingPoint.partner_supervisor : 'هادي الأحول'}) — ({getPartnerStaff(inspectingPoint).length} كادر):
                      </span>
                    </h4>
                    <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full ${
                      inspectingPoint.supervisor?.includes('هادي')
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                    }`}>
                      {inspectingPoint.supervisor?.includes('هادي') ? 'فريق التغذية الوقائية والكاش BSFP' : 'كادر التغذية العلاجية السريرية TSFP'}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-purple-50/70 border border-purple-200/80 text-[11px] text-purple-900 leading-relaxed">
                    💡 هذه النقطة تعمل كمركز تكاملي مشترك يقدم خدمات <strong>العلاج السريري TSFP</strong> والتغذية <strong>الوقائية والمساعدات BSFP</strong> بتنسيق مشترك بين المشرفين.
                  </div>

                  <div className="space-y-2">
                    {getPartnerStaff(inspectingPoint).map((emp) => (
                      <div key={emp.national_id} className="p-3.5 rounded-2xl bg-purple-50/30 border border-purple-200/60 flex items-center justify-between text-xs">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-slate-900">{emp.full_name_ar}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-purple-200 text-purple-800 font-semibold">
                              {emp.category}
                            </span>
                            <span className="text-[9px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 text-emerald-800">
                              {emp.status}
                            </span>
                          </div>
                          <span className="text-[11px] text-purple-700 font-bold block mt-1">
                            {emp.job_title} • قسم: {emp.department} • المشرف: {emp.supervisor_name}
                          </span>
                        </div>
                        <div className="text-left" dir="ltr">
                          <span className="font-mono font-bold text-slate-700 block">{emp.phone}</span>
                          <span className="text-[10px] font-mono text-slate-400">ID: {emp.national_id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setInspectingPoint(null)}
                className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 cursor-pointer"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
