import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import {
  ArrowLeft,
  Edit,
  BookOpen,
  Layers,
  Plus,
  Trash2,
  FileText,
  Video,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileCheck,
  Award,
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const AdminCourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourse, updateCourse, deleteModule, deleteTopic } = useCourse();

  const course = courseId ? getCourse(courseId) : undefined;
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('mod-1');

  // Publication status dropdown and apply button state
  const [selectedStatus, setSelectedStatus] = useState<'draft' | 'published'>(course?.status || 'draft');
  const [isApplying, setIsApplying] = useState(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Synchronize dropdown state with course's saved status whenever course updates
  useEffect(() => {
    if (course) {
      setSelectedStatus(course.status);
    }
  }, [course?.status]);

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        setNotification(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!course) {
    return (
      <AdminLayout title="Course Details" subtitle="View course structure">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0A192F]">Course Not Found</h3>
          <p className="text-xs text-slate-500">The requested course could not be located in the system.</p>
          <Link
            to="/admin/courses"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Courses</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const hasStatusChanged = selectedStatus !== course.status;

  const handleApplyStatus = async () => {
    if (!hasStatusChanged || isApplying) return;

    setIsApplying(true);
    setNotification(null);

    try {
      await updateCourse(course.id, { status: selectedStatus });
      setNotification({
        type: 'success',
        message: `Course status successfully updated to ${selectedStatus === 'published' ? 'Published' : 'Unpublished (Draft)'}.`,
      });
    } catch (err: any) {
      console.error('Failed to update course status:', err);
      // Retain the actual saved status on error
      setSelectedStatus(course.status);
      setNotification({
        type: 'error',
        message: err?.response?.data?.message || err?.message || 'Failed to update course status. Please try again.',
      });
    } finally {
      setIsApplying(false);
    }
  };

  const totalTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);

  return (
    <AdminLayout title="Course Details" subtitle={`Viewing curriculum for ${course.name}`}>
      <div className="space-y-6 pb-16">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/admin/courses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2.5 rounded-xl transition-colors shrink-0 shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            {/* Publication Status Dropdown */}
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as 'draft' | 'published')}
                disabled={isApplying}
                aria-label="Publication Status"
                className={`h-10 pl-3.5 pr-8 rounded-xl text-xs font-bold border transition-all appearance-none cursor-pointer focus:outline-none focus:ring-2 focus:ring-amber-500/30 ${
                  selectedStatus === 'published'
                    ? 'bg-emerald-50/70 text-emerald-900 border-emerald-300 hover:bg-emerald-50'
                    : 'bg-amber-50/70 text-amber-900 border-amber-300 hover:bg-amber-50'
                }`}
              >
                <option value="draft">Status: Unpublished (Draft)</option>
                <option value="published">Status: Published</option>
              </select>
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center pointer-events-none text-slate-400">
                <ChevronDown className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Apply Button */}
            <button
              type="button"
              onClick={handleApplyStatus}
              disabled={!hasStatusChanged || isApplying}
              className={`h-10 px-4 inline-flex items-center justify-center space-x-1.5 text-xs font-black rounded-xl transition-all shadow-2xs ${
                hasStatusChanged && !isApplying
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md cursor-pointer'
                  : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
              }`}
              title={hasStatusChanged ? 'Apply publication status change' : 'No changes to apply'}
            >
              {isApplying && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isApplying ? 'Applying...' : 'Apply'}</span>
            </button>

            {/* Edit Course & Curriculum Button */}
            <button
              onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
              className="h-10 inline-flex items-center space-x-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Course & Curriculum</span>
            </button>
          </div>
        </div>

        {/* Feedback Notification Banner */}
        {notification && (
          <div
            className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs font-bold transition-all shadow-xs ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}
          >
            <div className="flex items-center space-x-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              )}
              <span>{notification.message}</span>
            </div>
            <button
              type="button"
              onClick={() => setNotification(null)}
              className="p-1 hover:opacity-70 text-slate-500 cursor-pointer"
              aria-label="Dismiss notification"
            >
              ✕
            </button>
          </div>
        )}

        {/* Course Header Overview Card (NO FEE OR PRICE) */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-md">
                {course.duration} Program
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-1">{course.name}</h1>
            </div>

            <div className="flex items-center space-x-3 text-xs font-bold text-slate-700">
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {course.modules.length} Modules Total
              </span>
              <span className="bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
                {totalTopics} Topics Total
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Course Overview</h4>
            <p className="text-xs text-slate-700 leading-relaxed font-medium">{course.description}</p>
          </div>
        </div>

        {/* Curriculum Architecture Tree */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-extrabold text-[#0A192F] flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-500" />
                <span>Course Curriculum Tree</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Hierarchy: Course → Modules → Topics
              </p>
            </div>

            <button
              onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 bg-amber-50 border border-amber-300 hover:bg-amber-100 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-600" />
              <span>Add Module</span>
            </button>
          </div>

          <div className="space-y-4">
            {course.modules.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">
                No modules created yet. Click "Edit Course & Curriculum" to add modules and topics.
              </p>
            ) : (
              course.modules.map((mod) => {
                const isExpanded = expandedModuleId === mod.id;
                const paddedNum = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;

                return (
                  <div
                    key={mod.id}
                    className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs"
                  >
                    {/* Module Header Bar */}
                    <div
                      onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                      className="p-4 bg-slate-50/80 hover:bg-slate-100/80 cursor-pointer flex items-center justify-between select-none transition-colors"
                    >
                      <div className="flex items-center space-x-3.5">
                        <div className="w-9 h-9 rounded-xl bg-[#0A192F] text-amber-400 font-black text-sm flex items-center justify-center shrink-0">
                          {paddedNum}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-sm text-[#0A192F]">
                            Module {mod.moduleNumber}: {mod.title}
                          </h4>
                          <div className="flex items-center space-x-2 text-xs text-slate-500 mt-0.5">
                            <span>{mod.topics.length} Topics</span>
                            <span>•</span>
                            <span>{mod.duration}</span>
                            <span>•</span>
                            <span className="text-amber-800 font-bold">{mod.cmeCredits} CME Pts</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    </div>

                    {/* 3-Tier Module Architecture Drawer */}
                    {isExpanded && (
                      <div className="p-5 border-t border-slate-100 space-y-5 bg-white">
                        <p className="text-xs text-slate-600 mb-2">{mod.description}</p>

                        {/* Tier 1: Learning Topics */}
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A192F] flex items-center space-x-1.5">
                              <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center">1</span>
                              <span>Educational Topics ({mod.topics.length} Lessons)</span>
                            </span>
                            <span className="text-[11px] text-slate-400">Video & Theory Lessons Only</span>
                          </div>

                          <div className="space-y-2">
                            {mod.topics.map((top, idx) => (
                              <div
                                key={top.id}
                                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center space-x-2.5">
                                    <span className="w-5 h-5 rounded-md bg-white border border-slate-300 text-slate-700 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {idx + 1}
                                    </span>
                                    <span className="font-extrabold text-slate-900">{top.title}</span>
                                  </div>

                                  <span className="inline-flex items-center space-x-1 text-[10px] px-2.5 py-0.5 rounded-full font-bold bg-white border border-slate-200 text-slate-700">
                                    {top.contentType === 'video' ? (
                                      <>
                                        <Video className="w-3 h-3 text-amber-600" />
                                        <span>Video Lesson</span>
                                      </>
                                    ) : (
                                      <>
                                        <FileText className="w-3 h-3 text-slate-500" />
                                        <span>Theory Lesson</span>
                                      </>
                                    )}
                                  </span>
                                </div>

                                <p className="text-[11px] text-slate-600 leading-relaxed pl-7">{top.description}</p>

                                {top.content && (
                                  <div className="ml-7 p-3 bg-white rounded-lg border border-slate-200/80 text-[11px] text-slate-700 font-medium">
                                    <strong className="text-[10px] text-slate-400 uppercase block mb-1">Learning Content Preview:</strong>
                                    {top.content}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tier 2: Module Assignment */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A192F] flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center">2</span>
                            <span>Module Assignment (Case Evaluation)</span>
                          </span>

                          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/40 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <FileCheck className="w-4 h-4 text-amber-600" />
                                <span className="font-extrabold text-slate-900">
                                  {mod.assignment?.title || `Module ${mod.moduleNumber} Assignment`}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-300 text-amber-900">
                                {mod.assignment?.totalMarks || 100} Marks • Required
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {mod.assignment?.description || <span className="text-slate-400 italic">No case briefing scenario specified.</span>}
                            </p>

                            <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500 pt-1 font-medium">
                              {mod.assignment?.templateFileName || mod.assignment?.templateFileUrl ? (
                                <span>📄 Worksheet: {mod.assignment.templateFileName || (mod.assignment.templateFileUrl ? mod.assignment.templateFileUrl.split('/').pop()?.split('?')[0] : 'Assignment_Document.pdf')}</span>
                              ) : (
                                <span className="text-slate-400">📄 No document attached (Optional)</span>
                              )}
                              <span>•</span>
                              <span>Submission Status: {mod.assignment?.submissionStatus || 'pending'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Tier 3: Module Test */}
                        <div className="pt-3 border-t border-slate-100 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A192F] flex items-center space-x-1.5">
                              <span className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-900 font-bold text-[10px] flex items-center justify-center">3</span>
                              <span>Module Test (Practice Quiz)</span>
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                              Unlimited Retakes
                            </span>
                          </div>

                          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/30 space-y-2 text-xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <Award className="w-4 h-4 text-emerald-600" />
                                <span className="font-extrabold text-slate-900">
                                  {mod.test?.title || `Module ${mod.moduleNumber} Practice Quiz`}
                                </span>
                              </div>
                              <span className="text-[10px] font-bold text-slate-600">
                                {mod.test?.totalQuestions || 5} Questions • {mod.test?.durationMinutes || 20} Mins
                              </span>
                            </div>

                            <p className="text-[11px] text-slate-600 leading-relaxed">
                              {mod.test?.description || 'Formative assessment testing module core competencies with unlimited practice retakes.'}
                            </p>

                            <div className="text-[11px] text-emerald-800 font-medium">
                              ✓ Completion Requirement • Students can retake freely for mastery.
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
