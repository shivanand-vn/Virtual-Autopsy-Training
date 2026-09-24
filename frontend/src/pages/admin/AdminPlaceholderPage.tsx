import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { ShieldAlert } from 'lucide-react';

interface AdminPlaceholderPageProps {
  title: string;
  subtitle: string;
}

export const AdminPlaceholderPage: React.FC<AdminPlaceholderPageProps> = ({
  title,
  subtitle,
}) => {
  return (
    <AdminLayout title={title} subtitle={subtitle}>
      <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
        <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <h2 className="text-xl font-extrabold text-[#0A192F]">
          {title} Management
        </h2>

        <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
          The {title} section is configured and ready for expansion.
        </p>
      </div>
    </AdminLayout>
  );
};
