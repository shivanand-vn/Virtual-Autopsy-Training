import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';
import { StepIndicator } from './StepIndicator';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { FormInput } from '../common/FormInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import {
  CreditCard,
  Lock,
  ArrowLeft,
  ShieldCheck,
  Mail,
  Loader2,
  AlertCircle,
  CheckCircle2,
  KeyRound,
} from 'lucide-react';
import { api, sanitizeErrorMessage } from '../../lib/api';

export const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    registrationData,
    paymentData,
    processPayment,
    updatePaymentData,
    demoCredential,
  } = useRegistrationFlow();

  // Email confirmation state (CRITICAL: MUST start completely empty "")
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState<string | null>(null);

  // Registration OTP Verification state (Step 2 requirement)
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Resend OTP countdown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Card details state
  const [cardholderName, setCardholderName] = useState(
    paymentData.cardData.cardholderName || registrationData.fullName || 'Dr. Alistair Vance'
  );
  const [cardNumber, setCardNumber] = useState(paymentData.cardData.cardNumber || '4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState(paymentData.cardData.expiryDate || '12/28');
  const [cvc, setCvc] = useState(paymentData.cardData.cvc || '123');

  // Prevent paste into Confirm Email Address input
  const handlePastePrevent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setConfirmEmailError('Pasting is disabled. Please type your email address manually.');
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  // Format CVC (digits only up to 4)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(raw);
  };

  const handleBackToRegistration = () => {
    navigate('/register');
  };

  const isSubmitting = paymentData.paymentStatus === 'processing';

  const handleSendOtp = async () => {
    const enteredEmail = confirmEmail.trim();
    if (!enteredEmail || confirmEmailError) return;

    setIsSendingOtp(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await api.post('/auth/send-registration-otp', {
        email: enteredEmail,
        fullName: registrationData.fullName || 'Medical Candidate',
      });
      setOtpSent(true);
      setOtpDigits(['', '', '', '', '', '']);
      setResendCooldown(60);
      setOtpSuccessMsg(res.message || 'Verification code has been sent to your email.');
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      setOtpError(sanitizeErrorMessage(err.message, 'Unable to send verification code. Please try again.'));
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (codeToVerify?: string) => {
    const cleanOtp = (codeToVerify ?? otpDigits.join('')).trim();
    if (cleanOtp.length !== 6) {
      setOtpError('Please enter the complete 6-digit code.');
      return;
    }

    setIsVerifyingOtp(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    try {
      const res = await api.post('/auth/verify-registration-otp', {
        email: confirmEmail.trim(),
        otp: cleanOtp,
      });
      setIsEmailVerified(true);
      setOtpSuccessMsg(res.message || 'Email verified successfully!');
      setConfirmEmailError(null);
    } catch (err: any) {
      setOtpError(sanitizeErrorMessage(err.message, 'Invalid or expired verification code.'));
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const handleDigitChange = (index: number, value: string) => {
    const cleaned = value.replace(/\D/g, '');
    if (!cleaned) {
      const updated = [...otpDigits];
      updated[index] = '';
      setOtpDigits(updated);
      setOtpError(null);
      return;
    }

    if (cleaned.length > 1) {
      const chars = cleaned.slice(0, 6).split('');
      const updated = [...otpDigits];
      chars.forEach((c, i) => {
        if (index + i < 6) updated[index + i] = c;
      });
      setOtpDigits(updated);
      setOtpError(null);
      const nextIdx = Math.min(index + chars.length, 5);
      otpInputRefs.current[nextIdx]?.focus();

      if (updated.every((d) => d.length === 1)) {
        handleVerifyOtp(updated.join(''));
      }
      return;
    }

    const updated = [...otpDigits];
    updated[index] = cleaned;
    setOtpDigits(updated);
    setOtpError(null);

    if (index < 5 && cleaned) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (index === 5 && updated.every((d) => d.length === 1)) {
      handleVerifyOtp(updated.join(''));
    }
  };

  const handleDigitKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!otpDigits[index] && index > 0) {
        const updated = [...otpDigits];
        updated[index - 1] = '';
        setOtpDigits(updated);
        otpInputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleDigitPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const chars = pasted.split('');
    const newDigits = ['', '', '', '', '', ''];
    chars.forEach((c, i) => {
      newDigits[i] = c;
    });
    setOtpDigits(newDigits);
    setOtpError(null);
    const targetIdx = Math.min(chars.length, 5);
    otpInputRefs.current[targetIdx]?.focus();
    if (chars.length === 6) {
      handleVerifyOtp(pasted);
    }
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    setConfirmEmailError(null);
    updatePaymentData({ error: null });

    const enteredEmail = confirmEmail.trim();
    const storedRegEmail = (
      registrationData.email ||
      localStorage.getItem('virtual_autopsy_registration_email') ||
      ''
    ).trim();

    if (!enteredEmail) {
      setConfirmEmailError('Please use the same emailID used in registration');
      return;
    }

    if (storedRegEmail && enteredEmail.toLowerCase() !== storedRegEmail.toLowerCase()) {
      setConfirmEmailError('Please use the same emailID used in registration');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(enteredEmail)) {
      setConfirmEmailError('Please enter a valid email address.');
      return;
    }

    if (!isEmailVerified) {
      setConfirmEmailError('Please verify your email address with the OTP verification code first.');
      return;
    }

    await processPayment(enteredEmail, {
      cardholderName,
      cardNumber,
      expiryDate,
      cvc,
    });
  };

  const handleConfirmEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setConfirmEmail(val);
    setIsEmailVerified(false);
    setOtpSent(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError(null);
    setOtpSuccessMsg(null);

    const storedRegEmail = (
      registrationData.email ||
      localStorage.getItem('virtual_autopsy_registration_email') ||
      ''
    ).trim();

    if (val.trim() && storedRegEmail && val.trim().toLowerCase() !== storedRegEmail.toLowerCase()) {
      setConfirmEmailError('Please use the same emailID used in registration');
    } else {
      setConfirmEmailError(null);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden relative">
      {/* Top Header & Step Indicator */}
      <div className="shrink-0 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToRegistration}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Registration</span>
          </button>
          <StatusBadge>ACADEMY PAYMENT</StatusBadge>
        </div>

        {/* Step Indicator (Step 2 Active) */}
        <StepIndicator currentStep={2} isPaymentSuccess={paymentData.paymentStatus === 'success'} />

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Complete Registration Payment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Finalize your course enrollment via secure Stripe checkout.
          </p>
        </div>
      </div>

      {/* Internal Scrollable Payment Form Area */}
      <form onSubmit={handleSubmitPayment} className="flex-1 overflow-y-auto pr-1.5 space-y-4 custom-scrollbar my-1.5" noValidate>
        {/* Error Alert Banner */}
        {paymentData.error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-xl text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{paymentData.error}</span>
          </div>
        )}

        {/* Course Summary Box */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white border border-slate-800 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">ENROLLMENT COURSE</p>
              <h3 className="text-sm font-bold text-white mt-0.5">Post-Mortem Computed Tomography (PMCT) Training</h3>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[10px] text-slate-400 uppercase font-bold">FELLOWSHIP FEE</p>
              <p className="text-lg font-black text-amber-400 font-mono">£999</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Payment Gateway: <strong>Stripe Checkout</strong></span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </div>

        {/* EMAIL CONFIRMATION & OTP VERIFICATION SECTION */}
        <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-700 shrink-0" />
              <h4 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider">Confirm Your Email</h4>
            </div>
            {isEmailVerified && (
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-0.5 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                Verified
              </span>
            )}
          </div>

          <p className="text-xs text-slate-600 leading-relaxed">
            Please re-enter your email address to confirm where your payment confirmation and login credentials will be sent.
          </p>

          <FormInput
            label="Confirm Email Address"
            type="email"
            placeholder="abc@mail.com"
            value={confirmEmail}
            onChange={handleConfirmEmailChange}
            onPaste={handlePastePrevent}
            autoComplete="off"
            disabled={isEmailVerified}
            error={confirmEmailError || undefined}
          />
          <p className="text-[10px] text-slate-400">
            * Note: For security verification, copy & paste is disabled for this field. You must manually type your email.
          </p>

          {/* OTP Verification Subsection (Active once confirm email is entered and matching) */}
          {confirmEmail.trim() && !confirmEmailError && (
            <div className="pt-2.5 border-t border-amber-200/80 space-y-2.5">
              {!isEmailVerified ? (
                <>
                  {!otpSent ? (
                    <div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={isSendingOtp}
                        className="w-full sm:w-auto px-4 py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            <span>Sending Verification Code...</span>
                          </>
                        ) : (
                          <>
                            <KeyRound className="w-3.5 h-3.5" />
                            <span>Send Verification Code</span>
                          </>
                        )}
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-navy-950 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                          <ShieldCheck className="w-4 h-4 text-amber-600" />
                          Enter 6-Digit Verification Code
                        </span>
                        {resendCooldown > 0 ? (
                          <span className="text-[11px] text-slate-500 font-mono font-medium">
                            Resend code in {resendCooldown}s
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp}
                            className="text-[11px] font-bold text-amber-700 hover:text-amber-800 hover:underline cursor-pointer disabled:opacity-50"
                          >
                            Resend Code
                          </button>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="flex items-center gap-1.5 sm:gap-2 justify-start">
                          {otpDigits.map((digit, idx) => (
                            <input
                              key={idx}
                              ref={(el) => {
                                otpInputRefs.current[idx] = el;
                              }}
                              type="text"
                              inputMode="numeric"
                              pattern="[0-9]*"
                              maxLength={1}
                              value={digit}
                              onChange={(e) => handleDigitChange(idx, e.target.value)}
                              onKeyDown={(e) => handleDigitKeyDown(idx, e)}
                              onPaste={handleDigitPaste}
                              onFocus={(e) => e.target.select()}
                              className={`w-9 h-11 sm:w-11 sm:h-12 text-center text-lg font-mono font-black rounded-xl border transition-all ${
                                digit
                                  ? 'border-amber-500 bg-amber-50/70 text-navy-950 shadow-sm ring-1 ring-amber-500/30'
                                  : 'border-slate-300 bg-white text-navy-950 hover:border-amber-400 focus:border-amber-500'
                              } focus:outline-none focus:ring-2 focus:ring-amber-500/30`}
                            />
                          ))}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleVerifyOtp()}
                          disabled={isVerifyingOtp || otpDigits.join('').length !== 6}
                          className="px-5 py-2.5 bg-navy-900 hover:bg-navy-950 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer h-11 sm:h-12 shrink-0"
                        >
                          {isVerifyingOtp ? (
                            <>
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              <span>Verifying...</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Verify Code</span>
                            </>
                          )}
                        </button>
                      </div>

                      {otpError && (
                        <p className="text-xs text-red-600 font-medium flex items-center gap-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{otpError}</span>
                        </p>
                      )}

                      {otpSuccessMsg && (
                        <p className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-emerald-600" />
                          <span>{otpSuccessMsg}</span>
                        </p>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-medium">Email verified successfully. You may now complete your payment.</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mock Stripe Payment Details Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Stripe Demo Card Details
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">DEMO MODE</span>
          </div>

          {/* Cardholder Name */}
          <FormInput
            label="Cardholder Name"
            type="text"
            placeholder="e.g. Dr. Alistair Vance"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />

          {/* Card Number */}
          <FormInput
            label="Card Number"
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            icon={CreditCard}
          />

          {/* Expiry & CVC Row */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Expiry Date"
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={handleExpiryChange}
              maxLength={5}
            />

            <FormInput
              label="CVC / CVV"
              type="text"
              placeholder="123"
              value={cvc}
              onChange={handleCvcChange}
              maxLength={4}
            />
          </div>
        </div>

        {/* Submit Button ("Pay £999") */}
        <div className="pt-1.5 space-y-2">
          <PrimaryButton type="submit" disabled={isSubmitting || !isEmailVerified}>
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Processing Payment & Enrolling...</span>
              </span>
            ) : !isEmailVerified ? (
              <span>Verify Email with OTP to Pay</span>
            ) : (
              <span>Pay £999 & Complete Registration</span>
            )}
          </PrimaryButton>

          <p className="text-[10px] text-slate-400 text-center leading-tight flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant account activation. Login credentials dispatched upon payment completion.</span>
          </p>
        </div>
      </form>

      {/* SUCCESS POPUP MODAL (Rendered instantly when paymentStatus is 'success') */}
      {paymentData.paymentStatus === 'success' && (
        <PaymentSuccessModal
          email={paymentData.confirmedEmail || registrationData.email || 'student@virtualautopsy.edu'}
          transactionId={paymentData.transactionId}
          amount={paymentData.amount}
          courseName="Post-Mortem Computed Tomography (PMCT) Training"
          temporaryPassword={demoCredential?.temporaryPassword}
        />
      )}
    </div>
  );
};
