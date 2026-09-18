import React, { useState, useEffect } from 'react';
import { StepIndicator } from '../components/registration/StepIndicator';
import { PALESTINE_GOVERNORATES, JOB_CATEGORIES, MARITAL_STATUSES, EDUCATION_DEGREES, UNIVERSITIES_LIST, HOUSING_TYPES, PAYMENT_METHODS, BANK_BRANCHES, INITIAL_WORK_POINTS, INITIAL_TEAMS, INITIAL_SUPERVISORS } from '../lib/constants';
import { REAL_EMPLOYEES } from '../lib/realData';
import { Employee } from '../lib/types';
import { supabase, uploadDocument } from '../lib/supabase';
import { storageService } from '../lib/storageService';
import { CheckCircle2, ArrowRight, ArrowLeft, Sparkles, UploadCloud, ShieldCheck, Lock, AlertCircle, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_FORM_DATA: Partial<Employee> = {
  national_id: '',
  full_name_ar: '',
  full_name_en: '',
  birth_date: '',
  marital_status: 'أعزب',
  family_count: 0,
  children_under_5: 0,
  phone: '',
  email: '',
  category: 'موظف',
  job_title: '',
  department: 'الميدان والتغذية',
  current_point_id: INITIAL_WORK_POINTS[0].id,
  current_team_id: INITIAL_TEAMS[0].id,
  degree: 'بكالوريوس',
  major: '',
  graduation_year: '',
  university: UNIVERSITIES_LIST[0],
  university_other: '',
  license_number: '',
  license_date: '',
  current_gov: 'دير البلح / الوسطى',
  current_address: '',
  housing_type: 'ملك',
  prewar_gov: 'غزة',
  prewar_address: '',
  payment_method: 'حساب بنك فلسطين',
  iban_or_phone: '',
  bank_account: '',
  bank_branch: BANK_BRANCHES[0],
  photo_url: '',
  id_card_url: '',
  notes: '',
  declaration_agreed: false,
  pin: '',
};

export const RegisterPage: React.FC = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<Partial<Employee>>(() => {
    const saved = localStorage.getItem('aei_hr_registration_draft');
    return saved ? JSON.parse(saved) : INITIAL_FORM_DATA;
  });

  const [idChecked, setIdChecked] = useState(false);
  const [isPreImported, setIsPreImported] = useState(false);
  const [checkingId, setCheckingId] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadingIdCard, setUploadingIdCard] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('aei_hr_registration_draft', JSON.stringify(formData));
  }, [formData]);

  const updateField = (field: keyof Employee, value: any) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'marital_status' && value === 'أعزب') {
        updated.family_count = 0;
        updated.children_under_5 = 0;
      }
      return updated;
    });
  };

  const handleCheckId = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const nid = (formData.national_id || '').trim();
    if (!/^\d{9}$/.test(nid)) {
      setErrorMsg('رقم الهوية يجب أن يتكون من 9 أرقام تماماً وبشكل صحيح');
      return;
    }

    setCheckingId(true);

    try {
      // 1. Check Supabase DB
      const { data } = await supabase
        .from('employees')
        .select('*')
        .eq('national_id', nid)
        .maybeSingle();

      if (data) {
        setIsPreImported(true);
        setFormData((prev) => ({
          ...prev,
          ...data,
          profile_completed: false,
        }));
        setCheckingId(false);
        setIdChecked(true);
        return;
      }

      // 2. Check REAL_EMPLOYEES from the official project dataset
      const realStaff = REAL_EMPLOYEES.find((emp) => emp.national_id === nid);
      if (realStaff) {
        const matchedPoint =
          INITIAL_WORK_POINTS.find((pt) => pt.name === realStaff.point_name) ||
          INITIAL_WORK_POINTS.find((pt) => pt.name.includes(realStaff.point_name)) ||
          INITIAL_WORK_POINTS[0];

        const matchedTeam =
          INITIAL_TEAMS.find((t) => t.point_id === matchedPoint.id) || INITIAL_TEAMS[0];

        setIsPreImported(true);
        setFormData((prev) => ({
          ...prev,
          national_id: nid,
          full_name_ar: realStaff.full_name_ar,
          phone: realStaff.phone,
          category: (realStaff.category === 'موظف' || realStaff.category === 'متطوع' || realStaff.category === 'أمن')
            ? realStaff.category
            : 'موظف',
          department: realStaff.department || 'الميدان والتغذية',
          job_title:
            realStaff.category === 'منسق'
              ? 'منسقة المشروع (إدارة عليا)'
              : realStaff.department === 'علاجي'
              ? 'أخصائي تغذية علاجية (TSFP)'
              : realStaff.department === 'وقائي'
              ? 'أخصائي تغذية وقائية وكاش (BSFP)'
              : `${realStaff.category} - ${realStaff.department}`,
          current_point_id: matchedPoint.id,
          current_team_id: matchedTeam.id,
        }));
      } else {
        setIsPreImported(false);
      }
      setCheckingId(false);
      setIdChecked(true);
    } catch (err) {
      // Offline fallback: check local REAL_EMPLOYEES
      const realStaff = REAL_EMPLOYEES.find((emp) => emp.national_id === nid);
      if (realStaff) {
        const matchedPoint =
          INITIAL_WORK_POINTS.find((pt) => pt.name === realStaff.point_name) ||
          INITIAL_WORK_POINTS.find((pt) => pt.name.includes(realStaff.point_name)) ||
          INITIAL_WORK_POINTS[0];

        const matchedTeam =
          INITIAL_TEAMS.find((t) => t.point_id === matchedPoint.id) || INITIAL_TEAMS[0];

        setIsPreImported(true);
        setFormData((prev) => ({
          ...prev,
          national_id: nid,
          full_name_ar: realStaff.full_name_ar,
          phone: realStaff.phone,
          category: (realStaff.category === 'موظف' || realStaff.category === 'متطوع' || realStaff.category === 'أمن')
            ? realStaff.category
            : 'موظف',
          department: realStaff.department || 'الميدان والتغذية',
          job_title:
            realStaff.category === 'منسق'
              ? 'منسقة المشروع (إدارة عليا)'
              : realStaff.department === 'علاجي'
              ? 'أخصائي تغذية علاجية (TSFP)'
              : realStaff.department === 'وقائي'
              ? 'أخصائي تغذية وقائية وكاش (BSFP)'
              : `${realStaff.category} - ${realStaff.department}`,
          current_point_id: matchedPoint.id,
          current_team_id: matchedTeam.id,
        }));
      } else {
        setIsPreImported(false);
      }
      setCheckingId(false);
      setIdChecked(true);
    }
  };

  const validateCurrentStep = (): boolean => {
    setErrorMsg(null);

    if (step === 1) {
      if (!formData.full_name_ar || formData.full_name_ar.trim().split(' ').length < 3) {
        setErrorMsg('الرجاء كتابة الاسم كاملاً باللغة العربية (مطابق للهوية)');
        return false;
      }
      if (!formData.phone || !/^(059|056)\d{7}$/.test(formData.phone)) {
        setErrorMsg('رقم الجوال يجب أن يتكون من 10 أرقام ويبدأ بـ 059 أو 056');
        return false;
      }
      if (!formData.birth_date) {
        setErrorMsg('الرجاء تحديد تاريخ الميلاد');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.job_title) {
        setErrorMsg('الرجاء كتابة المسمى الوظيفي في المشروع');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.degree || !formData.major) {
        setErrorMsg('الرجاء إدخال الدرجة العلمية والتخصص بالتفصيل');
        return false;
      }
    }

    if (step === 4) {
      if (!formData.current_address || !formData.prewar_address) {
        setErrorMsg('الرجاء إدخال تفاصيل العنوان الحالي والعنوان الأصلي قبل الحرب');
        return false;
      }
    }

    return true;
  };

  const nextStep = () => {
    if (validateCurrentStep()) {
      setStep((s) => Math.min(s + 1, 5));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const prevStep = () => {
    setStep((s) => Math.max(s - 1, 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.declaration_agreed) {
      setErrorMsg('يجب الموافقة على الإقرار القانوني بصحة البيانات لإتمام التسجيل');
      return;
    }

    if (!formData.pin || formData.pin.length < 4) {
      setErrorMsg('الرجاء إدخال رمز PIN بسيط (4-6 أرقام) لاستخدامه في استعراض بروفايلك');
      return;
    }

    setSubmitting(true);
    const refCode = `AEI-${Math.floor(100000 + Math.random() * 900000)}`;

    const submissionPayload = {
      ...formData,
      qr_token: refCode,
      profile_completed: true,
      status: 'معلق_قيد_الاعتماد' as const,
      updated_at: new Date().toISOString(),
    };

    // حفظ الكادر مع الـ PIN الصارم وحالة "معلق_قيد_الاعتماد"
    const registeredRecord = storageService.registerOrUpdateEmployee(
      submissionPayload,
      formData.pin!
    );

    try {
      await supabase
        .from('employees')
        .upsert(submissionPayload, { onConflict: 'national_id' });
    } catch (err) {
      console.warn('Network submit fallback:', err);
    }

    localStorage.removeItem('aei_hr_registration_draft');

    setSubmitting(false);
    setGeneratedCode(refCode);
    setSubmittedSuccess(true);

    try {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#6B1D6F', '#1E7E34', '#D99A36', '#007DBC']
      });
    } catch (e) {
      // ignore
    }
  };

  if (submittedSuccess) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16">
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-xl border border-slate-100 text-center space-y-6">
          <div className="w-20 h-20 rounded-3xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto shadow-inner">
            <Clock className="w-12 h-12" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-extrabold uppercase px-3.5 py-1 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              تم استلام الاستمارة • قيد المراجعة والاعتماد
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              مرحباً بك، {formData.full_name_ar}!
            </h2>
            <p className="text-slate-600 text-sm max-w-md mx-auto leading-relaxed">
              تم تسجيل بياناتك بنجاح. وفقاً للبروتوكول الإداري، يتطلب تفعيل الحساب وبطاقة العمل والعهد مراجعة واعتماد المشرف الميداني المسؤول أو منسقة المشروع أولاً.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-gradient-to-l from-slate-50 to-purple-50/50 border border-purple-100 max-w-md mx-auto text-right space-y-2 text-xs text-slate-700">
            <div className="flex justify-between items-center border-b border-purple-100 pb-2">
              <span className="text-slate-500 font-semibold">رمز البطاقة التعريفي:</span>
              <span className="font-mono font-black text-aei-purple text-sm">{generatedCode}</span>
            </div>
            <div className="flex justify-between items-center border-b border-purple-100 pb-2">
              <span className="text-slate-500 font-semibold">نقطة العمل الميدانية:</span>
              <span className="font-bold">{INITIAL_WORK_POINTS.find(p => p.id === formData.current_point_id)?.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-semibold">المشرف المسؤول عن الاعتماد:</span>
              <span className="font-bold text-aei-purple">
                {INITIAL_WORK_POINTS.find(p => p.id === formData.current_point_id)?.supervisor || 'أمل سمير اسماعيل عوض'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <a
              href={`/portal?id=${formData.national_id}`}
              className="px-6 py-3 rounded-xl bg-aei-purple text-white font-bold text-sm hover:bg-aei-purple-dark transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              دخول بوابة الموظف بالـ PIN
              <ArrowLeft className="w-4 h-4" />
            </a>
            <button
              onClick={() => window.print()}
              className="px-6 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-all cursor-pointer"
            >
              طباعة إشعار التسجيل
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="px-6 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold text-sm hover:bg-slate-200 transition-all cursor-pointer"
            >
              الرئيسية
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="text-center mb-8 space-y-2">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-aei-purple/10 text-aei-purple border border-aei-purple/20">
          <Sparkles className="w-3.5 h-3.5 text-aei-gold" />
          استمارة توثيق وتسجيل الكوادر (33 حقلاً)
        </span>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          تسجيل بيانات كادر ميداني
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          مشروع برنامج الأغذية العالمي (WFP) - جمعية أرض الإنسان • موظفون • متطوعون • طواقم الأمن
        </p>
      </div>

      {!idChecked ? (
        <div className="max-w-lg mx-auto bg-white rounded-3xl p-8 shadow-xl border border-slate-100">
          <form onSubmit={handleCheckId} className="space-y-5">
            <div className="w-14 h-14 rounded-2xl bg-aei-purple/10 text-aei-purple flex items-center justify-center mx-auto mb-2">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <div className="text-center space-y-1">
              <h2 className="text-xl font-bold text-slate-900">التحقق من رقم الهوية</h2>
              <p className="text-xs text-slate-500">
                أدخل رقم هويتك (9 أرقام). إذا كانت بياناتك الأساسية مستوردة مسبقاً من كشف الإكسل، سيتم جلبها لتسهيل استكمال باقي الحقول.
              </p>
            </div>

            {errorMsg && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                رقم الهوية الفلسطينية (9 أرقام) <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={9}
                value={formData.national_id || ''}
                onChange={(e) => updateField('national_id', e.target.value.replace(/\D/g, ''))}
                placeholder="أدخل 9 أرقام الهوية"
                className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-center text-lg font-black tracking-widest"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={checkingId}
              className="w-full py-3.5 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {checkingId ? 'جاري التحقق...' : 'متابعة إلى الاستمارة'}
              <ArrowLeft className="w-4 h-4" />
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-100">
          {isPreImported && (
            <div className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-extrabold block">مرحباً بك! تم العثور على بياناتك الأساسية في الكشف</span>
                <p className="text-xs text-emerald-700 mt-0.5">
                  تم استرجاع اسمك وبيانات العمل الميداني تلقائياً. يرجى استكمال باقي الحقول الإجبارية لتوثيق وتثبيت ملفك بالكامل.
                </p>
              </div>
            </div>
          )}

          <StepIndicator currentStep={step} totalSteps={5} onStepClick={(s) => s < step && setStep(s)} />

          {errorMsg && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={step === 5 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
            {step === 1 && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-r-4 border-aei-purple pr-3">
                  الخطوة 1: البيانات الشخصية وبيانات الاتصال
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم الهوية (9 أرقام) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      disabled
                      value={formData.national_id || ''}
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm font-bold text-slate-600 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الاسم رباعي باللغة العربية (مطابق للهوية) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.full_name_ar || ''}
                      onChange={(e) => updateField('full_name_ar', e.target.value)}
                      placeholder="أدخل الاسم رباعياً بالعربية"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الاسم رباعي باللغة الإنجليزية (English) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.full_name_en || ''}
                      onChange={(e) => updateField('full_name_en', e.target.value)}
                      placeholder="Full Name in English"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium text-left"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      تاريخ الميلاد <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.birth_date || ''}
                      onChange={(e) => updateField('birth_date', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الحالة الاجتماعية <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.marital_status || 'أعزب'}
                      onChange={(e) => updateField('marital_status', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {MARITAL_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      عدد أفراد الأسرة الكلي <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.family_count ?? 0}
                      onChange={(e) => updateField('family_count', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      عدد الأطفال تحت 5 سنوات <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={formData.children_under_5 ?? 0}
                      onChange={(e) => updateField('children_under_5', parseInt(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم الجوال الأساسي (10 أرقام 059/056) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="tel"
                      maxLength={10}
                      dir="ltr"
                      value={formData.phone || ''}
                      onChange={(e) => updateField('phone', e.target.value.replace(/\D/g, ''))}
                      placeholder="059xxxxxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium text-left font-mono"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      البريد الإلكتروني المعتمد <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="email"
                      dir="ltr"
                      value={formData.email || ''}
                      onChange={(e) => updateField('email', e.target.value)}
                      placeholder="name@example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium text-left"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-r-4 border-aei-green pr-3">
                  الخطوة 2: البيانات الوظيفية ونقطة العمل الميدانية
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      فئة الكادر في المشروع <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.category || 'موظف'}
                      onChange={(e) => updateField('category', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-bold text-aei-purple"
                    >
                      {JOB_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      المسمى الوظيفي في المشروع <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.job_title || ''}
                      onChange={(e) => updateField('job_title', e.target.value)}
                      placeholder="مثال: منسق ميداني / أخصائي تغذية / مدخل بيانات / أمن"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      القسم التابع له <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.department || ''}
                      onChange={(e) => updateField('department', e.target.value)}
                      placeholder="مثال: قسم التغذية العلاجية / الأمن والسلامة / العمليات"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم نقطة العمل الحالية (28 نقطة + الخيار الإداري) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.current_point_id}
                      onChange={(e) => {
                        const pid = e.target.value;
                        const matchedTeam = INITIAL_TEAMS.find((t) => t.point_id === pid);
                        setFormData((prev) => ({
                          ...prev,
                          current_point_id: pid,
                          current_team_id: matchedTeam?.id || prev.current_team_id,
                        }));
                      }}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      <optgroup label="محافظة الوسطى (دير البلح، النصيرات، البريج، المغازي، الزوايدة)">
                        {INITIAL_WORK_POINTS.filter((pt) => pt.geo_zone === 'الوسطى').map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name} ({pt.point_area} - المشرف: {pt.supervisor})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="محافظة خان يونس (المواصي، القرارة، قيزان النجار، حي الأمل)">
                        {INITIAL_WORK_POINTS.filter((pt) => pt.geo_zone === 'خانيونس').map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name} ({pt.point_area} - المشرف: {pt.supervisor})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="محافظة غزة والشمال">
                        {INITIAL_WORK_POINTS.filter((pt) => pt.geo_zone === 'غزة' || pt.geo_zone === 'شمال غزة').map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name} ({pt.point_area} - المشرف: {pt.supervisor})
                          </option>
                        ))}
                      </optgroup>
                      <optgroup label="الإدارة العامة ومكتب التنسيق">
                        {INITIAL_WORK_POINTS.filter((pt) => pt.geo_zone === 'إداري').map((pt) => (
                          <option key={pt.id} value={pt.id}>
                            {pt.name} (المشرف: {pt.supervisor})
                          </option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      فريق العمل الإشرافي داخل النقطة <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.current_team_id}
                      onChange={(e) => updateField('current_team_id', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {INITIAL_TEAMS.filter((t) => t.point_id === formData.current_point_id).map((t) => (
                        <option key={t.id} value={t.id}>{t.team_name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      المشرف المباشر المعتمد
                    </label>
                    <input
                      type="text"
                      value={
                        INITIAL_WORK_POINTS.find((p) => p.id === formData.current_point_id)?.supervisor ||
                        INITIAL_TEAMS.find((t) => t.id === formData.current_team_id)?.supervisor_name ||
                        'أمل سمير اسماعيل عوض'
                      }
                      disabled
                      className="w-full px-4 py-2.5 rounded-xl bg-slate-100 border border-slate-300 text-sm font-bold text-slate-700 cursor-not-allowed"
                    />
                    <div className="mt-1 text-[11px] text-slate-500 flex items-center gap-1">
                      <span className="font-semibold text-aei-purple">نطاق مسؤولية المشرف:</span>
                      <span>
                        {INITIAL_SUPERVISORS.find(
                          (s) => s.name === (INITIAL_WORK_POINTS.find((p) => p.id === formData.current_point_id)?.supervisor)
                        )?.zones || 'المنطقة المحددة'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-r-4 border-aei-gold pr-3">
                  الخطوة 3: المؤهلات العلمية والمزاولة المهنية
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      الدرجة العلمية <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.degree || 'بكالوريوس'}
                      onChange={(e) => updateField('degree', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {EDUCATION_DEGREES.map((deg) => (
                        <option key={deg} value={deg}>{deg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      التخصص بالتفصيل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.major || ''}
                      onChange={(e) => updateField('major', e.target.value)}
                      placeholder="مثال: تغذية سريرية / تمريض عام / إدارة أعمال"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      سنة الحصول على المؤهل <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={4}
                      value={formData.graduation_year || ''}
                      onChange={(e) => updateField('graduation_year', e.target.value)}
                      placeholder="مثال: 2022"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      اسم الجامعة أو الكلية <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.university || UNIVERSITIES_LIST[0]}
                      onChange={(e) => updateField('university', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {UNIVERSITIES_LIST.map((uni) => (
                        <option key={uni} value={uni}>{uni}</option>
                      ))}
                    </select>
                  </div>

                  {formData.university === 'جامعة خارجية / أخرى' && (
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        توضيح اسم الجامعة / آخر مؤهل <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.university_other || ''}
                        onChange={(e) => updateField('university_other', e.target.value)}
                        placeholder="اكتب اسم الجامعة أو المؤسسة التعليمية"
                        className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                        required
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      رقم مزاولة المهنة (للطواقم الطبية والتغذوية)
                    </label>
                    <input
                      type="text"
                      value={formData.license_number || ''}
                      onChange={(e) => updateField('license_number', e.target.value)}
                      placeholder="اختياري إن وجد"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      تاريخ الحصول على المزاولة
                    </label>
                    <input
                      type="date"
                      value={formData.license_date || ''}
                      onChange={(e) => updateField('license_date', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 4 && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-r-4 border-wfp-blue pr-3">
                  الخطوة 4: بيانات السكن والنزوح الإنساني
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      محافظة السكن الحالي <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.current_gov || 'دير البلح / الوسطى'}
                      onChange={(e) => updateField('current_gov', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {PALESTINE_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      طبيعة السكن الحالي <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.housing_type || 'ملك'}
                      onChange={(e) => updateField('housing_type', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {HOUSING_TYPES.map((h) => (
                        <option key={h} value={h}>{h}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      العنوان الحالي بالتفصيل <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.current_address || ''}
                      onChange={(e) => updateField('current_address', e.target.value)}
                      placeholder="المدينة - الحي - الشارع - أقرب معلم أو اسم مركز الإيواء"
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      محافظة السكن الأصلي (قبل الحرب) <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.prewar_gov || 'غزة'}
                      onChange={(e) => updateField('prewar_gov', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {PALESTINE_GOVERNORATES.map((gov) => (
                        <option key={gov} value={gov}>{gov}</option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      العنوان الأصلي بالتفصيل (قبل الحرب) <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      rows={2}
                      value={formData.prewar_address || ''}
                      onChange={(e) => updateField('prewar_address', e.target.value)}
                      placeholder="المدينة - الحي - الشارع - أقرب معلم أصلي"
                      className="w-full px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                      required
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 5 && (
              <div className="space-y-6">
                <h3 className="text-lg font-black text-slate-900 border-r-4 border-aei-purple pr-3">
                  الخطوة 5: البيانات المالية والمرفقات ورمز PIN والإقرار
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      طريقة تلقي الراتب والمستحقات <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={formData.payment_method || 'حساب بنك فلسطين'}
                      onChange={(e) => updateField('payment_method', e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                    >
                      {PAYMENT_METHODS.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      آيبان الدولار (بنك فلسطين) أو رقم الجوال لاستلام الكود <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      dir="ltr"
                      value={formData.iban_or_phone || ''}
                      onChange={(e) => updateField('iban_or_phone', e.target.value)}
                      placeholder="PS... أو 059xxxxxxx"
                      className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-mono text-left"
                      required
                    />
                  </div>

                  {formData.payment_method === 'حساب بنك فلسطين' && (
                    <>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          رقم حساب بنك فلسطين
                        </label>
                        <input
                          type="text"
                          dir="ltr"
                          value={formData.bank_account || ''}
                          onChange={(e) => updateField('bank_account', e.target.value)}
                          placeholder="رقم الحساب"
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-mono text-left"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">
                          اسم فرع بنك فلسطين
                        </label>
                        <select
                          value={formData.bank_branch || BANK_BRANCHES[0]}
                          onChange={(e) => updateField('bank_branch', e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-sm font-medium"
                        >
                          {BANK_BRANCHES.map((b) => (
                            <option key={b} value={b}>{b}</option>
                          ))}
                        </select>
                      </div>
                    </>
                  )}

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-aei-purple" />
                      الصورة الشخصية الرسمية (JPG/PNG)
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingPhoto(true);
                          const url = await uploadDocument(file, 'photos');
                          updateField('photo_url', url);
                          setUploadingPhoto(false);
                        }
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-aei-purple/10 file:text-aei-purple hover:file:bg-aei-purple/20"
                    />
                    {uploadingPhoto && <span className="text-[11px] text-aei-purple block mt-1">جاري الرفع...</span>}
                    {formData.photo_url && <span className="text-[11px] text-emerald-600 block mt-1 font-bold">تم إرفاق الصورة الشخصية بنجاح</span>}
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                      <UploadCloud className="w-4 h-4 text-aei-green" />
                      صورة بطاقة الهوية + ملحق العائلة (PDF/JPG)
                    </label>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setUploadingIdCard(true);
                          const url = await uploadDocument(file, 'ids');
                          updateField('id_card_url', url);
                          setUploadingIdCard(false);
                        }
                      }}
                      className="text-xs file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-aei-green/10 file:text-aei-green hover:file:bg-aei-green/20"
                    />
                    {uploadingIdCard && <span className="text-[11px] text-aei-green block mt-1">جاري الرفع...</span>}
                    {formData.id_card_url && <span className="text-[11px] text-emerald-600 block mt-1 font-bold">تم إرفاق وثيقة الهوية بنجاح</span>}
                  </div>

                  <div className="sm:col-span-2 p-4 rounded-2xl bg-gradient-to-l from-purple-50 to-slate-50 border border-purple-200">
                    <label className="block text-xs font-black text-aei-purple mb-1 flex items-center gap-1.5">
                      <Lock className="w-4 h-4 text-aei-gold" />
                      إنشاء رمز مرور شخصي بسيط (PIN) لبوابة الموظف <span className="text-rose-500">*</span>
                    </label>
                    <p className="text-[11px] text-slate-500 mb-2">
                      اختر رقماً سرياً من 4 إلى 6 أرقام لحفظه واستخدامه في فتح بروفايلك واستعراض بطاقة عملك والباركود لاحقاً.
                    </p>
                    <input
                      type="password"
                      maxLength={6}
                      value={formData.pin || ''}
                      onChange={(e) => updateField('pin', e.target.value)}
                      placeholder="أدخل 4 أو 6 أرقام سرية"
                      className="w-full sm:w-64 px-4 py-2 rounded-xl border border-slate-300 focus:border-aei-purple focus:ring-2 focus:ring-aei-purple/20 text-center text-base font-black tracking-widest"
                      required
                    />
                  </div>

                  <div className="sm:col-span-2 pt-2">
                    <label className="flex items-start gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-200 cursor-pointer hover:bg-slate-100/60 transition-colors">
                      <input
                        type="checkbox"
                        checked={formData.declaration_agreed || false}
                        onChange={(e) => updateField('declaration_agreed', e.target.checked)}
                        className="mt-1 w-4 h-4 text-aei-purple rounded border-slate-300 focus:ring-aei-purple"
                        required
                      />
                      <span className="text-xs font-bold text-slate-800 leading-relaxed">
                        أقر وأتعهد بأن كافة البيانات الشخصية والوظيفية والمالية المدخلة أعلاه صحيحة ودقيقة تماماً ومطابقة لواقع الحال، وأتحمل المسؤولية القانونية والإدارية عن أي خلل في صحتها.
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-8 pt-5 border-t border-slate-200 flex items-center justify-between">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-bold text-sm hover:bg-slate-50 transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4" />
                  السابق
                </button>
              ) : <div />}

              {step < 5 ? (
                <button
                  type="submit"
                  className="px-7 py-2.5 rounded-xl bg-gradient-to-l from-aei-purple to-aei-purple-light hover:to-aei-purple text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
                >
                  التالي
                  <ArrowLeft className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3 rounded-xl bg-gradient-to-l from-aei-green to-emerald-600 hover:to-aei-green text-white font-black text-sm shadow-lg hover:shadow-xl transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {submitting ? 'جاري الحفظ والتوثيق...' : 'اعتماد وحفظ البيانات النهائية'}
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
