import React, { useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Settings, Shield, Bell, Database, Save, CheckCircle2 } from 'lucide-react';

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState('Virtual Autopsy Global Training');
  const [contactEmail, setContactEmail] = useState('support@virtualautopsy.edu');
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <AdminLayout title="Platform Settings & System Configuration" subtitle="Settings">
      <div className="max-w-4xl mx-auto space-y-6 pb-16">
        {savedSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs font-bold text-emerald-800 flex items-center justify-between shadow-xs animate-in fade-in duration-200">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>System settings updated successfully!</span>
            </div>
            <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2.5 py-0.5 rounded-full font-bold">SAVED</span>
          </div>
        )}

        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center font-bold">
              <Settings className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#0A192F]">General Platform Settings</h2>
              <p className="text-xs text-slate-500">Configure core LMS system parameters</p>
            </div>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">LMS Platform Name</label>
                <input
                  type="text"
                  value={platformName}
                  onChange={(e) => setPlatformName(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-bold text-slate-800"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Support Contact Email</label>
                <input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500/50 focus:outline-none font-mono font-bold text-slate-800"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 flex justify-end">
              <button
                type="submit"
                className="inline-flex items-center space-x-2 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Save Configuration</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
};
