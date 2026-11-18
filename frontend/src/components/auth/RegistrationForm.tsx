import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegistrationFlow, type SelectedCourseInfo } from '../../context/RegistrationFlowContext';
import { useCourse } from '../../context/CourseContext';
import { StepIndicator } from './StepIndicator';
import { FormInput } from '../common/FormInput';
import { SelectInput } from '../common/SelectInput';
import { PhoneInput } from '../common/PhoneInput';
import { FileUpload, MAX_FILE_SIZE, MAX_FILE_SIZE_ERROR } from '../common/FileUpload';
import { Checkbox } from '../common/Checkbox';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import { validateMobileNumber, getCountryIso, ALL_COUNTRIES } from '../../utils/phoneValidation';
import { api, sanitizeErrorMessage } from '../../lib/api';
import { AlertCircle, BookOpen, Info, Loader2, ArrowLeft } from 'lucide-react';
import type { RegistrationFormData, FormErrors } from '../../types/auth';
import type { CountryCode } from 'libphonenumber-js/max';

const COUNTRY_OPTIONS = ALL_COUNTRIES.map((c) => ({
  value: c.iso,
  label: c.label,
}));

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
  const {
    step,
    setStep,
    registrationData,
    saveStep1AndContinue,
    saveStep2AndContinue,
    selectedCourses,
    setSelectedCourses,
  } = useRegistrationFlow();
  const { publicCourses } = useCourse();

  const [formData, setFormData] = useState<RegistrationFormData>(registrationData);
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCheckingEmail, setIsCheckingEmail] = useState(false);
  const [isDuplicateAccount, setIsDuplicateAccount] = useState(false);
  const [accountError, setAccountError] = useState<string | null>(null);

  const [availableCourses, setAvailableCourses] = useState<SelectedCourseInfo[]>([]);
  const [isLoadingCourses, setIsLoadingCourses] = useState(false);

  // Sync state if context registrationData updates
  useEffect(() => {
    setFormData(registrationData);
  }, [registrationData]);

  // Fetch published courses dynamically from backend API
  useEffect(() => {
    let isMounted = true;
    setIsLoadingCourses(true);

    api.get('/courses/public')
      .then((res) => {
        if (!isMounted) return;
        const rawList = Array.isArray(res.data)
          ? res.data
          : Array.isArray(res.data?.data)
          ? res.data.data
          : [];

        const published: SelectedCourseInfo[] = rawList
          .filter((c: any) => !c.status || c.status.toLowerCase() === 'published')
          .map((c: any) => ({
            id: c.id,
            title: c.title || c.name || 'Virtual Autopsy Training',
            fee: typeof c.fee === 'number' ? c.fee : Number(c.fee) || 499,
            currency: c.currency || 'GBP',
          }));

        if (published.length > 0) {
          setAvailableCourses(published);
          const searchParams = new URLSearchParams(window.location.search);
          const urlCourseId = searchParams.get('courseId');
          if (urlCourseId && (!selectedCourses || selectedCourses.length === 0)) {
            const match = published.find((c) => c.id === urlCourseId);
            if (match) {
              setSelectedCourses([match]);
            }
          }
        } else if (publicCourses.length > 0) {
          const fallback = publicCourses
            .filter((c) => c.status === 'published')
            .map((c) => ({
              id: c.id,
              title: c.title || c.name,
              fee: Number(c.fee) || 499,
              currency: c.currency || 'GBP',
            }));
          setAvailableCourses(fallback);
        }
      })
      .catch((err) => {
        console.warn('Failed to load courses from API, checking CourseContext:', err);
        if (isMounted && publicCourses.length > 0) {
          const fallback = publicCourses
            .filter((c) => c.status === 'published')
            .map((c) => ({
              id: c.id,
              title: c.title || c.name,
              fee: Number(c.fee) || 499,
              currency: c.currency || 'GBP',
            }));
          setAvailableCourses(fallback);
        }
      })
      .finally(() => {
        if (isMounted) setIsLoadingCourses(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleToggleCourse = (course: SelectedCourseInfo) => {
    const isSelected = selectedCourses.some((c) => c.id === course.id);
    let next: SelectedCourseInfo[];
    if (isSelected) {
      next = selectedCourses.filter((c) => c.id !== course.id);
    } else {
      next = [...selectedCourses, course];
    }
    setSelectedCourses(next);
    if (next.length > 0) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.courses;
        return updated;
      });
    }
  };

  const formatPrice = (amount: number, currency: string = 'GBP') => {
    const sym = currency === 'USD' ? '$' : currency === 'EUR' ? '€' : '£';
    return `${sym}${Number(amount).toFixed(2)}`;
  };

  const totalSelectedAmount = selectedCourses.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
  const primaryCurrency = selectedCourses[0]?.currency || availableCourses[0]?.currency || 'GBP';

  // Step 1 Validation: Personal Details & Qualification
  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required.';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email Address is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    // Country selection is mandatory
    if (!formData.country?.trim() && !formData.countryIso?.trim()) {
      newErrors.country = 'Please select your country.';
    }

    // Registration Number is mandatory
    if (!formData.regNumber?.trim()) {
      newErrors.regNumber = 'Registration Number is required.';
    }

    // Mobile number validation
    const currentIso = (formData.countryIso as CountryCode) || getCountryIso(formData.countryCode, formData.countryIso);
    if (formData.phoneNumber.trim()) {
      const phoneValidation = validateMobileNumber(formData.phoneNumber, currentIso, formData.countryCode, formData.country);
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

    // Default organization for backend compatibility
    if (!formData.organization?.trim()) {
      formData.organization = 'Medical Institution';
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

  const handleStep1Submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccountError(null);
    setIsDuplicateAccount(false);

    if (!validateStep1()) {
      return;
    }

    setIsCheckingEmail(true);

    try {
      // Pre-validate that email is not already registered
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

      // Email is available: Save Step 1 registration details and advance to Step 2 (Course Selection)
      saveStep1AndContinue(formData);
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
        const errorMsg = sanitizeErrorMessage(
          err.message,
          'Unable to continue at the moment. Please check your internet connection and try again.'
        );
        setAccountError(errorMsg);
      }
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourses || selectedCourses.length === 0) {
      setErrors({ courses: 'Please select at least one course to continue.' });
      return;
    }

    saveStep2AndContinue(selectedCourses);
    const searchParams = new URLSearchParams(window.location.search);
    const courseId = searchParams.get('courseId');
    navigate(courseId ? `/payment?courseId=${courseId}` : '/payment');
  };

  const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedIso = e.target.value as CountryCode;
    const countryObj = ALL_COUNTRIES.find((c) => c.iso === selectedIso);
    const countryName = countryObj ? countryObj.name : selectedIso;
    const callingCode = countryObj ? countryObj.code : '+44';

    setFormData((prev) => ({
      ...prev,
      country: countryName,
      countryIso: selectedIso,
      countryCode: callingCode,
    }));

    setErrors((prev) => {
      const updated = { ...prev };
      delete updated.country;
      return updated;
    });

    if (formData.phoneNumber.trim()) {
      const validation = validateMobileNumber(formData.phoneNumber, selectedIso, callingCode, countryName);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: validation.error || `Please enter a valid mobile number for ${countryName}.`,
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.phoneNumber;
          return updated;
        });
      }
    }
  };

  const handlePhoneNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setFormData((prev) => ({ ...prev, phoneNumber: val }));

    const currentIso = (formData.countryIso as CountryCode) || getCountryIso(formData.countryCode, formData.countryIso);
    if (!val.trim()) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated.phoneNumber;
        return updated;
      });
    } else if (errors.phoneNumber) {
      const validation = validateMobileNumber(val, currentIso, formData.countryCode, formData.country);
      if (validation.isValid) {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.phoneNumber;
          return updated;
        });
      }
    }
  };

  const handlePhoneBlur = () => {
    if (formData.phoneNumber.trim()) {
      const currentIso = (formData.countryIso as CountryCode) || getCountryIso(formData.countryCode, formData.countryIso);
      const validation = validateMobileNumber(formData.phoneNumber, currentIso, formData.countryCode, formData.country);
      if (!validation.isValid) {
        setErrors((prev) => ({
          ...prev,
          phoneNumber: validation.error || `Please enter a valid mobile number for ${formData.country || 'the selected country'}.`,
        }));
      } else {
        setErrors((prev) => {
          const updated = { ...prev };
          delete updated.phoneNumber;
          return updated;
        });
      }
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden">
      {/* Top Header Card Info */}
      <div className="shrink-0 pb-1.5 space-y-2">
        <div className="flex items-center justify-between gap-4">
          <StatusBadge>APPLICATION FORM</StatusBadge>
          {step === 2 && (
            <button
              type="button"
              onClick={() => setStep(1)}
              className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-navy-950 transition-colors cursor-pointer group"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
              <span>Back to Step 1</span>
            </button>
          )}
        </div>

        {/* 3-Step Indicator */}
        <StepIndicator currentStep={step === 3 ? 2 : (step as 1 | 2)} />

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            {step === 1 ? 'Personal Details' : 'Course Selection'}
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            {step === 1
              ? 'Please provide your details and qualification to begin your application.'
              : 'Choose the accredited training courses you wish to enroll in.'}
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

      {/* ========================================================================= */}
      {/* STEP 1: PERSONAL DETAILS FORM */}
      {/* ========================================================================= */}
      {step === 1 && (
        <form onSubmit={handleStep1Submit} className="flex-1 overflow-y-auto pr-1.5 space-y-3.5 custom-scrollbar my-1.5" noValidate>
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
              placeholder="name@example.com"
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

          {/* Row 2: Country & Registration Number */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <SelectInput
              label="Country"
              required
              placeholder="Select your country"
              options={COUNTRY_OPTIONS}
              value={formData.countryIso || ''}
              onChange={handleCountryChange}
              error={errors.country}
            />

            <FormInput
              label="Registration Number"
              required
              placeholder="Enter Your Medical Registration Number"
              className="placeholder:text-[10.5px] sm:placeholder:text-[11px] placeholder:tracking-tight"
              value={formData.regNumber || ''}
              onChange={(e) => {
                setFormData({ ...formData, regNumber: e.target.value });
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.regNumber;
                  return updated;
                });
              }}
              error={errors.regNumber}
            />
          </div>

          {/* Row 3: Mobile Number & Qualification */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <PhoneInput
              label="Mobile Number"
              required={false}
              countryCode={formData.countryCode}
              countryIso={formData.countryIso}
              countryName={formData.country}
              phoneNumber={formData.phoneNumber}
              onPhoneNumberChange={handlePhoneNumberChange}
              onBlur={handlePhoneBlur}
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
                setErrors((prev) => {
                  const updated = { ...prev };
                  delete updated.qualification;
                  return updated;
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

          {/* Row 4: CV Upload Component */}
          <FileUpload
            label="Upload your CV"
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

          {/* Mandatory Consent Checkbox */}
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

          {/* Step 1 Submit Button: "Continue to Course Selection" */}
          <div className="pt-2">
            <PrimaryButton type="submit" isLoading={isCheckingEmail}>
              Continue to Course Selection
            </PrimaryButton>
          </div>
        </form>
      )}

      {/* ========================================================================= */}
      {/* STEP 2: COURSE SELECTION FORM */}
      {/* ========================================================================= */}
      {step === 2 && (
        <form onSubmit={handleStep2Submit} className="flex-1 overflow-y-auto pr-1.5 space-y-4 custom-scrollbar my-1.5" noValidate>
          {/* Header row with course counter */}
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5 select-none">
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Available Courses</span>
              <span className="text-amber-600 font-bold">*</span>
            </label>
            <span className="text-[11px] text-slate-400 font-normal">
              (Choose one or more courses)
            </span>
          </div>

          {/* Bordered Course Selection Container */}
          <div
            className={`border rounded-xl bg-white p-3 space-y-2.5 transition-all ${
              errors.courses
                ? 'border-red-400 ring-2 ring-red-100 bg-red-50/20'
                : 'border-slate-200/90 shadow-sm'
            }`}
          >
            {isLoadingCourses && availableCourses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 flex flex-col items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-amber-600" />
                <span>Loading available accredited courses...</span>
              </div>
            ) : availableCourses.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No courses currently available. Please check back soon.
              </div>
            ) : (
              availableCourses.map((course) => {
                const isChecked = selectedCourses.some((c) => c.id === course.id);
                return (
                  <div
                    key={course.id}
                    onClick={() => handleToggleCourse(course)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all border ${
                      isChecked
                        ? 'bg-amber-50/70 border-amber-300/90 shadow-xs'
                        : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-3">
                      <input
                        type="checkbox"
                        id={`course-${course.id}`}
                        checked={isChecked}
                        onChange={() => {}} // Controlled by container onClick
                        className="w-4 h-4 rounded text-amber-500 border-slate-300 focus:ring-amber-500/30 focus:ring-offset-0 cursor-pointer accent-amber-500 shrink-0"
                      />
                      <span className="text-xs sm:text-sm font-semibold text-slate-900 truncate select-none">
                        {course.title}
                      </span>
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 font-mono shrink-0 select-none">
                      {formatPrice(course.fee, course.currency)}
                    </span>
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Information Callout with Selected Count & Total */}
          <div className="p-3 bg-amber-50/60 border border-amber-200/90 rounded-xl space-y-2">
            <div className="flex items-center justify-between gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2 min-w-0">
                <Info className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="leading-snug text-[11px] sm:text-xs">
                  Total amount will be updated based on your selected courses.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-amber-200/70 text-xs">
              <span className="font-semibold text-slate-700">
                {selectedCourses.length} {selectedCourses.length === 1 ? 'course' : 'courses'} selected
              </span>
              <span className="font-extrabold text-navy-950 font-mono text-sm sm:text-base">
                Total: {formatPrice(totalSelectedAmount, primaryCurrency)}
              </span>
            </div>
          </div>

          {/* Validation Error Message */}
          {errors.courses && (
            <p className="text-xs text-red-600 font-medium flex items-center gap-1.5 pt-0.5 animate-fadeIn">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{errors.courses}</span>
            </p>
          )}

          {/* Step 2 Action Buttons: Back & Continue to Payment */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="px-5 h-12 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </button>

            <PrimaryButton type="submit" className="flex-1">
              Continue to Payment
            </PrimaryButton>
          </div>
        </form>
      )}

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
