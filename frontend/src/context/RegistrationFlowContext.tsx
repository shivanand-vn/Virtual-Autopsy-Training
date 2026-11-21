import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { RegistrationFormData } from '../types/auth';
import { api, sanitizeErrorMessage } from '../lib/api';

export interface CardData {
  cardholderName: string;
  cardNumber: string;
  expiryDate: string;
  cvc: string;
}

export interface PaymentData {
  confirmedEmail: string;
  cardData: CardData;
  paymentStatus: 'idle' | 'processing' | 'success' | 'failed';
  transactionId: string;
  amount: string;
  error: string | null;
}

export interface DemoCredential {
  email: string;
  temporaryPassword: string;
}

export interface SelectedCourseInfo {
  id: string;
  title: string;
  fee: number;
  currency?: string;
}

interface RegistrationFlowContextType {
  step: 1 | 2 | 3;
  setStep: (step: 1 | 2 | 3) => void;
  registrationData: RegistrationFormData;
  updateRegistrationData: (data: Partial<RegistrationFormData>) => void;
  paymentData: PaymentData;
  updatePaymentData: (data: Partial<PaymentData>) => void;
  selectedCourse: SelectedCourseInfo | null;
  setSelectedCourse: (course: SelectedCourseInfo | null) => void;
  selectedCourses: SelectedCourseInfo[];
  setSelectedCourses: (courses: SelectedCourseInfo[]) => void;
  demoCredential: DemoCredential | null;
  saveStep1AndContinue: (data: RegistrationFormData) => void;
  saveStep2AndContinue: (courses: SelectedCourseInfo[]) => void;
  processPayment: (confirmEmail?: string, cardData?: Partial<CardData>) => Promise<boolean>;
  resetFlow: () => void;
}

const initialRegistrationData: RegistrationFormData = {
  fullName: '',
  email: '',
  country: '',
  countryCode: '+44',
  countryIso: 'GB',
  regNumber: '',
  phoneNumber: '',
  qualification: '',
  qualificationOther: '',
  organization: '',
  cvFile: null,
  consent: false,
  marketingConsent: false,
};

export const normalizeCourseFee = (rawFee: any): number => {
  const parsed = Number(rawFee);
  if (!parsed || parsed === 499) {
    return 750;
  }
  return parsed;
};

const initialPaymentData: PaymentData = {
  confirmedEmail: '',
  cardData: {
    cardholderName: '',
    cardNumber: '4242 4242 4242 4242',
    expiryDate: '12/28',
    cvc: '123',
  },
  paymentStatus: 'idle',
  transactionId: '',
  amount: '£0.00',
  error: null,
};

const RegistrationFlowContext = createContext<RegistrationFlowContextType | undefined>(undefined);

const LOCAL_STORAGE_REG_KEY = 'virtual_autopsy_registration_email';
const SESSION_STORAGE_DRAFT_KEY = 'vat_registration_draft';
const SESSION_STORAGE_CV_KEY = 'vat_registration_cv_b64';
const SESSION_STORAGE_COURSE_KEY = 'vat_selected_course';
const SESSION_STORAGE_COURSES_KEY = 'vat_selected_courses';
const SESSION_STORAGE_STEP_KEY = 'vat_registration_step';

function dataUrlToFile(dataUrl: string, filename: string): File | null {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/pdf';
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  } catch (e) {
    console.error('Failed to reconstruct file from DataURL:', e);
    return null;
  }
}

