import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ShieldCheck, Mail, CreditCard, BookOpen } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';

interface PaymentSuccessModalProps {
  email: string;
  transactionId: string;
  amount: string;
  courseName: string;
}

export const PaymentSuccessModal: React.FC<PaymentSuccessModalProps> = ({
  email,
  transactionId,
  amount,
  courseName,
}) => {
  const navigate = useNavigate();

  const handleContinueToLogin = () => {
    navigate('/login');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5 text-center transform transition-all scale-100 max-h-[95vh] overflow-y-auto">
        {/* Success Icon */}
        <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle className="w-9 h-9 text-amber-600" />
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-3 py-0.5 rounded-full">
            PAYMENT CONFIRMED
          </span>
          <h2 className="text-2xl font-black text-navy-950 tracking-tight">Payment Successful</h2>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            Demo: Payment details and login credentials have been marked as sent to your registered email.
          </p>
        </div>

        {/* Transaction Summary Card */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-4 text-xs text-left space-y-2.5">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <BookOpen className="w-3.5 h-3.5 text-amber-600" />
              Course
            </span>
            <span className="font-extrabold text-navy-950 text-right max-w-[200px] truncate" title={courseName}>
              {courseName}
            </span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <CreditCard className="w-3.5 h-3.5 text-amber-600" />
              Amount Paid
            </span>
            <span className="font-mono font-black text-amber-700 text-sm">{amount}</span>
          </div>

          <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
            <span className="text-slate-500 flex items-center gap-1.5 font-bold text-[11px] uppercase tracking-wider">
              <Mail className="w-3.5 h-3.5 text-amber-600" />
              Registered Email
            </span>
            <span className="font-mono font-bold text-slate-800 truncate max-w-[180px]">{email}</span>
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

        {/* Helper Instructions Note */}
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[11px] text-amber-900 text-left space-y-0.5">
          <p className="font-bold flex items-center gap-1">
            <span>Direct Account Access Activated:</span>
          </p>
          <p className="text-slate-700">
            You can now proceed to the Sign In page using your registered email: <strong>{email}</strong>.
          </p>
        </div>

        {/* Primary CTA Button */}
        <div className="pt-2">
          <PrimaryButton onClick={handleContinueToLogin}>
            <span className="flex items-center justify-center gap-2">
              <span>Continue to Login</span>
              <ArrowRight className="w-4 h-4" />
            </span>
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
};
