import React, { useState } from 'react';
import { storageService } from '../../lib/storageService';
import { Employee, ProfileUpdateRequest } from '../../lib/types';
import { 
  X, CheckCircle2, AlertCircle, Clock, UserCheck, 
  ShieldCheck, FileText, ChevronDown, Check, UserX, Eye
} from 'lucide-react';

interface ApprovalReviewModalProps {
  onClose: () => void;
  approverRole?: string; // 'مشرف ميداني' | 'منسقة المشروع' | 'سوبر أدمن'
  approverName?: string;
  onDataChanged?: () => void;
  employee?: Employee | null;
  isOpen?: boolean;
}

export const ApprovalReviewModal: React.FC<ApprovalReviewModalProps> = ({
  onClose,
  approverRole = 'مشرف ميداني',
  approverName = 'أشرف أسامة دياب الصليبي',
  onDataChanged,
  employee,
  isOpen = true
}) => {
  if (!isOpen) return null;

  const [activeSubTab, setActiveSubTab] = useState<'employees' | 'edits'>('employees');
  const [pendingEmployees, setPendingEmployees] = useState<Employee[]>(() => storageService.getPendingEmployees());
  const [pendingEdits, setPendingEdits] = useState<ProfileUpdateRequest[]>(() => storageService.getPendingUpdateRequests());
  
  // Expanded employee for detailed view
  const [selectedEmp, setSelectedEmp] = useState<Employee | null>(() => employee || null);
  const [actionSuccessMsg, setActionSuccessMsg] = useState<string | null>(null);

  React.useEffect(() => {
    if (employee) setSelectedEmp(employee);
  }, [employee]);

  const refreshData = () => {
    setPendingEmployees(storageService.getPendingEmployees());
    setPendingEdits(storageService.getPendingUpdateRequests());
    if (onDataChanged) onDataChanged();
  };

  const handleApproveEmployee = (nationalId: string, empName: string) => {
    storageService.approveEmployee(nationalId, `${approverRole}: ${approverName}`);
    setActionSuccessMsg(`تم اعتماد وتفعيل الكادر (${empName}) بنجاح، وتحولت حالته إلى "نشط".`);
    refreshData();
    if (selectedEmp?.national_id === nationalId) {
      setSelectedEmp(null);
    }
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleRejectEmployee = (nationalId: string, empName: string) => {
    const reason = prompt(`الرجاء إدخال سبب الرفض أو الملاحظات المطلوبة لتعديل ملف (${empName}):`);
    if (reason === null) return;

    storageService.rejectEmployee(nationalId, reason || 'يرجى مراجعة البيانات والمرفقات وتحديثها');
    setActionSuccessMsg(`تم تسجيل ملاحظات المراجعة وإرجاع الملف للكادر (${empName}).`);
    refreshData();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleApproveEdit = (reqId: string, label: string) => {
    storageService.approveUpdateRequest(reqId, `${approverRole}: ${approverName}`);
    setActionSuccessMsg(`تم اعتماد تعديل (${label}) وتطبيقه على السجل الأصلي للموظف.`);
    refreshData();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const handleRejectEdit = (reqId: string, label: string) => {
    storageService.rejectUpdateRequest(reqId, `${approverRole}: ${approverName}`);
    setActionSuccessMsg(`تم رفض طلب تعديل (${label}).`);
    refreshData();
    setTimeout(() => setActionSuccessMsg(null), 3000);
  };

  const totalPending = pendingEmployees.length + pendingEdits.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-4xl w-full overflow-hidden animate-in fade-in zoom-in duration-200 max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-l from-aei-purple to-purple-800 p-6 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-aei-gold" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black">نافذة اعتمادات الكوادر والملفات الميدانية</h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-400 text-amber-950">
                  {totalPending} طلب معلق
                </span>
              </div>
              <p className="text-xs text-white/80">
                صلاحية الاعتماد: <span className="font-bold text-aei-gold">{approverRole}</span> ({approverName})
              </p>
            </div>
          </div>
        </div>

        {/* Subtabs Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-6 pt-3 flex gap-4 text-xs font-bold flex-shrink-0">
          <button
            onClick={() => setActiveSubTab('employees')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'employees' 
                ? 'border-aei-purple text-aei-purple font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserCheck className="w-4 h-4" />
            طلبات تسجيل الكوادر الجديدة
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingEmployees.length > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {pendingEmployees.length}
            </span>
          </button>
          <button
            onClick={() => setActiveSubTab('edits')}
            className={`pb-3 border-b-2 flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'edits' 
                ? 'border-aei-purple text-aei-purple font-extrabold' 
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            طلبات تعديل البيانات الشخصية
            <span className={`px-2 py-0.5 rounded-full text-[10px] ${pendingEdits.length > 0 ? 'bg-purple-100 text-aei-purple font-bold' : 'bg-slate-200 text-slate-600'}`}>
              {pendingEdits.length}
            </span>
          </button>
        </div>

        {/* Feedback Alert */}
        {actionSuccessMsg && (
          <div className="mx-6 mt-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{actionSuccessMsg}</span>
          </div>
        )}

        {/* Scrollable Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          {activeSubTab === 'employees' && (
            <>
              {pendingEmployees.length > 0 ? (
                <div className="space-y-4">
                  {pendingEmployees.map((emp) => (
                    <div 
                      key={emp.national_id} 
                      className="p-5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-aei-purple/40 transition-all space-y-3"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-black px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {emp.national_id}
                            </span>
                            <h3 className="font-extrabold text-base text-slate-900">{emp.full_name_ar}</h3>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              معلق بانتظار الاعتماد
                            </span>
                          </div>
                          <p className="text-xs text-slate-500">
                            {emp.job_title} • {emp.department} • النقطة: <span className="font-bold text-slate-700">{emp.current_point_name || 'غير محدد'}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedEmp(selectedEmp?.national_id === emp.national_id ? null : emp)}
                            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            {selectedEmp?.national_id === emp.national_id ? 'إخفاء التفاصيل' : 'فحص التفاصيل (33 حقلاً)'}
                          </button>
                          <button
                            onClick={() => handleRejectEmployee(emp.national_id, emp.full_name_ar)}
                            className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            طلب تعديل / رفض
                          </button>
                          <button
                            onClick={() => handleApproveEmployee(emp.national_id, emp.full_name_ar)}
                            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-sm transition-all"
                          >
                            <Check className="w-4 h-4" />
                            اعتماد وتفعيل الموظف
                          </button>
                        </div>
                      </div>

                      {/* Summary Badges */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-600 bg-slate-50 p-3 rounded-xl">
                        <div>
                          <span className="text-slate-400 block">رقم الجوال:</span>
                          <span className="font-bold font-mono" dir="ltr">{emp.phone}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">المشرف المسؤول:</span>
                          <span className="font-bold text-aei-purple">{emp.supervisor_name || approverName}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">طريقة الدفع:</span>
                          <span className="font-bold">{emp.payment_method || 'حساب بنك فلسطين'}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block">العنوان الحالي:</span>
                          <span className="font-bold truncate block">{emp.current_address || 'دير البلح'}</span>
                        </div>
                      </div>

                      {/* Expanded 33-field Inspector */}
                      {selectedEmp?.national_id === emp.national_id && (
                        <div className="mt-3 p-4 rounded-xl bg-purple-50/50 border border-purple-100 text-xs space-y-3 animate-in fade-in duration-150">
                          <h4 className="font-bold text-aei-purple border-b border-purple-200 pb-1">
                            كافة البيانات المدخلة في الاستمارة (33 حقلاً):
                          </h4>
                          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <div><span className="text-slate-500">الاسم بالإنجليزية:</span> <span className="font-semibold">{emp.full_name_en || '-'}</span></div>
                            <div><span className="text-slate-500">تاريخ الميلاد:</span> <span className="font-semibold">{emp.birth_date || '-'}</span></div>
                            <div><span className="text-slate-500">الحالة الاجتماعية:</span> <span className="font-semibold">{emp.marital_status || 'أعزب'}</span></div>
                            <div><span className="text-slate-500">المؤهل العلمي:</span> <span className="font-semibold">{emp.degree || '-'} ({emp.major || '-'})</span></div>
                            <div><span className="text-slate-500">الجامعة:</span> <span className="font-semibold">{emp.university || '-'}</span></div>
                            <div><span className="text-slate-500">العنوان قبل الحرب:</span> <span className="font-semibold">{emp.prewar_gov || '-'} - {emp.prewar_address || '-'}</span></div>
                            <div><span className="text-slate-500">الآيبان / الحساب:</span> <span className="font-mono font-semibold" dir="ltr">{emp.iban_or_phone || '-'}</span></div>
                            <div><span className="text-slate-500">فرع البنك:</span> <span className="font-semibold">{emp.bank_branch || '-'}</span></div>
                            <div><span className="text-slate-500">تاريخ التسجيل:</span> <span className="font-semibold">{new Date(emp.created_at || '').toLocaleDateString('ar-EG')}</span></div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">لا توجد طلبات تسجيل كوادر معلقة</h3>
                  <p className="text-xs text-slate-500 max-w-sm mx-auto">
                    كافة الكوادر المسجلة في النظام معتمدة ومفعلة حالياً. عند قيام أي موظف بتعبئة استمارة التسجيل الجديدة ستظهر هنا فوراً لمراجعتها واعتمادها.
                  </p>
                </div>
              )}
            </>
          )}

          {activeSubTab === 'edits' && (
            <>
              {pendingEdits.length > 0 ? (
                <div className="space-y-3">
                  {pendingEdits.map((req) => (
                    <div key={req.id} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-3">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <span className="text-[11px] font-bold text-slate-400">طلب تعديل حقل:</span>
                          <h4 className="font-black text-sm text-slate-900">{req.field_label_ar}</h4>
                          <span className="text-xs text-aei-purple font-semibold">الموظف: {req.employee_name} (هوية: {req.national_id})</span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleRejectEdit(req.id, req.field_label_ar)}
                            className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors cursor-pointer"
                          >
                            رفض التعديل
                          </button>
                          <button
                            onClick={() => handleApproveEdit(req.id, req.field_label_ar)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                          >
                            <Check className="w-3.5 h-3.5" />
                            اعتماد وتطبيق
                          </button>
                        </div>
                      </div>

                      {/* Diff Comparison View */}
                      <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200/60">
                        <div>
                          <span className="text-[10px] text-slate-400 block mb-0.5">القيمة السابقة المعتمدة:</span>
                          <span className="text-slate-600 line-through block font-medium">{req.old_value || '(فارغ)'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-emerald-600 font-bold block mb-0.5">القيمة الجديدة المقترحة:</span>
                          <span className="text-emerald-700 font-bold block">{req.new_value}</span>
                        </div>
                      </div>

                      {req.reason && (
                        <p className="text-[11px] text-slate-500">سبب طلب التعديل: {req.reason}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-16 text-center space-y-3">
                  <div className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-extrabold text-slate-800">لا توجد طلبات تعديل بيانات شخصية معلقة</h3>
                  <p className="text-xs text-slate-500">كافة طلبات التعديل المقدمة من الكوادر تمت مراجعتها واعتمادها.</p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 p-4 px-6 flex justify-between items-center text-xs text-slate-500 flex-shrink-0">
          <span>* قرارات الاعتماد تنعكس فوراً وتفعل بطاقة العمل وتعديل البيانات في قاعدة البيانات.</span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 text-white font-bold hover:bg-slate-900 transition-colors cursor-pointer"
          >
            إغلاق النافذة
          </button>
        </div>
      </div>
    </div>
  );
};
