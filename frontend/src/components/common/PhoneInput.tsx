import React from 'react';
import {
  COUNTRY_PHONE_CONFIGS,
  type CountryPhoneConfig,
  getPhonePlaceholder,
  cleanPhoneNumberInput,
  getCountryIso,
} from '../../utils/phoneValidation';
import type { CountryCode } from 'libphonenumber-js/max';

export { COUNTRY_PHONE_CONFIGS, type CountryPhoneConfig, getPhonePlaceholder };

interface PhoneInputProps {
  label?: string;
  countryCode: string;
  countryIso?: string;
  countryName?: string;
  phoneNumber: string;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryCodeChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onCountryChange?: (callingCode: string, iso: CountryCode) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  countryConfigs?: CountryPhoneConfig[];
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label = 'Mobile Number',
  countryCode = '+44',
  countryIso,
  countryName,
  phoneNumber,
  onPhoneNumberChange,
  onBlur,
  required = false,
  error,
  placeholder,
}) => {
  const resolvedIso = getCountryIso(countryCode, countryIso);
  const activePlaceholder = placeholder || getPhonePlaceholder(countryCode, resolvedIso);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanedValue = cleanPhoneNumberInput(e.target.value, countryCode);
    e.target.value = cleanedValue;
    onPhoneNumberChange(e);
  };

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>

      <div className="flex items-center min-w-0 rounded-lg shadow-xs">
        {/* Non-editable Country Calling Code Prefix */}
        <span
          className="inline-flex items-center justify-center h-11 px-3 bg-slate-100 border border-r-0 border-slate-200 rounded-l-lg text-xs sm:text-sm font-bold text-slate-700 select-none shrink-0 font-mono tracking-tight"
          title={countryName ? `${countryName} (${countryCode})` : countryCode}
        >
          {countryCode || '+44'}
        </span>

        {/* Clean Single Mobile Number Input */}
        <input
          type="tel"
          inputMode="tel"
          value={phoneNumber}
          onChange={handleInputChange}
          onBlur={onBlur}
          placeholder={activePlaceholder}
          aria-label={label}
          className={`w-full h-11 px-3 bg-slate-50/70 border ${
            error
              ? 'border-red-400 focus:ring-red-400'
              : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
          } rounded-r-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-[11px] sm:placeholder:text-xs focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 font-mono`}
        />
      </div>

      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
