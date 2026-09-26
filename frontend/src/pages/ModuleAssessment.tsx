import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCourseProgress } from '../context/CourseProgressContext';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import type { Question, QuestionOption } from '../types/assessment';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  Lock,
  ArrowLeft,
  Send,
  AlertCircle,
  FileText,
  ImageIcon,
  Check,
  X
} from 'lucide-react';

export const ModuleAssessmentPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const {
    modules,
    isAssessmentUnlocked,
    getModuleAssessment,
    saveAssessmentResult
  } = useCourseProgress();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  const currentModule = modules.find((m) => m.id === moduleId);
  const assessment = moduleId ? getModuleAssessment(moduleId) : undefined;
  const isUnlocked = moduleId ? isAssessmentUnlocked(moduleId) : false;

  if (!currentModule || !assessment) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0A192F]">Assessment Not Found</h3>
          <p className="text-xs text-slate-500">The requested module assessment is unavailable or invalid.</p>
          <Link
            to="/course"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Course</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Security Protection Guard: Must complete ALL topics first
  if (!isUnlocked) {
    const incompleteCount = currentModule.lessonsCount - currentModule.completedLessons;
    return (
      <DashboardLayout>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-8 shadow-xs">
          <div className="w-16 h-16 bg-amber-100 text-amber-900 border border-amber-300 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Assessment Locked
            </span>
            <h2 className="text-xl font-extrabold text-[#0A192F]">
              {currentModule.title} — Assessment Locked
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
              Complete all topics in this module to unlock the assessment. You currently have{' '}
              <span className="font-bold text-amber-700">{incompleteCount} incomplete topic{incompleteCount === 1 ? '' : 's'}</span> remaining ({currentModule.completedLessons}/{currentModule.lessonsCount} completed).
            </p>
          </div>

          <div className="pt-2">
            <Link
              to="/course"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Complete Topics in My Course</span>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const currentQuestion = assessment.questions[currentQuestionIndex];
  const totalQuestions = assessment.questions.length;

  // Answer selection handlers
  const handleSelectOption = (questionId: string, optionId: string, isMultiple: boolean) => {
    setUserAnswers((prev) => {
      const existing = prev[questionId] || [];
      if (isMultiple) {
        if (existing.includes(optionId)) {
          return { ...prev, [questionId]: existing.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...existing, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const isOptionSelected = (questionId: string, optionId: string): boolean => {
    return (userAnswers[questionId] || []).includes(optionId);
  };

  const isQuestionAnswered = (questionId: string): boolean => {
    return (userAnswers[questionId] || []).length > 0;
  };

  const answeredCount = Object.keys(userAnswers).filter((qId) => (userAnswers[qId] || []).length > 0).length;

  const handleConfirmSubmit = () => {
    let correctCount = 0;
    assessment.questions.forEach((q) => {
      const userSelected = (userAnswers[q.id] || []).sort();
      const correct = [...q.correctAnswers].sort();
      if (
        userSelected.length === correct.length &&
        userSelected.every((val, idx) => val === correct[idx])
      ) {
        correctCount++;
      }
    });

    const scorePercent = Math.round((correctCount / totalQuestions) * 100);
    const passed = scorePercent >= assessment.passingScorePercent;

    saveAssessmentResult({
      moduleId: currentModule.id,
      moduleTitle: currentModule.title,
      moduleNumber: currentModule.moduleNumber,
      totalQuestions,
      correctAnswersCount: correctCount,
      scorePercent,
      passed,
      completedAt: 'Just now',
      userAnswers
    });

    setShowSubmitModal(false);
    navigate(`/assessment/${currentModule.id}/result`);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-5xl mx-auto pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/course" className="text-amber-700 font-bold hover:underline">
            My Course
          </Link>
          <span>/</span>
          <span className="text-slate-700">Module 0{currentModule.moduleNumber}</span>
          <span>/</span>
          <span className="bg-amber-500 text-slate-950 px-2.5 py-0.5 rounded-md font-extrabold text-[11px]">
            Assessment
          </span>
        </div>

        {/* Assessment Banner Header */}
        <div className="bg-[#0A192F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 space-y-4 relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-2 bg-amber-500/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-500/30">
                <FileText className="w-3.5 h-3.5" />
                <span>Proctored Module Evaluation</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Module {currentModule.moduleNumber} Assessment
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 font-medium">
                {currentModule.title}
              </p>
              <p className="text-xs text-slate-400 pt-1 leading-relaxed max-w-2xl">
                Complete the following questions to assess your understanding of this module. Answer all questions carefully before submitting.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-0.5 min-w-[100px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Questions</div>
                <div className="text-lg font-black text-amber-400">{totalQuestions} Qs</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-0.5 min-w-[100px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Time Limit</div>
                <div className="text-lg font-black text-white">{assessment.timeLimitMinutes} Mins</div>
              </div>

              <div className="bg-slate-950/70 border border-slate-800 p-3 rounded-2xl text-center space-y-0.5 min-w-[100px]">
                <div className="text-[10px] text-slate-400 font-bold uppercase">Pass Mark</div>
                <div className="text-lg font-black text-emerald-400">{assessment.passingScorePercent}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Examination Grid: Protected Question Area + Question Navigator */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Protected Question Container (3 Spans) */}
          <div className="lg:col-span-3 space-y-6">
            <div
              onCopy={(e) => e.preventDefault()}
              onCut={(e) => e.preventDefault()}
              onContextMenu={(e) => e.preventDefault()}
              className="select-none bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6"
            >
              {/* Question Header & Type Badge */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <span className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200/60">
                  Question {currentQuestionIndex + 1} of {totalQuestions}
                </span>

                <div className="flex items-center space-x-2">
                  <span className="text-[11px] font-extrabold uppercase px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg">
                    {currentQuestion.type === 'single' && 'Single Choice'}
                    {currentQuestion.type === 'multiple' && 'Multiple Response'}
                    {currentQuestion.type === 'true_false' && 'True / False'}
                    {currentQuestion.type === 'image' && 'Image-Based Question'}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-2 py-1 rounded">
                    PROTECTED CONTENT
                  </span>
                </div>
              </div>

              {/* Question Prompt */}
              <h3 className="text-base sm:text-lg font-bold text-[#0A192F] leading-snug">
                {currentQuestion.question}
              </h3>

              {/* Image if question is image-based */}
              {currentQuestion.image && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
                  <img
                    src={currentQuestion.image}
                    alt="Assessment CT Scan"
                    onContextMenu={(e) => e.preventDefault()}
                    className="max-h-72 w-full object-contain rounded-xl shadow-md select-none"
                  />
                  {currentQuestion.imageCaption && (
                    <p className="text-center text-[11px] font-mono text-amber-400/90">
                      {currentQuestion.imageCaption}
                    </p>
                  )}
                </div>
              )}

              {/* Multiple response guidance hint */}
              {currentQuestion.type === 'multiple' && (
                <p className="text-xs font-semibold text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200/60">
                  Note: Select all correct answers that apply.
                </p>
              )}

              {/* Options List */}
              <div className="space-y-3 pt-1">
                {currentQuestion.options.map((opt) => {
                  const selected = isOptionSelected(currentQuestion.id, opt.id);
                  const isMultiple = currentQuestion.type === 'multiple';

                  return (
                    <div
                      key={opt.id}
                      onClick={() => handleSelectOption(currentQuestion.id, opt.id, isMultiple)}
                      className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-3.5 ${
                        selected
                          ? 'bg-amber-50/80 border-amber-400 shadow-xs ring-1 ring-amber-400/40'
                          : 'bg-slate-50/70 hover:bg-slate-100/80 border-slate-200/80 text-slate-800'
                      }`}
                    >
                      <div className="pt-0.5 shrink-0">
                        <input
                          type={isMultiple ? 'checkbox' : 'radio'}
                          name={`q-${currentQuestion.id}`}
                          checked={selected}
                          onChange={() => {}} // Handled by div onClick
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                        />
                      </div>
                      <span className={`text-xs sm:text-sm font-semibold leading-relaxed ${selected ? 'text-[#0A192F]' : 'text-slate-700'}`}>
                        {opt.text}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation Bar inside Question Box */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentQuestionIndex < totalQuestions - 1 ? (
                  <button
                    onClick={() => setCurrentQuestionIndex((prev) => Math.min(totalQuestions - 1, prev + 1))}
                    className="inline-flex items-center space-x-1.5 px-5 py-2.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-amber-400" />
                  </button>
                ) : (
                  <button
                    onClick={() => setShowSubmitModal(true)}
                    className="inline-flex items-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Assessment</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Question Navigator Sidebar Panel */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-[#0A192F]">Question Navigator</h3>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full">
                  {answeredCount}/{totalQuestions} Answered
                </span>
              </div>

              {/* Question Number Buttons Grid */}
              <div className="grid grid-cols-5 gap-2">
                {assessment.questions.map((q, idx) => {
                  const answered = isQuestionAnswered(q.id);
                  const isCurrent = idx === currentQuestionIndex;

                  return (
                    <button
                      key={q.id}
                      onClick={() => setCurrentQuestionIndex(idx)}
                      className={`h-10 rounded-xl font-bold text-xs transition-all flex items-center justify-center cursor-pointer ${
                        isCurrent
                          ? 'bg-[#0A192F] text-amber-400 ring-2 ring-amber-500 shadow-xs'
                          : answered
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                          : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {idx + 1}
                      {answered && !isCurrent && <span className="ml-0.5 text-[10px]">✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className="space-y-2 pt-2 text-[11px] text-slate-500 border-t border-slate-100">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-[#0A192F] border border-amber-400" />
                  <span>Current Question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-emerald-50 border border-emerald-300" />
                  <span>Answered Question</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded bg-slate-50 border border-slate-200" />
                  <span>Unanswered Question</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={() => setShowSubmitModal(true)}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-sm transition-all"
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal Dialog */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-5 text-center">
            <div className="w-14 h-14 bg-amber-100 text-amber-900 rounded-2xl flex items-center justify-center mx-auto shadow-xs border border-amber-200">
              <Send className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-extrabold text-[#0A192F]">Submit Assessment?</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Are you sure you want to submit your answers? You have completed{' '}
                <span className="font-bold text-slate-900">{answeredCount} of {totalQuestions}</span> questions.
              </p>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setShowSubmitModal(false)}
                className="flex-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-3 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="flex-1 text-xs font-extrabold text-slate-950 bg-amber-500 hover:bg-amber-400 py-3 rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
              >
                Submit Assessment
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
