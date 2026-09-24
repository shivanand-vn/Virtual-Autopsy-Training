import React from 'react';
import { Award } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const CertificatePage: React.FC = () => {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Simple Page Header */}
        <div>
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
            <span>ACADEMY</span>
            <span>/</span>
            <span>STUDENT PORTAL</span>
            <span>/</span>
            <span className="text-amber-700 font-bold">CERTIFICATE</span>
          </div>
          <h1 className="text-2xl font-extrabold text-[#0A192F]">
            Accreditation & Certificate
          </h1>
        </div>

        {/* Clean Minimal Placeholder Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
          <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-[#0A192F]">
            Certificate & Accreditation
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Official certificate and accreditation details will be issued upon completing all course modules and final competency requirements.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
