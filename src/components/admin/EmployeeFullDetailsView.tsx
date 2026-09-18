import React, { useState } from 'react';
import { Employee } from '../../lib/types';
import { 
  User, Phone, Mail, MapPin, Home, GraduationCap, Award, 
  Briefcase, Building2, CreditCard, ShieldCheck, QrCode, 
  Calendar, Users, Printer, CheckCircle2, AlertCircle, 
  Search, ChevronDown, KeyRound, Clock, ShieldAlert,
  Copy, Check, FileCheck, Eye, EyeOff
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

interface EmployeeFullDetailsViewProps {
  employee: Employee;
  allEmployees?: Employee[];
  onSelectEmployee?: (emp: Employee) => void;
  onApprove?: (nationalId: string, empName: string) => void;
  onReject?: (nationalId: string, empName: string) => void;
  showSelector?: boolean;
}

export const EmployeeFullDetailsView: React.FC<EmployeeFullDetailsViewProps> = ({
  employee,
  allEmployees = [],
  onSelectEmployee,
  onApprove,
  onReject,
  showSelector = true
}) => {
  const [showPin, setShowPin] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const handleCopy = (text: string, label: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(label);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handlePrintBadge = () => {
    window.print();
  };

  const filteredStaff = allEmployees.filter(e => 
    e.full_name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    e.national_id?.includes(searchQuery) ||
    e.phone?.includes(searchQuery)
  );

  return (
    <div className="space-y-6 text-slate-800 animate-in fade-in duration-150">
      {/* 0. شريط البحث والتنقل السريع بين الكوادر إن تم تفعيله */}
      {showSelector && allEmployees.length > 0 && (
        <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex-1 relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ابحث بالاسم أو رقم الهوية أو الجوال للتنقل السريع..."
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:ring-2 focus:ring-aei-purple/20 pr-8"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5" />
          </div>

          <div className="sm:w-80">
            <select
              value={employee.national_id}
              onChange={(e) => {
                const found = allEmployees.find(emp => emp.national_id === e.target.value);
                if (found && onSelectEmployee) onSelectEmployee(found);
              }}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
            >
              <option value="">-- اختر موظفاً من السجل العام ({allEmployees.length} كادر) --</option>
              {filteredStaff.map(emp => (
                <option key={emp.national_id} value={emp.national_id}>
                  {emp.full_name_ar} ({emp.job_title}) - {emp.current_point_name || 'تغذية'}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* 1. البطاقة التعريفية العلوية (Hero Card) */}
      <div className="bg-gradient-to-l from-slate-900 via-purple-950 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {/* الصورة الشخصية أو الحرف الأول */}
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-aei-purple to-purple-400 p-1 shadow-lg shrink-0 flex items-center justify-center text-2xl font-black text-white border-2 border-white/20">
              {employee.photo_url ? (
                <img 
                  src={employee.photo_url} 
                  alt={employee.full_name_ar} 
                  className="w-full h-full object-cover rounded-xl" 
                />
              ) : (
                <span>{employee.full_name_ar ? employee.full_name_ar.trim().charAt(0) : 'م'}</span>
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-black">{employee.full_name_ar}</h3>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                  employee.status === 'نشط'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : employee.status === 'معلق_قيد_الاعتماد'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : employee.status === 'مجاز'
                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                    : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                }`}>
                  {employee.status === 'نشط' ? '● كادر نشط ومعتمد' : employee.status === 'معلق_قيد_الاعتماد' ? '⏳ معلق قيد المراجعة' : employee.status === 'مجاز' ? '🌴 في إجازة ميدانية' : '🛑 مستقيل'}
                </span>
              </div>

              <p className="text-xs text-purple-200 font-medium">
                {employee.full_name_en ? `${employee.full_name_en} • ` : ''}
                {employee.job_title} ({employee.category || 'كادر ميداني'})
              </p>

              <div className="flex flex-wrap items-center gap-3 text-xs text-slate-300 pt-1">
                <span className="flex items-center gap-1 font-mono bg-white/10 px-2 py-0.5 rounded">
                  هوية: {employee.national_id}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-aei-gold" />
                  {employee.current_point_name || 'نقطة ميدانية'}
                </span>
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-300" />
                  المشرف: {employee.supervisor_name || 'أشرف أسامة الصليبي'}
                </span>
              </div>
            </div>
          </div>

          {/* الإجراءات والـ QR */}
          <div className="flex items-center gap-3 self-end md:self-center">
            {/* بطاقة QR مصغرة */}
            <div className="bg-white p-2 rounded-2xl shadow-sm text-center">
              <QRCodeSVG 
                value={JSON.stringify({ 
                  id: employee.national_id, 
                  name: employee.full_name_ar, 
                  point: employee.current_point_name,
                  token: employee.qr_token || employee.national_id
                })} 
                size={68} 
              />
              <span className="text-[9px] font-bold text-slate-500 block mt-1">رمز QR الميداني</span>
            </div>

            <div className="flex flex-col gap-2">
              <button
                onClick={handlePrintBadge}
                className="px-3.5 py-2 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border border-white/20"
                title="طباعة بطاقة العمل التعريفية"
              >
                <Printer className="w-4 h-4 text-aei-gold" />
                طباعة البطاقة
              </button>

              {/* أزرار اعتماد إذا كان الموظف معلقاً */}
              {employee.status === 'معلق_قيد_الاعتماد' && onApprove && (
                <div className="flex gap-1.5">
                  <button
                    onClick={() => onApprove(employee.national_id, employee.full_name_ar)}
                    className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    اعتماد
                  </button>
                  {onReject && (
                    <button
                      onClick={() => onReject(employee.national_id, employee.full_name_ar)}
                      className="px-2.5 py-1.5 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-xs font-bold cursor-pointer"
                      title="طلب تعديل أو رفض"
                    >
                      ملاحظة
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. شبكة الأقسام الستة الشاملة للـ 33 حقلاً */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {/* القسم 1: البيانات الشخصية والعائلية (7 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-purple-50 text-aei-purple flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">1. البيانات الشخصية والعائلية</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الاسم رباعي (عربي):</span>
              <span className="font-bold text-slate-800">{employee.full_name_ar}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الاسم بالإنجليزية:</span>
              <span className="font-semibold text-slate-700" dir="ltr">{employee.full_name_en || 'غير مسجل'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رقم الهوية (9 أرقام):</span>
              <span className="font-mono font-bold text-aei-purple flex items-center gap-1.5">
                {employee.national_id}
                <button 
                  onClick={() => handleCopy(employee.national_id, 'id')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="نسخ رقم الهوية"
                >
                  {copiedField === 'id' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">تاريخ الميلاد:</span>
              <span className="font-bold text-slate-700">{employee.birth_date || 'غير محدد'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الحالة الاجتماعية:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {employee.marital_status || 'أعزب'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">عدد أفراد الأسرة (المعالين):</span>
              <span className="font-black text-slate-800">{employee.family_count ?? 0} أفراد</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">أطفال دون سن 5 سنوات:</span>
              <span className="font-black text-amber-700 bg-amber-50 px-2 py-0.5 rounded text-[11px]">
                {employee.children_under_5 ?? 0} أطفال
              </span>
            </div>
          </div>
        </div>

        {/* القسم 2: بيانات الاتصال والسكن والإيواء (7 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Home className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">2. الاتصال والسكن والإيواء</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رقم الهاتف / الجوال:</span>
              <span className="font-mono font-bold text-slate-800 flex items-center gap-1.5" dir="ltr">
                {employee.phone}
                <button 
                  onClick={() => handleCopy(employee.phone, 'phone')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="نسخ رقم الجوال"
                >
                  {copiedField === 'phone' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">البريد الإلكتروني:</span>
              <span className="font-mono text-slate-600 text-[11px] truncate max-w-[160px]" dir="ltr">
                {employee.email || 'غير متوفر'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">المحافظة قبل الحرب:</span>
              <span className="font-bold text-slate-700">{employee.prewar_gov || 'غزة'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">العنوان قبل الحرب:</span>
              <span className="font-medium text-slate-700 truncate max-w-[160px]">{employee.prewar_address || 'حي الرمال'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">محافظة الإيواء الحالي:</span>
              <span className="font-bold text-aei-purple">{employee.current_gov || 'دير البلح / الوسطى'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">مكان الإيواء بالتفصيل:</span>
              <span className="font-medium text-slate-800 truncate max-w-[160px]">{employee.current_address || 'دير البلح'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">طبيعة الإيواء:</span>
              <span className="font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded text-[11px]">
                {employee.housing_type || 'نزوح - مدرسة إيواء'}
              </span>
            </div>
          </div>
        </div>

        {/* القسم 3: المؤهلات العلمية والتراخيص (6 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">3. المؤهل العلمي والمهني</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الدرجة العلمية:</span>
              <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded text-[11px]">
                {employee.degree || 'بكالوريوس'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">التخصص العلمي:</span>
              <span className="font-bold text-emerald-800">{employee.major || 'تغذية علاجية'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الجامعة / الكلية:</span>
              <span className="font-medium text-slate-700 truncate max-w-[160px]">
                {employee.university || employee.university_other || 'جامعة الأزهر'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">سنة التخرج:</span>
              <span className="font-mono font-bold text-slate-700">{employee.graduation_year || '2020'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رقم مزاولة المهنة:</span>
              <span className="font-mono font-bold text-slate-800">{employee.license_number || 'غير مطلوب'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">تاريخ صدور المزاولة:</span>
              <span className="font-medium text-slate-600">{employee.license_date || '-'}</span>
            </div>
          </div>
        </div>

        {/* القسم 4: البيانات الوظيفية والميدانية (6 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Briefcase className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">4. البيانات الوظيفية والميدانية</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الفئة الوظيفية:</span>
              <span className="font-bold text-slate-800">{employee.category || 'موظف'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">المسمى الوظيفي:</span>
              <span className="font-bold text-aei-purple">{employee.job_title}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">القسم / البرنامج:</span>
              <span className="font-bold text-slate-700">{employee.department || 'علاجي'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">نقطة العمل الميدانية:</span>
              <span className="font-bold text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                {employee.current_point_name || 'نقطة الأقصى'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">الفريق الميداني:</span>
              <span className="font-medium text-slate-600">{employee.current_team_id || 'فريق أ'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">المشرف المسؤول:</span>
              <span className="font-black text-aei-purple">{employee.supervisor_name || 'أشرف أسامة الصليبي'}</span>
            </div>
          </div>
        </div>

        {/* القسم 5: البيانات المالية والمصرفية (4 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">5. البيانات المالية والمصرفية</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">طريقة استلام المستحقات:</span>
              <span className="font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[11px]">
                {employee.payment_method || 'حساب بنك فلسطين'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">البنك والفرع:</span>
              <span className="font-semibold text-slate-800">{employee.bank_branch || 'بنك فلسطين - فرع دير البلح'}</span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رقم الحساب المصرفي:</span>
              <span className="font-mono font-bold text-slate-800" dir="ltr">{employee.bank_account || employee.iban_or_phone || 'غير مسجل'}</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">الآيبان IBAN / محفظة:</span>
              <span className="font-mono font-bold text-aei-purple flex items-center gap-1" dir="ltr">
                <span className="truncate max-w-[140px]">{employee.iban_or_phone || 'غير مسجل'}</span>
                <button 
                  onClick={() => handleCopy(employee.iban_or_phone || '', 'iban')}
                  className="text-slate-400 hover:text-slate-600 cursor-pointer"
                  title="نسخ الآيبان"
                >
                  {copiedField === 'iban' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </span>
            </div>
          </div>
        </div>

        {/* القسم 6: الأمان والرموز والمستندات (5 حقول) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-black text-slate-800">6. الأمان والمستندات والـ PIN</h4>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رمز الدخول (PIN):</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                  {showPin ? (employee.pin || '1234') : '••••'}
                </span>
                <button
                  onClick={() => setShowPin(!showPin)}
                  className="text-slate-400 hover:text-indigo-600 cursor-pointer"
                  title={showPin ? 'إخفاء PIN' : 'إظهار PIN'}
                >
                  {showPin ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">رمز QR Token الميداني:</span>
              <span className="font-mono text-[11px] text-slate-600 truncate max-w-[140px]" dir="ltr">
                {employee.qr_token || employee.national_id}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">تاريخ التسجيل في النظام:</span>
              <span className="font-medium text-slate-700">
                {employee.created_at ? new Date(employee.created_at).toLocaleDateString('ar-EG') : '01/09/2026'}
              </span>
            </div>
            <div className="flex justify-between items-center py-1 border-b border-slate-50">
              <span className="text-slate-400">تعهد الإقرار الإلكتروني:</span>
              <span className="font-bold text-emerald-700 flex items-center gap-1 text-[11px]">
                <FileCheck className="w-3.5 h-3.5" />
                معتمد وموقع
              </span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-slate-400">المرفقات الرسمية:</span>
              <div className="flex items-center gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${employee.id_card_url ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  بطاقة الهوية {employee.id_card_url ? '✓' : '-'}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${employee.photo_url ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                  الصورة الشخصية {employee.photo_url ? '✓' : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3. شريط ملخص التوثيق والملاحظات الرسمية */}
      {employee.notes && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 text-xs space-y-1">
          <span className="font-bold text-amber-900 block">ملاحظات التدقيق الإداري والميداني:</span>
          <p className="text-amber-800">{employee.notes}</p>
        </div>
      )}
    </div>
  );
};
