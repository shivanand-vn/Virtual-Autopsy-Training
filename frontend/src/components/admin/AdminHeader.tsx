import React, { useState } from 'react';
import { Bell, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AdminHeaderProps {
  onMenuToggle?: () => void;
  title?: string;
  subtitle?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  onMenuToggle,
  title = 'Admin Dashboard',
  subtitle = 'Dashboard'
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const { user } = useAuth();

  const adminName = user?.fullName || 'System Administrator';
  const adminInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'SA';

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-xs">
      <div className="flex items-center space-x-2.5 sm:space-x-3 min-w-0 flex-1 mr-2 sm:mr-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden text-slate-500 hover:text-slate-800 p-2 rounded-lg hover:bg-slate-100"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <div className="flex items-center space-x-1.5 text-[11px] sm:text-xs font-semibold text-slate-500 min-w-0">
            <span className="font-semibold text-[#0A192F] shrink-0">ADMIN</span>
            <span className="shrink-0">/</span>
            <span className="text-amber-700 font-bold truncate max-w-[160px] sm:max-w-xs md:max-w-md lg:max-w-none">{subtitle}</span>
          </div>
          <h1 className="text-base sm:text-lg font-bold text-[#0A192F] truncate">{title}</h1>
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
                <span className="font-bold text-sm text-[#0A192F]">Admin Alerts</span>
                <span className="text-[11px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
                  0 Alerts
                </span>
              </div>
              <div className="p-6 text-center text-slate-400 text-xs">
                <p className="font-semibold">No admin alerts at this time.</p>
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Info Pill */}
        <div className="flex items-center space-x-3 p-1.5 pl-3.5 bg-slate-50 border border-slate-200/80 rounded-full">
          <span className="text-xs font-bold text-[#0A192F] hidden sm:inline-block">
            {adminName}
          </span>
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={adminName}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/60 shadow-xs shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center shrink-0">
              {adminInitials}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

