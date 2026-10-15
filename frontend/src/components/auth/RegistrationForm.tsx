import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';
import { StepIndicator } from './StepIndicator';
import { FormInput } from '../common/FormInput';
import { SelectInput } from '../common/SelectInput';
import { PhoneInput } from '../common/PhoneInput';
import { FileUpload, MAX_FILE_SIZE, MAX_FILE_SIZE_ERROR } from '../common/FileUpload';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import { validateMobileNumber, getCountryIso } from '../../utils/phoneValidation';
import { api } from '../../lib/api';
import { AlertCircle } from 'lucide-react';
import type { RegistrationFormData, FormErrors } from '../../types/auth';

const QUALIFICATION_OPTIONS = [
  { value: 'Medical Doctors', label: 'Medical Doctors' },
  { value: 'Forensic Medicine Faculty', label: 'Forensic Medicine Faculty' },
  { value: 'Forensic Medicine Residents', label: 'Forensic Medicine Residents' },
  { value: 'Forensic Pathologists', label: 'Forensic Pathologists' },
  { value: 'Radiologists', label: 'Radiologists' },
  { value: 'Radiology Residents', label: 'Radiology Residents' },
  { value: 'Radiographers', label: 'Radiographers' },
  { value: 'Law Enforcement', label: 'Law Enforcement' },
  { value: 'Others', label: 'Others' },
];

