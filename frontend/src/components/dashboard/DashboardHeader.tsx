import React, { useState } from 'react';
import { Bell, ChevronDown, Menu } from 'lucide-react';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuToggle,
  title,
  subtitle
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { registrationData } = useRegistrationFlow();

  const studentName = registrationData.fullName || 'Student';
  const studentTitle = registrationData.professionalRole || 'Fellow Practitioner';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-3">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <div className="flex items-center space-x-2 text-xs sm:text-sm font-semibold text-slate-500">
            <span className="font-semibold text-[#0A192F]">ACADEMY</span>
            <span>/</span>
            <span>STUDENT PORTAL</span>
            {subtitle && (
              <>
                <span>/</span>
                <span className="text-amber-700 font-bold uppercase">{subtitle}</span>
              </>
            )}
          </div>
          {title && (
            <h1 className="text-lg font-extrabold text-[#0A192F] mt-0.5">{title}</h1>
          )}
        </div>
      </div>

      <div className="flex items-center space-x-3 sm:space-x-5">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-slate-500 hover:text-[#0A192F] hover:bg-slate-100 rounded-xl transition-colors"
          >
            <Bell className="w-5 h-5" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-[#0A192F]">Notifications</span>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  0 Unread
                </span>
              </div>
              <div className="p-6 text-center text-slate-400 text-xs">
                <p className="font-semibold">No new notifications.</p>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <div className="flex items-center space-x-3 p-1.5 pl-2.5 bg-slate-50 border border-slate-200/80 rounded-full">
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#0A192F] leading-tight">
                {studentName}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {studentTitle}
              </div>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
              {studentName.charAt(0).toUpperCase()}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
