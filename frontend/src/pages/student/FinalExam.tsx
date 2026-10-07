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
  AlertCircle,
  Layers,
  FileCheck,
  RefreshCw
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourse } from '../../context/CourseContext';
import type { FinalExamQuestion, ExamAttemptRecord } from '../../types/finalExam';

type ExamStage = 'intro' | 'taking' | 'confirm_modal' | 'result';

export const FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeCourse } = useCourse();
  const {
    getPublishedExamByCourseId,
    finalExams,
    getStudentExamHistory,
    recordExamAttempt,
    saveStudentExamResult,
    resetStudentExamHistory,
    getQuestionsForAttempt
  } = useFinalExams();

  const publishedExam = getPublishedExamByCourseId(activeCourse?.id) || finalExams.find(e => e.status === 'published');

  const [examStage, setExamStage] = useState<ExamStage>('intro');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);

  // User Answers
  const [userAnswers, setUserAnswers] = useState<Record<string, string[]>>({});

  // Anti-cheat & Security States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);

  // Result State for the active session
  const [score, setScore] = useState<number>(0);
  const [percentage, setPercentage] = useState<number>(0);
  const [passed, setPassed] = useState<boolean>(false);

  // History & Attempt calculation
  const examHistory = publishedExam ? getStudentExamHistory(publishedExam.id) : null;
  const attemptsUsed = examHistory ? examHistory.attemptsUsed : 0;
  const hasPassed = examHistory ? examHistory.passed : false;
  const isExhausted = attemptsUsed >= 3 && !hasPassed;
  const isLocked = examHistory ? examHistory.locked : false;

  // Determine current attempt number (1, 2, or 3)
  const currentAttemptNumber: 1 | 2 | 3 = (Math.min(attemptsUsed + 1, 3)) as 1 | 2 | 3;

  // Load questions for the specific attempt
  const questions: FinalExamQuestion[] = publishedExam
    ? getQuestionsForAttempt(publishedExam, currentAttemptNumber)
    : [];

  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length;
  const totalPossibleMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);

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
      console.warn('Fullscreen request error:', err);
    }
  }, []);

  const exitFullscreen = useCallback(async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen();
      }
      setIsFullscreen(false);
    } catch (err) {
      console.warn('Exit fullscreen error:', err);
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

  if (!publishedExam) {
    return (
      <DashboardLayout headerTitle="Final Examination" headerSubtitle="ACADEMY / STUDENT PORTAL / FINAL EXAM">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
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

  const handleStartExam = async () => {
    if (isLocked || hasPassed || isExhausted) return;
    setUserAnswers({});
    setCurrentQuestionIndex(0);
    setTabSwitchCount(0);
    setShowTabSwitchWarning(false);
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
        if (currentSelected.includes(optionId)) {
          return { ...prev, [qId]: [] };
        } else {
          return { ...prev, [qId]: [optionId] };
        }
      }
    });
  };

  const calculateResults = () => {
    let earnedMarks = 0;

    questions.forEach(q => {
      const selected = userAnswers[q.id] || [];

      if (q.type === 'single-choice' || q.type === 'true-false-combination') {
        if (selected.length === 1 && selected[0] === q.correctAnswer) {
          earnedMarks += Number(q.marks) || 10;
        }
      } else if (q.type === 'multiple-response') {
        const correctSet = q.correctAnswers || [];
        const isMatch =
          selected.length === correctSet.length &&
          selected.every(ans => correctSet.includes(ans));

        if (isMatch) {
          earnedMarks += Number(q.marks) || 10;
        }
      }
    });

    const calcPercentage = Math.round((earnedMarks / (totalPossibleMarks || 1)) * 100);
    const isPass = calcPercentage >= 70;

    setScore(earnedMarks);
    setPercentage(calcPercentage);
    setPassed(isPass);

    // Record Attempt in permanent history
    const attemptRecord: ExamAttemptRecord = {
      attemptNumber: currentAttemptNumber,
      setUsed: currentAttemptNumber,
      score: earnedMarks,
      totalMarks: totalPossibleMarks,
      percentage: calcPercentage,
      passed: isPass,
      timestamp: new Date().toISOString(),
      tabSwitchCount,
      answers: userAnswers
    };

    recordExamAttempt(publishedExam.id, attemptRecord);
    saveStudentExamResult({
      scorePercentage: calcPercentage,
      earnedMarks,
      totalMarks: totalPossibleMarks,
      passed: isPass
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
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs space-y-7">
            {/* Header info */}
            <div className="flex items-start justify-between border-b border-slate-100 pb-6">
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                    Accredited Fellowship Final Examination
                  </span>
                  <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                    Strict 70% Pass Standard
                  </span>
                </div>
                <h1 className="text-2xl font-black text-[#0A192F]">{publishedExam.title}</h1>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {publishedExam.description ||
                    'Comprehensive multi-stage examination evaluating clinical acumen in PMCT interpretation, ballistic wound tract reconstruction, and decomposition pathology.'}
                </p>
              </div>
              <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-xs">
                <GraduationCap className="w-8 h-8" />
              </div>
            </div>

            {/* 3-ATTEMPT TRACKER MATRIX */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  <span>3-Attempt Examination Status & Set Tracking</span>
                </h3>
                <span className="text-xs text-slate-500 font-bold">
                  {attemptsUsed} of 3 Attempts Utilized
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* ATTEMPT 1 CARD */}
                {(() => {
                  const att1 = examHistory?.attempts.find(a => a.attemptNumber === 1);
                  const isCurrent = !hasPassed && attemptsUsed === 0;
                  return (
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        att1
                          ? att1.passed
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-rose-50/50 border-rose-200'
                          : isCurrent
                          ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#0A192F]">Attempt 01</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          Question Set 1
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Core Physics & Trauma</p>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                        <span>Status:</span>
                        {att1 ? (
                          <span className={att1.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {att1.passed ? `PASSED (${att1.percentage}%)` : `FAILED (${att1.percentage}%)`}
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-800">READY TO TAKE</span>
                        ) : (
                          <span className="text-slate-400">NOT REACHED</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* ATTEMPT 2 CARD */}
                {(() => {
                  const att2 = examHistory?.attempts.find(a => a.attemptNumber === 2);
                  const isCurrent = !hasPassed && attemptsUsed === 1;
                  return (
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        att2
                          ? att2.passed
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-rose-50/50 border-rose-200'
                          : isCurrent
                          ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#0A192F]">Attempt 02</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          Question Set 2
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Ballistics & Admissibility</p>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                        <span>Status:</span>
                        {att2 ? (
                          <span className={att2.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {att2.passed ? `PASSED (${att2.percentage}%)` : `FAILED (${att2.percentage}%)`}
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-800">READY TO TAKE</span>
                        ) : (
                          <span className="text-slate-400">LOCKED</span>
                        )}
                      </div>
                    </div>
                  );
                })()}

                {/* ATTEMPT 3 CARD */}
                {(() => {
                  const att3 = examHistory?.attempts.find(a => a.attemptNumber === 3);
                  const isCurrent = !hasPassed && attemptsUsed === 2;
                  return (
                    <div
                      className={`p-4 rounded-2xl border transition-all ${
                        att3
                          ? att3.passed
                            ? 'bg-emerald-50/60 border-emerald-300'
                            : 'bg-rose-50/50 border-rose-200'
                          : isCurrent
                          ? 'bg-amber-50/70 border-amber-400 shadow-xs ring-2 ring-amber-400/20'
                          : 'bg-slate-50 border-slate-200 opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-extrabold text-[#0A192F]">Attempt 03 (Final)</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-700">
                          Question Set 3
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-medium">Advanced Pathology & SUD</p>
                      <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs font-bold">
                        <span>Status:</span>
                        {att3 ? (
                          <span className={att3.passed ? 'text-emerald-700' : 'text-rose-700'}>
                            {att3.passed ? `PASSED (${att3.percentage}%)` : `FAILED (${att3.percentage}%)`}
                          </span>
                        ) : isCurrent ? (
                          <span className="text-amber-800">READY TO TAKE</span>
                        ) : (
                          <span className="text-slate-400">LOCKED</span>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* EXAM PARAMETERS */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Duration</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">{publishedExam.duration || 45} Minutes</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Question Bank</p>
                <p className="text-lg font-black text-slate-800 mt-0.5">Set {currentAttemptNumber} ({totalQuestions} Qs)</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Marks</p>
                <p className="text-lg font-black text-amber-700 mt-0.5">{totalPossibleMarks} Pts</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Benchmark</p>
                <p className="text-lg font-black text-emerald-600 mt-0.5">70% Required</p>
              </div>
            </div>

            {/* PROCTORING SECURITY RULES */}
            <div className="bg-amber-50/70 border border-amber-300 rounded-2xl p-5 space-y-2 text-xs text-amber-950">
              <h4 className="font-extrabold flex items-center space-x-2 text-amber-900">
                <Shield className="w-4 h-4 text-amber-600" />
                <span>Strict Examination Proctoring Security Rules</span>
              </h4>
              <ul className="list-disc list-inside space-y-1.5 text-amber-950 font-medium">
                <li><strong className="text-amber-900">Mandatory Fullscreen:</strong> The examination runs in enforced Fullscreen mode.</li>
                <li><strong className="text-amber-900">No Tab Switching:</strong> Navigating away from the examination window is strictly logged as an infraction.</li>
                <li><strong className="text-amber-900">Multi-Set Dynamic Rotation:</strong> Each of the 3 permitted attempts serves a distinct, non-repeating question bank.</li>
                <li><strong className="text-amber-900">Permanent Lock:</strong> Once passed ($\ge 70\%$) or upon exhausting all 3 attempts, the exam is permanently locked.</li>
              </ul>
            </div>

            {/* ACTION BANNER / CONTROLS */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
              {/* Reset helper for dev/admin convenience */}
              {attemptsUsed > 0 && (
                <button
                  type="button"
                  onClick={() => resetStudentExamHistory(publishedExam.id)}
                  className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-flex items-center space-x-1.5 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset Exam History (Admin / Testing)</span>
                </button>
              )}

              <div className="ml-auto">
                {hasPassed ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100 border border-emerald-300 px-4 py-2 rounded-xl">
                      ✓ Fellowship Final Exam Passed ({examHistory?.bestPercentage}%)
                    </span>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : isExhausted ? (
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-extrabold text-rose-700 bg-rose-100 border border-rose-300 px-4 py-2 rounded-xl">
                      ✕ All 3 Attempts Exhausted • Exam Permanently Locked
                    </span>
                    <button
                      onClick={() => navigate('/dashboard')}
                      className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-2xl text-xs transition-colors"
                    >
                      Return to Dashboard
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleStartExam}
                    className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-sm transition-colors shadow-md inline-flex items-center space-x-2"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>Start Attempt {currentAttemptNumber} (Question Set {currentAttemptNumber})</span>
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STAGE 2: TAKING EXAM - FULLSCREEN WRAPPER CONTAINER */}
        {(examStage === 'taking' || examStage === 'confirm_modal') && currentQuestion && (
          <div
            className="fixed inset-0 z-50 bg-slate-900 text-slate-100 overflow-y-auto p-4 sm:p-6 select-none"
            style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
          >
            <div className="max-w-5xl mx-auto space-y-5 my-auto">

              {/* TOP BAR: TIMER, PROCTOR STATUS & ACTIONS */}
              <div className="bg-slate-800/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-lg flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <span className="text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    Attempt {currentAttemptNumber} of 3 • Question Set {currentAttemptNumber}
                  </span>
                  <span className="text-xs text-slate-300">
                    Q{currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                  <span className="text-xs px-2.5 py-0.5 bg-amber-500/20 text-amber-300 font-extrabold rounded-full border border-amber-500/30">
                    {currentQuestion.marks} Mark{currentQuestion.marks > 1 ? 's' : ''}
                  </span>
                  {tabSwitchCount > 0 && (
                    <span className="text-[11px] px-2.5 py-0.5 bg-rose-500/20 text-rose-300 font-bold rounded-full border border-rose-500/30">
                      Tab Violations: {tabSwitchCount}
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-700 px-3.5 py-1.5 rounded-xl text-amber-400 text-xs font-bold font-mono">
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>{publishedExam.duration || 45}:00</span>
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
                    className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors shadow-sm"
                  >
                    Finish Exam
                  </button>
                </div>
              </div>

              {/* TAB SWITCH ALERT WARNING */}
              {showTabSwitchWarning && (
                <div className="p-4 bg-rose-950/80 border border-rose-500 rounded-2xl flex items-center justify-between text-rose-200 text-xs">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                    <span>
                      <strong>Security Notice:</strong> Window focus lost. Tab navigation and window switching are recorded in your attempt record.
                    </span>
                  </div>
                  <button
                    onClick={() => setShowTabSwitchWarning(false)}
                    className="text-xs text-rose-300 underline font-bold"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* QUESTION CARD */}
              <div className="bg-slate-800/80 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-extrabold text-amber-400 uppercase tracking-wider">
                    <span>Question {currentQuestionIndex + 1}</span>
                    <span>•</span>
                    <span>
                      {currentQuestion.type === 'single-choice' && 'Single Choice'}
                      {currentQuestion.type === 'multiple-response' && 'Multiple Response (Select all that apply)'}
                      {currentQuestion.type === 'true-false-combination' && 'Statement Evaluation'}
                    </span>
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-slate-100 leading-relaxed">
                    {currentQuestion.text}
                  </h3>

                  {/* Dual Statements if true-false-combination */}
                  {currentQuestion.type === 'true-false-combination' && currentQuestion.statements && (
                    <div className="p-4 bg-slate-900/80 border border-slate-700 rounded-2xl space-y-2 text-xs text-slate-300">
                      <p className="font-medium text-amber-300">{currentQuestion.statements.statement1}</p>
                      <p className="font-medium text-amber-300">{currentQuestion.statements.statement2}</p>
                    </div>
                  )}
                </div>

                {/* OPTIONS */}
                <div className="space-y-3 pt-2">
                  {(currentQuestion.options || []).map((opt) => {
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
                            ? 'bg-amber-500/20 border-amber-500 text-amber-100 shadow-md ring-1 ring-amber-500'
                            : 'bg-slate-900/60 border-slate-700/80 text-slate-300 hover:bg-slate-700/40 hover:border-slate-600'
                        }`}
                      >
                        <div
                          className={`w-6 h-6 rounded-lg border flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold transition-colors ${
                            isSelected
                              ? 'bg-amber-500 border-amber-500 text-slate-950'
                              : 'border-slate-600 text-slate-400 bg-slate-800'
                          }`}
                        >
                          {isSelected ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : null}
                        </div>
                        <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                          {opt.text}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* BOTTOM NAVIGATION */}
                <div className="flex items-center justify-between pt-6 border-t border-slate-700/70">
                  <button
                    type="button"
                    disabled={currentQuestionIndex === 0}
                    onClick={() => setCurrentQuestionIndex(prev => prev - 1)}
                    className="px-4 py-2 bg-slate-700/60 hover:bg-slate-700 text-slate-200 font-bold rounded-xl text-xs transition-colors disabled:opacity-30 disabled:cursor-not-allowed inline-flex items-center space-x-1.5"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span>Previous Question</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    {questions.map((_, idx) => {
                      const isAnswered = Boolean(userAnswers[questions[idx].id]?.length);
                      const isCurrent = idx === currentQuestionIndex;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setCurrentQuestionIndex(idx)}
                          className={`w-7 h-7 rounded-lg text-xs font-bold transition-all ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 font-black ring-2 ring-amber-400/40'
                              : isAnswered
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                              : 'bg-slate-800 text-slate-400 border border-slate-700'
                          }`}
                        >
                          {idx + 1}
                        </button>
                      );
                    })}
                  </div>

                  {currentQuestionIndex < totalQuestions - 1 ? (
                    <button
                      type="button"
                      onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setExamStage('confirm_modal')}
                      className="px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5 shadow-sm"
                    >
                      <span>Finish & Submit</span>
                      <Check className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* CONFIRMATION SUBMISSION MODAL */}
        {examStage === 'confirm_modal' && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl">
              <div className="w-14 h-14 bg-amber-500/20 border border-amber-500 text-amber-400 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1.5">
                <h3 className="text-lg font-black text-white">Submit Attempt {currentAttemptNumber}?</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  You have answered {Object.keys(userAnswers).filter(k => userAnswers[k]?.length).length} of {totalQuestions} questions. Once submitted, your score will be computed and recorded against your 3 allowed attempts.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setExamStage('taking')}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-colors"
                >
                  Continue Test
                </button>
                <button
                  type="button"
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
              {passed ? <Award className="w-10 h-10" /> : <AlertTriangle className="w-10 h-10" />}
            </div>

            <div className="space-y-2">
              <span
                className={`inline-block px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
                  passed
                    ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                    : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {passed ? `Exam Passed on Attempt ${currentAttemptNumber}` : `Attempt ${currentAttemptNumber} Not Passed`}
              </span>
              <h2 className="text-2xl font-black text-[#0A192F]">
                {passed ? 'Congratulations! Certification Granted' : 'Benchmark (70%) Not Met'}
              </h2>
              <p className="text-xs text-slate-500 leading-relaxed max-w-md mx-auto">
                {passed
                  ? 'You have successfully satisfied the 70% passing threshold for the Fellowship Final Examination. Your certification is now verified.'
                  : `You scored ${percentage}%. A strict minimum of 70% is required to pass. You have utilized Attempt ${currentAttemptNumber} of 3.`}
              </p>
            </div>

            {/* SCORE DISPLAY */}
            <div className="grid grid-cols-3 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Score</p>
                <p className="text-xl font-black text-[#0A192F] mt-0.5">{score} / {totalPossibleMarks}</p>
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

            {/* RETAKE / LOCK NOTICE */}
            {!passed && (
              <div className="p-4 rounded-2xl border text-xs text-left space-y-1.5 bg-slate-50 border-slate-200">
                {currentAttemptNumber < 3 ? (
                  <>
                    <p className="font-extrabold text-[#0A192F]">
                      Remaining Chances: {3 - currentAttemptNumber} Attempt(s) Left
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Your next attempt will load <strong>Question Set {currentAttemptNumber + 1}</strong> containing new cases to ensure diagnostic integrity.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="font-extrabold text-rose-700">
                      All 3 Attempts Exhausted
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      You have used all 3 attempts without meeting the 70% benchmark. This examination is now permanently locked.
                    </p>
                  </>
                )}
              </div>
            )}

            {/* ACTION BUTTONS */}
            <div className="flex items-center justify-center space-x-4 pt-3">
              {!passed && currentAttemptNumber < 3 && (
                <button
                  onClick={() => {
                    setExamStage('intro');
                  }}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2 shadow-sm"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Proceed to Attempt {currentAttemptNumber + 1} (Set {currentAttemptNumber + 1})</span>
                </button>
              )}

              <button
                onClick={() => navigate('/dashboard')}
                className="px-6 py-2.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm"
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
