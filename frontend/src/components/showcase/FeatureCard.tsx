import React from 'react';
import { Check, Award } from 'lucide-react';

interface FeatureCardProps {
  title: string;
  description: string;
  variant?: 'check' | 'quote';
  author?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({
  title,
  description,
  variant = 'check',
  author,
}) => {
  if (variant === 'quote') {
    return (
      <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm transition-all duration-200 hover:border-amber-300">
        <div className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 mt-0.5">
            <Award className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <p className="text-xs italic text-slate-600 leading-relaxed font-medium">
              "{description}"
            </p>
            {author && (
              <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mt-1.5">
                {author}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-white border border-slate-200/90 shadow-sm transition-all duration-200 hover:border-amber-300 hover:shadow-md flex items-start gap-3">
      <div className="w-6 h-6 rounded-full bg-amber-100/70 border border-amber-300 flex items-center justify-center shrink-0 text-amber-600 mt-0.5">
        <Check className="w-3.5 h-3.5 stroke-[3] text-amber-600" />
      </div>
      <div>
        <h4 className="text-xs font-bold text-navy-950">
          {title}
        </h4>
        <p className="text-[11px] text-slate-500 mt-0.5 leading-snug">
          {description}
        </p>
      </div>
    </div>
  );
};
