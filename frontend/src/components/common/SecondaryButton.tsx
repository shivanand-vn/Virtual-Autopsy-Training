import React from 'react';
import { Building2 } from 'lucide-react';

interface SecondaryButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

export const SecondaryButton: React.FC<SecondaryButtonProps> = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <button
      type="button"
      className={`w-full h-11 bg-white hover:bg-slate-50 text-slate-700 font-semibold text-xs border border-slate-200 rounded-xl transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${className}`}
      {...props}
    >
      <Building2 className="w-4 h-4 text-slate-500" />
      <span>{children}</span>
    </button>
  );
};
