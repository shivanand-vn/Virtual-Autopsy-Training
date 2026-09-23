import React from 'react';

interface StatusBadgeProps {
  children: React.ReactNode;
  variant?: 'gold' | 'navy';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ children }) => {
  return (
    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-400/30 text-amber-900 text-[11px] font-bold uppercase tracking-wider">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]"></span>
      <span>{children}</span>
    </div>
  );
};
