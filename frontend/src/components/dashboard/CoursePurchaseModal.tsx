import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useCourse } from '../../context/CourseContext';
import {
  X,
  CreditCard,
  Lock,
  ShieldCheck,
  Loader2,
  CheckCircle2,
  BookOpen,
  AlertCircle
} from 'lucide-react';
import type { Course } from '../../types/course';

interface CoursePurchaseModalProps {
  course: Course;
  onClose: () => void;
  onSuccess: () => void;
}

export const CoursePurchaseModal: React.FC<CoursePurchaseModalProps> = ({
  course,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();
  const { purchaseCourse } = useCourse();

  const [cardNumber, setCardNumber] = useState('4242 •••• •••• 4242');
  const [expiry, setExpiry] = useState('12/28');
  const [cvc, setCvc] = useState('123');
  const [cardholder, setCardholder] = useState(user?.fullName || 'Demo Student');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const courseFee = course.fee !== undefined ? Number(course.fee) : 750.0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsProcessing(true);

    try {
      const cardLast4 = cardNumber.replace(/\D/g, '').slice(-4) || '4242';
      await purchaseCourse(course.id, cardLast4);
      setIsSuccess(true);
      setTimeout(() => {
        onSuccess();
      }, 1500);
    } catch (err: any) {
      console.error('Course purchase error:', err);
      const msg = err.response?.data?.message || err.message || 'Payment processing failed. Please try again.';
      setError(msg);
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 animate-scale-in relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          disabled={isProcessing}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-4 animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-[#0A192F]">Enrollment Activated!</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              Your payment of <strong className="text-slate-900">£{courseFee.toFixed(2)}</strong> was processed successfully.
              Unlocking <strong className="text-slate-900">{course.title || course.name}</strong>...
            </p>
          </div>
        ) : (
          <>
            {/* Modal Header */}
            <div className="flex items-start space-x-3.5 pr-8">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0">
                <BookOpen className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                  NEW COURSE ENROLLMENT
                </span>
                <h3 className="text-lg font-black text-[#0A192F] mt-1 leading-snug">
                  {course.title || course.name}
                </h3>
              </div>
            </div>

            {/* Error Notice */}
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-2 text-xs font-bold text-rose-700">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{error}</span>
              </div>
            )}

            {/* Pricing Summary Box */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Student Account:</span>
                <span className="font-bold text-slate-800">{user?.email}</span>
              </div>
              <div className="flex items-center justify-between text-slate-500 font-medium">
                <span>Tuition Tier:</span>
                <span className="font-bold text-slate-800">Standard CPD License</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-mono">
                <span className="font-bold text-slate-700">Total Due Today:</span>
                <span className="text-base font-black text-amber-600">
                  £{courseFee.toFixed(2)} GBP
                </span>
              </div>
            </div>

            {/* Payment Details Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-[#0A192F] mb-1">
                  Cardholder Name
                </label>
                <input
                  type="text"
                  required
                  value={cardholder}
                  onChange={(e) => setCardholder(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-[#0A192F] mb-1">
                  Card Details (Testing Stripe Mode)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                    <CreditCard className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4242 •••• •••• 4242"
                    className="w-full text-xs pl-10 pr-3 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1">
                    Expiry Date
                  </label>
                  <input
                    type="text"
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-slate-800 font-bold text-center"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[#0A192F] mb-1">
                    CVC / CVV
                  </label>
                  <input
                    type="text"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="123"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-mono text-slate-800 font-bold text-center"
                  />
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Payment...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-3.5 h-3.5 text-slate-900" />
                      <span>Confirm & Pay £{courseFee.toFixed(2)}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-center space-x-2 text-[10px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Instant access unlocked immediately upon confirmation.</span>
              </div>
            </form>
          </>
        )}

      </div>
    </div>
  );
};
