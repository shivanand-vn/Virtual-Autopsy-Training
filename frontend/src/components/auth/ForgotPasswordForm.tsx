import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { PasswordInput } from '../common/PasswordInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import type { FormErrors } from '../../types/auth';
import { Mail, KeyRound, CheckCircle2, ArrowLeft, RefreshCw, AlertCircle } from 'lucide-react';
import { api, sanitizeErrorMessage } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

export const ForgotPasswordForm: React.FC = () => {
  const navigate = useNavigate();
  const { setAuthOverlay } = useAuth();

  // Wizard Steps: 1 = Email Input, 2 = OTP Verification, 3 = New Password, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form State
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resetToken, setResetToken] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI / Action State
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [bannerMessage, setBannerMessage] = useState<string | null>(null);
  const [sendCount, setSendCount] = useState<number>(1);
  const [resendsRemaining, setResendsRemaining] = useState<number>(2);

  // Security guard: Ensure Step 3 (password reset) is NEVER accessible without a verified resetToken
  useEffect(() => {
    if (step === 3 && !resetToken) {
      setStep(1);
    }
  }, [step, resetToken]);

  // Resend OTP Cooldown Timer
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
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

  // Support pasting full 6-digit OTP code directly
  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim().replace(/[^0-9]/g, '');
    if (pastedData.length >= 6) {
      const newOtp = pastedData.slice(0, 6).split('');
      setOtp(newOtp);
      document.getElementById('otp-input-5')?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  // Step 1: Send OTP
  const handleSendOtp = async (e: React.FormEvent) => {
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

    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const res: any = await api.post('/auth/forgot-password', { email: cleanEmail });
      const currentSendCount = res?.data?.sendCount || 1;
      const currentRemaining = res?.data?.resendsRemaining !== undefined ? res?.data?.resendsRemaining : Math.max(0, 3 - currentSendCount);
      setSendCount(currentSendCount);
      setResendsRemaining(currentRemaining);
      setEmail(cleanEmail);
      setStep(2);
      setResendCooldown(60);
      setCanResend(false);
      setBannerMessage(res?.message || `Verification code sent to ${cleanEmail}`);
    } catch (err: any) {
      setErrors({ email: sanitizeErrorMessage(err.message, 'Unable to send verification code. Please check your connection and try again.') });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Resend OTP (Max 2 resends, same OTP sent)
  const handleResendOtp = async () => {
    if (!canResend || resendsRemaining <= 0) return;
    try {
      setIsLoading(true);
      setErrors({});
      const cleanEmail = email.trim().toLowerCase();
      const res: any = await api.post('/auth/forgot-password', { email: cleanEmail });
      const updatedSendCount = res?.data?.sendCount || (sendCount + 1);
      const updatedRemaining = res?.data?.resendsRemaining !== undefined ? res?.data?.resendsRemaining : Math.max(0, 3 - updatedSendCount);
      setSendCount(updatedSendCount);
      setResendsRemaining(updatedRemaining);
      setResendCooldown(60);
      setCanResend(false);
      setBannerMessage(`The same verification code has been resent to your email (Email ${updatedSendCount} of 3).`);
    } catch (err: any) {
      setErrors({ otp: sanitizeErrorMessage(err.message, 'Unable to resend code. Please try again.') });
      if (err?.message && (err.message.toLowerCase().includes('limit') || err.message.toLowerCase().includes('3 of 3'))) {
        setResendsRemaining(0);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const otpCode = otp.join('').trim();
    if (otpCode.length < 6) {
      setErrors({ otp: 'Please enter the complete 6-digit verification code.' });
      return;
    }

    // If OTP verification takes more time (>250ms), activate scan overlay
    const otpTimer = setTimeout(() => {
      setAuthOverlay({ show: true, mode: 'scanner', title: 'Verifying code...' });
    }, 250);

    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const res: any = await api.post('/auth/verify-otp', { email: cleanEmail, otp: otpCode });
      const token = res?.data?.resetToken || res?.resetToken;
      if (token) {
        setResetToken(token);
      }
      setStep(3);
      setBannerMessage(null);
    } catch (err: any) {
      setErrors({ otp: sanitizeErrorMessage(err.message, 'Invalid or expired code. Please try again.') });
      // Reset inputs so user can cleanly re-enter the code
      setOtp(['', '', '', '', '', '']);
      document.getElementById('otp-input-0')?.focus();
    } finally {
      clearTimeout(otpTimer);
      setAuthOverlay(null);
      setIsLoading(false);
    }
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    const cleanNewPassword = newPassword;
    const cleanConfirmPassword = confirmPassword;

    if (!cleanNewPassword) {
      newErrors.newPassword = 'New password is required.';
    } else if (cleanNewPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters long.';
    } else if (!/[A-Z]/.test(cleanNewPassword)) {
      newErrors.newPassword = 'Password must contain at least one uppercase letter.';
    } else if (!/[a-z]/.test(cleanNewPassword)) {
      newErrors.newPassword = 'Password must contain at least one lowercase letter.';
    } else if (!/[0-9]/.test(cleanNewPassword)) {
      newErrors.newPassword = 'Password must contain at least one digit.';
    } else if (!/[^A-Za-z0-9]/.test(cleanNewPassword)) {
      newErrors.newPassword = 'Password must contain at least one special character.';
    }

    if (!cleanConfirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password.';
    } else if (cleanNewPassword !== cleanConfirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const cleanEmail = email.trim().toLowerCase();
      const otpCode = otp.join('').trim();
      await api.post('/auth/reset-password', {
        email: cleanEmail,
        otp: otpCode,
        resetToken,
        newPassword: cleanNewPassword,
      });
      if (cleanEmail) {
        try {
          localStorage.removeItem(`vat_temp_pwd_${cleanEmail}`);
          sessionStorage.removeItem(`vat_temp_pwd_${cleanEmail}`);
        } catch (e) {
          console.error('Failed to clear temp password flag', e);
        }
      }
      setStep(4); // Success state

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { state: { email: cleanEmail, resetSuccess: true } });
      }, 3000);
    } catch (err: any) {
      setErrors({ newPassword: sanitizeErrorMessage(err.message, 'Unable to reset password. Please try again.') });
    } finally {
      setIsLoading(false);
    }
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

          {errors.otp && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 font-bold shadow-xs animate-in fade-in duration-200">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errors.otp}</span>
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-2">
                Enter 6-Digit OTP *
              </label>
              <div className="flex items-center justify-between gap-2" onPaste={handleOtpPaste}>
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
                    className={`w-11 h-12 text-center text-lg font-bold text-navy-950 bg-slate-50 border rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all font-mono ${
                      errors.otp
                        ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/40 bg-rose-50/20'
                        : 'border-slate-200 focus:border-amber-500 focus:ring-amber-500/40'
                    }`}
                  />
                ))}
              </div>
              {errors.otp && <p className="text-xs text-rose-600 font-semibold mt-1.5">{errors.otp}</p>}
            </div>

            {/* Resend OTP Timer Controls */}
            <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
              <span>Didn't receive code?</span>
              {resendsRemaining <= 0 ? (
                <span className="text-amber-800 font-semibold bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/80">
                  Resend limit reached (3 of 3 sent)
                </span>
              ) : canResend ? (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isLoading}
                  className="font-bold text-amber-600 hover:text-amber-700 transition-colors inline-flex items-center gap-1 cursor-pointer disabled:opacity-50"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP ({resendsRemaining} {resendsRemaining === 1 ? 'resend' : 'resends'} left)</span>
                </button>
              ) : (
                <span className="font-mono text-slate-500">
                  Resend in <strong className="text-navy-950 font-bold">{resendCooldown}s</strong> ({resendsRemaining} left)
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

            {/* Password Complexity Requirements Checklist */}
            <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-1.5 text-[11px]">
              <p className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                Password Requirements:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-slate-600">
                <div className={`flex items-center gap-1.5 ${newPassword.length >= 8 ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${newPassword.length >= 8 ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {newPassword.length >= 8 ? '✓' : '•'}
                  </span>
                  <span>Min. 8 characters</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[A-Z]/.test(newPassword) ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[A-Z]/.test(newPassword) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {/[A-Z]/.test(newPassword) ? '✓' : '•'}
                  </span>
                  <span>One uppercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[a-z]/.test(newPassword) ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[a-z]/.test(newPassword) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {/[a-z]/.test(newPassword) ? '✓' : '•'}
                  </span>
                  <span>One lowercase letter</span>
                </div>
                <div className={`flex items-center gap-1.5 ${/[0-9]/.test(newPassword) ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[0-9]/.test(newPassword) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {/[0-9]/.test(newPassword) ? '✓' : '•'}
                  </span>
                  <span>One digit (0-9)</span>
                </div>
                <div className={`flex items-center gap-1.5 sm:col-span-2 ${/[^A-Za-z0-9]/.test(newPassword) ? 'text-emerald-700 font-semibold' : 'text-slate-500'}`}>
                  <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold ${/[^A-Za-z0-9]/.test(newPassword) ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-500'}`}>
                    {/[^A-Za-z0-9]/.test(newPassword) ? '✓' : '•'}
                  </span>
                  <span>One special character (e.g. !@#$%^&*)</span>
                </div>
              </div>
            </div>

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
            <Link to="/login" state={{ email: email.trim().toLowerCase(), resetSuccess: true }}>
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
