import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  FileText,
  Download,
  BookOpen,
  Save,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Video,
  UploadCloud,
  FileCheck,
  Award,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useCourse } from '../../context/CourseContext';
import { useCourseProgress } from '../../context/CourseProgressContext';

export const MyCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId: paramModuleId, lessonId: paramLessonId } = useParams<{ moduleId?: string; lessonId?: string }>();
  const {
    activeCourse,
    completedTopicIds,
    toggleTopicCompletion,
    isModuleCompletedByStudent,
    isModuleUnlocked,
    getModuleStatus,
    isTopicUnlocked,
    updateModuleAssignment
  } = useCourse();

  const { getAssessmentResult } = useCourseProgress();

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
  const currentModule =
    modules.find((m) => m.id === paramModuleId) ||
    modules.find((m) => m.status === 'published') ||
    modules[0];

  const [activeSection, setActiveSection] = useState<'topic' | 'assignment' | 'test'>(
    paramLessonId === 'assignment' ? 'assignment' : paramLessonId === 'test' ? 'test' : 'topic'
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurriculumDrawer, setShowCurriculumDrawer] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(currentModule.id);
  const [clinicalNotes, setClinicalNotes] = useState(
    `At 14:12 timestamp: Observed sharp density gradient along petrous temporal ridge (+1450 HU) consistent with longitudinal fracture line. Note differential hypodensity representing extradural hematoma along middle cranial fossa.`
  );
  const [notesSaved, setNotesSaved] = useState(true);

  // File Upload State for Assignment
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);

  // 2. DYNAMIC TOPIC SELECTION & NUMBER CALCULATION
  const totalTopics = currentModule.topics.length;
  let currentTopicIndex = 0;

  if (paramLessonId && paramLessonId !== 'assignment' && paramLessonId !== 'test') {
    const idx = currentModule.topics.findIndex((t) => t.id === paramLessonId);
    if (idx !== -1) {
      currentTopicIndex = idx;
    }
  } else {
    const nonCompIdx = currentModule.topics.findIndex((t) => !completedTopicIds[t.id]);
    if (nonCompIdx !== -1) {
      currentTopicIndex = nonCompIdx;
    }
  }

  const currentTopic = currentModule.topics[currentTopicIndex] || currentModule.topics[0];

  // Formatted 2-digit module number
  const formattedModuleNumber =
    currentModule.moduleNumber < 10 ? `0${currentModule.moduleNumber}` : `${currentModule.moduleNumber}`;

  // Previous assessment result if attempted
  const pastAssessmentResult = getAssessmentResult(currentModule.id);

  // Navigation Helpers
  const goToTopic = (modId: string, topId: string) => {
    setActiveSection('topic');
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/${topId}`);
  };

  const goToAssignment = (modId: string) => {
    setActiveSection('assignment');
    setExpandedModuleId(modId);
    if (modId !== currentModule.id) {
      navigate(`/my-course/${modId}`);
    }
  };

  const goToTest = (modId: string) => {
    setActiveSection('test');
    setExpandedModuleId(modId);
    if (modId !== currentModule.id) {
      navigate(`/my-course/${modId}`);
    }
  };

  // Previous & Next Button Actions
  const handlePrevious = () => {
    if (activeSection === 'test') {
      setActiveSection('assignment');
    } else if (activeSection === 'assignment') {
      setActiveSection('topic');
      const lastTopic = currentModule.topics[currentModule.topics.length - 1];
      if (lastTopic) {
        goToTopic(currentModule.id, lastTopic.id);
      }
    } else if (currentTopicIndex > 0) {
      const prevTopic = currentModule.topics[currentTopicIndex - 1];
      goToTopic(currentModule.id, prevTopic.id);
    }
  };

  const handleNext = () => {
    if (activeSection === 'topic') {
      if (currentTopicIndex < totalTopics - 1) {
        const nextTopic = currentModule.topics[currentTopicIndex + 1];
        goToTopic(currentModule.id, nextTopic.id);
      } else {
        setActiveSection('assignment');
      }
    } else if (activeSection === 'assignment') {
      setActiveSection('test');
    } else if (activeSection === 'test') {
      navigate(`/assessment/${currentModule.id}`);
    }
  };

  const isCurrentModuleUnlocked = isModuleCompletedByStudent(currentModule.id);
  const isCurrentTopicCompleted = Boolean(completedTopicIds[currentTopic?.id]);

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

  const handleAssignmentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setIsUploading(true);
    setTimeout(() => {
      updateModuleAssignment(activeCourse.id, currentModule.id, {
        submissionStatus: 'submitted',
        submittedFileName: selectedFile.name,
        submittedAt: new Date().toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      });
      setIsUploading(false);
      setUploadSuccessMessage(`Successfully submitted "${selectedFile.name}" for forensic evaluation.`);
    }, 700);
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
            {activeSection === 'topic' ? (
              <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md font-bold">
                Topic {currentTopicIndex + 1} of {totalTopics} ΓÇó {currentTopic?.contentType === 'video' ? 'Video' : 'Theory'} Lesson
              </span>
            ) : activeSection === 'assignment' ? (
              <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md font-bold inline-flex items-center space-x-1">
                <FileCheck className="w-3.5 h-3.5" />
                <span>Level 2: Module Assignment</span>
              </span>
            ) : (
              <span className="bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-md font-bold inline-flex items-center space-x-1">
                <Award className="w-3.5 h-3.5" />
                <span>Level 3: Module Test (Practice Quiz)</span>
              </span>
            )}
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
              disabled={activeSection === 'topic' && currentTopicIndex === 0}
              className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-2 rounded-xl transition-colors ${
                activeSection === 'topic' && currentTopicIndex === 0
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed border border-slate-200/50'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>

            {/* NEXT BUTTON */}
            {activeSection === 'topic' ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <span>{currentTopicIndex < totalTopics - 1 ? 'Next Topic' : 'Next: Assignment'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : activeSection === 'assignment' ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <span>Next: Module Test</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isCurrentModuleUnlocked ? (
              <button
                onClick={() => navigate(`/assessment/${currentModule.id}`)}
                className="inline-flex items-center space-x-1.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-2 rounded-xl shadow-md transition-all cursor-pointer"
              >
                <span>Start Module Quiz</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                disabled
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-400 bg-slate-100 px-3 py-2 rounded-xl cursor-not-allowed border border-slate-200"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Complete Topics First</span>
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

              {/* 3-LEVEL STRUCTURE IN DRAWER */}
              <div className="space-y-4">
                {/* Level 1: Topics */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    1. Educational Topics ({currentModule.topics.length} Lessons)
                  </span>
                  {currentModule.topics.map((top, idx) => {
                    const isCurrent = activeSection === 'topic' && top.id === currentTopic?.id;
                    const isDone = Boolean(completedTopicIds[top.id]);

                    return (
                      <div
                        key={top.id}
                        onClick={() => {
                          goToTopic(currentModule.id, top.id);
                          setShowCurriculumDrawer(false);
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                          isCurrent
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                            : isDone
                            ? 'bg-white border-emerald-200 hover:border-emerald-300'
                            : 'bg-slate-50 border-slate-200 hover:border-amber-300'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isDone
                                ? 'bg-emerald-500 text-white'
                                : isCurrent
                                ? 'bg-amber-500 text-slate-950 font-extrabold'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? 'Γ£ô' : idx + 1}
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

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className={`text-[11px] ${isDone ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                            {isDone ? 'Γ£ô Done' : 'Γùï Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Level 2: Module Assignment */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    2. Module Assignment
                  </span>
                  <div
                    onClick={() => {
                      goToAssignment(currentModule.id);
                      setShowCurriculumDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      activeSection === 'assignment'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center font-bold text-xs shrink-0">
                        <FileCheck className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {currentModule.assignment?.title || 'Case Report Assignment'}
                        </p>
                        <p className="text-[11px] text-slate-500">100 Marks ΓÇó Required submission</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      currentModule.assignment?.submissionStatus === 'submitted'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentModule.assignment?.submissionStatus === 'submitted' ? 'Submitted' : 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Level 3: Module Test */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    3. Module Test (Practice Quiz)
                  </span>
                  <div
                    onClick={() => {
                      goToTest(currentModule.id);
                      setShowCurriculumDrawer(false);
                    }}
                    className={`p-3 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
                      activeSection === 'test'
                        ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20'
                        : 'bg-white border-slate-200 hover:border-amber-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-[#0A192F] text-amber-400 flex items-center justify-center font-bold text-xs shrink-0">
                        <Award className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-800 truncate">
                          {currentModule.test?.title || 'Module Practice Quiz'}
                        </p>
                        <p className="text-[11px] text-slate-500">70% Pass ΓÇó Unlimited Retakes</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                      Unlimited Retakes
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Select any section to jump directly.</span>
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

        {/* Player & Drawer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Learning Content Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-4">

            {/* LEVEL 1: TOPIC PLAYER & THEORY READER */}
            {activeSection === 'topic' && currentTopic && (
              <>
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                      <span>Topic {currentTopicIndex + 1} of {totalTopics}</span>
                      <span>ΓÇó</span>
                      <span className="capitalize">{currentTopic.contentType === 'video' ? 'Video' : 'Theory'} Lesson</span>
                    </div>
                    <h2 className="text-base font-extrabold text-[#0A192F] truncate">{currentTopic.title}</h2>
                  </div>

                  {/* TOPIC COMPLETION TOGGLE BUTTON */}
                  <button
                    onClick={() => toggleTopicCompletion(currentTopic.id)}
                    className={`shrink-0 inline-flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      isCurrentTopicCompleted
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                        : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-xs'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{isCurrentTopicCompleted ? 'Γ£ô Completed' : 'Mark as Completed'}</span>
                  </button>
                </div>

                {/* DYNAMIC TOPIC CONTENT SURFACE (VIDEO VS THEORY TEXT) */}
                {currentTopic.contentType === 'theory' || (currentTopic.contentType as string) === 'description' ? (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                    <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                      <FileText className="w-4 h-4 text-amber-500" />
                      <span>Theoretical Lesson Content</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-[#0A192F]">{currentTopic.title}</h3>
                    <p className="text-xs text-slate-500 font-medium">{currentTopic.description}</p>
                    <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed space-y-3 font-medium">
                      <p>{currentTopic.content || 'No detailed text content entered for this topic yet.'}</p>
                    </div>
                  </div>
                ) : (
                  /* Video Stream Surface */
                  <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                    <div className="bg-slate-900/90 text-[10px] uppercase font-mono tracking-widest text-slate-400 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1" />
                          SECURE DRM STREAM
                        </span>
                        <span>ΓÇó 256-BIT DICOM-RT ENCRYPTED</span>
                      </div>
                      <div className="hidden sm:flex items-center space-x-2 text-slate-500">
                        <Shield className="w-3 h-3 text-amber-400" />
                        <span>WATERMARK: ALISTAIR VANCE</span>
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
                  </div>
                )}
              </>
            )}

            {/* LEVEL 2: MODULE ASSIGNMENT WORKSPACE */}
            {activeSection === 'assignment' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-md inline-block">
                      Level 2: Module Assignment
                    </span>
                    <h2 className="text-xl font-extrabold text-[#0A192F] mt-1.5">
                      {currentModule.assignment?.title || 'Module Case Study & Evidentiary Report'}
                    </h2>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-700">
                      100 Marks
                    </span>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-xl border ${
                      currentModule.assignment?.submissionStatus === 'submitted'
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-amber-50 text-amber-800 border-amber-200'
                    }`}>
                      {currentModule.assignment?.submissionStatus === 'submitted' ? 'Γ£ô Submitted' : 'Pending Submission'}
                    </span>
                  </div>
                </div>

                {/* Case Scenario & Instructions */}
                <div className="space-y-4">
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">Case Briefing & Scenario</h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {currentModule.assignment?.description ||
                        'Review the provided post-mortem volumetric acquisition. Formulate a structured diagnostic report adhering to medicolegal standards.'}
                    </p>
                  </div>

                  <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">Submission Guidelines</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      {currentModule.assignment?.instructions ||
                        'Download the case dossier worksheet. Complete all theoretical interpretations and upload your completed report in PDF format.'}
                    </p>
                    <div className="pt-2 flex items-center space-x-3 text-xs text-slate-500 font-medium">
                      <span>ΓÇó Format: PDF Document (Max 10MB)</span>
                      <span>ΓÇó Due Date: {currentModule.assignment?.dueDate || '14 Days from Enrollment'}</span>
                    </div>
                  </div>
                </div>

                {/* Template Download Button */}
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-amber-600" />
                    <div>
                      <p className="text-xs font-bold text-amber-950">
                        {currentModule.assignment?.templateFileName || 'Module_Assignment_Case_Template.pdf'}
                      </p>
                      <p className="text-[11px] text-amber-800/80">Forensic reporting worksheet and rubric guide</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => alert(`Downloading template: ${currentModule.assignment?.templateFileName || 'Module_Assignment_Case_Template.pdf'}`)}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>

                {/* Upload & Submission Form */}
                <form onSubmit={handleSubmitAssignment} className="space-y-4 pt-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0A192F]">Upload Completed Case Report</h4>

                  {uploadSuccessMessage && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center space-x-2 text-xs text-emerald-800 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span>{uploadSuccessMessage}</span>
                    </div>
                  )}

                  {currentModule.assignment?.submissionStatus === 'submitted' && !selectedFile && (
                    <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-2xl flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileCheck className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="text-xs font-extrabold text-emerald-950">
                            {currentModule.assignment?.submittedFileName || 'PMCT_Forensic_Case_Report.pdf'}
                          </p>
                          <p className="text-[11px] text-emerald-700">
                            Submitted on {currentModule.assignment?.submittedAt || 'Recent'} ΓÇó Under Faculty Review
                          </p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-800 bg-white border border-emerald-300 px-3 py-1 rounded-xl">
                        Awaiting Marks
                      </span>
                    </div>
                  )}

                  <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-slate-50/60">
                    <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                    <label className="cursor-pointer block">
                      <span className="text-xs font-bold text-amber-700 hover:underline">
                        Choose a PDF case report
                      </span>
                      <span className="text-xs text-slate-500"> or drag and drop</span>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleAssignmentFileSelect}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[11px] text-slate-400 mt-1">PDF up to 10MB</p>

                    {selectedFile && (
                      <div className="mt-3 inline-flex items-center space-x-2 bg-white px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-[#0A192F]">
                        <FileText className="w-4 h-4 text-amber-600" />
                        <span>{selectedFile.name}</span>
                        <span className="text-slate-400 text-[10px]">({(selectedFile.size / 1024).toFixed(1)} KB)</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-slate-400">
                      Assignments are reviewed by the accredited forensic pathology faculty.
                    </span>

                    <button
                      type="submit"
                      disabled={!selectedFile || isUploading}
                      className={`inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        !selectedFile || isUploading
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                          : 'bg-[#0A192F] hover:bg-slate-800 text-white font-extrabold shadow-md cursor-pointer'
                      }`}
                    >
                      <FileCheck className="w-4 h-4 text-amber-400" />
                      <span>{isUploading ? 'Uploading...' : 'Submit Report'}</span>
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* LEVEL 3: MODULE TEST (PRACTICE QUIZ) WORKSPACE */}
            {activeSection === 'test' && (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-md inline-block">
                      Level 3: Module Test
                    </span>
                    <h2 className="text-xl font-extrabold text-[#0A192F] mt-1.5">
                      {currentModule.test?.title || `Module ${formattedModuleNumber} Practice Quiz`}
                    </h2>
                  </div>

                  <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-300">
                    ≡ƒöä Unlimited Retakes Allowed
                  </span>
                </div>

                {/* Important Notice Regarding Unlimited Retakes vs Final Exam */}
                <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-2xl space-y-1.5">
                  <div className="flex items-center space-x-2 text-xs font-bold text-emerald-900">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span>Self-Paced Mastery & Unlimited Practice</span>
                  </div>
                  <p className="text-xs text-emerald-800/90 leading-relaxed font-medium">
                    Module tests are designed for self-assessment. You may retake this quiz as many times as you need to achieve complete conceptual mastery. The strict 3-attempt ceiling applies <b>only</b> to the accredited Final Exam.
                  </p>
                </div>

                {/* Test Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Time Limit</span>
                    <span className="text-base font-extrabold text-[#0A192F]">
                      {currentModule.test?.durationMinutes || 20} Mins
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Questions</span>
                    <span className="text-base font-extrabold text-[#0A192F]">
                      {currentModule.test?.totalQuestions || 5} MCQs
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Passing Mark</span>
                    <span className="text-base font-extrabold text-[#0A192F]">
                      {currentModule.test?.passingScorePercent || 70}%
                    </span>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <span className="text-[10px] font-bold text-slate-400 uppercase block">Attempts</span>
                    <span className="text-base font-extrabold text-emerald-700">Unlimited</span>
                  </div>
                </div>

                {/* Previous Result Notification if taken */}
                {pastAssessmentResult && (
                  <div className="p-4 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        Previous Attempt Result: {pastAssessmentResult.scorePercent}% ({pastAssessmentResult.passed ? 'PASSED' : 'RETAKE RECOMMENDED'})
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {pastAssessmentResult.correctAnswersCount} of {pastAssessmentResult.totalQuestions} questions answered correctly.
                      </p>
                    </div>
                    <span className={`text-xs font-extrabold px-3 py-1 rounded-xl ${
                      pastAssessmentResult.passed
                        ? 'bg-emerald-200 text-emerald-900'
                        : 'bg-amber-200 text-amber-900'
                    }`}>
                      {pastAssessmentResult.passed ? 'Passed Γ£ô' : 'Retry Quiz'}
                    </span>
                  </div>
                )}

                {/* Launch Button */}
                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <span className="text-xs text-slate-500">
                    {isCurrentModuleUnlocked
                      ? 'All educational topics are completed. You can launch your quiz now.'
                      : 'Please complete the educational lessons above before taking this quiz.'}
                  </span>

                  {isCurrentModuleUnlocked ? (
                    <button
                      onClick={() => navigate(`/assessment/${currentModule.id}`)}
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>{pastAssessmentResult ? 'Retake Practice Quiz' : 'Launch Module Quiz'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      disabled
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 cursor-not-allowed"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Quiz Locked</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* MODULE LIST WITH 3-LEVEL ACCORDION VIEW */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0A192F]">Course Curriculum Modules</h3>
                  <p className="text-xs text-slate-500">Structured into Learning Topics, Module Assignment, and Practice Quiz.</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  {modules.length} Modules Total
                </span>
              </div>

              <div className="space-y-4">
                {modules.map((mod) => {
                  const unlocked = isModuleCompletedByStudent(mod.id);
                  const isSelected = mod.id === currentModule.id;
                  const isExpanded = expandedModuleId === mod.id;
                  const compCount = mod.topics.filter((t) => completedTopicIds[t.id]).length;
                  const totalCount = mod.topics.length;
                  const progPercent = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;
                  const incompleteCount = totalCount - compCount;
                  const modPaddedNum = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;

                  return (
                    <div
                      key={mod.id}
                      className={`border rounded-2xl transition-all overflow-hidden ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/10'
                          : unlocked
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Module Header Bar */}
                      <div className="p-4 sm:p-5 space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-center space-x-3.5 min-w-0">
                            <div
                              className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-sm shrink-0 shadow-2xs ${
                                isSelected
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : unlocked
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-600'
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
                                  Lessons: {compCount} / {totalCount} Completed
                                </span>
                                <span>ΓÇó</span>
                                <span>{mod.duration}</span>
                                <span>ΓÇó</span>
                                <span className="text-amber-700 font-bold">{mod.cmeCredits} CME Pts</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 shrink-0">
                            <button
                              onClick={() => toggleModuleAccordion(mod.id)}
                              className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span>Topics Progress</span>
                            <span className={unlocked ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                              {progPercent}% {unlocked && '(Γ£ô Complete)'}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                              className={`h-2 rounded-full transition-all duration-500 ${
                                unlocked ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${progPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* 3-TIER EXPANDED CURRICULUM ACCORDION */}
                        {isExpanded && (
                          <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                            {/* Tier 1: Topics */}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                                1. Topics ({mod.topics.length} Lessons)
                              </span>

                              <div className="space-y-1.5">
                                {mod.topics.map((top, idx) => {
                                  const isCompleted = Boolean(completedTopicIds[top.id]);
                                  const isCurrentTopicActive =
                                    mod.id === currentModule.id && top.id === currentTopic?.id && activeSection === 'topic';

                                  return (
                                    <div
                                      key={top.id}
                                      className={`p-3 rounded-xl flex items-center justify-between text-xs transition-all ${
                                        isCurrentTopicActive
                                          ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold shadow-2xs'
                                          : isCompleted
                                          ? 'bg-white border border-emerald-200 text-slate-800 shadow-2xs'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                                      }`}
                                    >
                                      <div
                                        onClick={() => goToTopic(mod.id, top.id)}
                                        className="flex items-center space-x-3 min-w-0 flex-1 cursor-pointer"
                                      >
                                        <div
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            toggleTopicCompletion(top.id);
                                          }}
                                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 cursor-pointer ${
                                            isCompleted
                                              ? 'bg-emerald-500 text-white'
                                              : 'bg-slate-100 text-slate-400 border border-slate-300 hover:bg-amber-100'
                                          }`}
                                          title="Toggle topic completion state"
                                        >
                                          {isCompleted ? 'Γ£ô' : ''}
                                        </div>
                                        <span className={`truncate ${isCurrentTopicActive ? 'text-slate-950 font-extrabold' : ''}`}>
                                          {idx + 1}. {top.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-3 text-[11px] shrink-0 ml-2">
                                        <span className="text-[10px] text-slate-400">
                                          {top.contentType === 'video' ? 'Video' : 'Theory'}
                                        </span>
                                        {isCurrentTopicActive && (
                                          <span className="bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                            ACTIVE
                                          </span>
                                        )}
                                        <span className={isCompleted ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                                          {isCompleted ? 'Γ£ô Completed' : 'Γùï Pending'}
                                        </span>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Tier 2: Module Assignment */}
                            <div className="pt-2 border-t border-slate-200/80">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                                2. Module Assignment
                              </span>

                              <div
                                onClick={() => goToAssignment(mod.id)}
                                className={`p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  mod.id === currentModule.id && activeSection === 'assignment'
                                    ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold'
                                    : 'bg-white border border-slate-200 hover:border-amber-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="truncate font-bold text-slate-800">
                                    {mod.assignment?.title || 'Case Report Assignment'}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    mod.assignment?.submissionStatus === 'submitted'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {mod.assignment?.submissionStatus === 'submitted' ? 'Γ£ô Submitted' : 'Γùï Pending'}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Tier 3: Module Test */}
                            <div className="pt-2 border-t border-slate-200/80">
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                                3. Module Test (Practice Quiz)
                              </span>

                              <div
                                onClick={() => goToTest(mod.id)}
                                className={`p-3 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  mod.id === currentModule.id && activeSection === 'test'
                                    ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold'
                                    : 'bg-white border border-slate-200 hover:border-amber-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2.5 min-w-0">
                                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="truncate font-bold text-slate-800">
                                    {mod.test?.title || 'Module Comprehensive Practice Quiz'}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-2 shrink-0">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Unlimited Practice
                                  </span>
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

          {/* Right Column Curriculum Progress & Clinical Notes */}
          <div className="space-y-6">
            {/* 3-Level Quick Access Box */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0A192F] text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Module {formattedModuleNumber} Milestones</span>
              </div>

              <div className="space-y-2.5 text-xs">
                {/* Milestone 1 */}
                <div
                  onClick={() => goToTopic(currentModule.id, currentTopic?.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">1</span>
                    <span className="font-bold text-slate-200">Learning Lessons</span>
                  </div>
                  <span className={`text-[10px] font-bold ${isCurrentModuleUnlocked ? 'text-emerald-400' : 'text-amber-400'}`}>
                    {currentModule.topics.filter(t => completedTopicIds[t.id]).length}/{totalTopics} Done
                  </span>
                </div>

                {/* Milestone 2 */}
                <div
                  onClick={() => goToAssignment(currentModule.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">2</span>
                    <span className="font-bold text-slate-200">Module Assignment</span>
                  </div>
                  <span className={`text-[10px] font-bold ${
                    currentModule.assignment?.submissionStatus === 'submitted' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {currentModule.assignment?.submissionStatus === 'submitted' ? 'Γ£ô Submitted' : 'Pending'}
                  </span>
                </div>

                {/* Milestone 3 */}
                <div
                  onClick={() => goToTest(currentModule.id)}
                  className="p-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-800 border border-slate-700/80 flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 font-bold text-[10px] flex items-center justify-center">3</span>
                    <span className="font-bold text-slate-200">Module Test</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-400">
                    Unlimited Retakes
                  </span>
                </div>
              </div>

              {isCurrentModuleUnlocked ? (
                <button
                  onClick={() => navigate(`/assessment/${currentModule.id}`)}
                  className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all text-center block cursor-pointer"
                >
                  Take Module {formattedModuleNumber} Quiz
                </button>
              ) : (
                <p className="text-[11px] text-slate-400 text-center">
                  Complete all {totalTopics} topics in this module to unlock the practice quiz.
                </p>
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
      </div>
    </DashboardLayout>
  );
};
