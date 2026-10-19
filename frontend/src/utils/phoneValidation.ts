import {
  parsePhoneNumberFromString,
  getCountries,
  getCountryCallingCode,
  type CountryCode,
} from 'libphonenumber-js/max';

export interface CountryPhoneConfig {
  code: string;
  country: string;
  iso: CountryCode;
  placeholder: string;
}

export interface CountryOption {
  iso: CountryCode;
  name: string;
  code: string;
  label: string;
  placeholder: string;
}

// 31 Curated countries with customized national placeholders
export const COUNTRY_PHONE_CONFIGS: CountryPhoneConfig[] = [
  { code: '+91', country: 'India (+91)', iso: 'IN', placeholder: '98765 43210' },
  { code: '+44', country: 'United Kingdom (+44)', iso: 'GB', placeholder: '7911 123456' },
  { code: '+1', country: 'United States (+1)', iso: 'US', placeholder: '(202) 555-0123' },
  { code: '+1', country: 'Canada (+1)', iso: 'CA', placeholder: '(416) 555-0123' },
  { code: '+61', country: 'Australia (+61)', iso: 'AU', placeholder: '0412 345 678' },
  { code: '+49', country: 'Germany (+49)', iso: 'DE', placeholder: '0151 23456789' },
  { code: '+33', country: 'France (+33)', iso: 'FR', placeholder: '06 12 34 56 78' },
  { code: '+971', country: 'United Arab Emirates (+971)', iso: 'AE', placeholder: '050 123 4567' },
  { code: '+41', country: 'Switzerland (+41)', iso: 'CH', placeholder: '078 123 45 67' },
  { code: '+230', country: 'Mauritius (+230)', iso: 'MU', placeholder: '5251 2345' },
  { code: '+65', country: 'Singapore (+65)', iso: 'SG', placeholder: '8123 4567' },
  { code: '+60', country: 'Malaysia (+60)', iso: 'MY', placeholder: '012-345 6789' },
  { code: '+966', country: 'Saudi Arabia (+966)', iso: 'SA', placeholder: '050 123 4567' },
  { code: '+974', country: 'Qatar (+974)', iso: 'QA', placeholder: '3312 3456' },
  { code: '+968', country: 'Oman (+968)', iso: 'OM', placeholder: '9123 4567' },
  { code: '+965', country: 'Kuwait (+965)', iso: 'KW', placeholder: '5123 4567' },
  { code: '+353', country: 'Ireland (+353)', iso: 'IE', placeholder: '087 123 4567' },
  { code: '+64', country: 'New Zealand (+64)', iso: 'NZ', placeholder: '021 123 4567' },
  { code: '+27', country: 'South Africa (+27)', iso: 'ZA', placeholder: '071 123 4567' },
  { code: '+234', country: 'Nigeria (+234)', iso: 'NG', placeholder: '0802 123 4567' },
  { code: '+254', country: 'Kenya (+254)', iso: 'KE', placeholder: '0712 345678' },
  { code: '+20', country: 'Egypt (+20)', iso: 'EG', placeholder: '0100 123 4567' },
  { code: '+81', country: 'Japan (+81)', iso: 'JP', placeholder: '090-1234-5678' },
  { code: '+82', country: 'South Korea (+82)', iso: 'KR', placeholder: '010-1234-5678' },
  { code: '+86', country: 'China (+86)', iso: 'CN', placeholder: '138 0013 8000' },
  { code: '+31', country: 'Netherlands (+31)', iso: 'NL', placeholder: '06 12345678' },
  { code: '+34', country: 'Spain (+34)', iso: 'ES', placeholder: '612 34 56 78' },
  { code: '+39', country: 'Italy (+39)', iso: 'IT', placeholder: '312 345 6789' },
  { code: '+46', country: 'Sweden (+46)', iso: 'SE', placeholder: '070 123 45 67' },
  { code: '+47', country: 'Norway (+47)', iso: 'NO', placeholder: '412 34 567' },
  { code: '+45', country: 'Denmark (+45)', iso: 'DK', placeholder: '20 12 34 56' },
];

const regionNames = new Intl.DisplayNames(['en'], { type: 'region' });

// Comprehensive list of all countries supported by libphonenumber-js
export const ALL_COUNTRIES: CountryOption[] = getCountries()
  .map((iso) => {
    let name: string = iso;
    try {
      name = regionNames.of(iso) || iso;
    } catch {
      name = iso;
    }
    let code = '';
    try {
      code = `+${getCountryCallingCode(iso)}`;
    } catch {
      code = '';
    }
    const curated = COUNTRY_PHONE_CONFIGS.find((c) => c.iso === iso);
    return {
      iso,
      name,
      code,
      label: `${name} (${code})`,
      placeholder: curated?.placeholder || 'Mobile number',
    };
  })
  .filter((c) => c.code)
  .sort((a, b) => a.name.localeCompare(b.name));

/**
 * Resolves the 2-letter ISO country code from calling code, ISO string, or country name.
 */
