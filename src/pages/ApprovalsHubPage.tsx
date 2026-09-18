import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  UserCheck, 
  FileText, 
  Calendar, 
  UserMinus, 
  ShieldAlert, 
  ExternalLink, 
  Eye, 
  Filter,
  Layers,
  ArrowRight
} from 'lucide-react';
import { storageService } from '../lib/storageService';
import { Employee, ProfileUpdateRequest, LeaveRequest, ResignationRequest, PointAsset } from '../lib/types';
import { ApprovalReviewModal } from '../components/admin/ApprovalReviewModal';

export const ApprovalsHubPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'registrations' | 'updates' | 'leaves' | 'resignations'>('registrations');
  const [adminSession, setAdminSession] = useState(storageService.getCurrentAdminSession());

  // قوائم البيانات المعلقة
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>([]);
  const [pendingUpdates, setPendingUpdates] = useState<ProfileUpdateRequest[]>([]);
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [resignations, setResignations] = useState<ResignationRequest[]>([]);
  const [allActiveEmployees, setAllActiveEmployees] = useState<Employee[]>([]);

  // حالة المودال لمراجعة الموظف 33 حقلاً
  const [inspectingEmployee, setInspectingEmployee] = useState<Employee | null>(null);

  // حالات مودال اعتماد الاستقالة
  const [selectedResignation, setSelectedResignation] = useState<ResignationRequest | null>(null);
  const [replacementEmployeeId, setReplacementEmployeeId] = useState('');
  const [custodyClearanceConfirmed, setCustodyClearanceConfirmed] = useState(false);
  const [employeeCustodies, setEmployeeCustodies] = useState<PointAsset[]>([]);

  // رسائل التغذية الراجعة
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshData = () => {
    setPendingEmployees(storageService.getPendingEmployees());
    setPendingUpdates(storageService.getPendingUpdateRequests());
    setLeaves(storageService.getLeaves());
    setResignations(storageService.getResignations());
    setAllActiveEmployees(storageService.getAllEmployees().filter(e => e.status === 'نشط'));
  };

  useEffect(() => {
    refreshData();
  }, []);

  const isSupervisor = adminSession?.user?.role === 'مشرف_ميداني';
  const isCoordinator = adminSession?.user?.role === 'منسق_مشروع';
  const isSuperAdmin = adminSession?.user?.role === 'سوبر_أدمن';
  const supervisorName = adminSession?.user?.name || '';
  const supervisorKeyword = supervisorName.includes('أشرف') ? 'أشرف'
    : supervisorName.includes('براء') ? 'براء'
    : supervisorName.includes('هادي') ? 'هادي'
    : supervisorName.includes('ياسمين') ? 'ياسمين'
    : '';

  const displayedPendingEmployees = isSupervisor && supervisorKeyword
    ? pendingEmployees.filter(e => !e.supervisor_name || e.supervisor_name.includes(supervisorKeyword))
    : pendingEmployees;

  const reviewerName = adminSession?.user ? `${adminSession.user.name} (${adminSession.user.role_display})` : 'الإدارة المركزية';

  // 1. إجراءات اعتماد الموظف الجديد
  const handleApproveEmployee = (nationalId: string) => {
    const ok = storageService.approveEmployee(nationalId, reviewerName);
    if (ok) {
      setActionMessage({ type: 'success', text: `تم اعتماد وتفعيل الموظف (هوية: ${nationalId}) بنجاح!` });
      refreshData();
    }
  };

  const handleRejectEmployee = (nationalId: string) => {
    const reason = prompt('يرجى كتابة ملاحظات التدقيق أو سبب عدم الاعتماد:');
    if (reason) {
      storageService.rejectEmployee(nationalId, reason);
      setActionMessage({ type: 'error', text: `تم تسجيل ملاحظات المراجعة للموظف (هوية: ${nationalId}).` });
      refreshData();
    }
  };

  // 2. إجراءات تعديل الملف
  const handleApproveUpdate = (id: string) => {
    const ok = storageService.approveUpdateRequest(id, reviewerName);
    if (ok) {
      setActionMessage({ type: 'success', text: 'تم اعتماد وتطبيق التعديل على ملف الموظف فوراً.' });
      refreshData();
    }
  };

  const handleRejectUpdate = (id: string) => {
    const ok = storageService.rejectUpdateRequest(id, reviewerName);
    if (ok) {
      setActionMessage({ type: 'error', text: 'تم رفض طلب تعديل البيانات.' });
      refreshData();
    }
  };

  // 3. إجراءات الإجازات
  const handleApproveLeave = (leaveId: string) => {
    const ok = storageService.approveLeave(leaveId, reviewerName);
    if (ok) {
      setActionMessage({ type: 'success', text: 'تم اعتماد الإجازة وتحديث حالة الكادر الميداني.' });
      refreshData();
    }
  };

  const handleRejectLeave = (leaveId: string) => {
    const reason = prompt('يرجى تحديد سبب رفض الإجازة الميدانية:');
    if (reason !== null) {
      storageService.rejectLeave(leaveId, reviewerName, reason);
      setActionMessage({ type: 'error', text: 'تم رفض طلب الإجازة وإشعار الكادر.' });
      refreshData();
    }
  };

  // 4. إجراءات الاستقالة (مع البديل والعهد الصارمة)
  const handleOpenResignationModal = (res: ResignationRequest) => {
    setSelectedResignation(res);
    setReplacementEmployeeId('');
    setCustodyClearanceConfirmed(false);
    const custodies = storageService.getEmployeeCustodies(res.employee_id, res.employee_name);
    setEmployeeCustodies(custodies);
  };

  const handleConfirmResignationApproval = () => {
    if (!selectedResignation) return;

    if (isSupervisor) {
      alert('تنبيه الصلاحيات: اعتماد الاستقالة وتعيين الكادر البديل وإخلاء الطرف محصور بمنسقة المشروع (أ. أمل عوض) أو السوبر أدمن (أ. أشرف الصليبي) لضمان التوافق الإداري العام.');
      return;
    }

    if (!replacementEmployeeId) {
      alert('قاعدة تشغيلية صارمة: يجب اختيار الكادر البديل لتغطية النقطة قبل الاعتماد!');
      return;
    }

    if (employeeCustodies.length > 0 && !custodyClearanceConfirmed) {
      alert('يجب التأكيد على تسليم كافة العهد الميدانية المسجلة باسم الموظف قبل الاعتماد النهائي!');
      return;
    }

    const res = storageService.approveResignation(
      selectedResignation.id || '',
      replacementEmployeeId,
      reviewerName
    );

    if (res.success) {
      setActionMessage({ type: 'success', text: res.message });
      setSelectedResignation(null);
      refreshData();
    } else {
      alert(res.message);
    }
  };

  const handleRejectResignation = (id: string) => {
    const reason = prompt('سبب رفض أو تعليق طلب الاستقالة:');
    if (reason) {
      storageService.rejectResignation(id, reviewerName, reason);
      setActionMessage({ type: 'error', text: 'تم رفض طلب الاستقالة.' });
      refreshData();
    }
  };

  // العدادات الإجمالية للطلبات المعلقة
  const pendingLeavesCount = leaves.filter(l => l.status === 'معلق').length;
  const pendingResignationsCount = resignations.filter(r => r.status === 'معلق').length;
  const totalPendingAll = pendingEmployees.length + pendingUpdates.length + pendingLeavesCount + pendingResignationsCount;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* الترويسة وعداد المهام */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-slate-100 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            مركز القرارات والاعتمادات الإدارية
          </div>
          <h1 className="text-2xl font-black text-slate-900">
            مراجعة واعتماد العمليات الميدانية للمشروع
          </h1>
          <p className="text-xs text-slate-500 max-w-2xl">
            بوابة الإشراف المباشر والرقابة المركزية لاعتماد تسجيل الكوادر الجدد، طلبات التعديل، الإجازات، وإخلاء طرف الاستقالات وتعيين البدلاء لضمان استمرارية الخدمات.
          </p>
        </div>

        <div className="flex items-center gap-4 shrink-0">
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center min-w-[120px]">
            <span className="block text-2xl font-black text-amber-600">{totalPendingAll}</span>
            <span className="text-[11px] font-bold text-slate-500">إجمالي المعلق</span>
          </div>
          {adminSession && (
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 text-right">
              <span className="text-[10px] font-bold text-purple-700 block">المستخدم الإداري النشط:</span>
              <span className="text-xs font-black text-purple-950 block">{adminSession.user.name}</span>
              <span className="text-[10px] text-purple-600 font-semibold">{adminSession.user.role_display}</span>
            </div>
          )}
        </div>
      </div>

      {/* تنبيه التغذية الراجعة */}
      {actionMessage && (
        <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center justify-between ${
          actionMessage.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-rose-50 border-rose-200 text-rose-800'
        }`}>
          <div className="flex items-center gap-2">
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
            <span>{actionMessage.text}</span>
          </div>
          <button onClick={() => setActionMessage(null)} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            إغلاق
          </button>
        </div>
      )}

      {/* تبويبات الاعتماد الأربعة */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('registrations')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'registrations'
              ? 'bg-aei-purple text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>اعتمادات الكوادر الجدد</span>
          {pendingEmployees.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
              {pendingEmployees.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('updates')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'updates'
              ? 'bg-aei-purple text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>طلبات تعديل الملفات</span>
          {pendingUpdates.length > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
              {pendingUpdates.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('leaves')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'leaves'
              ? 'bg-aei-purple text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>طلبات الإجازات الميدانية</span>
          {pendingLeavesCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-900">
              {pendingLeavesCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('resignations')}
          className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-bold text-xs cursor-pointer transition-all ${
            activeTab === 'resignations'
              ? 'bg-aei-purple text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <UserMinus className="w-4 h-4" />
          <span>طلبات الاستقالة والبدلاء</span>
          {pendingResignationsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-500 text-white">
              {pendingResignationsCount}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. تبويب اعتمادات الكوادر الجدد */}
      {/* ========================================================================= */}
      {activeTab === 'registrations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-black text-slate-800">
              قائمة طلبات تسجيل الكوادر المعلقة بانتظار الاعتماد ({displayedPendingEmployees.length})
            </h2>
            {isSupervisor && (
              <span className="text-[11px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-3 py-1 rounded-full font-bold">
                عرض كوادر نقاط إشرافك الميداني فقط ({supervisorName})
              </span>
            )}
          </div>

          {displayedPendingEmployees.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد طلبات تسجيل كادر معلقة حالياً</h3>
              <p className="text-xs text-slate-400">جميع الكوادر الميدانية معتمدة ومفعلة بنجاح.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPendingEmployees.map((emp) => (
                <div key={emp.national_id} className="bg-white rounded-2xl p-5 border border-amber-200 shadow-sm space-y-4 relative overflow-hidden">
                  <div className="absolute top-0 right-0 left-0 h-1 bg-amber-400" />
                  
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{emp.full_name_ar}</h3>
                      <p className="text-xs text-slate-500 font-mono mt-0.5">هوية: {emp.national_id}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 shrink-0">
                      معلق قيد الاعتماد
                    </span>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-1.5 text-slate-600 border border-slate-100">
                    <div className="flex justify-between">
                      <span className="text-slate-400">المسمى:</span>
                      <span className="font-bold text-slate-800">{emp.job_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">النقطة:</span>
                      <span className="font-bold text-slate-800">{emp.current_point_name || 'غير محدد'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">المشرف:</span>
                      <span className="font-bold text-slate-800">{emp.supervisor_name || 'أشرف الصليبي'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الهاتف:</span>
                      <span className="font-bold font-mono text-slate-800">{emp.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => setInspectingEmployee(emp)}
                      className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      فحص 33 حقلاً
                    </button>
                    <button
                      onClick={() => handleApproveEmployee(emp.national_id)}
                      className="py-2 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      اعتماد
                    </button>
                    <button
                      onClick={() => handleRejectEmployee(emp.national_id)}
                      className="py-2 px-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                      title="طلب تعديل أو رفض"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. تبويب طلبات تعديل البيانات (Diff View) */}
      {/* ========================================================================= */}
      {activeTab === 'updates' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-800">
            طلبات تعديل البيانات الشخصية والبنكية ({pendingUpdates.length})
          </h2>

          {pendingUpdates.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد طلبات تعديل بيانات معلقة</h3>
              <p className="text-xs text-slate-400">ملفات جميع الكوادر محدثة ومطابقة.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingUpdates.map((req) => (
                <div key={req.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{req.employee_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">الهوية: {req.national_id}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      طلب تعديل {req.field_label_ar}
                    </span>
                  </div>

                  {/* مقارنة بصرية بين القديم والجديد */}
                  <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">القيمة السابقة (الأصلية):</span>
                      <span className="font-semibold text-rose-700 bg-rose-50 px-2 py-1 rounded block border border-rose-100 line-through">
                        {req.old_value || '(فارغ)'}
                      </span>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-400 block">القيمة الجديدة المقترحة:</span>
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded block border border-emerald-100">
                        {req.new_value}
                      </span>
                    </div>
                  </div>

                  {req.reason && (
                    <p className="text-[11px] text-slate-500 italic bg-slate-50 p-2 rounded-lg">
                      <span className="font-bold">المبرر:</span> {req.reason}
                    </p>
                  )}

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => handleApproveUpdate(req.id)}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      اعتماد التعديل وتطبيقه
                    </button>
                    <button
                      onClick={() => handleRejectUpdate(req.id)}
                      className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                    >
                      رفض
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. تبويب طلبات الإجازات الميدانية */}
      {/* ========================================================================= */}
      {activeTab === 'leaves' && (
        <div className="space-y-4">
          <h2 className="text-base font-black text-slate-800">
            سجل طلبات الإجازات الميدانية والتقارير الطبية ({leaves.length})
          </h2>

          {leaves.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <Calendar className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد طلبات إجازة مسجلة</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {leaves.map((leave) => (
                <div key={leave.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{leave.employee_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">هوية: {leave.national_id || leave.employee_id}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      leave.status === 'معتمد_نهائي'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : leave.status === 'مرفوض'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {leave.status === 'معتمد_نهائي' ? 'معتمدة' : leave.status === 'مرفوض' ? 'مرفوضة' : 'معلقة للمراجعة'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                    <div className="flex justify-between">
                      <span className="text-slate-400">نوع الإجازة:</span>
                      <span className="font-bold text-aei-purple">{leave.leave_type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">المدة الإجمالية:</span>
                      <span className="font-bold text-slate-800">{leave.total_days} أيام</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">الفترة:</span>
                      <span className="font-semibold text-slate-700 font-mono">
                        من {leave.start_date} إلى {leave.end_date}
                      </span>
                    </div>
                    {leave.notes && (
                      <div className="pt-1 border-t border-slate-200 text-slate-600 italic">
                        {leave.notes}
                      </div>
                    )}
                  </div>

                  {leave.medical_report_url && (
                    <a
                      href={leave.medical_report_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-2 px-3 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      معاينة التقرير الطبي المرفق
                    </a>
                  )}

                  {leave.status === 'معلق' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleApproveLeave(leave.id || '')}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1 cursor-pointer shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        اعتماد الإجازة
                      </button>
                      <button
                        onClick={() => handleRejectLeave(leave.id || '')}
                        className="px-4 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs cursor-pointer"
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. تبويب طلبات الاستقالة (مع إلزامية الكادر البديل وإخلاء طرف العهد) */}
      {/* ========================================================================= */}
      {activeTab === 'resignations' && (
        <div className="space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs font-bold text-amber-900 flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span>البروتوكول الإداري الصارم لاعتماد الاستقالات:</span>
              <p className="text-[11px] font-normal text-amber-800 mt-1">
                لا يجوز اعتماد أي استقالة لكادر ميداني دون تعيين الموظف البديل الذي سيتسلم مهام النقطة، والتحقق التام من مطابقة العهد الميدانية ومخالصتها.
              </p>
            </div>
          </div>

          <h2 className="text-base font-black text-slate-800">
            طلبات الاستقالة المسجلة ({resignations.length})
          </h2>

          {resignations.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-100 space-y-3">
              <div className="w-14 h-14 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
                <UserMinus className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-slate-800">لا توجد طلبات استقالة مسجلة</h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {resignations.map((res) => (
                <div key={res.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-black text-slate-900">{res.employee_name}</h3>
                      <p className="text-xs text-slate-500 font-mono">الهوية: {res.national_id || res.employee_id}</p>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                      res.status === 'معتمد'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : res.status === 'مرفوض'
                        ? 'bg-slate-100 text-slate-700'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {res.status === 'معتمد' ? 'استقالة معتمدة' : res.status === 'مرفوض' ? 'مرفوضة' : 'بانتظار البديل والمخالصة'}
                    </span>
                  </div>

                  <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 text-xs space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">عنوان السبب:</span>
                      <span className="font-bold text-slate-800">{res.reason_title}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">آخر يوم عمل مقترح:</span>
                      <span className="font-semibold text-rose-600 font-mono">{res.last_working_date}</span>
                    </div>
                    <div className="text-slate-600 italic bg-white p-2 rounded-lg border border-slate-200">
                      {res.reason_details}
                    </div>

                    {res.replacement_employee_name && (
                      <div className="flex justify-between pt-1 border-t border-slate-200">
                        <span className="text-emerald-700 font-bold">الكادر البديل المعين:</span>
                        <span className="font-black text-emerald-900">{res.replacement_employee_name}</span>
                      </div>
                    )}
                  </div>

                  {res.hand_letter_url && (
                    <a
                      href={res.hand_letter_url}
                      target="_blank"
                      rel="noreferrer"
                      className="block text-center py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold cursor-pointer"
                    >
                      معاينة الخطاب المكتوب والموقع يدوياً
                    </a>
                  )}

                  {res.status === 'معلق' && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleOpenResignationModal(res)}
                        className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                      >
                        <UserCheck className="w-4 h-4" />
                        تعيين البديل واعتماد الاستقالة
                      </button>
                      <button
                        onClick={() => handleRejectResignation(res.id || '')}
                        className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-xs cursor-pointer"
                      >
                        رفض
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================================================= */}
      {/* نافذة فحص بيانات الموظف الـ 33 حقلاً (ApprovalReviewModal) */}
      {/* ========================================================================= */}
      <ApprovalReviewModal
        employee={inspectingEmployee}
        isOpen={!!inspectingEmployee}
        onClose={() => {
          setInspectingEmployee(null);
          refreshData();
        }}
      />

      {/* ========================================================================= */}
      {/* نافذة اعتماد الاستقالة الصارمة (اختيار البديل الإلزامي ومخالصة العهد) */}
      {/* ========================================================================= */}
      {selectedResignation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-slate-900">اعتماد استقالة وتعيين كادر بديل</h3>
                <p className="text-xs text-slate-500">
                  للكادر: {selectedResignation.employee_name} (هوية: {selectedResignation.employee_id})
                </p>
              </div>
              <button
                onClick={() => setSelectedResignation(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* 1. قسم العهد الميدانية */}
            <div className="space-y-3">
              <h4 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-aei-purple" />
                حصر العهد والمقتنيات المسجلة باسم الموظف:
              </h4>

              {employeeCustodies.length === 0 ? (
                <div className="bg-emerald-50 text-emerald-800 border border-emerald-200 p-3 rounded-xl text-xs font-bold">
                  لا توجد أي عهد أو مقتنيات مسجلة باسم هذا الموظف في النظام (إخلاء طرف تلقائي).
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 font-semibold">
                    يوجد ({employeeCustodies.length}) عهدة مسجلة يجب استلامها والتأكد من سلامتها:
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {employeeCustodies.map((ast) => (
                      <div key={ast.id} className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex items-center justify-between">
                        <div>
                          <span className="font-mono font-bold text-aei-purple ml-2">{ast.serial_number}</span>
                          <span className="font-bold text-slate-800">{ast.asset_name}</span>
                        </div>
                        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded font-bold">{ast.condition}</span>
                      </div>
                    ))}
                  </div>

                  <label className="flex items-center gap-2 pt-2 text-xs font-bold text-slate-800 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={custodyClearanceConfirmed}
                      onChange={(e) => setCustodyClearanceConfirmed(e.target.checked)}
                      className="w-4 h-4 rounded text-aei-purple border-slate-300"
                    />
                    <span>أؤكد استلام كافة العهد المذكورة أعلاه بحالة سليمة ومطابقة للمحضر.</span>
                  </label>
                </div>
              )}
            </div>

            {/* 2. قسم اختيار الكادر البديل الإلزامي */}
            <div className="space-y-3 pt-2 border-t border-slate-100">
              <label className="block text-xs font-black text-slate-800">
                اختيار الكادر البديل الإلزامي لتغطية النقطة <span className="text-rose-500">*</span>:
              </label>
              <select
                value={replacementEmployeeId}
                onChange={(e) => setReplacementEmployeeId(e.target.value)}
                className="w-full px-4 py-3 text-xs rounded-xl border border-slate-200 focus:ring-2 focus:ring-aei-purple/20 focus:border-aei-purple font-semibold text-slate-800 bg-white"
              >
                <option value="">-- اختر موظفاً بديلاً من الكوادر النشطة في المشروع --</option>
                {allActiveEmployees
                  .filter((e) => e.national_id !== selectedResignation.employee_id)
                  .map((e) => (
                    <option key={e.national_id} value={e.national_id}>
                      {e.full_name_ar} ({e.job_title}) - النقطة الحالية: {e.current_point_name}
                    </option>
                  ))}
              </select>
              <p className="text-[11px] text-slate-400">
                سيتم تحويل صفة المستقيل إلى "مستقيل"، وسيتولى الكادر البديل تغطية مهام النقطة في التقارير الإدارية والمالية.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedResignation(null)}
                className="px-5 py-2.5 rounded-xl bg-slate-100 text-slate-600 font-bold text-xs cursor-pointer"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={handleConfirmResignationApproval}
                disabled={!replacementEmployeeId || (employeeCustodies.length > 0 && !custodyClearanceConfirmed)}
                className="px-6 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                تأكيد الاعتماد ونقل المهام
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
