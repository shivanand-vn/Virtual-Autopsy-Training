import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';

export const FinalExamPage: React.FC = () => {
  const [activeQuestion, setActiveQuestion] = useState(14);
  const [selectedAnswer, setSelectedAnswer] = useState('B');
  const [flagged, setFlagged] = useState(false);

  const totalQuestions = 60;

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Board Exam Banner */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="bg-amber-500 text-slate-950 font-black text-[10px] uppercase px-2.5 py-1 rounded">
                  FELLOWSHIP BOARD EXAM
                </span>
                <span className="text-xs font-mono text-slate-500">CODE: PMCT-FE-2024</span>
              </div>
              <h1 className="text-2xl font-black text-[#0A192F]">
                Virtual Autopsy Fellowship Board Competency Examination
              </h1>
              <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
                Comprehensive summative evaluation covering post-mortem CT reconstruction, forensic death investigation, and diagnostic trauma sign interpretation.
              </p>
            </div>

            <div className="flex items-center space-x-3 shrink-0">
              <button className="text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors">
                Read Bye-Laws & Instructions
              </button>
              <button className="text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl shadow-md transition-colors">
                Begin Final Examination →
              </button>
            </div>
          </div>

          {/* 4 Metrics Row */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-100">
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ASSESSMENT SCOPE</span>
              <p className="text-lg font-black text-[#0A192F]">60 Vignettes</p>
              <p className="text-[10px] text-slate-500">Multi-slice PMCT MCQs</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ALLOCATED WINDOW</span>
              <p className="text-lg font-black text-[#0A192F]">120 Minutes</p>
              <p className="text-[10px] text-slate-500">Automated Proctor Timer</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">MASTERY BENCHMARK</span>
              <p className="text-lg font-black text-[#0A192F]">80% Passing</p>
              <p className="text-[10px] text-slate-500">RCPath / ISFRI Accredited</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-xl space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">CANDIDATE ATTEMPTS</span>
              <p className="text-lg font-black text-[#0A192F]">2 Permitted</p>
              <p className="text-[10px] text-slate-500">Remaining Attempts: 2</p>
            </div>
          </div>

          {/* Security Status Badges */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600 pt-1">
            <span className="flex items-center space-x-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Browser DRM Lock: Active & Monitored</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>Web-DICOM GPU Renderer: WebGL 2.0 Ready (60fps)</span>
            </span>
            <span className="flex items-center space-x-1.5 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>AI Proctoring Live: Audio/Video Standby</span>
            </span>
          </div>
        </div>

        {/* Exam Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Vignette Question Column (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* HUD Question Header */}
            <div className="flex items-center justify-between bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
              <div className="flex items-center space-x-3">
                <span className="w-8 h-8 rounded-xl bg-[#0A192F] text-amber-400 font-black text-sm flex items-center justify-center">
                  14
                </span>
                <div>
                  <span className="text-xs font-bold text-[#0A192F]">Question 14 of 60</span>
                  <span className="text-[10px] text-slate-400 ml-2">(23% Completed)</span>
                </div>
              </div>

              <div className="flex items-center space-x-3 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-full text-xs font-mono font-bold text-amber-900">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Time Remaining: 01:48:17</span>
              </div>
            </div>

            {/* Case Vignette Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">
                  CASE VIGNETTE #14 • Medical-Legal Trauma Forensic Audit
                </span>
                <button
                  onClick={() => setFlagged(!flagged)}
                  className={`inline-flex items-center space-x-1 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors ${
                    flagged ? 'bg-rose-100 text-rose-800' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  <span>{flagged ? 'Flagged for Review' : 'Flag for Review'}</span>
                </button>
              </div>

              <p className="text-sm text-slate-700 leading-relaxed font-medium">
                <strong>History:</strong> A 46-year-old male victim of high-speed motor vehicle deceleration trauma undergoes whole-body PMCT scan prior to internal autopsy. Review the axial thoracic reconstruction showing bilateral lung contusions, posterior hypostasis, and dependent hemothorax.
              </p>

              {/* Embedded DICOM Slice Viewer Simulation */}
              <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1000&auto=format&fit=crop&q=80"
                  alt="Exam DICOM Slice"
                  className="w-full h-full object-cover opacity-85"
                />
                <div className="absolute top-3 left-3 bg-black/80 px-3 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                  SERIES: 04 (AXIAL PMCT) | W: 1500 HU / L: -500 HU | SLICE 42/104
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="font-extrabold text-sm text-[#0A192F]">
                  Which radiological indicator differentiates ante-mortem aspiration from post-mortem hypostasis with sedimentation in dependent pulmonary segments?
                </h3>

                <div className="space-y-2.5">
                  {[
                    { id: 'A', text: 'A. Bilateral symmetric ground-glass opacities sparing apical segments', sub: 'Non-specific alveolar infiltration without structural endobronchial cast distribution.' },
                    { id: 'B', text: 'B. Hyperdense fluid level in the trachea with branching bronchial impaction (Selected)', sub: 'Characterized by gravitational air-fluid interfaces within smaller airways and distinct particulate density (>45 HU).' },
                    { id: 'C', text: 'C. Sparing of anterior pulmonary segments with uniform basilar consolidation', sub: 'Typical of standard post-mortem dependent lividity (hypostasis) due to gravity in supine cadavers.' },
                    { id: 'D', text: 'D. Loss of parenchymal architecture with intravascular air redistribution', sub: 'Indicative of late decompositional autolysis or decompression artifact rather than direct aspiration.' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedAnswer(opt.id)}
                      className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                        selectedAnswer === opt.id
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="vignette-option"
                          checked={selectedAnswer === opt.id}
                          onChange={() => setSelectedAnswer(opt.id)}
                          className="mt-0.5 accent-amber-500"
                        />
                        <div>
                          <p className="text-xs font-bold text-slate-900">{opt.text}</p>
                          <p className="text-[11px] text-slate-500 mt-0.5">{opt.sub}</p>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  onClick={() => setActiveQuestion(Math.max(1, activeQuestion - 1))}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-4 py-2.5 rounded-xl transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous Question</span>
                </button>
                <button className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 px-4 py-2.5 rounded-xl transition-colors">
                  Save & Review Later
                </button>
                <button
                  onClick={() => setActiveQuestion(Math.min(totalQuestions, activeQuestion + 1))}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-5 py-2.5 rounded-xl shadow-md transition-colors"
                >
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Question Navigator & Proctoring Sidebar */}
          <div className="space-y-6">
            {/* Question Navigator */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-[#0A192F]">Question Navigator</h3>
                <span className="text-xs font-mono font-bold text-slate-400">14 / 60</span>
              </div>

              <div className="grid grid-cols-6 gap-2 text-xs font-mono text-center">
                {Array.from({ length: 60 }, (_, i) => i + 1).map((q) => {
                  const isCurrent = q === activeQuestion;
                  const isAnswered = q < 14;
                  const isFlagged = q === 3 || q === 10;

                  return (
                    <button
                      key={q}
                      onClick={() => setActiveQuestion(q)}
                      className={`h-8 rounded-lg font-bold transition-all ${
                        isCurrent
                          ? 'bg-amber-500 text-slate-950 ring-2 ring-amber-400'
                          : isAnswered
                          ? 'bg-slate-100 text-slate-800'
                          : isFlagged
                          ? 'bg-amber-200 text-amber-900 border border-amber-400'
                          : 'bg-slate-50 text-slate-400 border border-slate-100'
                      }`}
                    >
                      {q}
                    </button>
                  );
                })}
              </div>

              <button className="w-full text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 py-3 rounded-xl shadow-md transition-colors text-center mt-2">
                Submit Entire Assessment
              </button>
            </div>

            {/* Live AI Proctoring Security Feed */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-xs text-[#0A192F]">Proctor Security Feed</h3>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center space-x-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1" />
                  LIVE MONITORING
                </span>
              </div>

              <div className="aspect-video bg-slate-900 rounded-xl overflow-hidden relative flex items-center justify-center">
                <img
                  src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80"
                  alt="Proctor Webcam Feed"
                  className="w-full h-full object-cover opacity-80"
                />
                <div className="absolute top-2 left-2 bg-black/70 px-2 py-0.5 rounded text-[9px] font-mono text-emerald-400">
                  FACE-ID: VERIFIED 98.4%
                </div>
              </div>

              <div className="text-[11px] text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Room Integrity:</span>
                  <span className="font-bold text-slate-800">Single Occupant Verified</span>
                </div>
                <div className="flex justify-between">
                  <span>Audio Noise Level:</span>
                  <span className="font-bold text-emerald-600">22 dB (Compliant)</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Summative Matrix Benchmark */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ACCREDITATION BENCHMARK</span>
              <h3 className="font-extrabold text-base text-[#0A192F]">
                Summative Competency Matrix & Result Model
              </h3>
            </div>
            <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full">
              PASS STATUS: 88% (53/60 CORRECT)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DOMAIN A</span>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-slate-800">Trauma & Deceleration Biomechanics</span>
                <span className="text-lg font-black text-[#0A192F]">92%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full w-[92%]" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DOMAIN B</span>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-slate-800">Post-Mortem Decomposition Artifacts</span>
                <span className="text-lg font-black text-[#0A192F]">85%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full w-[85%]" />
              </div>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase">DOMAIN C</span>
              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs text-slate-800">Forensic PMCT Angiography (PMCTA)</span>
                <span className="text-lg font-black text-[#0A192F]">87%</span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-1.5">
                <div className="bg-amber-500 h-1.5 rounded-full w-[87%]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
