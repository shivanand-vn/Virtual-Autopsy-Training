// Centralized Course Pricing Configuration for Frontend
export const DEFAULT_COURSE_FEE_AMOUNT = Number(import.meta.env.VITE_COURSE_FEE) || 750;
export const DEFAULT_COURSE_FEE_CURRENCY = 'GBP';
export const DEFAULT_COURSE_FEE_SYMBOL = '£';

export interface CoursePricing {
  amountNumber: number;
  currency: string;
  currencySymbol: string;
  formattedAmount: string;
  formattedAmountWithDecimals: string;
  tierName: string;
}

export const COURSE_PRICING: CoursePricing = {
  amountNumber: DEFAULT_COURSE_FEE_AMOUNT,
  currency: DEFAULT_COURSE_FEE_CURRENCY,
  currencySymbol: DEFAULT_COURSE_FEE_SYMBOL,
  formattedAmount: `${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT}`,
  formattedAmountWithDecimals: `${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT}.00`,
  tierName: `Virtual Autopsy Online Fellowship (${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT})`,
};
