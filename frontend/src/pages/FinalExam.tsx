import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  GraduationCap,
  Clock,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  Bookmark,
  Shield,
  Video,
  Award,
  Download,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  X
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

type ExamStage = 'intro' | 'taking' | 'confirm_modal' | 'result';

interface MockQuestion {
  id: number;
  type: 'single' | 'multiple' | 'true_false' | 'image';
  title: string;
  history: string;
  image?: string;
  options: { id: string; text: string; sub?: string }[];
}

const MOCK_QUESTIONS: MockQuestion[] = [
  {
    id: 1,
    type: 'single',
    title: 'Which Hounsfield Unit (HU) window preset is optimal for evaluating osseous calvarial fractures and suture diastasis in post-mortem CT?',
    history: 'A 34-year-old male found un-witnessed at the base of a stairwell undergoes multi-detector PMCT evaluation.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80',
    options: [
      { id: 'A', text: 'Window Width: 350 HU, Window Level: +40 HU (Soft Tissue Presets)' },
      { id: 'B', text: 'Window Width: 2000 HU, Window Level: +500 HU (Osseous Bone Presets)', sub: 'Optimizes spatial resolution to detect non-displaced fracture lines.' },
      { id: 'C', text: 'Window Width: 1500 HU, Window Level: -600 HU (Pulmonary Parenchyma Presets)' },
      { id: 'D', text: 'Window Width: 80 HU, Window Level: +35 HU (Brain Parenchyma Presets)' },
    ]
  },
  {
    id: 2,
    type: 'true_false',
    title: 'True or False: Post-mortem hypostasis (lividity) can cause dependent soft tissue hyperdensity (+50 to +75 HU) that simulates ante-mortem soft tissue contusion on non-contrast PMCT.',
    history: 'A 58-year-old female cadaver examined 18 hours post-mortem in supine position.',
    options: [
      { id: 'A', text: 'True', sub: 'Gravitational sedimentation creates dependent hyperdensity.' },
      { id: 'B', text: 'False', sub: 'Lividity cannot alter subcutaneous tissue radiodensity.' },
    ]
  },
  {
    id: 3,
    type: 'multiple',
    title: 'Select ALL radiological markers indicative of high-velocity blunt deceleration aortic injury on non-contrast PMCT:',
    history: 'Motor vehicle accident fatality with anterior thoracic steering wheel impact.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80',
    options: [
      { id: 'A', text: 'Mediastinal hematoma surrounding the aortic isthmus' },
      { id: 'B', text: 'Left pleural apical cap / left-sided hemothorax' },
      { id: 'C', text: 'Pericardial air trapping without pneumothorax' },
      { id: 'D', text: 'Disruption of the aortic contour or pseudoneurysm formation' },
    ]
  },
  {
    id: 14,
    type: 'image',
    title: 'Which radiological indicator differentiates ante-mortem aspiration from post-mortem hypostasis with sedimentation in dependent pulmonary segments?',
    history: 'A 46-year-old male victim of high-speed deceleration trauma undergoes whole-body PMCT prior to autopsy.',
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80',
    options: [
      { id: 'A', text: 'A. Bilateral symmetric ground-glass opacities sparing apical segments' },
      { id: 'B', text: 'B. Hyperdense fluid level in the trachea with branching bronchial impaction', sub: 'Characterized by gravitational air-fluid interfaces within smaller airways (>45 HU).' },
      { id: 'C', text: 'C. Sparing of anterior pulmonary segments with uniform basilar consolidation' },
      { id: 'D', text: 'D. Loss of parenchymal architecture with intravascular air redistribution' },
    ]
  }
];

