import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  ShieldCheck,
  Mail,
  CreditCard,
  BookOpen,
  KeyRound,
  Copy,
  Check,
} from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';

interface PaymentSuccessModalProps {
  email: string;
  transactionId: string;
  amount: string;
  courseName: string;
  temporaryPassword?: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  email,
  transactionId,
  amount,
  courseName,
  temporaryPassword,
}) => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyPassword = () => {
    if (temporaryPassword) {
      navigator.clipboard.writeText(temporaryPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleContinueToLogin = () => {
    navigate('/login', { state: { email } });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-4 text-center transform transition-all scale-100 max-h-[95vh] overflow-y-auto custom-scrollbar">
        {/* Success Icon */}
        <div className="w-14 h-14 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-8 h-8 text-amber-600" />
        </div>

        {/* Title */}
        <div className="space-y-1">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full">
            REGISTRATION & PAYMENT CONFIRMED
          </span>
          <h2 className="text-2xl font-black text-navy-950 tracking-tight">Welcome to the Academy!</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Your payment receipt and student portal credentials have been dispatched to your email.
          </p>
        </div>

        {/* Credentials Card (Instant Access) */}
        {temporaryPassword && (
          <div className="bg-amber-50/80 border border-amber-300/80 rounded-2xl p-4 text-xs text-left space-y-2.5">
            <div className="flex items-center gap-1.5 pb-1 border-b border-amber-200/80">
              <KeyRound className="w-4 h-4 text-amber-700" />
              <span className="font-extrabold text-navy-950 uppercase tracking-wider text-[11px]">
                Your Student Login Credentials
              </span>
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px] font-semibold">Username / Email:</span>
                <span className="font-mono font-bold text-navy-950 text-xs truncate max-w-[190px]">{email}</span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 text-[11px] font-semibold">Temporary Password:</span>
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-black text-amber-800 bg-amber-100 border border-amber-200 px-2 py-0.5 rounded text-xs select-all">
                    {temporaryPassword}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyPassword}
                    className="p-1 rounded-md bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors cursor-pointer"
                    title="Copy Password"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-amber-900/80 leading-tight">
              Please save this password. You will be prompted to update it after signing in.
            </p>
          </div>
        )}

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3.5 text-xs text-left space-y-2">
          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              Course
            </span>
            <span className="font-extrabold text-navy-950 text-right max-w-[200px] truncate" title={courseName}>
              {courseName}
            </span>
          </div>

          <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              Amount Paid
            </span>
            <span className="font-mono font-black text-amber-700 text-sm">{amount}</span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              Transaction ID
            </span>
            <span className="font-mono font-extrabold text-slate-900 bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md text-[11px]">
              {transactionId}
            </span>
          </div>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-1">
          <PrimaryButton onClick={handleContinueToLogin}>
            <span className="flex items-center justify-center gap-2">
              <span>Sign In to Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
