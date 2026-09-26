import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Shield,
  ShieldCheck,
  Save,
  CheckCircle2,
  Lock,
  Camera,
  MapPin,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { MOCK_ADMIN } from '../../types/admin';

export const AdminProfilePage: React.FC = () => {
  const [name, setName] = useState(MOCK_ADMIN.name);
  const [email, setEmail] = useState(MOCK_ADMIN.email);
  const [institution, setInstitution] = useState('Virtual Autopsy Training Platform');
  const [location, setLocation] = useState('Global Administrator');
  const [bio, setBio] = useState(
    'Platform Administrator for Virtual Autopsy Global Online Training.'
  );
  const [avatar, setAvatar] = useState(MOCK_ADMIN.avatar);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3500);
  };

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSuccess(true);
    setTimeout(() => {
      setPasswordSuccess(false);
      setShowPasswordModal(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }, 2000);
  };

  return (
    <AdminLayout title="Admin Profile & Security" subtitle="Profile">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Notification Banner */}
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>Admin profile details have been updated successfully!</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">SAVED</span>
          </div>
        )}

        {/* Profile Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-center sm:items-start space-y-4 sm:space-y-0 sm:space-x-6 text-center sm:text-left">
          <div className="relative group shrink-0">
            <img
              src={avatar}
              alt={name}
              className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400/50 shadow-md"
            />
            <button
              title="Change Profile Photo"
              onClick={() => {
                const newPhoto = prompt('Enter image URL for profile photo:', avatar);
                if (newPhoto) setAvatar(newPhoto);
              }}
              className="absolute bottom-0 right-0 p-2 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full shadow-md transition-transform group-hover:scale-110"
            >
              <Camera className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-2 flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-2xl font-black text-[#0A192F]">{name}</h2>
                <p className="text-xs font-bold text-amber-700 mt-0.5">{MOCK_ADMIN.role}</p>
              </div>
              <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 bg-emerald-100 text-emerald-800 font-bold rounded-full self-center sm:self-auto">
                <ShieldCheck className="w-3.5 h-3.5 mr-1" />
                Super Admin Authorized
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-xl">{bio}</p>
          </div>
        </div>

        {/* Editable Form & Security Settings Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editable Credentials Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSaveProfile} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <h3 className="font-extrabold text-base text-[#0A192F] pb-2 border-b border-slate-100 flex items-center space-x-2">
                <User className="w-4.5 h-4.5 text-amber-600" />
                <span>Editable Administrative Details</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Admin Email Address</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Institution / Organization</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">Location / Country</label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold text-slate-800"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Administrative Summary Bio</label>
                <div className="relative">
                  <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <textarea
                    rows={3}
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none text-slate-800 leading-relaxed"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Profile Changes</span>
                </button>
              </div>
            </form>
          </div>

          {/* Security & Access Sidebar */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
              <h3 className="font-extrabold text-sm text-[#0A192F] flex items-center space-x-2">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Security & Credentials</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-emerald-900">2FA Hardware Shield</p>
                    <p className="text-[10px] text-emerald-700">YubiKey Security Active</p>
                  </div>
                  <span className="text-[10px] bg-emerald-600 text-white font-bold px-2 py-0.5 rounded-full">ACTIVE</span>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">Password Authentication</p>
                    <p className="text-[10px] text-slate-500">Last updated 30 days ago</p>
                  </div>
                  <button
                    onClick={() => setShowPasswordModal(true)}
                    className="px-3 py-1.5 bg-slate-950 text-amber-400 font-bold rounded-xl text-[10px] hover:bg-slate-800 transition-colors"
                  >
                    Change
                  </button>
                </div>

                <div className="p-3.5 bg-slate-50 rounded-2xl space-y-1">
                  <span className="font-bold text-slate-400 uppercase text-[10px]">CLEARANCE AUTHORITY</span>
                  <p className="font-bold text-amber-800">Level 5 — Super Administrator</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-[#0A192F]">Update Password</h3>
                <p className="text-xs text-slate-500">Set a strong multi-character admin password</p>
              </div>
            </div>

            {passwordSuccess ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-xs font-bold text-emerald-900">Password updated successfully!</p>
              </div>
            ) : (
              <form onSubmit={handlePasswordUpdate} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Current Password</label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">New Password</label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Confirm New Password</label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-amber-500/50 focus:outline-none"
                  />
                </div>

                <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowPasswordModal(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-xs"
                  >
                    Save Password
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
