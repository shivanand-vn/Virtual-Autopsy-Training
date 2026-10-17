import React, { memo, useState } from 'react';

export type VatLogoMode = 'scanner' | 'pulse' | 'orbit' | 'badge' | 'minimal';
export type VatLogoSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface VatAnimatedLogoProps {
  /**
   * Animation mode preset:
   * - 'scanner': Precision laser sweep with corner targeting reticles
   * - 'pulse': Holographic organic breathing with subtle sheen
   * - 'orbit': Circular tech reticle with counter-rotating rings
   * - 'badge': Compact status badge with subtle live indicator
   * - 'minimal': Clean logo with subtle hover sheen
   */
  mode?: VatLogoMode;
  /** Size preset */
  size?: VatLogoSize;
  /** Optional container class name */
  className?: string;
  /** Whether to show branded telemetry / status text beneath */
  showLabel?: boolean;
  /** Custom label text override */
  labelTitle?: string;
  /** Custom subtitle text override */
  labelSubtitle?: string;
  /** Enable click pulse reaction */
  interactive?: boolean;
  /** Optional click handler */
  onClick?: () => void;
  /** Asset priority flag for preloading/eager decoding */
  priority?: boolean;
}

const SIZE_MAP: Record<VatLogoSize, { container: string; logo: string; radar: string; reticle: string }> = {
  xs: {
    container: 'w-8 h-8',
    logo: 'w-4 aspect-[376/418]',
    radar: 'w-10 h-10',
    reticle: 'w-8 h-8',
  },
  sm: {
    container: 'w-16 h-18',
    logo: 'w-12 aspect-[376/418]',
    radar: 'w-24 h-24',
    reticle: 'w-28 h-28',
  },
  md: {
    container: 'w-28 h-32',
    logo: 'w-24 aspect-[376/418]',
    radar: 'w-40 h-40',
    reticle: 'w-44 h-44',
  },
  lg: {
    container: 'w-40 h-48',
    logo: 'w-36 aspect-[376/418]',
    radar: 'w-56 h-56',
    reticle: 'w-60 h-60',
  },
  xl: {
    container: 'w-56 h-64',
    logo: 'w-48 aspect-[376/418]',
    radar: 'w-72 h-72',
    reticle: 'w-80 h-80',
  },
};

export const VatAnimatedLogo: React.FC<VatAnimatedLogoProps> = memo(({
  mode = 'scanner',
  size = 'md',
  className = '',
  showLabel = false,
  labelTitle = 'VIRTUAL AUTOPSY',
  labelSubtitle = 'FORENSIC PMCT LMS',
  interactive = false,
  onClick,
  priority = true,
}) => {
  const [isPressed, setIsPressed] = useState(false);
  const sizeConfig = SIZE_MAP[size] || SIZE_MAP.md;

  const handleClick = () => {
    if (interactive) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 240);
    }
    if (onClick) onClick();
  };

  return (
    <div className={`inline-flex flex-col items-center justify-center select-none ${className}`}>
      {/* Animated Core Viewport */}
      <div
        onClick={handleClick}
        className={`relative flex items-center justify-center ${
          mode === 'orbit' ? sizeConfig.reticle : sizeConfig.container
        } ${
          interactive ? 'cursor-pointer' : ''
        }`}
        role={interactive || onClick ? 'button' : 'img'}
        aria-label="Virtual Autopsy Logo"
      >
        {/* Mode: Orbit / Loader Reticles */}
        {mode === 'orbit' && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-80">
            <svg className="w-full h-full animate-vat-spin" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="46"
                fill="none"
                stroke="#facc15"
                strokeWidth="1.2"
                strokeDasharray="4 8 16 6"
                opacity="0.8"
              />
              <circle
                cx="50"
                cy="50"
                r="41"
                fill="none"
                stroke="#38bdf8"
                strokeWidth="0.8"
                strokeDasharray="10 14"
                opacity="0.6"
              />
            </svg>
            <svg className="absolute w-full h-full animate-vat-spin-reverse" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="36"
                fill="none"
                stroke="#f59e0b"
                strokeWidth="1.4"
                strokeDasharray="4 24"
                opacity="0.7"
              />
            </svg>
          </div>
        )}

        {/* Logo Container (Centered and Aligned) */}
        <div
          className={`relative ${sizeConfig.logo} transition-transform duration-200 ${
            mode === 'badge' ? '' : 'animate-vat-float'
          } ${isPressed ? 'scale-105' : 'scale-100'}`}
        >
          {/* Scanner: Corner Reticle Brackets */}
          {mode === 'scanner' && (
            <div className="absolute -inset-1.5 pointer-events-none">
              <div className="absolute top-0 left-0 w-2.5 h-2.5 border-t-2 border-l-2 border-amber-400" />
              <div className="absolute top-0 right-0 w-2.5 h-2.5 border-t-2 border-r-2 border-amber-400" />
              <div className="absolute bottom-0 left-0 w-2.5 h-2.5 border-b-2 border-l-2 border-amber-400" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 border-b-2 border-r-2 border-amber-400" />
            </div>
          )}

          {/* Scanner: Laser Beam */}
          {mode === 'scanner' && (
            <div
              className="absolute left-[-15%] right-[-15%] h-[2.5px] rounded-full bg-gradient-to-r from-transparent via-amber-400 to-transparent shadow-[0_0_14px_2px_#facc15,0_0_24px_4px_#38bdf8] animate-vat-laser z-20 pointer-events-none"
            >
              <div className="absolute -top-3 left-0 right-0 h-6 bg-gradient-to-b from-amber-400/20 via-sky-400/15 to-transparent blur-sm pointer-events-none" />
            </div>
          )}

          {/* Pulse Mode: Backing Radial Aurora */}
          {mode === 'pulse' && (
            <div className="absolute -inset-3 bg-gradient-to-r from-amber-500/20 via-sky-500/20 to-amber-500/20 rounded-full blur-md animate-pulse pointer-events-none" />
          )}

          {/* Sheen Highlight Overlay */}
          <div className="absolute inset-0 overflow-hidden rounded-full pointer-events-none">
            <div className="absolute -inset-full bg-gradient-to-r from-transparent via-white/20 to-transparent animate-vat-sheen" />
          </div>

          {/* High-Resolution Logo Image */}
          <img
            src="/vat-logo.png"
            alt="Virtual Autopsy Logo"
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            className="relative z-10 w-full h-full object-contain filter drop-shadow-[0_8px_16px_rgba(10,25,47,0.7)] pointer-events-none"
          />

          {/* Badge Mode: Live Status Dot */}
          {mode === 'badge' && (
            <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 border-2 border-slate-900 rounded-full shadow-sm z-30" />
          )}
        </div>
      </div>

      {/* Label (Clean text without unnecessary telemetry or dots) */}
      {showLabel && labelTitle && (
        <div className="mt-4 flex flex-col items-center text-center">
          <span className="text-sm font-medium tracking-wide text-slate-200">
            {labelTitle}
          </span>
          {labelSubtitle && (
            <span className="text-xs text-slate-400 mt-1">
              {labelSubtitle}
            </span>
          )}
        </div>
      )}
    </div>
  );
});

VatAnimatedLogo.displayName = 'VatAnimatedLogo';
export default VatAnimatedLogo;
