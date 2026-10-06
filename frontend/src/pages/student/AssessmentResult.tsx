import React from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCourseProgress } from '../../context/CourseProgressContext';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { CheckCircle2, XCircle, ArrowRight, Award, BookOpen, RotateCcw, ArrowLeft } from 'lucide-react';

import { useCourse } from '../../context/CourseContext';

export const AssessmentResultPage: React.FC = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { activeCourse } = useCourse();
  const { modules, getAssessmentResult } = useCourseProgress();

  const currentModule = modules.find((m) => m.id === moduleId);
  const result = moduleId ? getAssessmentResult(moduleId) : undefined;

  // Find next module in activeCourse
  const courseModules = activeCourse?.modules || [];
  const currentModIndex = courseModules.findIndex((m) => m.id === moduleId);
  const nextModule = currentModIndex !== -1 && currentModIndex < courseModules.length - 1 ? courseModules[currentModIndex + 1] : null;

  if (!currentModule || !result) {
    return (
      <DashboardLayout>
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-xl mx-auto my-8">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0A192F]">No Assessment Result</h3>
          <p className="text-xs text-slate-500">No score record was found for this module assessment.</p>
          <Link
            to="/course"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Course</span>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-3xl mx-auto pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-500">
          <Link to="/course" className="text-amber-700 font-bold hover:underline">
            My Course
          </Link>
          <span>/</span>
          <span className="text-slate-700">Module 0{currentModule.moduleNumber}</span>
          <span>/</span>
          <span className="bg-slate-100 text-slate-800 px-2.5 py-0.5 rounded-md font-bold text-[11px]">
            Assessment Result
          </span>
        </div>

        {/* Main Result Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm space-y-8 text-center">
          {/* Status Badge Icon */}
          <div className="space-y-3">
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto shadow-lg border bg-emerald-50 text-emerald-600 border-emerald-200">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <span className="inline-block text-xs font-extrabold uppercase px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                ✓ Module Test Completed
              </span>

              <h1 className="text-2xl sm:text-3xl font-black text-[#0A192F]">
                Assessment Completed
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Module 0{currentModule.moduleNumber}: {currentModule.title}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-100 max-w-md mx-auto">
            <div className="space-y-1">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Questions Completed</div>
              <div className="text-xl sm:text-2xl font-black text-[#0A192F]">
                {result.totalQuestions} Qs
              </div>
            </div>

            <div className="space-y-1 border-l border-slate-200">
              <div className="text-[11px] font-bold text-slate-400 uppercase">Status</div>
              <div className="text-xl sm:text-2xl font-black text-emerald-600">
                COMPLETED ✓
              </div>
            </div>
          </div>

          {/* Detailed Message */}
          <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 text-xs text-slate-700 leading-relaxed max-w-lg mx-auto">
            <p>
              Congratulations! You have completed the assessment for Module 0{currentModule.moduleNumber}. {nextModule ? `Module 0${nextModule.moduleNumber} is now unlocked!` : 'All course modules completed! You can now take the Final Exam.'}
            </p>
          </div>

          {/* Primary Action Button */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {!result.passed && (
              <button
                onClick={() => navigate(`/assessment/${currentModule.id}`)}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Re-attempt Assessment</span>
              </button>
            )}

            {result.passed ? (
              nextModule ? (
                <button
                  onClick={() => navigate(`/my-course/${nextModule.id}`)}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Continue to Module 0{nextModule.moduleNumber}: {nextModule.title}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={() => navigate('/final-exam')}
                  className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                >
                  <span>Proceed to Final Examination</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              )
            ) : (
              <button
                onClick={() => navigate('/course')}
                className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 px-8 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
              >
                <span>Return to Course Topics</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
