import React from 'react';
import { Shield, X, CheckCircle, FileText, Lock, Mail, Server } from 'lucide-react';
import { PrimaryButton } from '../common/PrimaryButton';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full max-h-[85vh] flex flex-col justify-between overflow-hidden text-left transform transition-all scale-100">
        
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-100 flex items-start justify-between shrink-0 bg-slate-50/50">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center shrink-0 shadow-xs">
              <Shield className="w-6 h-6 text-amber-700" />
            </div>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                LEGAL & DATA PROTECTION
              </span>
              <h2 className="text-xl font-black text-navy-950 mt-1 tracking-tight">Privacy Policy</h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-navy-950 rounded-full hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs text-slate-600 leading-relaxed custom-scrollbar flex-1">
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl text-amber-950">
            <p className="font-bold text-slate-900">Your privacy is important to us.</p>
            <p className="text-[11px] text-slate-700 mt-0.5">
              To register for the Virtual Autopsy online training course, we need to collect certain personal information.
            </p>
          </div>

          {/* Section 1: Information We Collect */}
          <div className="space-y-2">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <FileText className="w-4 h-4 text-amber-600" />
              <span>1. Information We Collect</span>
            </h3>
            <p className="text-slate-600">We may collect and process the following personal information:</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 pl-2 font-medium text-slate-800">
              <li className="flex items-center gap-1.5">• Full Name</li>
              <li className="flex items-center gap-1.5">• Professional Role</li>
              <li className="flex items-center gap-1.5">• Email Address</li>
              <li className="flex items-center gap-1.5">• Organization / Institution</li>
              <li className="flex items-center gap-1.5">• Mobile Number</li>
              <li className="flex items-center gap-1.5">• CV / Uploaded Documents</li>
              <li className="flex items-center gap-1.5">• Medical Qualification</li>
              <li className="flex items-center gap-1.5">• Payment-related Enrollment Data</li>
            </ul>
          </div>

          {/* Section 2: How We Use Your Information */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-amber-600" />
              <span>2. How We Use Your Information</span>
            </h3>
            <p className="text-slate-600">Your information may be used for:</p>
            <ul className="space-y-1.5 pl-2 font-medium text-slate-800">
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
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>3. Payment Information</span>
            </h3>
            <p className="text-slate-600">
              Payments are processed securely through our payment provider (Stripe). The Virtual Autopsy LMS does not store complete credit or debit card details on its servers.
            </p>
          </div>

          {/* Section 4: Data Protection */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <Server className="w-4 h-4 text-amber-600" />
              <span>4. Data Protection</span>
            </h3>
            <p className="text-slate-600">
              Personal information is handled securely using industry-standard technical measures and used strictly for legitimate course, account, payment, communication, and certification purposes.
            </p>
          </div>

          {/* Section 5: Contact */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="font-extrabold text-sm text-navy-950 flex items-center gap-2">
              <Mail className="w-4 h-4 text-amber-600" />
              <span>5. Contact & Inquiries</span>
            </h3>
            <p className="text-slate-600">
              If you have any questions regarding your personal data or training enrollment, please contact our support team at <strong className="text-navy-950 font-mono">support@virtualautopsy.edu</strong>.
            </p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-slate-50/50 flex items-center justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 bg-navy-950 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs shadow-xs transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
};
