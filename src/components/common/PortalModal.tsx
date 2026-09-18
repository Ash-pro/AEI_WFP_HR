import React, { useState } from 'react';
import { X, Lock, CreditCard, ArrowLeft, CheckCircle2, QrCode, AlertCircle, Building2, User, Phone } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

import { storageService } from '../../lib/storageService';

interface PortalModalProps {
  onClose: () => void;
}

export const PortalModal: React.FC<PortalModalProps> = ({ onClose }) => {
  const [nationalId, setNationalId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [employee, setEmployee] = useState<any | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (nationalId.length !== 9) {
      setError('رقم الهوية يجب أن يتكون من 9 أرقام تماماً');
      return;
    }

    if (pin.length < 4) {
      setError('رمز PIN يجب أن يتكون من 4 أرقام على الأقل');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);

      // التحقق الصارم عبر storageService دون أي بيانات افتراضية
      const result = storageService.verifyPin(nationalId, pin);
      if (!result.success) {
        setError(result.message);
        return;
      }

      const emp = result.employee!;
      const custodies = storageService.getEmployeeCustodies(emp.national_id, emp.full_name_ar);

      setEmployee({
        ...emp,
        point_name: emp.current_point_name || 'الميدان',
        custodies: custodies.map((c) => ({
          code: c.serial_number,
          name: c.asset_name,
          status: c.condition,
        })),
      });
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-l from-aei-purple to-aei-purple-light p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute left-5 top-5 text-white/80 hover:text-white p-1 rounded-full hover:bg-white/10 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center">
              <Lock className="w-6 h-6 text-aei-gold" />
            </div>
            <div>
              <h2 className="text-xl font-black">بوابة الخدمة الذاتية للموظف</h2>
              <p className="text-xs text-white/80">استعلام الملف الشخصي، بطاقة الـ QR، والعهد الميدانية</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          {!employee ? (
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

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
                    placeholder="مثال: 401234567"
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-semibold tracking-wider transition-all"
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
                    placeholder="الرمز الذي أنشأته عند التسجيل"
                    className="w-full pr-11 pl-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-semibold tracking-widest transition-all"
                    required
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  * أنشئ رمز PIN أثناء تعبئة استمارة التسجيل أول مرة.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light hover:to-aei-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {loading ? 'جاري التحقق...' : 'دخول واستعراض البروفايل'}
                <ArrowLeft className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              {/* Alert if Pending Approval */}
              {employee.status === 'معلق_قيد_الاعتماد' && (
                <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="font-extrabold block text-amber-800">حالة الملف: قيد المراجعة والاعتماد الميداني</span>
                    <span className="text-[11px] leading-relaxed block mt-0.5">
                      تم استلام بياناتك بنجاح. حسابك بانتظار مراجعة واعتماد المشرف الميداني المسؤول ({employee.supervisor_name}) أو منسقة المشروع قبل تفعيل الاستخدام الميداني للبطاقة.
                    </span>
                  </div>
                </div>
              )}

              {/* Staff ID Card with QR Code */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 relative">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                      employee.status === 'معلق_قيد_الاعتماد' 
                        ? 'bg-amber-100 text-amber-800 border-amber-300' 
                        : 'bg-aei-green/15 text-aei-green border-aei-green/30'
                    }`}>
                      {employee.category} • {employee.status === 'معلق_قيد_الاعتماد' ? 'قيد الاعتماد' : employee.status}
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900">{employee.full_name_ar}</h3>
                    <p className="text-xs text-slate-500 font-medium">{employee.job_title}</p>
                    <p className="text-xs text-aei-purple font-semibold">{employee.department}</p>
                  </div>
                  <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-200">
                    <QRCodeSVG value={employee.qr_token || employee.national_id} size={70} level="M" />
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200/60 grid grid-cols-2 gap-2 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-aei-gold" />
                    <span className="truncate">{employee.point_name || 'مركز دير البلح'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-aei-purple" />
                    <span>المشرف: {employee.supervisor_name || 'أ. أشرف'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-aei-green" />
                    <span dir="ltr">{employee.phone}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                    <span>الهوية: {employee.national_id}</span>
                  </div>
                </div>
              </div>

              {/* Custody & Assets assigned to this employee */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 mb-2 flex items-center justify-between">
                  <span>العهد والمقتنيات المسجلة باسمي</span>
                  <span className="text-[10px] text-aei-purple font-semibold">عهدة شخصية ({employee.custodies?.length || 0})</span>
                </h4>
                {employee.custodies && employee.custodies.length > 0 ? (
                  <div className="space-y-1.5">
                    {employee.custodies.map((item: any, i: number) => (
                      <div key={i} className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                        <div>
                          <span className="font-bold text-slate-800">{item.name}</span>
                          <span className="text-[10px] text-slate-400 block font-mono">{item.code}</span>
                        </div>
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-700">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 bg-slate-50 p-3 rounded-lg text-center">لا توجد عهد شخصية مسجلة حالياً</p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex gap-2">
                <a
                  href={`/portal?id=${employee.national_id}`}
                  className="flex-1 py-2.5 rounded-xl bg-aei-purple text-white hover:bg-aei-purple-dark font-bold text-xs transition-colors flex items-center justify-center gap-1.5 text-center"
                >
                  فتح البوابة الكاملة للموظف
                  <ArrowLeft className="w-4 h-4" />
                </a>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2.5 rounded-xl bg-slate-800 text-white hover:bg-slate-900 font-bold text-xs transition-colors flex items-center gap-1.5"
                >
                  <QrCode className="w-4 h-4" />
                  طباعة
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
