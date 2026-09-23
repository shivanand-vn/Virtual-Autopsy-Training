import React from 'react';
import { ChevronDown } from 'lucide-react';

interface Option {
  value: string;
  label: string;
}

interface SelectInputProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export const SelectInput: React.FC<SelectInputProps> = ({
  label,
  options,
  placeholder = 'Select an option',
  required = false,
  error,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label htmlFor={selectId} className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm min-w-0">
        <select
          id={selectId}
          className={`w-full h-11 px-3.5 pr-8 bg-slate-50/70 border appearance-none truncate ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
          } rounded-lg text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${className}`}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
