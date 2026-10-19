export interface RegistrationFormData {
  fullName: string;
  email: string;
  country: string;
  countryCode: string;
  countryIso?: string;
  regNumber: string;
  phoneNumber: string;
  qualification: string;
  qualificationOther: string;
  professionalRole?: string;
  organization: string;
  cvFile: File | null;
  consent: boolean;
  marketingConsent?: boolean;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface FormErrors {
  [key: string]: string;
}

export interface CountryCodeOption {
  code: string;
  country: string;
  flag: string;
}
