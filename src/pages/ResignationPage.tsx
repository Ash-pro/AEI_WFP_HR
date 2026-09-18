import React, { useState } from 'react';
import { supabase, uploadDocument } from '../lib/supabase';
import { AlertCircle, UploadCloud, CheckCircle2, ArrowLeft, ShieldAlert } from 'lucide-react';
import { REAL_EMPLOYEES } from '../lib/realData';
import { storageService } from '../lib/storageService';

export const ResignationPage: React.FC = () => {
  const [nationalId, setNationalId] = useState('');
  const [phone, setPhone] = useState('');
  const [reasonTitle, setReasonTitle] = useState('');
  const [reasonDetails, setReasonDetails] = useState('');
  const [handLetterUrl, setHandLetterUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const matchedEmployee = nationalId.length === 9 
    ? (storageService.getEmployeeByNid(nationalId) || REAL_EMPLOYEES.find((e) => e.national_id === nationalId))
    : null;

  const handleIdChange = (idVal: string) => {
    setNationalId(idVal);
    if (idVal.length === 9) {
      const emp = REAL_EMPLOYEES.find((e) => e.national_id === idVal);
      if (emp && !phone) {
        setPhone(emp.phone);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (nationalId.length !== 9) {
      setErrorMsg('رقم الهوية يجب أن يتكون من 9 أرقام تماماً');
      return;
    }

    if (!handLetterUrl) {
      setErrorMsg('يجب رفع صورة طلب الاستقالة المكتوب والموقع يدوياً بصورة إجبارية');
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        employee_id: nationalId,
        national_id: nationalId,
        employee_name: matchedEmployee?.full_name_ar || '',
        phone: phone,
        reason_title: reasonTitle,
        reason_details: reasonDetails,
        hand_letter_url: handLetterUrl,
        last_working_date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0] // أسبوعين فترة إشعار افتراضية
      };

      // حفظ محلي فوري للاعتمادات
      storageService.submitResignation(payload as any);

      // مزامنة مع Supabase في الخلفية
      await supabase.from('resignation_requests').insert({
        ...payload,
        status: 'معلق',
        created_at: new Date().toISOString()
      });
    } catch (err) {
      console.warn('Fallback submit resignation:', err);
    }

    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="max-w-xl mx-auto px-4 py-16 text-center space-y-5">
        <div className="w-16 h-16 rounded-3xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-black text-slate-900">تم تسجيل طلب الاستقالة بنجاح</h2>
        <p className="text-sm text-slate-600">
          تم استلام طلبك ومرفق الخطاب الخطي. سيقوم المشرف المسؤول بمراجعة إخلاء العهد بالتنسيق مع السوبر أدمن والمنسقة لاعتماد الطلب وتعيين الكادر البديل.
        </p>
        <button
          onClick={() => window.location.href = '/'}
          className="px-6 py-2.5 rounded-xl bg-slate-800 text-white font-bold text-sm cursor-pointer"
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
          <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">تقديم طلب استقالة معتمد</h1>
            <p className="text-xs text-slate-500">توثيق الاستقالة مع إرفاق الخطاب الخطي وحصر العهد</p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
          <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <span className="font-extrabold block">ملاحظة تنظيمية هامة:</span>
            <span>
              يتطلب قبول الاستقالة تسليم كافة العهد والمقتنيات الميدانية المسجلة باسمك في النقطة للمشرف الميداني المسؤول قبل الاعتماد النهائي وتعيين الكادر البديل.
            </span>
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
                onChange={(e) => handleIdChange(e.target.value.replace(/\D/g, ''))}
                placeholder="أدخل رقم الهوية"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-semibold"
                required
              />
              {matchedEmployee && (
                <div className="mt-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900">{matchedEmployee.full_name_ar}</span>
                    <span className="text-slate-500 text-[11px] block">
                      النقطة: {matchedEmployee.point_name} • المشرف: {matchedEmployee.supervisor_name}
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                رقم الجوال للتواصل <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                maxLength={10}
                dir="ltr"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                placeholder="059xxxxxxx"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-semibold text-left font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              عنوان أو موضوع طلب الاستقالة <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={reasonTitle}
              onChange={(e) => setReasonTitle(e.target.value)}
              placeholder="مثال: استقالة بسبب ظروف صحية / سفر / ارتباط وظيفي آخر"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-medium"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1.5">
              تفاصيل وأسباب الاستقالة <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={3}
              value={reasonDetails}
              onChange={(e) => setReasonDetails(e.target.value)}
              placeholder="توضيح تفاصيل السبب وموعد آخر يوم عمل مرغوب"
              className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 text-sm font-medium"
              required
            />
          </div>

          <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-200 ring-2 ring-rose-100">
            <label className="block text-xs font-bold text-slate-900 mb-1 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <UploadCloud className="w-4 h-4 text-rose-600" />
                صورة طلب الاستقالة المكتوب والموقع يدوياً <span className="text-rose-600">*</span>
              </span>
              <span className="text-[10px] font-black text-rose-700 bg-rose-100 px-2 py-0.5 rounded">إجباري صارم</span>
            </label>
            <input
              type="file"
              accept="image/*,.pdf"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (f) {
                  setUploading(true);
                  const url = await uploadDocument(f, 'resignations');
                  setHandLetterUrl(url);
                  setUploading(false);
                }
              }}
              className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-rose-100 file:text-rose-700 hover:file:bg-rose-200"
              required
            />
            {uploading && <span className="text-[11px] text-rose-600 block mt-1">جاري رفع الخطاب...</span>}
            {handLetterUrl && <span className="text-[11px] text-emerald-600 block mt-1 font-bold">تم إرفاق صورة الخطاب الخطي بنجاح</span>}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-l from-rose-600 to-rose-700 hover:to-rose-600 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {submitting ? 'جاري تقديم الاستقالة...' : 'إرسال طلب الاستقالة للاعتماد'}
            <ArrowLeft className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
