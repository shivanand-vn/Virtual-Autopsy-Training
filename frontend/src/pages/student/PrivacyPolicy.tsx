import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, CheckCircle, FileText, Lock, Mail, Server, ArrowLeft } from 'lucide-react';
import { Header } from '../../components/common/Header';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans overflow-x-hidden">
      <div>
        {/* Navigation Header */}
        <Header page="register" />

        {/* Main Content Container */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12 sm:pt-28 sm:pb-16">
          
          {/* Top Navigation & Title Bar */}
          <div className="mb-6 space-y-3">
            <Link
              to="/register"
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-700 hover:text-amber-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Registration</span>
            </Link>

            <div className="flex items-center space-x-3.5">
              <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
                <Shield className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  LEGAL & DATA PROTECTION
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-navy-950 mt-1 tracking-tight">
                  Privacy Policy
                </h1>
              </div>
            </div>
          </div>

          {/* Policy Document Card */}
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-10 space-y-8 text-sm text-slate-600 leading-relaxed">
            
            {/* Notice Callout */}
            <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl text-amber-950">
              <p className="font-bold text-slate-900">Your privacy is important to us.</p>
              <p className="text-xs text-slate-700 mt-1">
                To register for the Virtual Autopsy online training course, we need to collect certain personal information.
              </p>
            </div>

            {/* Section 1: Information We Collect */}
            <div className="space-y-3">
              <h2 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-600" />
                <span>1. Information We Collect</span>
              </h2>
              <p className="text-slate-600">We may collect and process the following personal information:</p>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 pl-2 font-medium text-slate-800 text-xs sm:text-sm">
                <li className="flex items-center gap-2">• Full Name</li>
                <li className="flex items-center gap-2">• Email Address</li>
                <li className="flex items-center gap-2">• Qualification</li>
                <li className="flex items-center gap-2">• Organization / Institution</li>
                <li className="flex items-center gap-2">• Mobile Number</li>
                <li className="flex items-center gap-2">• CV / Uploaded Documents</li>
                <li className="flex items-center gap-2">• Payment-related Enrollment Data</li>
              </ul>
            </div>

            {/* Section 2: How We Use Your Information */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-amber-600" />
                <span>2. How We Use Your Information</span>
              </h2>
              <p className="text-slate-600">Your information may be used for:</p>
              <ul className="space-y-2 pl-2 font-medium text-slate-800 text-xs sm:text-sm">
                <li className="flex items-center gap-2">• Course registration and eligibility assessment</li>
                <li className="flex items-center gap-2">• Processing your enrollment payment</li>
                <li className="flex items-center gap-2">• Providing secure access to the Virtual Autopsy training platform</li>
                <li className="flex items-center gap-2">• Sending payment confirmation and initial login credentials</li>
                <li className="flex items-center gap-2">• Course-related communication and module updates</li>
                <li className="flex items-center gap-2">• Practical assessments and CME accreditation certification</li>
                <li className="flex items-center gap-2">• Providing technical support related to your training</li>
              </ul>
            </div>

            {/* Section 3: Payment Information */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                <Lock className="w-5 h-5 text-amber-600" />
                <span>3. Payment Information</span>
              </h2>
              <p className="text-slate-600">
                Payments are processed securely through our payment provider (Stripe). The Virtual Autopsy LMS does not store complete credit or debit card details on its servers.
              </p>
            </div>

            {/* Section 4: Data Protection */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                <Server className="w-5 h-5 text-amber-600" />
                <span>4. Data Protection</span>
              </h2>
              <p className="text-slate-600">
                Personal information is handled securely using industry-standard technical measures and used strictly for legitimate course, account, payment, communication, and certification purposes.
              </p>
            </div>

            {/* Section 5: Contact */}
            <div className="space-y-3 pt-6 border-t border-slate-100">
              <h2 className="font-extrabold text-base text-navy-950 flex items-center gap-2">
                <Mail className="w-5 h-5 text-amber-600" />
                <span>5. Contact & Inquiries</span>
              </h2>
              <p className="text-slate-600">
                If you have any questions regarding your personal data or training enrollment, please contact our support team at <strong className="text-navy-950 font-mono">info@virtualautopsyuk.com</strong>.
              </p>
            </div>

            {/* Bottom Footer Actions */}
            <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
              <Link
                to="/register"
                className="px-6 py-2.5 bg-navy-950 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-xs transition-colors inline-flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Registration</span>
              </Link>
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <PartnerFooter />
    </div>
  );
};
