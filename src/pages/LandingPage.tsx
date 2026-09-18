import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Calendar, AlertCircle, UserCheck, ArrowLeft } from 'lucide-react';
import { PortalModal } from '../components/common/PortalModal';

export const LandingPage: React.FC = () => {
  const [showPortalModal, setShowPortalModal] = useState(false);

  return (
    <div className="space-y-16 py-8">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-br from-white via-purple-50/40 to-slate-50 border border-slate-200/80 p-8 sm:p-14 shadow-sm relative overflow-hidden">
          <div className="max-w-3xl space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-aei-purple/10 text-aei-purple border border-aei-purple/20 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-aei-green animate-pulse" />
              منظومة إنسانية موحدة • جمعية أرض الإنسان & برنامج الأغذية العالمي
            </div>
            
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 leading-[1.45] sm:leading-[1.4]">
              <span className="block">نظام إدارة العمليات والكوادر الميدانية</span>
              <span className="block text-2xl sm:text-4xl mt-3 text-transparent bg-clip-text bg-gradient-to-l from-aei-purple via-aei-green to-aei-gold font-sans font-black">
                AEI · WFP · HR
              </span>
            </h1>

            <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl">
              منصة سحابية متكاملة لتوثيق وتتبع بيانات الكوادر، المتطوعين، وأفراد الأمن في مراكز ونقاط توزيع الغذاء التخصصية والتغذية العلاجية والوقائية في قطاع غزة.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-gradient-to-l from-aei-purple to-aei-purple-light hover:to-aei-purple text-white font-black text-sm shadow-md hover:shadow-lg transition-all flex items-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                تسجيل أو إكمال بيانات كادر
              </Link>

              <button
                onClick={() => setShowPortalModal(true)}
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-aei-purple" />
                بوابة الموظف بالـ PIN
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Main Action Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            الخدمات الذاتية الميدانية
          </h2>
          <p className="text-sm text-slate-500">وصول سريع لكافة المعاملات الإدارية والميدانية المعتمدة</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link
            to="/register"
            className="group p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-aei-purple shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-aei-purple/10 text-aei-purple flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserPlus className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-aei-purple transition-colors">
                  تسجيل كادر جديد
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  استمارة الـ 5 خطوات لتوثيق بيانات الموظفين والمتطوعين والأمن (33 حقلاً معتمد).
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-aei-purple gap-1">
              <span>بدء التسجيل</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/leave-request"
            className="group p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-aei-green shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-aei-green/10 text-aei-green flex items-center justify-center group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-aei-green transition-colors">
                  تقديم طلب إجازة
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  طلب إجازة سنوية أو طبية مع إرفاق التقرير الطبي واحتساب عدد الأيام ومتابعة الحالة.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-aei-green gap-1">
              <span>تقديم الطلب</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            to="/resignation"
            className="group p-6 rounded-3xl bg-white border border-slate-200/80 hover:border-rose-500 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-110 transition-transform">
                <AlertCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors">
                  طلب استقالة رسمي
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  توثيق طلب الاستقالة مع رفع صورة الخطاب الخطي وحصر العهد وتعيين الموظف البديل.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-rose-600 gap-1">
              <span>تقديم الاستقالة</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </Link>

          <button
            onClick={() => setShowPortalModal(true)}
            className="group p-6 rounded-3xl bg-gradient-to-br from-slate-900 to-slate-800 text-white text-right shadow-xs hover:shadow-lg transition-all flex flex-col justify-between cursor-pointer"
          >
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-white/10 text-aei-gold flex items-center justify-center group-hover:scale-110 transition-transform">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white group-hover:text-aei-gold transition-colors">
                  بوابة الموظف الذاتية
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  الدخول برقم الهوية ورمز PIN لاستعراض بطاقة العمل بالباركود والعهد وطلب تعديل البيانات.
                </p>
              </div>
            </div>
            <div className="mt-5 flex items-center text-xs font-bold text-aei-gold gap-1">
              <span>دخول البروفايل</span>
              <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Live Stats Overview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-aei-purple">29</span>
            <span className="text-xs font-bold text-slate-500 block">نقطة ومقر ميداني معتمد</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-aei-green">145</span>
            <span className="text-xs font-bold text-slate-500 block">كادر ميداني وإداري رسمي</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-aei-gold">5</span>
            <span className="text-xs font-bold text-slate-500 block">مشرفين ومنسقة إدارة عليا</span>
          </div>
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 text-center space-y-1">
            <span className="text-2xl sm:text-3xl font-black text-wfp-blue">100%</span>
            <span className="text-xs font-bold text-slate-500 block">عهد مرقمة AST وبطاقات QR</span>
          </div>
        </div>
      </section>

      {showPortalModal && <PortalModal onClose={() => setShowPortalModal(false)} />}
    </div>
  );
};
