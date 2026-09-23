import React, { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  required?: boolean;
  error?: string;
  showIcon?: boolean;
}

export const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  required = false,
  error,
  showIcon = false,
  className = '',
  id,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputId = id || label.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label htmlFor={inputId} className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>
      <div className="relative rounded-lg shadow-sm min-w-0">
        {showIcon && (
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
        )}
        <input
          id={inputId}
          type={showPassword ? 'text' : 'password'}
          className={`w-full h-11 ${
            showIcon ? 'pl-10' : 'px-3.5'
          } pr-10 bg-slate-50/70 border ${
            error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
          } rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 ${className}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
