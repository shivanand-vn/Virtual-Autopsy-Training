import React from 'react';
import { Award, Lock } from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminCertificatesPage: React.FC = () => {
  return (
    <AdminLayout title="Fellowship Certificates & Accreditation" subtitle="Certificates">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
          <div className="w-16 h-16 bg-slate-100 border border-slate-300 text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <Award className="w-8 h-8 text-slate-400" />
          </div>

          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full uppercase tracking-wider">
            Issuance Log
          </span>

          <h2 className="text-xl font-extrabold text-[#0A192F]">
            Certificates & Accreditation Management
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            No certificates issued yet. Certificates are issued automatically once students complete all course modules and pass required assessments.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};
