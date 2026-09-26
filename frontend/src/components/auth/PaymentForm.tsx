import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';
import { StepIndicator } from './StepIndicator';
import { PaymentSuccessModal } from './PaymentSuccessModal';
import { FormInput } from '../common/FormInput';
import { PrimaryButton } from '../common/PrimaryButton';
import { StatusBadge } from '../common/StatusBadge';
import { CreditCard, Lock, ArrowLeft, ShieldCheck, Mail } from 'lucide-react';

export const PaymentForm: React.FC = () => {
  const navigate = useNavigate();
  const {
    registrationData,
    paymentData,
    processPayment,
    updatePaymentData,
  } = useRegistrationFlow();

  // Email confirmation state (CRITICAL: MUST start completely empty "")
  const [confirmEmail, setConfirmEmail] = useState('');
  const [confirmEmailError, setConfirmEmailError] = useState<string | null>(null);

  // Card details state
  const [cardholderName, setCardholderName] = useState(
    paymentData.cardData.cardholderName || registrationData.fullName || 'Dr. Alistair Vance'
  );
  const [cardNumber, setCardNumber] = useState(paymentData.cardData.cardNumber || '4242 4242 4242 4242');
  const [expiryDate, setExpiryDate] = useState(paymentData.cardData.expiryDate || '12/28');
  const [cvc, setCvc] = useState(paymentData.cardData.cvc || '123');

  // Prevent paste into Confirm Email Address input
  const handlePastePrevent = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    setConfirmEmailError('Pasting is disabled. Please type your email address manually.');
  };

  // Format Card Number (adds spaces every 4 digits)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  // Format Expiry Date (MM/YY)
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      raw = `${raw.slice(0, 2)}/${raw.slice(2)}`;
    }
    setExpiryDate(raw);
  };

  // Format CVC (digits only up to 4)
  const handleCvcChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCvc(raw);
  };

  const handleBackToRegistration = () => {
    navigate('/register');
  };

  const handleSubmitPayment = (e: React.FormEvent) => {
    e.preventDefault();
    setConfirmEmailError(null);
    updatePaymentData({ error: null });

    // Instantly approve frontend testing payment!
    processPayment(confirmEmail, {
      cardholderName,
      cardNumber,
      expiryDate,
      cvc,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-card-lg border border-slate-200/80 p-6 sm:p-8 lg:p-8 h-full min-h-full flex flex-col justify-between overflow-hidden relative">
      {/* Top Header & Step Indicator */}
      <div className="shrink-0 pb-2 space-y-2">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={handleBackToRegistration}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-navy-950 transition-colors cursor-pointer group"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-600 group-hover:-translate-x-0.5 transition-transform" />
            <span>Back to Registration</span>
          </button>
          <StatusBadge>ACADEMY PAYMENT</StatusBadge>
        </div>

        {/* Step Indicator (Step 2 Active) */}
        <StepIndicator currentStep={2} isPaymentSuccess={paymentData.paymentStatus === 'success'} />

        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950 tracking-tight">
            Complete Registration Payment
          </h2>
          <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
            Finalize your course enrollment via secure Stripe checkout.
          </p>
        </div>
      </div>

      {/* Internal Scrollable Payment Form Area */}
      <form onSubmit={handleSubmitPayment} className="flex-1 overflow-y-auto pr-1.5 space-y-4 custom-scrollbar my-1.5" noValidate>
        {/* Course Summary Box */}
        <div className="bg-slate-900 rounded-2xl p-4 text-white border border-slate-800 space-y-2.5 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div>
              <p className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">ENROLLMENT COURSE</p>
              <h3 className="text-sm font-bold text-white mt-0.5">Basic Virtual Autopsy – An Online Introduction</h3>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-[10px] text-slate-400 uppercase font-bold">FELLOWSHIP FEE</p>
              <p className="text-lg font-black text-amber-400 font-mono">£999</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-300">
            <span className="flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-amber-400" />
              <span>Payment Gateway: <strong>Stripe Checkout</strong></span>
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono text-[10px]">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>256-Bit SSL Encrypted</span>
            </span>
          </div>
        </div>

        {/* EMAIL CONFIRMATION SECTION (CRITICAL REQUIREMENT) */}
        <div className="bg-amber-50/60 border border-amber-200/90 rounded-2xl p-4 space-y-2.5">
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4 text-amber-700 shrink-0" />
            <h4 className="text-xs font-extrabold text-navy-950 uppercase tracking-wider">Confirm Your Email</h4>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Please re-enter your email address to confirm where your payment confirmation and login credentials will be sent.
          </p>

          <FormInput
            label="Confirm Email Address"
            type="email"
            placeholder="Type your email address manually..."
            value={confirmEmail}
            onChange={(e) => {
              setConfirmEmail(e.target.value);
              setConfirmEmailError(null);
            }}
            onPaste={handlePastePrevent}
            autoComplete="off"
            error={confirmEmailError || undefined}
          />
          <p className="text-[10px] text-slate-400">
            * Note: For security verification, copy & paste is disabled for this field. You must manually type your email.
          </p>
        </div>

        {/* Mock Stripe Payment Details Section */}
        <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between pb-1 border-b border-slate-200/80">
            <span className="text-xs font-extrabold text-navy-950 uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="w-4 h-4 text-amber-600" />
              Stripe Demo Card Details
            </span>
            <span className="text-[10px] font-bold text-slate-500 bg-slate-200 px-2 py-0.5 rounded">DEMO MODE</span>
          </div>

          {/* Cardholder Name */}
          <FormInput
            label="Cardholder Name"
            type="text"
            placeholder="e.g. Dr. Alistair Vance"
            value={cardholderName}
            onChange={(e) => setCardholderName(e.target.value)}
          />

          {/* Card Number */}
          <FormInput
            label="Card Number"
            type="text"
            placeholder="4242 4242 4242 4242"
            value={cardNumber}
            onChange={handleCardNumberChange}
            maxLength={19}
            icon={CreditCard}
          />

          {/* Expiry & CVC Row */}
          <div className="grid grid-cols-2 gap-3">
            <FormInput
              label="Expiry Date"
              type="text"
              placeholder="MM/YY"
              value={expiryDate}
              onChange={handleExpiryChange}
              maxLength={5}
            />

            <FormInput
              label="CVC / CVV"
              type="text"
              placeholder="123"
              value={cvc}
              onChange={handleCvcChange}
              maxLength={4}
            />
          </div>
        </div>

        {/* Submit Button ("Pay £999") */}
        <div className="pt-1.5 space-y-2">
          <PrimaryButton type="submit">
            Pay £999
          </PrimaryButton>

          <p className="text-[10px] text-slate-400 text-center leading-tight flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
            <span>Instant account activation. Login credentials dispatched upon payment completion.</span>
          </p>
        </div>
      </form>

      {/* SUCCESS POPUP MODAL (Rendered instantly when paymentStatus is 'success') */}
      {paymentData.paymentStatus === 'success' && (
        <PaymentSuccessModal
          email={paymentData.confirmedEmail || registrationData.email || 'a.vance@hospital.org'}
          transactionId={paymentData.transactionId}
          amount={paymentData.amount}
          courseName="Basic Virtual Autopsy – An Online Introduction"
        />
      )}
    </div>
  );
};
