import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  AlertCircle,
  Clock,
  ArrowLeft,
  CreditCard,
  Mail,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  RefreshCw,
  Scale
} from 'lucide-react';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';

export const RefundPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('sec-1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sectionsList = [
    { id: 'sec-1', title: '1. No Cancellation' },
    { id: 'sec-2', title: '2. No Refund' },
    { id: 'sec-3', title: '3. Digital Course Access' },
    { id: 'sec-4', title: '4. Duplicate Payments' },
    { id: 'sec-5', title: '5. Payment Processing Errors' },
    { id: 'sec-6', title: '6. Cancellation by Academy' },
    { id: 'sec-7', title: '7. Course Postponement' },
    { id: 'sec-8', title: '8. Exceptional Legal Rights' },
    { id: 'sec-9', title: '9. Payment Disputes' },
    { id: 'sec-10', title: '10. Refund Method' },
    { id: 'sec-11', title: '11. Refund Request' },
    { id: 'sec-12', title: '12. Policy Changes' },
    { id: 'sec-13', title: '13. Contact' }
  ];

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden flex flex-col justify-between">
      
      <div>
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
            <Link to="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
              <img
                src="/logo.png"
                alt="Virtual Autopsy Global Solutions"
                className="h-12 sm:h-14 w-auto object-contain py-1"
              />
            </Link>

            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link
                to="/register"
                className="px-4 sm:px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-[#F5A623] hover:bg-[#E0951C] rounded-lg shadow-xs transition-all cursor-pointer"
              >
                Register / Enroll Now
              </Link>
            </div>
          </div>
        </header>

        {/* HERO SECTION matching Reference Image (Training.png background + Yellow pill + Subtitle vertical accent) */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 bg-slate-900 border-b border-slate-200/80 overflow-hidden">
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0">
            <img
              src="/Training.png"
              alt="Virtual Autopsy Global LMS Training Header"
              className="w-full h-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/90 to-[#0A192F]/75" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 text-left">
            
            <Link
              to="/"
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Home</span>
            </Link>

            <div>
              <span className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                REFUND & CANCELLATION POLICY
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Refund & Cancellation Policy
              </h1>
            </div>

            {/* Subtitle with vertical yellow bar */}
            <div className="flex items-start space-x-3.5 pt-2 max-w-3xl">
              <div className="w-1.5 self-stretch bg-[#F5A623] rounded-full shrink-0" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                This Refund & Cancellation Policy applies to all courses, training programmes, examinations, workshops, and other paid educational services purchased through the Virtual Autopsy Global Academy LMS.
              </p>
            </div>

            {/* Dates Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-4 text-xs text-slate-400 font-mono">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                <span>Effective Date: <strong>28 September 2026</strong></span>
              </span>
              <span>•</span>
              <span>Last Updated: <strong>28 September 2026</strong></span>
            </div>

          </div>
        </section>

        {/* MAIN CONTENT AREA: CONTENT DIRECTLY ON WEB PAGE (LEFT: 9 SPANS), CARD INDEX (RIGHT: 3 SPANS) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT COLUMN: MAIN POLICY CONTENT DIRECTLY ON PAGE (LG: 9 SPANS) */}
            <div className="lg:col-span-9 space-y-8 text-left">
              
              {/* Preamble Callout directly on page */}
              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-amber-100/80 border border-amber-300/80 rounded-xl">
                  <p className="font-black text-sm sm:text-base text-[#0A192F] leading-snug">
                    Virtual Autopsy Global Academy LMS Payment & Fee Terms
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  This Refund & Cancellation Policy applies to all courses, training programmes, examinations, workshops, and other paid educational services purchased through the Virtual Autopsy Global Academy LMS.
                </p>
              </div>

              <hr className="border-slate-200/80" />

              {/* 1. No Cancellation */}
              <section id="sec-1" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>1. No Cancellation</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-700 font-bold leading-relaxed">
                  All registrations are final once registration and payment have been successfully completed.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students cannot cancel their course registration after payment has been completed.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 2. No Refund */}
              <section id="sec-2" className="space-y-3">
                <div className="p-5 sm:p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                  <h3 className="text-base sm:text-xl font-black text-amber-950 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>2. No Refund</span>
                  </h3>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    All course fees are non-refundable. Once a student has successfully registered and payment has been received, no refund will normally be provided.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 pt-1">
                    This applies regardless of whether the student:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-xs sm:text-sm text-slate-800 font-medium">
                    <li>• Changes their mind;</li>
                    <li>• Decides not to participate;</li>
                    <li>• Does not access the LMS;</li>
                    <li>• Accesses only part of the course;</li>
                    <li>• Does not complete the course;</li>
                    <li>• Does not complete assessments;</li>
                    <li>• Does not attend scheduled sessions;</li>
                    <li>• Is unable to participate due to personal circumstances;</li>
                    <li>• Is unable to participate due to professional commitments; or</li>
                    <li>• Fails to complete the course within the specified access period.</li>
                  </ul>
                </div>
              </section>

              <hr className="border-slate-200/80" />

              {/* 3. Digital Course Access */}
              <section id="sec-3" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>3. Digital Course Access</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where a course provides immediate or scheduled access to digital educational content, the student acknowledges that access to the course constitutes delivery of the digital educational service.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-semibold">
                  Failure to use the provided course access does not create an entitlement to a refund.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 4. Incorrect or Duplicate Payments */}
              <section id="sec-4" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>4. Incorrect or Duplicate Payments</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where a technical or payment-processing error results in a genuine duplicate payment for the same course registration, the student may contact the Academy for verification.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If the duplicate payment is confirmed, the duplicate amount may be refunded.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 5. Payment Processing Errors */}
              <section id="sec-5" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>5. Payment Processing Errors</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If a payment is deducted from the student's account but the LMS does not successfully record the registration, the student should contact the Academy with the payment transaction details.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The transaction will be investigated and, where appropriate, the payment may be reconciled or refunded.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 6. Course Cancellation by the Academy */}
              <section id="sec-6" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>6. Course Cancellation by the Academy</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If the Academy cancels a course or programme and does not provide an alternative course, date, or equivalent arrangement, the Academy may provide an appropriate remedy to affected students.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Any such remedy will be communicated to affected students.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 7. Course Postponement */}
              <section id="sec-7" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>7. Course Postponement</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  If a scheduled course is postponed, students may be offered an alternative date or equivalent arrangement.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  A postponement by itself does not automatically create a right to cancel the registration or receive a refund, unless otherwise required by applicable law or specifically communicated by the Academy.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 8. Exceptional Legal Rights */}
              <section id="sec-8" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>8. Exceptional Legal Rights</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Nothing in this policy is intended to exclude or restrict any refund, consumer, or statutory rights that cannot legally be excluded under applicable law.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 9. Payment Disputes */}
              <section id="sec-9" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>9. Payment Disputes</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students are encouraged to contact the Academy first regarding any payment-related concern.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students retain any rights available to them under applicable law in relation to payment disputes.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 10. Refund Method */}
              <section id="sec-10" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>10. Refund Method</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where a refund is approved under the limited circumstances described in this policy, it will generally be processed through the original payment method.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where payment was processed through Stripe, the refund will generally be processed through Stripe to the applicable original payment method.
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  The time taken for the refunded amount to appear may depend on the payment provider and the student's bank or card issuer.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 11. Refund Request */}
              <section id="sec-11" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>11. Refund Request Procedure</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where a refund is applicable under this policy, the student should contact: <a href="mailto:training@virtualautopsyuk.com" className="text-amber-700 font-bold hover:underline">training@virtualautopsyuk.com</a>
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">The request should include:</p>
                <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <li>• Full name;</li>
                  <li>• Registered email address;</li>
                  <li>• Course name;</li>
                  <li>• Date of payment;</li>
                  <li>• Transaction / reference number; and</li>
                  <li>• Description of the payment issue.</li>
                </ul>
              </section>

              <hr className="border-slate-200/80" />

              {/* 12. Policy Changes */}
              <section id="sec-12" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>12. Policy Changes</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We may update this Refund & Cancellation Policy from time to time. The current version will be published on the LMS website.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 13. Contact */}
              <section id="sec-13" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>13. Contact</span>
                </h3>
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-1 font-mono text-xs shadow-2xs">
                  <strong className="text-[#0A192F] block">Virtual Autopsy Global Academy</strong>
                  <p className="text-slate-600">Email: <a href="mailto:training@virtualautopsyuk.com" className="text-amber-700 font-bold hover:underline">training@virtualautopsyuk.com</a></p>
                  <p className="text-slate-500 pt-2 text-[11px]">Last Updated: 28 September 2026</p>
                </div>
              </section>

              {/* Bottom Back to Top / Home Link */}
              <div className="pt-8 border-t border-slate-200/80 flex items-center justify-between">
                <Link
                  to="/"
                  className="px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-amber-400 font-extrabold rounded-xl text-xs shadow-xs transition-colors inline-flex items-center space-x-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back to Home</span>
                </Link>

                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                  className="text-xs font-bold text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                >
                  Back to Top ↑
                </button>
              </div>

            </div>


            {/* RIGHT COLUMN: STICKY CARD CONTAINER FOR DOCUMENT INDEX (LG: 3 SPANS) */}
            <div className="lg:col-span-3 sticky top-24 hidden lg:block space-y-4">
              <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-md space-y-3">
                <h4 className="text-xs font-black text-[#0A192F] uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-amber-600" />
                  <span>Document Index</span>
                </h4>
                
                <div className="max-h-[calc(100vh-220px)] overflow-y-auto space-y-1 text-xs pr-1 font-medium">
                  {sectionsList.map((sec) => (
                    <button
                      key={sec.id}
                      onClick={() => scrollToSection(sec.id)}
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${
                        activeSection === sec.id
                          ? 'bg-amber-100/90 text-amber-950 font-bold border border-amber-300/80'
                          : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                      }`}
                    >
                      <span className="truncate">{sec.title}</span>
                      <ChevronRight className="w-3 h-3 shrink-0 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Support Pill Card */}
              <div className="p-4 bg-slate-900 text-white rounded-2xl text-xs space-y-2 border border-slate-800 shadow-md">
                <span className="font-bold text-amber-400 block uppercase tracking-wider text-[10px]">NEED HELP?</span>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Have questions about our refund policy or payment processing?
                </p>
                <a
                  href="mailto:training@virtualautopsyuk.com"
                  className="inline-flex items-center space-x-1.5 text-xs text-amber-400 font-bold hover:underline"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>training@virtualautopsyuk.com</span>
                </a>
              </div>
            </div>

          </div>

        </main>
      </div>

      {/* Footer */}
      <PartnerFooter />

    </div>
  );
};
