import React from 'react';
import { Header } from '../components/common/Header';
import { LeftShowcasePanel } from '../components/showcase/LeftShowcasePanel';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { PartnerFooter } from '../components/showcase/PartnerFooter';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans overflow-x-hidden">
      <div>
        {/* Fixed Glassmorphism Navigation Header */}
        <Header page="login" />

        {/* Main Content Area */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Common Master Left Showcase Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <LeftShowcasePanel />
            </div>

            {/* Right Forgot Password Form Card (Aligned top and bottom with Left panel) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <ForgotPasswordForm />
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <PartnerFooter />
    </div>
  );
};
