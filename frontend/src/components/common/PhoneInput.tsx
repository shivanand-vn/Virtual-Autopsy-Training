import React from 'react';
import { ChevronDown } from 'lucide-react';

interface PhoneInputProps {
  label: string;
  countryCode: string;
  phoneNumber: string;
  onCountryCodeChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  onPhoneNumberChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  error?: string;
}

const COUNTRY_CODES = [
  { code: '+44', country: 'UK (+44)' },
  { code: '+1', country: 'US (+1)' },
  { code: '+61', country: 'AUS (+61)' },
  { code: '+49', country: 'DE (+49)' },
  { code: '+33', country: 'FR (+33)' },
  { code: '+91', country: 'IN (+91)' },
  { code: '+971', country: 'UAE (+971)' },
  { code: '+41', country: 'CH (+41)' },
];

export const PhoneInput: React.FC<PhoneInputProps> = ({
  label,
  countryCode,
  phoneNumber,
  onCountryCodeChange,
  onPhoneNumberChange,
  required = false,
  error,
}) => {
  return (
    <div className="w-full min-w-0 space-y-1.5">
      <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 truncate">
        {label} {required && <span className="text-amber-600">*</span>}
      </label>
      <div className="flex gap-2 min-w-0">
        {/* Country Code Dropdown */}
        <div className="relative w-24 sm:w-28 shrink-0">
          <select
            value={countryCode}
            onChange={onCountryCodeChange}
            className="w-full h-11 pl-2.5 pr-7 bg-slate-50/70 border border-slate-200 rounded-lg text-xs sm:text-sm font-medium text-slate-800 appearance-none focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 focus:bg-white transition-all duration-150 truncate"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.country}
              </option>
            ))}
          </select>
          <div className="absolute inset-y-0 right-0 pr-2 flex items-center pointer-events-none text-slate-400">
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {/* Number Input */}
        <div className="relative flex-1 min-w-0">
          <input
            type="tel"
            value={phoneNumber}
            onChange={onPhoneNumberChange}
            placeholder="7911123456"
            className={`w-full h-11 px-3 bg-slate-50/70 border ${
              error ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
            } rounded-lg text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:bg-white transition-all duration-150 font-mono`}
          />
        </div>
      </div>
      {error && <p className="text-xs text-red-500 font-medium pl-0.5">{error}</p>}
    </div>
  );
};