interface RegistrationFormProps {
  onFlipToLogin?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onFlipToLogin }) => {
  const navigate = useNavigate();
  const { registrationData, saveStep1AndContinue } = useRegistrationFlow();

  const [formData, setFormData] = useState<RegistrationFormData>(registrationData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isDuplicateAccount, setIsDuplicateAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  // Sync state if context registrationData updates
  useEffect(() => {
    setFormData(registrationData);
  }, [registrationData]);

  // Step 1 Validation Order:
  // 1. Required registration fields
  // 2. Email format
  // 3. Optional country-specific phone number validation (only if provided)
  // 4. CV/file upload requirements
  // 5. Privacy consent
  const validate = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Phone number is optional per requirements. Only validate if user typed a number.
    const currentIso = getCountryIso(formData.countryCode, formData.countryIso);
    if (formData.phoneNumber.trim()) {
      const phoneValidation = validateMobileNumber(formData.phoneNumber, currentIso, formData.countryCode);
      if (!phoneValidation.isValid) {
        newErrors.phoneNumber = phoneValidation.error || 'Please enter a valid mobile number for the selected country.';
      }
    }

    if (!formData.qualification) {
      newErrors.qualification = 'Please select your qualification.';
    }

    if (formData.qualification === 'Others' && !formData.qualificationOther?.trim()) {
      newErrors.qualificationOther = 'Please specify your profession or background.';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization / Institution is required.';
    }

    if (!formData.cvFile) {
      newErrors.cvFile = 'CV or Proof of Registration PDF is required.';
    } else if (formData.cvFile.size > MAX_FILE_SIZE) {
      newErrors.cvFile = MAX_FILE_SIZE_ERROR;
    }

    if (!formData.consent) {
      newErrors.consent = 'Please confirm that you agree to the Privacy Policy and data processing terms before continuing.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setIsDuplicateAccount(false);

    if (!validate()) {
      return;
    }

    setIsCheckingEmail(true);

    try {
      // Step 1: Pre-validate that email is not already registered
      const res = await api.post('/auth/check-email', { email: formData.email.trim() });
      if (res.data?.exists) {
        const errorMsg = 'An account with this email address already exists. Please sign in instead.';
        setIsDuplicateAccount(true);
        setAccountError(errorMsg);
        setErrors((prev) => ({
          ...prev,
          email: errorMsg,
        }));
        return;
      }

      // Email is available: Save Step 1 registration details and proceed to Step 2 (/payment)
      saveStep1AndContinue(formData);
      navigate('/payment');
    } catch (err: any) {
      if (
        err.status === 409 ||
        err.data?.errors?.exists ||
        err.data?.data?.exists ||
        err.message?.toLowerCase().includes('already exists')
      ) {
        const errorMsg = 'An account with this email address already exists. Please sign in instead.';
        setIsDuplicateAccount(true);
        setAccountError(errorMsg);
        setErrors((prev) => ({
          ...prev,
          email: errorMsg,
        }));
      } else {
        setIsDuplicateAccount(false);
        const errorMsg =
          err.message && err.message !== 'Failed to fetch'
            ? err.message
            : 'Unable to connect to the server. Please check your internet connection or verify the backend service is available.';
        setAccountError(errorMsg);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden">
      {/* Top Header Card Info */}
      <div className="shrink-0 pb-1.5 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <StatusBadge>APPLICATION FORM</StatusBadge>
        </div>

        {/* Step 1 Indicator */}
        <StepIndicator currentStep={1} />

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Registration & Qualification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Please provide your details and qualification to begin your application.
          </p>
        </div>
      </div>

      {/* Account Error Alert Banner */}
      {accountError && (
        <div className="mx-0 my-1 p-3 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-800 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{accountError} </span>
            {isDuplicateAccount && (
              onFlipToLogin ? (
                <button
                  type="button"
                  onClick={onFlipToLogin}
                  className="font-bold text-amber-600 underline hover:text-amber-700 ml-1 cursor-pointer"
                >
                  Please sign in instead.
                </button>
              ) : (
                <Link
                  to="/login"
                  className="font-bold text-amber-600 underline hover:text-amber-700 ml-1 cursor-pointer"
                >
                  Please sign in instead.
                </Link>
              )
            )}
          </div>
        </div>
      )}

      {/* Internal Scrollable Form Area */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto pr-1.5 space-y-3.5 custom-scrollbar my-1.5" noValidate>
        {/* Row 1: Full Name & Email */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <FormInput
            label="Full Name"
            required
            placeholder="e.g. Dr. Alistair Vance"
            value={formData.fullName}
            onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
            error={errors.fullName}
          />

          <FormInput
            label="Email Address"
            type="email"
            required
            placeholder="abc@mail.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              setAccountError(null);
              setIsDuplicateAccount(false);
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.email;
                return updated;
              });
            }}
            error={errors.email}
          />
        </div>

        {/* Row 2: Phone Number & Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <PhoneInput
            label="Phone Number"
            required={false}
            countryCode={formData.countryCode}
            countryIso={formData.countryIso}
            phoneNumber={formData.phoneNumber}
            onCountryCodeChange={(e) => {
              const code = e.target.value;
              const iso = (e.target as any).dataset?.iso || getCountryIso(code);
              setFormData((prev) => ({
                ...prev,
                countryCode: code,
                countryIso: iso,
              }));

              // Dynamic country-specific re-validation only if user entered a phone number
              if (formData.phoneNumber.trim()) {
                const validation = validateMobileNumber(formData.phoneNumber, iso, code);
                if (!validation.isValid) {
                  setErrors((prev) => ({
                    ...prev,
                    phoneNumber: validation.error || 'Please enter a valid mobile number for the selected country.',
                  }));
                } else {
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.phoneNumber;
                    return updated;
                  });
                }
              } else {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.phoneNumber;
                  return updated;
                });
              }
            }}
            onPhoneNumberChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, phoneNumber: val }));

              // Real-time error dismissal when user clears or types a valid number
              const currentIso = getCountryIso(formData.countryCode, formData.countryIso);
              if (!val.trim()) {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.phoneNumber;
                  return updated;
                });
              } else if (errors.phoneNumber) {
                const validation = validateMobileNumber(val, currentIso, formData.countryCode);
                if (validation.isValid) {
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.phoneNumber;
                    return updated;
                  });
                }
              }
            }}
            onBlur={() => {
              if (formData.phoneNumber.trim()) {
                const currentIso = getCountryIso(formData.countryCode, formData.countryIso);
                const validation = validateMobileNumber(formData.phoneNumber, currentIso, formData.countryCode);
                if (!validation.isValid) {
                  setErrors((prev) => ({
                    ...prev,
                    phoneNumber: validation.error || 'Please enter a valid mobile number for the selected country.',
                  }));
                } else {
                  setErrors((prev) => {
                    const updated = { ...prev };
                    delete updated.phoneNumber;
                    return updated;
                  });
                }
              } else {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.phoneNumber;
                  return updated;
                });
              }
            }}
            error={errors.phoneNumber}
          />

          <SelectInput
            label="Qualification"
            required
            placeholder="Select your qualification"
            options={QUALIFICATION_OPTIONS}
            value={formData.qualification}
            onChange={(e) => {
              const val = e.target.value;
              setFormData({
                ...formData,
                qualification: val,
                qualificationOther: val === 'Others' ? formData.qualificationOther : '',
              });
            }}
            error={errors.qualification}
          />
        </div>

        {/* Conditional "Please specify" field when Qualification === "Others" */}
        {formData.qualification === 'Others' && (
          <FormInput
            label="Please specify"
            required
            placeholder="Enter your profession/background"
            value={formData.qualificationOther}
            onChange={(e) => setFormData({ ...formData, qualificationOther: e.target.value })}
            error={errors.qualificationOther}
          />
        )}

        {/* Row 3: Organization */}
        <FormInput
          label="Organization"
          required
          placeholder="e.g. Royal Forensic Medical Institute"
          value={formData.organization}
          onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
          error={errors.organization}
        />

        {/* Row 4: CV Upload Component */}
        <FileUpload
          label="CV / Resume"
          required
          selectedFile={formData.cvFile}
          onFileSelect={(file) => {
            if (file && file.size > MAX_FILE_SIZE) {
              setFormData((prev) => ({ ...prev, cvFile: null }));
              setErrors((prev) => ({
                ...prev,
                cvFile: MAX_FILE_SIZE_ERROR,
              }));
              return;
            }
            setFormData((prev) => ({ ...prev, cvFile: file }));
            if (file) {
              setErrors((prev) => {
                const updated = { ...prev };
                delete updated.cvFile;
                return updated;
              });
            }
          }}
          error={errors.cvFile}
        />

        {/* Mandatory Consent Checkbox (Essential Course Admission & Data Processing) */}
        <div className="pt-0.5">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onChange={(e) => {
              setFormData({ ...formData, consent: e.target.checked });
              if (e.target.checked) {
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.consent;
                  return updated;
                });
              }
            }}
            error={errors.consent}
            label={
              <span>
                I agree to the{' '}
                <Link
                  to="/register/privacy-policy"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-600 font-bold hover:underline cursor-pointer focus:outline-none"
                >
                  Privacy Policy
                </Link>{' '}
                and consent to the processing of my personal, contact, and qualification information for course admission, payment processing, training access, and official certification. <span className="text-red-500 font-bold">*</span>
              </span>
            }
          />
        </div>

        {/* Optional UK Data Compliance Checkbox (Academic Updates & Data Sharing) */}
        <div className="pt-1.5">
          <Checkbox
            id="marketingConsent"
            checked={formData.marketingConsent || false}
            onChange={(e) => setFormData({ ...formData, marketingConsent: e.target.checked })}
            label={
              <span className="text-slate-600 text-[11px] leading-relaxed">
                I agree to receive optional academic updates and educational newsletters, and consent to Virtual Autopsy Global processing my personal data for these communications.
              </span>
            }
          />
        </div>

        {/* Primary Button: "Continue to Payment" */}
        <div className="pt-1.5 space-y-1.5">
          <PrimaryButton type="submit" isLoading={isCheckingEmail}>
            Continue to Payment
          </PrimaryButton>
        </div>
      </form>

      {/* Bottom Footer Flip Link */}
      <div className="shrink-0 pt-2.5 border-t border-slate-100 text-center text-xs">
        <span className="text-slate-500">Already have an account? </span>
        {onFlipToLogin ? (
          <button
            type="button"
            onClick={onFlipToLogin}
            className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors inline-flex items-center gap-1 cursor-pointer"
          >
            <span>Sign In</span>
            <span>→</span>
          </button>
        ) : (
          <Link
            to="/login"
            className="font-bold text-amber-600 hover:text-amber-700 hover:underline transition-colors inline-flex items-center gap-1"
          >
            <span>Sign In</span>
            <span>→</span>
          </Link>
        )}
      </div>
    </div>
  );
};
