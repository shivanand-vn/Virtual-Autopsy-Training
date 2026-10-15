// Centralized Course Pricing Configuration
export const DEFAULT_COURSE_FEE_AMOUNT = Number(process.env.COURSE_FEE_GBP) || 750;
export const DEFAULT_COURSE_FEE_CURRENCY = 'GBP';
export const DEFAULT_COURSE_FEE_SYMBOL = '£';

export const COURSE_PRICING = {
  amountNumber: DEFAULT_COURSE_FEE_AMOUNT,
  currency: DEFAULT_COURSE_FEE_CURRENCY,
  currencySymbol: DEFAULT_COURSE_FEE_SYMBOL,
  formattedAmount: `${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT}`,
  formattedAmountWithDecimals: `${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT}.00`,
  tierName: `Virtual Autopsy Online Fellowship (${DEFAULT_COURSE_FEE_SYMBOL}${DEFAULT_COURSE_FEE_AMOUNT})`,
};
