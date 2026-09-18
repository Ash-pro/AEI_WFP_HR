import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { storageService } from '../lib/storageService';
import { Employee, PointAsset, ProfileUpdateRequest } from '../lib/types';
import { 
  Lock, CreditCard, User, Phone, Building2, MapPin, 
  GraduationCap, Landmark, QrCode, AlertCircle, CheckCircle2, 
  Clock, LogOut, Printer, Edit3, Send, ShieldCheck, Briefcase, 
  Layers, ChevronRight, X
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const EmployeePortalPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialId = searchParams.get('id') || '';

  // Auth state
  const [nationalId, setNationalId] = useState(initialId);
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Authenticated state
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [custodies, setCustodies] = useState<PointAsset[]>([]);
  const [activeTab, setActiveTab] = useState<'info' | 'custodies' | 'updates'>('info');

  // Edit request modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editField, setEditField] = useState('phone');
  const [editLabel, setEditLabel] = useState('رقم الجوال للتواصل');
  const [editNewValue, setEditNewValue] = useState('');
  const [editReason, setEditReason] = useState('');
  const [submittingEdit, setSubmittingEdit] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState<string | null>(null);

  // Check existing session or initial ID
  useEffect(() => {
    const current = storageService.getCurrentSession();
    if (current && (!initialId || current.national_id === initialId)) {
      loadEmployeeData(current);
    } else if (initialId) {
      setNationalId(initialId);
    }
  }, [initialId]);

  const loadEmployeeData = (emp: Employee) => {
    setEmployee(emp);
    const staffCustodies = storageService.getEmployeeCustodies(emp.national_id, emp.full_name_ar);
    setCustodies(staffCustodies);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nationalId.trim().length !== 9) {
      setError('رقم الهوية يجب أن يتكون من 9 أرقام تماماً');
      return;
    }

    if (pin.trim().length < 4) {
      setError('رمز المرور PIN يجب أن يتكون من 4 أرقام على الأقل');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const res = storageService.verifyPin(nationalId, pin);
      if (!res.success) {
        setError(res.message);
        return;
      }

      loadEmployeeData(res.employee!);
    }, 400);
  };

  const handleLogout = () => {
    storageService.clearSession();
    setEmployee(null);
    setPin('');
  };

  const handleOpenEditModal = (fieldName: string, labelAr: string, currentVal?: string) => {
    setEditField(fieldName);
    setEditLabel(labelAr);
    setEditNewValue(currentVal || '');
    setEditReason('');
    setEditSuccessMsg(null);
    setShowEditModal(true);
  };

  const handleSubmitEditRequest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employee) return;

    if (!editNewValue.trim()) {
      alert('الرجاء إدخال القيمة الجديدة المطلوبة');
      return;
    }

    setSubmittingEdit(true);

    setTimeout(() => {
      setSubmittingEdit(false);
      storageService.submitProfileUpdateRequest({
        employee_id: employee.id || employee.national_id,
        national_id: employee.national_id,
        employee_name: employee.full_name_ar,
        field_name: editField,
        field_label_ar: editLabel,
        old_value: String((employee as any)[editField] || ''),
        new_value: editNewValue.trim(),
        reason: editReason.trim()
      });

      setEditSuccessMsg(`تم إرسال طلب تعديل (${editLabel}) للمشرف الميداني بنجاح للمراجعة والاعتماد.`);
      setTimeout(() => {
        setShowEditModal(false);
        setEditSuccessMsg(null);
      }, 1800);
    }, 400);
  };

  // If NOT logged in, render strict login view
  if (!employee) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-slate-100 space-y-6">
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-aei-purple/10 text-aei-purple flex items-center justify-center mx-auto mb-2">
              <Lock className="w-7 h-7" />
            </div>
            <h1 className="text-2xl font-black text-slate-900">بوابة الخدمة الذاتية للموظف</h1>
            <p className="text-xs text-slate-500 leading-relaxed">
              تسجيل الدخول الآمن للاطلاع على بطاقة العمل الميدانية، باركود التحقق، والعهد الشخصية المسجلة باسمك.
            </p>
          </div>

          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <span className="leading-relaxed">{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهوية الوطنية (9 أرقام) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <CreditCard className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  maxLength={9}
                  value={nationalId}
                  onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                  placeholder="مثال: 402938682"
                  className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-semibold tracking-wider transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رمز المرور البسيط (PIN) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-5 h-5 absolute right-3.5 top-3 text-slate-400" />
                <input
                  type="password"
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  placeholder="الرمز السري الذي عينته أثناء التسجيل"
                  className="w-full pr-11 pl-4 py-3 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-semibold tracking-widest transition-all"
                  required
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                * الرمز السري البسيط المكون من 4 إلى 6 أرقام لحماية ملفك الشخصي.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light hover:to-aei-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? 'جاري التحقق من الرمز...' : 'دخول إلى بوابتي'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>

          <div className="pt-4 border-t border-slate-100 text-center space-y-2">
            <p className="text-xs text-slate-500">لم تقم بتسجيل بياناتك أو تعيين رمز PIN بعد؟</p>
            <a
              href="/register"
              className="inline-block text-xs font-bold text-aei-purple hover:underline"
            >
              التوجه لاستمارة تسجيل الكوادر الميدانية (33 حقلاً)
            </a>
          </div>
        </div>
      </div>
    );
  }

  // If LOGGED IN, render full interactive portal
  const isPending = employee.status === 'معلق_قيد_الاعتماد';
  const pendingRequests = storageService.getPendingUpdateRequests().filter(r => r.national_id === employee.national_id);

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-aei-purple to-aei-purple-light text-white flex items-center justify-center font-black text-2xl shadow-md flex-shrink-0">
            {employee.full_name_ar.charAt(0)}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">{employee.full_name_ar}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                isPending 
                  ? 'bg-amber-100 text-amber-800 border-amber-300' 
                  : 'bg-emerald-100 text-emerald-800 border-emerald-300'
              }`}>
                {isPending ? 'معلق • قيد الاعتماد' : 'كادر معتمد • نشط'}
              </span>
            </div>
            <p className="text-sm font-semibold text-aei-purple">{employee.job_title}</p>
            <div className="flex items-center gap-4 text-xs text-slate-500 flex-wrap">
              <span className="flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-aei-gold" />
                {employee.current_point_name || 'الميدان'}
              </span>
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-slate-400" />
                المشرف: {employee.supervisor_name || 'الإدارة'}
              </span>
              <span className="flex items-center gap-1" dir="ltr">
                <Phone className="w-3.5 h-3.5 text-aei-green" />
                {employee.phone}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end md:self-auto">
          <button
            onClick={() => window.print()}
            className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            طباعة البطاقة
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            خروج
          </button>
        </div>
      </div>

      {/* Prominent Pending Approval Warning Banner */}
      {isPending && (
        <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 text-amber-900 shadow-sm flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center flex-shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-extrabold text-amber-900">حالة الملف: قيد المراجعة والاعتماد الميداني</h3>
            <p className="text-xs text-amber-800 leading-relaxed">
              تم استلام وتوثيق بياناتك في النظام بنجاح. ملفك معلق حالياً بانتظار فحص وموافقة المشرف الميداني المسؤول 
              <span className="font-bold underline mx-1">({employee.supervisor_name})</span> 
              أو منسقة المشروع <span className="font-bold underline mx-1">(أمل سمير اسماعيل عوض)</span>. فور قيام المشرف باعتماد ملفك ستتحول حالتك إلى "نشط" وتصبح بطاقة العمل والعهد مفعلة رسمياً.
            </p>
          </div>
        </div>
      )}

      {/* Main Grid: Card & Navigation Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Official Staff ID Badge */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-3xl p-6 shadow-xl border border-slate-100 space-y-5 print:p-0 print:border-none">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800">بطاقة العمل الميدانية الرسمية</span>
              <span className="text-[10px] font-mono text-slate-400">{employee.qr_token}</span>
            </div>

            {/* Official ID Card Layout */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-purple-900 to-aei-purple text-white relative overflow-hidden shadow-lg">
              <div className="flex justify-between items-start gap-2 border-b border-white/20 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-bold text-aei-gold block">جمعية أرض الإنسان - فلسطين</span>
                  <span className="text-[9px] text-white/80 block">مشروع برنامج الأغذية العالمي (WFP)</span>
                </div>
                <span className="px-2 py-0.5 rounded text-[9px] font-extrabold bg-white/20 text-white">
                  {employee.category}
                </span>
              </div>

              <div className="flex items-center gap-4">
                <div className="p-2 bg-white rounded-xl shadow-md">
                  <QRCodeSVG 
                    value={`AEI-WFP-STAFF:${employee.national_id}|${employee.full_name_ar}`} 
                    size={76} 
                    level="M" 
                  />
                </div>
                <div className="space-y-0.5 min-w-0">
                  <h4 className="font-black text-sm text-white truncate">{employee.full_name_ar}</h4>
                  <p className="text-[11px] text-white/90 font-medium">{employee.job_title}</p>
                  <p className="text-[10px] text-aei-gold font-mono">ID: {employee.national_id}</p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-white/20 text-[10px] text-white/80 flex justify-between items-center">
                <span>النقطة: {employee.current_point_name || 'الميدان'}</span>
                <span className={`px-2 py-0.5 rounded-full font-bold ${isPending ? 'bg-amber-400 text-amber-950' : 'bg-emerald-400 text-emerald-950'}`}>
                  {isPending ? 'قيد الاعتماد' : 'معتمد'}
                </span>
              </div>
            </div>

            <div className="text-center text-xs text-slate-400 space-y-1">
              <p>تستخدم هذه البطاقة للتحقق من هوية الكادر الميداني لدى نقاط التوزيع والعيادات.</p>
            </div>
          </div>
        </div>

        {/* Right Column: Tabbed Information */}
        <div className="lg:col-span-2 space-y-4">
          {/* Tabs Bar */}
          <div className="bg-white rounded-2xl p-1.5 shadow-sm border border-slate-100 flex items-center gap-1 text-xs font-bold">
            <button
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'info' 
                  ? 'bg-aei-purple text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <User className="w-4 h-4" />
              بيانات الملف الوظيفي
            </button>
            <button
              onClick={() => setActiveTab('custodies')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'custodies' 
                  ? 'bg-aei-purple text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Briefcase className="w-4 h-4" />
              العهد والمقتنيات ({custodies.length})
            </button>
            <button
              onClick={() => setActiveTab('updates')}
              className={`flex-1 py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                activeTab === 'updates' 
                  ? 'bg-aei-purple text-white shadow-sm' 
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="w-4 h-4" />
              طلبات التعديل ({pendingRequests.length})
            </button>
          </div>

          {/* Tab 1: Staff Info */}
          {activeTab === 'info' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-6">
              <div>
                <h3 className="text-sm font-extrabold text-slate-800 border-r-4 border-aei-purple pr-2.5 mb-4">
                  1. البيانات الشخصية وبيانات الاتصال
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">الاسم كاملاً بالعربية</span>
                    <span className="font-bold text-slate-800 text-sm">{employee.full_name_ar}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">الاسم باللغة الإنجليزية</span>
                    <span className="font-bold text-slate-800 text-sm" dir="ltr">{employee.full_name_en || 'Not specified'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block mb-0.5">رقم الجوال الأساسي</span>
                      <span className="font-bold text-slate-800 text-sm font-mono" dir="ltr">{employee.phone}</span>
                    </div>
                    <button
                      onClick={() => handleOpenEditModal('phone', 'رقم الجوال للتواصل', employee.phone)}
                      className="text-aei-purple hover:underline text-[11px] font-bold"
                    >
                      طلب تعديل
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">الحالة الاجتماعية وحجم العائلة</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {employee.marital_status || 'أعزب'} • (أفراد: {employee.family_count || 0})
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800 border-r-4 border-aei-green pr-2.5 mb-4">
                  2. السكن الحالي والعنوان قبل الحرب
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block mb-0.5">العنوان الحالي (أثناء الحرب)</span>
                      <span className="font-bold text-slate-800">{employee.current_address || 'دير البلح / الوسطى'}</span>
                    </div>
                    <button
                      onClick={() => handleOpenEditModal('current_address', 'العنوان الحالي ومكان النزوح', employee.current_address)}
                      className="text-aei-purple hover:underline text-[11px] font-bold"
                    >
                      طلب تعديل
                    </button>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">طبيعة السكن الحالي</span>
                    <span className="font-bold text-slate-800">{employee.housing_type || 'نزوح - خيمة'}</span>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-extrabold text-slate-800 border-r-4 border-aei-gold pr-2.5 mb-4">
                  3. البيانات المالية والمصرفية
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                    <span className="text-slate-400 block mb-0.5">طريقة استلام المستحقات</span>
                    <span className="font-bold text-slate-800">{employee.payment_method || 'حساب بنك فلسطين'}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/60 flex justify-between items-center">
                    <div>
                      <span className="text-slate-400 block mb-0.5">رقم الحساب / الآيبان / المحفظة</span>
                      <span className="font-bold text-slate-800 font-mono" dir="ltr">{employee.iban_or_phone || employee.bank_account || 'غير محدد'}</span>
                    </div>
                    <button
                      onClick={() => handleOpenEditModal('iban_or_phone', 'الآيبان أو رقم الحساب البنكي', employee.iban_or_phone)}
                      className="text-aei-purple hover:underline text-[11px] font-bold"
                    >
                      طلب تعديل
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Custodies and Assets */}
          {activeTab === 'custodies' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">العهد والمقتنيات المسجلة كـ (عهدة لموظف)</h3>
                  <p className="text-xs text-slate-500">الأجهزة والمعدات الميدانية المسلمة إليك بمسؤولية مباشرة</p>
                </div>
                <span className="px-3 py-1 rounded-full text-xs font-black bg-purple-50 text-aei-purple">
                  إجمالي العهد: {custodies.length}
                </span>
              </div>

              {custodies.length > 0 ? (
                <div className="space-y-3">
                  {custodies.map((item) => (
                    <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-start gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-purple-100 text-aei-purple border border-purple-200">
                              {item.serial_number}
                            </span>
                            <h4 className="font-extrabold text-sm text-slate-900">{item.asset_name}</h4>
                          </div>
                          <p className="text-xs text-slate-500 mt-1">{item.specifications || 'بدون مواصفات إضافية'}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          item.condition === 'سليم' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : item.condition === 'معطوب' 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          حالة الأصل: {item.condition}
                        </span>
                      </div>

                      <div className="pt-2 border-t border-slate-200/50 flex justify-between items-center text-[11px] text-slate-500">
                        <span>اللون: {item.asset_color || 'افتراضي'} • الكمية: {item.quantity}</span>
                        <span>النقطة: {item.point_name}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 text-center space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <Briefcase className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-slate-500">لا توجد عهد ومقتنيات شخصية مسجلة باسمك حالياً</p>
                  <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                    عند تسليمك أجهزة ميدانية (موازين، أجهزة قياس هيموكيو، تابلت) سيقوم المشرف بإضافتها برقمها التسلسلي (AST-0100X) لتظهر هنا تلقائياً.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Update Requests */}
          {activeTab === 'updates' && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-100 space-y-5">
              <div className="flex justify-between items-center border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-sm font-extrabold text-slate-900">طلبات تعديل البيانات المعلقة والمكتملة</h3>
                  <p className="text-xs text-slate-500">متابعة موافقة المشرف الميداني على تعديل بياناتك</p>
                </div>
                <button
                  onClick={() => handleOpenEditModal('phone', 'رقم الجوال للتواصل', employee.phone)}
                  className="px-3 py-1.5 rounded-xl bg-aei-purple text-white font-bold text-xs hover:bg-aei-purple-dark transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  طلب تعديل جديد
                </button>
              </div>

              {pendingRequests.length > 0 ? (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <div key={req.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-xs text-slate-900">{req.field_label_ar}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                          قيد مراجعة المشرف
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-xs bg-white p-2.5 rounded-xl border border-slate-200/50">
                        <div>
                          <span className="text-[10px] text-slate-400 block">القيمة السابقة</span>
                          <span className="text-slate-600 line-through">{req.old_value || '(فارغ)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 font-bold block">القيمة الجديدة المطلوبة</span>
                          <span className="text-emerald-700 font-bold">{req.new_value}</span>
                        </div>
                      </div>
                      {req.reason && (
                        <p className="text-[11px] text-slate-500">سبب التعديل: {req.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-10 text-center space-y-2 text-xs text-slate-400">
                  <p>لا توجد طلبات تعديل معلقة حالياً.</p>
                  <p className="text-[11px]">إذا طرأ تغيير على جوالك أو عنوانك أو حسابك البنكي، يمكنك الضغط على "طلب تعديل جديد".</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Request Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <h3 className="font-extrabold text-base text-slate-900">طلب تعديل: {editLabel}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {editSuccessMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmitEditRequest} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  القيمة الجديدة المقترحة <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  value={editNewValue}
                  onChange={(e) => setEditNewValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-semibold"
                  placeholder="أدخل القيمة الجديدة بدقة"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  سبب التعديل (اختياري)
                </label>
                <textarea
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-xs"
                  placeholder="مثال: تغيير رقم الجوال بسبب فقدان الشريحة"
                  rows={2}
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-800 leading-relaxed">
                * ملاحظة: يتم إرسال التعديل فوراً إلى المشرف الميداني المسؤول ({employee.supervisor_name}) لاعتماده قبل أن يظهر في ملفك الرسمي.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={submittingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-aei-purple text-white hover:bg-aei-purple-dark font-bold text-xs shadow-md transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  {submittingEdit ? 'جاري الإرسال...' : 'إرسال للمشرف للاعتماد'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
