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
  Image as ImageIcon,
  Layers
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourses } from '../../context/CourseContext';

export const AdminExamDetailPage: React.FC = () => {
  const { examId } = useParams<{ examId: string }>();
  const navigate = useNavigate();
  const { getFinalExamById, deleteFinalExam, publishFinalExam, unpublishFinalExam } = useFinalExams();
  const { courses } = useCourses();

  const [activeSetTab, setActiveSetTab] = useState<'set1' | 'set2' | 'set3'>('set1');
  const [uiError, setUiError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

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

  const course = courses.find(c => c.id === exam.courseId);
  const courseTitle = course ? course.title : exam.courseId;

  // Extract sets
  const set1 = exam.questionSets?.set1 || exam.questions || [];
  const set2 = exam.questionSets?.set2 || [];
  const set3 = exam.questionSets?.set3 || [];

  const activeQuestions =
    activeSetTab === 'set1' ? set1 : activeSetTab === 'set2' ? set2 : set3;

  const totalQuestionsAllSets = set1.length + set2.length + set3.length;

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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-sm w-full p-6 space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-extrabold text-base text-[#0A192F]">Delete Final Exam?</h3>
                <p className="text-xs text-slate-500 mt-1">This action cannot be undone. All candidate attempts linked to this exam will be affected.</p>
              </div>
              <div className="flex items-center space-x-2 pt-2">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="w-1/2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="w-1/2 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl"
                >
                  Confirm Delete
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Exam Overview Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                Course: {courseTitle}
              </span>
              <h2 className="text-2xl font-black text-[#0A192F]">{exam.title}</h2>
              {exam.description && (
                <p className="text-xs text-slate-600 leading-relaxed max-w-3xl">{exam.description}</p>
              )}
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
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
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{exam.duration || 45} Mins</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
              <p className="text-sm font-extrabold text-slate-800 mt-0.5">{totalQuestionsAllSets} Qs (3 Sets)</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
              <p className="text-sm font-extrabold text-amber-700 mt-0.5">{exam.totalMarks || 60} Pts</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pass Benchmark</p>
              <p className="text-sm font-extrabold text-emerald-600 mt-0.5">Strict 70% Required</p>
            </div>
          </div>
        </div>

        {/* Questions Inspection Section with 3-Set Tabs */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-3 gap-2">
            <h3 className="font-extrabold text-base text-[#0A192F] flex items-center space-x-2">
              <Layers className="w-5 h-5 text-amber-600" />
              <span>Multi-Set Examination Bank Inspection</span>
            </h3>
            <span className="text-xs text-slate-500 font-bold">
              3-Attempt Dynamic Question Engine
            </span>
          </div>

          {/* 3 TABS */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              onClick={() => setActiveSetTab('set1')}
              className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set1'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Question Set 1 (Attempt 1)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                {set1.length} Qs
              </span>
            </button>

            <button
              onClick={() => setActiveSetTab('set2')}
              className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set2'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Question Set 2 (Attempt 2)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                {set2.length} Qs
              </span>
            </button>

            <button
              onClick={() => setActiveSetTab('set3')}
              className={`px-4 py-2.5 text-xs font-black rounded-t-xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set3'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>Question Set 3 (Attempt 3 - Final)</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                {set3.length} Qs
              </span>
            </button>
          </div>

          {activeQuestions.length === 0 ? (
            <p className="text-xs text-slate-500 font-medium text-center py-6">
              No questions found in this set.
            </p>
          ) : (
            <div className="space-y-5">
              {activeQuestions.map((q, idx) => (
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
