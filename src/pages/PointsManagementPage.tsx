import React, { useState, useMemo } from 'react';
import { INITIAL_WORK_POINTS } from '../lib/constants';
import { REAL_SUPERVISORS, REAL_COORDINATOR } from '../lib/realData';
import { storageService } from '../lib/storageService';
import { WorkPoint, Employee } from '../lib/types';
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
  ExternalLink
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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [selectedProgram, setSelectedProgram] = useState<string>('all');
  const [selectedSupervisorId, setSelectedSupervisorId] = useState<string>('all');
  const [inspectingPoint, setInspectingPoint] = useState<WorkPoint | null>(null);

  const allStaff = storageService.getAllEmployees();

  // جلب الكوادر العاملة في نقطة معينة
  const getPointStaff = (pt: WorkPoint): Employee[] => {
    return allStaff.filter(
      (e) => e.current_point_id === pt.id || e.current_point_name === pt.name || (pt.id === 'pt-admin' && e.category === 'منسق')
    );
  };

  // تصفية النقاط بحسب معايير البحث والفلترة
  const filteredPoints = useMemo(() => {
    return INITIAL_WORK_POINTS.filter((pt) => {
      const matchSearch = 
        pt.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        (pt.point_area && pt.point_area.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (pt.supervisor && pt.supervisor.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchZone = selectedZone === 'all' || pt.geo_zone === selectedZone;
      const matchProg = selectedProgram === 'all' || pt.programs_supported.includes(selectedProgram);
      
      return matchSearch && matchZone && matchProg;
    });
  }, [searchTerm, selectedZone, selectedProgram]);

  // تجميع النقاط تحت كل مشرف ميداني
  const groupedSupervisors = useMemo(() => {
    return SUPERVISOR_CONFIGS.map((sup) => {
      const supervisorPoints = filteredPoints.filter((pt) => {
        const supField = (pt.supervisor || pt.supervisor_name || '').trim();
        return supField.includes(sup.shortName);
      });

      const totalSupervisorStaff = supervisorPoints.reduce((acc, pt) => {
        return acc + getPointStaff(pt).length;
      }, 0);

      const tsfpPointsCount = supervisorPoints.filter(p => p.programs_supported.includes('TSFP')).length;
      const bsfpPointsCount = supervisorPoints.filter(p => p.programs_supported.includes('BSFP')).length;

      return {
        ...sup,
        points: supervisorPoints,
        totalStaff: totalSupervisorStaff,
        tsfpPointsCount,
        bsfpPointsCount
      };
    }).filter((group) => {
      if (selectedSupervisorId !== 'all') {
        return group.id === selectedSupervisorId;
      }
      // إذا كان هناك بحث نشط، اعرض فقط المشرفين الذين لديهم نقاط مطابقة
      if (searchTerm.trim() || selectedZone !== 'all' || selectedProgram !== 'all') {
        return group.points.length > 0;
      }
      return true;
    });
  }, [filteredPoints, selectedSupervisorId, searchTerm, selectedZone, selectedProgram]);

  // إحصائيات سريعة
  const totalPointsCount = INITIAL_WORK_POINTS.length;
  const tsfpClinicsCount = INITIAL_WORK_POINTS.filter(p => p.programs_supported.includes('TSFP')).length;
  const bsfpCashPointsCount = INITIAL_WORK_POINTS.filter(p => p.programs_supported.includes('BSFP') || p.programs_supported.includes('Cash')).length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* الترويسة الرئيسية */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-aei-purple border border-purple-200">
            <Building2 className="w-3.5 h-3.5" />
            الهيكل التنظيمي للنقاط الميدانية
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
            إدارة نقاط التوزيع والعيادات التغذوية (موزعة بحسب المشرف الميداني)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            عرض احترافي منظم يربط كل مشرف ميداني بكافة النقاط والعيادات التابعة له، مع التحقق الصارم من البروتوكول التغذوي
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
              • <strong>عيادات TSFP (علاجي سريري):</strong> فرق التغذية السريرية لعلاج سوء التغذية الحاد والمتوسط — يُحظر دمج توزيع الكاش أو المساعدات الوقائية بها.<br />
              • <strong>نقاط BSFP (وقائي + كاش):</strong> برامج التغذية الوقائية العامة والمساعدات النقدية الرقمية المشتركة.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold flex items-center gap-1">
            <Stethoscope className="w-3.5 h-3.5" />
            TSFP علاج سريري
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
            <HeartHandshake className="w-3.5 h-3.5" />
            BSFP + Cash وقائي وكاش
          </span>
        </div>
      </div>

      {/* شريط الإحصائيات السريعة */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 block">إجمالي النقاط والمقار</span>
          <span className="text-2xl font-black text-slate-900 mt-1 block">{totalPointsCount}</span>
          <span className="text-[10px] text-slate-500">28 ميدانية + 1 إدارة</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 block">المشرفون الميدانيون</span>
          <span className="text-2xl font-black text-aei-purple mt-1 block">4 مشرفين</span>
          <span className="text-[10px] text-slate-500">+ منسقة المشروع</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 block">عيادات TSFP (علاجي)</span>
          <span className="text-2xl font-black text-rose-600 mt-1 block">{tsfpClinicsCount} عيادات</span>
          <span className="text-[10px] text-slate-500">مخصصة سريرياً</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm text-center">
          <span className="text-[11px] font-bold text-slate-400 block">نقاط وقائي وكاش BSFP</span>
          <span className="text-2xl font-black text-emerald-600 mt-1 block">{bsfpCashPointsCount} نقطة</span>
          <span className="text-[10px] text-slate-500">توزيعات ومساعدات</span>
        </div>
      </div>

      {/* شريط الفلاتر والتبديل السريع بين المشرفين */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 absolute right-3.5 top-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث باسم النقطة، المنطقة، أو المشرف..."
              className="w-full pr-10 pl-4 py-2 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-aei-purple/20 font-medium"
            />
          </div>

          <div className="flex gap-2 w-full md:w-auto flex-wrap text-xs">
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">كافة المحافظات والمناطق</option>
              <option value="الوسطى">محافظة الوسطى</option>
              <option value="خانيونس">محافظة خانيونس</option>
              <option value="غزة">محافظة غزة</option>
              <option value="إداري">مكتب التنسيق والإدارة</option>
            </select>

            <select
              value={selectedProgram}
              onChange={(e) => setSelectedProgram(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700"
            >
              <option value="all">كافة البرامج التغذوية</option>
              <option value="TSFP">TSFP (علاجي سريري)</option>
              <option value="BSFP">BSFP (وقائي)</option>
              <option value="Cash">Cash (مساعدات نقدية)</option>
            </select>
          </div>
        </div>

        {/* أزرار التبديل والانتقال السريع بين المشرفين */}
        <div className="border-t border-slate-100 pt-3 flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-[11px] font-bold text-slate-400 shrink-0 ml-1">عرض المشرف:</span>
          
          <button
            onClick={() => setSelectedSupervisorId('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedSupervisorId === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            كافة المشرفين ({totalPointsCount} نقطة)
          </button>

          {SUPERVISOR_CONFIGS.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedSupervisorId(s.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer flex items-center gap-1.5 ${
                selectedSupervisorId === s.id
                  ? 'bg-aei-purple text-white shadow-xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{s.shortName === 'أمل' ? 'أ. أمل عوض (إدارة)' : `أ. ${s.name.split(' ')[0]} ${s.name.split(' ').slice(-1)[0]}`}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* عرض كتل المشرفين المتميزة (كل مشرف وتحته كافة النقاط التابعة له) */}
      {/* ========================================================================= */}
      <div className="space-y-10">
        {groupedSupervisors.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
            <Building2 className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">لا توجد نقاط مطابقة لمعايير البحث الحالية</h3>
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
                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[90px]">
                      <span className="block text-lg font-black text-white">{group.points.length}</span>
                      <span className="text-[10px] text-slate-300 font-bold">نقاط تابعة</span>
                    </div>

                    <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[90px]">
                      <span className="block text-lg font-black text-amber-300">{group.totalStaff}</span>
                      <span className="text-[10px] text-slate-300 font-bold">كادراً ميدانياً</span>
                    </div>

                    {group.tsfpPointsCount > 0 && (
                      <div className="bg-rose-500/20 backdrop-blur-md px-3 py-2 rounded-xl border border-rose-400/30 text-center">
                        <span className="block text-sm font-black text-rose-200">{group.tsfpPointsCount}</span>
                        <span className="text-[9px] text-rose-300 font-bold">عيادات TSFP</span>
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
                      const isTSFP = pt.programs_supported.includes('TSFP');
                      const isBSFP = pt.programs_supported.includes('BSFP');
                      const isCash = pt.programs_supported.includes('Cash');

                      return (
                        <div
                          key={pt.id}
                          className="bg-slate-50/70 hover:bg-white rounded-2xl p-5 border border-slate-200/90 hover:border-aei-purple/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 group"
                        >
                          <div className="space-y-3">
                            {/* شارة المعرف والمنطقة */}
                            <div className="flex items-start justify-between gap-2">
                              <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600 block">
                                {pt.geo_zone} • {pt.point_area}
                              </span>
                              <span className="font-mono text-[10px] font-black text-slate-400 group-hover:text-aei-purple transition-colors">
                                {pt.id}
                              </span>
                            </div>

                            {/* اسم النقطة */}
                            <h4 className="text-sm font-black text-slate-900 group-hover:text-aei-purple transition-colors leading-snug">
                              {pt.name}
                            </h4>

                            {/* شارات البرامج التغذوية المعتمدة */}
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

                            {/* بيانات الكادر والمسؤول */}
                            <div className="pt-2 border-t border-slate-200/70 text-xs space-y-1.5 text-slate-600">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                                  <Users className="w-3.5 h-3.5" />
                                  الكوادر العاملة:
                                </span>
                                <span className="font-black text-slate-800 px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[11px]">
                                  {staffInPoint.length} كادر
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* زر استعراض كوادر النقطة */}
                          <div className="pt-2 border-t border-slate-200/60">
                            <button
                              onClick={() => setInspectingPoint(pt)}
                              className="w-full py-2 rounded-xl bg-white hover:bg-aei-purple text-slate-700 hover:text-white border border-slate-200 hover:border-aei-purple font-bold text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs group-hover:bg-aei-purple group-hover:text-white"
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
      {/* نافذة استعراض كوادر النقطة المحددة (Inspect Point Staff Modal) */}
      {/* ========================================================================= */}
      {inspectingPoint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-2xl w-full shadow-2xl border border-slate-100 space-y-5 max-h-[90vh] flex flex-col">
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

            {/* بطاقة العنوان والإحداثيات التفصيلية في المودال */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2.5 shrink-0">
              <div className="flex items-start gap-2.5 text-xs">
                <MapPin className="w-4 h-4 text-aei-purple shrink-0 mt-0.5" />
                <div>
                  <span className="text-slate-400 font-bold block text-[10px]">العنوان الجغرافي التفصيلي:</span>
                  <span className="font-bold text-slate-800 text-xs leading-relaxed">{inspectingPoint.address_details}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-200/80 text-xs">
                <div className="flex items-center gap-1.5 font-mono text-[11px] text-emerald-800 font-bold" dir="ltr">
                  <Navigation className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>GPS: {inspectingPoint.latitude ? `${inspectingPoint.latitude.toFixed(4)}, ${inspectingPoint.longitude?.toFixed(4)}` : 'غير محدد'}</span>
                </div>

                {inspectingPoint.latitude && inspectingPoint.longitude && (
                  <a
                    href={`https://maps.google.com/?q=${inspectingPoint.latitude},${inspectingPoint.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-xs"
                  >
                    <span>فتح الموقع على خرائط Google</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            </div>

            <div className="overflow-y-auto flex-1 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-extrabold text-slate-800">
                  قائمة الكوادر الميدانية العاملة في هذه النقطة ({getPointStaff(inspectingPoint).length}):
                </h4>
                <div className="flex gap-1">
                  {inspectingPoint.programs_supported.map((prog, i) => (
                    <span key={i} className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {prog}
                    </span>
                  ))}
                </div>
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
                <div className="py-10 text-center text-xs text-slate-400 font-bold bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  لا توجد كوادر مسجلة حالياً لهذه النقطة
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
