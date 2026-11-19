import React from 'react';
import { Check } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: 1 | 2 | 3;
  isPaymentSuccess?: boolean;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep, isPaymentSuccess = false }) => {
  return (
    <div className="w-full py-2 px-0.5">
      <div className="flex items-center justify-between text-xs max-w-sm mx-auto sm:max-w-none">
        {/* Step 1: Personal Details */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-[11px] transition-all duration-200 ${
              currentStep > 1 || isPaymentSuccess
                ? 'bg-amber-500 text-navy-950 shadow-xs'
                : 'bg-amber-500 text-navy-950 ring-2 ring-amber-400/40 shadow-xs'
            }`}
          >
            {currentStep > 1 || isPaymentSuccess ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            ) : (
              '1'
            )}
          </div>
          <span
            className={`text-[11px] sm:text-xs transition-colors ${
              currentStep === 1
                ? 'text-navy-950 font-extrabold'
                : currentStep > 1
                ? 'text-slate-700 font-bold'
                : 'text-slate-400 font-medium'
            }`}
          >
            Personal Details
          </span>
        </div>

        {/* Divider 1 */}
        <div
          className={`flex-1 mx-1.5 sm:mx-3 border-t-2 border-dashed transition-colors ${
            currentStep > 1 ? 'border-amber-400' : 'border-slate-200'
          }`}
        />

        {/* Step 2: Course Selection */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-[11px] transition-all duration-200 ${
              currentStep > 2 || isPaymentSuccess
                ? 'bg-amber-500 text-navy-950 shadow-xs'
                : currentStep === 2
                ? 'bg-amber-500 text-navy-950 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-300'
            }`}
          >
            {currentStep > 2 || isPaymentSuccess ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            ) : (
              '2'
            )}
          </div>
          <span
            className={`text-[11px] sm:text-xs transition-colors ${
              currentStep === 2
                ? 'text-navy-950 font-extrabold'
                : currentStep > 2
                ? 'text-slate-700 font-bold'
                : 'text-slate-400 font-medium'
            }`}
          >
            Course Selection
          </span>
        </div>

        {/* Divider 2 */}
        <div
          className={`flex-1 mx-1.5 sm:mx-3 border-t-2 border-dashed transition-colors ${
            currentStep > 2 || isPaymentSuccess ? 'border-amber-400' : 'border-slate-200'
          }`}
        />

        {/* Step 3: Payment */}
        <div className="flex items-center space-x-1.5 sm:space-x-2 shrink-0">
          <div
            className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center font-extrabold text-[10px] sm:text-[11px] transition-all duration-200 ${
              isPaymentSuccess
                ? 'bg-amber-500 text-navy-950 shadow-xs'
                : currentStep === 3
                ? 'bg-amber-500 text-navy-950 ring-2 ring-amber-400/40 shadow-xs'
                : 'bg-slate-100 text-slate-400 border border-slate-300'
            }`}
          >
            {isPaymentSuccess ? (
              <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 stroke-[3]" />
            ) : (
              '3'
            )}
          </div>
          <span
            className={`text-[11px] sm:text-xs transition-colors ${
              currentStep === 3 || isPaymentSuccess
                ? 'text-navy-950 font-extrabold'
                : 'text-slate-400 font-medium'
            }`}
          >
            Payment
          </span>
        </div>
      </div>
    </div>
  );
};
