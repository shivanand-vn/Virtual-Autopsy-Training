import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { type Course, type CourseModule, type Topic, type AssignmentSubmission, type SubmissionStatus, INITIAL_COURSES } from '../types/course';

import type { AssessmentResult } from '../types/assessment';

interface CourseContextType {
  courses: Course[];
  activeCourse: Course;
  getCourse: (courseId: string) => Course | undefined;
  addCourse: (course: Omit<Course, 'id' | 'createdAt' | 'modules'>) => Course;
  updateCourse: (courseId: string, updated: Partial<Course>) => void;
  deleteCourse: (courseId: string) => void;

  // Module Operations
  addModule: (courseId: string, moduleData: { title: string; description: string; subtitle?: string }) => CourseModule;
  updateModule: (courseId: string, moduleId: string, updatedData: Partial<CourseModule>) => void;
  deleteModule: (courseId: string, moduleId: string) => void;
  reorderModules: (courseId: string, moduleId: string, direction: 'up' | 'down') => void;

  // Topic Operations
  addTopic: (courseId: string, moduleId: string, topicData: Omit<Topic, 'id' | 'order' | 'status'>) => Topic;
  updateTopic: (courseId: string, moduleId: string, topicId: string, updatedData: Partial<Topic>) => void;
  deleteTopic: (courseId: string, moduleId: string, topicId: string) => void;
  reorderTopics: (courseId: string, moduleId: string, topicId: string, direction: 'up' | 'down') => void;

