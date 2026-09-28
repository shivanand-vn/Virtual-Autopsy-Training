import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  CheckCircle2,
  Clock,
  ArrowLeft,
  BookOpen,
  Award,
  CreditCard,
  UserCheck,
  ShieldCheck,
  Mail,
  ChevronRight
} from 'lucide-react';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';

export const PrivacyPolicyPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('sec-1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sectionsList = [
    { id: 'sec-1', title: '1. Information We Collect' },
    { id: 'sec-2', title: '2. How We Collect Information' },
    { id: 'sec-3', title: '3. How We Use Personal Info' },
    { id: 'sec-4', title: '4. Stripe Payment Processing' },
    { id: 'sec-5', title: '5. Cookies' },
    { id: 'sec-6', title: '6. Sharing of Personal Info' },
    { id: 'sec-7', title: '7. We Do Not Sell Personal Info' },
    { id: 'sec-8', title: '8. Certificates & Verification' },
    { id: 'sec-9', title: '9. Data Security' },
    { id: 'sec-10', title: '10. Data Retention' },
    { id: 'sec-11', title: '11. International Processing' },
    { id: 'sec-12', title: '12. Your Privacy Rights' },
    { id: 'sec-13', title: "13. Children's Privacy" },
    { id: 'sec-14', title: '14. Third-Party Websites' },
    { id: 'sec-15', title: '15. Data Breach & Incidents' },
    { id: 'sec-16', title: '16. Changes to Privacy Policy' },
    { id: 'sec-17', title: '17. Contact Us' }
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

        {/* HERO SECTION matching Reference Layout */}
        <section className="relative pt-12 pb-16 sm:pt-16 sm:pb-20 bg-slate-900 border-b border-slate-200/80 overflow-hidden">
          {/* Background Image Container */}
          <div className="absolute inset-0 z-0">
            <img
              src="/Training.png"
              alt="Virtual Autopsy Global LMS Privacy Header"
              className="w-full h-full object-cover object-center opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0A192F] via-[#0A192F]/90 to-[#0A192F]/75" />
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4 text-left">
            
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-400 hover:text-amber-300 transition-colors mb-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Registration</span>
            </Link>

            <div>
              <span className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/40 text-amber-300 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider mb-3">
                PRIVACY & DATA PROTECTION
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Privacy Policy
              </h1>
            </div>

            {/* Subtitle with vertical yellow bar */}
            <div className="flex items-start space-x-3.5 pt-2 max-w-3xl">
              <div className="w-1.5 bg-[#F5A623] rounded-full shrink-0 self-stretch mt-1" />
              <p className="text-slate-300 text-sm sm:text-base leading-relaxed font-normal">
                Virtual Autopsy Global Academy respects the privacy of users of our website and Learning Management System (“LMS”). This policy details how we collect, use, store, process, and protect your personal information.
              </p>
            </div>

            {/* Meta Tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-400 pt-3">
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700/60">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Effective Date: 28 September 2026
              </span>
              <span className="flex items-center gap-1.5 bg-slate-800/80 px-3 py-1 rounded-md border border-slate-700/60">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                Last Updated: 28 September 2026
              </span>
            </div>
          </div>
        </section>

        {/* MAIN BODY CONTENT AREA */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            
            {/* LEFT COLUMN: Clean Web Page Content Canvas (No Card Wrapper) */}
            <div className="lg:col-span-9 space-y-10 text-slate-700 text-sm sm:text-base leading-relaxed">
              
              {/* Introductory Lead Box */}
              <div className="p-6 bg-amber-500/10 border-l-4 border-[#F5A623] rounded-r-2xl space-y-2">
                <h3 className="font-extrabold text-navy-950 text-base flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600" />
                  <span>Commitment to Student Data Privacy</span>
                </h3>
                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  By using the LMS, creating an account, or registering for a training course, you acknowledge that you have read and understood this Privacy Policy.
                </p>
              </div>

              {/* 1. Information We Collect */}
              <section id="sec-1" className="scroll-mt-28 space-y-6 pt-4">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    1. Information We Collect
                  </h2>
                </div>
                
                <p>
                  Depending on your use of the LMS, we may collect and process personal, educational, course, and payment information as described below:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 1.1 Personal Information */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                      <UserCheck className="w-4 h-4 text-amber-600" />
                      1.1 Personal Information
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">• Full name</li>
                      <li className="flex items-center gap-2">• Email address</li>
                      <li className="flex items-center gap-2">• Mobile / telephone number</li>
                      <li className="flex items-center gap-2">• Date of birth (where required for specific programmes)</li>
                      <li className="flex items-center gap-2">• Country or location</li>
                      <li className="flex items-center gap-2">• Postal address (where required)</li>
                      <li className="flex items-center gap-2">• Username and account information</li>
                    </ul>
                  </div>

                  {/* 1.2 Educational and Professional Information */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                      <BookOpen className="w-4 h-4 text-amber-600" />
                      1.2 Educational & Professional Info
                    </h3>
                    <p className="text-xs text-slate-500 italic">For eligibility, professional training & certification:</p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">• Educational & professional qualifications</li>
                      <li className="flex items-center gap-2">• Professional designation</li>
                      <li className="flex items-center gap-2">• Institution or organisation</li>
                      <li className="flex items-center gap-2">• Work experience</li>
                      <li className="flex items-center gap-2">• Professional registration details</li>
                      <li className="flex items-center gap-2">• CV / resume</li>
                      <li className="flex items-center gap-2">• Supporting qualification documents</li>
                    </ul>
                  </div>

                  {/* 1.3 Course and Learning Information */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                      <Award className="w-4 h-4 text-amber-600" />
                      1.3 Course & Learning Info
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">• Courses registered for & course progress</li>
                      <li className="flex items-center gap-2">• Module completion & learning activity</li>
                      <li className="flex items-center gap-2">• Assessment & examination results</li>
                      <li className="flex items-center gap-2">• Assignment submissions & attendance</li>
                      <li className="flex items-center gap-2">• Certificate status</li>
                      <li className="flex items-center gap-2">• Date and time of LMS access</li>
                    </ul>
                  </div>

                  {/* 1.4 Payment Information */}
                  <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                    <h3 className="font-bold text-slate-950 text-sm flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-amber-600" />
                      1.4 Payment Information
                    </h3>
                    <p className="text-xs text-slate-600">
                      When purchasing a course via Stripe or authorised providers, we receive transaction data:
                    </p>
                    <ul className="space-y-1.5 text-xs text-slate-700">
                      <li className="flex items-center gap-2">• Transaction/reference number & payment status</li>
                      <li className="flex items-center gap-2">• Amount paid, currency & date of payment</li>
                      <li className="flex items-center gap-2">• Payment method type</li>
                      <li className="flex items-center gap-2">• Limited information for reconciliation</li>
                    </ul>
                    <p className="text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 font-medium">
                      Note: The LMS does not store complete card numbers or CVVs.
                    </p>
                  </div>
                </div>
              </section>

              {/* 2. How We Collect Information */}
              <section id="sec-2" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    2. How We Collect Information
                  </h2>
                </div>
                <p>Information may be collected directly or automatically when you:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 text-xs sm:text-sm">
                  {[
                    'Create an LMS account',
                    'Register for a course',
                    'Complete an online registration form',
                    'Make a payment',
                    'Upload a CV or qualification document',
                    'Participate in an assessment',
                    'Contact our support team',
                    'Access and navigate the LMS',
                    'Communicate with us by email or authorized channels'
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2.5 p-3 bg-white rounded-xl border border-slate-200/80">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </section>

              {/* 3. How We Use Personal Information */}
              <section id="sec-3" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    3. How We Use Personal Information
                  </h2>
                </div>
                <p>We use personal information strictly for legitimate operational, educational, and legal purposes:</p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs sm:text-sm">
                  {[
                    'Create and manage your LMS account',
                    'Verify identity and course eligibility',
                    'Process course registrations and access',
                    'Manage student academic records',
                    'Deliver educational content & assessments',
                    'Issue and verify certificates',
                    'Communicate important course announcements',
                    'Provide technical and student support',
                    'Process payment & transaction reconciliation',
                    'Investigate payment issues & prevent fraud',
                    'Maintain LMS security and system integrity',
                    'Comply with applicable legal & regulatory requirements'
                  ].map((purpose, idx) => (
                    <li key={idx} className="flex items-start gap-2 p-3 bg-slate-100/70 rounded-xl text-slate-800">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-2 shrink-0" />
                      <span className="font-medium">{purpose}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* 4. Payment Processing Through Stripe */}
              <section id="sec-4" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    4. Payment Processing Through Stripe
                  </h2>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs space-y-3">
                  <p>
                    The LMS uses Stripe and authorized gateway partners to process course payments securely.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-700 pl-4 list-disc">
                    <li>When you make a payment, relevant payment information is processed directly by Stripe in accordance with Stripe's terms and privacy policies.</li>
                    <li>The Academy receives transaction notifications necessary to confirm and reconcile your enrollment.</li>
                    <li>The Academy does not store complete payment-card numbers or security CVVs on LMS servers.</li>
                  </ul>
                </div>
              </section>

              {/* 5. Cookies */}
              <section id="sec-5" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    5. Cookies
                  </h2>
                </div>
                <p>
                  The LMS may use cookies and similar session technologies for authentication, session stability, security, preference storage, analytics, and platform functionality.
                </p>
                <p className="text-xs text-slate-600 bg-slate-100 p-4 rounded-xl border border-slate-200">
                  You may control or disable cookies through your web browser settings. Please note that disabling certain essential cookies may affect LMS performance and features.
                </p>
              </section>

              {/* 6. Sharing of Personal Information */}
              <section id="sec-6" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    6. Sharing of Personal Information
                  </h2>
                </div>
                <p>
                  We may share relevant personal information with authorized service providers necessary to operate the LMS and deliver educational services, including:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  {[
                    'Payment Processors',
                    'LMS Hosting Providers',
                    'Cloud / Server Infrastructure',
                    'Email Service Providers',
                    'Video / Content Delivery',
                    'IT & Cybersecurity Providers',
                    'Analytics Providers',
                    'Technical Support Teams'
                  ].map((provider, i) => (
                    <div key={i} className="p-3 bg-white border border-slate-200/80 rounded-xl text-center font-semibold text-slate-800 shadow-2xs">
                      {provider}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-slate-600">
                  Information may also be disclosed where required or permitted by applicable law, regulation, court order, or lawful governmental request.
                </p>
              </section>

              {/* 7. We Do Not Sell Student Personal Information */}
              <section id="sec-7" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    7. We Do Not Sell Student Personal Information
                  </h2>
                </div>
                <div className="p-5 bg-emerald-500/10 border-l-4 border-emerald-600 rounded-r-2xl space-y-2">
                  <h3 className="font-bold text-emerald-950 text-sm flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>No Commercial Sale of Data</span>
                  </h3>
                  <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                    We do not sell student personal information as a commercial product. Personal information is used strictly for providing and administering our educational and LMS services, maintaining academic records, improving services, and meeting legal obligations.
                  </p>
                </div>
              </section>

              {/* 8. Certificates and Verification */}
              <section id="sec-8" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    8. Certificates & Verification
                  </h2>
                </div>
                <p>
                  Where certificates are issued upon course completion, we retain necessary records to create certificates, maintain credential validity, and verify authenticity upon legitimate inquiry.
                </p>
                <p className="text-xs text-slate-600">
                  Where a public certificate-verification system is used, only information reasonably required for verification (e.g. Student Name, Certificate ID, Course Name, and Issue Date) will be displayed.
                </p>
              </section>

              {/* 9. Data Security */}
              <section id="sec-9" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    9. Data Security
                  </h2>
                </div>
                <p>
                  We implement reasonable technical and organizational measures to safeguard personal information against unauthorized access, disclosure, loss, misuse, alteration, or destruction.
                </p>
                <ul className="space-y-1.5 text-xs sm:text-sm text-slate-700 pl-4 list-disc">
                  <li>Strict access control mechanisms & role-based authentication</li>
                  <li>Secure HTTPS/TLS encrypted data transmission</li>
                  <li>Protected cloud hosting infrastructure & continuous monitoring</li>
                </ul>
                <p className="text-xs text-slate-500 italic">
                  Note: While we employ robust security safeguards, no internet transmission or storage system can be guaranteed 100% secure.
                </p>
              </section>

              {/* 10. Data Retention */}
              <section id="sec-10" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    10. Data Retention
                  </h2>
                </div>
                <p>
                  Personal information is retained for as long as reasonably necessary for account administration, course completion tracking, certification records, financial/tax auditing, legal compliance, and dispute resolution.
                </p>
              </section>

              {/* 11. International Processing */}
              <section id="sec-11" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    11. International Processing
                  </h2>
                </div>
                <p>
                  Some third-party service providers used by the LMS may process data outside India. Where applicable, we take reasonable steps to ensure such processing is subject to appropriate safeguards and applicable legal standards.
                </p>
              </section>

              {/* 12. Your Privacy Rights */}
              <section id="sec-12" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    12. Your Privacy Rights
                  </h2>
                </div>
                <p>Subject to applicable law, you may have rights concerning your personal information, including:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs sm:text-sm">
                  {[
                    'Request access to information held about you',
                    'Request correction of inaccurate information',
                    'Request deletion where legally applicable',
                    'Request information regarding data processing',
                    'Withdraw consent where processing relies on consent',
                    'Raise a privacy-related inquiry or complaint'
                  ].map((right, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-3 bg-white rounded-xl border border-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-medium text-slate-800">{right}</span>
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200 text-xs text-slate-700">
                  Privacy requests may be submitted to: <a href="mailto:training@virtualautopsyuk.com" className="font-bold text-amber-700 underline">training@virtualautopsyuk.com</a>. Identity verification may be required prior to fulfilling requests.
                </div>
              </section>

              {/* 13. Children's Privacy */}
              <section id="sec-13" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    13. Children's Privacy
                  </h2>
                </div>
                <p>
                  Our LMS and professional training programmes are intended for adult and professional learners. We do not knowingly collect personal information from children. If you believe a child has provided us data improperly, please contact us immediately.
                </p>
              </section>

              {/* 14. Third-Party Websites */}
              <section id="sec-14" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    14. Third-Party Websites
                  </h2>
                </div>
                <p>
                  The LMS may contain links to third-party services. We are not responsible for the privacy practices of third-party platforms and advise users to review third-party policies directly.
                </p>
              </section>

              {/* 15. Data Breach and Security Incidents */}
              <section id="sec-15" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    15. Data Breach & Security Incidents
                  </h2>
                </div>
                <p>
                  Where required by applicable law, we will take prompt, appropriate action in response to any personal data security incident, including investigation, containment, remediation, and official notification where legally mandated.
                </p>
              </section>

              {/* 16. Changes to This Privacy Policy */}
              <section id="sec-16" className="scroll-mt-28 space-y-4 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    16. Changes to Privacy Policy
                  </h2>
                </div>
                <p>
                  We may update this Privacy Policy periodically to reflect service updates, technological changes, legal requirements, or revised data practices. The updated policy will be published on the LMS website with a revised effective date.
                </p>
              </section>

              {/* 17. Contact Us */}
              <section id="sec-17" className="scroll-mt-28 space-y-6 pt-4 border-t border-slate-200">
                <div className="pb-3 border-b border-slate-200">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-950 tracking-tight">
                    17. Contact Us
                  </h2>
                </div>
                
                <div className="p-6 bg-slate-900 text-white rounded-3xl space-y-4 shadow-lg">
                  <h3 className="font-extrabold text-amber-400 text-base flex items-center gap-2">
                    <Mail className="w-5 h-5" />
                    <span>Virtual Autopsy Global Academy</span>
                  </h3>
                  <p className="text-slate-300 text-xs sm:text-sm">
                    For privacy questions, requests, or concerns, please contact our data protection contact:
                  </p>
                  <div className="flex items-center gap-3 pt-2 text-xs sm:text-sm font-medium">
                    <span className="text-slate-400">Email:</span>
                    <a href="mailto:training@virtualautopsyuk.com" className="text-amber-400 hover:underline font-mono">
                      training@virtualautopsyuk.com
                    </a>
                  </div>
                  <div className="text-[11px] text-slate-500 pt-2 border-t border-slate-800">
                    Last Updated: 28 September 2026
                  </div>
                </div>

                {/* Return Button */}
                <div className="pt-6">
                  <Link
                    to="/register"
                    className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-md transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back to Registration</span>
                  </Link>
                </div>
              </section>

            </div>

            {/* RIGHT COLUMN: Document Index (Styled Card Container) */}
            <div className="lg:col-span-3 sticky top-28 space-y-6">
              <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-lg space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-950 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-amber-600" />
                    Document Index
                  </h3>
                  <span className="text-[10px] bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full font-bold">
                    17 Sections
                  </span>
                </div>

                <nav className="space-y-1 max-h-[calc(100vh-220px)] overflow-y-auto pr-1 text-xs">
                  {sectionsList.map((sec) => {
                    const isActive = activeSection === sec.id;
                    return (
                      <button
                        key={sec.id}
                        onClick={() => scrollToSection(sec.id)}
                        className={`w-full text-left px-3 py-2 rounded-lg transition-all flex items-center justify-between font-medium cursor-pointer ${
                          isActive
                            ? 'bg-amber-50 text-amber-950 font-bold border-l-3 border-[#F5A623]'
                            : 'text-slate-600 hover:bg-slate-50 hover:text-slate-950'
                        }`}
                      >
                        <span className="truncate mr-2">{sec.title}</span>
                        {isActive && <ChevronRight className="w-3.5 h-3.5 text-amber-600 shrink-0" />}
                      </button>
                    );
                  })}
                </nav>

                <div className="pt-3 border-t border-slate-100">
                  <Link
                    to="/register"
                    className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-amber-400 text-xs font-bold rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to Registration</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>

      {/* Shared Footer */}
      <PartnerFooter />
    </div>
  );
};
