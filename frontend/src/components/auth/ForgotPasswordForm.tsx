import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { PasswordInput } from '../common/PasswordInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import type { FormErrors } from '../../types/auth';
import { Mail, KeyRound, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();

  // Wizard Steps: 1 = Email Input, 2 = OTP Verification, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI / Action State
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);

  // Resend OTP Cooldown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 2 && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    } else if (resendCooldown === 0) {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Handle OTP digit input
  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) value = value[value.length - 1]; // Single digit only
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input field
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email.trim()) {
      setErrors({ email: 'Please enter your registered email address.' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrors({ email: 'Please enter a valid email address.' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
      setResendCooldown(60);
      setCanResend(false);
      setBannerMessage(`Verification code sent to ${email}`);
    }, 1000);
  };

  // Step 2: Resend OTP
  const handleResendOtp = () => {
    if (!canResend) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setResendCooldown(60);
      setCanResend(false);
      setBannerMessage(`A new OTP has been sent to ${email}`);
    }, 1000);
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(3);
      setBannerMessage(null);
    }, 1000);
  };

  // Step 3: Reset Password
  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    if (!newPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(4); // Success state

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    }, 1200);
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden">
      
      {/* STEP 1: Request OTP / Enter Email */}
      {step === 1 && (
        <div className="my-auto space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge>ACCOUNT RECOVERY</StatusBadge>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Step 1 of 3
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Forgot Password?
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Enter your registered email address below. We will send a 6-digit OTP code to reset your password.
            </p>
          </div>

          <form onSubmit={handleSendOtp} className="space-y-4" noValidate>
            <FormInput
              label="Institutional / Professional Email"
              type="email"
              required
              placeholder="Enter your registered email"
              icon={Mail}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />

            <div className="pt-2">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Send Verification Code
              </PrimaryButton>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 text-center text-xs">
            <Link
              to="/login"
              className="font-bold text-slate-600 hover:text-navy-950 transition-colors inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </div>
      )}

      {/* STEP 2: Verify 6-Digit OTP Code */}
      {step === 2 && (
        <div className="my-auto space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge>OTP VERIFICATION</StatusBadge>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Step 2 of 3
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Verify Security Code
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              We have sent a 6-digit code to <span className="font-semibold text-slate-800">{email}</span>.
            </p>
          </div>

          {bannerMessage && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2.5 text-xs text-amber-800 font-medium">
              <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{bannerMessage}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Enter 6-Digit OTP *
              </label>
              <div className="flex items-center justify-between gap-2">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    id={`otp-input-${idx}`}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-12 text-center text-lg font-bold text-navy-950 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/40 focus:border-amber-500 focus:bg-white transition-all font-mono"
                  />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-red-500 font-medium mt-1.5">{errors.otp}</p>}
            </div>

            {/* Resend OTP Timer Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn't receive code?</span>
              {canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="font-bold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP</span>
                </button>
              ) : (
                <span className="font-mono text-slate-400">
                  Resend in <strong className="text-navy-950 font-bold">{resendCooldown}s</strong>
                </span>
              )}
            </div>

            <div className="pt-2">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Verify Code & Continue
              </PrimaryButton>
            </div>
          </form>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="text-slate-500 hover:text-slate-700 transition-colors"
            >
              Change Email
            </button>
            <Link to="/login" className="font-bold text-slate-600 hover:text-navy-950 transition-colors">
              Cancel
            </Link>
          </div>
        </div>
      )}

      {/* STEP 3: Set New Password */}
      {step === 3 && (
        <div className="my-auto space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge>NEW PASSWORD</StatusBadge>
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Step 3 of 3
            </span>
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
              Create New Password
            </h2>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your identity has been verified. Create a new password for your account.
            </p>
          </div>

          <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
            <PasswordInput
              label="New Password"
              required
              placeholder="Min. 8 characters"
              showIcon
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={errors.newPassword}
            />

            <PasswordInput
              label="Confirm New Password"
              required
              placeholder="Repeat new password"
              showIcon
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={errors.confirmPassword}
            />

            <div className="pt-2">
              <PrimaryButton type="submit" isLoading={isLoading}>
                Reset Password & Proceed
              </PrimaryButton>
            </div>
          </form>
        </div>
      )}

      {/* STEP 4: Success State & Auto-Redirect */}
      {step === 4 && (
        <div className="my-auto text-center space-y-5">
          <div className="w-16 h-16 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-9 h-9 text-emerald-600" />
          </div>

          <div>
            <StatusBadge>PASSWORD CHANGED</StatusBadge>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 mt-3">
              Password Reset Successfully
            </h2>
            <p className="text-xs text-slate-600 mt-2 max-w-sm mx-auto leading-relaxed">
              Your password has been updated. You will be automatically redirected to the login page to sign in with your new credentials.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-500 max-w-xs mx-auto">
            Redirecting to sign in page...
          </div>

          <div className="pt-2">
            <Link to="/login">
              <PrimaryButton fullWidth={false}>
                Sign In Now
              </PrimaryButton>
            </Link>
          </div>
        </div>
      )}

    </div>
  );
};
