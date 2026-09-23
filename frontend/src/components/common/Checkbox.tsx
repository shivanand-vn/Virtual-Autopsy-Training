import React from 'react';

interface CheckboxProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: React.ReactNode;
  error?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  error,
  id,
  className = '',
  ...props
}) => {
  const checkboxId = id || 'consent-checkbox';

  return (
    <div className="space-y-1">
      <div className="flex items-start gap-3">
        <div className="flex items-center h-5 mt-0.5">
          <input
            id={checkboxId}
            type="checkbox"
            className={`w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500/30 focus:ring-offset-0 cursor-pointer accent-amber-500 ${className}`}
            {...props}
          />
        </div>
        <label htmlFor={checkboxId} className="text-xs text-slate-600 leading-relaxed cursor-pointer select-none">
          {label}
        </label>
      </div>
      {error && <p className="text-xs text-red-500 font-medium pl-7">{error}</p>}
    </div>
  );
};
