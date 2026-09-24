import React, { useState } from 'react';
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
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MOCK_STUDENT, MOCK_MODULES } from '../types/dashboard';

export const MyCoursePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState<'axial' | 'coronal' | 'sagittal'>('axial');
  const [clinicalNotes, setClinicalNotes] = useState(
    `At 14:12 timestamp: Observed sharp density gradient along petrous temporal ridge (+1450 HU) consistent with longitudinal fracture line. Note differential hypodensity representing extradural hematoma along middle cranial fossa.`
  );
  const [notesSaved, setNotesSaved] = useState(true);

  const currentModule = MOCK_MODULES[2]; // Module 3

  const handleNotesChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setClinicalNotes(e.target.value);
    setNotesSaved(false);
  };

  const handleSaveNotes = () => {
    setNotesSaved(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Navigation Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
            <span className="text-amber-700 font-bold">My Course</span>
            <span>/</span>
            <span className="text-slate-800">Module 03: Image Interpretation</span>
            <span>/</span>
            <span className="bg-amber-100 text-amber-900 px-2 py-0.5 rounded-md font-bold">
              Lesson 2 of 5
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <button className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Curriculum</span>
            </button>
            <button className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button className="inline-flex items-center space-x-1 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors">
              <span>Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button className="inline-flex items-center space-x-1 text-xs font-bold text-slate-950 bg-amber-500 hover:bg-amber-600 px-4 py-2 rounded-xl transition-colors shadow-sm">
              <CheckCircle2 className="w-4 h-4" />
              <span>Mark as Complete</span>
            </button>
          </div>
        </div>

        {/* Player & Drawer Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main DICOM Stream Video Player (2 Spans) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Medical DICOM Stream Player */}
            <div className="bg-slate-950 rounded-3xl overflow-hidden shadow-2xl border border-slate-800 relative group">
              {/* Security & Watermark Top Bar */}
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
                  <span>• ID: VA-8849-CLIN</span>
                </div>
              </div>

              {/* Video Surface Mockup */}
              <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                <img
                  src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=1200&auto=format&fit=crop&q=80"
                  alt="PMCT DICOM Stream"
                  className="w-full h-full object-cover opacity-80"
                />

                {/* DICOM Multi-Axial HUD Overlays */}
                <div className="absolute top-4 left-4 space-y-1 text-left font-mono text-[11px]">
                  <div className="bg-slate-900/80 backdrop-blur-md px-2.5 py-1 rounded text-amber-400 font-bold inline-block border border-amber-500/30">
                    PMCTRECON CRANIAL + THORACIC MULTI-AXIAL
                  </div>
                  <div className="text-slate-300 bg-black/60 px-2 py-0.5 rounded inline-block">
                    W: 2000 HU | L: 500 HU (BONE MATRIX)
                  </div>
                </div>

                <div className="absolute top-4 right-4">
                  <span className="bg-rose-600/90 text-white font-mono font-bold text-[10px] px-2.5 py-1 rounded-full tracking-widest uppercase">
                    • FORENSIC PACS LIVE
                  </span>
                </div>

                {/* Center Play Button Overlay */}
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-16 h-16 rounded-full bg-amber-500/90 text-slate-950 flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
                >
                  {isPlaying ? <Pause className="w-8 h-8" /> : <Play className="w-8 h-8 ml-1" />}
                </button>

                {/* Bottom Scrubbing Control Bar */}
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent p-4 space-y-2">
                  {/* Progress Line */}
                  <div className="flex items-center space-x-3 text-xs font-mono text-slate-300">
                    <span>14:32</span>
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden relative cursor-pointer">
                      <div className="bg-amber-400 h-full w-[52%]" />
                    </div>
                    <span>28:15</span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-white">
                    <div className="flex items-center space-x-4">
                      <button onClick={() => setIsPlaying(!isPlaying)}>
                        {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <RotateCcw className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      <RotateCw className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                      <div className="flex items-center space-x-2">
                        <Volume2 className="w-4 h-4 text-slate-400" />
                        <div className="w-16 bg-slate-700 h-1 rounded-full">
                          <div className="bg-amber-400 h-full w-[70%]" />
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <div className="bg-slate-800 p-1 rounded-lg flex space-x-1 text-[11px] font-mono">
                        <button
                          onClick={() => setActiveTab('axial')}
                          className={`px-2 py-0.5 rounded ${
                            activeTab === 'axial' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Axial 3D
                        </button>
                        <button
                          onClick={() => setActiveTab('coronal')}
                          className={`px-2 py-0.5 rounded ${
                            activeTab === 'coronal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Coronal
                        </button>
                        <button
                          onClick={() => setActiveTab('sagittal')}
                          className={`px-2 py-0.5 rounded ${
                            activeTab === 'sagittal' ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400'
                          }`}
                        >
                          Sagittal
                        </button>
                      </div>
                      <span className="text-[11px] font-mono bg-slate-800 text-slate-300 px-2 py-1 rounded">
                        1080p HD
                      </span>
                      <Maximize2 className="w-4 h-4 text-slate-400 hover:text-white cursor-pointer" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Details & Objectives */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 px-2.5 py-1 rounded-md">
                  FORENSIC PMCT SERIES
                </span>
                <span className="text-xs text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md font-medium">
                  • CME Accredited Module (ISFRI Standard)
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F]">
                  Lesson 2 of 5: Volumetric Contrast & Soft Tissue Density in Blunt Force Trauma
                </h1>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                  Quantitative Hounsfield Unit (HU) mapping across subcutaneous hematomas, basilar skull fractures,
                  and contrecoup parenchymal lesions in post-mortem computed tomography acquisitions.
                </p>
              </div>

              {/* Diagnostic Learning Objectives */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center space-x-2 text-sm font-bold text-[#0A192F]">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Diagnostic Learning Objectives</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">OBJECTIVE 01</span>
                    <p className="text-xs text-slate-700 leading-normal">
                      Differentiate acute intra-cranial hemorrhage from post-mortem hyperdense sedimentation in venous sinuses.
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">OBJECTIVE 02</span>
                    <p className="text-xs text-slate-700 leading-normal">
                      Apply standard PMCT windowing (W: 100 HU, L: 40 HU for soft tissue; W: 2000 HU, L: 500 HU for bone matrix).
                    </p>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 space-y-1">
                    <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider">OBJECTIVE 03</span>
                    <p className="text-xs text-slate-700 leading-normal">
                      Document traumatic fracture trajectories and blunt impact energy transfer per ISFRI coronal reporting standards.
                    </p>
                  </div>
                </div>
              </div>

              {/* Peer-Reviewed Dossier & Reference Materials */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-extrabold text-sm text-[#0A192F]">
                    Peer-Reviewed Dossier & Reference Materials
                  </h3>
                  <span className="text-xs text-slate-400 font-medium">3 Attachments</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs shrink-0">
                        PDF
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">PMCT_Trauma_Guide.pdf</p>
                        <p className="text-[10px] text-slate-500">1.4 MB • Clinical Guide</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 ml-1" />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                        CHK
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Blunt_Trauma_Checklist</p>
                        <p className="text-[10px] text-slate-500">850 KB • Form</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 ml-1" />
                  </div>

                  <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-between">
                    <div className="flex items-center space-x-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-800 flex items-center justify-center font-bold text-xs shrink-0">
                        JSON
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">Case_VA_7829.json</p>
                        <p className="text-[10px] text-slate-500">120 KB • Raw Dataset</p>
                      </div>
                    </div>
                    <Download className="w-4 h-4 text-slate-400 hover:text-slate-700 cursor-pointer shrink-0 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column Curriculum Drawer & Clinical Notes */}
          <div className="space-y-6">
            {/* Curriculum Progress Box */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">CURRICULUM STATUS</span>
                  <h3 className="font-extrabold text-base text-[#0A192F]">Module 03 Progress</h3>
                </div>
                <span className="text-xs font-extrabold bg-amber-100 text-amber-900 px-2.5 py-1 rounded-full">
                  60% Completed
                </span>
              </div>

              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-amber-500 h-2 rounded-full w-[60%]" />
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>3 of 5 Lessons Complete</span>
                <span>Est. Remaining: 1h 45m</span>
              </div>

              {/* Lesson Items */}
              <div className="space-y-2 pt-2">
                {currentModule.lessons.map((les) => (
                  <div
                    key={les.id}
                    className={`p-3 rounded-2xl flex items-center justify-between text-xs transition-all ${
                      les.status === 'active'
                        ? 'bg-amber-500 text-slate-950 font-bold shadow-sm'
                        : les.status === 'completed'
                        ? 'bg-slate-50 text-slate-700 border border-slate-200/60'
                        : 'bg-slate-50/50 text-slate-400 border border-slate-100'
                    }`}
                  >
                    <div className="flex items-center space-x-2.5 min-w-0">
                      {les.status === 'completed' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : les.status === 'active' ? (
                        <Play className="w-4 h-4 text-slate-950 fill-slate-950 shrink-0" />
                      ) : (
                        <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                      )}
                      <span className="truncate">{les.title}</span>
                    </div>
                    <span className="text-[10px] shrink-0 ml-2">{les.duration}</span>
                  </div>
                ))}
              </div>
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
                  className="inline-flex items-center space-x-1.5 font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Notes</span>
                </button>
              </div>
            </div>

            {/* Faculty Case Inquiries */}
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="font-extrabold text-sm text-[#0A192F]">Faculty Case Inquiries</h3>
                <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  14 Active Threads
                </span>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                <div className="flex justify-between text-[11px] font-bold text-slate-800">
                  <span>Dr. M. Lindqvist</span>
                  <span className="text-slate-400">Today, 11:15 AM</span>
                </div>
                <p className="text-xs text-slate-600 line-clamp-2 leading-normal">
                  "Has anyone cross-referenced the subdural hematoma attenuation values in PMCT vs ante-mortem scans?"
                </p>
                <p className="text-[10px] text-amber-700 font-semibold pt-1">
                  4 responses from Senior Pathologists
                </p>
              </div>

              <button className="w-full text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 py-2 rounded-xl transition-colors text-center block">
                Ask Faculty Liaison
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
