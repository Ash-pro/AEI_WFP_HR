import React from 'react';
import { BrandLogo } from '../common/BrandLogo';
import { Heart, ShieldCheck, Phone, Mail, MapPin } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
          {/* Col 1: Brand Info */}
          <div className="md:col-span-2 space-y-4">
            <BrandLogo variant="dark" size="lg" />
            <p className="text-sm text-slate-400 leading-relaxed max-w-lg mt-3">
              منصة إدارة العمليات الميدانية والكوادر البشرية لمشروع دعم الأمن الغذائي والتغذية المنفذ بالشراكة بين جمعية أرض الإنسان (تأسست عام 1984) وبرنامج الأغذية العالمي (WFP) في محافظات قطاع غزة.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-aei-green/20 text-emerald-400 border border-emerald-500/30">
                <ShieldCheck className="w-3.5 h-3.5" />
                نظام آمن ومشفر 100%
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-wfp-blue/20 text-sky-400 border border-sky-500/30">
                WFP Humanitarian System
              </span>
            </div>
          </div>

          {/* Col 2: Quick Services */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-r-2 border-aei-gold pr-2">
              خدمات الكادر الميداني
            </h3>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="/register" className="hover:text-aei-gold transition-colors">استمارة تسجيل الكادر الميداني</a>
              </li>
              <li>
                <a href="/leave-request" className="hover:text-aei-gold transition-colors">تقديم طلب إجازة سنوية / طبية</a>
              </li>
              <li>
                <a href="/resignation" className="hover:text-aei-gold transition-colors">تقديم طلب استقالة معتمد</a>
              </li>
              <li>
                <a href="/login" className="hover:text-aei-gold transition-colors">بوابة الإدارة والمشرفين</a>
              </li>
            </ul>
          </div>

          {/* Col 3: Field Contact */}
          <div>
            <h3 className="text-white font-bold text-base mb-4 border-r-2 border-aei-green pr-2">
              المقر والتواصل
            </h3>
            <ul className="space-y-3 text-sm text-slate-400">
              <li className="flex items-center gap-2.5">
                <MapPin className="w-4 h-4 text-aei-gold flex-shrink-0" />
                <span>دير البلح - المقر الميداني المؤقت / غزة</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-aei-gold flex-shrink-0" />
                <span>ashraf.2lsalibi@gmail.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <a
                  href="https://wa.me/972598466903"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-400 transition-colors font-mono"
                  dir="ltr"
                  title="تواصل عبر واتساب"
                >
                  00972598466903
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright & Developer Credit */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p className="text-slate-500">
            © {new Date().getFullYear()} جمعية أرض الإنسان - فلسطين • برنامج الأغذية العالمي (WFP). جميع الحقوق محفوظة.
          </p>
          
          <div className="flex items-center gap-2.5 bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700/60 shadow-inner">
            <span className="text-slate-300 font-medium">تصميم وتنفيذ: م. أشرف أسامة الصليبي</span>
            <span className="text-slate-600">|</span>
            <a
              href="https://wa.me/972598466903"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:text-emerald-300 font-mono font-bold transition-all inline-flex items-center gap-1.5 hover:underline"
              title="مراسلة مباشرة عبر واتساب"
            >
              <span dir="ltr">00972598466903</span>
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
