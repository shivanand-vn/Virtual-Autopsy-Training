import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { PasswordInput } from '../common/PasswordInput';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import type { LoginFormData, FormErrors } from '../../types/auth';
import { Mail, AlertCircle } from 'lucide-react';

interface LoginFormProps {
  onFlipToRegister?: () => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onFlipToRegister }) => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Please enter your registered email address.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!formData.password) {
      newErrors.password = 'Please enter your password.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    if (validate()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        if (formData.email.includes('error')) {
          setLoginError('Invalid clinical credentials or unverified account. Please check your credentials.');
        } else {
          alert(`Welcome back! Frontend mock login successful for ${formData.email}`);
        }
      }, 1000);
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

        {/* Login Error Notification if triggered */}
        {loginError && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

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
          />

          <PasswordInput
            label="Password"
            required
            placeholder="Enter your password"
            showIcon
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            error={errors.password}
          />

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between pt-0.5">
            <Checkbox
              id="rememberMe"
              checked={formData.rememberMe}
              onChange={(e) => setFormData({ ...formData, rememberMe: e.target.checked })}
              label={<span className="text-xs font-semibold text-slate-700">Remember this workstation</span>}
            />

            <a
              href="#forgot-password"
              className="text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
            >
              Forgot Password?
            </a>
          </div>

          {/* Primary CTA */}
          <div className="pt-1.5">
            <PrimaryButton type="submit" isLoading={isLoading}>
              Sign In
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
