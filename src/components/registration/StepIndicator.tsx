import React from 'react';
import { Check, User, Briefcase, GraduationCap, Home, CreditCard } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  onStepClick?: (step: number) => void;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, onStepClick }) => {
  const steps = [
    { number: 1, title: 'البيانات الشخصية', icon: User },
    { number: 2, title: 'البيانات الوظيفية', icon: Briefcase },
    { number: 3, title: 'المؤهلات والمزاولة', icon: GraduationCap },
    { number: 4, title: 'السكن والنزوح', icon: Home },
    { number: 5, title: 'المالية والمرفقات', icon: CreditCard },
  ];

  return (
    <div className="w-full py-4 mb-6">
      <div className="flex items-center justify-between relative">
        <div className="absolute top-1/2 right-0 left-0 -translate-y-1/2 h-1.5 bg-slate-200 z-0">
          <div
            className="h-full bg-gradient-to-l from-aei-purple via-aei-green to-aei-gold transition-all duration-300"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {steps.map((step) => {
          const isCompleted = step.number < currentStep;
          const isCurrent = step.number === currentStep;
          const Icon = step.icon;

          return (
            <div
              key={step.number}
              onClick={() => onStepClick && onStepClick(step.number)}
              className="flex flex-col items-center relative z-10 cursor-pointer group"
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm transition-all shadow-sm ${
                  isCompleted
                    ? 'bg-aei-green text-white shadow-emerald-200 ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-aei-purple text-white shadow-purple-200 ring-4 ring-purple-100 scale-110'
                    : 'bg-white text-slate-400 border-2 border-slate-200 hover:border-slate-300'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5 stroke-[2.5]" /> : <Icon className="w-5 h-5" />}
              </div>
              <span
                className={`mt-2 text-xs font-bold transition-colors hidden sm:block ${
                  isCurrent
                    ? 'text-aei-purple'
                    : isCompleted
                    ? 'text-slate-700'
                    : 'text-slate-400'
                }`}
              >
                {step.title}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
