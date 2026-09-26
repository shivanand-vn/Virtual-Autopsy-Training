import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2;
  isPaymentSuccess?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, isPaymentSuccess = false }) => {
  return (
    <div className="w-full py-2 px-1">
      <div className="flex items-center justify-between text-xs max-w-sm mx-auto sm:max-w-none">
        {/* Step 1: Registration Details */}
        <div className="flex items-center space-x-2 shrink-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] transition-all duration-200 ${
              currentStep === 1
                ? 'bg-amber-500 text-navy-950 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-amber-500 text-navy-950'
            }`}
          >
            {currentStep === 2 || isPaymentSuccess ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : (
              '1'
            )}
          </div>
          <span
            className={`font-bold transition-colors ${
              currentStep === 1 ? 'text-navy-950 font-extrabold' : 'text-slate-700 font-semibold'
            }`}
          >
            Registration Details
          </span>
        </div>

        {/* Divider Arrow */}
        <div className="flex-1 mx-3 border-t-2 border-dashed border-slate-200" />

        {/* Step 2: Payment */}
        <div className="flex items-center space-x-2 shrink-0">
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center font-extrabold text-[11px] transition-all duration-200 ${
              isPaymentSuccess
                ? 'bg-amber-500 text-navy-950'
                : currentStep === 2
                ? 'bg-amber-500 text-navy-950 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-300'
            }`}
          >
            {isPaymentSuccess ? (
              <Check className="w-3.5 h-3.5 stroke-[3]" />
            ) : currentStep === 2 ? (
              <span className="w-2 h-2 bg-navy-950 rounded-full" />
            ) : (
              '2'
            )}
          </div>
          <span
            className={`font-bold transition-colors ${
              currentStep === 2 || isPaymentSuccess
                ? 'text-navy-950 font-extrabold'
                : 'text-slate-400 font-semibold'
            }`}
          >
            Payment
          </span>
        </div>
      </div>
    </div>
  );
};
