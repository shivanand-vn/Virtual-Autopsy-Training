import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { RegistrationFormData } from '../types/auth';
import { api } from '../lib/api';

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

interface RegistrationFlowContextType {
  step: 1 | 2;
  setStep: (step: 1 | 2) => void;
  registrationData: RegistrationFormData;
  updateRegistrationData: (data: Partial<RegistrationFormData>) => void;
  paymentData: PaymentData;
  updatePaymentData: (data: Partial<PaymentData>) => void;
  demoCredential: DemoCredential | null;
  saveStep1AndContinue: (data: RegistrationFormData) => void;
  processPayment: (confirmEmail?: string, cardData?: Partial<CardData>) => Promise<boolean>;
  resetFlow: () => void;
}

const initialRegistrationData: RegistrationFormData = {
  fullName: '',
  email: '',
  countryCode: '+44',
  phoneNumber: '',
  qualification: '',
  professionalRole: '',
  organization: '',
  cvFile: null,
  consent: false,
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
  amount: '£999',
  error: null,
};

const RegistrationFlowContext = createContext<RegistrationFlowContextType | undefined>(undefined);

const LOCAL_STORAGE_REG_KEY = 'virtual_autopsy_registration_email';

export const RegistrationFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData>(() => {
    try {
      const savedEmail = localStorage.getItem(LOCAL_STORAGE_REG_KEY);
      if (savedEmail) {
        return { ...initialRegistrationData, email: savedEmail };
      }
    } catch (e) {
      console.error(e);
    }
    return initialRegistrationData;
  });

  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [demoCredential, setDemoCredential] = useState<DemoCredential | null>(null);

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
    } catch (e) {
      console.error(e);
    }
    setStep(2);
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
      const payload = {
        fullName: registrationData.fullName.trim() || 'Registered Student',
        email: finalEmail,
        countryCode: registrationData.countryCode || '+44',
        phoneNumber: registrationData.phoneNumber || '',
        qualification: registrationData.qualification || 'MBBS / MD',
        professionalRole: registrationData.professionalRole || 'Forensic Pathologist',
        organization: registrationData.organization || 'Virtual Autopsy Training Academy',
        cvFileUrl: 'https://res.cloudinary.com/demo/image/upload/sample.pdf',
        amount: paymentData.amount || '£999.00',
        currency: 'GBP',
        tier: 'Virtual Autopsy Online Fellowship (£999)',
        cardholderName: cardData?.cardholderName || registrationData.fullName || 'Cardholder',
        cardLast4: (cardData?.cardNumber || '4242').replace(/\s/g, '').slice(-4) || '4242',
      };

      const response = await api.post('/payments/complete-registration', payload);
      const { credentials, payment } = response.data;

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
      const errMsg = err?.message || 'Payment processing failed. Please check your details and try again.';
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
    } catch (e) {
      console.error(e);
    }
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
        demoCredential,
        saveStep1AndContinue,
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
