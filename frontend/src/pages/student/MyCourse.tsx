import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  FileText,
  BookOpen,
  Save,
  Shield,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Video,
  AlertCircle,
  Upload,
  Clock,
  Send,
  XCircle,
  Download,
  RefreshCw,
  ClipboardList,
  GraduationCap
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useCourse } from '../../context/CourseContext';

export const MyCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId: paramModuleId, lessonId: paramLessonId } = useParams<{ moduleId?: string; lessonId?: string }>();
  const {
    activeCourse,
    completedTopicIds,
    markTopicCompleted,
    isTopicCompleted,
    isModuleTopicsCompleted,
    isModuleAssessmentCompleted,
    isModuleUnlocked,
    isTopicUnlocked,
    isModuleAssessmentUnlocked,
    getModuleStatus,
    submitAssignment,
    getSubmissionForTopic
  } = useCourse();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurriculumDrawer, setShowCurriculumDrawer] = useState(false);
  const [clinicalNotes, setClinicalNotes] = useState(
    `At 14:12 timestamp: Observed sharp density gradient along petrous temporal ridge (+1450 HU) consistent with longitudinal fracture line. Note differential hypodensity representing extradural hematoma along middle cranial fossa.`
  );
  const [notesSaved, setNotesSaved] = useState(true);

  // Student Assignment Form state
  const [studentResponseText, setStudentResponseText] = useState('');
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [assignmentError, setAssignmentError] = useState<string | null>(null);

  // Content endpoint reach detection state
  const [hasReachedEnd, setHasReachedEnd] = useState(false);
  const bottomSentinelRef = useRef<HTMLDivElement>(null);

  if (!activeCourse || !activeCourse.modules || activeCourse.modules.length === 0) {
    return (
      <DashboardLayout headerSubtitle="MY COURSE">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-xl mx-auto my-12">
          <div className="w-16 h-16 bg-slate-100 border border-slate-300 text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
            <BookOpen className="w-8 h-8 text-slate-400" />
          </div>
          <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-full uppercase tracking-wider">
            My Course
          </span>
          <h2 className="text-xl font-extrabold text-[#0A192F]">
            No course enrolled yet.
          </h2>
          <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
            There are currently no active courses available. Once an admin creates and publishes a course, it will appear here.
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const modules = activeCourse.modules;

  // 1. DYNAMIC MODULE SELECTION
  let currentModule = modules.find((m) => m.id === paramModuleId);
  if (!currentModule) {
    // Default to first unlocked module that is incomplete or waiting for assessment
    currentModule = modules.find((m) => isModuleUnlocked(m.id) && getModuleStatus(m.id) !== 'completed') || modules[0];
  }

  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(currentModule.id);

  // 2. DYNAMIC TOPIC SELECTION
  const totalTopics = currentModule.topics.length;
  let currentTopicIndex = 0;

  if (paramLessonId) {
    const idx = currentModule.topics.findIndex((t) => t.id === paramLessonId);
    if (idx !== -1) {
      currentTopicIndex = idx;
    }
  } else {
    // Find first unlocked incomplete topic in current module
    const firstIncomplete = currentModule.topics.findIndex((t) => !isTopicCompleted(t.id));
    if (firstIncomplete !== -1) {
      currentTopicIndex = firstIncomplete;
    }
  }

  const currentTopic = currentModule.topics[currentTopicIndex] || currentModule.topics[0];

  const currentModuleUnlocked = isModuleUnlocked(currentModule.id);
  const currentTopicUnlocked = currentModuleUnlocked && isTopicUnlocked(currentModule.id, currentTopic.id);
  const currentTopicIsCompleted = isTopicCompleted(currentTopic.id);
  const currentSubmission = getSubmissionForTopic(currentTopic.id);

  // Sync student assignment inputs with existing submission state
  useEffect(() => {
    if (currentSubmission) {
      setStudentResponseText(currentSubmission.studentResponseText || '');
      setUploadedFileName(currentSubmission.uploadedFileName || null);
    } else {
      setStudentResponseText('');
      setUploadedFileName(null);
    }
    setAssignmentError(null);
  }, [currentTopic.id, currentSubmission?.id, currentSubmission?.status]);

  const handleStudentAssignmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentResponseText.trim() && !uploadedFileName) {
      setAssignmentError('Please write a text response or attach a file before submitting.');
      return;
    }

    submitAssignment({
      studentId: 'std-001',
      studentName: 'Dr. Sarah Jenkins',
      studentEmail: 'sarah.jenkins@hospital.org',
      courseId: activeCourse.id,
      courseName: activeCourse.name,
      moduleId: currentModule.id,
      moduleTitle: currentModule.title,
      topicId: currentTopic.id,
      topicTitle: currentTopic.title,
      assignmentInstructions: currentTopic.assignmentInstructions || currentTopic.description,
      studentResponseText: studentResponseText.trim() || undefined,
      uploadedFileName: uploadedFileName || undefined
    });

    setAssignmentError(null);
  };

  // Formatted 2-digit module number
  const formattedModuleNumber =
    currentModule.moduleNumber < 10 ? `0${currentModule.moduleNumber}` : `${currentModule.moduleNumber}`;

  // Content Endpoint Detection (Scroll / Intersection Observer)
  useEffect(() => {
    if (currentTopicIsCompleted) {
      setHasReachedEnd(true);
      return;
    }

    setHasReachedEnd(false);

    // If video topic, set reached end when video starts playing or is viewed
    if (currentTopic.contentType === 'video') {
      const timer = setTimeout(() => {
        setHasReachedEnd(true);
      }, 1500);
      return () => clearTimeout(timer);
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setHasReachedEnd(true);
        }
      },
      { threshold: 0.2 }
    );

    if (bottomSentinelRef.current) {
      observer.observe(bottomSentinelRef.current);
    }

    return () => observer.disconnect();
  }, [currentTopic.id, currentTopicIsCompleted, currentTopic.contentType]);

  // Navigation Helpers
  const goToTopic = (modId: string, topId: string) => {
    if (!isTopicUnlocked(modId, topId)) return;
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/${topId}`);
  };

  const goToLatestAvailableTopic = () => {
    for (const mod of modules) {
      if (isModuleUnlocked(mod.id)) {
        for (const top of mod.topics) {
          if (!isTopicCompleted(top.id)) {
            navigate(`/my-course/${mod.id}/${top.id}`);
            return;
          }
        }
      }
    }
    // If all topics completed, go to last topic of current module
    navigate(`/my-course/${currentModule.id}/${currentTopic.id}`);
  };

  // Complete & Continue Handler
  const handleCompleteAndContinue = () => {
    if (!currentTopicIsCompleted) {
      markTopicCompleted(currentTopic.id);
    }

    if (currentTopicIndex < totalTopics - 1) {
      const nextTopic = currentModule.topics[currentTopicIndex + 1];
      navigate(`/my-course/${currentModule.id}/${nextTopic.id}`);
    } else {
      // Last topic of current module completed! Go to module assessment
      navigate(`/assessment/${currentModule.id}`);
    }
  };

  // Previous Button
  const handlePrevious = () => {
    if (currentTopicIndex > 0) {
      const prevTopic = currentModule.topics[currentTopicIndex - 1];
      navigate(`/my-course/${currentModule.id}/${prevTopic.id}`);
    }
  };

  // Next Button
  const handleNext = () => {
    if (!currentTopicIsCompleted) return;
    if (currentTopicIndex < totalTopics - 1) {
      const nextTopic = currentModule.topics[currentTopicIndex + 1];
      navigate(`/my-course/${currentModule.id}/${nextTopic.id}`);
    } else {
      navigate(`/assessment/${currentModule.id}`);
    }
  };

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClinicalNotes(e.target.value);
    setNotesSaved(false);
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
  };

  const toggleModuleAccordion = (id: string) => {
    setExpandedModuleId(expandedModuleId === id ? null : id);
  };

  return (
    <DashboardLayout headerSubtitle="MY COURSE">
      <div className="space-y-6 pb-16">
        {/* 1. DYNAMIC BREADCRUMB / COURSE HEADER CONTROL BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
            <span className="text-amber-700 font-bold">My Course</span>
            <span>/</span>
            <span className="text-slate-800 font-bold">
              Module {formattedModuleNumber}: {currentModule.title}
            </span>
            <span>/</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
              Topic {currentTopicIndex + 1} of {totalTopics}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            {/* CURRICULUM BUTTON */}
            <button
              onClick={() => setShowCurriculumDrawer(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-600" />
              <span>Curriculum</span>
            </button>

            {/* PREVIOUS BUTTON */}
            <button
              onClick={handlePrevious}
              disabled={currentTopicIndex === 0}
              className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                currentTopicIndex === 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* NEXT BUTTON (Allowed only when current topic is completed) */}
            {currentTopicIndex < totalTopics - 1 ? (
              <button
                onClick={handleNext}
                disabled={!currentTopicIsCompleted}
                className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                  currentTopicIsCompleted
                    ? 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                    : 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                }`}
                title={!currentTopicIsCompleted ? 'Complete current topic to continue' : ''}
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isModuleAssessmentUnlocked(currentModule.id) ? (
              <button
                onClick={() => navigate(`/assessment/${currentModule.id}`)}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Take Assessment</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl cursor-not-allowed border border-slate-200"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Assessment Locked</span>
              </button>
            )}
          </div>
        </div>

        {/* CURRICULUM DRAWER / MODAL */}
        {showCurriculumDrawer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[85vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-extrabold text-[#0A192F]">
                    Module {formattedModuleNumber} Curriculum
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">{currentModule.title}</p>
                </div>
                <button
                  onClick={() => setShowCurriculumDrawer(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Curriculum Topic List (NO CHECKBOXES) */}
              <div className="space-y-2">
                {currentModule.topics.map((top, idx) => {
                  const isCurrent = top.id === currentTopic.id;
                  const isDone = isTopicCompleted(top.id);
                  const isUnlocked = isTopicUnlocked(currentModule.id, top.id);

                  return (
                    <div
                      key={top.id}
                      onClick={() => {
                        if (isUnlocked) {
                          goToTopic(currentModule.id, top.id);
                          setShowCurriculumDrawer(false);
                        }
                      }}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                        !isUnlocked
                          ? 'bg-slate-100/60 border-slate-200 opacity-60 cursor-not-allowed'
                          : isCurrent
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs cursor-pointer'
                          : isDone
                          ? 'bg-white border-emerald-200 hover:border-emerald-300 cursor-pointer'
                          : 'bg-slate-50 border-slate-200 hover:border-amber-300 cursor-pointer'
                      }`}
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                            !isUnlocked
                              ? 'bg-slate-200 text-slate-400'
                              : isDone
                              ? 'bg-emerald-500 text-white'
                              : isCurrent
                              ? 'bg-amber-500 text-slate-950 font-extrabold'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {!isUnlocked ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : isDone ? '✓' : idx + 1}
                        </div>
                        <div className="min-w-0">
                          <p className={`font-bold truncate ${isCurrent ? 'text-slate-950' : 'text-slate-800'}`}>
                            {top.title}
                          </p>
                          <p className="text-[11px] text-slate-500 flex items-center space-x-1 mt-0.5">
                            {top.contentType === 'video' ? (
                              <Video className="w-3 h-3 text-amber-600 inline mr-1" />
                            ) : (
                              <FileText className="w-3 h-3 text-slate-400 inline mr-1" />
                            )}
                            <span>{top.contentType === 'video' ? 'Video Lesson' : 'Theory Lesson'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0 ml-2">
                        {!isUnlocked ? (
                          <span className="text-[11px] font-bold text-slate-400 flex items-center space-x-1">
                            <Lock className="w-3 h-3 text-slate-400" />
                            <span>Locked</span>
                          </span>
                        ) : isDone ? (
                          <span className="text-[11px] text-emerald-700 font-bold">✓ Completed</span>
                        ) : isCurrent ? (
                          <span className="bg-amber-200/80 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            CURRENT
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-400">○ Pending</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Select any unlocked topic to navigate.</span>
                <button
                  onClick={() => setShowCurriculumDrawer(false)}
                  className="px-4 py-2 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* LOCKED TOPIC OR MODULE OVERLAY SCREEN (IF USER TRIED DIRECT URL ACCESS) */}
        {!currentTopicUnlocked ? (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 text-center space-y-5 max-w-xl mx-auto my-8 shadow-xs">
            <div className="w-16 h-16 bg-amber-100 text-amber-900 border border-amber-300 rounded-3xl flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                Lesson Locked
              </span>
              <h2 className="text-xl font-extrabold text-[#0A192F]">
                {!currentModuleUnlocked ? `Module ${formattedModuleNumber} is Locked` : `${currentTopic.title} is Locked`}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-md mx-auto">
                {!currentModuleUnlocked
                  ? 'Complete the previous module topics and module assessment to unlock this module.'
                  : 'You must complete the previous lessons sequentially before accessing this topic.'}
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={goToLatestAvailableTopic}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Go to Current Unlocked Lesson</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          </div>
        ) : (
          /* UNLOCKED ACTIVE TOPIC CONTENT SURFACE & MODULES BREAKDOWN */
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Learning Content Column (2 Spans) */}
            <div className="lg:col-span-2 space-y-4">
              {/* Active Topic Header Banner (NO CHECKBOX OR MANUAL TOGGLE) */}
              <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    <span>Topic {currentTopicIndex + 1} of {totalTopics}</span>
                    <span>•</span>
                    <span className="capitalize font-bold text-slate-800">
                      {currentTopic.contentType === 'assignment'
                        ? 'Assignment Task'
                        : currentTopic.contentType === 'video'
                        ? 'Video Lesson'
                        : 'Theory Lesson'}
                    </span>
                  </div>
                  <h2 className="text-base font-extrabold text-[#0A192F] truncate">{currentTopic.title}</h2>
                </div>

                <div className="shrink-0">
                  {currentTopicIsCompleted ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>✓ Completed</span>
                    </span>
                  ) : currentSubmission?.status === 'PENDING' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                      <Clock className="w-4 h-4 text-amber-600" />
                      <span>⏳ Under Review</span>
                    </span>
                  ) : currentSubmission?.status === 'REJECTED' ? (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Action Required</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                      <span>In Progress</span>
                    </span>
                  )}
                </div>
              </div>

              {/* DYNAMIC TOPIC CONTENT SURFACE */}
              {currentTopic.contentType === 'assignment' ? (
                /* ASSIGNMENT TOPIC CONTENT SURFACE */
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                      <ClipboardList className="w-4 h-4 text-amber-500" />
                      <span>Practical Case Assignment</span>
                    </div>
                    {currentTopic.referenceAttachmentName && (
                      <button
                        onClick={() => alert(`Downloading reference attachment: ${currentTopic.referenceAttachmentName}`)}
                        className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-amber-400 font-bold text-xs rounded-xl transition-colors inline-flex items-center space-x-1 cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>{currentTopic.referenceAttachmentName}</span>
                      </button>
                    )}
                  </div>

                  {/* Assignment Prompt / Instructions */}
                  <div className="space-y-2">
                    <h3 className="text-lg font-extrabold text-[#0A192F]">{currentTopic.title}</h3>
                    <p className="text-xs text-slate-500 font-medium leading-relaxed">{currentTopic.description}</p>
                    <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl text-xs text-amber-950 font-medium leading-relaxed space-y-2">
                      <p className="font-extrabold uppercase text-[10px] text-amber-800 tracking-wider">Assignment Instructions:</p>
                      <p className="whitespace-pre-wrap">{currentTopic.assignmentInstructions || currentTopic.description}</p>
                      {currentTopic.submissionInstructions && (
                        <p className="text-[11px] text-amber-900 font-bold border-t border-amber-200/60 pt-2 mt-2">
                          📌 Submission Note: {currentTopic.submissionInstructions}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* SUBMISSION STATE HANDLING */}
                  {currentSubmission?.status === 'PENDING' ? (
                    /* STATE: PENDING ADMIN APPROVAL */
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl space-y-2">
                        <div className="flex items-center space-x-2 text-amber-900 text-xs font-extrabold">
                          <Clock className="w-4 h-4 text-amber-600 shrink-0" />
                          <span>⏳ Assignment Submitted & Waiting for Admin Approval</span>
                        </div>
                        <p className="text-xs text-amber-800 leading-relaxed">
                          Your response was submitted on <strong>{currentSubmission.submittedAt}</strong>. It is currently being reviewed by an instructor.
                          Your topic completion and access to the next topic will unlock once approved by the admin.
                        </p>
                      </div>

                      <div className="space-y-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs">
                        <span className="font-bold text-slate-400 uppercase text-[10px]">Your Submitted Response:</span>
                        <div className="p-3 bg-white border border-slate-200 rounded-xl text-slate-800 whitespace-pre-wrap font-serif">
                          {currentSubmission.studentResponseText || 'No text response attached.'}
                        </div>
                        {currentSubmission.uploadedFileName && (
                          <div className="flex items-center space-x-2 text-slate-700 font-bold pt-1">
                            <FileText className="w-4 h-4 text-amber-600" />
                            <span>Attachment: {currentSubmission.uploadedFileName}</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 flex justify-end">
                        <button
                          disabled
                          className="px-6 py-3 bg-slate-100 text-slate-400 border border-slate-200 font-bold text-xs rounded-xl cursor-not-allowed opacity-75 inline-flex items-center space-x-2"
                        >
                          <Lock className="w-4 h-4" />
                          <span>Next Topic Locked (Pending Review)</span>
                        </button>
                      </div>
                    </div>
                  ) : currentSubmission?.status === 'APPROVED' ? (
                    /* STATE: APPROVED */
                    <div className="space-y-4 pt-2">
                      <div className="p-4 bg-emerald-50 border-2 border-emerald-300 rounded-2xl space-y-2">
                        <div className="flex items-center space-x-2 text-emerald-900 text-xs font-extrabold">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span>✓ Assignment Approved by Admin! Topic Completed.</span>
                        </div>
                        <p className="text-xs text-emerald-800 leading-relaxed">
                          Great job! Your assignment submission has passed evaluation. You may now continue to the next lesson or assessment.
                        </p>
                      </div>

                      {currentSubmission.adminFeedback && (
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1 text-xs">
                          <span className="font-extrabold text-slate-700 uppercase text-[10px]">Instructor Remarks / Feedback:</span>
                          <p className="text-slate-800 font-medium italic">{currentSubmission.adminFeedback}</p>
                        </div>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          onClick={handleCompleteAndContinue}
                          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2"
                        >
                          <span>{currentTopicIndex === totalTopics - 1 ? 'Go to Module Assessment' : 'Continue to Next Topic'}</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    /* STATE: UNSUBMITTED OR REJECTED (FORM EDITABLE) */
                    <form onSubmit={handleStudentAssignmentSubmit} className="space-y-4 pt-2 border-t border-slate-100">
                      {currentSubmission?.status === 'REJECTED' && (
                        <div className="p-4 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2">
                          <div className="flex items-center space-x-2 text-rose-900 text-xs font-extrabold">
                            <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                            <span>❌ Assignment Rejected by Admin</span>
                          </div>
                          {currentSubmission.adminFeedback && (
                            <p className="text-xs text-rose-800 font-semibold leading-relaxed bg-white/70 p-3 rounded-xl border border-rose-200">
                              <strong>Admin Feedback:</strong> {currentSubmission.adminFeedback}
                            </p>
                          )}
                          <p className="text-xs text-rose-700">
                            Please revise your response text or attachment based on the feedback above and click <strong>Resubmit Assignment</strong>.
                          </p>
                        </div>
                      )}

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#0A192F]">Your Written Response / Findings *</label>
                        <textarea
                          rows={5}
                          value={studentResponseText}
                          onChange={(e) => setStudentResponseText(e.target.value)}
                          placeholder="Type your detailed clinical observations, HU density findings, or answers here..."
                          className="w-full text-xs p-3.5 rounded-2xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium leading-relaxed"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#0A192F]">Attach File / Report (Optional)</label>
                        <div className="flex items-center space-x-3">
                          <label className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 font-bold text-xs rounded-xl cursor-pointer transition-colors inline-flex items-center space-x-2">
                            <Upload className="w-4 h-4 text-amber-600" />
                            <span>Select File</span>
                            <input
                              type="file"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setUploadedFileName(file.name);
                              }}
                              className="hidden"
                            />
                          </label>
                          <span className="text-xs font-medium text-slate-600 truncate max-w-xs">
                            {uploadedFileName ? `Attached: ${uploadedFileName}` : 'No file selected'}
                          </span>
                        </div>
                      </div>

                      {assignmentError && (
                        <p className="text-xs font-bold text-rose-600 flex items-center space-x-1">
                          <AlertCircle className="w-4 h-4" />
                          <span>{assignmentError}</span>
                        </p>
                      )}

                      <div className="pt-4 border-t border-slate-100 flex justify-end">
                        <button
                          type="submit"
                          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-2 shadow-amber-500/20"
                        >
                          <Send className="w-4 h-4" />
                          <span>{currentSubmission?.status === 'REJECTED' ? 'Resubmit Assignment' : 'Submit Assignment for Approval'}</span>
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ) : currentTopic.contentType === 'description' || currentTopic.contentType === 'theory' ? (
                /* Theory / Text Lesson Surface */
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <span>Educational Theory Content</span>
                  </div>

                  <h3 className="text-lg font-extrabold text-[#0A192F]">{currentTopic.title}</h3>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{currentTopic.description}</p>

                  <div className="pt-4 border-t border-slate-100 text-xs text-slate-800 leading-relaxed space-y-4 font-normal">
                    <p className="text-sm text-slate-700 font-serif leading-loose">
                      {currentTopic.content ||
                        'Post-mortem computed tomography (PMCT) represents a revolutionary advancement in forensic pathology. Unlike conventional invasive autopsies, PMCT allows multiplanar volumetric imaging of postmortem structures prior to dissection. It preserves spatial geometry, detects gas embolisms, locates radiopaque ballistic fragments, and maps traumatic bone fracture patterns with millimeter precision.'}
                    </p>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Key clinical parameters include volumetric multi-planar reformations (MPR), Hounsfield Unit (HU) density mapping across soft tissue vs bone windows, and standardized chain-of-custody documentation required for courtroom admissibility.
                    </p>

                    {/* Bottom Sentinel Element for Scroll Endpoint Detection */}
                    <div ref={bottomSentinelRef} className="h-4 w-full my-2" />
                  </div>

                  {/* CONTENT ENDPOINT REACHED BANNER & COMPLETE & CONTINUE BUTTON */}
                  <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                    {hasReachedEnd || currentTopicIsCompleted ? (
                      <div className="flex items-center space-x-2 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>✓ You have reached the end of this topic.</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-xl">
                        <Lock className="w-4 h-4 text-slate-400 shrink-0" />
                        <span>Scroll to the end of the lesson content to complete.</span>
                      </div>
                    )}

                    <button
                      onClick={handleCompleteAndContinue}
                      disabled={!hasReachedEnd && !currentTopicIsCompleted}
                      className={`w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 rounded-xl font-black text-xs transition-all shadow-md ${
                        hasReachedEnd || currentTopicIsCompleted
                          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 cursor-pointer shadow-amber-500/20'
                          : 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed opacity-60'
                      }`}
                    >
                      <span>{currentTopicIndex === totalTopics - 1 ? 'Complete & Go to Assessment' : 'Complete & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                /* Video Lesson Stream Surface */
                <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group space-y-0">
                  <div className="bg-slate-900/90 text-[10px] uppercase font-mono tracking-widest text-slate-400 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                        SECURE DRM STREAM ({currentTopic.requiredWatchPercentage || 90}% Watch Required)
                      </span>
                      <span>• 256-BIT DICOM-RT ENCRYPTED</span>
                    </div>
                    <div className="hidden sm:flex items-center space-x-2 text-slate-500">
                      <Shield className="w-3 h-3 text-amber-400" />
                      <span>WATERMARK: AUTHENTICATED STUDENT</span>
                    </div>
                  </div>

                  <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                    <img
                      src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80"
                      alt="PMCT DICOM Stream"
                      className="w-full h-full object-cover opacity-80"
                    />

                    <div className="absolute top-4 left-4 space-y-1 text-left font-mono text-[11px] max-w-[90%]">
                      <div className="bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded text-amber-400 font-bold inline-block border border-amber-500/30 truncate max-w-full">
                        {currentTopic.title.toUpperCase()}
                      </div>
                    </div>

                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform cursor-pointer"
                    >
                      {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                    </button>
                  </div>

                  {/* Video Lesson Complete & Continue Bar */}
                  <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-2 text-xs font-bold text-emerald-400">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>✓ Video lesson ready for completion ({currentTopic.requiredWatchPercentage || 90}% watched).</span>
                    </div>

                    <button
                      onClick={handleCompleteAndContinue}
                      className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <span>{currentTopicIndex === totalTopics - 1 ? 'Complete & Go to Assessment' : 'Complete & Continue'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* MODULE LIST ACCORDION WITH THE 4 CLEAR MODULE STATUSES */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h3 className="font-extrabold text-base text-[#0A192F]">Course Curriculum Modules</h3>
                    <p className="text-xs text-slate-500">Complete every topic in a module to unlock its assessment.</p>
                  </div>
                  <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    {modules.length} Modules Total
                  </span>
                </div>

                <div className="space-y-4">
                  {modules.map((mod) => {
                    const modStatus = getModuleStatus(mod.id);
                    const isUnlocked = isModuleUnlocked(mod.id);
                    const isSelected = mod.id === currentModule.id;
                    const isExpanded = expandedModuleId === mod.id;

                    const compCount = mod.topics.filter((t) => isTopicCompleted(t.id)).length;
                    const totalCount = mod.topics.length;
                    const progPercent = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;
                    const modPaddedNum = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;

                    return (
                      <div
                        key={mod.id}
                        className={`border rounded-2xl transition-all overflow-hidden ${
                          isSelected
                            ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/10'
                            : modStatus === 'completed'
                            ? 'border-emerald-300 bg-emerald-50/10'
                            : isUnlocked
                            ? 'border-slate-200 bg-white'
                            : 'border-slate-200 bg-slate-50/60 opacity-80'
                        }`}
                      >
                        {/* Module Header Bar */}
                        <div className="p-4 sm:p-5 space-y-4">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div className="flex items-center space-x-3.5 min-w-0">
                              <div
                                className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                                  modStatus === 'completed'
                                    ? 'bg-emerald-500 text-white'
                                    : isSelected
                                    ? 'bg-amber-500 text-slate-950 font-black'
                                    : isUnlocked
                                    ? 'bg-slate-800 text-amber-400'
                                    : 'bg-slate-200 text-slate-500'
                                }`}
                              >
                                {modPaddedNum}
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-bold text-sm text-[#0A192F] truncate">
                                  Module {mod.moduleNumber}: {mod.title}
                                </h4>
                                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 mt-1">
                                  <span className="font-bold text-slate-700">
                                    Topics completed: {compCount} / {totalCount}
                                  </span>
                                  <span>•</span>
                                  <span>{mod.duration}</span>
                                  <span>•</span>
                                  <span className="text-amber-700 font-bold">{mod.cmeCredits} CME Pts</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge in Module Header */}
                            <div className="flex items-center space-x-2 shrink-0">
                              {modStatus === 'locked' && (
                                <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>Locked</span>
                                </span>
                              )}

                              {(modStatus === 'in_progress' || modStatus === 'waiting_for_assessment') && (
                                <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-bold bg-amber-100 text-amber-900 border border-amber-200">
                                  <span>▶ In Progress ({compCount}/{totalCount})</span>
                                </span>
                              )}

                              {modStatus === 'completed' && (
                                <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                  <span>✓ Module Completed</span>
                                </span>
                              )}

                              <button
                                onClick={() => toggleModuleAccordion(mod.id)}
                                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                              >
                                {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                              </button>
                            </div>
                          </div>

                          {/* Module Progress Bar */}
                          <div className="space-y-1.5 pt-1 border-t border-slate-100">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                              <span>Module Progress</span>
                              <span className={modStatus === 'completed' ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                                {progPercent}% {modStatus === 'completed' && '(✓ Assessment Passed)'}
                              </span>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  modStatus === 'completed' ? 'bg-emerald-500' : 'bg-amber-500'
                                }`}
                                style={{ width: `${progPercent}%` }}
                              />
                            </div>
                          </div>

                          {/* Accordion Topics Drawer & Assessment Section */}
                          {isExpanded && (
                            <div className="space-y-4 pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-1">
                                <span>Topics in Module {mod.moduleNumber}</span>
                                <span className="text-[11px] text-slate-400 font-normal">
                                  Strict sequential progression
                                </span>
                              </div>

                              {/* Topics List */}
                              <div className="space-y-2">
                                {mod.topics.map((top, idx) => {
                                  const isDone = isTopicCompleted(top.id);
                                  const isUnlocked = isTopicUnlocked(mod.id, top.id);
                                  const isCurrentActive = mod.id === currentModule.id && top.id === currentTopic.id;

                                  return (
                                    <div
                                      key={top.id}
                                      onClick={() => {
                                        if (isUnlocked) goToTopic(mod.id, top.id);
                                      }}
                                      className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                                        !isUnlocked
                                          ? 'bg-slate-100/70 border border-slate-200 text-slate-400 opacity-60 cursor-not-allowed'
                                          : isCurrentActive
                                          ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold shadow-2xs cursor-pointer'
                                          : isDone
                                          ? 'bg-white border border-emerald-200 text-slate-800 shadow-2xs cursor-pointer'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300 cursor-pointer'
                                      }`}
                                    >
                                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                                        <div
                                          className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                                            !isUnlocked
                                              ? 'bg-slate-200 text-slate-400'
                                              : isDone
                                              ? 'bg-emerald-500 text-white'
                                              : isCurrentActive
                                              ? 'bg-amber-500 text-slate-950 font-black'
                                              : 'bg-slate-200 text-slate-600'
                                          }`}
                                        >
                                          {!isUnlocked ? <Lock className="w-3.5 h-3.5 text-slate-400" /> : isDone ? '✓' : idx + 1}
                                        </div>
                                        <span className={`truncate ${isCurrentActive ? 'text-slate-950 font-extrabold' : ''}`}>
                                          {idx + 1}. {top.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-3 text-[11px] shrink-0 ml-2">
                                        {isCurrentActive && (
                                          <span className="bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                            ACTIVE
                                          </span>
                                        )}
                                        {!isUnlocked ? (
                                          <span className="text-slate-400 font-bold">🔒 Locked</span>
                                        ) : isDone ? (
                                          <span className="text-emerald-700 font-bold">✓ Completed</span>
                                        ) : (
                                          <span className="text-slate-400">○ Pending</span>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>

                              {/* Horizontal Section Divider */}
                              <div className="pt-2 border-t border-slate-200/80" />

                              {/* MODULE ASSESSMENT SECTION (POSITIONED BELOW THE COMPLETE TOPIC LIST) */}
                              <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-2xs space-y-3">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                  <div className="space-y-0.5">
                                    <h5 className="font-extrabold text-sm text-[#0A192F] flex items-center space-x-2">
                                      <GraduationCap className="w-4.5 h-4.5 text-amber-500" />
                                      <span>Module Assessment</span>
                                    </h5>
                                    <p className="text-xs text-slate-500 font-medium">
                                      {modStatus === 'locked' ? (
                                        <span className="text-slate-400 flex items-center space-x-1">
                                          <Lock className="w-3.5 h-3.5 text-slate-400" />
                                          <span>Complete Module {mod.moduleNumber - 1} assessment to unlock.</span>
                                        </span>
                                      ) : isModuleAssessmentUnlocked(mod.id) ? (
                                        <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>✓ All topics completed. Module assessment ready.</span>
                                        </span>
                                      ) : (
                                        <span className="text-slate-600 font-medium">
                                          Complete all topics to unlock the assessment ({totalCount - compCount} remaining).
                                        </span>
                                      )}
                                    </p>
                                  </div>

                                  <div className="shrink-0">
                                    {isModuleAssessmentUnlocked(mod.id) ? (
                                      <button
                                        onClick={() => navigate(`/assessment/${mod.id}`)}
                                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                                      >
                                        <span>{modStatus === 'completed' ? 'Review Assessment' : 'Take Assessment'}</span>
                                        <ArrowRight className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        disabled
                                        className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-4 py-2 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 cursor-not-allowed opacity-75"
                                      >
                                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                                        <span>Assessment Locked</span>
                                      </button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right Column Progress Sidebar & Clinical Notes */}
            <div className="space-y-6">
              {/* Module Assessment Status Card */}
              <div className="bg-gradient-to-r from-slate-900 to-[#0A192F] text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
                <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <BookOpen className="w-4 h-4" />
                  <span>Module Assessment Status</span>
                </div>

                {isModuleAssessmentUnlocked(currentModule.id) ? (
                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-white">
                      Module {formattedModuleNumber} Assessment Ready
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      All {totalTopics} topics completed. Take assessment to complete Module {formattedModuleNumber}.
                    </p>
                    <button
                      onClick={() => navigate(`/assessment/${currentModule.id}`)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all text-center block cursor-pointer"
                    >
                      Take Module {formattedModuleNumber} Assessment
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold text-slate-300">
                      Module {formattedModuleNumber} Assessment Locked
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Complete all {totalTopics} topics in this module to unlock ({totalTopics - currentModule.topics.filter((t) => isTopicCompleted(t.id)).length} remaining).
                    </p>
                  </div>
                )}
              </div>

              {/* Clinical Observations Log */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center space-x-2">
                    <FileText className="w-4 h-4 text-amber-500" />
                    <h3 className="font-extrabold text-sm text-[#0A192F]">Clinical Observations</h3>
                  </div>
                  <span className="text-[10px] text-slate-400">Private Log</span>
                </div>

                <textarea
                  value={clinicalNotes}
                  onChange={handleNotesChange}
                  rows={5}
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed"
                  placeholder="Record timestamp observations, Hounsfield units, and preliminary findings..."
                />

                <div className="flex items-center justify-between text-xs pt-1">
                  <span className="text-[11px] text-slate-400">
                    {notesSaved ? 'Last auto-saved 2m ago' : 'Unsaved changes...'}
                  </span>
                  <button
                    onClick={handleSaveNotes}
                    className="inline-flex items-center space-x-1.5 font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-colors cursor-pointer"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Notes</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
