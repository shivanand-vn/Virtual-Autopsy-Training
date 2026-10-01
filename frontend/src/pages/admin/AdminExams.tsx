import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  FileQuestion,
  Award,
  ShieldCheck,
  Plus,
  Eye,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourses } from '../../context/CourseContext';

export const AdminExamsPage: React.FC = () => {
  const navigate = useNavigate();
  const { finalExams, deleteFinalExam, publishFinalExam, unpublishFinalExam } = useFinalExams();
  const { courses } = useCourses();

  const [uiError, setUiError] = useState<string | null>(null);
  const [deleteExamTarget, setDeleteExamTarget] = useState<{ id: string; title: string } | null>(null);

  const getCourseTitle = (courseId: string) => {
    const found = courses.find(c => c.id === courseId);
    return found ? found.title : courseId;
  };

  const handleTogglePublish = (examId: string, currentStatus: string) => {
    setUiError(null);
    if (currentStatus === 'published') {
      unpublishFinalExam(examId);
    } else {
      const res = publishFinalExam(examId);
      if (!res.success) {
        setUiError(res.error || 'Cannot publish exam.');
      }
    }
  };

  const confirmDelete = () => {
    if (deleteExamTarget) {
      deleteFinalExam(deleteExamTarget.id);
      setDeleteExamTarget(null);
    }
  };

  const publishedCount = finalExams.filter(e => e.status === 'published').length;
  const totalQuestions = finalExams.reduce((acc, e) => acc + (e.questions?.length || 0), 0);

  return (
    <AdminLayout title="Final Exam & Assessment Builder" subtitle="Exams">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Final Exams</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{finalExams.length} Exams</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Published Exams</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{publishedCount} Active</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">{totalQuestions} Questions</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <FileQuestion className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proctor Security</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">Shielded</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Final Exam List Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-extrabold text-base text-[#0A192F]">Final Exams</h3>
              <p className="text-xs text-slate-500 mt-0.5">Manage course final exams and assessment builders</p>
            </div>
            <Link
              to="/admin/exams/create"
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Create Final Exam</span>
            </Link>
          </div>

          <div className="overflow-x-auto">
            {finalExams.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-base font-bold text-slate-700">No final exams available yet.</h4>
                  <p className="text-xs text-slate-500 mt-1">Create a final exam to attach questions and publish it to students.</p>
                </div>
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Exam Title</th>
                    <th className="py-3.5 px-4 font-bold">Course</th>
                    <th className="py-3.5 px-4 font-bold text-center">Questions</th>
                    <th className="py-3.5 px-4 font-bold text-center">Total Marks</th>
                    <th className="py-3.5 px-4 font-bold text-center">Status</th>
                    <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {finalExams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 font-bold text-[#0A192F]">
                        <Link to={`/admin/exams/${exam.id}`} className="hover:text-amber-600 transition-colors">
                          {exam.title}
                        </Link>
                        {exam.description && (
                          <p className="text-[11px] font-normal text-slate-500 line-clamp-1 mt-0.5">{exam.description}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 font-medium text-slate-700">
                        {getCourseTitle(exam.courseId)}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        <span>
                          {exam.questionSets
                            ? (exam.questionSets.set1?.length || 0) +
                              (exam.questionSets.set2?.length || 0) +
                              (exam.questionSets.set3?.length || 0)
                            : exam.questions?.length || 0}
                        </span>
                        {exam.questionSets && (
                          <span className="block text-[10px] text-amber-700 font-extrabold uppercase tracking-wider">
                            3 Sets
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-bold text-amber-700">
                        {exam.totalMarks || 0} Pts
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                            exam.status === 'published'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {exam.status === 'published' ? 'Published' : 'Draft'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          <Link
                            to={`/admin/exams/${exam.id}`}
                            className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                            title="View Exam"
                          >
                            <Eye className="w-4 h-4" />
                          </Link>
                          <Link
                            to={`/admin/exams/${exam.id}/edit`}
                            className="p-2 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded-xl transition-colors"
                            title="Edit Exam"
                          >
                            <Edit className="w-4 h-4" />
                          </Link>
                          <button
                            onClick={() => handleTogglePublish(exam.id, exam.status)}
                            className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-colors ${
                              exam.status === 'published'
                                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                                : 'bg-emerald-600 text-white hover:bg-emerald-700'
                            }`}
                          >
                            {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            onClick={() => setDeleteExamTarget({ id: exam.id, title: exam.title })}
                            className="p-2 text-rose-500 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-colors"
                            title="Delete Exam"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Delete Confirmation In-UI Modal */}
        {deleteExamTarget && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#0A192F]">Delete Final Exam?</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{deleteExamTarget.title}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteExamTarget(null)}
                  className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-xs"
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
