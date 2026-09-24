import React, { useState } from 'react';
import {
  ClipboardList,
  CheckCircle2,
  Clock,
  Lock,
  Upload,
  FileText,
  Eye,
  ExternalLink,
  Award,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MOCK_ASSIGNMENTS } from '../types/dashboard';

export const AssignmentsPage: React.FC = () => {
  const [selectedOption, setSelectedOption] = useState('B');
  const [narrativeText, setNarrativeText] = useState(
    `1. Cranial Calvarium & Base: Multi-slice volumetric 3D reconstruction reveals an oblique non-displaced fracture traversing the right squamous temporal bone extending directly through the petrous ridge into the middle cranial fossa.\n2. Extra-Axial Spaces: Right hemispheric crescentic hyperdense extra-axial mass compatible with acute subdural hematoma (mean attenuation: 68.4 HU, range 62-74 HU; maximum thickness 14.2 mm).`
  );
  const [filterTab, setFilterTab] = useState<'all' | 'pending' | 'graded' | 'locked'>('all');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500 mb-1">
              <span>ACADEMY</span>
              <span>/</span>
              <span>STUDENT PORTAL</span>
              <span>/</span>
              <span className="text-amber-700 font-bold">ASSESSMENTS & CASE WORKSHEETS</span>
            </div>
            <h1 className="text-2xl font-extrabold text-[#0A192F]">
              Assignments & Practical Case Assessments
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-500 font-medium">Forensic Board Accreditation: Level II</span>
            <button className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-white border border-slate-200 p-2 rounded-xl hover:bg-slate-50">
              <FileText className="w-4 h-4 text-amber-500" />
              <span>Syllabus Rubric PDF</span>
            </button>
          </div>
        </div>

        {/* 4 Stat Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">TOTAL CURRICULUM</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">06 <span className="text-xs font-normal text-slate-400">Assessments</span></h3>
              <p className="text-xs text-slate-500 mt-0.5">Cohort Standard 100% Assigned</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">SUBMITTED & GRADED</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">03 <span className="text-xs font-normal text-slate-400">Completed</span></h3>
              <p className="text-xs text-emerald-600 font-bold mt-0.5">Avg Score: 94.2% (Grade A)</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PENDING SUBMISSION</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">02 <span className="text-xs font-normal text-slate-400">Action Required</span></h3>
              <p className="text-xs text-amber-600 font-bold mt-0.5">Nearest Deadline: In 3 Days</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">PREREQUISITE LOCKED</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">01 <span className="text-xs font-normal text-slate-400">Assessment</span></h3>
              <p className="text-xs text-slate-500 mt-0.5">Gate Condition: Pass Module 03</p>
            </div>
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex items-center justify-between bg-white p-3 rounded-2xl border border-slate-200/80">
          <div className="flex items-center space-x-2">
            {(['all', 'pending', 'graded', 'locked'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilterTab(tab)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold capitalize transition-all ${
                  filterTab === tab
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {tab} {tab === 'all' ? '(6)' : tab === 'pending' ? '(2)' : tab === 'graded' ? '(3)' : '(1)'}
              </button>
            ))}
          </div>
          <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">
            Viewing Active Cohort Schedule (Fall Term)
          </span>
        </div>

        {/* Active Assessment Main Interactive Container */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-amber-400/80 shadow-lg space-y-6 relative overflow-hidden">
          {/* Top Banner Tag */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div className="flex items-center space-x-2">
              <span className="bg-amber-800 text-white text-[10px] font-black uppercase px-2.5 py-1 rounded">
                MODULE 03
              </span>
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                CLINICAL CASE PRACTICAL
              </span>
              <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                • Due in 3 Days (Oct 18, 2024 • 23:59 UTC)
              </span>
            </div>

            <button className="inline-flex items-center space-x-2 bg-slate-950 hover:bg-slate-800 text-amber-400 font-mono text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              <Eye className="w-4 h-4" />
              <span>Open DICOM Series #VA-9428</span>
            </button>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-black text-[#0A192F]">
              Cranial & Thoracic Trauma PMCT Volumetric Evaluation
            </h2>
            <div className="flex items-center space-x-4 text-xs text-slate-500 mt-1">
              <span>Weight: <strong className="text-slate-800">15% of Final Grade</strong></span>
              <span>•</span>
              <span>Pass Threshold: <strong className="text-slate-800">80% (Score 80/100)</strong></span>
              <span>•</span>
              <span>Est. Duration: <strong className="text-slate-800">90 Mins</strong></span>
            </div>
          </div>

          {/* Clinical Directive Box */}
          <div className="p-4 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex items-start space-x-3 text-xs">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="font-bold text-amber-900 uppercase">CLINICAL AUTOPSY CASE DIRECTIVE</span>
              <p className="text-slate-700 leading-relaxed">
                Review the anonymized multi-slice post-mortem computed tomography (PMCT) volumetric series <strong>#VA-9428</strong> (adult male, age 44, blunt cranial impact). Identify underlying calvarial fracture lines, acute subdural hematoma margins, basilar subarachnoid blood density distributions, and determine quantitative Hounsfield Unit (HU) attenuation thresholds across anatomical regions of interest.
              </p>
            </div>
          </div>

          {/* Interactive Form Questions Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left 2 Columns: Questions A & B */}
            <div className="lg:col-span-2 space-y-6">
              {/* Question A: Diagnostic PMCT Settings */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center">
                      A
                    </span>
                    <h3 className="font-bold text-sm text-[#0A192F]">Diagnostic PMCT Settings</h3>
                  </div>
                  <span className="text-xs text-slate-500">Item 1 of 3 (20 Pts)</span>
                </div>

                <p className="text-xs text-slate-700 leading-normal">
                  1. Select the primary CT bone window setting (Window Width / Window Level) recommended for diagnosing fine non-displaced basilar petrous temporal ridge linear fractures:
                </p>

                <div className="space-y-2.5">
                  {[
                    { id: 'A', text: 'A. WW: 400 HU | WL: 40 HU (Standard Soft Tissue Window)', sub: 'Standard brain parenchyma window without bone edge enhancement algorithm' },
                    { id: 'B', text: 'B. WW: 2500–3000 HU | WL: 500–700 HU (High-Contrast Bone Algorithm)', sub: 'Optimal delineation of high-density cortical petrous margins against air cells' },
                    { id: 'C', text: 'C. WW: 80 HU | WL: 35 HU (Narrow Stroke / Ischemic Protocol)', sub: 'Sensitive to grey-white matter differentiation; oversaturates hyperdense bone' },
                    { id: 'D', text: 'D. WW: 1500 HU | WL: -600 HU (Pulmonary Parenchyma Window)', sub: 'Designed for aerated lung tissues and subdiaphragmatic free air evaluation' },
                  ].map((opt) => (
                    <label
                      key={opt.id}
                      onClick={() => setSelectedOption(opt.id)}
                      className={`block p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedOption === opt.id
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/40'
                          : 'bg-white border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <input
                          type="radio"
                          name="pmct-setting"
                          checked={selectedOption === opt.id}
                          onChange={() => setSelectedOption(opt.id)}
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

              {/* Question B: Structured Narrative Analysis */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center">
                      B
                    </span>
                    <h3 className="font-bold text-sm text-[#0A192F]">Clinical Observations & Density Analysis</h3>
                  </div>
                  <span className="text-xs text-slate-500">Structured Narrative (40 Pts)</span>
                </div>

                <p className="text-xs text-slate-600">
                  Forensic Attenuation Notes (Calvarial Vault, Parenchymal Integrity, & Post-Mortem Redistribution):
                </p>

                <textarea
                  value={narrativeText}
                  onChange={(e) => setNarrativeText(e.target.value)}
                  rows={6}
                  className="w-full text-xs p-3.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed font-mono"
                />
                <div className="flex justify-between text-[11px] text-slate-400">
                  <span>Auto-saved locally 2 minutes ago</span>
                  <span>Word count: 98 / 500 max</span>
                </div>
              </div>
            </div>

            {/* Right Column: Case Image & File Upload Zone */}
            <div className="space-y-6">
              {/* Reference Image Preview */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                  <span>ACTIVE CASE REFERENCE IMAGE</span>
                  <span className="font-mono text-[10px] text-slate-500">Slice #142/380</span>
                </div>
                <div className="aspect-square bg-slate-950 rounded-xl overflow-hidden relative">
                  <img
                    src="https://images.unsplash.com/photo-1516549655169-df83a0774514?w=500&auto=format&fit=crop&q=80"
                    alt="Active CT Slice"
                    className="w-full h-full object-cover opacity-90"
                  />
                  <div className="absolute bottom-2 left-2 bg-black/80 px-2 py-0.5 rounded text-[10px] font-mono text-amber-400">
                    WW: 400 L: 40 | 50.4 HU
                  </div>
                </div>
              </div>

              {/* Upload Zone */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-6 h-6 rounded-lg bg-[#0A192F] text-amber-400 font-bold text-xs flex items-center justify-center">
                      C
                    </span>
                    <h3 className="font-bold text-sm text-[#0A192F]">Completed Worksheet</h3>
                  </div>
                  <span className="text-xs text-slate-500">Required (40 Pts)</span>
                </div>

                <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-amber-400 transition-colors bg-white cursor-pointer space-y-2">
                  <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto font-bold">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-800">Drag & drop completed PMCT Worksheet</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">Accepts format: .pdf, .dcm, or .zip (Max 50MB)</p>
                  </div>
                  <button className="text-xs font-bold text-amber-900 bg-amber-100 hover:bg-amber-200 px-3 py-1.5 rounded-lg transition-colors inline-block mt-2">
                    Browse System Files
                  </button>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2 min-w-0">
                    <FileText className="w-4 h-4 text-amber-600 shrink-0" />
                    <span className="truncate font-medium text-slate-800">
                      Vance_Case_VA9428_Cranial_Analysis.pdf
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold shrink-0 ml-1">4.8 MB Ready</span>
                </div>

                <div className="pt-2 flex flex-col space-y-2">
                  <button className="w-full font-bold text-xs text-slate-950 bg-amber-500 hover:bg-amber-600 py-3 rounded-xl shadow-md transition-colors text-center">
                    Submit Case Assessment →
                  </button>
                  <button className="w-full font-semibold text-xs text-slate-600 bg-slate-200 hover:bg-slate-300 py-2 rounded-xl transition-colors">
                    Save Draft
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Evaluated Case Worksheets List */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-[#0A192F]">Evaluated Case Worksheets</h3>
              <p className="text-xs text-slate-500">Forensic peer-reviewed reports and grading rubrics from certified instructional staff</p>
            </div>
            <span className="text-xs text-slate-400 font-medium">3 Items Archived</span>
          </div>

          <div className="space-y-3">
            {MOCK_ASSIGNMENTS.map((asg) => (
              <div
                key={asg.id}
                className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  asg.status === 'graded'
                    ? 'border-slate-200 bg-slate-50/50'
                    : asg.status === 'pending'
                    ? 'border-amber-300 bg-amber-50/30'
                    : 'border-slate-100 bg-slate-100/50 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      asg.status === 'graded'
                        ? 'bg-emerald-100 text-emerald-800'
                        : asg.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-200 text-slate-500'
                    }`}
                  >
                    {asg.status === 'graded' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : asg.status === 'pending' ? (
                      <Clock className="w-5 h-5" />
                    ) : (
                      <Lock className="w-5 h-5" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded">
                        MODULE 0{asg.moduleNumber}
                      </span>
                      <span className="text-xs text-slate-400">• {asg.dueDate}</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#0A192F] mt-1 truncate">
                      {asg.title}
                    </h4>
                    {asg.evaluator && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        Evaluator: {asg.evaluator}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-4 shrink-0">
                  {asg.score !== undefined ? (
                    <div className="text-right">
                      <div className="text-lg font-black text-[#0A192F]">
                        {asg.score} <span className="text-xs text-slate-400 font-normal">/100</span>
                      </div>
                      <div className="text-xs font-bold text-amber-700">{asg.gradeLabel}</div>
                    </div>
                  ) : (
                    <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
                      {asg.status === 'pending' ? 'Action Required' : 'Locked'}
                    </span>
                  )}

                  {asg.status === 'graded' && (
                    <button className="text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-xl transition-colors inline-flex items-center space-x-1">
                      <Eye className="w-3.5 h-3.5" />
                      <span>View Rubric</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