export const RegistrationFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStepState] = useState<1 | 2 | 3>(() => {
    try {
      const savedStep = sessionStorage.getItem(SESSION_STORAGE_STEP_KEY);
      if (savedStep === '2' || savedStep === '3') {
        return Number(savedStep) as 2 | 3;
      }
    } catch (e) {
      console.error(e);
    }
    return 1;
  });

  const setStep = (newStep: 1 | 2 | 3) => {
    setStepState(newStep);
    try {
      sessionStorage.setItem(SESSION_STORAGE_STEP_KEY, String(newStep));
    } catch (e) {
      console.error(e);
    }
  };
  const [registrationData, setRegistrationData] = useState<RegistrationFormData>(() => {
    let base = { ...initialRegistrationData };
    try {
      const draftJson = sessionStorage.getItem(SESSION_STORAGE_DRAFT_KEY);
      if (draftJson) {
        const parsed = JSON.parse(draftJson);
        base = { ...base, ...parsed };
      }
      const cvJson = sessionStorage.getItem(SESSION_STORAGE_CV_KEY);
      if (cvJson) {
        const parsedCv = JSON.parse(cvJson);
        if (parsedCv?.dataUrl && parsedCv?.name) {
          const file = dataUrlToFile(parsedCv.dataUrl, parsedCv.name);
          if (file) base.cvFile = file;
        }
      }
      const savedEmail = localStorage.getItem(LOCAL_STORAGE_REG_KEY);
      if (savedEmail && !base.email) {
        base.email = savedEmail;
      }
    } catch (e) {
      console.error('Failed restoring registration draft:', e);
    }
    return base;
  });

  const [selectedCourses, setSelectedCoursesState] = useState<SelectedCourseInfo[]>(() => {
    try {
      const savedList = sessionStorage.getItem(SESSION_STORAGE_COURSES_KEY);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c) => ({
            ...c,
            fee: normalizeCourseFee(c.fee),
          }));
        }
      }
    } catch (e) {
      console.error('Failed restoring selected courses:', e);
    }
    return [];
  });

  const selectedCourse = selectedCourses[0] || null;

  const [paymentData, setPaymentData] = useState<PaymentData>(() => {
    try {
      const savedList = sessionStorage.getItem(SESSION_STORAGE_COURSES_KEY);
      if (savedList) {
        const parsed = JSON.parse(savedList);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const total = parsed.reduce((sum: number, c: any) => sum + (normalizeCourseFee(c.fee) || 0), 0);
          const symbol = parsed[0]?.currency === 'USD' ? '$' : parsed[0]?.currency === 'EUR' ? '€' : '£';
          return {
            ...initialPaymentData,
            amount: `${symbol}${total.toFixed(2)}`,
          };
        }
      }
    } catch {}
    return initialPaymentData;
  });
  const [demoCredential, setDemoCredential] = useState<DemoCredential | null>(null);

  const setSelectedCourses = (courses: SelectedCourseInfo[]) => {
    const normalized = courses.map((c) => ({
      ...c,
      fee: normalizeCourseFee(c.fee),
    }));
    setSelectedCoursesState(normalized);
    try {
      sessionStorage.setItem(SESSION_STORAGE_COURSES_KEY, JSON.stringify(normalized));
      if (normalized.length > 0) {
        sessionStorage.setItem(SESSION_STORAGE_COURSE_KEY, JSON.stringify(normalized[0]));
      } else {
        sessionStorage.removeItem(SESSION_STORAGE_COURSE_KEY);
      }
    } catch (e) {
      console.error(e);
    }
    const total = normalized.reduce((sum, c) => sum + (normalizeCourseFee(c.fee) || 0), 0);
    const sym = normalized[0]?.currency === 'USD' ? '$' : normalized[0]?.currency === 'EUR' ? '€' : '£';
    setPaymentData((prev) => ({
      ...prev,
      amount: `${sym}${total.toFixed(2)}`,
    }));
  };

  const setSelectedCourse = (course: SelectedCourseInfo | null) => {
    if (course) {
      setSelectedCourses([course]);
    } else {
      setSelectedCourses([]);
    }
  };

  const updateRegistrationData = (data: Partial<RegistrationFormData>) => {
    setRegistrationData((prev) => {
      const updated = { ...prev, ...data };
      if (updated.email) {
        try {
          localStorage.setItem(LOCAL_STORAGE_REG_KEY, updated.email.trim());
        } catch (e) {
          console.error(e);
        }
      }
      try {
        const { cvFile, ...textualFields } = updated;
        sessionStorage.setItem(SESSION_STORAGE_DRAFT_KEY, JSON.stringify(textualFields));
      } catch (e) {
        console.error(e);
      }
      return updated;
    });
  };

  const updatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData((prev) => ({ ...prev, ...data }));
  };

  const saveStep1AndContinue = (data: RegistrationFormData) => {
    setRegistrationData(data);
    try {
      if (data.email) {
        localStorage.setItem(LOCAL_STORAGE_REG_KEY, data.email.trim());
      }
      const { cvFile, ...textualFields } = data;
      sessionStorage.setItem(SESSION_STORAGE_DRAFT_KEY, JSON.stringify(textualFields));

      if (cvFile && cvFile.size <= 4.5 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            sessionStorage.setItem(
              SESSION_STORAGE_CV_KEY,
              JSON.stringify({ name: cvFile.name, dataUrl: reader.result })
            );
          } catch (e) {
            console.warn('Could not cache CV in sessionStorage (exceeds quota)', e);
          }
        };
        reader.readAsDataURL(cvFile);
      }
    } catch (e) {
      console.error(e);
    }
    setStep(2);
  };

  const saveStep2AndContinue = (courses: SelectedCourseInfo[]) => {
    setSelectedCourses(courses);
    setStep(3);
  };

  const processPayment = async (confirmEmail?: string, cardData?: Partial<CardData>): Promise<boolean> => {
    const regEmail = (registrationData.email || localStorage.getItem(LOCAL_STORAGE_REG_KEY) || '').trim();
    const enteredEmail = (confirmEmail || '').trim();

    if (regEmail && enteredEmail && regEmail.toLowerCase() !== enteredEmail.toLowerCase()) {
      setPaymentData((prev) => ({
        ...prev,
        error: 'Please use the same emailID used in registration',
        paymentStatus: 'failed',
      }));
      return false;
    }

    const finalEmail = enteredEmail || regEmail || 'doctor@virtualautopsy.edu';

    setPaymentData((prev) => ({
      ...prev,
      paymentStatus: 'processing',
      confirmedEmail: finalEmail,
      error: null,
    }));

    try {
      const formData = new FormData();
      formData.append('fullName', registrationData.fullName.trim() || 'Medical Candidate');
      formData.append('email', finalEmail);
      formData.append('country', registrationData.country || '');
      formData.append('countryIso', registrationData.countryIso || '');
      formData.append('regNumber', registrationData.regNumber || '');
      formData.append('countryCode', registrationData.countryCode || '+44');
      formData.append('phoneNumber', registrationData.phoneNumber || '');
      formData.append('qualification', registrationData.qualification || 'Medical Practitioner');
      formData.append('professionalRole', registrationData.professionalRole || 'Forensic Pathology Fellow');
      formData.append('organization', registrationData.organization || 'Medical Institution');
      formData.append('marketingConsent', String(registrationData.marketingConsent || false));
      if (selectedCourses.length > 0) {
        formData.append('courseIds', JSON.stringify(selectedCourses.map((c) => c.id)));
        formData.append('courseId', selectedCourses[0].id);
      } else if (selectedCourse?.id) {
        formData.append('courseId', selectedCourse.id);
      }
      const totalAmount = selectedCourses.reduce((sum, c) => sum + (Number(c.fee) || 0), 0);
      const sym = selectedCourses[0]?.currency === 'USD' ? '$' : selectedCourses[0]?.currency === 'EUR' ? '€' : '£';
      const formattedTotal = `${sym}${totalAmount.toFixed(2)}`;
      const allTitles = selectedCourses.map((c) => c.title).join(', ');

      formData.append('amount', paymentData.amount || formattedTotal || (selectedCourse ? `£${selectedCourse.fee.toFixed(2)}` : '£750.00'));
      formData.append('currency', selectedCourses[0]?.currency || selectedCourse?.currency || 'GBP');
      formData.append('tier', allTitles ? `${allTitles} (${paymentData.amount || formattedTotal})` : (selectedCourse?.title ? `${selectedCourse.title} Enrollment` : 'Virtual Autopsy Online Fellowship (£750)'));
      formData.append('cardholderName', cardData?.cardholderName || registrationData.fullName || 'Cardholder');
      formData.append('cardLast4', (cardData?.cardNumber || '4242').replace(/\s/g, '').slice(-4) || '4242');

      if (registrationData.cvFile) {
        formData.append('cvFile', registrationData.cvFile);
      }

      const response = await api.post('/payments/complete-registration', formData);
      const { credentials, payment } = response.data;

      if (credentials?.email) {
        try {
          localStorage.setItem(`vat_temp_pwd_${credentials.email.toLowerCase().trim()}`, 'true');
        } catch (e) {
          console.error('Failed to store temp password flag', e);
        }
      }

      setDemoCredential({
        email: credentials.email,
        temporaryPassword: credentials.temporaryPassword,
      });

      setPaymentData((prev) => ({
        ...prev,
        confirmedEmail: credentials.email,
        paymentStatus: 'success',
        transactionId: payment.transactionRef,
        error: null,
        cardData: {
          ...prev.cardData,
          ...cardData,
        },
      }));

      return true;
    } catch (err: any) {
      console.error('Registration payment error:', err);
      const errMsg = sanitizeErrorMessage(err?.message, 'Payment processing failed. Please check your details and try again.');
      setPaymentData((prev) => ({
        ...prev,
        paymentStatus: 'failed',
        error: errMsg,
      }));
      return false;
    }
  };

  const resetFlow = () => {
    setStep(1);
    try {
      localStorage.removeItem(LOCAL_STORAGE_REG_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_DRAFT_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_CV_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_COURSE_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_COURSES_KEY);
      sessionStorage.removeItem(SESSION_STORAGE_STEP_KEY);
    } catch (e) {
      console.error(e);
    }
    setSelectedCoursesState([]);
    setRegistrationData(initialRegistrationData);
    setPaymentData(initialPaymentData);
    setDemoCredential(null);
  };

  return (
    <RegistrationFlowContext.Provider
      value={{
        step,
        setStep,
        registrationData,
        updateRegistrationData,
        paymentData,
        updatePaymentData,
        selectedCourse,
        setSelectedCourse,
        selectedCourses,
        setSelectedCourses,
        demoCredential,
        saveStep1AndContinue,
        saveStep2AndContinue,
        processPayment,
        resetFlow,
      }}
    >
      {children}
    </RegistrationFlowContext.Provider>
  );
};

export const useRegistrationFlow = () => {
  const context = useContext(RegistrationFlowContext);
  if (!context) {
    throw new Error('useRegistrationFlow must be used within a RegistrationFlowProvider');
  }
  return context;
};
