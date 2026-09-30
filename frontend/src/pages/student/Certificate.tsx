import React from 'react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { CertificateCard } from '../../components/certificate/CertificateCard';

export const CertificatePage: React.FC = () => {
  return (
    <DashboardLayout headerTitle="Accreditation & Certificate" headerSubtitle="CERTIFICATE">
      <div className="max-w-4xl mx-auto space-y-6">
        <CertificateCard />
      </div>
    </DashboardLayout>
  );
};
