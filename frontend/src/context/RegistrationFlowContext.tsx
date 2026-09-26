import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { RegistrationFormData } from '../types/auth';

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
  processPayment: (confirmEmail?: string, cardData?: Partial<CardData>) => boolean;
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
  consent: false, // Unchecked by default (User must explicitly check)
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

export const RegistrationFlowProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [registrationData, setRegistrationData] = useState<RegistrationFormData>(initialRegistrationData);
  const [paymentData, setPaymentData] = useState<PaymentData>(initialPaymentData);
  const [demoCredential, setDemoCredential] = useState<DemoCredential | null>(null);

  const updateRegistrationData = (data: Partial<RegistrationFormData>) => {
    setRegistrationData((prev) => ({ ...prev, ...data }));
  };

  const updatePaymentData = (data: Partial<PaymentData>) => {
    setPaymentData((prev) => ({ ...prev, ...data }));
  };

  const saveStep1AndContinue = (data: RegistrationFormData) => {
    setRegistrationData(data);
    setStep(2);
  };

  const processPayment = (confirmEmail?: string, cardData?: Partial<CardData>): boolean => {
    const finalEmail =
      confirmEmail?.trim() ||
      registrationData.email.trim() ||
      'doctor@virtualautopsy.edu';

    const randomSuffix = Math.floor(100000 + Math.random() * 900000);
    const txnId = `VA-DEMO-${randomSuffix}`;

    setDemoCredential({
      email: finalEmail,
      temporaryPassword: 'VA@Demo123',
    });

    setPaymentData((prev) => ({
      ...prev,
      confirmedEmail: finalEmail,
      paymentStatus: 'success',
      transactionId: txnId,
      error: null,
      cardData: {
        ...prev.cardData,
        ...cardData,
      },
    }));

    return true;
  };

  const resetFlow = () => {
    setStep(1);
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
