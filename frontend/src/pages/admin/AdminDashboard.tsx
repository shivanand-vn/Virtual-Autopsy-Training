import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Clock,
  BookOpen,
  CreditCard,
  CheckCircle2,
  Award,
  Sparkles,
  Eye,
  Plus,
  FileText,
  Activity,
  Bell,
  ArrowUpRight,
  TrendingUp,
  BarChart2,
  ShieldCheck
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  MOCK_ADMIN,
  MOCK_ADMIN_STATS,
  MOCK_APPLICANTS,
  MOCK_PAYMENTS,
  MOCK_ADMIN_COURSES,
  MOCK_ADMIN_ACTIVITIES,
  MOCK_ADMIN_NOTIFICATIONS
} from '../../types/admin';
import type { ApplicantRecord } from '../../types/admin';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [applicants] = useState<ApplicantRecord[]>(MOCK_APPLICANTS);

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
                Welcome back, {MOCK_ADMIN.name}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                Here's an overview of your Virtual Autopsy LMS. You have 18 active user registrations and 3 assignments requiring manual evaluation.
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

        {/* 2. KEY STATISTICS GRID (6 CARDS) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Students</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.totalStudents}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5 flex items-center">
                <TrendingUp className="w-3 h-3 mr-0.5" /> +12% this month
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pending Apps</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.pendingApplications}</h3>
              <p className="text-[11px] text-amber-600 font-semibold mt-0.5">Action Required</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Courses</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.activeCourses}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Published & Live</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Payments</p>
              <h3 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.totalPayments}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">Clearing Weekly</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Completed</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.completedCourses}</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">Graduated Fellows</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Certificates</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_ADMIN_STATS.certificatesIssued}</h3>
              <p className="text-[11px] text-amber-700 font-semibold mt-0.5">RCPath Verified</p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Award className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* 7. QUICK ACTIONS BAR */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
          <h3 className="font-extrabold text-sm text-[#0A192F]">Quick Administrative Actions</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            <button
              onClick={() => navigate('/admin/applications')}
              className="p-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl font-bold text-xs shadow-sm transition-all transform active:scale-95 flex flex-col items-center text-center space-y-1"
            >
              <Clock className="w-4 h-4" />
              <span>Review Apps</span>
            </button>

            <button
              onClick={() => navigate('/admin/courses')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Create Course</span>
            </button>

            <button
              onClick={() => navigate('/admin/assignments')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1"
            >
              <FileText className="w-4 h-4 text-amber-600" />
              <span>Manage Modules</span>
            </button>

            <button
              onClick={() => navigate('/admin/payments')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1"
            >
              <CreditCard className="w-4 h-4 text-amber-600" />
              <span>View Payments</span>
            </button>

            <button
              onClick={() => navigate('/admin/certificates')}
              className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-2xl font-bold text-xs transition-colors flex flex-col items-center text-center space-y-1"
            >
              <Award className="w-4 h-4 text-amber-600" />
              <span>Issue Certificate</span>
            </button>
          </div>
        </div>

        {/* PRIMARY CONTENT GRID: LEFT 2 SPANS VS RIGHT WIDGET COLUMN */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT 2 COLUMNS */}
          <div className="lg:col-span-2 space-y-6">
            {/* 3. APPLICATIONS OVERVIEW TABLE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Recent Applications</h3>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="py-3 px-3">APPLICANT</th>
                      <th className="py-3 px-3">QUALIFICATION</th>
                      <th className="py-3 px-3">ORGANIZATION</th>
                      <th className="py-3 px-3">APPLIED DATE</th>
                      <th className="py-3 px-3">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {applicants.map((app) => (
                      <tr key={app.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center space-x-3">
                            <img
                              src={app.avatar}
                              alt={app.applicantName}
                              className="w-8 h-8 rounded-full object-cover ring-2 ring-amber-400/40"
                            />
                            <div>
                              <div className="font-bold text-slate-900">{app.applicantName}</div>
                              <div className="text-[10px] text-slate-400">{app.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">{app.qualification}</td>
                        <td className="py-3 px-3 text-slate-600">{app.organization}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{app.appliedDate}</td>
                        <td className="py-3 px-3">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              app.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-800'
                                : app.status === 'pending'
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

              <div className="pt-2 text-right">
                <button
                  onClick={() => navigate('/admin/applications')}
                  className="text-xs font-bold text-amber-700 hover:text-amber-800 inline-flex items-center space-x-1"
                >
                  <span>View All Applications</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* 4. PAYMENT OVERVIEW SECTION */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0A192F]">Recent Payments</h3>
                  <p className="text-xs text-slate-500">Stripe & PACS Gateway Transactions</p>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  Total Revenue: £247,752
                </span>
              </div>

              {/* Compact Payment Summary Bar */}
              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200/80 text-xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Successful Payments</span>
                  <p className="text-sm font-black text-emerald-700">£247,752 (95%)</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Pending Clearance</span>
                  <p className="text-sm font-black text-amber-700">£12,400 (4%)</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Failed / Bounced</span>
                  <p className="text-sm font-black text-rose-700">£1,250 (1%)</p>
                </div>
              </div>

              {/* Payment Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-400 uppercase text-[10px]">
                      <th className="py-2.5 px-3">STUDENT</th>
                      <th className="py-2.5 px-3">COURSE</th>
                      <th className="py-2.5 px-3">AMOUNT</th>
                      <th className="py-2.5 px-3">DATE</th>
                      <th className="py-2.5 px-3 text-right">STATUS</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {MOCK_PAYMENTS.map((pay) => (
                      <tr key={pay.id}>
                        <td className="py-3 px-3 font-bold text-slate-900">{pay.studentName}</td>
                        <td className="py-3 px-3 text-slate-600 truncate max-w-xs">{pay.courseName}</td>
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{pay.amountFormatted}</td>
                        <td className="py-3 px-3 text-slate-500 font-mono text-[11px]">{pay.date}</td>
                        <td className="py-3 px-3 text-right">
                          <span
                            className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase ${
                              pay.status === 'successful'
                                ? 'bg-emerald-100 text-emerald-800'
                                : pay.status === 'pending'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {pay.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* 5. COURSE OVERVIEW CARD */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Course Overview</h3>
                <span className="text-xs text-slate-500">3 Live Curriculum Tracks</span>
              </div>

              <div className="space-y-3">
                {MOCK_ADMIN_COURSES.map((crs) => (
                  <div key={crs.id} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-[#0A192F]">{crs.title}</h4>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                        {crs.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-600">
                      <span>{crs.enrolledStudents} Enrolled Fellows</span>
                      <span className="font-bold text-amber-700">{crs.completionPercent}% Avg Completion</span>
                    </div>

                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-amber-500 h-2 rounded-full"
                        style={{ width: `${crs.completionPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR WIDGETS COLUMN */}
          <div className="space-y-6">
            {/* 8. NOTIFICATIONS PANEL */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Bell className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Admin Alerts</h3>
                </div>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="space-y-2.5">
                {MOCK_ADMIN_NOTIFICATIONS.map((notif) => (
                  <div
                    key={notif.id}
                    className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-2xl hover:bg-amber-100/50 transition-colors cursor-pointer space-y-1"
                  >
                    <div className="flex justify-between text-xs font-bold text-slate-900">
                      <span>{notif.title}</span>
                      <span className="text-[10px] font-normal text-slate-400">{notif.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-slate-600">{notif.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 9. ANALYTICS PREVIEW */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <BarChart2 className="w-4 h-4 text-amber-500" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Analytics Preview</h3>
                </div>
                <span className="text-[10px] font-bold text-slate-400">2024 TERM</span>
              </div>

              {/* Student Enrollment Chart Bar Simulation */}
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-700">Student Enrollment Overview</span>
                <div className="h-28 bg-slate-900 rounded-2xl p-3 flex items-end justify-between gap-2 border border-slate-800">
                  {[40, 65, 80, 55, 90, 100].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                      <div
                        className="w-full bg-amber-400 rounded-t transition-all hover:bg-amber-300"
                        style={{ height: `${val}%` }}
                      />
                      <span className="text-[9px] font-mono text-slate-400">M{idx + 1}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Course Completion Chart Line Simulation */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-bold text-slate-700">Course Completion Overview</span>
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Pass Rate Benchmark:</span>
                    <p className="text-base font-black text-[#0A192F]">88.4% Average</p>
                  </div>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                    +4.2% vs 2023
                  </span>
                </div>
              </div>
            </div>

            {/* 6. RECENT ACTIVITY TIMELINE */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-slate-400" />
                  <h3 className="font-extrabold text-base text-[#0A192F]">Recent Activity</h3>
                </div>
              </div>

              <div className="space-y-3">
                {MOCK_ADMIN_ACTIVITIES.map((act) => (
                  <div key={act.id} className="flex space-x-3 text-xs">
                    <div className="w-2 h-2 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-slate-800">{act.title}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{act.description}</p>
                      <span className="text-[10px] text-slate-400">{act.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
