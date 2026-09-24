import React from 'react';
import { Award, ShieldAlert } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminCertificatesPage: React.FC = () => {
  return (
    <AdminLayout title="Fellowship Certificates & Accreditation" subtitle="Certificates">
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
        <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 bg-amber-100 text-amber-900 font-bold text-xs rounded-full uppercase tracking-wider">
          Under Development
        </span>

        <h2 className="text-xl font-extrabold text-[#0A192F]">
          Certificates & Accreditation Management
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          The Certificates & Accreditation administration module is currently under development. Automatic certificate issuance, CME audit logging, and QR verification tools will be available upon feature release.
        </p>
      </div>
    </AdminLayout>
  );
};
