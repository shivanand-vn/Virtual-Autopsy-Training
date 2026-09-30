import React, { createContext, useContext, ReactNode } from 'react';
import type { ModuleAssessment, AssessmentResult } from '../types/assessment';
import { MOCK_ASSESSMENTS } from '../data/mockAssessments';
import { useCourse } from './CourseContext';

interface CourseProgressContextType {
  modules: any[];
  isAssessmentUnlocked: (moduleId: string) => boolean;
  getModuleAssessment: (moduleId: string) => ModuleAssessment | undefined;
  saveAssessmentResult: (result: AssessmentResult) => void;
  getAssessmentResult: (moduleId: string) => AssessmentResult | undefined;
}

const CourseProgressContext = createContext<CourseProgressContextType | undefined>(undefined);

export const CourseProgressProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const {
    activeCourse,
    isModuleAssessmentUnlocked,
    saveAssessmentResult,
    getAssessmentResult,
    completedTopicIds
  } = useCourse();

  const modules = (activeCourse?.modules || []).map((m) => {
    const topicsCount = m.topics.length;
    const completedCount = m.topics.filter((t) => Boolean(completedTopicIds[t.id])).length;
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      duration: m.duration,
      moduleNumber: m.moduleNumber,
      completedLessons: completedCount,
      lessonsCount: topicsCount,
      progressPercent: topicsCount > 0 ? Math.round((completedCount / topicsCount) * 100) : 0,
      lessons: m.topics.map((t) => ({
        id: t.id,
        title: t.title,
        status: completedTopicIds[t.id] ? 'completed' : 'active'
      }))
    };
  });

  const getModuleAssessment = (moduleId: string): ModuleAssessment | undefined => {
    return MOCK_ASSESSMENTS[moduleId] || MOCK_ASSESSMENTS['mod-1'];
  };

  return (
    <CourseProgressContext.Provider
      value={{
        modules,
        isAssessmentUnlocked: isModuleAssessmentUnlocked,
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
