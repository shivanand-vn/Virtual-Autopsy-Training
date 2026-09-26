import React from 'react';
import { Award, CheckCircle2, Lock, Download, FileText } from 'lucide-react';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { useCourse } from '../context/CourseContext';
import { useRegistrationFlow } from '../context/RegistrationFlowContext';

export const CertificatePage: React.FC = () => {
  const { activeCourse, completedTopicIds } = useCourse();
  const { registrationData } = useRegistrationFlow();

  const allTopics = activeCourse?.modules.flatMap((m) => m.topics) || [];
  const completedCount = allTopics.filter((t) => Boolean(completedTopicIds[t.id])).length;
  const isCourseComplete = allTopics.length > 0 && completedCount === allTopics.length;

  const recipientName = registrationData.fullName || 'Registered Pathologist';
  const courseTitle = activeCourse?.name || 'Virtual Autopsy Fellowship';

  return (
    <DashboardLayout headerTitle="Accreditation & Certificate" headerSubtitle="CERTIFICATE">
      <div className="space-y-6">

        {isCourseComplete ? (
          /* ISSUED CERTIFICATE CARD */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-12 shadow-lg max-w-3xl mx-auto space-y-6 text-center">
            <div className="w-20 h-20 bg-amber-100 border border-amber-300 text-amber-800 rounded-3xl flex items-center justify-center mx-auto shadow-sm">
              <Award className="w-10 h-10 text-amber-600" />
            </div>

            <div className="space-y-2">
              <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 font-bold text-xs rounded-full uppercase tracking-wider">
                Official Certificate Issued
              </span>
              <h2 className="text-2xl font-black text-[#0A192F]">
                Certificate of Academic Accreditation
              </h2>
              <p className="text-xs text-slate-500 max-w-lg mx-auto">
                This certifies that <strong className="text-slate-900">{recipientName}</strong> has successfully completed all required modules, post-mortem CT case evaluations, and topic assessments for:
              </p>
            </div>

            <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl max-w-xl mx-auto text-center space-y-2">
              <p className="text-base font-extrabold text-[#0A192F]">{courseTitle}</p>
              <p className="text-xs text-amber-800 font-bold">RCPath & ISFRI Forensic Accreditation Standard</p>
            </div>

            <div className="pt-4 flex items-center justify-center space-x-3">
              <button
                onClick={() => window.print()}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Download / Print Certificate</span>
              </button>
            </div>
          </div>
        ) : (
          /* CERTIFICATE NOT AVAILABLE YET CARD */
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center shadow-xs max-w-2xl mx-auto space-y-4 my-12">
            <div className="w-16 h-16 bg-slate-100 border border-slate-300 text-slate-500 rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <Lock className="w-8 h-8 text-slate-400" />
            </div>

            <span className="inline-block px-3 py-1 bg-amber-50 text-amber-800 font-bold text-xs rounded-full uppercase tracking-wider border border-amber-200">
              Certificate Not Available Yet
            </span>

            <h2 className="text-xl font-extrabold text-[#0A192F]">
              Accreditation Requirements Pending
            </h2>

            <p className="text-sm text-slate-500 leading-relaxed max-w-md mx-auto">
              Your official certificate will be generated automatically upon completing 100% of the course topics and passing all module assessments.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl max-w-md mx-auto text-xs font-semibold text-slate-700 flex justify-between items-center">
              <span>Current Progress:</span>
              <span className="font-extrabold text-amber-700">{completedCount} / {allTopics.length} Topics Completed</span>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
