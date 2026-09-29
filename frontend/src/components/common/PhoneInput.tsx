import React from 'react';
import { ChevronDown } from 'lucide-react';

export interface CountryPhoneConfig {
  code: string;
  country: string;
  placeholder: string;
}

export const COUNTRY_PHONE_CONFIGS: CountryPhoneConfig[] = [
  { code: '+91', country: 'IN (+91)', placeholder: 'Mobile number' },
  { code: '+44', country: 'UK (+44)', placeholder: 'Mobile number' },
  { code: '+1', country: 'US (+1)', placeholder: 'Mobile number' },
  { code: '+61', country: 'AUS (+61)', placeholder: 'Mobile number' },
  { code: '+49', country: 'DE (+49)', placeholder: 'Mobile number' },
  { code: '+33', country: 'FR (+33)', placeholder: 'Mobile number' },
  { code: '+971', country: 'UAE (+971)', placeholder: 'Mobile number' },
  { code: '+41', country: 'CH (+41)', placeholder: 'Mobile number' },
  { code: '+230', country: 'MU (+230)', placeholder: 'Mobile number' },
];

export const getPhonePlaceholder = (countryCode: string): string => {
  const match = COUNTRY_PHONE_CONFIGS.find((c) => c.code === countryCode);
  return match ? match.placeholder : 'Mobile number';
};

interface PhoneInputProps {
  label: string;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
  placeholder?: string;
  countryConfigs?: CountryPhoneConfig[];
}

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
  error,
  placeholder,
  countryConfigs = COUNTRY_PHONE_CONFIGS,
}) => {
  const activePlaceholder = placeholder || getPhonePlaceholder(countryCode);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const numericValue = e.target.value.replace(/\D/g, '');
    e.target.value = numericValue;
    onPhoneNumberChange(e);
  };

  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>

      <div className="flex gap-2 sm:gap-2.5 items-center min-w-0">
        {/* Country Code Dropdown */}
        <div className="relative w-24 sm:w-28 shrink-0">
          <select
            value={countryCode}
            onChange={onCountryCodeChange}
            className="w-full h-11 pl-2.5 pr-7 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all duration-150 truncate cursor-pointer"
          >
            {countryConfigs.map((c) => (
              <option key={c.code} value={c.code}>
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
            inputMode="numeric"
            pattern="[0-9]*"
            value={phoneNumber}
            onChange={handleInputChange}
            placeholder={activePlaceholder}
            className={`w-full h-11 px-3 bg-slate-50/70 border ${error
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
