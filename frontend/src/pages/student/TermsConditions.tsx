import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  FileText,
  Lock,
  CheckCircle,
  AlertCircle,
  Clock,
  HelpCircle,
  ArrowLeft,
  BookOpen,
  Award,
  CreditCard,
  UserCheck,
  Scale,
  ShieldCheck,
  Building2,
  Mail,
  ChevronRight
} from 'lucide-react';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';

export const TermsConditionsPage: React.FC = () => {
  const [activeSection, setActiveSection] = useState('sec-1');

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const sectionsList = [
    { id: 'sec-1', title: '1. About the LMS' },
    { id: 'sec-2', title: '2. Eligibility & Registration' },
    { id: 'sec-3', title: '3. LMS Account' },
    { id: 'sec-4', title: '4. Course Registration' },
    { id: 'sec-5', title: '5. Payment' },
    { id: 'sec-6', title: '6. No Cancellation & No Refund' },
    { id: 'sec-7', title: '7. Course Access' },
    { id: 'sec-8', title: '8. Course Materials' },
    { id: 'sec-9', title: '9. Intellectual Property' },
    { id: 'sec-10', title: '10. Assessments & Exams' },
    { id: 'sec-11', title: '11. Certification' },
    { id: 'sec-12', title: '12. Student Responsibilities' },
    { id: 'sec-13', title: '13. Educational Disclaimer' },
    { id: 'sec-14', title: '14. LMS Availability' },
    { id: 'sec-15', title: '15. Course Changes' },
    { id: 'sec-16', title: '16. Third-Party Services' },
    { id: 'sec-17', title: '17. Payment Security' },
    { id: 'sec-18', title: '18. Account Suspension' },
    { id: 'sec-19', title: '19. Limitation of Liability' },
    { id: 'sec-20', title: '20. Privacy' },
    { id: 'sec-21', title: '21. Changes to Terms' },
    { id: 'sec-22', title: '22. Governing Law' },
    { id: 'sec-23', title: '23. Contact' }
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
                Enroll Now
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
                LEGAL & COMPLIANCE
              </span>

              <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
                Terms & Conditions
              </h1>
            </div>

            {/* Subtitle with vertical yellow bar matching reference image layout */}
            <div className="flex items-start space-x-3.5 pt-2 max-w-3xl">
              <div className="w-1.5 self-stretch bg-[#F5A623] rounded-full shrink-0" />
              <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                These Terms & Conditions govern your access to and use of our website, Learning Management System (LMS), online courses, training programmes, assessments, examinations, certification services, and related educational services.
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

            {/* LEFT COLUMN: MAIN TERMS CONTENT DIRECTLY ON PAGE (LG: 9 SPANS) */}
            <div className="lg:col-span-9 space-y-8 text-left">

              {/* Preamble Callout directly on page */}
              <div className="space-y-4">
                <div className="p-4 sm:p-5 bg-amber-100/80 border border-amber-300/80 rounded-xl">
                  <p className="font-black text-sm sm:text-base text-[#0A192F] leading-snug">
                    Welcome to Virtual Autopsy Global Academy LMS (“LMS”, “Platform”, “we”, “us”, or “our”).
                  </p>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  These Terms & Conditions govern your access to and use of our website, Learning Management System (LMS), online courses, training programmes, assessments, examinations, certification services, and related educational services.
                </p>
                <p className="text-xs sm:text-sm text-slate-700 font-semibold leading-relaxed pt-3 border-t border-slate-200/80">
                  By creating an account, registering for a course, making a payment, or accessing course content, you acknowledge that you have read, understood, and agreed to these Terms & Conditions.
                </p>
              </div>

              <hr className="border-slate-200/80" />

              {/* 1. About the LMS */}
              <section id="sec-1" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>1. About the LMS</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Virtual Autopsy Global Academy provides online and professional educational programmes relating to areas including:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 font-medium text-slate-800 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">• Virtual Autopsy</li>
                  <li className="flex items-center gap-2">• Post-Mortem Computed Tomography (PMCT)</li>
                  <li className="flex items-center gap-2">• Forensic Imaging</li>
                  <li className="flex items-center gap-2">• Forensic Medicine</li>
                  <li className="flex items-center gap-2">• Forensic Pathology</li>
                  <li className="flex items-center gap-2">• Radiology and Radiography</li>
                  <li className="flex items-center gap-2">• Digital Autopsy</li>
                  <li className="flex items-center gap-2">• Related professional and technical subjects</li>
                </ul>
                <p className="pt-2 text-xs text-slate-500 leading-relaxed">
                  Specific course content, duration, eligibility, assessments, certification requirements, access period, and fees may vary between programmes. The terms applicable to a specific course may also be displayed on the relevant course registration page.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 2. Eligibility and Registration */}
              <section id="sec-2" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>2. Eligibility and Registration</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students must provide accurate and complete information when registering for the LMS. Information may include:
                </p>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 font-medium text-slate-800 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">• Full name</li>
                  <li className="flex items-center gap-2">• Email address</li>
                  <li className="flex items-center gap-2">• Mobile/telephone number</li>
                  <li className="flex items-center gap-2">• Educational qualification</li>
                  <li className="flex items-center gap-2">• Professional qualification</li>
                  <li className="flex items-center gap-2">• Institution/organisation</li>
                  <li className="flex items-center gap-2">• Professional designation</li>
                  <li className="flex items-center gap-2">• Work experience</li>
                  <li className="flex items-center gap-2">• CV/resume</li>
                  <li className="flex items-center gap-2">• Other required eligibility information</li>
                </ul>
                <p className="pt-1 text-xs text-slate-500">
                  You are responsible for ensuring that all information provided is accurate and up to date. We reserve the right to request supporting documentation where necessary to verify eligibility.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 3. LMS Account */}
              <section id="sec-3" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>3. LMS Account</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where an LMS account is required, you are responsible for maintaining the confidentiality of your username, password, and other login credentials. Your account is personal to you.
                </p>
                <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-1 text-xs sm:text-sm">
                  <span className="font-bold text-slate-900 block">Strict Prohibitions:</span>
                  <ul className="space-y-1 text-slate-700 pl-2">
                    <li>• You must not share your login credentials with another person;</li>
                    <li>• You must not allow another person to access your purchased course;</li>
                    <li>• You must not transfer your account to another person;</li>
                    <li>• You must not sell or otherwise transfer course access;</li>
                    <li>• You must not attempt to gain unauthorised access to another user's account.</li>
                  </ul>
                </div>
                <p className="text-xs text-slate-500 pt-1">
                  Any suspected unauthorised use should be reported immediately to the LMS administrator.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 4. Course Registration */}
              <section id="sec-4" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>4. Course Registration</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Course registration is confirmed following successful completion of the registration process and, where applicable, successful payment.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The student is responsible for reviewing the course description, eligibility requirements, duration, access conditions, assessment requirements, and fee before completing registration.
                </p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  Once registration and payment have been completed, the registration is considered final.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 5. Payment */}
              <section id="sec-5" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>5. Payment</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Course fees will be displayed on the LMS or relevant course registration page before payment. Payments may be processed through third-party payment providers, including Stripe.
                </p>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">By making a payment, you confirm that:</p>
                <ul className="space-y-1.5 pl-2 font-medium text-slate-700 text-xs sm:text-sm">
                  <li className="flex items-center gap-2">• The information provided is accurate;</li>
                  <li className="flex items-center gap-2">• You are authorised to use the selected payment method;</li>
                  <li className="flex items-center gap-2">• You agree to pay the displayed course fee;</li>
                  <li className="flex items-center gap-2">• You have reviewed and accepted the applicable Terms & Conditions; and</li>
                  <li className="flex items-center gap-2">• You understand the applicable Refund & Cancellation Policy.</li>
                </ul>
                <p className="text-xs text-slate-500 pt-1">
                  Applicable taxes, including GST or other legally applicable taxes, may be included in or added to the displayed course fee.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 6. No Cancellation and No Refund Policy */}
              <section id="sec-6" className="space-y-3">
                <div className="p-5 sm:p-6 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-3">
                  <h3 className="text-base sm:text-xl font-black text-amber-950 flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-amber-700 shrink-0" />
                    <span>6. No Cancellation and No Refund Policy</span>
                  </h3>
                  <p className="font-extrabold text-slate-900 text-xs sm:text-sm">
                    All course registrations are final. Once registration and payment have been successfully completed, the student cannot cancel the registration and the course fee is non-refundable.
                  </p>
                  <p className="text-xs sm:text-sm font-semibold text-slate-800 pt-1">
                    No refund will normally be provided if the student:
                  </p>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 text-xs sm:text-sm text-slate-800 font-medium">
                    <li>• Changes their mind after registration;</li>
                    <li>• Decides not to participate;</li>
                    <li>• Does not access the course;</li>
                    <li>• Accesses only part of the course;</li>
                    <li>• Fails to complete the course;</li>
                    <li>• Fails to complete an assessment;</li>
                    <li>• Does not attend a scheduled session;</li>
                    <li>• Is unable to participate due to personal circumstances;</li>
                    <li>• Is unable to participate due to professional commitments; or</li>
                    <li>• Does not complete the programme within the access period.</li>
                  </ul>
                  <p className="text-xs text-slate-600 pt-3 border-t border-amber-200/80">
                    The Refund & Cancellation Policy published on the LMS forms part of these Terms & Conditions. This policy does not exclude any refund or consumer rights that cannot legally be excluded under applicable law.
                  </p>
                </div>
              </section>

              <hr className="border-slate-200/80" />

              {/* 7. Course Access */}
              <section id="sec-7" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>7. Course Access</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Course access will be provided through the LMS after successful registration and payment, subject to the applicable course terms. Access may be provided for a specified period depending on the course.
                </p>
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  We may suspend or terminate access in cases involving:
                </p>
                <ul className="space-y-1 pl-2 text-xs sm:text-sm text-slate-700">
                  <li>• Account sharing;</li>
                  <li>• Fraudulent activity;</li>
                  <li>• Unauthorised distribution of course content;</li>
                  <li>• Copyright infringement;</li>
                  <li>• Misuse of the LMS;</li>
                  <li>• Attempts to compromise LMS security; or</li>
                  <li>• Violation of these Terms & Conditions.</li>
                </ul>
              </section>

              <hr className="border-slate-200/80" />

              {/* 8. Course Materials */}
              <section id="sec-8" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>8. Course Materials</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">Course materials may include:</p>
                <ul className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 pl-2 text-xs sm:text-sm text-slate-800 font-medium">
                  <li>• Videos</li>
                  <li>• Presentations</li>
                  <li>• Documents</li>
                  <li>• Images</li>
                  <li>• Case studies</li>
                  <li>• Educational datasets</li>
                  <li>• Assessments & Quizzes</li>
                  <li>• Reading materials</li>
                  <li>• Software demonstrations</li>
                </ul>
                <p className="text-xs text-slate-600 pt-1 leading-relaxed">
                  Course materials are provided for educational and professional development purposes. Students must not reproduce, distribute, publish, sell, upload, modify, commercially exploit, or otherwise redistribute course materials without prior written permission.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 9. Intellectual Property */}
              <section id="sec-9" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>9. Intellectual Property</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Unless otherwise stated, all intellectual property associated with the LMS and its educational content belongs to or is licensed to Virtual Autopsy Global Academy or the relevant content owner. This includes course content, text, graphics, videos, presentations, logos, trademarks, software, LMS design, educational resources, and original datasets.
                </p>
                <p className="font-bold text-slate-900 text-xs sm:text-sm">
                  Course registration does not transfer ownership or intellectual property rights to the student.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 10. Assessments and Examinations */}
              <section id="sec-10" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>10. Assessments and Examinations</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Some courses may include online assessments, quizzes, examinations, assignments, practical assessments, attendance requirements, or evaluation procedures.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Students must comply with the assessment requirements specified for their course. Academic dishonesty, impersonation, copying, or unauthorised assistance may result in cancellation of assessment results and/or suspension of LMS access.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 11. Certification */}
              <section id="sec-11" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>11. Certification</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where a course includes certification, certificates will be issued only after the student satisfies the applicable requirements. Course registration alone does not necessarily guarantee certification.
                </p>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Certification requirements may include successful completion of course modules, attendance, assessments, examinations, or assignments. The name and details printed on a certificate will generally be based on information supplied during registration.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 12. Student Responsibilities */}
              <section id="sec-12" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <UserCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>12. Student Responsibilities</span>
                </h3>
                <p className="font-semibold text-slate-800 text-xs sm:text-sm">Students agree to:</p>
                <ul className="space-y-1.5 pl-2 text-xs sm:text-sm text-slate-700 font-medium">
                  <li>• Provide accurate registration information;</li>
                  <li>• Maintain account confidentiality;</li>
                  <li>• Use the LMS lawfully;</li>
                  <li>• Follow course instructions & complete assessments honestly;</li>
                  <li>• Respect intellectual property rights & not share course access;</li>
                  <li>• Not distribute course materials or attempt to compromise LMS security;</li>
                  <li>• Not introduce malicious software or code.</li>
                </ul>
              </section>

              <hr className="border-slate-200/80" />

              {/* 13. Professional and Educational Disclaimer */}
              <section id="sec-13" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>13. Professional and Educational Disclaimer</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The educational content provided through the LMS is intended for education and professional development. Information provided should not be treated as a substitute for professional judgment, applicable laws and regulations, institutional policies, professional standards, clinical guidance, forensic protocols, or independent expert assessment.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 14. LMS Availability */}
              <section id="sec-14" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>14. LMS Availability</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We endeavour to maintain the availability and functionality of the LMS. Temporary interruptions may occur because of scheduled maintenance, software updates, server issues, internet connectivity problems, or circumstances beyond our control.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 15. Course Changes */}
              <section id="sec-15" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>15. Course Changes</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We may reasonably update or modify course content, instructors, schedules, learning materials, assessments, delivery methods, or technical features of the LMS. Where a significant change affects a scheduled programme, reasonable efforts will be made to communicate the change.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 16. Third-Party Services */}
              <section id="sec-16" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>16. Third-Party Services</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  The LMS may use third-party services including payment processors, hosting providers, email services, video platforms, analytics services, and security providers. Use of such services may be subject to third-party privacy policies.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 17. Payment Security */}
              <section id="sec-17" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>17. Payment Security</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Where payments are processed through Stripe or another authorised payment provider, payment processing occurs through that provider's secure infrastructure. The LMS does not store complete payment card details.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 18. Account Suspension or Termination */}
              <section id="sec-18" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>18. Account Suspension or Termination</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We may suspend or terminate LMS access where we reasonably believe that a student has violated these Terms, engaged in fraudulent activity, shared credentials, or distributed materials without authorisation.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 19. Limitation of Liability */}
              <section id="sec-19" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>19. Limitation of Liability</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  To the extent permitted by applicable law, we shall not be liable for indirect, incidental, consequential, or unforeseeable losses arising from use of the LMS or temporary inability to access the platform.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 20. Privacy */}
              <section id="sec-20" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>20. Privacy</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Personal information collected through the LMS is handled in accordance with our <Link to="/privacy-policy" className="text-amber-700 font-bold hover:underline">Privacy Policy</Link>.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 21. Changes to These Terms */}
              <section id="sec-21" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>21. Changes to These Terms</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  We may update these Terms & Conditions from time to time. The latest version will be published on the LMS website with the applicable effective date.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 22. Governing Law */}
              <section id="sec-22" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Scale className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>22. Governing Law</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  These Terms & Conditions shall be governed by the applicable laws of India. Subject to applicable law, disputes shall be subject to the jurisdiction of the appropriate courts in India.
                </p>
              </section>

              <hr className="border-slate-200/80" />

              {/* 23. Contact */}
              <section id="sec-23" className="space-y-3">
                <h3 className="text-base sm:text-xl font-black text-[#0A192F] flex items-center gap-2">
                  <Mail className="w-5 h-5 text-amber-600 shrink-0" />
                  <span>23. Contact</span>
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  For questions regarding these Terms & Conditions, course access, registration, payments, or student accounts:
                </p>
                <div className="p-4 bg-white border border-slate-200/80 rounded-2xl space-y-1 font-mono text-xs shadow-2xs">
                  <strong className="text-[#0A192F] block">Virtual Autopsy Global Academy</strong>
                  <p className="text-slate-600">Email: <a href="mailto:training@virtualautopsyuk.com" className="text-amber-700 font-bold hover:underline">training@virtualautopsyuk.com</a></p>
                  <p className="text-slate-500 pt-2 text-[11px]">Last Updated: 28 September 2026</p>
                </div>
              </section>

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
                      className={`w-full text-left px-2.5 py-2 rounded-lg transition-colors flex items-center justify-between cursor-pointer ${activeSection === sec.id
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
                  Have questions about our terms or course access?
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
