import React from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { BarChart3, TrendingUp, Users, BookOpen, Award, AlertCircle } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';

export const AdminAnalyticsPage: React.FC = () => {
  const { courses } = useCourse();

  return (
    <AdminLayout title="Analytics & LMS Performance" subtitle="Analytics">
      <div className="space-y-6 pb-16">
        {/* Header Summary */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A192F]">Platform Analytics</h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time telemetry, completion metrics, and cohort engagement insights.
            </p>
          </div>
        </div>

        {/* Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Cohorts</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{courses.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Candidates</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">0</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Avg Pass Rate</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">N/A</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificates Issued</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">0</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        {/* Empty State Banner */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-8">
          <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <BarChart3 className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-[#0A192F]">
            No Analytics Data Available Yet
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            Analytical reports, engagement telemetry, and assessment score distributions will generate automatically once candidates enroll and complete course modules.
          </p>
        </div>
      </div>
    </AdminLayout>
  );
};
