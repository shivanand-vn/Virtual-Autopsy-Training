import React, { useState } from 'react';
import {
  User,
  Mail,
  Building,
  Award,
  Shield,
  Key,
  Bell,
  CheckCircle2,
  Save,
  FileText
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MOCK_STUDENT } from '../types/dashboard';

export const ProfilePage: React.FC = () => {
  const [name, setName] = useState(MOCK_STUDENT.name);
  const [email, setEmail] = useState(MOCK_STUDENT.email);
  const [institution, setInstitution] = useState(MOCK_STUDENT.institution);
  const [license, setLicense] = useState(MOCK_STUDENT.licenseNumber);
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <DashboardLayout headerTitle="Candidate Credentials & Account Profile" headerSubtitle="MY PROFILE">
      <div className="space-y-6">

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Avatar & Summary Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs text-center space-y-4">
              <div className="relative w-24 h-24 mx-auto">
                <img
                  src={MOCK_STUDENT.avatar}
                  alt={MOCK_STUDENT.name}
                  className="w-24 h-24 rounded-full object-cover ring-4 ring-amber-400/50 shadow-md"
                />
                <span className="absolute bottom-1 right-1 w-5 h-5 bg-emerald-500 border-2 border-white rounded-full" />
              </div>

              <div>
                <h2 className="text-lg font-bold text-[#0A192F]">{MOCK_STUDENT.name}</h2>
                <p className="text-xs text-slate-500">{MOCK_STUDENT.title}</p>
                <span className="inline-block bg-amber-100 text-amber-900 text-[10px] font-bold px-2.5 py-0.5 rounded-full mt-2">
                  {MOCK_STUDENT.role}
                </span>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-2 text-xs text-left">
                <div className="flex justify-between">
                  <span className="text-slate-400">Fellowship ID:</span>
                  <span className="font-mono font-bold text-slate-800">{MOCK_STUDENT.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medical License:</span>
                  <span className="font-mono font-bold text-slate-800">{MOCK_STUDENT.licenseNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Accredited CME Pts:</span>
                  <span className="font-bold text-amber-700">{MOCK_STUDENT.cmeCreditsEarned} / {MOCK_STUDENT.cmeCreditsTotal}</span>
                </div>
              </div>
            </div>

            {/* Quick Security Badge */}
            <div className="bg-slate-900 p-5 rounded-3xl text-white space-y-2">
              <div className="flex items-center space-x-2 text-amber-400 font-bold text-xs">
                <Shield className="w-4 h-4" />
                <span>Identity Verification Active</span>
              </div>
              <p className="text-[11px] text-slate-300 leading-relaxed">
                Your medical registration and institutional affiliation are verified against the UK GMC / ISFRI registry.
              </p>
            </div>
          </div>

          {/* Right Column: Editable Information Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <h3 className="font-extrabold text-base text-[#0A192F] pb-2 border-b border-slate-100">
                Personal & Professional Information
              </h3>

              {saved && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Profile credentials updated successfully!</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Professional Email</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Institution / Authority</label>
                  <div className="relative">
                    <Building className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={institution}
                      onChange={(e) => setInstitution(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Medical Registration Number</label>
                  <div className="relative">
                    <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="text"
                      value={license}
                      onChange={(e) => setLicense(e.target.value)}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-400 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  className="inline-flex items-center space-x-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl shadow-xs transition-colors"
                >
                  <Save className="w-4 h-4" />
                  <span>Save Changes</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
