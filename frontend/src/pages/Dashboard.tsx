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
  GraduationCap,
  Sparkles,
  Lock,
  MessageSquare
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useCourse } from '../context/CourseContext';
import { RecentDiscussionsWidget } from '../components/discussions/RecentDiscussionsWidget';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCourse, completedTopicIds, isModuleCompletedByStudent } = useCourse();

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    activeCourse?.modules[0]?.id || null
  );

  const toggleModule = (id: string) => {
    setExpandedModuleId(expandedModuleId === id ? null : id);
  };

  // DYNAMIC COMPUTATION FROM SHARED COURSE STATE
  const modules = activeCourse?.modules || [];
  const allTopics = modules.flatMap((m) => m.topics);
  const completedTopicsCount = allTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;
  const courseProgressPercent =
    allTopics.length > 0 ? Math.round((completedTopicsCount / allTopics.length) * 100) : 0;

  const completedModulesCount = modules.filter((m) => isModuleCompletedByStudent(m.id)).length;
  const totalModulesCount = modules.length;

  const cmeCreditsEarned = modules
    .filter((m) => isModuleCompletedByStudent(m.id))
    .reduce((acc, m) => acc + (m.cmeCredits || 0), 0);
  const cmeCreditsTotal = modules.reduce((acc, m) => acc + (m.cmeCredits || 0), 0);

  // Active module is the first incomplete module or the last one if all complete
  const activeModule =
    modules.find((m) => !isModuleCompletedByStudent(m.id)) || modules[modules.length - 1] || null;

  const activeModTopics = activeModule?.topics || [];
  const activeModCompletedCount = activeModTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;
  const activeModProgressPercent =
    activeModTopics.length > 0 ? Math.round((activeModCompletedCount / activeModTopics.length) * 100) : 0;
  const activeModUnlocked = activeModule ? isModuleCompletedByStudent(activeModule.id) : false;

  const finalExamUnlocked = courseProgressPercent === 100;
  const certificateIssued = courseProgressPercent === 100;

  return (
    <DashboardLayout headerSubtitle="DASHBOARD">
      <div className="space-y-6 pb-12">
        {/* Welcome Header & Hero Banner */}
        <div className="bg-[#0A192F] text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-slate-800">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute right-32 top-0 w-32 h-32 bg-sky-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3 py-1 rounded-full text-xs font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Virtual Autopsy Global LMS</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                {activeCourse?.name || 'My Learning Dashboard'}
              </h1>
              <p className="text-slate-300 text-sm max-w-2xl leading-relaxed">
                {activeCourse?.shortDescription || 'Welcome to your Virtual Autopsy LMS training portal.'}
              </p>
            </div>

            {/* CME Credits Badge (Calculated from Completed Modules) */}
            <div className="bg-slate-950/60 backdrop-blur-md border border-slate-800 p-4 rounded-2xl flex items-center space-x-4 shrink-0">
              <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">CME / CPD Credits</div>
                <div className="text-xl font-black text-amber-400">
                  {cmeCreditsEarned} / {cmeCreditsTotal} Pts
                </div>
                <div className="text-[11px] text-slate-400">Dynamic Verified Progress</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stat Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            onClick={() => navigate('/my-course')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Progress</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{courseProgressPercent}%</h3>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                {completedTopicsCount} / {allTopics.length} Topics
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => navigate('/my-course')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-emerald-400 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Modules</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">
                {completedModulesCount} / {totalModulesCount}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {totalModulesCount - completedModulesCount} Modules Pending
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => navigate('/final-exam')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-indigo-400 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Final Exam</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">
                {finalExamUnlocked ? 'Available' : 'Locked'}
              </h3>
              <p className="text-xs text-indigo-600 font-semibold mt-0.5">
                {finalExamUnlocked ? 'Ready to take' : 'Complete course to unlock'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div
            onClick={() => navigate('/certificate')}
            className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between cursor-pointer hover:border-amber-400 transition-colors"
          >
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Certificate Status</p>
              <h3 className="text-lg font-black text-amber-600 mt-1">
                {certificateIssued ? 'Issued' : 'Not Available Yet'}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {certificateIssued ? 'Download Available' : 'Eligible at 100%'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Primary Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Continue Learning Banner */}
            {activeModule ? (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200/60 px-2.5 py-1 rounded-full">
                    Current Module
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    Topics: {activeModCompletedCount} of {activeModTopics.length} Completed
                  </span>
                </div>

                <div>
                  <h2 className="text-xl font-extrabold text-[#0A192F]">
                    Module 0{activeModule.moduleNumber}: {activeModule.title}
                  </h2>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    {activeModule.description}
                  </p>
                </div>

                {/* Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-slate-600">
                    <span>Module Progress</span>
                    <span className="text-amber-600">{activeModProgressPercent}% Completed</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                    <div
                      className="bg-amber-500 h-2.5 rounded-full transition-all duration-500"
                      style={{ width: `${activeModProgressPercent}%` }}
                    />
                  </div>
                </div>

                {/* Assessment Quick Status Bar */}
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-[#0A192F]">Assessment:</span>
                    {activeModUnlocked ? (
                      <span className="text-emerald-700 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Assessment Available</span>
                      </span>
                    ) : (
                      <span className="text-slate-500 flex items-center space-x-1">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Assessment Locked (Complete all topics to unlock)</span>
                      </span>
                    )}
                  </div>

                  {activeModUnlocked ? (
                    <button
                      onClick={() => navigate(`/assessment/${activeModule.id}`)}
                      className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                    >
                      Take Assessment
                    </button>
                  ) : (
                    <button
                      onClick={() => navigate('/my-course')}
                      className="px-3.5 py-1.5 bg-slate-200 text-slate-600 font-bold text-xs rounded-xl cursor-pointer hover:bg-slate-300 transition-colors"
                    >
                      View Topics in My Course
                    </button>
                  )}
                </div>

                <div className="pt-2 flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs text-slate-500">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>Duration: {activeModule.duration}</span>
                  </div>

                  <button
                    onClick={() => navigate('/my-course')}
                    className="inline-flex items-center space-x-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold px-5 py-2.5 rounded-xl shadow-sm transition-all transform active:scale-95 cursor-pointer"
                  >
                    <PlayCircle className="w-5 h-5" />
                    <span>Resume Learning</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 text-center text-slate-400 space-y-2">
                <p className="font-bold text-xs">No active module available.</p>
              </div>
            )}

            {/* Course Modules List Accordion */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Course Modules Breakdown</h3>
                <span className="text-xs text-slate-500 font-medium">{modules.length} Total Modules</span>
              </div>

              <div className="space-y-3">
                {modules.map((mod) => {
                  const isExpanded = expandedModuleId === mod.id;
                  const modUnlocked = isModuleCompletedByStudent(mod.id);
                  const modTopics = mod.topics || [];
                  const modDoneTopics = modTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;

                  return (
                    <div
                      key={mod.id}
                      className={`border rounded-2xl transition-all overflow-hidden ${
                        modUnlocked
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : modDoneTopics > 0
                          ? 'border-amber-400 bg-amber-50/20'
                          : 'border-slate-100 bg-slate-50/50'
                      }`}
                    >
                      <div
                        onClick={() => toggleModule(mod.id)}
                        className="p-4 flex items-center justify-between cursor-pointer select-none"
                      >
                        <div className="flex items-center space-x-3.5 min-w-0">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              modUnlocked
                                ? 'bg-emerald-500 text-white'
                                : modDoneTopics > 0
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-slate-200 text-slate-500'
                            }`}
                          >
                            0{mod.moduleNumber}
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#0A192F] truncate">
                              {mod.title}
                            </h4>
                            <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                              <span>{modDoneTopics}/{modTopics.length} Topics Completed</span>
                              <span>•</span>
                              <span>{mod.duration}</span>
                              <span>•</span>
                              <span className="text-amber-700 font-medium">{mod.cmeCredits} CME Pts</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center space-x-3 shrink-0">
                          {modUnlocked ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/assessment/${mod.id}`);
                              }}
                              className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-extrabold rounded-xl shadow-xs transition-all cursor-pointer"
                            >
                              Take Assessment
                            </button>
                          ) : (
                            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-slate-100 text-slate-500 border border-slate-200">
                              🔒 Assessment Locked
                            </span>
                          )}

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-slate-400" />
                          )}
                        </div>
                      </div>

                      {/* Expanded Topics Drawer */}
                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-slate-100 bg-white space-y-2">
                          <p className="text-xs text-slate-600 mb-3">{mod.description}</p>
                          {modTopics.length === 0 ? (
                            <p className="text-xs text-slate-400 italic">No topics added to this module yet.</p>
                          ) : (
                            modTopics.map((topic, topicIdx) => {
                              const isCompleted = Boolean(completedTopicIds[topic.id]);
                              return (
                                <div
                                  key={topic.id}
                                  onClick={() => navigate('/my-course')}
                                  className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 text-xs transition-colors cursor-pointer"
                                >
                                  <div className="flex items-center space-x-2.5">
                                    <PlayCircle
                                      className={`w-4 h-4 ${
                                        isCompleted ? 'text-emerald-500' : 'text-slate-300'
                                      }`}
                                    />
                                    <span
                                      className={`font-medium ${
                                        isCompleted ? 'text-slate-700' : 'text-slate-800 font-bold'
                                      }`}
                                    >
                                      {topicIdx + 1}. {topic.title}
                                    </span>
                                  </div>
                                  <span
                                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                                      isCompleted
                                        ? 'bg-emerald-100 text-emerald-800'
                                        : 'bg-slate-100 text-slate-500'
                                    }`}
                                  >
                                    {isCompleted ? 'Completed' : 'Pending'}
                                  </span>
                                </div>
                              );
                            })
                          )}
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
            {/* Active Topic Progress */}
            {activeModule && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <h3 className="font-extrabold text-base text-[#0A192F]">Current Module Topics</h3>
                  <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                    Module 0{activeModule.moduleNumber}
                  </span>
                </div>

                <div className="space-y-3">
                  <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/60 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-900">{activeModule.title}</span>
                      <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-full">
                        {activeModCompletedCount} / {activeModTopics.length} Done
                      </span>
                    </div>
                    <p className="text-xs text-slate-700">{activeModule.subtitle || activeModule.description}</p>
                    <button
                      onClick={() => navigate('/my-course')}
                      className="w-full text-center text-xs font-bold text-amber-900 bg-amber-400 hover:bg-amber-500 py-1.5 rounded-xl transition-colors mt-1 cursor-pointer"
                    >
                      Open Topics in My Course
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Recent Course Discussions Widget */}
            <RecentDiscussionsWidget />

            {/* Recent Activity Log (Clean Empty State) */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-[#0A192F]">Recent Activity</h3>
                <Activity className="w-4 h-4 text-slate-400" />
              </div>

              <div className="p-6 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-slate-400">
                <p className="text-xs font-semibold">No recent activity.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
