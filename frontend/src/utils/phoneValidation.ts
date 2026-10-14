import { parsePhoneNumber, type CountryCode } from 'libphonenumber-js/max';

export interface CountryPhoneConfig {
  code: string;
  country: string;
  iso: CountryCode;
  placeholder: string;
}

export const COUNTRY_PHONE_CONFIGS: CountryPhoneConfig[] = [
  { code: '+91', country: 'IN (+91)', iso: 'IN', placeholder: '98765 43210' },
  { code: '+44', country: 'UK (+44)', iso: 'GB', placeholder: '7911 123456' },
  { code: '+1', country: 'US (+1)', iso: 'US', placeholder: '(202) 555-0123' },
  { code: '+1', country: 'CA (+1)', iso: 'CA', placeholder: '(416) 555-0123' },
  { code: '+61', country: 'AUS (+61)', iso: 'AU', placeholder: '0412 345 678' },
  { code: '+49', country: 'DE (+49)', iso: 'DE', placeholder: '0151 23456789' },
  { code: '+33', country: 'FR (+33)', iso: 'FR', placeholder: '06 12 34 56 78' },
  { code: '+971', country: 'UAE (+971)', iso: 'AE', placeholder: '050 123 4567' },
  { code: '+41', country: 'CH (+41)', iso: 'CH', placeholder: '078 123 45 67' },
  { code: '+230', country: 'MU (+230)', iso: 'MU', placeholder: '5251 2345' },
  { code: '+65', country: 'SG (+65)', iso: 'SG', placeholder: '8123 4567' },
  { code: '+60', country: 'MY (+60)', iso: 'MY', placeholder: '012-345 6789' },
  { code: '+966', country: 'SA (+966)', iso: 'SA', placeholder: '050 123 4567' },
  { code: '+974', country: 'QA (+974)', iso: 'QA', placeholder: '3312 3456' },
  { code: '+968', country: 'OM (+968)', iso: 'OM', placeholder: '9123 4567' },
  { code: '+965', country: 'KW (+965)', iso: 'KW', placeholder: '5123 4567' },
  { code: '+353', country: 'IE (+353)', iso: 'IE', placeholder: '087 123 4567' },
  { code: '+64', country: 'NZ (+64)', iso: 'NZ', placeholder: '021 123 4567' },
  { code: '+27', country: 'ZA (+27)', iso: 'ZA', placeholder: '071 123 4567' },
  { code: '+234', country: 'NG (+234)', iso: 'NG', placeholder: '0802 123 4567' },
  { code: '+254', country: 'KE (+254)', iso: 'KE', placeholder: '0712 345678' },
  { code: '+20', country: 'EG (+20)', iso: 'EG', placeholder: '0100 123 4567' },
  { code: '+81', country: 'JP (+81)', iso: 'JP', placeholder: '090-1234-5678' },
  { code: '+82', country: 'KR (+82)', iso: 'KR', placeholder: '010-1234-5678' },
  { code: '+86', country: 'CN (+86)', iso: 'CN', placeholder: '138 0013 8000' },
  { code: '+31', country: 'NL (+31)', iso: 'NL', placeholder: '06 12345678' },
  { code: '+34', country: 'ES (+34)', iso: 'ES', placeholder: '612 34 56 78' },
  { code: '+39', country: 'IT (+39)', iso: 'IT', placeholder: '312 345 6789' },
  { code: '+46', country: 'SE (+46)', iso: 'SE', placeholder: '070 123 45 67' },
  { code: '+47', country: 'NO (+47)', iso: 'NO', placeholder: '412 34 567' },
  { code: '+45', country: 'DK (+45)', iso: 'DK', placeholder: '20 12 34 56' },
];

/**
 * Resolves the 2-letter ISO country code from calling code and optional ISO.
 */
export function getCountryIso(callingCode: string, countryIso?: string): CountryCode {
  if (countryIso) {
    const directMatch = COUNTRY_PHONE_CONFIGS.find((c) => c.iso === countryIso);
    if (directMatch) return directMatch.iso;
  }
  const match = COUNTRY_PHONE_CONFIGS.find((c) => c.code === callingCode);
  return match ? match.iso : 'GB';
}

/**
 * Retrieves the dynamic placeholder for the selected country.
 */
export function getPhonePlaceholder(callingCode: string, countryIso?: string): string {
  const iso = getCountryIso(callingCode, countryIso);
  const match = COUNTRY_PHONE_CONFIGS.find((c) => c.iso === iso && c.code === callingCode)
    || COUNTRY_PHONE_CONFIGS.find((c) => c.code === callingCode)
    || COUNTRY_PHONE_CONFIGS.find((c) => c.iso === iso);
  return match ? match.placeholder : 'Mobile number';
}

/**
 * Cleans phone number input by:
 * 1. Stripping letters and unsupported symbols.
 * 2. Retaining digits and allowed formatting (spaces, hyphens, parentheses).
 * 3. Removing duplicate country calling codes if pasted or typed with the country code.
 */
export function cleanPhoneNumberInput(value: string, countryCode: string): string {
  // Allow digits, spaces, hyphens, parentheses, and leading plus
  let cleaned = value.replace(/[^0-9\s\-()+]/g, '');

  const callingDigits = countryCode.replace(/\D/g, '');

  // If user pasted or typed with leading '+'
  if (cleaned.startsWith('+')) {
    const afterPlus = cleaned.slice(1).trim();
    if (callingDigits.length > 0 && afterPlus.startsWith(callingDigits)) {
      cleaned = afterPlus.slice(callingDigits.length).trim();
    } else {
      cleaned = afterPlus;
    }
  } else if (callingDigits.length > 0) {
    // If user pasted calling code without '+' e.g. 919876543210
    const rawDigits = cleaned.replace(/\D/g, '');
    if (rawDigits.startsWith(callingDigits)) {
      const remainder = rawDigits.slice(callingDigits.length);
      // Only strip if the remaining part is a plausible national phone number (>= 7 digits)
      if (remainder.length >= 7) {
        cleaned = remainder;
      }
    }
  }

  // Remove any remaining leading '+'
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
  _countryCode?: string
): PhoneValidationResult {
  const trimmed = phoneNumber.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Phone Number is required.' };
  }

  const rawDigits = trimmed.replace(/\D/g, '');
  if (rawDigits.length === 0) {
    return { isValid: false, error: 'Phone Number is required.' };
  }

  // 1. India (IN)
  // Standard Indian mobile number must be 10 digits (or 11 with leading trunk 0), starting with 6, 7, 8, or 9
  if (iso === 'IN') {
    const nationalDigits = rawDigits.length === 11 && rawDigits.startsWith('0')
      ? rawDigits.slice(1)
      : rawDigits;
    if (nationalDigits.length !== 10 || !/^[6-9]\d{9}$/.test(nationalDigits)) {
      return {
        isValid: false,
        error: 'Please enter a valid mobile number for the selected country.',
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
        error: 'Please enter a valid mobile number for the selected country.',
      };
    }
  }

  // 3. Libphonenumber international validation
  try {
    const parsed = parsePhoneNumber(trimmed, iso);
    if (!parsed || !parsed.isValid()) {
      return {
        isValid: false,
        error: 'Please enter a valid mobile number for the selected country.',
      };
    }

    // Verify number type where available (ensure it's not strictly a landline)
    const type = parsed.getType();
    if (type && type !== 'MOBILE' && type !== 'FIXED_LINE_OR_MOBILE') {
      return {
        isValid: false,
        error: 'Please enter a valid mobile number for the selected country.',
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
      error: 'Please enter a valid mobile number for the selected country.',
    };
  }
}