export function getCountryIso(callingCode?: string, countryIso?: string): CountryCode {
  if (countryIso) {
    const match = ALL_COUNTRIES.find((c) => c.iso === countryIso.toUpperCase());
    if (match) return match.iso;
  }
  if (callingCode) {
    const cleanCode = callingCode.startsWith('+') ? callingCode : `+${callingCode}`;
    const match = ALL_COUNTRIES.find((c) => c.code === cleanCode);
    if (match) return match.iso;
  }
  return 'GB';
}

/**
 * Resolves the country calling code from an ISO code.
 */
export function getCountryCallingCodeByIso(iso: CountryCode): string {
  try {
    return `+${getCountryCallingCode(iso)}`;
  } catch {
    return '+44';
  }
}

/**
 * Retrieves the dynamic placeholder for the selected country.
 */
export function getPhonePlaceholder(callingCode: string, countryIso?: string): string {
  const iso = getCountryIso(callingCode, countryIso);
  const match = ALL_COUNTRIES.find((c) => c.iso === iso);
  return match?.placeholder || 'Mobile number';
}

/**
 * Cleans phone number input by:
 * 1. Stripping letters and unsupported symbols.
 * 2. Retaining digits and allowed formatting (spaces, hyphens, parentheses).
 * 3. Removing duplicate country calling codes if pasted or typed with the country code.
 */
export function cleanPhoneNumberInput(value: string, countryCode: string): string {
  let cleaned = value.replace(/[^0-9\s\-()+]/g, '');
  const callingDigits = countryCode.replace(/\D/g, '');

  if (cleaned.startsWith('+')) {
    const afterPlus = cleaned.slice(1).trim();
    if (callingDigits.length > 0 && afterPlus.startsWith(callingDigits)) {
      cleaned = afterPlus.slice(callingDigits.length).trim();
    } else {
      cleaned = afterPlus;
    }
  } else if (callingDigits.length > 0) {
    const rawDigits = cleaned.replace(/\D/g, '');
    if (rawDigits.startsWith(callingDigits)) {
      const remainder = rawDigits.slice(callingDigits.length);
      if (remainder.length >= 7) {
        cleaned = remainder;
      }
    }
  }

  cleaned = cleaned.replace(/^\+/, '').trimStart();
  return cleaned;
}

export interface PhoneValidationResult {
  isValid: boolean;
  error: string | null;
  formatted?: string;
}

/**
 * Validates a mobile number according to country-specific numbering plans and libphonenumber-js metadata.
 */
export function validateMobileNumber(
  phoneNumber: string,
  iso: CountryCode,
  countryCode?: string,
  countryName?: string
): PhoneValidationResult {
  const trimmed = phoneNumber.trim();
  const cName = countryName || ALL_COUNTRIES.find((c) => c.iso === iso)?.name || 'the selected country';
  const cCode = countryCode || (iso ? getCountryCallingCodeByIso(iso) : '');

  if (!trimmed) {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  const rawDigits = trimmed.replace(/\D/g, '');
  if (rawDigits.length === 0) {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  // 1. India (IN)
  // Standard Indian mobile number must be 10 digits (or 11 with leading trunk 0), starting with 6, 7, 8, or 9
  if (iso === 'IN') {
    const nationalDigits = rawDigits.length === 11 && rawDigits.startsWith('0')
      ? rawDigits.slice(1)
      : rawDigits;
    if (nationalDigits.length !== 10) {
      return {
        isValid: false,
        error: `Indian mobile number must be 10 digits (currently ${nationalDigits.length} digits).`,
      };
    }
    if (!/^[6-9]\d{9}$/.test(nationalDigits)) {
      return {
        isValid: false,
        error: 'Indian mobile numbers must start with 6, 7, 8, or 9.',
      };
    }
  }

  // 2. North America: USA (US) & Canada (CA)
  // Standard national numbers are exactly 10 digits (or 11 with trunk/country 1), area code 2-9
  if (iso === 'US' || iso === 'CA') {
    const nationalDigits = rawDigits.length === 11 && rawDigits.startsWith('1')
      ? rawDigits.slice(1)
      : rawDigits;
    if (nationalDigits.length !== 10 || !/^[2-9]\d{2}[2-9]\d{6}$/.test(nationalDigits)) {
      return {
        isValid: false,
        error: `Please enter a valid 10-digit mobile number for ${cName}.`,
      };
    }
  }

  // 3. Libphonenumber international validation
  try {
    const parsed = parsePhoneNumberFromString(trimmed, iso);
    if (!parsed) {
      return {
        isValid: false,
        error: `Please enter a valid mobile number for ${cName}${cCode ? ` (${cCode})` : ''}.`,
      };
    }

    if (!parsed.isPossible()) {
      return {
        isValid: false,
        error: `Mobile number has invalid length for ${cName}.`,
      };
    }

    if (!parsed.isValid()) {
      return {
        isValid: false,
        error: `Please enter a valid mobile number for ${cName}${cCode ? ` (${cCode})` : ''}.`,
      };
    }

    return {
      isValid: true,
      error: null,
      formatted: parsed.formatNational(),
    };
  } catch {
    return {
      isValid: false,
      error: `Please enter a valid mobile number for ${cName}${cCode ? ` (${cCode})` : ''}.`,
    };
  }
}
