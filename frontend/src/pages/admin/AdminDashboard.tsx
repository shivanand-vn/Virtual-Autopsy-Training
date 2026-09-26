import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  BookOpen,
  CreditCard,
  CheckCircle2,
  Award,
  Sparkles,
  ArrowUpRight,
  BarChart2,
  ShieldCheck,
  Activity,
  Bell,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, completedTopicIds } = useCourse();
  const { registrationData, paymentData } = useRegistrationFlow();

  // DYNAMIC COMPUTATIONS FROM APPLICATION STATE
  const activeCoursesCount = courses.filter((c) => c.status === 'published').length;
  const totalModulesCount = courses.flatMap((c) => c.modules).length;
  const totalTopicsCount = courses.flatMap((c) => c.modules.flatMap((m) => m.topics)).length;
  const totalCompletedTopicsCount = Object.values(completedTopicIds).filter(Boolean).length;

  const hasSuccessfulPayment = paymentData.paymentStatus === 'success';
  const totalRevenueFormatted = hasSuccessfulPayment ? paymentData.amount : '£0.00';

  const hasApplicant = Boolean(registrationData.fullName || registrationData.email);

  return (
    <AdminLayout title="Admin Dashboard" subtitle="Dashboard">
      <div className="space-y-6">
        {/* 1. WELCOME / OVERVIEW BANNER */}
        <div className="bg-[#0A192F] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Virtual Autopsy LMS Administrator Hub</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome to Admin Control
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Single source of truth for Course Management, Question Bank, Student Progress, and System Administration.
              </p>
            </div>

            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">System Status</div>
                <div className="text-sm font-extrabold text-amber-400">100% Operational</div>
                <div className="text-[11px] text-slate-400">PACS Nodes Live</div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. KEY STATISTICS GRID (DYNAMIC STATS FROM FRONTEND STATE) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registered Students</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{hasApplicant ? 1 : 0}</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Active Account</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Apps</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">0</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-0.5">Applications</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{activeCoursesCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">{totalModulesCount} Total Modules</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-1">{totalRevenueFormatted}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Calculated from State</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed Topics</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalCompletedTopicsCount}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Out of {totalTopicsCount} Topics</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
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
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-[#0A192F]">Quick Administrative Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => navigate('/admin/applications')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Review Apps</span>
            </button>

            <button
              onClick={() => navigate('/admin/courses')}
              className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-bold text-xs shadow-xs transition-all flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
              <span>Course Builder</span>
            </button>

            <button
              onClick={() => navigate('/admin/question-bank')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Question Bank</span>
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>View Payments</span>
            </button>

            <button
              onClick={() => navigate('/admin/certificates')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1 cursor-pointer"
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
                <button
                  onClick={() => navigate('/admin/applications')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1 cursor-pointer"
                >
                  <span>View All Applications</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>

              {hasApplicant ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="py-3 px-3">APPLICANT</th>
                        <th className="py-3 px-3">QUALIFICATION</th>
                        <th className="py-3 px-3">ORGANIZATION</th>
                        <th className="py-3 px-3">STATUS</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {registrationData.fullName || 'Student'}
                          <div className="text-[10px] text-slate-400 font-normal">{registrationData.email}</div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {registrationData.qualification || 'Pathology Practitioner'}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {registrationData.organization || 'Medical Center'}
                        </td>
                        <td className="py-3 px-3">
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
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Total Revenue: {totalRevenueFormatted}
                </span>
              </div>

              {hasSuccessfulPayment ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                        <th className="py-2.5 px-3">TRANSACTION ID</th>
                        <th className="py-2.5 px-3">Payer Email</th>
                        <th className="py-2.5 px-3">AMOUNT</th>
                        <th className="py-2.5 px-3 text-right">STATUS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">
                          {paymentData.transactionId || 'TXN-SUCCESS'}
                        </td>
                        <td className="py-3 px-3 text-slate-700">
                          {paymentData.confirmedEmail || registrationData.email || 'Student'}
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-amber-700">{paymentData.amount}</td>
                        <td className="py-3 px-3 text-right">
                          <span className="text-[10px] px-2.5 py-1 rounded-full font-bold uppercase bg-emerald-100 text-emerald-800">
                            Completed
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                  <p className="text-xs font-semibold">No payment records available.</p>
                </div>
              )}
            </div>

            {/* 5. COURSE OVERVIEW CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Course Overview</h3>
                <span className="text-xs text-slate-500">{courses.length} Live Courses</span>
              </div>

              <div className="space-y-3">
                {courses.map((crs) => (
                  <div key={crs.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#0A192F]">{crs.name}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {crs.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{crs.modules.length} Modules ({crs.modules.flatMap((m) => m.topics).length} Topics)</span>
                      <span className="font-bold text-amber-700">Duration: {crs.duration}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR WIDGETS COLUMN */}
          <div className="space-y-6">
            {/* NOTIFICATIONS PANEL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Admin Alerts</h3>
                </div>
              </div>

              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <p className="text-xs font-semibold">No admin alerts at this time.</p>
              </div>
            </div>

            {/* ANALYTICS PREVIEW (EMPTY STATE FOR FAKE DATA REMOVAL) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Analytics Preview</h3>
                </div>
              </div>

              <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400 space-y-1">
                <p className="text-xs font-semibold">No analytics data available yet.</p>
              </div>
            </div>

            {/* RECENT ACTIVITY TIMELINE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Recent Activity</h3>
                </div>
              </div>

              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <p className="text-xs font-semibold">No recent activity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
