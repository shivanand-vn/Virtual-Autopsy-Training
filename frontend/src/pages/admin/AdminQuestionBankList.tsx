import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useQuestionBank } from '../../context/QuestionBankContext';
import { useCourse } from '../../context/CourseContext';
import {
  Plus,
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  FileQuestion,
  Image as ImageIcon,
  CheckCircle2,
  HelpCircle,
  X,
  AlertTriangle,
  BookOpen
} from 'lucide-react';

export const AdminQuestionBankList: React.FC = () => {
  const navigate = useNavigate();
  const { questions, deleteQuestion } = useQuestionBank();
  const { courses } = useCourse();

  // Filters State
  const [selectedCourse, setSelectedCourse] = useState<string>('all');
  const [selectedModule, setSelectedModule] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Delete Modal State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const selectedCourseObj = courses.find((c) => c.id === selectedCourse);
  const availableModules = selectedCourseObj ? selectedCourseObj.modules : [];

  // Filtered Questions
  const filteredQuestions = questions.filter((q) => {
    if (selectedCourse !== 'all' && q.courseId !== selectedCourse) return false;
    if (selectedModule !== 'all' && q.moduleId !== selectedModule) return false;
    if (selectedType !== 'all' && q.type !== selectedType) return false;
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase();
      const matchText = q.text.toLowerCase().includes(query);
      const matchModule = q.moduleName.toLowerCase().includes(query);
      if (!matchText && !matchModule) return false;
    }
    return true;
  });

  const handleDeleteConfirm = () => {
    if (deletingId) {
      deleteQuestion(deletingId);
      setDeletingId(null);
      showToast('Question deleted successfully.');
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'single':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-[#0A192F] text-amber-400">
            <span>Single Choice</span>
          </span>
        );
      case 'multiple':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">
            <span>Multiple Response</span>
          </span>
        );
      case 'true_false':
        return (
          <span className="inline-flex items-center space-x-1 text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
            <span>True/False Combo</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminLayout title="Question Bank" subtitle="Create and manage assessment questions for individual course modules.">
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Actions & Heading Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0A192F] flex items-center space-x-2">
              <FileQuestion className="w-6 h-6 text-amber-500" />
              <span>Assessment Question Repository</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Questions are mapped to specific course modules created in Course Management.
            </p>
          </div>

          <button
            onClick={() => navigate('/admin/question-bank/add')}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>+ Add Question</span>
          </button>
        </div>

        {/* Search & Filtering Control Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0A192F] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Questions</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Course Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Course</label>
              <select
                value={selectedCourse}
                onChange={(e) => {
                  setSelectedCourse(e.target.value);
                  setSelectedModule('all');
                }}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Module</label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Modules</option>
                {availableModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module 0{m.moduleNumber}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Question Type Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Question Type</label>
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Types</option>
                <option value="single">Single Choice</option>
                <option value="multiple">Multiple Response</option>
                <option value="true_false">True/False Combination</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search question text..."
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Questions Table List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Showing {filteredQuestions.length} Question{filteredQuestions.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Question Details</th>
                  <th className="py-3.5 px-4 font-bold">Course / Module</th>
                  <th className="py-3.5 px-4 font-bold">Type</th>
                  <th className="py-3.5 px-4 font-bold text-center">Image</th>
                  <th className="py-3.5 px-4 font-bold text-center">Options</th>
                  <th className="py-3.5 px-4 font-bold text-center">Marks</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuestions.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No questions available. Click "+ Add Question" to create questions for module assessments.
                    </td>
                  </tr>
                ) : (
                  filteredQuestions.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Question Text */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-2">{q.text}</p>
                        <span className="text-[10px] font-mono text-slate-400 mt-1 block">ID: {q.id}</span>
                      </td>

                      {/* Course / Module */}
                      <td className="py-4 px-4 text-slate-600">
                        <p className="font-bold text-slate-800 truncate max-w-[180px]">{q.moduleName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[180px]">{q.courseName}</p>
                      </td>

                      {/* Type Badge */}
                      <td className="py-4 px-4">{getTypeBadge(q.type)}</td>

                      {/* Image Indicator */}
                      <td className="py-4 px-4 text-center">
                        {q.image ? (
                          <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                            <ImageIcon className="w-3 h-3 text-emerald-600" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">No</span>
                        )}
                      </td>

                      {/* Options Count */}
                      <td className="py-4 px-4 text-center font-bold text-slate-700">
                        {q.type === 'true_false' ? '2 Stmts' : `${q.options?.length || 0} Opts`}
                      </td>

                      {/* Marks */}
                      <td className="py-4 px-4 text-center font-extrabold text-amber-700">
                        {q.marks} {q.marks === 1 ? 'Pt' : 'Pts'}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 text-center">
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          <span>Active</span>
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => navigate(`/admin/question-bank/${q.id}`)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                          title="View Question"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => navigate(`/admin/question-bank/${q.id}/edit`)}
                          className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Question"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(q.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Delete Question?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this question? It will be permanently removed from the module assessment question bank.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
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