  // Assignment Submissions Operations
  assignmentSubmissions: AssignmentSubmission[];
  submitAssignment: (submissionData: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  updateSubmissionStatus: (submissionId: string, status: SubmissionStatus, adminFeedback?: string) => void;
  getSubmissionForTopic: (topicId: string, studentId?: string) => AssignmentSubmission | undefined;
  getPendingSubmissionsCount: () => number;

  // Student Progress & Strict Sequential Gating Operations
  completedTopicIds: Record<string, boolean>; // topicId -> boolean
  assessmentResults: Record<string, AssessmentResult>; // moduleId -> AssessmentResult
  markTopicCompleted: (topicId: string) => void;
  toggleTopicCompletion: (topicId: string) => void;
  saveAssessmentResult: (result: AssessmentResult) => void;
  getAssessmentResult: (moduleId: string) => AssessmentResult | undefined;
  isTopicCompleted: (topicId: string) => boolean;
  isModuleTopicsCompleted: (moduleId: string) => boolean;
  isModuleAssessmentCompleted: (moduleId: string) => boolean;
  isModuleCompletedByStudent: (moduleId: string) => boolean;
  isModuleUnlocked: (moduleId: string) => boolean;
  isTopicUnlocked: (moduleId: string, topicId: string) => boolean;
  isModuleAssessmentUnlocked: (moduleId: string) => boolean;
  getModuleStatus: (moduleId: string) => 'locked' | 'in_progress' | 'waiting_for_assessment' | 'completed';
  isCourseCompleted: () => boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'va_lms_courses';
const TOPICS_LOCAL_STORAGE_KEY = 'va_lms_completed_topic_ids';
const ASSESSMENTS_LOCAL_STORAGE_KEY = 'va_lms_assessment_results';
const ASSIGNMENTS_LOCAL_STORAGE_KEY = 'va_lms_assignment_submissions';

const INITIAL_SUBMISSIONS: AssignmentSubmission[] = [
  {
    id: 'sub-001',
    studentId: 'std-001',
    studentName: 'Dr. Sarah Jenkins',
    studentEmail: 'sarah.jenkins@hospital.org',
    courseId: 'crs-va-001',
    courseName: 'Virtual Autopsy Online Training',
    moduleId: 'mod-2',
    moduleTitle: 'PMCT Acquisition Protocols & MPR Reconstruction',
    topicId: 't-5',
    topicTitle: 'Multi-Planar Reconstruction (MPR) Hands-on PACS Exercise',
    submittedAt: '2025-02-28 14:30',
    status: 'PENDING',
    assignmentInstructions: 'Review the provided PMCT dataset for metallic artifact reduction. Perform coronal and sagittal MPR reformations and submit a summary of your findings including Hounsfield unit measurements and artifact mitigation strategy.',
    studentResponseText: 'Observed streak reduction using 120kVp with iterative metal artifact reduction (iMAR). Multiplanar coronal view demonstrates clear petrous apex alignment without beam hardening artifact (+1420 HU max).',
    uploadedFileName: 'Sarah_Jenkins_MPR_Analysis.pdf'
  }
];

const getInitialCourses = (): Course[] => {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    } catch (e) {
      console.error('Failed to parse courses from localStorage', e);
    }
  }
  return INITIAL_COURSES;
};

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(getInitialCourses);

  // Persistent student completed topics (by topic id)
  const [completedTopicIds, setCompletedTopicIds] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem(TOPICS_LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse completedTopicIds from localStorage', e);
    }
    return {};
  });

  // Persistent student module assessment results (by module id)
  const [assessmentResults, setAssessmentResults] = useState<Record<string, AssessmentResult>>(() => {
    try {
      const saved = localStorage.getItem(ASSESSMENTS_LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse assessmentResults from localStorage', e);
    }
    return {};
  });

  // Persistent student assignment submissions
  const [assignmentSubmissions, setAssignmentSubmissions] = useState<AssignmentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem(ASSIGNMENTS_LOCAL_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse assignmentSubmissions from localStorage', e);
    }
    return INITIAL_SUBMISSIONS;
  });

  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(courses));
  }, [courses]);

  useEffect(() => {
    localStorage.setItem(TOPICS_LOCAL_STORAGE_KEY, JSON.stringify(completedTopicIds));
  }, [completedTopicIds]);

  useEffect(() => {
    localStorage.setItem(ASSESSMENTS_LOCAL_STORAGE_KEY, JSON.stringify(assessmentResults));
  }, [assessmentResults]);

  useEffect(() => {
    localStorage.setItem(ASSIGNMENTS_LOCAL_STORAGE_KEY, JSON.stringify(assignmentSubmissions));
  }, [assignmentSubmissions]);

  const activeCourse = courses[0] || INITIAL_COURSES[0];

  const getCourse = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  const addCourse = (courseData: Omit<Course, 'id' | 'createdAt' | 'modules'>): Course => {
    const newId = `crs-${Date.now().toString().slice(-4)}`;
    const newCourse: Course = {
      ...courseData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0],
      modules: []
    };
    setCourses((prev) => [...prev, newCourse]);
    return newCourse;
  };

  const updateCourse = (courseId: string, updatedData: Partial<Course>) => {
    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updatedData } : c))
    );
  };

  const deleteCourse = (courseId: string) => {
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  // MODULE OPERATIONS
  const addModule = (
    courseId: string,
    moduleData: { title: string; description: string; subtitle?: string }
  ): CourseModule => {
    let newModule: CourseModule = {
      id: `mod-${Date.now().toString().slice(-4)}`,
      moduleNumber: 1,
      title: moduleData.title,
      subtitle: moduleData.subtitle || '',
      description: moduleData.description,
      duration: '2h 00m',
      cmeCredits: 4,
      order: 1,
      status: 'published',
      topics: []
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const newOrder = c.modules.length + 1;
          newModule = {
            ...newModule,
            moduleNumber: newOrder,
            order: newOrder
          };
          return {
            ...c,
            modules: [...c.modules, newModule]
          };
        }
        return c;
      })
    );

    return newModule;
  };

  const updateModule = (courseId: string, moduleId: string, updatedData: Partial<CourseModule>) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) =>
            m.id === moduleId ? { ...m, ...updatedData } : m
          );
          return { ...c, modules: updatedModules };
        }
        return c;
      })
    );
  };

  const deleteModule = (courseId: string, moduleId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const filtered = c.modules.filter((m) => m.id !== moduleId);
          // Re-index module orders & numbers
          const reindexed = filtered.map((m, idx) => ({
            ...m,
            moduleNumber: idx + 1,
            order: idx + 1
          }));
          return { ...c, modules: reindexed };
        }
        return c;
      })
    );
  };

  const reorderModules = (courseId: string, moduleId: string, direction: 'up' | 'down') => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const index = c.modules.findIndex((m) => m.id === moduleId);
          if (index === -1) return c;
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= c.modules.length) return c;

          const newModules = [...c.modules];
          const temp = newModules[index];
          newModules[index] = newModules[targetIndex];
          newModules[targetIndex] = temp;

          // Update numbering
          const reindexed = newModules.map((m, idx) => ({
            ...m,
            moduleNumber: idx + 1,
            order: idx + 1
          }));

          return { ...c, modules: reindexed };
        }
        return c;
      })
    );
  };

  // TOPIC OPERATIONS
  const addTopic = (
    courseId: string,
    moduleId: string,
    topicData: Omit<Topic, 'id' | 'order' | 'status'>
  ): Topic => {
    let newTopic: Topic = {
      ...topicData,
      id: `t-${Date.now().toString().slice(-4)}`,
      order: 1,
      status: 'published'
    };

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const newOrder = m.topics.length + 1;
              newTopic = { ...newTopic, order: newOrder };
              return {
                ...m,
                topics: [...m.topics, newTopic]
              };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      })
    );

    return newTopic;
  };

  const updateTopic = (
    courseId: string,
    moduleId: string,
    topicId: string,
    updatedData: Partial<Topic>
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const updatedTopics = m.topics.map((t) =>
                t.id === topicId ? { ...t, ...updatedData } : t
              );
              return { ...m, topics: updatedTopics };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      })
    );
  };

  const deleteTopic = (courseId: string, moduleId: string, topicId: string) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const filtered = m.topics.filter((t) => t.id !== topicId);
              const reindexed = filtered.map((t, idx) => ({ ...t, order: idx + 1 }));
              return { ...m, topics: reindexed };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      })
    );
  };

  const reorderTopics = (
    courseId: string,
    moduleId: string,
    topicId: string,
    direction: 'up' | 'down'
  ) => {
    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const index = m.topics.findIndex((t) => t.id === topicId);
              if (index === -1) return m;
              const targetIndex = direction === 'up' ? index - 1 : index + 1;
              if (targetIndex < 0 || targetIndex >= m.topics.length) return m;

              const newTopics = [...m.topics];
              const temp = newTopics[index];
              newTopics[index] = newTopics[targetIndex];
              newTopics[targetIndex] = temp;

              const reindexed = newTopics.map((t, idx) => ({ ...t, order: idx + 1 }));
              return { ...m, topics: reindexed };
            }
            return m;
          });
          return { ...c, modules: updatedModules };
        }
        return c;
      })
    );
  };

  // STUDENT PROGRESS & STRICT SEQUENTIAL GATING OPERATIONS
  const markTopicCompleted = (topicId: string) => {
    setCompletedTopicIds((prev) => ({
      ...prev,
      [topicId]: true
    }));
  };

  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopicIds((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
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

  const isTopicCompleted = (topicId: string): boolean => {
    return Boolean(completedTopicIds[topicId]);
  };

  const isModuleTopicsCompleted = (moduleId: string): boolean => {
    const targetMod = activeCourse.modules.find((m) => m.id === moduleId);
    if (!targetMod || targetMod.topics.length === 0) return false;
    return targetMod.topics.every((t) => Boolean(completedTopicIds[t.id]));
  };

  const isModuleAssessmentCompleted = (moduleId: string): boolean => {
    return Boolean(assessmentResults[moduleId]?.passed);
  };

  const isModuleCompletedByStudent = (moduleId: string): boolean => {
    return isModuleTopicsCompleted(moduleId) && isModuleAssessmentCompleted(moduleId);
  };

  // Rule: Module 1 is unlocked. Module N unlocks ONLY after Module N-1 topics AND Module N-1 assessment are completed!
  const isModuleUnlocked = (moduleId: string): boolean => {
    const modules = activeCourse.modules || [];
    const index = modules.findIndex((m) => m.id === moduleId);
    if (index <= 0) return true; // Module 1 is always unlocked

    const prevMod = modules[index - 1];
    return isModuleTopicsCompleted(prevMod.id) && isModuleAssessmentCompleted(prevMod.id);
  };

  // Rule: Inside an unlocked module, Topic 1 is unlocked. Topic N unlocks ONLY after Topic N-1 is completed!
  const isTopicUnlocked = (moduleId: string, topicId: string): boolean => {
    if (!isModuleUnlocked(moduleId)) return false;

    const targetMod = activeCourse.modules.find((m) => m.id === moduleId);
    if (!targetMod) return false;

    const topicIndex = targetMod.topics.findIndex((t) => t.id === topicId);
    if (topicIndex <= 0) return true; // First topic in unlocked module is unlocked

    const prevTopic = targetMod.topics[topicIndex - 1];
    return Boolean(completedTopicIds[prevTopic.id]);
  };

  // Rule: Module Assessment unlocks ONLY after ALL topics in that module are completed!
  const isModuleAssessmentUnlocked = (moduleId: string): boolean => {
    return isModuleUnlocked(moduleId) && isModuleTopicsCompleted(moduleId);
  };

  const getModuleStatus = (
    moduleId: string
  ): 'locked' | 'in_progress' | 'waiting_for_assessment' | 'completed' => {
    if (!isModuleUnlocked(moduleId)) return 'locked';
    if (!isModuleTopicsCompleted(moduleId)) return 'in_progress';
    if (!isModuleAssessmentCompleted(moduleId)) return 'waiting_for_assessment';
    return 'completed';
  };

  const isCourseCompleted = (): boolean => {
    const modules = activeCourse.modules || [];
    if (modules.length === 0) return false;
    return modules.every((m) => isModuleCompletedByStudent(m.id));
  };

  // ASSIGNMENT SUBMISSIONS IMPLEMENTATION
  const submitAssignment = (
    submissionData: Omit<AssignmentSubmission, 'id' | 'submittedAt' | 'status'>
  ) => {
    setAssignmentSubmissions((prev) => {
      const existingIndex = prev.findIndex(
        (s) => s.topicId === submissionData.topicId && s.studentId === submissionData.studentId
      );
      const now = new Date();
      const formattedDate = `${now.toISOString().split('T')[0]} ${now.toTimeString().slice(0, 5)}`;

      if (existingIndex !== -1) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          ...submissionData,
          submittedAt: formattedDate,
          status: 'PENDING',
          adminFeedback: undefined
        };
        return updated;
      }

      const newSubmission: AssignmentSubmission = {
        ...submissionData,
        id: `sub-${Date.now().toString().slice(-4)}`,
        submittedAt: formattedDate,
        status: 'PENDING'
      };
      return [newSubmission, ...prev];
    });
  };

  const updateSubmissionStatus = (
    submissionId: string,
    status: SubmissionStatus,
    adminFeedback?: string
  ) => {
    const targetSub = assignmentSubmissions.find((s) => s.id === submissionId);
    if (targetSub) {
      if (status === 'APPROVED') {
        markTopicCompleted(targetSub.topicId);
      } else if (status === 'REJECTED') {
        setCompletedTopicIds((prev) => {
          const next = { ...prev };
          delete next[targetSub.topicId];
          return next;
        });
      }
    }

    setAssignmentSubmissions((prev) =>
      prev.map((s) =>
        s.id === submissionId
          ? {
              ...s,
              status,
              adminFeedback,
              reviewedAt: new Date().toISOString().split('T')[0]
            }
          : s
      )
    );
  };

  const getSubmissionForTopic = (
    topicId: string,
    studentId = 'std-001'
  ): AssignmentSubmission | undefined => {
    return assignmentSubmissions.find(
      (s) => s.topicId === topicId && s.studentId === studentId
    );
  };

  const getPendingSubmissionsCount = (): number => {
    return assignmentSubmissions.filter((s) => s.status === 'PENDING').length;
  };

  return (
    <CourseContext.Provider
      value={{
        courses,
        activeCourse,
        getCourse,
        addCourse,
        updateCourse,
        deleteCourse,

        addModule,
        updateModule,
        deleteModule,
        reorderModules,

        addTopic,
        updateTopic,
        deleteTopic,
        reorderTopics,

        assignmentSubmissions,
        submitAssignment,
        updateSubmissionStatus,
        getSubmissionForTopic,
        getPendingSubmissionsCount,

        completedTopicIds,
        assessmentResults,
        markTopicCompleted,
        toggleTopicCompletion,
        saveAssessmentResult,
        getAssessmentResult,
        isTopicCompleted,
        isModuleTopicsCompleted,
        isModuleAssessmentCompleted,
        isModuleCompletedByStudent,
        isModuleUnlocked,
        isTopicUnlocked,
        isModuleAssessmentUnlocked,
        getModuleStatus,
        isCourseCompleted
      }}
    >
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) {
    throw new Error('useCourse must be used within a CourseProvider');
  }
  return context;
};

export const useCourses = useCourse;
