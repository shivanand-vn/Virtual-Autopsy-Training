import React from 'react';
import { Award, Hammer, Construction, ShieldAlert } from 'lucide-react';
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

        {/* Minimal Under Development Placeholder Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
          <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <Award className="w-8 h-8" />
          </div>

          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full uppercase tracking-wider">
            Under Development
          </span>

          <h2 className="text-xl font-extrabold text-[#0A192F]">
            Certification Module
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            The Certification and CME Accreditation section is currently under development. Official certificates and accreditation verification will be issued upon completing all course requirements once released.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};
