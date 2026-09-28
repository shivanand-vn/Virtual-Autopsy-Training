import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';
import { StepIndicator } from './StepIndicator';
import { FormInput } from '../common/FormInput';
import { SelectInput } from '../common/SelectInput';
import { PhoneInput } from '../common/PhoneInput';
import { FileUpload } from '../common/FileUpload';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
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

  // Sync state if context registrationData updates
  useEffect(() => {
    setFormData(registrationData);
  }, [registrationData]);

  // Step 1 Validation Order:
  // 1. Required registration fields
  // 2. Email format
  // 3. CV/file upload requirements
  // 4. Privacy consent
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

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone Number is required.';
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
    }

    if (!formData.consent) {
      newErrors.consent = 'Please confirm that you agree to the Privacy Policy and the use of your personal information before continuing.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      // Save Step 1 registration details into context and proceed to Step 2 (/payment)
      saveStep1AndContinue(formData);
      navigate('/payment');
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
            placeholder="a.vance@hospital.org"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
          />
        </div>

        {/* Row 2: Phone Number & Qualification */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <PhoneInput
            label="Phone Number"
            required
            countryCode={formData.countryCode}
            phoneNumber={formData.phoneNumber}
            onCountryCodeChange={(e) => setFormData({ ...formData, countryCode: e.target.value })}
            onPhoneNumberChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
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
          onFileSelect={(file) => setFormData({ ...formData, cvFile: file })}
          error={errors.cvFile}
        />

        {/* Consent Checkbox */}
        <div className="pt-0.5">
          <Checkbox
            id="consent"
            checked={formData.consent}
            onChange={(e) => setFormData({ ...formData, consent: e.target.checked })}
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
                and consent to the collection and use of my personal information for course registration, payment, training access, communication, and certification.
              </span>
            }
          />
        </div>

        {/* Primary Button: "Continue to Payment" */}
        <div className="pt-1.5 space-y-1.5">
          <PrimaryButton type="submit">
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
