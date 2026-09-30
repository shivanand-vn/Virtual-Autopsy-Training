import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Shield,
  Award,
  RotateCcw,
  Check,
  Maximize2,
  Minimize2,
  Lock,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourse } from '../../context/CourseContext';
import type { FinalExamQuestion } from '../../types/finalExam';

type ExamStage = 'intro' | 'taking' | 'confirm_modal' | 'result';

export const FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCourse, completedTopicIds } = useCourse();
  const { getPublishedExamByCourseId, finalExams, saveStudentExamResult } = useFinalExams();

  const allTopics = activeCourse?.modules.flatMap((m) => m.topics) || [];
  const completedTopicsCount = allTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;
  const courseCompleted = allTopics.length > 0 && completedTopicsCount === allTopics.length;

  const publishedExam = getPublishedExamByCourseId(activeCourse?.id) || finalExams.find(e => e.status === 'published');

  const [examStage, setExamStage] = useState<ExamStage>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  
  // User Answers & Flagged Questions
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});
  
  // Anti-cheat & Security States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);

  // Result State
  const [score, setScore] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);

  // Fullscreen Helper Functions
  const enterFullscreen = useCallback(async () => {
    try {
      const elem = document.documentElement;
      if (elem.requestFullscreen) {
        await elem.requestFullscreen();
      } else if ((elem as any).webkitRequestFullscreen) {
        await (elem as any).webkitRequestFullscreen();
      } else if ((elem as any).msRequestFullscreen) {
        await (elem as any).msRequestFullscreen();
      }
      setIsFullscreen(true);
    } catch (err) {
      console.warn("Fullscreen request error:", err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn("Exit fullscreen error:", err);
    }
  }, []);

  // Monitor Fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      const isFS = Boolean(document.fullscreenElement);
      setIsFullscreen(isFS);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('mozfullscreenchange', handleFullscreenChange);
      document.removeEventListener('MSFullscreenChange', handleFullscreenChange);
    };
  }, []);

  // Monitor Tab Switch & Visibility Loss during testing phase
  useEffect(() => {
    if (examStage !== 'taking' && examStage !== 'confirm_modal') return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTabSwitchCount(prev => prev + 1);
        setShowTabSwitchWarning(true);
      }
    };

    const handleWindowBlur = () => {
      setTabSwitchCount(prev => prev + 1);
      setShowTabSwitchWarning(true);
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleWindowBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleWindowBlur);
    };
  }, [examStage]);

  // Global Anti-Copy / Anti-Key Shortcut Restrictions during testing phase
  useEffect(() => {
    if (examStage !== 'taking' && examStage !== 'confirm_modal') return;

    const preventCopyCutPaste = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Block Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+A, Ctrl+P, Ctrl+U, Ctrl+S, F12, Alt+Tab
      const key = e.key.toLowerCase();
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;

      if (
        (isCtrlOrCmd && ['c', 'v', 'x', 'a', 'p', 'u', 's'].includes(key)) ||
        e.key === 'F12' ||
        (e.altKey && e.key === 'Tab')
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    document.addEventListener('copy', preventCopyCutPaste, true);
    document.addEventListener('cut', preventCopyCutPaste, true);
    document.addEventListener('paste', preventCopyCutPaste, true);
    document.addEventListener('contextmenu', preventCopyCutPaste, true);
    document.addEventListener('selectstart', preventCopyCutPaste, true);
    window.addEventListener('keydown', handleKeyDown, true);

    return () => {
      document.removeEventListener('copy', preventCopyCutPaste, true);
      document.removeEventListener('cut', preventCopyCutPaste, true);
      document.removeEventListener('paste', preventCopyCutPaste, true);
      document.removeEventListener('contextmenu', preventCopyCutPaste, true);
      document.removeEventListener('selectstart', preventCopyCutPaste, true);
      window.removeEventListener('keydown', handleKeyDown, true);
    };
  }, [examStage]);

  if (!publishedExam || publishedExam.status !== 'published') {
    return (
      <DashboardLayout headerTitle="Final Examination" headerSubtitle="ACADEMY / STUDENT PORTAL / FINAL EXAM">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
          <div className="w-16 h-16 bg-amber-100 border border-amber-300 text-amber-800 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <GraduationCap className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-[#0A192F]">
            No final exam is available yet.
          </h2>

          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            The final exam for this course has not been published by the course administrator yet. Please check back later.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const questions: FinalExamQuestion[] = publishedExam.questions || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;

  const handleStartExam = async () => {
    await enterFullscreen();
    setExamStage('taking');
  };

  const handleSelectAnswer = (qId: string, optionId: string, isMultiple: boolean) => {
    setUserAnswers(prev => {
      const currentSelected = prev[qId] || [];
      if (isMultiple) {
        if (currentSelected.includes(optionId)) {
          return { ...prev, [qId]: currentSelected.filter(id => id !== optionId) };
        } else {
          return { ...prev, [qId]: [...currentSelected, optionId] };
        }
      } else {
        return { ...prev, [qId]: [optionId] };
      }
    });
  };

  const calculateResults = () => {
    let earnedMarks = 0;

    questions.forEach(q => {
      const selected = userAnswers[q.id] || [];

      if (q.type === 'single-choice' || q.type === 'true-false-combination') {
        if (selected.length === 1 && selected[0] === q.correctAnswer) {
          earnedMarks += Number(q.marks) || 1;
        }
      } else if (q.type === 'multiple-response') {
        const correctSet = q.correctAnswers || [];
        const isMatch =
          selected.length === correctSet.length &&
          selected.every(ans => correctSet.includes(ans));

        if (isMatch) {
          earnedMarks += Number(q.marks) || 1;
        }
      }
    });

    const totalPossibleMarks = publishedExam.totalMarks || 1;
    const calcPercentage = Math.round((earnedMarks / totalPossibleMarks) * 100);
    const passBenchmark = publishedExam.passPercentage || 70;
    const isPassed = calcPercentage >= passBenchmark;

    setScore(earnedMarks);
    setPercentage(calcPercentage);
    setPassed(isPassed);

    saveStudentExamResult({
      scorePercentage: calcPercentage,
      earnedMarks,
      totalMarks: totalPossibleMarks,
      passed: isPassed
    });

    exitFullscreen();
    setExamStage('result');
  };

  const handleConfirmSubmit = () => {
    calculateResults();
  };

  return (
    <DashboardLayout headerTitle={publishedExam.title} headerSubtitle="ACADEMY / STUDENT PORTAL / FINAL EXAM">
      <div className="max-w-5xl mx-auto space-y-6 pb-12">
        
        {/* STAGE 1: INTRO SCREEN */}
        {examStage === 'intro' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-6">
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                  Fellowship Final Examination
                </span>
                <h1 className="text-2xl font-black text-[#0A192F]">{publishedExam.title}</h1>
                {publishedExam.description && (
                  <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">{publishedExam.description}</p>
                )}
              </div>
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center flex-shrink-0">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">{publishedExam.duration || 60} Minutes</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Questions</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">{totalQuestions} Questions</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                <p className="text-lg font-black text-amber-700 mt-0.5">{publishedExam.totalMarks} Pts</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Benchmark</p>
                <p className="text-lg font-black text-emerald-600 mt-0.5">{publishedExam.passPercentage || 70}%</p>
              </div>
            </div>

            <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-2 text-xs text-amber-950">
              <h4 className="font-extrabold flex items-center space-x-2 text-amber-900">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Strict Examination Proctoring Security Rules</span>
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-amber-950 font-medium">
                <li><strong className="text-amber-900">Mandatory Fullscreen:</strong> The examination runs in enforced Fullscreen mode. Exiting fullscreen will pause testing until re-entered.</li>
                <li><strong className="text-amber-900">No Tab Switching:</strong> Switching tabs or navigating away from the examination window is strictly prohibited and logged as a violation.</li>
                <li><strong className="text-amber-900">No Copy / Paste / Context Menu:</strong> Copying question text, selection, right-clicking, and keyboard shortcuts are disabled.</li>
              </ul>
            </div>

            {!courseCompleted && (
              <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-xs text-rose-800 font-bold">
                <div className="flex items-center space-x-2">
                  <Lock className="w-4 h-4 text-rose-600 flex-shrink-0" />
                  <span>Course Modules Incomplete: You must complete 100% of course topics to unlock and start the Final Examination.</span>
                </div>
                <button
                  onClick={() => navigate('/my-course')}
                  className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-extrabold transition-colors shrink-0"
                >
                  Go to My Course
                </button>
              </div>
            )}

            <div className="flex items-center justify-end pt-2">
              <button
                onClick={handleStartExam}
                disabled={!courseCompleted}
                className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-40 disabled:hover:bg-amber-500 text-slate-950 font-black rounded-2xl text-sm transition-colors shadow-md inline-flex items-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
              >
                <Maximize2 className="w-4 h-4" />
                <span>Start Final Exam (Full Screen)</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}

        {/* STAGE 2: TAKING EXAM - FULLSCREEN WRAPPER CONTAINER */}
        {(examStage === 'taking' || examStage === 'confirm_modal') && currentQuestion && (
          <div className="fixed inset-0 z-50 bg-slate-900 text-slate-100 overflow-y-auto p-4 sm:p-6 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
            <div className="max-w-5xl mx-auto space-y-5 my-auto">
              
              {/* TOP BAR: TIMER, PROCTOR STATUS & ACTIONS */}
              <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Question {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-extrabold rounded-full border border-amber-500/30">
                    {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                  {tabSwitchCount > 0 && (
                    <span className="text-[11px] px-2.5 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded-full border border-rose-500/30">
                      Tab Switch Violations: {tabSwitchCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-amber-400 text-xs font-bold font-mono">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{publishedExam.duration || 60}:00</span>
                  </div>

                  {!isFullscreen && (
                    <button
                      onClick={enterFullscreen}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                      <span>Re-enter Full Screen</span>
                    </button>
                  )}

                  <button
                    onClick={() => setExamStage('confirm_modal')}
                    className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-xs"
                  >
                    Submit Exam
                  </button>
                </div>
              </div>

              {/* FULLSCREEN EXIT OVERLAY WARNING */}
              {!isFullscreen && (
                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between text-amber-300 text-xs font-bold">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                    <span>Full Screen Mode Exited! Please re-enter full screen to continue your exam seamlessly.</span>
                  </div>
                  <button
                    onClick={enterFullscreen}
                    className="px-4 py-1.5 bg-amber-500 text-slate-950 rounded-xl text-xs font-extrabold hover:bg-amber-400 transition-colors"
                  >
                    Enter Full Screen
                  </button>
                </div>
              )}

              {/* QUESTION CARD VIEW */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
                <div className="space-y-2 border-b border-slate-700/60 pb-4">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-700 text-amber-400 px-2.5 py-1 rounded-md border border-slate-600">
                    {currentQuestion.type.replace('-', ' ')}
                  </span>
                  <h3 className="text-lg font-bold text-white leading-relaxed pt-1">
                    {currentQuestion.text}
                  </h3>
                </div>

                {/* Optional Image */}
                {currentQuestion.image && (
                  <div className="my-4 rounded-2xl overflow-hidden border border-slate-700 bg-black/40 p-2 max-w-2xl">
                    <img
                      src={currentQuestion.image}
                      alt="Exam vignette visual"
                      className="max-h-80 w-full object-contain rounded-xl"
                    />
                  </div>
                )}

                {/* True/False Statements */}
                {currentQuestion.type === 'true-false-combination' && currentQuestion.statements && (
                  <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700 space-y-2 text-xs font-medium text-slate-200">
                    <p><span className="font-bold text-amber-400">Statement 1:</span> {currentQuestion.statements.statement1}</p>
                    <p><span className="font-bold text-amber-400">Statement 2:</span> {currentQuestion.statements.statement2}</p>
                  </div>
                )}

                {/* Options List */}
                {currentQuestion.options && (
                  <div className="space-y-3 pt-2">
                    {currentQuestion.options.map((opt) => {
                      const selectedList = userAnswers[currentQuestion.id] || [];
                      const isSelected = selectedList.includes(opt.id);
                      const isMultiple = currentQuestion.type === 'multiple-response';

                      return (
                        <button
                          key={opt.id}
                          type="button"
                          onClick={() => handleSelectAnswer(currentQuestion.id, opt.id, isMultiple)}
                          className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start space-x-3.5 ${
                            isSelected
                              ? 'bg-amber-500/20 border-amber-500 text-white font-semibold ring-1 ring-amber-500/40'
                              : 'bg-slate-900/60 border-slate-700 hover:border-slate-500 text-slate-300'
                          }`}
                        >
                          <div
                            className={`mt-0.5 w-5 h-5 flex-shrink-0 flex items-center justify-center border transition-colors ${
                              isMultiple ? 'rounded-md' : 'rounded-full'
                            } ${
                              isSelected
                                ? 'bg-amber-500 border-amber-500 text-slate-950'
                                : 'bg-slate-800 border-slate-600'
                            }`}
                          >
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            )}
                          </div>
                          <span className="text-xs sm:text-sm leading-relaxed">{opt.text}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* QUESTION PALETTE & NAVIGATION CONTROLS */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-5 shadow-lg flex items-center justify-between">
                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                  disabled={currentQuestionIndex === 0}
                  className="px-4 py-2.5 bg-slate-700 hover:bg-slate-600 disabled:opacity-30 disabled:hover:bg-slate-700 text-white font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center space-x-1.5 overflow-x-auto max-w-md px-2">
                  {questions.map((q, idx) => {
                    const isAnswered = (userAnswers[q.id] || []).length > 0;
                    const isCurrent = idx === currentQuestionIndex;

                    return (
                      <button
                        key={q.id}
                        onClick={() => setCurrentQuestionIndex(idx)}
                        className={`w-8 h-8 rounded-xl font-extrabold text-xs transition-colors flex items-center justify-center flex-shrink-0 ${
                          isCurrent
                            ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400/50'
                            : isAnswered
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                        }`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                  disabled={currentQuestionIndex === totalQuestions - 1}
                  className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 disabled:opacity-30 disabled:hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* TAB SWITCH WARNING OVERLAY MODAL */}
        {showTabSwitchWarning && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-rose-500/40 rounded-3xl p-6 text-center space-y-4 max-w-md w-full shadow-2xl">
              <div className="w-14 h-14 bg-rose-500/20 border border-rose-500/40 text-rose-400 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">
                  Security Violation Detected!
                </h3>
                <p className="text-xs text-rose-300 leading-relaxed">
                  Tab switching or window focus loss was detected. This event has been logged to proctor security (Violation #{tabSwitchCount}).
                </p>
              </div>

              <button
                onClick={() => setShowTabSwitchWarning(false)}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-md"
              >
                Acknowledge & Resume Exam
              </button>
            </div>
          </div>
        )}

        {/* SUBMISSION CONFIRMATION MODAL */}
        {examStage === 'confirm_modal' && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 text-center space-y-5 shadow-2xl">
              <div className="w-14 h-14 bg-amber-500/20 text-amber-400 border border-amber-500/40 rounded-2xl flex items-center justify-center mx-auto">
                <HelpCircle className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-white">
                  Submit Final Exam?
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Are you sure you want to submit your exam? Once submitted, your score will be calculated automatically.
                </p>
              </div>

              <div className="p-3 bg-slate-800 rounded-2xl border border-slate-700 text-xs font-bold text-slate-300 flex justify-around">
                <span>Answered: {Object.keys(userAnswers).filter(k => userAnswers[k]?.length > 0).length} / {totalQuestions}</span>
                <span>Unanswered: {totalQuestions - Object.keys(userAnswers).filter(k => userAnswers[k]?.length > 0).length}</span>
              </div>

              <div className="flex items-center justify-center space-x-3 pt-2">
                <button
                  onClick={() => setExamStage('taking')}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSubmit}
                  className="w-1/2 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-sm"
                >
                  Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STAGE 3: RESULT SCREEN */}
        {examStage === 'result' && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-6 max-w-2xl mx-auto">
            <div
              className={`w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-md border ${
                passed
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                  : 'bg-rose-100 text-rose-800 border-rose-300'
              }`}
            >
              {passed ? (
                <Award className="w-10 h-10" />
              ) : (
                <AlertTriangle className="w-10 h-10" />
              )}
            </div>

            <div className="space-y-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {passed ? 'Exam Passed' : 'Exam Failed'}
              </span>
              <h2 className="text-2xl font-black text-[#0A192F]">
                {passed ? 'Congratulations!' : 'Benchmark Not Met'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {passed
                  ? 'You have successfully passed the final examination for this course.'
                  : `You scored ${percentage}%. A minimum of ${publishedExam.passPercentage || 70}% is required to pass.`}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-xl font-black text-[#0A192F] mt-0.5">{score} / {publishedExam.totalMarks}</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Percentage</p>
                <p className="text-xl font-black text-amber-600 mt-0.5">{percentage}%</p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Result</p>
                <p className={`text-xl font-black mt-0.5 ${passed ? 'text-emerald-600' : 'text-rose-600'}`}>
                  {passed ? 'PASS' : 'FAIL'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-center space-x-4 pt-3">
              <button
                onClick={() => {
                  setExamStage('taking');
                  setCurrentQuestionIndex(0);
                  setUserAnswers({});
                  enterFullscreen();
                }}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Retake Exam</span>
              </button>

              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
