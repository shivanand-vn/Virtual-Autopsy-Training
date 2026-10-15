import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { PasswordInput } from '../common/PasswordInput';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import type { LoginFormData, FormErrors } from '../../types/auth';
import { Mail, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { sanitizeErrorMessage } from '../../lib/api';

interface LoginFormProps {
  onFlipToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onFlipToRegister }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedEmail = (location.state as any)?.email || '';
  const resetSuccess = Boolean((location.state as any)?.resetSuccess);
  const { login } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: passedEmail,
    password: '',
    rememberMe: false,
  });

  React.useEffect(() => {
    if (passedEmail) {
      setFormData((prev) => ({ ...prev, email: passedEmail }));
    }
  }, [passedEmail]);

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  // Live client-side lockout countdown state (only active after lock)
  const [lockoutExpiry, setLockoutExpiry] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('vat_login_lockout');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.until && parsed.until > Date.now()) {
          return parsed.until;
        } else {
          localStorage.removeItem('vat_login_lockout');
        }
      }
    } catch {
      // Ignore parse errors
    }
    return null;
  });

  const [secondsLeft, setSecondsLeft] = useState<number>(() => {
    if (lockoutExpiry && lockoutExpiry > Date.now()) {
      return Math.ceil((lockoutExpiry - Date.now()) / 1000);
    }
    return 0;
  });

  const isLocked = Boolean(lockoutExpiry && secondsLeft > 0);

  // Live countdown timer ticker (ticks every 1s only while locked)
  useEffect(() => {
    if (!lockoutExpiry) return;

    const tick = () => {
      const remaining = Math.ceil((lockoutExpiry - Date.now()) / 1000);
      if (remaining <= 0) {
        setSecondsLeft(0);
        setLockoutExpiry(null);
        localStorage.removeItem('vat_login_lockout');
        setLoginError(null);
      } else {
        setSecondsLeft(remaining);
      }
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [lockoutExpiry]);

  const formatCountdown = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) {
      return;
    }
    setLoginError(null);

    const cleanEmail = (formData.email || '').trim();
    const cleanPassword = (formData.password || '').trim();

    if (!cleanEmail) {
      setLoginError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      setLoginError('Please enter a valid email address.');
      return;
    }
    if (!cleanPassword) {
      setLoginError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const loggedUser = await login(cleanEmail, cleanPassword);
      // Clean up any lingering lockout records upon successful login
      localStorage.removeItem('vat_login_lockout');
      if (loggedUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      if (err.status === 429) {
        const sec = Number(err.retryAfter) || 900;
        const expiry = Date.now() + sec * 1000;
        localStorage.setItem('vat_login_lockout', JSON.stringify({ until: expiry }));
        setLockoutExpiry(expiry);
        setSecondsLeft(sec);
        setLoginError(err.message || 'Too many login attempts. Please try again after 15 minutes');
      } else {
        setLoginError(sanitizeErrorMessage(err.message, 'Invalid email or password. Please verify your credentials.'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden">
      <div className="my-auto space-y-5">
        {/* Top Pill Badge */}
        <div className="flex items-center justify-between">
          <StatusBadge>ACADEMY PORTAL LOGIN</StatusBadge>
        </div>

        {/* Title & Subtitle */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Welcome Back
          </h2>
          <p className="text-sm text-slate-500 mt-1 leading-relaxed">
            Sign in to continue to your Virtual Autopsy Global training portal.
          </p>
        </div>

        {/* Password Reset Success Notification */}
        {resetSuccess && !loginError && !isLocked && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>Password reset successfully! Please sign in with your new password.</span>
          </div>
        )}

        {/* Live Lockout Countdown Banner (Displayed AFTER LOCK ONLY) */}
        {isLocked ? (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 text-xs text-red-900 shadow-sm">
            <Clock className="w-5 h-5 text-red-600 shrink-0 mt-0.5 animate-pulse" />
            <div className="space-y-1.5 flex-1">
              <div className="font-bold text-red-950 text-sm">
                Too many login attempts
              </div>
              <p className="text-red-700 leading-relaxed">
                Login attempts temporarily restricted for security. Please try again after 15 minutes.
              </p>
              <div className="flex items-center gap-2 pt-0.5">
                <span className="text-slate-600 font-semibold text-[11px] uppercase tracking-wider">Try again in:</span>
                <span className="px-2.5 py-0.5 bg-red-600 text-white font-mono font-bold text-xs rounded-md shadow-sm">
                  {formatCountdown(secondsLeft)}
                </span>
                <span className="text-slate-500 text-[11px] font-medium">(live cooldown)</span>
              </div>
            </div>
          </div>
        ) : loginError ? (
          /* Normal Error Notification (before lock, e.g. Attempts 1-4) */
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        ) : null}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5" noValidate>
          <FormInput
            label="Institutional / Professional Email"
            type="email"
            required
            placeholder="Enter your email address"
            icon={Mail}
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            disabled={isLocked}
          />

          <PasswordInput
            label="Password"
            required
            placeholder="Enter your password"
            showIcon
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
            disabled={isLocked}
          />

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              label={<span className="text-xs font-semibold text-slate-700">Remember this workstation</span>}
              disabled={isLocked}
            />

            <Link
              to="/forgot-password"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Forgot Password?
            </Link>
          </div>

          {/* Primary CTA */}
          <div className="pt-1.5">
            <PrimaryButton 
              type="submit" 
              isLoading={isLoading}
              disabled={isLocked}
              showArrow={!isLocked}
            >
              {isLocked ? `Locked (${formatCountdown(secondsLeft)})` : 'Sign In'}
            </PrimaryButton>
          </div>
        </form>
      </div>

      {/* Don't have an account? Register */}
      <div className="shrink-0 pt-3 border-t border-slate-100 text-center text-xs">
        <span className="text-slate-500">Don't have an account? </span>
        {onFlipToRegister ? (
          <button
            type="button"
            onClick={onFlipToRegister}
            className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Register</span>
            <span>→</span>
          </button>
        ) : (
          <Link
            to="/register"
            className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors inline-flex items-center gap-1"
          >
            <span>Register</span>
            <span>→</span>
          </Link>
        )}
      </div>
    </div>
  );
};
