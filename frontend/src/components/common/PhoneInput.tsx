import React from 'react';
import { ChevronDown } from 'lucide-react';
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
  label: string;
  countryCode: string;
  countryIso?: string;
  phoneNumber: string;
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCountryChange?: (callingCode: string, iso: CountryCode) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  countryConfigs?: CountryPhoneConfig[];
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode,
  countryIso,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  onCountryChange,
  onBlur,
  required = false,
  error,
  placeholder,
  countryConfigs = COUNTRY_PHONE_CONFIGS,
}) => {
  const resolvedIso = getCountryIso(countryCode, countryIso);
  const activePlaceholder = placeholder || getPhonePlaceholder(countryCode, resolvedIso);

  // Compute selected option key (format "ISO:CODE" to handle shared calling codes like +1)
  const selectedConfig = countryConfigs.find(
    (c) => c.iso === resolvedIso && c.code === countryCode
  ) || countryConfigs.find((c) => c.code === countryCode) || countryConfigs[0];

  const selectedValue = selectedConfig ? `${selectedConfig.iso}:${selectedConfig.code}` : countryCode;

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rawVal = e.target.value;
    let code = rawVal;
    let iso: CountryCode = resolvedIso;

    if (rawVal.includes(':')) {
      const [parsedIso, parsedCode] = rawVal.split(':');
      iso = parsedIso as CountryCode;
      code = parsedCode;
    } else {
      iso = getCountryIso(rawVal);
    }

    // Set value as clean calling code (+91, +44, etc.) for backwards compatibility
    e.target.value = code;
    (e.target as any).dataset.iso = iso;

    onCountryCodeChange(e);
    if (onCountryChange) {
      onCountryChange(code, iso);
    }
  };

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

      <div className="flex gap-2 sm:gap-2.5 items-center min-w-0">
        {/* Country Code Dropdown */}
        <div className="relative w-28 sm:w-32 shrink-0">
          <select
            value={selectedValue}
            onChange={handleSelectChange}
            aria-label="Country calling code"
            className="w-full h-11 pl-2.5 pr-7 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all duration-150 truncate cursor-pointer"
          >
            {countryConfigs.map((c) => (
              <option key={`${c.iso}-${c.code}`} value={`${c.iso}:${c.code}`}>
                {c.country}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Mobile Number Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="tel"
            inputMode="tel"
            value={phoneNumber}
            onChange={handleInputChange}
            onBlur={onBlur}
            placeholder={activePlaceholder}
            className={`w-full h-11 px-3 bg-slate-50/70 border ${
              error
                ? 'border-red-400 focus:ring-red-400'
                : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
            } rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 placeholder:font-sans placeholder:text-[11px] sm:placeholder:text-xs focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 font-mono`}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
