import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  MessageSquare,
  User,
  HelpCircle,
  LogOut,
  X
} from 'lucide-react';

import { useDiscussions } from '../../context/DiscussionsContext';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { discussions } = useDiscussions();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // EXACT MENU ITEMS IN REQUIRED ORDER:
  // 1. Dashboard
  // 2. My Course
  // 3. Final Exam
  // 4. Certificate
  // 5. Discussions
  // 6. Profile
  // 7. Help & Support
  // 8. Logout
  const studentNavItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'My Course', path: '/my-course', altPaths: ['/course'], icon: BookOpen },
    { name: 'Final Exam', path: '/final-exam', altPaths: ['/exam'], icon: GraduationCap, badge: '60 Qs' },
    { name: 'Certificate', path: '/certificate', icon: Award },
    { name: 'Discussions', path: '/discussions', icon: MessageSquare, badge: discussions.length > 0 ? String(discussions.length) : undefined },
    { name: 'Profile', path: '/profile', icon: User },
    { name: 'Help & Support', path: '/help-support', altPaths: ['/support'], icon: HelpCircle },
  ];

  const isRouteActive = (itemPath: string, altPaths?: string[]) => {
    const current = location.pathname;
    if (current === itemPath || current.startsWith(`${itemPath}/`)) return true;
    if (altPaths) {
      return altPaths.some((alt) => current === alt || current.startsWith(`${alt}/`));
    }
    return false;
  };

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  return (
    <>
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-72 bg-white border-r border-slate-200 transition-transform duration-300 ease-in-out flex flex-col justify-between overflow-y-auto ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div>
          {/* Logo Header */}
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <NavLink to="/dashboard" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
              <img
                src="/logo.png"
                alt="Virtual Autopsy Global Solutions"
                className="h-14 sm:h-16 w-auto object-contain py-0.5"
              />
            </NavLink>
            {onClose && (
              <button
                onClick={onClose}
                className="md:hidden text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Student LMS Navigation */}
          <div className="px-4 py-6 space-y-1.5">
            <div className="px-3 mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Student Navigation
            </div>
            <nav className="space-y-1.5">
              {studentNavItems.map((item) => {
                const Icon = item.icon;
                const active = isRouteActive(item.path, item.altPaths);

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      active
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${active ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span
                        className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          active
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-amber-100 text-amber-900'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* 8. Dedicated Logout Button at bottom */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50">
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center space-x-2 bg-white hover:bg-rose-50 text-slate-700 hover:text-rose-600 border border-slate-200 hover:border-rose-200 p-3 rounded-2xl font-bold text-sm transition-all shadow-xs group cursor-pointer"
          >
            <LogOut className="w-4 h-4 text-slate-400 group-hover:text-rose-600 transition-colors" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Card Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-5 text-center transform transition-all scale-100">
            <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <LogOut className="w-7 h-7 ml-0.5" />
            </div>

            <div className="space-y-1">
              <h3 className="text-xl font-extrabold text-[#0A192F]">Confirm Logout</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to end your Virtual Autopsy LMS session? You will be redirected to the sign in portal.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowLogoutModal(false)}
                className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 py-3 rounded-xl shadow-md transition-colors cursor-pointer"
              >
                Yes, Log Out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
