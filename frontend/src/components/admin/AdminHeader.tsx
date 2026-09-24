import React, { useState } from 'react';
import { Bell, ChevronDown, Menu, ShieldCheck } from 'lucide-react';
import { MOCK_ADMIN, MOCK_ADMIN_NOTIFICATIONS } from '../../types/admin';

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const unreadCount = MOCK_ADMIN_NOTIFICATIONS.filter((n) => !n.read).length;

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
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span className="font-semibold text-[#0A192F]">ADMIN</span>
            <span>/</span>
            <span className="text-amber-700 font-bold">{subtitle}</span>
          </div>
          <h1 className="text-lg font-bold text-[#0A192F]">{title}</h1>
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
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-amber-500 border-2 border-white rounded-full"></span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="font-bold text-sm text-[#0A192F]">Admin Alerts</span>
                <span className="text-[11px] font-bold bg-amber-100 text-amber-900 px-2 py-0.5 rounded-full">
                  {unreadCount} Action Required
                </span>
              </div>
              <div className="space-y-2.5 mt-3 max-h-80 overflow-y-auto">
                {MOCK_ADMIN_NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3 rounded-xl border transition-colors cursor-pointer ${
                      notif.read ? 'bg-slate-50 border-slate-100' : 'bg-amber-50/60 border-amber-200/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className="text-xs font-bold text-slate-800">{notif.title}</p>
                      <span className="text-[10px] text-slate-400 shrink-0 ml-1">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600 mt-0.5">{notif.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Admin Profile Dropdown Pill */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-3 p-1.5 pl-2.5 bg-slate-50 hover:bg-slate-100 border border-slate-200/80 rounded-full transition-colors"
          >
            <div className="text-right hidden sm:block">
              <div className="text-xs font-bold text-[#0A192F] leading-tight">
                {MOCK_ADMIN.name}
              </div>
              <div className="text-[10px] text-amber-800 font-bold leading-tight">
                {MOCK_ADMIN.role}
              </div>
            </div>
            <img
              src={MOCK_ADMIN.avatar}
              alt={MOCK_ADMIN.name}
              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/50"
            />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 mr-1" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 animate-in fade-in slide-in-from-top-2 text-xs">
              <div className="p-3 border-b border-slate-100">
                <p className="font-bold text-slate-800">{MOCK_ADMIN.name}</p>
                <p className="text-[11px] text-slate-500">{MOCK_ADMIN.email}</p>
              </div>
              <div className="py-1">
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                >
                  System Preferences
                </button>
                <button
                  onClick={() => setShowProfileMenu(false)}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-slate-50 font-medium text-slate-700"
                >
                  Audit Logs
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
