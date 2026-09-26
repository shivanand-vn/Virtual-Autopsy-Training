import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Lock,
  Play,
  Pause,
  RotateCcw,
  RotateCw,
  Volume2,
  Maximize2,
  FileText,
  Download,
  BookOpen,
  MessageSquare,
  Save,
  Shield,
  Layers,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Video
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useCourse } from '../context/CourseContext';
import { MOCK_STUDENT } from '../types/dashboard';

export const MyCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId: paramModuleId, lessonId: paramLessonId } = useParams<{ moduleId?: string; lessonId?: string }>();
  const {
    activeCourse,
    completedTopicIds,
    toggleTopicCompletion,
    isModuleCompletedByStudent
  } = useCourse();

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

  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurriculumDrawer, setShowCurriculumDrawer] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(currentModule.id);
  const [clinicalNotes, setClinicalNotes] = useState(
    `At 14:12 timestamp: Observed sharp density gradient along petrous temporal ridge (+1450 HU) consistent with longitudinal fracture line. Note differential hypodensity representing extradural hematoma along middle cranial fossa.`
  );
  const [notesSaved, setNotesSaved] = useState(true);

  // 2. DYNAMIC TOPIC SELECTION & NUMBER CALCULATION
  const totalTopics = currentModule.topics.length;
  let currentTopicIndex = 0;

  if (paramLessonId) {
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

  // Navigation Helper
  const goToTopic = (modId: string, topId: string) => {
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/${topId}`);
  };

  // Previous & Next Button Actions
  const handlePrevious = () => {
    if (currentTopicIndex > 0) {
      const prevTopic = currentModule.topics[currentTopicIndex - 1];
      goToTopic(currentModule.id, prevTopic.id);
    }
  };

  const handleNext = () => {
    if (currentTopicIndex < totalTopics - 1) {
      const nextTopic = currentModule.topics[currentTopicIndex + 1];
      goToTopic(currentModule.id, nextTopic.id);
    } else if (isModuleCompletedByStudent(currentModule.id)) {
      navigate(`/assessment/${currentModule.id}`);
    }
  };

  const isCurrentModuleUnlocked = isModuleCompletedByStudent(currentModule.id);
  const isCurrentTopicCompleted = Boolean(completedTopicIds[currentTopic.id]);

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

            {/* NEXT BUTTON */}
            {currentTopicIndex < totalTopics - 1 ? (
              <button
                onClick={handleNext}
                className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : isCurrentModuleUnlocked ? (
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

              {/* Dynamic Curriculum Topic List */}
              <div className="space-y-2">
                {currentModule.topics.map((top, idx) => {
                  const isCurrent = top.id === currentTopic.id;
                  const isDone = Boolean(completedTopicIds[top.id]);

                  return (
                    <div
                      key={top.id}
                      onClick={() => {
                        goToTopic(currentModule.id, top.id);
                        setShowCurriculumDrawer(false);
                      }}
                      className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs cursor-pointer transition-all ${
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
                          {isDone ? '✓' : idx + 1}
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
                            <span>{top.contentType === 'video' ? 'Video Lesson' : 'Text Lesson'}</span>
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2 shrink-0">
                        {isCurrent && (
                          <span className="bg-amber-200/80 text-amber-900 text-[10px] font-extrabold px-2 py-0.5 rounded-md">
                            CURRENT
                          </span>
                        )}
                        <span className={`text-[11px] ${isDone ? 'text-emerald-700 font-bold' : 'text-slate-400'}`}>
                          {isDone ? '✓ Done' : '○ Pending'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                <span className="text-[11px] text-slate-400">Select any topic to open its learning stream.</span>
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
            {/* Active Topic Header Banner */}
            <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                  <span>Topic {currentTopicIndex + 1} of {totalTopics}</span>
                  <span>•</span>
                  <span className="capitalize">{currentTopic.contentType} Lesson</span>
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
                <span>{isCurrentTopicCompleted ? '✓ Completed' : 'Mark as Completed'}</span>
              </button>
            </div>

            {/* DYNAMIC TOPIC CONTENT SURFACE (VIDEO VS DESCRIPTION TEXT) */}
            {currentTopic.contentType === 'description' ? (
              <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Educational Lesson Content</span>
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
                    <span>• 256-BIT DICOM-RT ENCRYPTED</span>
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

            {/* MODULE LIST WITH TOPIC PROGRESS & ASSESSMENT STATUS */}
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
                                  Topics completed: {compCount} / {totalCount}
                                </span>
                                <span>•</span>
                                <span>{mod.duration}</span>
                                <span>•</span>
                                <span className="text-amber-700 font-bold">{mod.cmeCredits} CME Pts</span>
                              </div>
                            </div>
                          </div>

                          {/* Assessment Status Badge & Expand Toggle */}
                          <div className="flex items-center space-x-2 shrink-0">
                            {unlocked ? (
                              <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                <span>✓ Assessment Available</span>
                              </span>
                            ) : (
                              <span className="inline-flex items-center space-x-1 text-xs px-3 py-1 rounded-full font-bold bg-slate-100 text-slate-600 border border-slate-200">
                                <Lock className="w-3.5 h-3.5 text-slate-400" />
                                <span>🔒 Assessment Locked</span>
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

                        {/* Progress Bar & Assessment Action Bar */}
                        <div className="space-y-2 pt-1 border-t border-slate-100">
                          <div className="flex justify-between items-center text-xs font-bold text-slate-600">
                            <span>Module Progress</span>
                            <span className={unlocked ? 'text-emerald-700 font-extrabold' : 'text-amber-700 font-extrabold'}>
                              {progPercent}% {unlocked && '(✓ Completed)'}
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

                          {/* Action Button: Take Assessment vs Locked Assessment */}
                          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                            <span className="text-xs text-slate-500">
                              {unlocked ? (
                                <span className="text-emerald-700 font-bold flex items-center space-x-1">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>All required topics completed. Assessment ready.</span>
                                </span>
                              ) : (
                                <span className="text-slate-500">
                                  Complete all topics in this module to unlock assessment ({incompleteCount} remaining).
                                </span>
                              )}
                            </span>

                            {unlocked ? (
                              <button
                                onClick={() => navigate(`/assessment/${mod.id}`)}
                                className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                              >
                                <span>Take Assessment</span>
                                <ArrowRight className="w-4 h-4" />
                              </button>
                            ) : (
                              <div className="relative group">
                                <button
                                  disabled
                                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-slate-100 text-slate-400 font-bold text-xs rounded-xl border border-slate-200 cursor-not-allowed opacity-75"
                                >
                                  <Lock className="w-3.5 h-3.5 text-slate-400" />
                                  <span>🔒 Assessment Locked</span>
                                </button>
                                <div className="absolute bottom-full mb-2 right-0 hidden group-hover:block bg-slate-900 text-white text-[11px] p-2.5 rounded-xl shadow-lg w-56 text-center z-20">
                                  Complete the remaining {incompleteCount} topic{incompleteCount === 1 ? '' : 's'} to unlock this assessment.
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Interactive Topics List Drawer */}
                        {isExpanded && (
                          <div className="space-y-2 pt-3 border-t border-slate-100 bg-slate-50/50 p-4 rounded-2xl">
                            <div className="flex justify-between items-center text-xs font-bold text-slate-700 mb-2">
                              <span>Topics in Module {mod.moduleNumber}</span>
                              <span className="text-[11px] text-slate-400 font-normal">
                                Click a topic to navigate or toggle completion
                              </span>
                            </div>

                            {mod.topics.map((top, idx) => {
                              const isCompleted = Boolean(completedTopicIds[top.id]);
                              const isCurrentTopicActive = mod.id === currentModule.id && top.id === currentTopic.id;

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
                                      {isCompleted ? '✓' : ''}
                                    </div>
                                    <span className={`truncate ${isCurrentTopicActive ? 'text-slate-950 font-extrabold' : ''}`}>
                                      {idx + 1}. {top.title}
                                    </span>
                                  </div>

                                  <div className="flex items-center space-x-3 text-[11px] shrink-0 ml-2">
                                    {isCurrentTopicActive && (
                                      <span className="bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded text-[10px]">
                                        ACTIVE
                                      </span>
                                    )}
                                    <span className={isCompleted ? 'text-emerald-700 font-bold' : 'text-slate-400'}>
                                      {isCompleted ? '✓ Completed' : '○ Not Completed'}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
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
            {/* Quick Assessment Access Box */}
            <div className="bg-gradient-to-r from-slate-900 to-[#0A192F] text-white p-6 rounded-3xl border border-slate-800 shadow-lg space-y-4">
              <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                <Sparkles className="w-4 h-4" />
                <span>Current Module Assessment</span>
              </div>

              {isCurrentModuleUnlocked ? (
                <div className="space-y-3">
                  <h4 className="text-sm font-bold text-white">
                    Module {formattedModuleNumber} Assessment Ready
                  </h4>
                  <p className="text-xs text-slate-300">
                    All {totalTopics} topics completed. Submit assessment for CME credits.
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
                  <p className="text-xs text-slate-400">
                    Complete all {totalTopics} topics in this module to unlock ({totalTopics - currentModule.topics.filter(t => completedTopicIds[t.id]).length} remaining).
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
      </div>
    </DashboardLayout>
  );
};
