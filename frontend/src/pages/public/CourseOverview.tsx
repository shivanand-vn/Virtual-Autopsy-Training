import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Header } from '../../components/common/Header';
import { PartnerFooter } from '../../components/showcase/PartnerFooter';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { CoursePurchaseModal } from '../../components/dashboard/CoursePurchaseModal';
import { api } from '../../lib/api';
import {
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  PlayCircle,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  ArrowLeft,
  Loader2,
  CheckSquare
} from 'lucide-react';
import type { Course } from '../../types/course';

export const CourseOverviewPage: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { myCourses, publicCourses, refreshCourses } = useCourse();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [openModuleId, setOpenModuleId] = useState<string | null>(null);
  const [showPurchaseModal, setShowPurchaseModal] = useState<boolean>(false);

  // Check if currently logged in user is already enrolled in this course
  const isEnrolled = Boolean(
    user && myCourses.some((c) => c.id === courseId)
  );

  useEffect(() => {
    let isMounted = true;

    async function loadCourse() {
      if (!courseId) return;

      // 1. Check if already present in publicCourses or myCourses
      const existing =
        publicCourses.find((c) => c.id === courseId) ||
        myCourses.find((c) => c.id === courseId);

      if (existing) {
        setCourse(existing);
        if (existing.modules && existing.modules.length > 0) {
          setOpenModuleId(existing.modules[0].id);
        }
        setLoading(false);
        return;
      }

      // 2. Otherwise fetch from public endpoint
      try {
        setLoading(true);
        const res = await api.get(`/courses/public/${courseId}`);
        if (isMounted && res?.data) {
          const fetchedCourse = res.data;
          setCourse(fetchedCourse);
          if (fetchedCourse.modules && fetchedCourse.modules.length > 0) {
            setOpenModuleId(fetchedCourse.modules[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load public course details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCourse();

    return () => {
      isMounted = false;
    };
  }, [courseId, publicCourses, myCourses]);

  const handleEnrollClick = () => {
    if (!user) {
      // Guest: redirect to register with this course selected
      navigate(`/register?courseId=${course?.id}`);
      return;
    }

    if (isEnrolled) {
      // Already enrolled: go straight to study
      navigate(`/my-course?courseId=${course?.id}`);
      return;
    }

    // Logged in student not yet enrolled: open purchase modal
    setShowPurchaseModal(true);
  };

  const handlePurchaseSuccess = async () => {
    setShowPurchaseModal(false);
    await refreshCourses();
    navigate(`/my-course?courseId=${course?.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-amber-500 mx-auto" />
          <p className="text-xs font-bold text-slate-500">Loading course curriculum...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#F8F9FB] flex flex-col justify-between">
        <Header page="course" />
        <div className="max-w-xl mx-auto px-4 py-32 text-center space-y-4">
          <h2 className="text-2xl font-black text-[#0A192F]">Course Not Found</h2>
          <p className="text-xs text-slate-500">
            The course you are looking for is currently unavailable or has not been published for public enrollment.
          </p>
          <Link
            to="/landing"
            className="inline-flex items-center space-x-2 text-xs font-extrabold text-amber-600 hover:text-amber-700 underline"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Courses Catalog</span>
          </Link>
        </div>
        <PartnerFooter />
      </div>
    );
  }

  const courseFee = course.fee !== undefined ? Number(course.fee) : 750.0;
  const modules = course.modules || [];
  const totalTopics = modules.reduce((acc, m) => acc + (m.topics ? m.topics.length : (m as any).resources?.length || 0), 0);

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 flex flex-col justify-between">
      <div>
        <Header page="course" />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16 space-y-10">
          {/* Back Navigation Bar */}
          <div className="flex items-center justify-between">
            <Link
              to="/landing"
              className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-4 py-2 rounded-xl transition-colors shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4 text-amber-600" />
              <span>Back to Course Catalog</span>
            </Link>

            <span className="text-[11px] font-mono font-bold text-slate-500 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
              Standardized CPD Accredited
            </span>
          </div>

          {/* Main Course Hero & Pricing Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left 8 Cols: Course Overview & Curriculum */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* Header Box */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <div className="inline-flex items-center space-x-2 text-[10px] font-mono font-bold tracking-widest uppercase bg-slate-900 text-amber-400 px-3 py-1 rounded-full">
                  <span>POST-MORTEM RADIOLOGY</span>
                </div>

                <h1 className="text-2xl sm:text-4xl font-black text-[#0A192F] tracking-tight leading-tight">
                  {course.title || course.name}
                </h1>

                <p className="text-sm sm:text-base text-slate-600 font-medium leading-relaxed">
                  {course.shortDescription || course.description}
                </p>

                {/* Quick Meta Stats Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Duration</span>
                    <p className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-amber-600" />
                      <span>{course.duration || '16 Weeks'}</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Curriculum</span>
                    <p className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                      <span>{modules.length} Core Modules</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Lessons</span>
                    <p className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <PlayCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{totalTopics} Topics</span>
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100 space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Format</span>
                    <p className="text-xs font-black text-slate-900 flex items-center space-x-1.5">
                      <Award className="w-3.5 h-3.5 text-amber-600" />
                      <span>Self-Paced / Online</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Comprehensive Description & Objectives */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-4">
                <h2 className="text-lg font-black text-[#0A192F] pb-2 border-b border-slate-100">
                  Course Description & Learning Scope
                </h2>
                <div className="text-xs sm:text-sm text-slate-600 leading-relaxed space-y-3 whitespace-pre-line">
                  {course.description}
                </div>
              </div>

              {/* Curriculum Modules Accordion */}
              <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <h2 className="text-lg font-black text-[#0A192F]">Curriculum Syllabus</h2>
                    <p className="text-xs text-slate-500">Explore modules and clinical topic lessons included in this training program.</p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-900 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                    {modules.length} Modules
                  </span>
                </div>

                <div className="space-y-3">
                  {modules.map((mod, idx) => {
                    const isOpen = openModuleId === mod.id;
                    const modTopics = mod.topics || (mod as any).resources || [];

                    return (
                      <div
                        key={mod.id}
                        className="bg-slate-50/70 rounded-2xl border border-slate-200/90 overflow-hidden transition-all duration-200"
                      >
                        <button
                          onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                          className="w-full p-4 flex items-start justify-between gap-4 text-left hover:bg-slate-100/70 transition-colors cursor-pointer"
                        >
                          <div className="flex items-start space-x-3">
                            <span className="text-[11px] font-mono font-bold bg-amber-100 text-amber-950 border border-amber-300 px-2 py-0.5 rounded shrink-0 mt-0.5">
                              MOD {String(idx + 1).padStart(2, '0')}
                            </span>
                            <div>
                              <h3 className="text-sm font-extrabold text-[#0A192F]">{mod.title}</h3>
                              {mod.subtitle && (
                                <p className="text-xs text-slate-500 mt-0.5">{mod.subtitle}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-slate-400 shrink-0 mt-1">
                            {isOpen ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </button>

                        {isOpen && (
                          <div className="px-5 pb-4 pt-2 border-t border-slate-200/60 bg-white space-y-2 animate-in fade-in duration-150">
                            {modTopics.length === 0 ? (
                              <p className="text-xs text-slate-400 italic py-2">Module learning materials will be unlocked upon enrollment.</p>
                            ) : (
                              modTopics.map((t: any) => (
                                <div
                                  key={t.id}
                                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200/60 flex items-center justify-between gap-3 text-xs text-slate-700"
                                >
                                  <div className="flex items-center space-x-2.5 min-w-0">
                                    {t.contentType === 'video' || t.type === 'VIDEO_STREAM' ? (
                                      <PlayCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                    ) : t.contentType === 'quiz' || t.type === 'QUIZ' ? (
                                      <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                                    ) : (
                                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                    )}
                                    <span className="font-semibold truncate">{t.title}</span>
                                  </div>
                                  <span className="font-mono text-[10px] text-slate-400 shrink-0">
                                    {t.durationSeconds ? `${Math.round(t.durationSeconds / 60)} min` : (t.contentType === 'video' ? 'Video Lesson' : 'Theory Lesson')}
                                  </span>
                                </div>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Right 4 Cols: Sticky Pricing & Enrollment CTA */}
            <div className="lg:col-span-4 sticky top-28 space-y-6">
              
              <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xl overflow-hidden p-6 space-y-5">
                
                {/* Course Thumbnail */}
                <div className="h-44 rounded-2xl bg-slate-900 overflow-hidden relative">
                  <img
                    src={course.thumbnailUrl || course.thumbnail || '/autop.png'}
                    alt={course.title}
                    className="w-full h-full object-cover opacity-85"
                  />
                  <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-white text-slate-900 border border-slate-200 px-2.5 py-0.5 rounded-md shadow-xs">
                    ACCREDITED CPD
                  </span>
                </div>

                {/* Price Display */}
                <div className="space-y-1 pb-3 border-b border-slate-100">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    COURSE ENROLLMENT FEE
                  </span>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-3xl font-black text-[#0A192F]">
                      £{courseFee.toFixed(2)}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">GBP • Lifetime Access</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-tight">
                    Includes all video masterclasses, clinical cases, downloadable resources & certified credential.
                  </p>
                </div>

                {/* Action CTA */}
                <div>
                  <button
                    onClick={handleEnrollClick}
                    className={`w-full py-3.5 px-4 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                      isEnrolled
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>
                      {isEnrolled
                        ? 'Access Enrolled Course'
                        : user
                        ? `Purchase Course • £${courseFee.toFixed(2)}`
                        : `Enroll Now • £${courseFee.toFixed(2)}`}
                    </span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  {isEnrolled && (
                    <p className="text-[10px] text-emerald-600 text-center font-bold mt-1.5 flex items-center justify-center space-x-1">
                      <CheckCircle className="w-3 h-3" />
                      <span>You are actively enrolled in this course</span>
                    </p>
                  )}
                </div>

                {/* Benefits List */}
                <div className="space-y-2.5 pt-2 text-xs text-slate-700">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    EVERY ENROLLMENT INCLUDES:
                  </span>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>24/7 unlimited access to all course modules</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Real-world post-mortem CT DICOM case reviews</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Practice assessments & faculty graded assignments</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>Verified digital CPD diploma with QR authenticity</span>
                  </div>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[10px] text-slate-500 flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                  <span>Secure 256-bit encrypted checkout powered by Stripe.</span>
                </div>

              </div>

            </div>

          </div>
        </main>
      </div>

      {/* Footer */}
      <PartnerFooter />

      {/* Existing Student Course Purchase Modal */}
      {showPurchaseModal && course && (
        <CoursePurchaseModal
          course={course}
          onClose={() => setShowPurchaseModal(false)}
          onSuccess={handlePurchaseSuccess}
        />
      )}
    </div>
  );
};
