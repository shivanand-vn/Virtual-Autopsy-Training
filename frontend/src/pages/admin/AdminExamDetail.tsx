import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckCircle2,
  GraduationCap,
  Clock,
  Award,
  FileQuestion,
  Image as ImageIcon
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourses } from '../../context/CourseContext';

export const AdminExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getFinalExamById, deleteFinalExam, publishFinalExam, unpublishFinalExam } = useFinalExams();
  const { courses } = useCourses();

  const exam = getFinalExamById(examId || '');

  if (!exam) {
    return (
      <AdminLayout title="Exam Not Found" subtitle="Exams">
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200 shadow-xs max-w-xl mx-auto space-y-4 my-12">
          <GraduationCap className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-bold text-slate-800">Final Exam Not Found</h3>
          <p className="text-xs text-slate-500">The requested final exam could not be found or has been removed.</p>
          <Link
            to="/admin/exams"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Final Exams</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const [uiError, setUiError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const course = courses.find(c => c.id === exam.courseId);
  const courseTitle = course ? course.title : exam.courseId;

  const handleTogglePublish = () => {
    setUiError(null);
    if (exam.status === 'published') {
      unpublishFinalExam(exam.id);
    } else {
      const res = publishFinalExam(exam.id);
      if (!res.success) {
        setUiError(res.error || 'Cannot publish exam.');
      }
    }
  };

  const confirmDelete = () => {
    deleteFinalExam(exam.id);
    navigate('/admin/exams');
  };

  return (
    <AdminLayout title={exam.title} subtitle="Exams">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Navigation & Controls */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/exams"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Final Exams</span>
          </Link>

          <div className="flex items-center space-x-2">
            <Link
              to={`/admin/exams/${exam.id}/edit`}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Exam</span>
            </Link>

            <button
              onClick={handleTogglePublish}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition-colors ${
                exam.status === 'published'
                  ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700'
              }`}
            >
              {exam.status === 'published' ? 'Unpublish Exam' : 'Publish Exam'}
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors"
              title="Delete Exam"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* In-UI Error Banner */}
        {uiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-bold">
            <span>{uiError}</span>
            <button onClick={() => setUiError(null)} className="text-rose-500 hover:text-rose-700">Dismiss</button>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 text-center space-y-4">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-extrabold text-base text-[#0A192F]">Delete Final Exam?</h3>
                <p className="text-xs text-slate-500">
                  Are you sure you want to delete <span className="font-bold text-slate-800">"{exam.title}"</span>? This action cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
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

        {/* Overview Banner Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                {courseTitle}
              </span>
              <h2 className="text-xl font-extrabold text-[#0A192F] mt-2">{exam.title}</h2>
              {exam.description && (
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{exam.description}</p>
              )}
            </div>

            <span
              className={`px-3 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                exam.status === 'published'
                  ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  : 'bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              {exam.status === 'published' ? 'Published' : 'Draft'}
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-2">
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Duration</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.duration || 60} Mins</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Questions</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.questions?.length || 0} Questions</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
              <p className="text-sm font-extrabold text-amber-700 mt-0.5">{exam.totalMarks || 0} Pts</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Benchmark</p>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">{exam.passPercentage || 70}%</p>
            </div>
          </div>
        </div>

        {/* Questions Inspection Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <h3 className="font-extrabold text-base text-[#0A192F] border-b border-slate-100 pb-3">
            Exam Questions ({exam.questions?.length || 0})
          </h3>

          {!exam.questions || exam.questions.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium text-center py-6">
              No questions found in this exam.
            </p>
          ) : (
            <div className="space-y-6">
              {exam.questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        {q.type.replace('-', ' ')}
                      </span>
                    </div>
                    <span className="text-xs font-bold text-amber-700">
                      {q.marks} Mark{q.marks > 1 ? 's' : ''}
                    </span>
                  </div>

                  <p className="text-sm font-bold text-[#0A192F]">{q.text}</p>

                  {/* Optional Image */}
                  {q.image && (
                    <div className="my-2">
                      <img
                        src={q.image}
                        alt="Question vignette visual"
                        className="max-h-52 rounded-xl border border-slate-300 object-contain bg-black/5"
                      />
                    </div>
                  )}

                  {/* True/False Statements */}
                  {q.type === 'true-false-combination' && q.statements && (
                    <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-700">
                      <p><span className="font-bold text-slate-900">Statement 1:</span> {q.statements.statement1}</p>
                      <p><span className="font-bold text-slate-900">Statement 2:</span> {q.statements.statement2}</p>
                    </div>
                  )}

                  {/* Options */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map((opt) => {
                        const isCorrect =
                          q.correctAnswer === opt.id ||
                          q.correctAnswers?.includes(opt.id);

                        return (
                          <div
                            key={opt.id}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Rationale / Explanation */}
                  {q.explanation && (
                    <div className="p-3 bg-amber-50/50 border border-amber-200/60 rounded-xl text-xs text-amber-950 mt-2">
                      <span className="font-bold text-amber-900">Explanation: </span>
                      {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};
