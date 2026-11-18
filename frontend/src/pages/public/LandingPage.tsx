import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Globe,
  BookOpen,
  CheckCircle,
  Clock,
  Award,
  FileText,
  ArrowRight,
  Laptop
} from 'lucide-react';
import { TeamNamesSlider } from '../../components/common/TeamNamesSlider';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken, getStoredUser } from '../../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses, publicCourses } = useCourse();
  const { user, token } = useAuth();

  const handleSignInClick = () => {
    // Check synchronous storage and live state to guarantee instant redirection
    const currentStoredUser = getStoredUser();
    const currentStoredToken = getAuthToken();
    const currentUser = user || currentStoredUser;
    const currentToken = token || currentStoredToken;

    if (currentUser && currentToken) {
      if (currentUser.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } else {
      navigate('/login');
    }
  };

  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll detection for glassmorphism fixed navbar
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Published public courses sorted by admin order or latest first
  const landingCourses = (publicCourses.length > 0 ? publicCourses : courses.filter((c) => c.status === 'published' && c.isPublishedOnLanding !== false))
    .slice()
    .sort((a, b) => {
      const orderA = a.order !== undefined ? a.order : 1;
      const orderB = b.order !== undefined ? b.order : 1;
      if (orderA !== orderB) return orderA - orderB;
      return new Date(b.createdAt || '').getTime() - new Date(a.createdAt || '').getTime();
    });

  const [selectedCourseId, setSelectedCourseId] = useState<string>('');
  const activeLandingCourse =
    landingCourses.find((c) => c.id === selectedCourseId) ||
    landingCourses[0] ||
    (courses && courses.length > 0 ? courses[courses.length - 1] : null);

  // Smooth scroll handler
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FB] text-slate-800 font-sans selection:bg-amber-400 selection:text-slate-950 overflow-x-hidden">

      {/* HEADER / NAVIGATION BAR (Fixed Position with Scroll Glassmorphism) */}
      <header
        className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ${isScrolled
          ? 'bg-white/75 backdrop-blur-xl border-b border-white/60 shadow-lg shadow-slate-900/5 py-1'
          : 'bg-white/95 backdrop-blur-sm border-b border-slate-200/80 shadow-xs py-2'
          }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 sm:h-22 flex items-center justify-between transition-all duration-300">

          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center group transition-transform duration-200 hover:scale-[1.02]">
            <img
              src="/logo.png"
              alt="Virtual Autopsy Global Solutions"
              className={`w-auto object-contain transition-all duration-300 ${isScrolled ? 'h-12 sm:h-16 py-0.5' : 'h-14 sm:h-18 py-1'
                }`}
            />
          </Link>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <button
              onClick={handleSignInClick}
              className="text-xs font-bold text-slate-700 hover:text-[#0A192F] transition-colors cursor-pointer px-2 py-1"
            >
              Sign In
            </button>

            <button
              onClick={() => navigate(activeLandingCourse?.id ? `/register?courseId=${activeLandingCourse.id}` : '/register')}
              className="px-4 sm:px-5 py-2.5 text-xs font-extrabold text-slate-950 bg-[#F5A623] hover:bg-[#E0951C] rounded-lg shadow-xs transition-all cursor-pointer"
            >
              Enroll Now
            </button>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section id="hero" className="relative pt-28 pb-14 sm:pt-36 sm:pb-20 bg-gradient-to-b from-[#FFFDF9] via-[#F8F9FC] to-[#F8F9FC] border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">

            {/* Left Hero Text & CTA Column */}
            <div className="lg:col-span-6 space-y-5 text-left">

              <div className="inline-flex items-center space-x-2 bg-amber-100/90 border border-amber-300/80 text-amber-950 px-3 py-1 rounded-full text-[11px] font-bold">
                <span className="w-2 h-2 rounded-full bg-amber-600 inline-block" />
                <span className="uppercase tracking-wider">PROFESSIONAL ONLINE TRAINING</span>
              </div>

              <h1 className="text-3xl sm:text-5xl lg:text-5xl font-black text-[#0A192F] tracking-tight leading-tight">
                Virtual Autopsy <br />
                <span className="text-[#A76900] font-black">
                  Online Training
                </span>
              </h1>

              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-xl font-normal">
                Advanced training in Postmortem Computed Tomography (PMCT), virtual autopsy techniques, forensic imaging, and modern postmortem investigation.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => navigate(activeLandingCourse?.id ? `/register?courseId=${activeLandingCourse.id}` : '/register')}
                  className="px-6 py-3 bg-[#F5A623] hover:bg-[#E0951C] text-slate-950 font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-950" />
                  <span>Enroll Now</span>
                </button>

                <button
                  onClick={() => scrollToSection('courses')}
                  className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>Explore Courses</span>
                </button>
              </div>

              {/* Stats Row */}
              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 text-xs">
                <div>
                  <div className="font-extrabold text-[#0A192F] text-sm">100% Online</div>
                  <div className="text-[11px] text-slate-500 font-medium">Self-Paced Modules</div>
                </div>
                <div>
                  <div className="font-extrabold text-amber-800 text-sm">Standardized</div>
                  <div className="text-[11px] text-slate-500 font-medium">Clinical PMCT Protocols</div>
                </div>
                <div>
                  <div className="font-extrabold text-[#0A192F] text-sm">Verifiable</div>
                  <div className="text-[11px] text-slate-500 font-medium">Postmortem Credential</div>
                </div>
              </div>

            </div>

            {/* Right Hero Visual Column */}
            <div className="lg:col-span-6">
              <div className="relative rounded-2xl overflow-hidden border border-slate-200 shadow-2xl bg-slate-950 ring-1 ring-slate-900/10">
                <div className="relative h-72 sm:h-96 lg:h-[440px] overflow-hidden bg-slate-950">
                  <video
                    src="/autopsy.mp4"
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover object-center"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* MAIN LANDING CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* LEFT COLUMN: INTRODUCTION TO VIRTUAL AUTOPSY */}
          <div className="lg:col-span-5 xl:col-span-5 space-y-6 lg:sticky lg:top-28 text-left">
            <section id="about" className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs space-y-5">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#A76900]">
                  FOUNDATIONAL OVERVIEW
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight">
                  Introduction to Virtual Autopsy
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pt-1">
                  An introduction to Post-Mortem CT (PMCT), covering its principles, forensic applications, benefits, limitations, and role alongside conventional autopsy. This course is constructed by forensic imaging authorities to modernize non-invasive investigation methodologies across legal and clinical spheres.
                </p>
              </div>

              {/* Feature Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2">
                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 text-center space-y-1">
                  <Laptop className="w-4 h-4 text-slate-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-800">Online Learning</span>
                </div>

                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 text-center space-y-1">
                  <Clock className="w-4 h-4 text-slate-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-800">Self-Paced</span>
                </div>

                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 text-center space-y-1">
                  <FileText className="w-4 h-4 text-slate-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-800">Video & Docs</span>
                </div>

                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 text-center space-y-1">
                  <CheckCircle className="w-4 h-4 text-slate-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-800">Assessments</span>
                </div>

                <div className="bg-slate-100/80 p-3 rounded-xl border border-slate-200/60 text-center col-span-2 sm:col-span-1 space-y-1">
                  <Award className="w-4 h-4 text-slate-700 mx-auto" />
                  <span className="block text-[11px] font-bold text-slate-800">Certificate</span>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: ONLINE TRAINING COURSES */}
          <div className="lg:col-span-7 xl:col-span-7 space-y-4 text-left">
            <section id="courses" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A76900]">
                    ACCREDITED CERTIFICATIONS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight mt-0.5">
                    Online Training Courses
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-2xs self-start sm:self-auto">
                  {landingCourses.length} Available Program{landingCourses.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Course Cards - One Per Each Row */}
              <div className="flex flex-col gap-4 pt-1">
                {landingCourses.map((c) => {
                  const fee = c.fee !== undefined ? Number(c.fee) : 750.0;
                  const isSelected = activeLandingCourse?.id === c.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedCourseId(c.id)}
                      className={`bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md cursor-pointer ${
                        isSelected ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-slate-200/90 hover:border-amber-300'
                      }`}
                    >
                      <div className="p-5 sm:p-6 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded">
                              {c.duration || '16 Weeks'}
                            </span>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                              CPD Accredited
                            </span>
                          </div>
                          <span className="text-lg font-black text-amber-600 font-mono">
                            £{fee.toFixed(2)} GBP
                          </span>
                        </div>

                        <div>
                          <h3 className="text-base sm:text-lg font-extrabold text-[#0A192F] leading-snug">
                            {c.title || c.name}
                          </h3>
                          <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mt-1">
                            {c.shortDescription || c.description}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                          <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
                            <span>{c.modules?.length || 0} Core Modules</span>
                          </span>
                          <span>•</span>
                          <span className="flex items-center space-x-1.5 font-medium text-slate-700">
                            <Award className="w-3.5 h-3.5 text-amber-600" />
                            <span>Official Certificate</span>
                          </span>
                          <span>•</span>
                          <span className="text-slate-500">
                            Self-Paced 24/7 Access
                          </span>
                        </div>
                      </div>

                      <div className="p-3.5 sm:px-6 bg-slate-50/80 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                        <p className="text-[11px] text-slate-500 hidden sm:block">
                          Click to select course preview, or view complete syllabus details.
                        </p>
                        <div className="flex items-center gap-2.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/courses/${c.id}`);
                            }}
                            className="flex-1 sm:flex-initial py-2.5 px-4 bg-white hover:bg-slate-100 border border-slate-300 text-slate-800 font-bold text-xs rounded-lg transition-colors cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            <span>Course Info & Syllabus</span>
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedCourseId(c.id);
                              navigate(`/register?courseId=${c.id}`);
                            }}
                            className="flex-1 sm:flex-initial py-2.5 px-5 bg-[#F5A623] hover:bg-[#E0951C] text-slate-950 font-extrabold text-xs rounded-lg shadow-2xs transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                          >
                            <span>Enroll • £{fee.toFixed(2)}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>

        </div>
      </div>

      {/* LANDING FOOTER */}
      <footer id="contact" className="bg-[#FAFAFC] border-t border-slate-200 text-xs text-slate-600 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">

            {/* Column 1: Brand & Original Logo */}
            <div className="space-y-3">
              <Link to="/" className="inline-block group transition-transform duration-200 hover:scale-[1.02]">
                <img
                  src="/logo.png"
                  alt="Virtual Autopsy Global Solutions"
                  className="h-14 sm:h-18 w-auto object-contain"
                />
              </Link>
              <p className="text-slate-500 text-[11px] leading-relaxed">
                Pioneering post-mortem computational radiology and non-invasive forensic imaging. Accredited clinical curriculum empowering pathologists and radiologists worldwide.
              </p>
            </div>

            {/* Column 2: CURRICULUM & NAVIGATION */}
            <div className="space-y-3 md:pl-8">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#A76900] mb-3">CURRICULUM & NAVIGATION</h4>
              <ul className="space-y-3 font-medium text-slate-600">
                <li>
                  <button onClick={() => scrollToSection('hero')} className="hover:text-[#0A192F] transition-colors cursor-pointer">
                    Home
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('about')} className="hover:text-[#0A192F] transition-colors cursor-pointer">
                    About the Academy
                  </button>
                </li>
                <li>
                  <button onClick={() => scrollToSection('courses')} className="hover:text-[#0A192F] transition-colors cursor-pointer">
                    Online Training Courses
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: COMPLIANCE & LEGAL */}
            <div className="space-y-3 md:pl-10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#A76900] mb-3">COMPLIANCE & LEGAL</h4>
              <ul className="space-y-3 font-medium text-slate-600">
                <li>
                  <Link to="/terms" className="hover:text-[#0A192F] transition-colors">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/privacy-policy" className="hover:text-[#0A192F] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/refund-policy" className="hover:text-[#0A192F] transition-colors">
                    Refund & Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4: FORENSIC SUPPORT */}
            <div className="space-y-2.5 md:pl-10">
              <h4 className="font-bold text-xs uppercase tracking-wider text-[#A76900]">FORENSIC SUPPORT</h4>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Virtual Autopsy Global Solutions<br />
                Forensic Imaging Directorate<br />
                <a href="mailto:training@virtualautopsyuk.com" className="text-slate-800 hover:text-amber-700 font-mono font-semibold">
                  training@virtualautopsyuk.com
                </a>
              </p>
            </div>

          </div>

          {/* Copyright & Sub-footer */}
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-2 md:grid-cols-3 items-center gap-y-6 gap-x-2 text-[11px] text-slate-500">
            {/* Left: Social Media Follow Us Icons */}
            <div className="order-1 md:order-1 flex items-center justify-start space-x-1.5 sm:space-x-2.5">
              <span className="text-[10px] sm:text-[11px] font-semibold text-slate-600 mr-0.5 sm:mr-1 shrink-0">Follow us:</span>
              {/* LinkedIn Link */}
              <a
                href="https://www.linkedin.com/company/virtualautopsysolutionsukltd/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="relative group w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200/70 hover:bg-[#0A66C2] hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs"
              >
                <svg className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
                {/* Top Tooltip */}
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 bg-[#0A192F] text-white text-[10px] font-semibold py-0.5 px-2 rounded-md shadow-md whitespace-nowrap">
                  LinkedIn
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A192F]" />
                </span>
              </a>

              {/* Global Website Link */}
              <a
                href="https://www.virtualautopsyglobal.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Virtual Autopsy Global Website"
                className="relative group w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200/70 hover:bg-[#0A192F] hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs"
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {/* Top Badge */}
                <span className="absolute -top-1 -right-1 text-[7px] sm:text-[7.5px] font-black tracking-tight px-1 py-0.2 rounded bg-slate-700 text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow-2xs">
                  GL
                </span>
                {/* Top Tooltip */}
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 bg-[#0A192F] text-white text-[10px] font-semibold py-0.5 px-2 rounded-md shadow-md whitespace-nowrap">
                  Virtual Autopsy Global
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A192F]" />
                </span>
              </a>

              {/* India Website Link */}
              <a
                href="https://virtualautopsyindia.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Virtual Autopsy India Website"
                className="relative group w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-slate-200/70 hover:bg-[#0A192F] hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs"
              >
                <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                {/* Top Badge */}
                <span className="absolute -top-1 -right-1 text-[7px] sm:text-[7.5px] font-black tracking-tight px-1 py-0.2 rounded bg-slate-700 text-white group-hover:bg-amber-400 group-hover:text-slate-950 transition-colors shadow-2xs">
                  IN
                </span>
                {/* Top Tooltip */}
                <span className="absolute bottom-full mb-1.5 left-1/2 -translate-x-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-150 z-30 bg-[#0A192F] text-white text-[10px] font-semibold py-0.5 px-2 rounded-md shadow-md whitespace-nowrap">
                  Virtual Autopsy India
                  <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-[#0A192F]" />
                </span>
              </a>
            </div>

            {/* Right on mobile / Col 3 on desktop: Designed & Developed By Animated Team Names */}
            <div className="order-2 md:order-3 flex items-center justify-end">
              <TeamNamesSlider />
            </div>

            {/* Bottom on mobile / Col 2 on desktop: Copyright Notice */}
            <div className="order-3 md:order-2 col-span-2 md:col-span-1 text-center font-medium leading-relaxed text-[10.5px] sm:text-[11px] text-slate-500">
              <div>© 2026 Virtual Autopsy Global Solutions Academy.</div>
              <div>All rights reserved.</div>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
