import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  icon?: LucideIcon;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  required = false,
  error,
  icon: Icon,
  className = '',
  id,
  ...props
}) => {
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label htmlFor={inputId} className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm min-w-0">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Icon className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          className={`w-full h-11 ${
            Icon ? 'pl-10' : 'px-3.5'
          } pr-3.5 bg-slate-50/70 border ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
          } rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${className}`}
          {...props}
        />
      </div>
      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
