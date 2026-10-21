import React, { useState, useEffect, useCallback, useRef } from 'react';
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
  RefreshCw,
  Bookmark
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import type { FinalExamQuestion, ExamAttemptRecord } from '../../types/finalExam';

type ExamStage = 'intro' | 'taking' | 'confirm_modal' | 'result';

export const FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
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
  const userAnswersRef = useRef(userAnswers);
  useEffect(() => {
    userAnswersRef.current = userAnswers;
  }, [userAnswers]);

  // Marked for Review
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});

  // Visited Questions
  const [visitedQuestions, setVisitedQuestions] = useState<Record<string, boolean>>({});

  // Submission protection
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Anti-cheat & Security States
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [tabSwitchCount, setTabSwitchCount] = useState<number>(0);
  const tabSwitchCountRef = useRef(tabSwitchCount);
  useEffect(() => {
    tabSwitchCountRef.current = tabSwitchCount;
  }, [tabSwitchCount]);
  const [showTabSwitchWarning, setShowTabSwitchWarning] = useState<boolean>(false);

  // Countdown Timer in seconds
  const [timeRemaining, setTimeRemaining] = useState<number>(
    (publishedExam?.duration || 45) * 60
  );

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

  // Visited Tracker
  useEffect(() => {
    if (examStage === 'taking' && currentQuestion) {
      setVisitedQuestions(prev => ({
        ...prev,
        [currentQuestion.id]: true
      }));
    }
  }, [examStage, currentQuestionIndex, currentQuestion?.id]);

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

  // Countdown timer effect
  useEffect(() => {
    if (examStage !== 'taking') return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [examStage]);

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

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

  const calculateResults = useCallback(() => {
    if (isSubmitting) return;
    setIsSubmitting(true);

    const currentAnswers = userAnswersRef.current;
    let earnedMarks = 0;

    questions.forEach(q => {
      const selected = currentAnswers[q.id] || [];

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
      tabSwitchCount: tabSwitchCountRef.current,
      answers: currentAnswers
    };

    if (publishedExam) {
      recordExamAttempt(publishedExam.id, attemptRecord);
    }
    saveStudentExamResult({
      scorePercentage: calcPercentage,
      earnedMarks,
      totalMarks: totalPossibleMarks,
      passed: isPass
    });
    exitFullscreen();
    setIsSubmitting(false);
    setExamStage('result');
  }, [
    isSubmitting,
    questions,
    totalPossibleMarks,
    currentAttemptNumber,
    publishedExam,
    recordExamAttempt,
    saveStudentExamResult,
    exitFullscreen
  ]);

  // Trigger submission automatically on timer expiry
  useEffect(() => {
    if (examStage === 'taking' && timeRemaining === 0) {
      calculateResults();
    }
  }, [examStage, timeRemaining, calculateResults]);

  if (!publishedExam) {
    return (
      <DashboardLayout headerTitle="Final Examination" headerSubtitle="FINAL EXAM">
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
    setMarkedForReview({});
    setVisitedQuestions({});
    setCurrentQuestionIndex(0);
    setTabSwitchCount(0);
    setShowTabSwitchWarning(false);
    setIsSubmitting(false);
    const durationSeconds = (publishedExam.duration || 45) * 60;
    setTimeRemaining(durationSeconds);
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
          return { ...prev, [qId]: [] }; // Allow deselecting by clicking again
        } else {
          return { ...prev, [qId]: [optionId] };
        }
      }
    });
  };

  const toggleMarkForReview = (questionId: string) => {
    setMarkedForReview(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleConfirmSubmit = () => {
    calculateResults();
  };

  // Counts for Navigator & Confirmation Modal
  const answeredCount = Object.keys(userAnswers).filter(k => userAnswers[k]?.length).length;
  const markedCount = Object.keys(markedForReview).filter(k => markedForReview[k]).length;
  const unansweredCount = totalQuestions - answeredCount;

  return (
    <>
      {/* ========================================================================= */}
      {/* STAGE 1: INTRO SCREEN (Inside DashboardLayout) */}
      {/* ========================================================================= */}
      {examStage === 'intro' && (
        <DashboardLayout headerTitle={publishedExam.title} headerSubtitle="FINAL EXAM">
          <div className="max-w-5xl mx-auto space-y-6 pb-12">
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
                  <li><strong className="text-amber-900">Permanent Lock:</strong> Once passed (≥ 70%) or upon exhausting all 3 attempts, the exam is permanently locked.</li>
                </ul>
              </div>

              {/* ACTION BANNER / CONTROLS */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Reset helper for dev/admin convenience */}
                {attemptsUsed > 0 && (
                  <button
                    type="button"
                    onClick={() => resetStudentExamHistory(publishedExam.id)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
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
                        className="px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-white font-bold rounded-2xl text-xs transition-colors cursor-pointer"
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
                        className="px-6 py-3 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={handleStartExam}
                      className="px-8 py-3.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-2xl text-sm transition-colors shadow-md inline-flex items-center space-x-2 cursor-pointer"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span>Start Attempt {currentAttemptNumber} (Question Set {currentAttemptNumber})</span>
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )}

      {/* ========================================================================= */}
      {/* STAGE 2: TAKING EXAM - ASSESSMENT REDESIGNED SCREEN */}
      {/* ========================================================================= */}
      {(examStage === 'taking' || examStage === 'confirm_modal') && currentQuestion && (
        <div
          className="fixed inset-0 z-50 bg-[#F8FAFC] text-slate-800 overflow-y-auto select-none flex flex-col font-sans"
          style={{ userSelect: 'none', WebkitUserSelect: 'none' }}
        >
          {/* EXAM TOP HEADER */}
          <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
            {/* Left: LMS Logo & Branding + Exam Title + Candidate Info */}
            <div className="flex items-center space-x-3 sm:space-x-4 min-w-0">
              <div className="flex items-center space-x-3 flex-shrink-0">
                <img
                  src="/logo.png"
                  alt="Virtual Autopsy LMS"
                  className="h-8 sm:h-9 w-auto object-contain"
                  onError={(e) => {
                    // Fallback to shield icon if logo image not found
                    (e.currentTarget as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="h-7 w-px bg-slate-200 hidden sm:block flex-shrink-0" />

              <div className="min-w-0">
                <h1 className="text-sm sm:text-base font-black text-slate-900 truncate tracking-tight">
                  {publishedExam.title || 'Final Examination'}
                </h1>
                <p className="text-[11px] sm:text-xs text-slate-500 font-medium truncate">
                  Candidate:{' '}
                  <span className="font-semibold text-slate-800">
                    {user?.fullName || 'Enrolled Student'}
                  </span>
                </p>
              </div>
            </div>

            {/* Right: Violation counter, Countdown Timer, Submit button */}
            <div className="flex items-center space-x-2.5 sm:space-x-3 flex-shrink-0">
              {/* Tab Violations Pill (Proctoring indicator) */}
              <div
                title="Monitored window focus / tab switch violations"
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors ${
                  tabSwitchCount > 0
                    ? 'bg-rose-50 text-rose-700 border-rose-300 ring-1 ring-rose-200'
                    : 'bg-slate-50 text-slate-600 border-slate-200'
                }`}
              >
                <Shield className={`w-3.5 h-3.5 ${tabSwitchCount > 0 ? 'text-rose-600' : 'text-slate-400'}`} />
                <span>Violations: {tabSwitchCount}</span>
              </div>

              {/* Countdown Timer Pill */}
              <div
                title="Remaining Exam Duration"
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold font-mono border shadow-2xs transition-colors ${
                  timeRemaining < 300
                    ? 'bg-rose-50 text-rose-700 border-rose-300 animate-pulse'
                    : 'bg-amber-50 text-amber-900 border-amber-200'
                }`}
              >
                <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
                <span>Time Left: {formatTime(timeRemaining)}</span>
              </div>

              {/* Fullscreen Re-entry button if exited */}
              {!isFullscreen && (
                <button
                  type="button"
                  onClick={enterFullscreen}
                  title="Expand to Fullscreen"
                  className="hidden md:flex items-center space-x-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-slate-600" />
                  <span>Fullscreen</span>
                </button>
              )}

              {/* Submit Exam Button */}
              <button
                type="button"
                onClick={() => setExamStage('confirm_modal')}
                className="px-4 sm:px-5 py-2 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-sm hover:shadow flex items-center space-x-1.5 cursor-pointer"
              >
                <span>Submit Exam</span>
              </button>
            </div>
          </header>

          {/* MAIN TWO-COLUMN ASSESSMENT LAYOUT */}
          <main className="max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ------------------------------------------------------------- */}
            {/* LEFT COLUMN: QUESTION & ANSWER PANEL (~73-75% width) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-4">
              {/* Tab Switch Security Warning Alert */}
              {showTabSwitchWarning && (
                <div className="p-4 bg-rose-50 border border-rose-300 rounded-2xl flex items-center justify-between text-rose-800 text-xs shadow-xs">
                  <div className="flex items-center space-x-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>
                      <strong>Proctoring Notice:</strong> Window focus was lost or a tab navigation was detected. This incident has been logged.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowTabSwitchWarning(false)}
                    className="text-xs text-rose-700 hover:text-rose-900 underline font-bold ml-3 cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              )}

              {/* Main Question Card */}
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8 space-y-6">
                {/* Question Card Header: Badge & Marks */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <div className="flex items-center space-x-2.5">
                    <span className="text-xs font-black uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
                      QUESTION {currentQuestionIndex + 1} OF {totalQuestions}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline-block">
                      {currentQuestion.type === 'single-choice' && 'Single Choice'}
                      {currentQuestion.type === 'multiple-response' && 'Multiple Choice (Select all)'}
                      {currentQuestion.type === 'true-false-combination' && 'Statement Evaluation'}
                    </span>
                  </div>

                  <div className="text-xs font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
                    Marks: <span className="font-extrabold text-amber-700">+{currentQuestion.marks || 10}</span>
                  </div>
                </div>

                {/* Question Text */}
                <div className="space-y-4">
                  <h2 className="text-base sm:text-lg lg:text-xl font-bold text-slate-900 leading-relaxed">
                    {currentQuestion.text}
                  </h2>

                  {/* Optional Question Context Image */}
                  {currentQuestion.image && (
                    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-50 max-h-96 flex items-center justify-center p-2">
                      <img
                        src={currentQuestion.image}
                        alt="Question context"
                        className="max-h-88 w-auto object-contain rounded-lg"
                      />
                    </div>
                  )}

                  {/* Dual Statements if true-false-combination */}
                  {currentQuestion.type === 'true-false-combination' && currentQuestion.statements && (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs text-slate-700">
                      <p className="font-medium">
                        <strong className="text-slate-900">Statement 1:</strong>{' '}
                        {currentQuestion.statements.statement1}
                      </p>
                      <p className="font-medium">
                        <strong className="text-slate-900">Statement 2:</strong>{' '}
                        {currentQuestion.statements.statement2}
                      </p>
                    </div>
                  )}
                </div>

                {/* Answer Options: Full-width clickable rows */}
                <div className="space-y-3 pt-2">
                  {(currentQuestion.options || []).map((opt, optIdx) => {
                    const optionLetter = String.fromCharCode(65 + optIdx); // A, B, C, D...
                    const selectedList = userAnswers[currentQuestion.id] || [];
                    const isSelected = selectedList.includes(opt.id);
                    const isMultiple = currentQuestion.type === 'multiple-response';

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => handleSelectAnswer(currentQuestion.id, opt.id, isMultiple)}
                        className={`w-full text-left p-4 rounded-xl border transition-all flex items-center justify-between group cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50/70 border-amber-500 shadow-2xs ring-1 ring-amber-500/30 text-slate-950'
                            : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3.5 flex-1 pr-4 min-w-0">
                          {/* Option Identifier Badge (A, B, C, D) */}
                          <span
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0 transition-colors ${
                              isSelected
                                ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                                : 'bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200'
                            }`}
                          >
                            {optionLetter}
                          </span>

                          {/* Option text */}
                          <span className="text-xs sm:text-sm font-medium leading-relaxed flex-1">
                            {opt.text}
                          </span>
                        </div>

                        {/* Right: Radio or Checkbox indicator */}
                        <div className="flex-shrink-0 ml-2">
                          {isMultiple ? (
                            <div
                              className={`w-5 h-5 rounded-md border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-amber-500 border-amber-500 text-slate-950'
                                  : 'border-slate-300 bg-white group-hover:border-slate-400'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                          ) : (
                            <div
                              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'border-amber-500'
                                  : 'border-slate-300 group-hover:border-slate-400'
                              }`}
                            >
                              {isSelected && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Navigation Toolbar inside Question Card */}
                <div className="flex flex-wrap items-center justify-between pt-6 border-t border-slate-100 gap-3">
                  <div className="flex items-center space-x-2.5 sm:space-x-3">
                    {/* Previous Button */}
                    <button
                      type="button"
                      disabled={currentQuestionIndex === 0}
                      onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                      className="px-4 sm:px-5 py-2.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs sm:text-sm transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center space-x-1.5 shadow-2xs cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous</span>
                    </button>

                    {/* Mark for Review Button */}
                    {(() => {
                      const isMarkedCurrent = Boolean(markedForReview[currentQuestion.id]);
                      return (
                        <button
                          type="button"
                          onClick={() => toggleMarkForReview(currentQuestion.id)}
                          className={`px-3.5 sm:px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center space-x-1.5 border shadow-2xs cursor-pointer ${
                            isMarkedCurrent
                              ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600'
                              : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border-amber-200'
                          }`}
                        >
                          <Bookmark className={`w-4 h-4 ${isMarkedCurrent ? 'fill-current' : ''}`} />
                          <span>{isMarkedCurrent ? 'Marked for Review' : 'Mark for Review'}</span>
                        </button>
                      );
                    })()}
                  </div>

                  {/* Next / Finish Action Button */}
                  <div>
                    {currentQuestionIndex < totalQuestions - 1 ? (
                      <button
                        type="button"
                        onClick={() => setCurrentQuestionIndex(prev => Math.min(totalQuestions - 1, prev + 1))}
                        className="px-5 sm:px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all flex items-center space-x-1.5 shadow-sm hover:shadow cursor-pointer"
                      >
                        <span>Next</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => setExamStage('confirm_modal')}
                        className="px-5 sm:px-6 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs sm:text-sm transition-all flex items-center space-x-1.5 shadow-sm hover:shadow cursor-pointer"
                      >
                        <span>Review & Submit</span>
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* RIGHT COLUMN: QUESTION NAVIGATOR (~25-27% width) */}
            {/* ------------------------------------------------------------- */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-4">
              <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-5 sm:p-6 space-y-5 lg:sticky lg:top-20">
                {/* Question Navigator Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black uppercase tracking-wider text-slate-800">
                    Question Navigator
                  </h3>
                  <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                    {answeredCount}/{totalQuestions} Answered
                  </span>
                </div>

                {/* 5-Column Question Grid */}
                <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
                  {questions.map((q, idx) => {
                    const isCurrent = idx === currentQuestionIndex;
                    const isAnswered = Boolean(userAnswers[q.id]?.length);
                    const isMarked = Boolean(markedForReview[q.id]);
                    const isVisited = Boolean(visitedQuestions[q.id]) || isCurrent;

                    // Compute tile styling based on state
                    let tileClasses = '';
                    if (isAnswered && isMarked) {
                      tileClasses = 'bg-purple-600 text-white border-purple-700 hover:bg-purple-700';
                    } else if (isMarked) {
                      tileClasses = 'bg-amber-500 text-slate-950 border-amber-600 hover:bg-amber-600 font-bold';
                    } else if (isAnswered) {
                      tileClasses = 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700';
                    } else if (isCurrent) {
                      tileClasses = 'bg-[#0A192F] text-white border-slate-900 hover:bg-slate-800 font-black';
                    } else if (isVisited) {
                      tileClasses = 'bg-slate-100 text-slate-700 border-slate-300 hover:bg-slate-200';
                    } else {
                      tileClasses = 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100';
                    }

                    const activeRing = isCurrent
                      ? 'ring-2 ring-offset-2 ring-[#0A192F] font-black z-10'
                      : '';

                    return (
                      <button
                        key={q.id || idx}
                        type="button"
                        onClick={() => setCurrentQuestionIndex(idx)}
                        aria-label={`Question ${idx + 1}${isAnswered ? ', Answered' : ''}${isMarked ? ', Marked for Review' : ''}${isCurrent ? ', Current' : ''}`}
                        className={`h-9 sm:h-10 rounded-xl border text-xs font-bold transition-all flex items-center justify-center cursor-pointer shadow-2xs ${tileClasses} ${activeRing}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                {/* Color Legend */}
                <div className="pt-4 border-t border-slate-100 space-y-2.5">
                  <p className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Legend
                  </p>
                  <div className="space-y-2 text-xs text-slate-600 font-medium">
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-emerald-600 flex-shrink-0 shadow-2xs" />
                      <span>Answered</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-[#0A192F] flex-shrink-0 shadow-2xs" />
                      <span>Current</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-amber-500 flex-shrink-0 shadow-2xs" />
                      <span>Marked for Review</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-purple-600 flex-shrink-0 shadow-2xs" />
                      <span>Answered & Marked</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <span className="w-3.5 h-3.5 rounded-md bg-slate-50 border border-slate-300 flex-shrink-0" />
                      <span>Not Visited</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      )}

      {/* ========================================================================= */}
      {/* SUBMISSION CONFIRMATION MODAL */}
      {/* ========================================================================= */}
      {examStage === 'confirm_modal' && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 max-w-md w-full space-y-5 text-center shadow-2xl">
            <div className="w-14 h-14 bg-amber-50 border border-amber-200 text-amber-600 rounded-2xl flex items-center justify-center mx-auto shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900">
                Submit Attempt {currentAttemptNumber}?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Please review your exam progress below. Once submitted, your score will be computed and permanently logged against your permitted attempts.
              </p>
            </div>

            {/* Summary statistics grid */}
            <div className="grid grid-cols-2 gap-2.5 p-3.5 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-left">
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Answered</span>
                <p className="text-base font-black text-emerald-600 mt-0.5">
                  {answeredCount} / {totalQuestions}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Unanswered</span>
                <p className={`text-base font-black mt-0.5 ${unansweredCount > 0 ? 'text-rose-600' : 'text-slate-600'}`}>
                  {unansweredCount}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Marked for Review</span>
                <p className="text-base font-black text-amber-600 mt-0.5">
                  {markedCount}
                </p>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-slate-100">
                <span className="text-[10px] uppercase font-bold text-slate-400">Time Left</span>
                <p className="text-base font-black text-amber-700 mt-0.5">
                  {formatTime(timeRemaining)}
                </p>
              </div>
            </div>

            {/* Unanswered warning banner */}
            {unansweredCount > 0 && (
              <div className="p-3 bg-amber-50/80 border border-amber-200 rounded-xl text-left text-xs text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <span>
                  You have <strong>{unansweredCount} unanswered question(s)</strong>. Any unattempted question will be awarded 0 marks upon submission.
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setExamStage('taking')}
                disabled={isSubmitting}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Return to Exam
              </button>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleConfirmSubmit}
                className="w-1/2 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
              >
                {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* STAGE 3: RESULT SCREEN (Inside DashboardLayout) */}
      {/* ========================================================================= */}
      {examStage === 'result' && (
        <DashboardLayout headerTitle={publishedExam.title} headerSubtitle="FINAL EXAM">
          <div className="max-w-2xl mx-auto space-y-6 pb-12">
            <div className="bg-white rounded-3xl border border-slate-200/80 p-8 shadow-xs text-center space-y-6">
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
                    className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2 shadow-sm cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Proceed to Attempt {currentAttemptNumber + 1} (Set {currentAttemptNumber + 1})</span>
                  </button>
                )}

                <button
                  onClick={() => navigate('/dashboard')}
                  className="px-6 py-2.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          </div>
        </DashboardLayout>
      )}
    </>
  );
};
