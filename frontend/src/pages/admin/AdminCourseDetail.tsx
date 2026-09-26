import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';

export const AdminCourseDetail: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId: string }>();
  const { getCourse, updateCourse, deleteModule, deleteTopic } = useCourse();

  const course = courseId ? getCourse(courseId) : undefined;
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>('mod-1');

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

  const togglePublishStatus = () => {
    const nextStatus = course.status === 'published' ? 'draft' : 'published';
    updateCourse(course.id, { status: nextStatus });
  };

  const totalTopics = course.modules.reduce((acc, m) => acc + m.topics.length, 0);

  return (
    <AdminLayout title="Course Details" subtitle={`Viewing curriculum for ${course.name}`}>
      <div className="space-y-6 pb-16">
        {/* Top Control Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <Link
            to="/admin/courses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={togglePublishStatus}
              className={`inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2 rounded-xl border transition-colors cursor-pointer ${
                course.status === 'published'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-amber-50 text-amber-900 border-amber-300 hover:bg-amber-100'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{course.status === 'published' ? 'Published' : 'Unpublished (Draft)'}</span>
            </button>

            <button
              onClick={() => navigate(`/admin/courses/${course.id}/edit`)}
              className="inline-flex items-center space-x-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Course & Curriculum</span>
            </button>
          </div>
        </div>

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
              <span>+ Add Module</span>
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

                    {/* Topics Drawer */}
                    {isExpanded && (
                      <div className="p-4 border-t border-slate-100 space-y-3 bg-white">
                        <p className="text-xs text-slate-600 mb-2">{mod.description}</p>

                        <div className="space-y-2">
                          {mod.topics.map((top, idx) => (
                            <div
                              key={top.id}
                              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-2 text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2.5">
                                  <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">
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
                                      <span>Text / Description Lesson</span>
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