export const FinalExamPage: React.FC = () => {
  const navigate = useNavigate();
  const [examStage, setExamStage] = useState<ExamStage>('intro');
  const [activeQuestionId, setActiveQuestionId] = useState<number>(14);
  const [userAnswers, setUserAnswers] = useState<Record<number, string[]>>({
    1: ['B'],
    2: ['A'],
    3: ['A', 'B', 'D'],
    14: ['B']
  });
  const [flaggedQuestions, setFlaggedQuestions] = useState<Record<number, boolean>>({ 3: true, 10: true });

  const totalQuestions = 60;
  const currentQuestion = MOCK_QUESTIONS.find((q) => q.id === activeQuestionId) || {
    id: activeQuestionId,
    type: 'single' as const,
    title: `Question ${activeQuestionId}: Diagnostic evaluation of multi-slice PMCT findings in acute trauma.`,
    history: `Case vignette #${activeQuestionId}: Forensic autopsy evaluation protocol.`,
    options: [
      { id: 'A', text: 'Option A: Primary diagnostic sign' },
      { id: 'B', text: 'Option B: Secondary diagnostic sign (Recommended)' },
      { id: 'C', text: 'Option C: Post-mortem artifact' },
      { id: 'D', text: 'Option D: Non-contributory finding' },
    ]
  };

  const handleSelectOption = (questionId: number, optionId: string, isMultiple: boolean) => {
    setUserAnswers((prev) => {
      const existing = prev[questionId] || [];
      if (isMultiple) {
        if (existing.includes(optionId)) {
          return { ...prev, [questionId]: existing.filter((id) => id !== optionId) };
        } else {
          return { ...prev, [questionId]: [...existing, optionId] };
        }
      } else {
        return { ...prev, [questionId]: [optionId] };
      }
    });
  };

  const toggleFlag = (qId: number) => {
    setFlaggedQuestions((prev) => ({ ...prev, [qId]: !prev[qId] }));
  };

  const answeredCount = Object.keys(userAnswers).length;

  return (
    <DashboardLayout headerSubtitle="FINAL EXAM">
      <div className="space-y-6 pb-12">
        {/* EXAM STAGE 1: INTRO LANDING */}
        {examStage === 'intro' && (
          <div className="space-y-6">
            <div className="bg-[#0A192F] text-white p-8 rounded-3xl border border-slate-800 shadow-xl relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

              <div className="relative z-10 space-y-4">
                <div className="inline-flex items-center space-x-2 bg-amber-500/20 border border-amber-400/30 text-amber-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span>COURSE-LEVEL FINAL EXAMINATION</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-white">
                  Virtual Autopsy Fellowship Board Competency Examination
                </h1>
                <p className="text-slate-300 text-xs sm:text-sm max-w-3xl leading-relaxed">
                  Fellowship in PMCT Diagnostic Interpretation • RCPath / ISFRI Accredited Summative Assessment.
                  This proctored examination evaluates comprehensive proficiency in post-mortem volumetric CT reconstruction, forensic death investigation, and diagnostic trauma sign interpretation.
                </p>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                  <button
                    onClick={() => setExamStage('taking')}
                    className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl shadow-lg shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    <GraduationCap className="w-5 h-5" />
                    <span>Start Final Exam</span>
                  </button>
                  <Link
                    to="/my-course"
                    className="inline-flex items-center justify-center space-x-2 px-5 py-3.5 bg-slate-800/80 hover:bg-slate-800 text-slate-200 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
                  >
                    <span>Return to My Course</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Exam Specifications Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUESTIONS</span>
                <p className="text-xl font-black text-[#0A192F]">60 Vignettes</p>
                <p className="text-xs text-slate-500">Single, Multiple & CT Images</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">TIME LIMIT</span>
                <p className="text-xl font-black text-[#0A192F]">120 Minutes</p>
                <p className="text-xs text-slate-500">Automated Proctoring Timer</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">PASS BENCHMARK</span>
                <p className="text-xl font-black text-amber-600">80% Passing Score</p>
                <p className="text-xs text-slate-500">48 / 60 Correct Required</p>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">EXAM STATUS</span>
                <p className="text-xl font-black text-emerald-600">Ready to Start</p>
                <p className="text-xs text-slate-500">Attempt 1 of 2 Available</p>
              </div>
            </div>

            {/* Examination Instructions Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <h3 className="font-extrabold text-base text-[#0A192F] pb-2 border-b border-slate-100 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-amber-500" />
                <span>Candidate Instructions & Proctored Bye-Laws</span>
              </h3>

              <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-5 leading-relaxed">
                <li>Ensure you are in a quiet, well-lit environment without unauthorized materials.</li>
                <li>You may flag questions for review during the examination using the question navigator.</li>
                <li>Question types include Single Choice, Multiple Response, True/False, and Image-based CT scan vignettes.</li>
                <li>Once submitted, your result will be evaluated immediately against the 80% passing threshold for CME certification.</li>
              </ul>
            </div>
          </div>
        )}

        {/* EXAM STAGE 2: TAKING EXAM */}
        {(examStage === 'taking' || examStage === 'confirm_modal') && (
          <div className="space-y-6">
            {/* HUD Question Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs gap-3">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A192F] text-amber-400 font-black text-sm flex items-center justify-center">
                  {currentQuestion.id}
                </span>
                <div>
                  <span className="text-xs font-bold text-[#0A192F]">Question {currentQuestion.id} of {totalQuestions}</span>
                  <span className="text-[10px] text-slate-400 ml-2">({answeredCount} Answered)</span>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-amber-900">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span>Time Remaining: 01:48:17</span>
                </div>
              </div>
            </div>

            {/* Exam Workspace Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main Vignette Question Column (2 Spans) */}
              <div className="lg:col-span-2 space-y-6">
                {/* Case Vignette Card */}
                <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                      CASE VIGNETTE #{currentQuestion.id} • {currentQuestion.type.toUpperCase()} QUESTION
                    </span>
                    <button
                      onClick={() => toggleFlag(currentQuestion.id)}
                      className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                        flaggedQuestions[currentQuestion.id]
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                      <span>{flaggedQuestions[currentQuestion.id] ? 'Flagged for Review' : 'Flag for Review'}</span>
                    </button>
                  </div>

                  <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
                    <strong>History:</strong> {currentQuestion.history}
                  </p>

                  {/* Optional Image Viewer */}
                  {currentQuestion.image && (
                    <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                      <img
                        src={currentQuestion.image}
                        alt="Exam DICOM Slice"
                        className="w-full h-full object-cover opacity-85"
                      />
                      <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                        SERIES: 04 (AXIAL PMCT) | W: 1500 HU / L: -500 HU
                      </div>
                    </div>
                  )}

                  <div className="space-y-4 pt-2">
                    <h3 className="font-extrabold text-sm sm:text-base text-[#0A192F] leading-snug">
                      {currentQuestion.title}
                    </h3>

                    {/* Options List */}
                    <div className="space-y-2.5">
                      {currentQuestion.options.map((opt) => {
                        const selectedOpts = userAnswers[currentQuestion.id] || [];
                        const isSelected = selectedOpts.includes(opt.id);
                        const isMultiple = currentQuestion.type === 'multiple';

                        return (
                          <label
                            key={opt.id}
                            onClick={() => handleSelectOption(currentQuestion.id, opt.id, isMultiple)}
                            className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40 shadow-2xs'
                                : 'bg-white border-slate-200 hover:border-slate-300'
                            }`}
                          >
                            <div className="flex items-start space-x-3">
                              <input
                                type={isMultiple ? 'checkbox' : 'radio'}
                                name={`question-${currentQuestion.id}`}
                                checked={isSelected}
                                onChange={() => {}}
                                className="mt-0.5 accent-amber-500 w-4 h-4"
                              />
                              <div>
                                <p className="text-xs font-bold text-slate-900">{opt.text}</p>
                                {opt.sub && <p className="text-[11px] text-slate-500 mt-0.5">{opt.sub}</p>}
                              </div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Navigation Controls */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setActiveQuestionId(Math.max(1, activeQuestionId - 1))}
                      disabled={activeQuestionId === 1}
                      className={`inline-flex items-center space-x-1.5 text-xs font-bold px-4 py-2.5 rounded-xl transition-colors ${
                        activeQuestionId === 1
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Previous Question</span>
                    </button>

                    <button
                      onClick={() => setActiveQuestionId(Math.min(totalQuestions, activeQuestionId + 1))}
                      disabled={activeQuestionId === totalQuestions}
                      className={`inline-flex items-center space-x-1.5 text-xs font-bold px-5 py-2.5 rounded-xl transition-colors ${
                        activeQuestionId === totalQuestions
                          ? 'bg-slate-100 text-slate-300 cursor-not-allowed'
                          : 'bg-amber-500 text-slate-950 hover:bg-amber-400 shadow-md cursor-pointer'
                      }`}
                    >
                      <span>Next Question</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Right Sidebar Question Palette */}
              <div className="space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <h3 className="font-extrabold text-sm text-[#0A192F]">Question Navigator</h3>
                    <span className="text-xs font-mono font-bold text-amber-700">
                      {answeredCount} / {totalQuestions} Answered
                    </span>
                  </div>

                  <div className="grid grid-cols-6 gap-2 text-xs font-mono text-center max-h-60 overflow-y-auto pr-1">
                    {Array.from({ length: 60 }, (_, i) => i + 1).map((qId) => {
                      const isCurrent = qId === activeQuestionId;
                      const isAnswered = Boolean(userAnswers[qId] && userAnswers[qId].length > 0);
                      const isFlagged = Boolean(flaggedQuestions[qId]);

                      return (
                        <button
                          key={qId}
                          onClick={() => setActiveQuestionId(qId)}
                          className={`h-8 rounded-lg font-bold transition-all cursor-pointer ${
                            isCurrent
                              ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400 font-black'
                              : isFlagged
                              ? 'bg-amber-100 text-amber-900 border border-amber-400'
                              : isAnswered
                              ? 'bg-emerald-100 text-emerald-900 font-bold border border-emerald-200'
                              : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                          }`}
                        >
                          {qId}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setExamStage('confirm_modal')}
                    className="w-full text-xs font-black text-white bg-rose-600 hover:bg-rose-700 py-3 rounded-xl shadow-md transition-colors text-center mt-2 cursor-pointer"
                  >
                    Submit Final Examination
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXAM STAGE 3: SUBMIT CONFIRMATION MODAL */}
        {examStage === 'confirm_modal' && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5 text-center">
              <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Submit Final Exam?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  You have answered <strong>{answeredCount}</strong> out of <strong>60</strong> questions.
                  Once submitted, your final examination score will be evaluated for accreditation.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setExamStage('taking')}
                  className="flex-1 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Return to Exam
                </button>
                <button
                  onClick={() => setExamStage('result')}
                  className="flex-1 py-3 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all cursor-pointer"
                >
                  Yes, Submit Exam
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EXAM STAGE 4: MOCK RESULT PAGE */}
        {examStage === 'result' && (
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs max-w-3xl mx-auto text-center space-y-6">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-3xl flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div className="space-y-2">
                <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-3 py-1 rounded-full uppercase tracking-wider border border-emerald-200">
                  EXAMINATION PASSED
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F]">
                  Final Examination Results
                </h1>
                <p className="text-xs text-slate-500">
                  Virtual Autopsy Fellowship Board Competency Examination
                </p>
              </div>

              {/* Score Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">FINAL SCORE</span>
                  <p className="text-2xl font-black text-[#0A192F]">53 / 60</p>
                  <p className="text-[11px] text-emerald-600 font-bold">53 Correct</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">PERCENTAGE</span>
                  <p className="text-2xl font-black text-amber-600">88.3%</p>
                  <p className="text-[11px] text-slate-500">Benchmark: 80%</p>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">ACCREDITATION</span>
                  <p className="text-2xl font-black text-emerald-600">PASSED</p>
                  <p className="text-[11px] text-slate-500">CME Certificate Eligible</p>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                <button
                  onClick={() => navigate('/my-course')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <ArrowRight className="w-4 h-4 text-amber-400" />
                  <span>Continue to Course</span>
                </button>
                <button
                  onClick={() => navigate('/certificate')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>View Certificate</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
