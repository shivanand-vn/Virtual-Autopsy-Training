import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormInput } from '../common/FormInput';
import { SelectInput } from '../common/SelectInput';
import { PhoneInput } from '../common/PhoneInput';
import { FileUpload } from '../common/FileUpload';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import type { RegistrationFormData, FormErrors } from '../../types/auth';
import { CheckCircle } from 'lucide-react';

const QUALIFICATIONS = [
  { value: 'mbbs', label: 'MBBS / MD (Medical Doctor)' },
  { value: 'frcr', label: 'FRCR (Fellow of Royal College of Radiologists)' },
  { value: 'forensic_pathologist', label: 'Certified Forensic Pathologist' },
  { value: 'radiographer', label: 'Senior CT/DICOM Radiographer' },
  { value: 'phd_forensic', label: 'Ph.D. Forensic Science / Pathology' },
  { value: 'other', label: 'Other Postgraduate Medical Specialty' },
];

const ROLES = [
  { value: 'forensic_pathologist', label: 'Forensic Pathologist / Medical Examiner' },
  { value: 'radiologist', label: 'Clinical / Forensic Radiologist' },
  { value: 'coroner_officer', label: 'Coroner / Medicolegal Investigator' },
  { value: 'mortuary_technician', label: 'Anatomical Pathology Technologist (APT)' },
  { value: 'academic_researcher', label: 'Academic Researcher / Faculty Member' },
  { value: 'postgrad_trainee', label: 'Postgraduate Medical Trainee / Resident' },
];

interface RegistrationFormProps {
  onFlipToLogin?: () => void;
}

export const RegistrationForm: React.FC<RegistrationFormProps> = ({ onFlipToLogin }) => {
  const [formData, setFormData] = useState<RegistrationFormData>({
    fullName: '',
    email: '',
    countryCode: '+44',
    phoneNumber: '',
    qualification: '',
    professionalRole: '',
    organization: '',
    cvFile: null,
    consent: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

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
      newErrors.qualification = 'Please select your medical qualification.';
    }

    if (!formData.professionalRole) {
      newErrors.professionalRole = 'Please select your professional role.';
    }

    if (!formData.organization.trim()) {
      newErrors.organization = 'Organization / Institution is required.';
    }

    if (!formData.cvFile) {
      newErrors.cvFile = 'CV or Proof of Registration PDF is required.';
    }

    if (!formData.consent) {
      newErrors.consent = 'You must consent to the privacy policy and terms.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setIsSubmitted(true);
      }, 1200);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between text-center">
        <div className="my-auto space-y-4">
          <div className="w-14 h-14 bg-emerald-100 border border-emerald-200 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div>
            <StatusBadge>APPLICATION RECEIVED</StatusBadge>
            <h2 className="text-2xl font-extrabold text-navy-950 mt-2">
              Application Submitted Successfully
            </h2>
            <p className="text-sm text-slate-600 mt-1.5 max-w-md mx-auto leading-relaxed">
              Thank you, <span className="font-bold text-navy-950">{formData.fullName}</span>. Your clinical credentials have been submitted for faculty and administrator review.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 max-w-md mx-auto text-left space-y-1">
            <p className="font-bold text-navy-950">Next Steps for Access:</p>
            <p>• Your profile will be reviewed by the administrator.</p>
            <p>• Upon approval, a <strong>temporary password</strong> for your initial login will be sent to <span className="font-mono font-semibold text-slate-800">{formData.email}</span>.</p>
            <p>• You can log in using your email and temporary password, and change it after signing in.</p>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100">
          {onFlipToLogin ? (
            <PrimaryButton fullWidth={false} onClick={onFlipToLogin}>
              Return to Sign In
            </PrimaryButton>
          ) : (
            <Link to="/login">
              <PrimaryButton fullWidth={false}>
                Return to Sign In
              </PrimaryButton>
            </Link>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden">
      {/* Top Header Card Info */}
      <div className="shrink-0 pb-1.5">
        <div className="flex items-center justify-between gap-4 mb-1.5">
          <StatusBadge>APPLICATION FORM</StatusBadge>
        </div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
          Registration & Eligibility
        </h2>
        <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
          Please provide your professional details to begin your application.
        </p>
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
            options={QUALIFICATIONS}
            value={formData.qualification}
            onChange={(e) => setFormData({ ...formData, qualification: e.target.value })}
            error={errors.qualification}
          />
        </div>

        {/* Row 3: Professional Role & Organization */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <SelectInput
            label="Professional Role"
            required
            placeholder="Select your professional role"
            options={ROLES}
            value={formData.professionalRole}
            onChange={(e) => setFormData({ ...formData, professionalRole: e.target.value })}
            error={errors.professionalRole}
          />

          <FormInput
            label="Organization"
            required
            placeholder="e.g. Royal Forensic Medical Institute"
            value={formData.organization}
            onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
            error={errors.organization}
          />
        </div>

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
                <a href="#privacy" className="text-amber-600 font-bold hover:underline">
                  Privacy Policy
                </a>{' '}
                and{' '}
                <a href="#terms" className="text-amber-600 font-bold hover:underline">
                  Terms & Conditions
                </a>{' '}
                and consent to my information being used for eligibility assessment and course enrollment.
              </span>
            }
          />
        </div>

        {/* Submit Primary CTA */}
        <div className="pt-1.5 space-y-1.5">
          <PrimaryButton type="submit" isLoading={isLoading}>
            Submit Application
          </PrimaryButton>
          <p className="text-[10px] text-slate-400 text-center leading-tight">
            Upon admin approval, a temporary password for initial access will be sent to your email address.
          </p>
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
