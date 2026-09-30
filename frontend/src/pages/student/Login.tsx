import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { LeftShowcasePanel } from '../../components/showcase/LeftShowcasePanel';
import { FlippableAuthContainer } from '../../components/auth/FlippableAuthContainer';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken, getStoredUser } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const activeUser = user || getStoredUser();
    const activeToken = token || getAuthToken();

    if (activeUser && activeToken) {
      if (activeUser.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [user, token, navigate]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between font-sans overflow-x-hidden">
      <div>
        {/* Navigation Header */}
        <Header page="login" />

        {/* Main Content Area (Offset for fixed glassmorphism header) */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-8 sm:pt-28 sm:pb-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            
            {/* Common Master Left Showcase Panel */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <LeftShowcasePanel />
            </div>

            {/* Right Flippable Form Card Section (Stretch height to match Left panel exactly) */}
            <div className="lg:col-span-6 flex flex-col justify-between">
              <FlippableAuthContainer />
            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <PartnerFooter />
    </div>
  );
};
