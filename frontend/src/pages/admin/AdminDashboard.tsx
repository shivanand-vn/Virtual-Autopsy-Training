import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  BookOpen,
  CreditCard,
  Award,
  Sparkles,
  ArrowUpRight,
  ShieldCheck,
  Activity,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';
import { api } from '../../lib/api';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses } = useCourse();
  const { registrationData } = useRegistrationFlow();

  const [studentsCount, setStudentsCount] = useState<number>(0);
  const [recentApplications, setRecentApplications] = useState<any[]>([]);
  const [payments, setPayments] = useState<any[]>([]);
  const [totalRevenue, setTotalRevenue] = useState<string>('£0.00');

  const hasApplicant = Boolean(registrationData.fullName || registrationData.email);

  useEffect(() => {
    let isMounted = true;
    const fetchMetrics = async () => {
      try {
        const [usersRes, appsRes, paymentsRes] = await Promise.allSettled([
          api.get('/users'),
          api.get('/applications/admin'),
          api.get('/payments/admin'),
        ]);

        if (isMounted) {
          if (usersRes.status === 'fulfilled' && usersRes.value?.data?.users) {
            const allUsers = usersRes.value.data.users;
            const students = allUsers.filter((u: any) => u.role === 'STUDENT');
            setStudentsCount(students.length);
          }
          if (appsRes.status === 'fulfilled' && appsRes.value?.data?.applications) {
            const allApps = appsRes.value.data.applications;
            setRecentApplications(allApps.slice(0, 5));
          }
          if (paymentsRes.status === 'fulfilled' && paymentsRes.value?.data) {
            const pData = paymentsRes.value.data;
            setPayments(pData.payments || []);
            setTotalRevenue(pData.totalRevenue || '£0.00');
          }
        }
      } catch (err) {
        console.warn('Failed to load dashboard live metrics:', err);
      }
    };

    fetchMetrics();
    return () => {
      isMounted = false;
    };
  }, []);

  // DYNAMIC COMPUTATIONS FROM APPLICATION STATE
  const activeCoursesCount = courses.filter((c) => c.status === 'published').length;
  const totalModulesCount = courses.flatMap((c) => c.modules).length;

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Dashboard">
      <div className="space-y-6">
        {/* 1. WELCOME / OVERVIEW BANNER */}
        <div className="bg-[#0A192F] text-white rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-xs border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 top-0 w-24 h-24 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 bg-amber-500/15 border border-amber-400/25 text-amber-300 px-2.5 py-0.5 rounded-full text-[11px] font-semibold">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Virtual Autopsy LMS Administrator Hub</span>
              </div>
              <h1 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                Welcome to Admin Control
              </h1>
              <p className="text-slate-300 text-xs max-w-xl leading-normal">
                Single source of truth for Course Management, Student Progress, and System Administration.
              </p>
            </div>

            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 px-3.5 py-2.5 rounded-xl flex items-center space-x-3 shrink-0">
              <div className="w-9 h-9 rounded-lg bg-amber-500/15 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 font-medium leading-none">System Status</div>
                <div className="text-xs font-bold text-amber-400 mt-0.5">100% Operational</div>
                <div className="text-[10px] text-slate-400 leading-none">PACS Nodes Live</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. KEY STATISTICS GRID (DYNAMIC STATS FROM FRONTEND STATE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/admin/users')}
            className="h-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Students</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{studentsCount}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Active Fellows</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="h-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{activeCoursesCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{totalModulesCount} Total Modules</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div
            onClick={() => navigate('/admin/payments')}
            className="h-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 hover:shadow-md transition-all"
          >
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-1">{totalRevenue}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Verified Revenue</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="h-full bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificates</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">0</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Issued Certificates</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* QUICK ACTIONS BAR */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-[#0A192F]">Quick Administrative Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              onClick={() => navigate('/admin/courses')}
              className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl font-bold text-xs shadow-xs transition-all flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Builder</span>
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>View Payments</span>
            </button>

            <button
              onClick={() => navigate('/admin/certificates')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Certificates</span>
            </button>
          </div>
        </div>

        {/* PRIMARY CONTENT GRID: LEFT 2 SPANS VS RIGHT WIDGET COLUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3. APPLICATIONS OVERVIEW TABLE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Recent Applications</h3>
              </div>

              {recentApplications.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs table-fixed min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="w-[36%] py-3 px-3">APPLICANT</th>
                        <th className="w-[26%] py-3 px-3">QUALIFICATION</th>
                        <th className="w-[23%] py-3 px-3">ORGANIZATION</th>
                        <th className="w-[15%] py-3 px-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentApplications.map((app) => (
                        <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 max-w-0 overflow-hidden font-bold text-slate-900">
                            <div className="truncate" title={app.fullName}>
                              {app.fullName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-normal truncate" title={app.email}>
                              {app.email}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-0 overflow-hidden font-medium text-slate-700">
                            <div className="truncate" title={app.qualification || 'Pathology Practitioner'}>
                              {app.qualification || 'Pathology Practitioner'}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-0 overflow-hidden text-slate-600">
                            <div className="truncate" title={app.organization || 'Medical Center'}>
                              {app.organization || 'Medical Center'}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                                app.status === 'APPROVED'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : app.status === 'PENDING'
                                  ? 'bg-amber-100 text-amber-900'
                                  : 'bg-rose-100 text-rose-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : hasApplicant ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs table-fixed min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="w-[36%] py-3 px-3">APPLICANT</th>
                        <th className="w-[26%] py-3 px-3">QUALIFICATION</th>
                        <th className="w-[23%] py-3 px-3">ORGANIZATION</th>
                        <th className="w-[15%] py-3 px-3 text-center">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 max-w-0 overflow-hidden font-bold text-slate-900">
                          <div className="truncate" title={registrationData.fullName || 'Student'}>
                            {registrationData.fullName || 'Student'}
                          </div>
                          <div className="text-[10px] text-slate-400 font-normal truncate" title={registrationData.email}>
                            {registrationData.email}
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-0 overflow-hidden font-medium text-slate-700">
                          <div className="truncate" title={registrationData.qualification || 'Pathology Practitioner'}>
                            {registrationData.qualification || 'Pathology Practitioner'}
                          </div>
                        </td>
                        <td className="py-3 px-3 max-w-0 overflow-hidden text-slate-600">
                          <div className="truncate" title={registrationData.organization || 'Medical Center'}>
                            {registrationData.organization || 'Medical Center'}
                          </div>
                        </td>
                        <td className="py-3 px-3 text-center">
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                            Approved & Active
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold">No application records available yet.</p>
                </div>
              )}
            </div>

            {/* 4. PAYMENT OVERVIEW SECTION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0A192F]">Recent Payments</h3>
                  <p className="text-xs text-slate-500">Registration & Course Transactions</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                    Total Revenue: {totalRevenue}
                  </span>
                  <button
                    onClick={() => navigate('/admin/payments')}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View All</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {payments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs table-fixed min-w-[650px]">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="w-[30%] py-2.5 px-3">TRANSACTION ID</th>
                        <th className="w-[35%] py-2.5 px-3">CANDIDATE</th>
                        <th className="w-[20%] py-2.5 px-3">AMOUNT</th>
                        <th className="w-[15%] py-2.5 px-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {payments.slice(0, 5).map((p: any) => (
                        <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="py-3 px-3 max-w-0 overflow-hidden font-mono font-bold text-slate-800">
                            <div className="truncate" title={p.transactionRef}>
                              {p.transactionRef}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-0 overflow-hidden text-slate-700">
                            <div className="font-bold text-slate-900 truncate" title={p.candidateName || p.user?.fullName || 'Candidate'}>
                              {p.candidateName || p.user?.fullName || 'Candidate'}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono truncate" title={p.email || p.user?.email}>
                              {p.email || p.user?.email}
                            </div>
                          </td>
                          <td className="py-3 px-3 max-w-0 overflow-hidden font-mono font-bold text-amber-700">
                            <div className="truncate" title={p.amount}>
                              {p.amount}
                            </div>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                              {p.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold">No payment records available.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT SIDEBAR WIDGETS COLUMN */}
          <div className="space-y-6">
            {/* NOTIFICATIONS / ADMIN ALERTS PANEL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Admin Alerts</h3>
                </div>
              </div>

              {recentApplications.filter((a) => a.status === 'PENDING').length > 0 ? (
                <div className="space-y-2.5">
                  <div
                    onClick={() => navigate('/admin/applications')}
                    className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start space-x-3 cursor-pointer hover:bg-amber-100/60 transition-colors"
                  >
                    <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        {recentApplications.filter((a) => a.status === 'PENDING').length} Pending Vetting Application(s)
                      </p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        New candidates waiting for eligibility verification. Click to review.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-5 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold">No pending alerts. All systems operational.</p>
                </div>
              )}
            </div>

            {/* RECENT ACTIVITY TIMELINE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Recent Activity</h3>
                </div>
              </div>

              {payments.length > 0 || recentApplications.length > 0 ? (
                <div className="space-y-3">
                  {payments.slice(0, 3).map((p: any) => (
                    <div key={p.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs min-w-0">
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="font-bold text-slate-900 truncate" title={p.candidateName || p.user?.fullName || p.email}>
                          {p.candidateName || p.user?.fullName || p.email}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">Virtual Autopsy Fellowship Payment</div>
                      </div>
                      <span className="font-mono font-bold text-emerald-600 text-xs shrink-0">{p.amount}</span>
                    </div>
                  ))}
                  {recentApplications.slice(0, 2).map((app: any) => (
                    <div key={app.id} className="p-3 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs min-w-0">
                      <div className="min-w-0 flex-1 mr-3">
                        <div className="font-bold text-slate-900 truncate" title={app.fullName}>
                          {app.fullName}
                        </div>
                        <div className="text-[10px] text-slate-500 truncate">Application • {app.professionalRole || 'Fellow'}</div>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 shrink-0">
                        {app.status}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold">No recent activity.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
