import React, { useState } from 'react';
import { Bell, ChevronDown, Activity, ShieldCheck, Search, Menu } from 'lucide-react';
import { MOCK_STUDENT } from '../../types/dashboard';

interface DashboardHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  onMenuToggle,
  title,
  subtitle = MOCK_STUDENT.cohort
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
          {title ? (
            <h1 className="text-lg font-bold text-[#0A192F]">{title}</h1>
          ) : (
            <div className="flex items-center space-x-2 text-xs sm:text-sm font-medium text-slate-500">
              <span className="font-semibold text-[#0A192F]">ACADEMY</span>
              <span>/</span>
              <span>STUDENT PORTAL</span>
            </div>
          )}
          <p className="text-xs text-slate-500 hidden sm:block truncate max-w-md">
            {subtitle}
          </p>
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
            <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-[#0A192F]">Notifications</span>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  2 Unread
                </span>
              </div>
              <div className="space-y-3 mt-3">
                <div className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/50">
                  <p className="text-xs font-bold text-slate-800">Module 03 Assessment Reminder</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Clinical Case Practical #VA-9428 is due in 3 days.</p>
                  <span className="text-[10px] text-amber-700 font-medium">10 mins ago</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <p className="text-xs font-bold text-slate-800">Module 02 Graded</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">Score: 92/100 (Grade A Excellence)</p>
                  <span className="text-[10px] text-slate-400">Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#0A192F] leading-tight">
                {MOCK_STUDENT.name}
              </div>
              <div className="text-[10px] text-slate-500 leading-tight">
                {MOCK_STUDENT.title}
              </div>
            </div>
            <img
              src={MOCK_STUDENT.avatar}
              alt={MOCK_STUDENT.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </button>
        </div>
      </div>
    </header>
  );
};
