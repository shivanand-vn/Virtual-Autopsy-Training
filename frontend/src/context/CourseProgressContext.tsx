import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type CourseModule, MOCK_MODULES } from '../types/dashboard';
import type { ModuleAssessment, AssessmentResult } from '../types/assessment';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';

interface CourseProgressContextType {
  modules: CourseModule[];
  toggleLessonCompletion: (moduleId: string, lessonId: string) => void;
  isAssessmentUnlocked: (moduleId: string) => boolean;
  getModuleAssessment: (moduleId: string) => ModuleAssessment | undefined;
  saveAssessmentResult: (result: AssessmentResult) => void;
  getAssessmentResult: (moduleId: string) => AssessmentResult | undefined;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export const CourseProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [modules, setModules] = useState<CourseModule[]>(MOCK_MODULES);
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>({});

  const toggleLessonCompletion = (moduleId: string, lessonId: string) => {
    setModules((prev) =>
      prev.map((mod) => {
        if (mod.id === moduleId) {
          const updatedLessons = mod.lessons.map((les) => {
            if (les.id === lessonId) {
              const nextStatus = les.status === 'completed' ? 'active' : 'completed';
              return { ...les, status: nextStatus as any };
            }
            return les;
          });

          const completedCount = updatedLessons.filter((l) => l.status === 'completed').length;
          const totalCount = updatedLessons.length;
          const allCompleted = completedCount === totalCount;
          const progressPercent = Math.round((completedCount / totalCount) * 100);

          return {
            ...mod,
            lessons: updatedLessons,
            completedLessons: completedCount,
            progressPercent,
            status: allCompleted ? 'completed' : (progressPercent > 0 ? 'in_progress' : 'locked')
          };
        }
        return mod;
      })
    );
  };

  const isAssessmentUnlocked = (moduleId: string): boolean => {
    const mod = modules.find((m) => m.id === moduleId);
    if (!mod) return false;
    // Condition: EVERY required topic in that module must be completed
    return mod.completedLessons === mod.lessonsCount && mod.lessonsCount > 0;
  };

  const getModuleAssessment = (moduleId: string): ModuleAssessment | undefined => {
    return MOCK_ASSESSMENTS[moduleId];
  };

  const saveAssessmentResult = (result: AssessmentResult) => {
    setAssessmentResults((prev) => ({
      ...prev,
      [result.moduleId]: result
    }));
  };

  const getAssessmentResult = (moduleId: string): AssessmentResult | undefined => {
    return assessmentResults[moduleId];
  };

  return (
    <CourseProgressContext.Provider
      value={{
        modules,
        toggleLessonCompletion,
        isAssessmentUnlocked,
        getModuleAssessment,
        saveAssessmentResult,
        getAssessmentResult
      }}
    >
      {children}
    </CourseProgressContext.Provider>
  );
};

export const useCourseProgress = () => {
  const context = useContext(CourseProgressContext);
  if (!context) {
    throw new Error('useCourseProgress must be used within a CourseProgressProvider');
  }
  return context;
};
