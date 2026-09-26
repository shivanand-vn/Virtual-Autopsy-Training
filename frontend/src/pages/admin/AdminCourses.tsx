import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import {
  BookOpen,
  Plus,
  Search,
  Eye,
  Edit,
  Layers,
  Clock,
  CheckCircle2,
  FileText,
  Video,
  Sparkles,
  Trash2,
  AlertTriangle
} from 'lucide-react';

export const AdminCoursesPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, deleteCourse } = useCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingCourseId, setDeletingCourseId] = useState<string | null>(null);

  const filteredCourses = courses.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.shortDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalModulesCount = courses.reduce((acc, c) => acc + c.modules.length, 0);
  const totalTopicsCount = courses.reduce(
    (acc, c) => acc + c.modules.reduce((mAcc, m) => mAcc + m.topics.length, 0),
    0
  );

  return (
    <AdminLayout title="Course Management" subtitle="Manage courses, modules, and topic curriculum structure.">
      <div className="space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0A192F] flex items-center space-x-2">
              <BookOpen className="w-6 h-6 text-amber-500" />
              <span>Curriculum & Learning Content Architecture</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Courses define the single source of truth for modules, topics, and module assessments across the LMS.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/courses/add')}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span> Add Course</span>
          </button>
        </div>

        {/* Quick Stat Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Courses</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{courses.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-700 rounded-2xl flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Modules</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{totalModulesCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-2xl flex items-center justify-center font-bold">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Topics</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalTopicsCount}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-2xl flex items-center justify-center font-bold">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex items-center space-x-3">
          <Search className="w-4 h-4 text-slate-400 ml-2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search courses by title or description..."
            className="w-full text-xs bg-transparent focus:outline-none text-slate-800"
          />
        </div>

        {/* Courses Table / List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Course Name</th>
                  <th className="py-3.5 px-4 font-bold text-center">Modules</th>
                  <th className="py-3.5 px-4 font-bold text-center">Topics</th>
                  <th className="py-3.5 px-4 font-bold text-center">Duration</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCourses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No courses available yet. Click "+ Add Course" to build a new curriculum.
                    </td>
                  </tr>
                ) : (
                  filteredCourses.map((c) => {
                    const topicsCount = c.modules.reduce((acc, m) => acc + m.topics.length, 0);

                    return (
                      <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-4 px-4 max-w-sm">
                          <p className="font-extrabold text-sm text-[#0A192F] leading-snug">{c.name}</p>
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                            {c.shortDescription}
                          </p>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-extrabold text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                            {c.modules.length} Modules
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span className="font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-full">
                            {topicsCount} Topics
                          </span>
                        </td>

                        <td className="py-4 px-4 text-center text-slate-600 font-medium">
                          {c.duration}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <span
                            className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full ${c.status === 'published'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-slate-100 text-slate-600'
                              }`}
                          >
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span className="capitalize">{c.status}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/courses/${c.id}`)}
                            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                            title="View Course & Curriculum"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => navigate(`/admin/courses/${c.id}/edit`)}
                            className="p-2 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer"
                            title="Edit Course & Curriculum Builder"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingCourseId(c.id)}
                            className="p-2 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-xl transition-colors cursor-pointer"
                            title="Delete Course"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingCourseId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Delete Course?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this course and its curriculum structure?
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeletingCourseId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteCourse(deletingCourseId);
                    setDeletingCourseId(null);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
