import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  BookOpen,
  HelpCircle,
  ClipboardList,
  GraduationCap,
  CreditCard,
  Award,
  BarChart3,
  MessageSquare,
  LifeBuoy,
  Settings,
  LogOut,
  X,
  FileQuestion
} from 'lucide-react';

import { useDiscussions } from '../../context/DiscussionsContext';

interface AdminSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isOpen = true, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { discussions } = useDiscussions();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // EXACT ADMIN NAVIGATION ORDER FROM REQUIREMENTS:
  // 1. Dashboard
  // 2. Users
  // 3. Courses
  // 4. Question Bank (NEW)
  // 5. Assignments
  // 6. Exams
  // 7. Payments
  // 8. Certificates
  // 9. Discussions
  // 10. Analytics
  const adminNav = [
    { name: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Users', path: '/admin/users', icon: Users },
    { name: 'Courses', path: '/admin/courses', icon: BookOpen },
    { name: 'Question Bank', path: '/admin/question-bank', icon: FileQuestion, isNew: true },
    { name: 'Assignments', path: '/admin/assignments', icon: ClipboardList },
    { name: 'Exams', path: '/admin/exams', icon: GraduationCap },
    { name: 'Payments', path: '/admin/payments', icon: CreditCard },
    { name: 'Certificates', path: '/admin/certificates', icon: Award },
    { name: 'Discussions', path: '/admin/discussions', icon: MessageSquare, badge: discussions.length > 0 ? String(discussions.length) : undefined },
    { name: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
  ];

  const accountNav = [
    { name: 'Support', path: '/admin/support', icon: LifeBuoy },
    { name: 'Settings', path: '/admin/settings', icon: Settings },
  ];

  const confirmLogout = () => {
    setShowLogoutModal(false);
    navigate('/login');
  };

  const isQuestionBankActive = location.pathname.startsWith('/admin/question-bank');

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
            <NavLink to="/admin/dashboard" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
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

          {/* System Administration Navigation */}
          <div className="px-4 py-5">
            <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              System Administration
            </div>
            <nav className="space-y-1">
              {adminNav.map((item) => {
                const Icon = item.icon;
                const isActive = item.path === '/admin/question-bank'
                  ? isQuestionBankActive
                  : location.pathname === item.path;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {item.isNew && !isActive && (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                          NEW
                        </span>
                      )}
                      {item.badge && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                            isActive
                              ? 'bg-slate-950 text-amber-400'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.badge}
                        </span>
                      )}
                    </div>
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Settings & Support Navigation */}
          <div className="px-4 py-2">
            <div className="px-3 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              Control & Support
            </div>
            <nav className="space-y-1">
              {accountNav.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;

                return (
                  <NavLink
                    key={item.name}
                    to={item.path}
                    onClick={onClose}
                    className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-150 ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm shadow-amber-500/20'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                    <span>{item.name}</span>
                  </NavLink>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Dedicated Admin Logout Button */}
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
                Are you sure you want to exit the System Administration Panel?
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
