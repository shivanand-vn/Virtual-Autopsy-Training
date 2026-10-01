import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowRight, KeyRound, CheckCircle2 } from 'lucide-react';

interface SecurityNoticeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityNoticeModal: React.FC<SecurityNoticeModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleChangePassword = () => {
    onClose();
    navigate('/forgot-password');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="bg-[#0A192F] text-white rounded-3xl border border-amber-500/40 shadow-2xl max-w-lg w-full overflow-hidden relative transform transition-all animate-scaleUp"
        role="dialog"
        aria-modal="true"
        aria-labelledby="security-notice-title"
      >
        {/* Glow ambient background effects */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Modal Header */}
        <div className="p-6 sm:p-8 pb-4 relative z-10">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-400/40 text-amber-400 flex items-center justify-center shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-400 font-mono bg-amber-400/10 px-2.5 py-0.5 rounded-full border border-amber-400/20">
                First-Login Protection
              </span>
              <h2 id="security-notice-title" className="text-xl sm:text-2xl font-extrabold text-white tracking-tight mt-1">
                Security Notice
              </h2>
            </div>
          </div>
        </div>

        {/* Modal Content Body */}
        <div className="px-6 sm:px-8 py-3 relative z-10 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-3">
            <p className="text-sm text-slate-200 leading-relaxed">
              For your security, please do not use your temporary password for a long period. Please change your temporary password using the Forgot Password option.
            </p>
          </div>

          <div className="flex items-start space-x-2.5 text-xs text-amber-300/90 bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
            <KeyRound className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>
              You can easily update your credentials at any time via the Forgot Password or Account Security settings.
            </span>
          </div>
        </div>

        {/* Modal Footer / Action Buttons */}
        <div className="p-6 sm:p-8 pt-4 relative z-10 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-800/80 bg-slate-950/40">
          <button
            type="button"
            onClick={handleChangePassword}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-400/30 text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 cursor-pointer"
          >
            <span>Change Password Now</span>
            <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
          </button>
          
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center space-x-1.5 cursor-pointer transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4 text-slate-950" />
            <span>OK / Continue to Dashboard</span>
          </button>
        </div>
      </div>
    </div>
  );
};
