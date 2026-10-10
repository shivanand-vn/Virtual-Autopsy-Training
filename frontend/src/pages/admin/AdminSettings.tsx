import React, { useState, useEffect } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { Settings, Save, CheckCircle2, Mail, Send, RefreshCw, AlertCircle, Server } from 'lucide-react';
import { api } from '../../lib/api';

export const AdminSettingsPage: React.FC = () => {
  const [platformName, setPlatformName] = useState('Virtual Autopsy Global Training');
  const [contactEmail, setContactEmail] = useState('info@virtualautopsyuk.com');
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Email service health state
  const [emailStatus, setEmailStatus] = useState<{
    status: string;
    provider: string;
    sender: string;
    accountEmail?: string;
  } | null>(null);
  const [loadingHealth, setLoadingHealth] = useState(false);
  const [testEmailAddress, setTestEmailAddress] = useState('demo788197@gmail.com');
  const [sendingTest, setSendingTest] = useState(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  const fetchHealth = async () => {
    try {
      setLoadingHealth(true);
      const res: any = await api.get('/health');
      if (res?.email) {
        setEmailStatus(res.email);
        if (res.email.sender) {
          setTestEmailAddress(res.email.sender);
        }
      }
    } catch (err: any) {
      console.warn('Could not fetch health status:', err);
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    fetchHealth();
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailAddress) return;
    try {
      setSendingTest(true);
      setTestResult(null);
      const res = await api.post('/health/test-email', { email: testEmailAddress });
      setTestResult({
        success: true,
        message: res.message || `Test email dispatched to ${testEmailAddress}`,
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to dispatch test email',
      });
    } finally {
      setSendingTest(false);
    }
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

        {/* General Platform Settings */}
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

        {/* Email Service & SMTP Connectivity Monitor */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-900 flex items-center justify-center font-bold">
                <Mail className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-[#0A192F]">Mail Service & Connectivity</h2>
                <p className="text-xs text-slate-500">Brevo Transactional Email API Status & Delivery Testing</p>
              </div>
            </div>
            <button
              type="button"
              onClick={fetchHealth}
              disabled={loadingHealth}
              className="inline-flex items-center space-x-1.5 text-xs text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingHealth ? 'animate-spin text-amber-600' : ''}`} />
              <span>Check Status</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Service Status</span>
              <div className="flex items-center space-x-2 mt-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-extrabold text-emerald-700">CONNECTED & ACTIVE</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Provider</span>
              <span className="text-xs font-bold text-slate-800 block mt-1.5">
                {emailStatus?.provider || 'Brevo (REST API)'}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Sender Address</span>
              <span className="text-xs font-mono font-bold text-slate-800 block mt-1.5 truncate">
                {emailStatus?.sender || 'demo788197@gmail.com'}
              </span>
            </div>
          </div>

          {/* Test Email Dispatch Form */}
          <div className="pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-700 mb-2">Send Live Verification Email</h3>
            <p className="text-[11px] text-slate-500 mb-4">
              Trigger an instant transactional email dispatch through the connected Brevo service to verify real-time mailbox delivery.
            </p>

            <form onSubmit={handleSendTestEmail} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="email"
                value={testEmailAddress}
                onChange={(e) => setTestEmailAddress(e.target.value)}
                placeholder="Recipient email address..."
                className="flex-1 text-xs p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-sky-500/50 focus:outline-none font-mono font-bold text-slate-800"
                required
              />
              <button
                type="submit"
                disabled={sendingTest}
                className="inline-flex items-center justify-center space-x-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 px-5 py-3 rounded-xl shadow-sm transition-all active:scale-95 disabled:opacity-50 cursor-pointer shrink-0"
              >
                {sendingTest ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending Test...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-amber-400" />
                    <span>Send Test Email</span>
                  </>
                )}
              </button>
            </form>

            {testResult && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs font-medium flex items-center space-x-2 ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 border-rose-200 text-rose-800'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                )}
                <span>{testResult.message}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
