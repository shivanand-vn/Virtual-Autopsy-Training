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
  Download,
  BookOpen,
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
  AlertCircle,
  Paperclip
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useCourse } from '../../context/CourseContext';
import { api } from '../../lib/api';
import { useCourseProgress } from '../../context/CourseProgressContext';

export const MyCoursePage: React.FC = () => {
  const navigate = useNavigate();
  const { moduleId: paramModuleId, lessonId: paramLessonId } = useParams<{ moduleId?: string; lessonId?: string }>();
  const {
    activeCourse,
    completedTopicIds,
    markTopicCompleted,
    isModuleCompletedByStudent,
    isModuleUnlocked,
    getModuleStatus,
    isTopicUnlocked,
    updateModuleAssignment
  } = useCourse();

  const { getAssessmentResult } = useCourseProgress();

  const hasCourseData = Boolean(activeCourse && activeCourse.modules && activeCourse.modules.length > 0);
  const modules = activeCourse?.modules || [];

  // 1. DYNAMIC MODULE SELECTION
  const currentModule =
    modules.find((m) => m.id === paramModuleId) ||
    modules.find((m) => m.status === 'published') ||
    modules[0] || { id: '', moduleNumber: 1, title: '', topics: [] };

  const [activeSection, setActiveSection] = useState<'topic' | 'assignment' | 'test'>(
    paramLessonId === 'assignment' ? 'assignment' : paramLessonId === 'test' ? 'test' : 'topic'
  );

  const [isPlaying, setIsPlaying] = useState(false);
  const [showCurriculumDrawer, setShowCurriculumDrawer] = useState(false);
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(currentModule.id);

  // File Upload State for Assignment
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccessMessage, setUploadSuccessMessage] = useState<string | null>(null);
  const [hasDownloadedTemplate, setHasDownloadedTemplate] = useState<boolean>(false);

  // Synchronize active section with URL param
  useEffect(() => {
    if (paramLessonId === 'assignment') {
      setActiveSection('assignment');
    } else if (paramLessonId === 'test') {
      setActiveSection('test');
    } else if (paramLessonId) {
      setActiveSection('topic');
    }
  }, [paramLessonId]);

  // Ref tracking completed topic IDs to avoid tearing down video event listeners during playback
  const completedTopicIdsRef = useRef(completedTopicIds);
  useEffect(() => {
    completedTopicIdsRef.current = completedTopicIds;
  }, [completedTopicIds]);

  // 2. STABLE TOPIC SELECTION & SEQUENTIAL GATING
  const totalTopics = currentModule.topics.length;

  // Selected topic ID state ensures active video never auto-switches when 99% progress is achieved
  const [selectedTopicId, setSelectedTopicId] = useState<string | null>(() => {
    if (paramLessonId && paramLessonId !== 'assignment' && paramLessonId !== 'test') {
      const match = currentModule.topics.find((t) => t.id === paramLessonId);
      if (match && isTopicUnlocked(currentModule.id, match.id)) {
        return match.id;
      }
    }
    // New student / default visit: start at first non-completed topic that is unlocked
    const firstNonComp = currentModule.topics.find((t) => !completedTopicIds[t.id] && isTopicUnlocked(currentModule.id, t.id));
    return firstNonComp?.id || currentModule.topics[0]?.id || null;
  });

  // Keep selectedTopicId in sync when URL paramLessonId explicitly changes
  useEffect(() => {
    if (paramLessonId && paramLessonId !== 'assignment' && paramLessonId !== 'test') {
      const match = currentModule.topics.find((t) => t.id === paramLessonId);
      if (match && isTopicUnlocked(currentModule.id, match.id)) {
        setSelectedTopicId(match.id);
      }
    }
  }, [paramLessonId, currentModule.id, currentModule.topics, isTopicUnlocked]);

  // If module changes and current selectedTopicId does not belong to the module, pick its first non-completed topic
  useEffect(() => {
    const belongs = currentModule.topics.some((t) => t.id === selectedTopicId);
    if (!belongs) {
      const firstNonComp = currentModule.topics.find((t) => !completedTopicIdsRef.current[t.id] && isTopicUnlocked(currentModule.id, t.id));
      const targetId = firstNonComp?.id || currentModule.topics[0]?.id || null;
      if (targetId) {
        setSelectedTopicId(targetId);
      }
    }
  }, [currentModule.id]);

  // Pin URL to active module & topic when visiting /my-course or /my-course/:moduleId without a lessonId
  useEffect(() => {
    if (!paramLessonId && activeSection === 'topic' && selectedTopicId) {
      navigate(`/my-course/${currentModule.id}/${selectedTopicId}`, { replace: true });
    }
  }, [paramLessonId, activeSection, currentModule.id, selectedTopicId, navigate]);

  // Resolve current active topic
  let currentTopic =
    (paramLessonId && paramLessonId !== 'assignment' && paramLessonId !== 'test'
      ? currentModule.topics.find((t) => t.id === paramLessonId)
      : null) ||
    (selectedTopicId ? currentModule.topics.find((t) => t.id === selectedTopicId) : null) ||
    currentModule.topics[0];

  // Safety check: ensure currentTopic is unlocked
  if (currentTopic && !isTopicUnlocked(currentModule.id, currentTopic.id)) {
    const firstUnlocked = currentModule.topics.find((t) => isTopicUnlocked(currentModule.id, t.id)) || currentModule.topics[0];
    if (firstUnlocked) {
      currentTopic = firstUnlocked;
    }
  }

  const currentTopicIndex = Math.max(0, currentModule.topics.findIndex((t) => t.id === currentTopic?.id));

  // Auto-redirect if student URL is pointing to a locked topic
  useEffect(() => {
    if (paramLessonId && paramLessonId !== 'assignment' && paramLessonId !== 'test') {
      const targetTopic = currentModule.topics.find((t) => t.id === paramLessonId);
      if (targetTopic && !isTopicUnlocked(currentModule.id, targetTopic.id)) {
        const firstUnlocked = currentModule.topics.find((t) => isTopicUnlocked(currentModule.id, t.id)) || currentModule.topics[0];
        if (firstUnlocked && firstUnlocked.id !== paramLessonId) {
          navigate(`/my-course/${currentModule.id}/${firstUnlocked.id}`, { replace: true });
        }
      }
    }
  }, [paramLessonId, currentModule.id, currentModule.topics, isTopicUnlocked, navigate]);

  const currentModuleUnlocked = isModuleUnlocked(currentModule.id);
  const currentTopicUnlocked = currentModuleUnlocked && isTopicUnlocked(currentModule.id, currentTopic.id);
  const isCurrentTopicCompleted = Boolean(completedTopicIds[currentTopic?.id]);

  // Count completed topics in current module
  const currentModuleCompletedCount = currentModule.topics.filter((t) => completedTopicIds[t.id]).length;

  // 3. VIDEO WATCH PROGRESS TRACKING (Fixed 99% required threshold)
  const requiredWatchPct = 99;
  const [videoProgressMap, setVideoProgressMap] = useState<Record<string, number>>(() => {
    try {
      const saved = localStorage.getItem('va_lms_video_progress_map');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {};
  });
  const currentWatchPct = currentTopic ? (videoProgressMap[currentTopic.id] || 0) : 0;

  // Floating Toast Notification for Gated Lessons
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showGatingMessage = (customMsg?: string) => {
    if (toastTimeoutRef.current) {
      clearTimeout(toastTimeoutRef.current);
    }
    const defaultMsg =
      currentTopic?.contentType === 'video'
        ? `Please watch the video completely before proceeding to the next lesson. Current progress: ${currentWatchPct}%.`
        : `Please review and confirm completion of this reading lesson before proceeding to the next lesson.`;
    setToastMessage(customMsg || defaultMsg);
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  useEffect(() => {
    try {
      localStorage.setItem('va_lms_video_progress_map', JSON.stringify(videoProgressMap));
    } catch {}
  }, [videoProgressMap]);

  // Bunny Stream iframe ref and player.js instance
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  // 4. THEORY SCROLL & READING VERIFICATION
  const [theoryReadMap, setTheoryReadMap] = useState<Record<string, boolean>>({});
  const hasReadCurrentTheory = currentTopic ? Boolean(theoryReadMap[currentTopic.id]) : false;
  const theoryScrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-resolve signed Bunny DRM Stream token if videoUrl is unsigned or needs fresh token
  const [activeVideoUrl, setActiveVideoUrl] = useState<string>('');

  useEffect(() => {
    if (!currentTopic) return;
    let rawUrl = currentTopic.videoUrl || '';
    const rawBunnyId = currentTopic.bunnyVideoId || (rawUrl ? rawUrl.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1] : null);

    if (!rawUrl && rawBunnyId && !rawBunnyId.startsWith('pmct-')) {
      rawUrl = `https://iframe.mediadelivery.net/embed/764331/${rawBunnyId}`;
    }

    if (rawUrl && rawUrl.includes('iframe.mediadelivery.net') && !rawUrl.includes('token=')) {
      const match = rawUrl.match(/embed\/\d+\/([a-zA-Z0-9-]+)/);
      const vidId = match?.[1] || rawBunnyId;
      if (vidId && !vidId.startsWith('pmct-')) {
        api.get<{ embedUrl: string }>(`/courses/stream-token/${vidId}`)
          .then((res) => {
            if (res?.data?.embedUrl) {
              setActiveVideoUrl(res.data.embedUrl);
            } else {
              setActiveVideoUrl(rawUrl);
            }
          })
          .catch(() => setActiveVideoUrl(rawUrl));
        return;
      }
    }
    setActiveVideoUrl(rawUrl);
  }, [currentTopic?.id, currentTopic?.videoUrl, currentTopic?.bunnyVideoId]);

  // Bunny Stream / Player.js & postMessage event listeners
  useEffect(() => {
    if (!currentTopic || currentTopic.contentType !== 'video') return;

    const handleMessage = (e: MessageEvent) => {
      try {
        const data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (!data) return;

        let seconds: number | undefined;
        let duration: number | undefined;

        if (data.event === 'timeupdate' || data.event === 'timeUpdate') {
          seconds = data.value?.seconds ?? data.data?.currentTime ?? data.data?.seconds ?? data.seconds;
          duration = data.value?.duration ?? data.data?.duration ?? data.duration;
        } else if (data.context === 'player.js' && data.event === 'timeupdate') {
          seconds = data.value?.seconds;
          duration = data.value?.duration;
        }

        if (seconds !== undefined && duration !== undefined && duration > 0) {
          const pct = Math.min(100, Math.round((seconds / duration) * 100));
          setVideoProgressMap((prev) => {
            const curr = prev[currentTopic.id] || 0;
            const newPct = Math.max(curr, pct);
            return { ...prev, [currentTopic.id]: newPct };
          });
          if (pct >= requiredWatchPct && !completedTopicIdsRef.current[currentTopic.id]) {
            markTopicCompleted(currentTopic.id);
          }
        }

        if (data.event === 'ended' || (data.context === 'player.js' && data.event === 'ended')) {
          setVideoProgressMap((prev) => ({ ...prev, [currentTopic.id]: 100 }));
          if (!completedTopicIdsRef.current[currentTopic.id]) {
            markTopicCompleted(currentTopic.id);
          }
        }
      } catch {
        // Safe ignore
      }
    };

    window.addEventListener('message', handleMessage);

    let playerInstance: any = null;
    const timer = setTimeout(() => {
      if (iframeRef.current && (window as any).playerjs) {
        try {
          playerInstance = new (window as any).playerjs.Player(iframeRef.current);
          playerRef.current = playerInstance;

          playerInstance.on('ready', () => {
            console.log('[Bunny Player] Connected to stream for topic:', currentTopic.id);
          });

          playerInstance.on('timeupdate', (data: any) => {
            if (data && data.duration > 0) {
              const pct = Math.min(100, Math.round((data.seconds / data.duration) * 100));
              setVideoProgressMap((prev) => {
                const curr = prev[currentTopic.id] || 0;
                const newPct = Math.max(curr, pct);
                return { ...prev, [currentTopic.id]: newPct };
              });
              if (pct >= requiredWatchPct && !completedTopicIdsRef.current[currentTopic.id]) {
                markTopicCompleted(currentTopic.id);
              }
            }
          });

          playerInstance.on('ended', () => {
            setVideoProgressMap((prev) => ({ ...prev, [currentTopic.id]: 100 }));
            if (!completedTopicIdsRef.current[currentTopic.id]) {
              markTopicCompleted(currentTopic.id);
            }
          });
        } catch (err) {
          console.warn('[Bunny Player] Player.js initialization notice:', err);
        }
      }
    }, 500);

    return () => {
      window.removeEventListener('message', handleMessage);
      clearTimeout(timer);
    };
  }, [activeVideoUrl, currentTopic?.id, currentTopic?.contentType, requiredWatchPct, markTopicCompleted]);

  // Fallback simulator for non-iframe / placeholder playback
  useEffect(() => {
    let timer: any;
    if (isPlaying && currentTopic?.contentType === 'video' && !isCurrentTopicCompleted) {
      timer = setInterval(() => {
        setVideoProgressMap((prev) => {
          const curr = prev[currentTopic.id] || 0;
          const next = Math.min(100, curr + 2);
          if (next >= requiredWatchPct && !completedTopicIdsRef.current[currentTopic.id]) {
            markTopicCompleted(currentTopic.id);
          }
          return { ...prev, [currentTopic.id]: next };
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isPlaying, currentTopic?.id, currentTopic?.contentType, isCurrentTopicCompleted, requiredWatchPct, markTopicCompleted]);

  // HTML5 Video Playback Handlers
  const handleHtml5TimeUpdate = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    if (video.duration > 0 && currentTopic) {
      const pct = Math.min(100, Math.round((video.currentTime / video.duration) * 100));
      setVideoProgressMap((prev) => {
        const curr = prev[currentTopic.id] || 0;
        const newPct = Math.max(curr, pct);
        return { ...prev, [currentTopic.id]: newPct };
      });
      if (pct >= requiredWatchPct && !completedTopicIdsRef.current[currentTopic.id]) {
        markTopicCompleted(currentTopic.id);
      }
    }
  };

  const handleHtml5VideoEnded = () => {
    if (currentTopic) {
      setVideoProgressMap((prev) => ({ ...prev, [currentTopic.id]: 100 }));
      if (!completedTopicIdsRef.current[currentTopic.id]) {
        markTopicCompleted(currentTopic.id);
      }
    }
  };

  // Theory Reader Scroll Detection: Automatically marks completed when fully scrolled to bottom
  const handleTheoryScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!currentTopic) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - scrollTop - clientHeight <= 30) {
      setTheoryReadMap((prev) => ({ ...prev, [currentTopic.id]: true }));
      if (!completedTopicIdsRef.current[currentTopic.id]) {
        markTopicCompleted(currentTopic.id);
      }
    }
  };

  // Auto-detect reading completion: short content (no scroll needed) or PDF view
  // CRITICAL: Does NOT move automatically to next topic; user reads and clicks next when ready
  useEffect(() => {
    if (!currentTopic) return;
    if (currentTopic.contentType !== 'theory' && (currentTopic.contentType as string) !== 'description') return;

    const timer = setTimeout(() => {
      const container = theoryScrollContainerRef.current;
      if (container) {
        // If content fits without scrolling (short content)
        const isShortContent = container.scrollHeight <= container.clientHeight + 25;
        if (isShortContent) {
          setTheoryReadMap((prev) => ({ ...prev, [currentTopic.id]: true }));
          if (!completedTopicIdsRef.current[currentTopic.id]) {
            markTopicCompleted(currentTopic.id);
          }
        }
      } else if (currentTopic.pdfUrl) {
        // PDF document view: marked read without auto-advancing
        setTheoryReadMap((prev) => ({ ...prev, [currentTopic.id]: true }));
        if (!completedTopicIdsRef.current[currentTopic.id]) {
          markTopicCompleted(currentTopic.id);
        }
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [currentTopic, markTopicCompleted]);

  // Formatted 2-digit module number
  const formattedModuleNumber =
    currentModule.moduleNumber < 10 ? `0${currentModule.moduleNumber}` : `${currentModule.moduleNumber}`;

  // Previous assessment result if attempted
  const pastAssessmentResult = getAssessmentResult(currentModule.id);

  // Navigation Helpers
  const goToTopic = (modId: string, topId: string) => {
    if (!isModuleUnlocked(modId)) {
      showGatingMessage('This module is locked. Please complete the preceding module first.');
      return;
    }
    if (!isTopicUnlocked(modId, topId)) {
      showGatingMessage('This lesson is locked. Please watch preceding videos completely or finish reading lessons to unlock.');
      return;
    }
    setSelectedTopicId(topId);
    setActiveSection('topic');
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/${topId}`);
  };

  const goToAssignment = (modId: string) => {
    if (!isModuleUnlocked(modId)) {
      showGatingMessage('This module is locked. Please complete the preceding module first.');
      return;
    }
    setActiveSection('assignment');
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/assignment`);
  };

  const goToTest = (modId: string) => {
    if (!isModuleUnlocked(modId)) {
      showGatingMessage('This module is locked. Please complete the preceding module first.');
      return;
    }
    setActiveSection('test');
    setExpandedModuleId(modId);
    navigate(`/my-course/${modId}/test`);
  };

  // Previous & Next Button Actions
  const handlePrevious = () => {
    if (activeSection === 'test') {
      goToAssignment(currentModule.id);
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
      if (!isCurrentTopicCompleted) {
        showGatingMessage();
        return;
      }
      if (currentTopicIndex < totalTopics - 1) {
        const nextTopic = currentModule.topics[currentTopicIndex + 1];
        if (nextTopic && isTopicUnlocked(currentModule.id, nextTopic.id)) {
          goToTopic(currentModule.id, nextTopic.id);
        } else {
          showGatingMessage('Please complete this lesson before unlocking the next topic.');
        }
      } else {
        goToAssignment(currentModule.id);
      }
    } else if (activeSection === 'assignment') {
      goToTest(currentModule.id);
    } else if (activeSection === 'test') {
      if (!isCurrentModuleUnlocked) {
        showGatingMessage('Please complete all module topics before starting the test.');
        return;
      }
      navigate(`/assessment/${currentModule.id}`);
    }
  };

  const isCurrentModuleUnlocked = isModuleCompletedByStudent(currentModule.id);

  const toggleModuleAccordion = (id: string) => {
    setExpandedModuleId(expandedModuleId === id ? null : id);
  };

  const handleAssignmentFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleDownloadTemplate = () => {
    setHasDownloadedTemplate(true);
    alert(`Downloading template dossier: ${currentModule.assignment?.templateFileName || 'Module_Assignment_Case_Template.pdf'}`);
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

  if (!hasCourseData) {
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

  return (
    <DashboardLayout headerSubtitle="MY COURSE">
      {/* FLOATING GATING NOTIFICATION TOAST */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 max-w-md animate-in fade-in slide-in-from-top-4 duration-300">
          <div className="bg-[#0A192F] text-white p-4 rounded-2xl shadow-2xl border-2 border-amber-400 flex items-start space-x-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center shrink-0 font-bold mt-0.5">
              <AlertCircle className="w-5 h-5 text-slate-950" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black uppercase tracking-wider text-amber-400">Lesson Locked</p>
              <p className="text-xs font-semibold text-slate-200 mt-0.5 leading-snug">{toastMessage}</p>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

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
                Topic {currentTopicIndex + 1} of {totalTopics} • {currentTopic?.contentType === 'video' ? 'Video' : currentTopic?.contentType === 'assignment' ? 'Assignment' : 'Theory'} Lesson
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
              (() => {
                const isLastTopic = currentTopicIndex >= totalTopics - 1;
                const nextTopic = !isLastTopic ? currentModule.topics[currentTopicIndex + 1] : null;
                const isNextUnlocked = isLastTopic ? isCurrentTopicCompleted : (nextTopic && isTopicUnlocked(currentModule.id, nextTopic.id));

                if (!isNextUnlocked) {
                  return (
                    <button
                      onClick={() => showGatingMessage()}
                      className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200/80 px-3 py-2 rounded-xl transition-colors cursor-pointer border border-amber-300 shadow-2xs"
                      title="Click to view unlock requirements"
                    >
                      <Lock className="w-3.5 h-3.5 text-amber-700" />
                      <span>{isLastTopic ? 'Next: Assignment' : 'Next Topic'}</span>
                    </button>
                  );
                }

                return (
                  <button
                    onClick={handleNext}
                    className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors cursor-pointer"
                  >
                    <span>{isLastTopic ? 'Next: Assignment' : 'Next Topic'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                );
              })()
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
                onClick={() => showGatingMessage('Please complete all module topics before starting the test.')}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200/80 px-3 py-2 rounded-xl cursor-pointer border border-amber-300 shadow-2xs transition-colors"
                title="Click to view unlock requirements"
              >
                <Lock className="w-3.5 h-3.5 text-amber-700" />
                <span>Complete Topics First</span>
              </button>
            )}
          </div>
        </div>

        {/* 2. COURSE MODULES PATHWAY WITH LOCKED MECHANISM */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-600" />
              <h3 className="font-extrabold text-sm text-[#0A192F]">Curriculum Modules Progression</h3>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-500 font-semibold">
              <span className="text-amber-700 font-bold">
                {modules.filter((m) => isModuleCompletedByStudent(m.id)).length} of {modules.length} Modules Completed
              </span>
              <span>•</span>
              <span>
                {Math.round((modules.filter((m) => isModuleCompletedByStudent(m.id)).length / Math.max(1, modules.length)) * 100)}% Overall Progress
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {modules.map((mod) => {
              const isModUnlocked = isModuleUnlocked(mod.id);
              const isModDone = isModuleCompletedByStudent(mod.id);
              const isCurrent = mod.id === currentModule.id;
              const modPadded = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;
              const compTopics = mod.topics.filter((t) => completedTopicIds[t.id]).length;
              const totalTopicsInMod = mod.topics.length;
              const percent = totalTopicsInMod > 0 ? Math.round((compTopics / totalTopicsInMod) * 100) : 0;

              return (
                <div
                  key={mod.id}
                  onClick={() => {
                    if (!isModUnlocked) {
                      showGatingMessage(`Module ${mod.moduleNumber} is locked. Please complete preceding modules first to unlock.`);
                      return;
                    }
                    setExpandedModuleId(mod.id);
                    const firstTopic = mod.topics[0];
                    if (firstTopic) {
                      goToTopic(mod.id, firstTopic.id);
                    } else {
                      navigate(`/my-course/${mod.id}`);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2.5 ${
                    isCurrent
                      ? 'bg-amber-50/70 border-amber-400 ring-2 ring-amber-400/25 shadow-xs'
                      : isModDone
                      ? 'bg-emerald-50/40 border-emerald-200 hover:border-emerald-300 shadow-2xs'
                      : !isModUnlocked
                      ? 'bg-slate-50/90 border-slate-200/80 opacity-70 hover:border-amber-300'
                      : 'bg-white border-slate-200 hover:border-amber-300 shadow-2xs'
                  }`}
                  title={
                    !isModUnlocked
                      ? `Module ${mod.moduleNumber} is locked. Complete previous module to unlock.`
                      : `Go to Module ${mod.moduleNumber}: ${mod.title}`
                  }
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                          !isModUnlocked
                            ? 'bg-slate-200 text-slate-500'
                            : isCurrent
                            ? 'bg-amber-500 text-slate-950 font-black'
                            : isModDone
                            ? 'bg-emerald-500 text-white'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {!isModUnlocked ? (
                          <Lock className="w-3.5 h-3.5 text-slate-500" />
                        ) : isModDone ? (
                          '✓'
                        ) : (
                          modPadded
                        )}
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          Module {mod.moduleNumber}
                        </span>
                        <h4 className={`text-xs font-bold truncate ${isCurrent ? 'text-slate-950 font-extrabold' : 'text-slate-800'}`}>
                          {mod.title}
                        </h4>
                      </div>
                    </div>

                    <div className="shrink-0">
                      {!isModUnlocked ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-500 bg-slate-200/70 px-2 py-0.5 rounded-full">
                          <Lock className="w-2.5 h-2.5" />
                          <span>Locked</span>
                        </span>
                      ) : isModDone ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Done</span>
                        </span>
                      ) : isCurrent ? (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold text-amber-950 bg-amber-300 px-2 py-0.5 rounded-full">
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1 text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-full">
                          <span>Unlocked</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Progress Line */}
                  <div className="space-y-1 pt-1.5 border-t border-slate-100">
                    <div className="flex justify-between items-center text-[10px] font-bold text-slate-500">
                      <span>
                        {!isModUnlocked
                          ? 'Complete previous module'
                          : `${compTopics}/${totalTopicsInMod} Lessons (${percent}%)`}
                      </span>
                      <span>{mod.duration}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                      <div
                        className={`h-1 rounded-full transition-all duration-300 ${
                          isModDone ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500' : 'bg-slate-300'
                        }`}
                        style={{ width: `${!isModUnlocked ? 0 : percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
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
                    const isAvailable = isModuleUnlocked(currentModule.id) && isTopicUnlocked(currentModule.id, top.id);

                    return (
                      <div
                        key={top.id}
                        onClick={() => {
                          if (isAvailable) {
                            goToTopic(currentModule.id, top.id);
                            setShowCurriculumDrawer(false);
                          } else {
                            showGatingMessage('This lesson is locked. Please complete preceding lessons (99% watch for video) to unlock.');
                          }
                        }}
                        className={`p-3 rounded-2xl border flex items-center justify-between text-xs transition-all ${
                          isCurrent
                            ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/20 shadow-xs'
                            : isDone
                            ? 'bg-white border-emerald-200 hover:border-emerald-300 cursor-pointer'
                            : !isAvailable
                            ? 'bg-slate-50 border-slate-200/70 opacity-60 cursor-pointer hover:border-amber-300'
                            : 'bg-slate-50 border-slate-200 hover:border-amber-300 cursor-pointer'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0">
                          {/* Non-mutable read-only status indicator */}
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                              isDone
                                ? 'bg-emerald-500 text-white shadow-2xs'
                                : isCurrent
                                ? 'bg-amber-500 text-slate-950 font-extrabold'
                                : !isAvailable
                                ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                : 'bg-slate-200 text-slate-600'
                            }`}
                          >
                            {isDone ? '✓' : !isAvailable ? <Lock className="w-3 h-3 text-slate-400" /> : idx + 1}
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
                              <span>{top.contentType === 'video' ? 'Video Lesson' : top.contentType === 'assignment' ? 'Assignment' : 'Theory Lesson'}</span>
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 shrink-0">
                          <span className={`text-[11px] font-bold ${isDone ? 'text-emerald-700' : !isAvailable ? 'text-slate-400 flex items-center' : 'text-slate-500'}`}>
                            {isDone ? '✓ Done' : !isAvailable ? '🔒 Locked' : '○ Pending'}
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
                        <p className="text-[11px] text-slate-500">100 Marks • Required submission</p>
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
                        <p className="text-[11px] text-slate-500">70% Pass • Unlimited Retakes</p>
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

        {/* 3. MAIN 2-COLUMN CLASSROOM LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Main Learning Content Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">

            {/* PRIMARY LEARNING STAGE: ACTIVE TOPIC PLAYER & THEORY READER */}
            {activeSection === 'topic' && currentTopic && (
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2 text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                      <span>Topic {currentTopicIndex + 1} of {totalTopics}</span>
                      <span>•</span>
                      <span className="capitalize">{currentTopic.contentType === 'video' ? 'Video' : currentTopic.contentType === 'assignment' ? 'Assignment' : 'Theory'} Lesson</span>
                    </div>
                    <h2 className="text-base font-extrabold text-[#0A192F] truncate">{currentTopic.title}</h2>
                  </div>

                  {/* PROGRESS INDICATOR & NEXT TOPIC BUTTON */}
                  <div className="shrink-0 flex items-center space-x-2">
                    {/* READ-ONLY AUTOMATED PROGRESS INDICATOR (NON-MUTABLE BY USER) */}
                    {isCurrentTopicCompleted ? (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        <span>✓ Completed</span>
                      </div>
                    ) : currentTopic.contentType === 'video' ? (
                      <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-600 border-t-transparent animate-spin shrink-0" />
                        <span>Watch: {currentWatchPct}%</span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
                        <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                        <span>{currentTopic.contentType === 'assignment' ? 'Exercise Review' : 'Read Lesson'}</span>
                      </div>
                    )}

                    {/* NEXT BUTTON BESIDE COMPLETED MARK */}
                    {(() => {
                      const isLastTopic = currentTopicIndex >= totalTopics - 1;
                      const nextTopic = !isLastTopic ? currentModule.topics[currentTopicIndex + 1] : null;
                      const isNextUnlocked = isLastTopic ? isCurrentTopicCompleted : (nextTopic && isTopicUnlocked(currentModule.id, nextTopic.id));

                      if (!isNextUnlocked) {
                        return (
                          <button
                            onClick={() => showGatingMessage()}
                            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200/80 border border-amber-300 transition-colors cursor-pointer shadow-2xs"
                            title="Click to view unlock requirements"
                          >
                            <Lock className="w-3.5 h-3.5 text-amber-700" />
                            <span>{isLastTopic ? 'Next: Assignment' : 'Next Topic'}</span>
                          </button>
                        );
                      }

                      return (
                        <button
                          onClick={handleNext}
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 shadow-sm transition-all cursor-pointer"
                        >
                          <span>{isLastTopic ? 'Next: Assignment' : 'Next Topic'}</span>
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      );
                    })()}
                  </div>
                </div>

                {/* DYNAMIC TOPIC CONTENT SURFACE (PDF DOCUMENT OR TEXT FORMAT OR ASSIGNMENT) */}
                {currentTopic.contentType === 'theory' || (currentTopic.contentType as string) === 'description' || currentTopic.contentType === 'assignment' ? (
                  <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                        {currentTopic.contentType === 'assignment' ? (
                          <>
                            <FileCheck className="w-4 h-4 text-amber-500" />
                            <span>Case Exercise & Assignment Brief</span>
                          </>
                        ) : (
                          <>
                            <FileText className="w-4 h-4 text-amber-500" />
                            <span>Theoretical Lesson & Clinical Dossier</span>
                          </>
                        )}
                      </div>
                      {currentTopic.pdfUrl && (
                        <a
                          href={currentTopic.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0"
                        >
                          <Download className="w-3.5 h-3.5 text-amber-600" />
                          <span>Open / Download PDF</span>
                        </a>
                      )}
                    </div>

                    <div>
                      <h3 className="text-lg font-extrabold text-[#0A192F]">{currentTopic.title}</h3>
                      {currentTopic.description && (
                        <p className="text-xs text-slate-500 font-medium mt-1">{currentTopic.description}</p>
                      )}
                    </div>

                    {currentTopic.pdfUrl ? (
                      /* PDF DOCUMENT VIEWER */
                      <div className="space-y-4">
                        {currentTopic.content && (
                          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-700 leading-relaxed font-medium">
                            <p className="font-bold text-[#0A192F] mb-1">Lesson Overview & Reading Notes:</p>
                            <p className="whitespace-pre-line">{currentTopic.content}</p>
                          </div>
                        )}
                        <div className="w-full rounded-2xl border border-slate-200 overflow-hidden bg-slate-100 shadow-inner">
                          <iframe
                            src={`${currentTopic.pdfUrl}#toolbar=1`}
                            className="w-full h-[600px] border-0"
                            title={currentTopic.title}
                          />
                        </div>
                      </div>
                    ) : (
                      /* TEXT DOSSIER READING VIEW */
                      <div
                        ref={theoryScrollContainerRef}
                        onScroll={handleTheoryScroll}
                        className="pt-2 text-xs text-slate-700 leading-relaxed space-y-4 font-medium max-h-[400px] overflow-y-auto pr-2"
                      >
                        <p className="whitespace-pre-line">
                          {currentTopic.content ||
                            'Virtual autopsy (PMCT) provides a permanent, tamper-evident digital record. This dossier reviews international chain-of-custody standards, DICOM metadata verification, and admissibility under Daubert/Frye legal frameworks.'}
                        </p>
                        <p className="text-slate-600">
                          In contemporary forensic radiological practice, standard acquisition protocols mandate complete documentation of body positioning, gantry tilt parameters, and detector calibration curves. Every slice acquired is timestamped and cryptographically checksummed before inclusion in legal evidence bundles.
                        </p>
                        <p className="text-slate-600">
                          When presenting volumetric reconstruction findings in court, medical examiners must demonstrate adherence to standardized window width/level (WW/WL) thresholds (+400/40 HU for soft tissue, +2000/500 HU for bone structures). Any post-processing alterations must be cataloged in the case log.
                        </p>
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-500 text-[11px]">
                          [End of Theoretical Lesson Content] — Please review all points above thoroughly.
                        </div>
                      </div>
                    )}

                    {/* Optional Topic Exercise & Reference Attachment */}
                    {(currentTopic.assignmentInstructions || currentTopic.referenceAttachmentName) && (
                      <div className="p-4 sm:p-5 bg-amber-50/70 border border-amber-200/90 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between border-b border-amber-200/80 pb-2">
                          <span className="text-xs font-extrabold text-amber-950 uppercase tracking-wider flex items-center space-x-1.5">
                            <FileCheck className="w-4 h-4 text-amber-600" />
                            <span>Case Exercise & Assignment Instructions</span>
                          </span>
                          {currentTopic.referenceAttachmentName && (
                            <span className="text-[11px] font-mono font-bold text-amber-900 bg-amber-200/60 px-2.5 py-0.5 rounded-lg flex items-center gap-1">
                              <Paperclip className="w-3 h-3 text-amber-700" />
                              <span>{currentTopic.referenceAttachmentName}</span>
                            </span>
                          )}
                        </div>

                        {currentTopic.assignmentInstructions && (
                          <div className="text-xs text-slate-800 leading-relaxed font-medium whitespace-pre-line">
                            {currentTopic.assignmentInstructions}
                          </div>
                        )}

                        {currentTopic.submissionInstructions && (
                          <div className="text-[11px] text-amber-900 font-semibold bg-white/80 p-2.5 rounded-xl border border-amber-200/60">
                            <span className="font-bold">Guidelines: </span>
                            {currentTopic.submissionInstructions}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Non-intrusive automatic reading status bar (No confirmation button required) */}
                    <div className="pt-2">
                      {isCurrentTopicCompleted ? (
                        <div className="p-3 bg-emerald-50 border border-emerald-200/90 rounded-2xl flex items-center justify-between text-xs text-emerald-900 font-semibold shadow-2xs">
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Reading Completed — Proceed to the next lesson when you are ready.</span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-800 bg-emerald-200/80 px-2.5 py-0.5 rounded-full shrink-0">
                            ✓ Unlocked
                          </span>
                        </div>
                      ) : (
                        <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs text-slate-600 font-medium">
                          <div className="flex items-center space-x-2">
                            <BookOpen className="w-4 h-4 text-amber-600 shrink-0" />
                            <span>Scroll down to the end of the text above to complete this reading lesson.</span>
                          </div>
                          <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full shrink-0">
                            Reading in Progress
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Video Stream Surface with Live Watch Tracker */
                  <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
                    <div className="bg-slate-900/95 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between">
                      <div className="flex items-center">
                        <img
                          src="/logo.png"
                          alt="Virtual Autopsy Global Solutions"
                          className="h-7 sm:h-8 w-auto object-contain"
                        />
                      </div>
                    </div>

                    <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                      {activeVideoUrl ? (
                        activeVideoUrl.includes('iframe.mediadelivery.net') || activeVideoUrl.includes('/embed/') ? (
                          <iframe
                            ref={iframeRef}
                            src={`${activeVideoUrl}${activeVideoUrl.includes('?') ? '&' : '?'}autoplay=false`}
                            loading="lazy"
                            className="w-full h-full border-0"
                            allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                            allowFullScreen
                          />
                        ) : (
                          <video
                            src={activeVideoUrl}
                            controls
                            onTimeUpdate={handleHtml5TimeUpdate}
                            onEnded={handleHtml5VideoEnded}
                            className="w-full h-full object-contain bg-black"
                          >
                            Your browser does not support HTML5 video playback.
                          </video>
                        )
                      ) : (
                        <>
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
                        </>
                      )}
                    </div>

                    {/* Clean real-time watch footer without duplicate 90% or 'Required' */}
                    <div className="bg-slate-900/95 px-4 py-2 flex items-center justify-between text-xs text-slate-300 border-t border-slate-800">
                      <div className="flex items-center space-x-2 min-w-0">
                        <Video className="w-4 h-4 text-amber-400 shrink-0" />
                        <span className="font-medium text-slate-400 text-[11px] truncate">{currentTopic.title}</span>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <span className="font-bold text-slate-300 text-[11px]">Watch: {currentWatchPct}%</span>
                        <div className="w-24 sm:w-32 bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-1.5 rounded-full transition-all duration-300 ${
                              isCurrentTopicCompleted ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${currentWatchPct}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Guidance banner when video is not yet completed */}
                    {!isCurrentTopicCompleted && (
                      <div className="bg-amber-500/10 border-t border-amber-500/20 px-4 py-2.5 flex items-center justify-between text-xs text-amber-300 font-medium">
                        <div className="flex items-center space-x-2 min-w-0">
                          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                          <span className="truncate">
                            Please watch this video completely to unlock the next lesson.
                          </span>
                        </div>
                        <span className="text-[11px] font-bold text-amber-400 shrink-0 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-md ml-2">
                          {Math.max(0, 99 - currentWatchPct)}% remaining
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* TOPIC DETAILS & OBJECTIVES (WHEN VIEWING TOPIC) */}
            {activeSection === 'topic' && currentTopic?.description && (
              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <FileText className="w-4 h-4 text-amber-500" />
                  <span>Lesson Details & Objectives</span>
                </div>
                <h3 className="text-base font-extrabold text-[#0A192F]">{currentTopic.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed font-medium">{currentTopic.description}</p>
                {currentTopic.content && currentTopic.contentType !== 'theory' && (
                  <div className="pt-3 border-t border-slate-100 text-xs text-slate-700 leading-relaxed space-y-2">
                    <p>{currentTopic.content}</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT 2: LEVEL 2 MODULE ASSIGNMENT WORKSPACE */}
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
                      {currentModule.assignment?.submissionStatus === 'submitted' ? '✓ Submitted' : 'Pending Submission'}
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
                      <span>• Format: PDF Document (Max 10MB)</span>
                      <span>• Due Date: {currentModule.assignment?.dueDate || '14 Days from Enrollment'}</span>
                    </div>
                  </div>
                </div>

                {/* Template Download Button (Fulfills assignment download requirement) */}
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
                    onClick={handleDownloadTemplate}
                    className="inline-flex items-center space-x-1.5 px-3.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>{hasDownloadedTemplate ? 'Downloaded ✓' : 'Download'}</span>
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
                            Submitted on {currentModule.assignment?.submittedAt || 'Recent'} • Under Faculty Review
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

            {/* TAB CONTENT 3: LEVEL 3 MODULE TEST (PRACTICE QUIZ) WORKSPACE */}
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
                    🔄 Unlimited Retakes Allowed
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
                      {pastAssessmentResult.passed ? 'Passed ✓' : 'Retry Quiz'}
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
                      onClick={() => showGatingMessage('Please complete all educational lessons (at least 99% video watch) before taking this quiz.')}
                      className="inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold text-xs rounded-xl border border-amber-300 cursor-pointer transition-colors shadow-2xs"
                      title="Click to view unlock requirements"
                    >
                      <Lock className="w-4 h-4 text-amber-700" />
                      <span>Quiz Locked (Complete Lessons First)</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Course Curriculum Modules Playlist (Fits perfectly at the top!) */}
          <div className="space-y-6">
            <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-extrabold text-base text-[#0A192F]">Curriculum Modules</h3>
                  <p className="text-xs text-slate-500">Learning Topics, Assignment & Practice Quiz.</p>
                </div>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                  {modules.length} Modules Total
                </span>
              </div>

              <div className="space-y-4">
                {modules.map((mod) => {
                  const isModUnlocked = isModuleUnlocked(mod.id);
                  const isModDone = isModuleCompletedByStudent(mod.id);
                  const isSelected = mod.id === currentModule.id;
                  const isExpanded = expandedModuleId === mod.id;
                  const compCount = mod.topics.filter((t) => completedTopicIds[t.id]).length;
                  const totalCount = mod.topics.length;
                  const progPercent = totalCount > 0 ? Math.round((compCount / totalCount) * 100) : 0;
                  const modPaddedNum = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;

                  return (
                    <div
                      key={mod.id}
                      className={`border rounded-2xl transition-all overflow-hidden ${
                        isSelected
                          ? 'border-amber-500 ring-2 ring-amber-400/20 bg-amber-50/10'
                          : isModDone
                          ? 'border-emerald-300 bg-emerald-50/10'
                          : !isModUnlocked
                          ? 'border-slate-200 bg-slate-50/60 opacity-75'
                          : 'border-slate-200 bg-white'
                      }`}
                    >
                      {/* Module Header Bar */}
                      <div className="p-4 space-y-3">
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-3 min-w-0">
                            <div
                              className={`w-9 h-9 rounded-2xl flex items-center justify-center font-black text-xs shrink-0 shadow-2xs ${
                                !isModUnlocked
                                  ? 'bg-slate-200 text-slate-500'
                                  : isSelected
                                  ? 'bg-amber-500 text-slate-950 font-black'
                                  : isModDone
                                  ? 'bg-emerald-500 text-white'
                                  : 'bg-slate-200 text-slate-600'
                              }`}
                            >
                              {!isModUnlocked ? <Lock className="w-4 h-4 text-slate-500" /> : modPaddedNum}
                            </div>
                            <div className="min-w-0">
                              <h4 className="font-bold text-xs text-[#0A192F] truncate">
                                Module {mod.moduleNumber}: {mod.title}
                              </h4>
                              <div className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                                {!isModUnlocked ? (
                                  <span className="text-amber-800 font-medium flex items-center">
                                    <Lock className="w-2.5 h-2.5 mr-1 text-amber-700" /> Complete previous module first
                                  </span>
                                ) : (
                                  <>
                                    <span className="font-bold text-slate-700">
                                      {compCount}/{totalCount} Done
                                    </span>
                                    <span>•</span>
                                    <span>{mod.duration}</span>
                                    <span>•</span>
                                    <span className="text-amber-700 font-bold">{mod.cmeCredits} CME</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center space-x-1 shrink-0">
                            <button
                              onClick={() => toggleModuleAccordion(mod.id)}
                              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
                            >
                              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="space-y-1.5 pt-1 border-t border-slate-100">
                          <div className="flex justify-between items-center text-[11px] font-bold text-slate-600">
                            <span>Topics Progress</span>
                            <span className={isModDone ? 'text-emerald-700 font-extrabold' : !isModUnlocked ? 'text-slate-400 font-medium' : 'text-amber-700 font-extrabold'}>
                              {!isModUnlocked ? 'Locked' : `${progPercent}% ${isModDone ? '(✓ Complete)' : ''}`}
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-1.5 rounded-full transition-all duration-500 ${
                                isModDone ? 'bg-emerald-500' : 'bg-amber-500'
                              }`}
                              style={{ width: `${!isModUnlocked ? 0 : progPercent}%` }}
                            />
                          </div>
                        </div>

                        {/* 3-TIER EXPANDED CURRICULUM ACCORDION */}
                        {isExpanded && (
                          <div className="space-y-3 pt-3 border-t border-slate-100 bg-slate-50/50 p-3 rounded-2xl">
                            {/* Tier 1: Topics */}
                            <div>
                              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2">
                                1. Topics ({mod.topics.length} Lessons)
                              </span>

                              <div className="space-y-1.5">
                                {mod.topics.map((top, idx) => {
                                  const isCompleted = Boolean(completedTopicIds[top.id]);
                                  const isTopicAvailable = isModUnlocked && isTopicUnlocked(mod.id, top.id);
                                  const isCurrentTopicActive =
                                    mod.id === currentModule.id && top.id === currentTopic?.id && activeSection === 'topic';

                                  return (
                                    <div
                                      key={top.id}
                                      className={`p-2.5 rounded-xl flex items-center justify-between text-xs transition-all ${
                                        isCurrentTopicActive
                                          ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold shadow-2xs'
                                          : isCompleted
                                          ? 'bg-white border border-emerald-200 text-slate-800 shadow-2xs'
                                          : !isTopicAvailable
                                          ? 'bg-slate-50 border border-slate-200/70 text-slate-400 opacity-60'
                                          : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                                      }`}
                                    >
                                      <div
                                        onClick={() => {
                                          if (isTopicAvailable) {
                                            goToTopic(mod.id, top.id);
                                          } else {
                                            showGatingMessage('This lesson is locked. Please complete preceding lessons (99% watch for video) to unlock.');
                                          }
                                        }}
                                        className="flex items-center space-x-2.5 min-w-0 flex-1 cursor-pointer"
                                      >
                                        {/* READ-ONLY INDICATOR: Checkboxes are NOT directly mutable by user */}
                                        <div
                                          className={`w-5 h-5 rounded-md flex items-center justify-center font-bold text-xs shrink-0 select-none ${
                                            isCompleted
                                              ? 'bg-emerald-500 text-white shadow-2xs'
                                              : !isTopicAvailable
                                              ? 'bg-slate-100 text-slate-400 border border-slate-200'
                                              : 'bg-slate-100 text-slate-300 border border-slate-300'
                                          }`}
                                          title={isCompleted ? 'Topic completed' : !isTopicAvailable ? 'Complete preceding lesson to unlock' : 'Active lesson'}
                                        >
                                          {isCompleted ? '✓' : !isTopicAvailable ? <Lock className="w-3 h-3 text-slate-400" /> : ''}
                                        </div>
                                        <span className={`truncate text-xs ${isCurrentTopicActive ? 'text-slate-950 font-extrabold' : ''}`}>
                                          {idx + 1}. {top.title}
                                        </span>
                                      </div>

                                      <div className="flex items-center space-x-2 text-[10px] shrink-0 ml-2">
                                        <span className="text-slate-400">
                                          {top.contentType === 'video' ? 'Video' : 'Theory'}
                                        </span>
                                        {isCurrentTopicActive ? (
                                          <span className="bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded text-[9px]">
                                            ACTIVE
                                          </span>
                                        ) : !isTopicAvailable ? (
                                          <span className="text-slate-400 font-medium text-[9px] flex items-center">
                                            <Lock className="w-2.5 h-2.5 mr-0.5 inline" />
                                            <span>LOCKED</span>
                                          </span>
                                        ) : null}
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
                                className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  mod.id === currentModule.id && activeSection === 'assignment'
                                    ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold'
                                    : 'bg-white border border-slate-200 hover:border-amber-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                                  <span className="truncate font-bold text-slate-800 text-xs">
                                    {mod.assignment?.title || 'Case Report Assignment'}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1.5 shrink-0">
                                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                    mod.assignment?.submissionStatus === 'submitted'
                                      ? 'bg-emerald-100 text-emerald-800'
                                      : 'bg-amber-100 text-amber-800'
                                  }`}>
                                    {mod.assignment?.submissionStatus === 'submitted' ? '✓ Submitted' : 'Pending'}
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
                                className={`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-all ${
                                  mod.id === currentModule.id && activeSection === 'test'
                                    ? 'bg-amber-50 border-2 border-amber-400 text-slate-950 font-bold'
                                    : 'bg-white border border-slate-200 hover:border-amber-300'
                                }`}
                              >
                                <div className="flex items-center space-x-2 min-w-0">
                                  <Award className="w-4 h-4 text-emerald-600 shrink-0" />
                                  <span className="truncate font-bold text-slate-800 text-xs">
                                    {mod.test?.title || 'Practice Quiz'}
                                  </span>
                                </div>

                                <div className="flex items-center space-x-1.5 shrink-0">
                                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                                    Unlimited
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
        </div>
      </div>
    </DashboardLayout>
  );
};
