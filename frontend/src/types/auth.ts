export interface RegistrationFormData {
  fullName: string;
  email: string;
  countryCode: string;
  phoneNumber: string;
  qualification: string;
  professionalRole: string;
  organization: string;
  cvFile: File | null;
  consent: boolean;
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
