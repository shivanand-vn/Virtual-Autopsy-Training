import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Award, Download, CheckCircle2, ArrowRight, RotateCcw } from 'lucide-react';
import { useCourse } from '../../context/CourseContext';
import { useFinalExams } from '../../context/FinalExamContext';
import { useRegistrationFlow } from '../../context/RegistrationFlowContext';

interface CertificateCardProps {
  className?: string;
  showDetails?: boolean;
}

export const CertificateCard: React.FC<CertificateCardProps> = ({ className = '', showDetails = true }) => {
  const navigate = useNavigate();
  const { activeCourse, completedTopicIds } = useCourse();
  const { studentExamResult } = useFinalExams();
  const { registrationData } = useRegistrationFlow();

  const allTopics = activeCourse?.modules.flatMap((m) => m.topics) || [];
  const completedTopicsCount = allTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;
  const courseProgressPercent = allTopics.length > 0 ? Math.round((completedTopicsCount / allTopics.length) * 100) : 0;
  const courseCompleted = allTopics.length > 0 && completedTopicsCount === allTopics.length;

  const finalExamSubmitted = Boolean(studentExamResult?.submitted);
  const finalExamScore = studentExamResult?.scorePercentage ?? 0;
  const finalExamPassed = Boolean(studentExamResult?.passed);

  // Core Certificate Unlock Formula:
  // certificateUnlocked = courseCompleted && finalExamSubmitted && finalExamScore >= 70
  const certificateUnlocked = courseCompleted && finalExamSubmitted && finalExamPassed;

  const recipientName = registrationData.fullName || 'Registered Pathologist';
  const courseTitle = activeCourse?.name || 'Virtual Autopsy Fellowship';

  // Determine Exact 6 Certificate States
  let stateBadgeText = '';
  let stateInstructionText = '';
  let stateBadgeStyle = '';
  let actionButton: React.ReactNode = null;

  if (courseProgressPercent === 0) {
    // STATE 1 — COURSE NOT STARTED
    stateBadgeText = 'Certificate Locked';
    stateInstructionText = 'Complete the course to unlock your certificate';
    stateBadgeStyle = 'bg-slate-800 text-slate-200 border border-slate-700';
  } else if (courseProgressPercent < 100) {
    // STATE 2 — COURSE IN PROGRESS
    stateBadgeText = `Course Progress: ${courseProgressPercent}%`;
    stateInstructionText = 'Complete all course modules to unlock your certificate';
    stateBadgeStyle = 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
  } else if (courseProgressPercent === 100 && !finalExamSubmitted) {
    // STATE 3 — COURSE 100% COMPLETED, FINAL EXAM NOT SUBMITTED
    stateBadgeText = 'Course Completed';
    stateInstructionText = 'Complete the Final Exam to unlock your certificate';
    stateBadgeStyle = 'bg-sky-500/20 text-sky-300 border border-sky-500/40';
    actionButton = (
      <button
        onClick={() => navigate('/final-exam')}
        className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-1.5"
      >
        <span>Go to Final Exam</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    );
  } else if (courseProgressPercent === 100 && finalExamSubmitted && !finalExamPassed) {
    // STATE 4 — FINAL EXAM SUBMITTED, SCORE < 70%
    stateBadgeText = `Final Exam Result: ${finalExamScore}%`;
    stateInstructionText = 'A minimum score of 70% is required to receive the certificate';
    stateBadgeStyle = 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
    actionButton = (
      <button
        onClick={() => navigate('/final-exam')}
        className="mt-3 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer inline-flex items-center space-x-1.5"
      >
        <RotateCcw className="w-3.5 h-3.5" />
        <span>Retake Final Exam</span>
      </button>
    );
  } else if (certificateUnlocked && finalExamScore === 70) {
    // STATE 5 — FINAL EXAM SUBMITTED, SCORE === 70%
    stateBadgeText = 'Certificate Unlocked';
    stateInstructionText = 'Final Exam Score: 70%';
    stateBadgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
  } else if (certificateUnlocked && finalExamScore > 70) {
    // STATE 6 — FINAL EXAM SUBMITTED, SCORE > 70%
    stateBadgeText = 'Certificate Unlocked';
    stateInstructionText = `Final Exam Score: ${finalExamScore}%`;
    stateBadgeStyle = 'bg-emerald-100 text-emerald-800 border border-emerald-300';
  }

  return (
    <div className={`relative overflow-hidden bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-lg ${className}`}>
      {/* Background Certificate Preview Container (Blurred underneath when locked) */}
      <div className={`space-y-6 text-center transition-all duration-300 ${!certificateUnlocked ? 'filter blur-md select-none opacity-40 pointer-events-none' : ''}`}>
        <div className="w-20 h-20 bg-amber-100 border border-amber-300 text-amber-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
          <Award className="w-10 h-10 text-amber-600" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-3.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 font-extrabold text-[11px] rounded-full uppercase tracking-wider">
            Official Certificate of Academic Accreditation
          </span>
          <h2 className="text-2xl font-black text-[#0A192F]">
            Virtual Autopsy Fellowship Accreditation
          </h2>
          <p className="text-xs text-slate-600 max-w-lg mx-auto leading-relaxed">
            This certifies that <strong className="text-slate-950 font-bold">{recipientName}</strong> has successfully completed all required training modules, case assessments, and the proctored final examination for:
          </p>
        </div>

        <div className="p-5 bg-slate-50 border border-slate-200 rounded-2xl max-w-lg mx-auto text-center space-y-1">
          <p className="text-base font-extrabold text-[#0A192F]">{courseTitle}</p>
          <p className="text-xs text-amber-800 font-bold">RCPath & ISFRI Forensic Accreditation Standard</p>
        </div>

        {showDetails && (
          <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 pt-2 border-t border-slate-100">
            <div>
              <span className="font-bold text-slate-700">Issued to:</span> {recipientName}
            </div>
            <div>
              <span className="font-bold text-slate-700">Verification ID:</span> VA-ACCRED-{Math.abs((recipientName.length + courseTitle.length) * 887)}
            </div>
          </div>
        )}
      </div>

      {/* OVERLAY LOCKED SCREEN FOR STATES 1, 2, 3, 4 */}
      {!certificateUnlocked && (
        <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center p-6 text-center z-10 rounded-3xl">
          <div className="px-5 py-2.5 bg-slate-900/90 border border-amber-500/40 rounded-2xl flex items-center justify-center shadow-xl mb-3">
            <img
              src="/logo.png"
              alt="Virtual Autopsy Global Solutions"
              className="h-10 sm:h-12 w-auto object-contain"
            />
          </div>

          <span className={`inline-block px-3.5 py-1 font-extrabold text-xs rounded-full uppercase tracking-wider mb-2 shadow-sm ${stateBadgeStyle}`}>
            {stateBadgeText}
          </span>

          <p className="text-sm font-bold text-white max-w-sm drop-shadow-md leading-relaxed">
            {stateInstructionText}
          </p>

          {actionButton}
        </div>
      )}

      {/* PROMINENT DOWNLOAD CERTIFICATE PDF BUTTON (RENDERED ONLY WHEN UNLOCKED - STATES 5 & 6) */}
      {certificateUnlocked && (
        <div className="pt-6 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
          <div className="flex items-center space-x-2 text-xs text-emerald-800 font-extrabold bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{stateBadgeText} — {stateInstructionText}</span>
          </div>

          <button
            onClick={() => window.print()}
            className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>Download Certificate PDF</span>
          </button>
        </div>
      )}
    </div>
  );
};
