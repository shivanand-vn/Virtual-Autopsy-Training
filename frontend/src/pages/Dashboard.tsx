import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Award,
  ArrowRight,
  PlayCircle,
  FileText,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Activity,
  ShieldAlert,
  GraduationCap,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MOCK_STUDENT, MOCK_MODULES, MOCK_ASSIGNMENTS, MOCK_ACTIVITY } from '../types/dashboard';
import { RecentDiscussionsWidget } from '../components/discussions/RecentDiscussionsWidget';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [expandedModule, setExpandedModule] = useState<string | null>('mod-3');

  const toggleModule = (id: string) => {
    setExpandedModule(expandedModule === id ? null : id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Welcome Header & Hero Banner */}
        <div className="bg-[#0A192F] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
          {/* Subtle Background Accent */}
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Post-Mortem CT & Forensic Imaging Fellowship</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {MOCK_STUDENT.name}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                You are currently on track for your RCPath & ISFRI Forensic Accreditation.
                Module 03 volumetric case analysis is active.
              </p>
            </div>

            {/* CME Credits Badge */}
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">CME / CPD Credits</div>
                <div className="text-xl font-black text-amber-400">
                  {MOCK_STUDENT.cmeCreditsEarned} / {MOCK_STUDENT.cmeCreditsTotal}
                </div>
                <div className="text-[11px] text-slate-400">Category 1 Verified</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Overall Progress</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{MOCK_STUDENT.progressPercent}%</h3>
              <p className="text-xs text-emerald-600 font-semibold mt-0.5">On Schedule</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Modules</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">2 / 5</h3>
              <p className="text-xs text-slate-500 mt-0.5">3 Modules Pending</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Worksheets</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">1 Action Required</h3>
              <p className="text-xs text-amber-600 font-semibold mt-0.5">Due in 3 Days</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Exam Status</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">60 Qs Proctored</h3>
              <p className="text-xs text-slate-500 mt-0.5">Unlocks after Module 04</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning Banner */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                  Continue Active Module
                </span>
                <span className="text-xs text-slate-400 font-medium">Lesson 2 of 5</span>
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#0A192F]">
                  Module 03: Cranial & Thoracic Trauma PMCT Volumetric Evaluation
                </h2>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Lesson 2 of 5: Volumetric Contrast & Soft Tissue Density in Blunt Force Trauma
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-bold text-slate-600">
                  <span>Module Progress</span>
                  <span className="text-amber-600">60% Completed</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                  <div className="bg-amber-500 h-2.5 rounded-full w-[60%] transition-all duration-500" />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs text-slate-500">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Est. Remaining: 1h 45m</span>
                </div>
                <button
                  onClick={() => navigate('/course')}
                  className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95"
                >
                  <PlayCircle className="w-5 h-5" />
                  <span>Resume Learning</span>
                </button>
              </div>
            </div>

            {/* Course Modules List Accordion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Course Modules Breakdown</h3>
                <span className="text-xs text-slate-500 font-medium">5 Total Modules</span>
              </div>

              <div className="space-y-3">
                {MOCK_MODULES.map((mod) => {
                  const isExpanded = expandedModule === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className={`border rounded-2xl transition-all overflow-hidden ${
                        mod.status === 'in_progress'
                          ? 'border-amber-400 bg-amber-50/20'
                          : mod.status === 'completed'
                          ? 'border-slate-200 bg-white'
                          : 'border-slate-100 bg-slate-50/50 opacity-75'
                      }`}
                    >
                      <div
                        onClick={() => toggleModule(mod.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              mod.status === 'completed'
                                ? 'bg-emerald-500 text-white'
                                : mod.status === 'in_progress'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            {mod.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : (
                              <span>0{mod.moduleNumber}</span>
                            )}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#0A192F] truncate">
                              {mod.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                              <span>{mod.lessonsCount} Lessons</span>
                              <span>•</span>
                              <span>{mod.duration}</span>
                              <span>•</span>
                              <span className="text-amber-700 font-medium">{mod.cmeCredits} CME Pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                              mod.status === 'completed'
                                ? 'bg-emerald-100 text-emerald-800'
                                : mod.status === 'in_progress'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {mod.status === 'completed'
                              ? 'Completed'
                              : mod.status === 'in_progress'
                              ? 'In Progress'
                              : 'Locked'}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Lessons Drawer */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white space-y-2">
                          <p className="text-xs text-slate-600 mb-3">{mod.description}</p>
                          {mod.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors"
                            >
                              <div className="flex items-center space-x-2.5">
                                <PlayCircle
                                  className={`w-4 h-4 ${
                                    lesson.status === 'completed'
                                      ? 'text-emerald-500'
                                      : lesson.status === 'active'
                                      ? 'text-amber-500'
                                      : 'text-slate-300'
                                  }`}
                                />
                                <span
                                  className={`font-medium ${
                                    lesson.status === 'active' ? 'text-amber-700 font-bold' : 'text-slate-700'
                                  }`}
                                >
                                  {lesson.title}
                                </span>
                              </div>
                              <span className="text-slate-400">{lesson.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Sidebar Widgets Column */}
          <div className="space-y-6">
            {/* Pending Activities & Assessments */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Pending Activities</h3>
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                  Action Required
                </span>
              </div>

              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-900">Module 03 Case Assessment</span>
                    <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                      Due Oct 18
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    Cranial & Thoracic Trauma PMCT Volumetric Evaluation (#VA-9428)
                  </p>
                  <button
                    onClick={() => navigate('/assignments')}
                    className="w-full text-center text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 py-1.5 rounded-xl transition-colors mt-1"
                  >
                    Open Case Practical
                  </button>
                </div>

                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">Final Competency Exam</span>
                    <span className="text-[10px] font-bold bg-slate-200 text-slate-700 px-2 py-0.5 rounded-full">
                      Prerequisite
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    60 Multi-Slice CT Vignettes. Unlocks upon Module 04 completion.
                  </p>
                </div>
              </div>
            </div>

            {/* Certificate Progress Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-base text-[#0A192F]">Accreditation</h3>
                <Award className="w-5 h-5 text-amber-500" />
              </div>

              <div className="p-4 rounded-2xl bg-slate-900 text-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-semibold">Fellowship Verified</span>
                  <span className="text-amber-400 font-extrabold text-sm">42% Verified</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div className="bg-amber-400 h-2 rounded-full w-[42%]" />
                </div>
                <p className="text-[11px] text-slate-400">
                  Target completion date: July 2025 (RCPath / ISFRI Accredited)
                </p>
                <button
                  onClick={() => navigate('/certificate')}
                  className="w-full text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 py-2 rounded-xl transition-colors text-center block"
                >
                  View Certificate Status
                </button>
              </div>
            </div>

            {/* Recent Course Discussions */}
            <RecentDiscussionsWidget />

            {/* Recent PACS & Activity Log */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Recent PACS Activity</h3>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="space-y-3">
                {MOCK_ACTIVITY.map((act) => (
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
    </DashboardLayout>
  );
};
