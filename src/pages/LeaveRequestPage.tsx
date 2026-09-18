import React, { useState } from 'react';
import { supabase, uploadDocument } from '../lib/supabase';
import { Calendar, UploadCloud, CheckCircle2, AlertCircle, ArrowLeft } from 'lucide-react';
import { LeaveType } from '../lib/types';
import { REAL_EMPLOYEES } from '../lib/realData';
import { storageService } from '../lib/storageService';

export const LeaveRequestPage: React.FC = () => {
  const [nationalId, setNationalId] = useState('');
  const [leaveType, setLeaveType] = useState<LeaveType>('سنوية');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [medicalReportUrl, setMedicalReportUrl] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const matchedEmployee = nationalId.length === 9 
    ? (storageService.getEmployeeByNid(nationalId) || REAL_EMPLOYEES.find((e) => e.national_id === nationalId))
    : undefined;

  const calculateDays = (): number => {
    if (!startDate || !endDate) return 0;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return diff > 0 ? diff : 0;
  };

  const totalDays = calculateDays();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (nationalId.length !== 9) {
      setErrorMsg('رقم الهوية يجب أن يتكون من 9 أرقام تماماً');
      return;
    }

    if (totalDays <= 0) {
      setErrorMsg('تاريخ نهاية الإجازة يجب أن يكون مساوياً أو بعد تاريخ البداية');
      return;
    }

    if (leaveType === 'طبية' && !medicalReportUrl) {
      setErrorMsg('في الإجازة الطبية: يجب رفع ملف أو صورة التقرير الطبي المعتمد بصورة إجبارية');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employee_id: nationalId,
        national_id: nationalId,
        employee_name: matchedEmployee?.full_name_ar || '',
        leave_type: leaveType,
        start_date: startDate,
        end_date: endDate,
        total_days: totalDays,
        medical_report_url: medicalReportUrl,
        notes: notes,
      };

      // حفظ محلي فوري لمركز الاعتمادات
      storageService.submitLeave(payload as any);

      // مزامنة مع Supabase في الخلفية
      await supabase.from('leave_requests').insert({
        ...payload,
        status: 'معلق',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Fallback submit leave:', err);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">تم تقديم طلب الإجازة بنجاح</h2>
        <p className="text-sm text-slate-600">
          تم إرسال طلب الإجازة الـ ({leaveType}) لمدة ({totalDays} أيام) إلى السوبر أدمن والمنسقة للمراجعة والاعتماد.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 rounded-xl bg-aei-purple text-white font-bold text-sm cursor-pointer"
        >
          العودة للرئيسية
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100 space-y-6">
        <div className="flex items-center gap-3 border-b border-slate-100 pb-5">
          <div className="w-12 h-12 rounded-2xl bg-aei-green/10 text-aei-green flex items-center justify-center">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">تقديم طلب إجازة ميداني</h1>
            <p className="text-xs text-slate-500">إجازة سنوية اعتيادية أو إجازة مرضية معتمدة</p>
          </div>
        </div>

        {errorMsg && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الهوية (9 أرقام) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={9}
                value={nationalId}
                onChange={(e) => setNationalId(e.target.value.replace(/\D/g, ''))}
                placeholder="أدخل رقم الهوية"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-green focus:ring-2 focus:ring-aei-green/20 text-sm font-semibold"
                required
              />
              {matchedEmployee && (
                <div className="mt-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold">{matchedEmployee.full_name_ar}</span>
                    <span className="text-slate-500 text-[11px] block">
                      النقطة: {matchedEmployee.point_name} • المشرف: {matchedEmployee.supervisor_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                نوع الإجازة <span className="text-rose-500">*</span>
              </label>
              <select
                value={leaveType}
                onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-green focus:ring-2 focus:ring-aei-green/20 text-sm font-bold text-aei-green"
              >
                <option value="سنوية">إجازة سنوية (اعتيادية)</option>
                <option value="طبية">إجازة طبية (مرضية)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ البداية (من) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-green focus:ring-2 focus:ring-aei-green/20 text-sm font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                تاريخ النهاية (إلى) <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-green focus:ring-2 focus:ring-aei-green/20 text-sm font-medium"
                required
              />
            </div>
          </div>

          {totalDays > 0 && (
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <span className="text-slate-600 font-bold">المدة الإجمالية للإجازة:</span>
              <span className="font-extrabold text-aei-green text-sm">{totalDays} أيام</span>
            </div>
          )}

          <div className={`p-4 rounded-2xl border transition-all ${
            leaveType === 'طبية' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-100' : 'bg-slate-50 border-slate-200'
          }`}>
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-aei-green" />
                ملف / صورة التقرير الطبي المعتمد
              </span>
              {leaveType === 'طبية' ? (
                <span className="text-[10px] font-black text-rose-600 bg-rose-100 px-2 py-0.5 rounded">إجباري للإجازة الطبية</span>
              ) : (
                <span className="text-[10px] text-slate-400">اختياري للسنوية</span>
              )}
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploading(true);
                  const url = await uploadDocument(f, 'medical_reports');
                  setMedicalReportUrl(url);
                  setUploading(false);
                }
              }}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-aei-green/10 file:text-aei-green hover:file:bg-aei-green/20"
            />
            {uploading && <span className="text-[11px] text-aei-green block mt-1">جاري رفع التقرير...</span>}
            {medicalReportUrl && <span className="text-[11px] text-emerald-600 block mt-1 font-bold">تم رفع التقرير الطبي بنجاح</span>}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              ملاحظات أو سبب الإجازة
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="اكتب أي توضيحات إضافية"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-green focus:ring-2 focus:ring-aei-green/20 text-sm font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-aei-green to-emerald-600 hover:to-aei-green text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'جاري إرسال الطلب...' : 'إرسال طلب الإجازة للاعتماد'}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
