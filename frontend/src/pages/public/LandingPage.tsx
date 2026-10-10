import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CheckCircle,
  CheckSquare,
  Clock,
  Award,
  FileText,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  PlayCircle,
  Lock,
  ShieldCheck,
  Laptop
} from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useAuth } from '../../context/AuthContext';
import { getAuthToken, getStoredUser } from '../../lib/api';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { courses } = useCourse();
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

  // Accordion State for Modules
  const [openModuleId, setOpenModuleId] = useState<string | null>('mod-1');
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

  // Fallback Modules matching the reference image layout exactly
  const fallbackModules = [
    {
      id: 'mod-1',
      moduleNumber: 1,
      title: 'Introduction to Virtual Autopsy & Legal Frameworks',
      description: 'Principles, evidentiary value, comparative autopsy review',
      topics: [
        { id: 't-1', title: 'High-Definition Lecture: History and Physics of PMCT', duration: '42 min', type: 'video' },
        { id: 't-2', title: 'Reading Dossier: International Chain of Custody & Admissibility', duration: '28 pgs', type: 'doc' },
        { id: 't-3', title: 'Module 01 Foundational Competency Quiz', duration: '15 Questions', type: 'quiz' }
      ]
    },
    {
      id: 'mod-2',
      moduleNumber: 2,
      title: 'PMCT Acquisition Protocols & MPR Reconstruction',
      description: 'Scanning parameters, metal artifact reduction, multi-planar reformations',
      topics: [
        { id: 't-4', title: 'Volumetric CT Calibration & Artifact Reduction Protocols', duration: '35 min', type: 'video' },
        { id: 't-5', title: 'Multi-Planar Reconstruction (MPR) Hands-on PACS Exercise', duration: '50 min', type: 'video' },
        { id: 't-6', title: 'Module 02 Assessment: MPR Analysis & Artifact Identification', duration: '20 Questions', type: 'quiz' }
      ]
    },
    {
      id: 'mod-3',
      moduleNumber: 3,
      title: 'Forensic Traumatology: Ballistics, Blunt & Sharp Force',
      description: 'Volumetric wound trajectory analysis, bone fracture mapping',
      topics: [
        { id: 't-7', title: 'Cranial & Maxillofacial Trauma Reconstruction in PMCT', duration: '48 min', type: 'video' },
        { id: 't-8', title: 'Ballistic Trajectory & Fragment Localization Case Vault', duration: '40 min', type: 'video' },
        { id: 't-9', title: 'Module 03 Assessment: Traumatology Interpretation', duration: '25 Questions', type: 'quiz' }
      ]
    },
    {
      id: 'mod-4',
      moduleNumber: 4,
      title: 'Asphyxia, Drowning & Postmortem Alterations',
      description: 'Internal fluid level identification, gas redistribution vs embolism',
      topics: [
        { id: 't-10', title: 'Differentiating Postmortem Redistribution from Intravital Pathology', duration: '45 min', type: 'video' },
        { id: 't-11', title: 'PMCT Angiography & Pulmonary Embolism Evaluation', duration: '38 min', type: 'video' },
        { id: 't-12', title: 'Module 04 Final Competency Examination & Case Review', duration: '30 Questions', type: 'quiz' }
      ]
    }
  ];

  // Derive the LATEST uploaded course from CourseContext (only one latest course displayed)
  const latestCourse = courses && courses.length > 0 ? courses[courses.length - 1] : null;

  // Dynamically map modules from the latest uploaded course, or fallback if none uploaded
  const displayModules = latestCourse && latestCourse.modules && latestCourse.modules.length > 0
    ? latestCourse.modules.map((m, idx) => ({
      id: m.id,
      moduleNumber: m.moduleNumber || idx + 1,
      title: m.title,
      description: m.description || m.subtitle || 'Module learning objectives and curriculum topics',
      topics: m.topics && m.topics.length > 0
        ? m.topics.map((t) => ({
          id: t.id,
          title: t.title,
          duration: t.contentType === 'video' ? 'Video Lesson' : 'Theory Lesson',
          type: t.contentType === 'video' ? 'video' : 'theory'
        }))
        : []
    }))
    : fallbackModules;

  // Automatically open the first module whenever course or modules update
  useEffect(() => {
    if (displayModules && displayModules.length > 0) {
      setOpenModuleId(displayModules[0].id);
    }
  }, [courses]);

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
              onClick={() => navigate('/register')}
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
                  onClick={() => navigate('/register')}
                  className="px-6 py-3 bg-[#F5A623] hover:bg-[#E0951C] text-slate-950 font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  <BookOpen className="w-4 h-4 text-slate-950" />
                  <span>Enroll Now</span>
                </button>

                <button
                  onClick={() => scrollToSection('curriculum')}
                  className="px-6 py-3 bg-white border border-slate-300 hover:border-slate-400 text-slate-700 font-bold text-xs rounded-lg shadow-xs transition-all cursor-pointer inline-flex items-center justify-center space-x-2"
                >
                  <FileText className="w-4 h-4 text-slate-500" />
                  <span>Explore Course</span>
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

          {/* LEFT MAIN CONTENT COLUMN */}
          <div className="lg:col-span-8 space-y-10 text-left">

            {/* INTRODUCTION TO VIRTUAL AUTOPSY CARD */}
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

              {/* 5 Compact Feature Box Pills */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 pt-2">
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

            {/* COURSE CURRICULUM SECTION (ACCORDIONS) */}
            <section id="curriculum" className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-widest text-[#A76900]">
                    RIGOROUS SYLLABUS
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-black text-[#0A192F] tracking-tight mt-0.5">
                    Course Curriculum
                  </h2>
                </div>
                <span className="text-xs font-mono font-bold text-slate-600 bg-white border border-slate-200 px-3 py-1 rounded-md shadow-2xs self-start sm:self-auto">
                  {displayModules.length} Core Modules
                </span>
              </div>

              {/* Accordion Modules */}
              <div className="space-y-3 pt-1">
                {displayModules.map((mod) => {
                  const isOpen = openModuleId === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className="bg-white rounded-xl border border-slate-200/90 shadow-2xs overflow-hidden transition-all duration-200"
                    >
                      {/* Accordion Header Button */}
                      <button
                        onClick={() => setOpenModuleId(isOpen ? null : mod.id)}
                        className="w-full p-4 sm:p-4.5 flex items-start justify-between gap-4 text-left hover:bg-slate-50/80 transition-colors cursor-pointer"
                      >
                        <div className="flex items-start space-x-3">
                          <span className="text-[11px] font-mono font-bold bg-amber-100/90 text-amber-950 border border-amber-300/80 px-2 py-0.5 rounded shrink-0 mt-0.5">
                            MOD {String(mod.moduleNumber).padStart(2, '0')}
                          </span>
                          <div>
                            <h3 className="text-sm sm:text-base font-extrabold text-[#0A192F]">{mod.title}</h3>
                            <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">{mod.description}</p>
                          </div>
                        </div>
                        <div className="text-slate-400 shrink-0 mt-1">
                          {isOpen ? <ChevronUp className="w-4 h-4 text-amber-700" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </button>

                      {/* Accordion Content Drawer */}
                      {isOpen && (
                        <div className="px-4 sm:px-5 pb-4 pt-2 border-t border-slate-100 bg-slate-50/50 space-y-2 animate-in fade-in duration-150">
                          {mod.topics.map((t) => (
                            <div
                              key={t.id}
                              className="p-2.5 bg-white rounded-lg border border-slate-200/80 flex items-center justify-between gap-3 text-xs text-slate-700"
                            >
                              <div className="flex items-center space-x-2.5 min-w-0">
                                {t.type === 'video' ? (
                                  <PlayCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                ) : t.type === 'quiz' ? (
                                  <CheckSquare className="w-4 h-4 text-amber-600 shrink-0" />
                                ) : (
                                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                                )}
                                <span className="font-semibold truncate">{t.title}</span>
                              </div>
                              <span className="font-mono text-[11px] text-slate-400 shrink-0">{t.duration}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Note Banner */}
              <div className="p-3 bg-slate-100/70 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center space-x-2">
                <Lock className="w-4 h-4 text-amber-700 shrink-0" />
                <span className="text-[11px]">
                  <strong>Structured modular progression:</strong> Modules unlock sequentially upon passing prerequisite evaluations to assure forensic competency.
                </span>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: PROMINENT ENROLLMENT CARD */}
          <div className="lg:col-span-4 sticky top-28 space-y-6">

            <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl overflow-hidden text-left space-y-4 pb-5">

              {/* Card Header Image */}
              <div className="relative h-44 bg-slate-950 overflow-hidden">
                <img
                  src="/autop.png"
                  alt="Virtual Autopsy Online Course"
                  className="w-full h-full object-cover opacity-85"
                />
                <span className="absolute top-3 right-3 text-[10px] font-extrabold uppercase tracking-wider bg-white text-slate-900 border border-slate-200 px-2.5 py-0.5 rounded shadow-xs">
                  STANDARDIZED CPD
                </span>
                <div className="absolute bottom-3 left-4 right-4 text-white">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-300 block">ACCREDITED ACADEMY</span>
                  <h3 className="text-base font-black text-white leading-snug">Virtual Autopsy Online Training</h3>
                </div>
              </div>

              {/* Price Box */}
              <div className="px-5 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">PROFESSIONAL ENROLLMENT FEE</span>
                <div className="flex items-baseline space-x-2">
                  <span className="text-3xl font-black text-[#0A192F]">£999</span>
                  <span className="text-xs text-slate-500 font-medium">GBP • Single Professional Access</span>
                </div>
                <p className="text-[11px] text-slate-500 leading-tight">
                  Includes complete curriculum, examination attempts & verified digital certificate
                </p>
              </div>

              {/* Action Buttons */}
              <div className="px-5">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full py-3 bg-[#F5A623] hover:bg-[#E0951C] text-slate-950 font-extrabold text-xs rounded-lg shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <span>Enroll Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>

              {/* Included Verified Features Checklist */}
              <div className="px-5 pt-2 pb-1 space-y-2 border-t border-slate-100 text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">INCLUDED IN ENROLLMENT:</span>

                <div className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Online course with unlimited 24/7 access</span>
                </div>

                <div className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Self-paced clinical learning modules</span>
                </div>

                <div className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Structured forensic module assessments</span>
                </div>

                <div className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Verified certificate upon successful completion</span>
                </div>

                <div className="flex items-start space-x-2 text-slate-700">
                  <CheckCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <span>Case literature & DICOM demonstration sets</span>
                </div>
              </div>

              {/* Security Note */}
              <div className="mx-5 p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 text-center flex items-center justify-center space-x-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  <strong>Instant LMS Portal Activation</strong><br />
                  <span className="text-[10px] text-slate-500">Direct access upon secure payment verification, Encrypted via Stripe.</span>
                </span>
              </div>

            </div>

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
                  <button onClick={() => scrollToSection('curriculum')} className="hover:text-[#0A192F] transition-colors cursor-pointer">
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
          <div className="pt-8 border-t border-slate-200/80 grid grid-cols-1 md:grid-cols-3 items-center justify-between text-[11px] text-slate-500 gap-4">
            {/* Left: Social Media Follow Us Icons */}
            <div className="flex items-center justify-center md:justify-start space-x-2.5">
              <span className="text-[11px] font-semibold text-slate-600 mr-1">Follow us:</span>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X (formerly Twitter)"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-slate-900 hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                </svg>
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg bg-slate-200/70 hover:bg-[#0A66C2] hover:text-white text-slate-700 transition-colors flex items-center justify-center shadow-2xs"
              >
                <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                  <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9v8.37H9.25V10.9H6.46M7.86 6.78a1.62 1.62 0 1 0 0 3.24 1.62 1.62 0 0 0 0-3.24z" />
                </svg>
              </a>
            </div>

            {/* Center: Copyright Notice */}
            <div className="text-center font-medium">
              <span>© 2026 Virtual Autopsy Global Solutions Academy. All rights reserved.</span>
            </div>

            {/* Right: Diagnostics Portal Text */}
            <div className="text-right hidden md:block text-slate-500">
              <span>Authorized Post-Mortem Medical Diagnostics Portal</span>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
