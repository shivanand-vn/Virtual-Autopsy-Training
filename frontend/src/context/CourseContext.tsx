import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { type Course, type CourseModule, type Topic, type ContentType, type AssignmentSubmission, type SubmissionStatus, INITIAL_COURSES } from '../types/course';
import type { AssessmentResult } from '../types/assessment';
import { api } from '../lib/api';

export interface CourseContextType {
  courses: Course[];
  activeCourse: Course;
  isLoading: boolean;
  refreshCourses: () => Promise<void>;
  getCourse: (courseId: string) => Course | undefined;
  addCourse: (course: Partial<Course> & { name: string; description: string; modules?: CourseModule[] }) => Promise<Course>;
  updateCourse: (courseId: string, updated: Partial<Course>) => Promise<void>;
  deleteCourse: (courseId: string) => Promise<void>;

  // Module Operations
  addModule: (courseId: string, moduleData: { title: string; description: string; subtitle?: string; duration?: string; cmeCredits?: number; status?: 'draft' | 'published' }) => Promise<CourseModule>;
  updateModule: (courseId: string, moduleId: string, updatedData: Partial<CourseModule>) => Promise<void>;
  deleteModule: (courseId: string, moduleId: string) => Promise<void>;
  reorderModules: (courseId: string, moduleId: string, direction: 'up' | 'down') => void;

  // Topic Operations
  addTopic: (courseId: string, moduleId: string, topicData: Omit<Topic, 'id' | 'order' | 'status'> & { status?: 'draft' | 'published' }) => Promise<Topic>;
  updateTopic: (courseId: string, moduleId: string, topicId: string, updatedData: Partial<Topic>) => Promise<void>;
  deleteTopic: (courseId: string, moduleId: string, topicId: string) => Promise<void>;
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

// Sanitize courses to guarantee huge base64 data URIs never choke localStorage
const sanitizeCoursesForStorage = (courseList: Course[]): Course[] => {
  if (!Array.isArray(courseList)) return [];
  return courseList.map((course) => ({
    ...course,
    modules: (course.modules || []).map((mod) => ({
      ...mod,
      topics: (mod.topics || []).map((top) => ({
        ...top,
        videoUrl: top.videoUrl?.startsWith('data:') ? '' : top.videoUrl,
        thumbnail: top.thumbnail?.startsWith('data:') ? '' : top.thumbnail,
      })),
    })),
  }));
};

const getInitialCourses = (): Course[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return sanitizeCoursesForStorage(parsed);
      }
    }
  } catch (e) {
    console.warn('Failed to parse courses from localStorage. Resetting cache:', e);
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch {
      // Ignore
    }
  }
  return INITIAL_COURSES;
};

// Maps backend Prisma Course model (with modules and resources) to frontend Course format
export const mapBackendCourseToFrontend = (bCourse: any): Course => {
  return {
    id: bCourse.id,
    name: bCourse.title || bCourse.name || '',
    title: bCourse.title || bCourse.name || '',
    shortDescription: bCourse.shortDescription || '',
    description: bCourse.description || '',
    duration: bCourse.duration || '16 Weeks',
    thumbnail: bCourse.thumbnailUrl || bCourse.thumbnail || '',
    thumbnailUrl: bCourse.thumbnailUrl || bCourse.thumbnail || '',
    status: (bCourse.status?.toLowerCase() === 'draft' ? 'draft' : 'published'),
    createdAt: bCourse.createdAt ? new Date(bCourse.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    modules: (bCourse.modules || []).map((m: any, idx: number) => ({
      id: m.id,
      moduleNumber: m.order || (idx + 1),
      title: m.title || '',
      subtitle: m.subtitle || '',
      description: m.description || '',
      duration: m.duration || '2h 00m',
      cmeCredits: m.cmeCredits ?? 4,
      order: m.order || (idx + 1),
      status: (m.status?.toLowerCase() === 'draft' ? 'draft' : 'published'),
      topics: (m.resources || m.topics || []).map((r: any, rIdx: number) => ({
        id: r.id,
        title: r.title || '',
        description: r.description || '',
        contentType: ((r.type === 'VIDEO_STREAM' || r.contentType === 'video') ? 'video' : 'description') as ContentType,
        content: r.content || '',
        videoUrl: r.videoUrl || '',
        bunnyVideoId: r.bunnyVideoId || (r.videoUrl?.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1]),
        thumbnail: r.thumbnail || '',
        order: r.order || (rIdx + 1),
        status: (r.status?.toLowerCase() === 'draft' ? 'draft' : 'published'),
      })),
    })),
  };
};

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(getInitialCourses);
  const [isLoading, setIsLoading] = useState<boolean>(false);

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

  // Sync to localStorage as client-side backup cache
  useEffect(() => {
    try {
      const sanitized = sanitizeCoursesForStorage(courses);
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(sanitized));
    } catch (err) {
      console.warn('LocalStorage quota exceeded or write failed for courses:', err);
      try {
        localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch {
        // Ignore
      }
    }
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

  // Fetch courses directly from Supabase / Backend API on mount
  const refreshCourses = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.get('/courses');
      if (res && res.data && Array.isArray(res.data)) {
        const mapped = res.data.map(mapBackendCourseToFrontend);
        if (mapped.length > 0) {
          setCourses(mapped);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch courses from backend API, using cached data:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCourses();
  }, [refreshCourses]);

  const activeCourse = courses[0] || INITIAL_COURSES[0];

  const getCourse = (courseId: string) => {
    return courses.find((c) => c.id === courseId);
  };

  // ADD COURSE (persists course + modules + topics to backend DB)
  const addCourse = async (
    courseData: Partial<Course> & { name: string; description: string; modules?: CourseModule[] }
  ): Promise<Course> => {
    const payload = {
      title: courseData.name || courseData.title || '',
      shortDescription: courseData.shortDescription || null,
      description: courseData.description,
      duration: courseData.duration || '16 Weeks',
      thumbnailUrl: courseData.thumbnailUrl || courseData.thumbnail || null,
      status: courseData.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
    };

    let createdCourse: Course;

    try {
      const res = await api.post('/courses', payload);
      const bCourse = res.data;
      const courseId = bCourse.id;

      const createdModules: CourseModule[] = [];

      // If modules were constructed in the form, persist each module and its topics to DB
      if (courseData.modules && courseData.modules.length > 0) {
        for (const mod of courseData.modules) {
          try {
            const modRes = await api.post(`/courses/${courseId}/modules`, {
              title: mod.title,
              subtitle: mod.subtitle || null,
              description: mod.description || null,
              duration: mod.duration || '2h 00m',
              durationMinutes: 120,
              cmeCredits: mod.cmeCredits ?? 4,
              status: mod.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
            });
            const bMod = modRes.data;
            const createdTopics: Topic[] = [];

            // Persist topics inside this module
            if (mod.topics && mod.topics.length > 0) {
              for (const top of mod.topics) {
                try {
                  const topRes = await api.post(`/courses/modules/${bMod.id}/topics`, {
                    title: top.title,
                    description: top.description || null,
                    type: top.contentType === 'video' ? 'VIDEO_STREAM' : 'PROTECTED_DOCUMENT',
                    videoUrl: top.videoUrl || null,
                    content: top.content || null,
                    status: top.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
                  });
                  const bTop = topRes.data;
                  createdTopics.push({
                    id: bTop.id,
                    title: bTop.title,
                    description: bTop.description || '',
                    contentType: (bTop.type === 'VIDEO_STREAM' ? 'video' : 'description') as ContentType,
                    content: bTop.content || '',
                    videoUrl: bTop.videoUrl || '',
                    thumbnail: top.thumbnail || '',
                    order: bTop.order || 1,
                    status: bTop.status?.toLowerCase() === 'draft' ? 'draft' : 'published',
                  });
                } catch (topErr) {
                  console.error('Failed to persist topic to DB:', topErr);
                }
              }
            }

            createdModules.push({
              id: bMod.id,
              moduleNumber: bMod.order || (createdModules.length + 1),
              title: bMod.title,
              subtitle: bMod.subtitle || '',
              description: bMod.description || '',
              duration: bMod.duration || '2h 00m',
              cmeCredits: bMod.cmeCredits ?? 4,
              order: bMod.order || (createdModules.length + 1),
              status: bMod.status?.toLowerCase() === 'draft' ? 'draft' : 'published',
              topics: createdTopics,
            });
          } catch (modErr) {
            console.error('Failed to persist module to DB:', modErr);
          }
        }
      }

      createdCourse = {
        ...mapBackendCourseToFrontend(bCourse),
        modules: createdModules,
      };

      setCourses((prev) => [...prev, createdCourse]);
      return createdCourse;
    } catch (err: any) {
      console.warn('API addCourse failed, falling back to local state:', err);
      const newId = `crs-${Date.now().toString().slice(-4)}`;
      createdCourse = {
        id: newId,
        name: courseData.name,
        title: courseData.name,
        shortDescription: courseData.shortDescription || '',
        description: courseData.description,
        duration: courseData.duration || '16 Weeks',
        thumbnail: courseData.thumbnail || '',
        thumbnailUrl: courseData.thumbnailUrl || '',
        status: courseData.status || 'published',
        createdAt: new Date().toISOString().split('T')[0],
        modules: courseData.modules || [],
      };
      setCourses((prev) => [...prev, createdCourse]);
      return createdCourse;
    }
  };

  // UPDATE COURSE (persists metadata and optionally syncs modules)
  const updateCourse = async (courseId: string, updatedData: Partial<Course>): Promise<void> => {
    const payload: any = {};
    if (updatedData.name !== undefined || updatedData.title !== undefined) {
      payload.title = updatedData.name || updatedData.title;
    }
    if (updatedData.shortDescription !== undefined) payload.shortDescription = updatedData.shortDescription;
    if (updatedData.description !== undefined) payload.description = updatedData.description;
    if (updatedData.duration !== undefined) payload.duration = updatedData.duration;
    if (updatedData.thumbnailUrl !== undefined || updatedData.thumbnail !== undefined) {
      payload.thumbnailUrl = updatedData.thumbnailUrl || updatedData.thumbnail;
    }
    if (updatedData.status !== undefined) {
      payload.status = updatedData.status.toUpperCase();
    }

    try {
      await api.put(`/courses/${courseId}`, payload);
    } catch (e) {
      console.warn('API updateCourse failed or course is client-only:', e);
    }

    setCourses((prev) =>
      prev.map((c) => (c.id === courseId ? { ...c, ...updatedData } : c))
    );
  };

  // DELETE COURSE
  const deleteCourse = async (courseId: string): Promise<void> => {
    try {
      await api.delete(`/courses/${courseId}`);
    } catch (e) {
      console.warn('API deleteCourse failed or course is client-only:', e);
    }
    setCourses((prev) => prev.filter((c) => c.id !== courseId));
  };

  // MODULE OPERATIONS
  const addModule = async (
    courseId: string,
    moduleData: { title: string; description: string; subtitle?: string; duration?: string; cmeCredits?: number; status?: 'draft' | 'published' }
  ): Promise<CourseModule> => {
    const payload = {
      title: moduleData.title,
      subtitle: moduleData.subtitle || null,
      description: moduleData.description || null,
      duration: moduleData.duration || '2h 00m',
      durationMinutes: 120,
      cmeCredits: moduleData.cmeCredits ?? 4,
      status: moduleData.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
    };

    let newModule: CourseModule;

    try {
      const res = await api.post(`/courses/${courseId}/modules`, payload);
      const bMod = res.data;
      newModule = {
        id: bMod.id,
        moduleNumber: bMod.order || 1,
        title: bMod.title,
        subtitle: bMod.subtitle || '',
        description: bMod.description || '',
        duration: bMod.duration || '2h 00m',
        cmeCredits: bMod.cmeCredits ?? 4,
        order: bMod.order || 1,
        status: bMod.status?.toLowerCase() === 'draft' ? 'draft' : 'published',
        topics: [],
      };
    } catch (err) {
      console.warn('API addModule failed, falling back to local ID:', err);
      newModule = {
        id: `mod-${Date.now().toString().slice(-4)}`,
        moduleNumber: 1,
        title: moduleData.title,
        subtitle: moduleData.subtitle || '',
        description: moduleData.description,
        duration: moduleData.duration || '2h 00m',
        cmeCredits: moduleData.cmeCredits ?? 4,
        order: 1,
        status: moduleData.status || 'published',
        topics: []
      };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const newOrder = c.modules.length + 1;
          const finalizedMod = { ...newModule, moduleNumber: newOrder, order: newOrder };
          return {
            ...c,
            modules: [...c.modules, finalizedMod]
          };
        }
        return c;
      })
    );

    return newModule;
  };

  const updateModule = async (
    courseId: string,
    moduleId: string,
    updatedData: Partial<CourseModule>
  ): Promise<void> => {
    const payload: any = {};
    if (updatedData.title !== undefined) payload.title = updatedData.title;
    if (updatedData.subtitle !== undefined) payload.subtitle = updatedData.subtitle;
    if (updatedData.description !== undefined) payload.description = updatedData.description;
    if (updatedData.duration !== undefined) payload.duration = updatedData.duration;
    if (updatedData.cmeCredits !== undefined) payload.cmeCredits = updatedData.cmeCredits;
    if (updatedData.order !== undefined) payload.order = updatedData.order;
    if (updatedData.status !== undefined) payload.status = updatedData.status.toUpperCase();

    try {
      await api.put(`/courses/modules/${moduleId}`, payload);
    } catch (e) {
      console.warn('API updateModule failed:', e);
    }

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

  const deleteModule = async (courseId: string, moduleId: string): Promise<void> => {
    try {
      await api.delete(`/courses/modules/${moduleId}`);
    } catch (e) {
      console.warn('API deleteModule failed:', e);
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const filtered = c.modules.filter((m) => m.id !== moduleId);
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

          const reindexed = newModules.map((m, idx) => ({
            ...m,
            moduleNumber: idx + 1,
            order: idx + 1
          }));

          // Sync order to backend in background
          reindexed.forEach((m) => {
            api.put(`/courses/modules/${m.id}`, { order: m.order }).catch(() => {});
          });

          return { ...c, modules: reindexed };
        }
        return c;
      })
    );
  };

  // TOPIC OPERATIONS
  const addTopic = async (
    courseId: string,
    moduleId: string,
    topicData: Omit<Topic, 'id' | 'order' | 'status'> & { status?: 'draft' | 'published' }
  ): Promise<Topic> => {
    const payload = {
      title: topicData.title,
      description: topicData.description || null,
      type: topicData.contentType === 'video' ? 'VIDEO_STREAM' : 'PROTECTED_DOCUMENT',
      videoUrl: topicData.videoUrl || null,
      bunnyVideoId: topicData.bunnyVideoId || (topicData.videoUrl?.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1]) || null,
      content: topicData.content || null,
      status: topicData.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
    };

    let newTopic: Topic;

    try {
      const res = await api.post(`/courses/modules/${moduleId}/topics`, payload);
      const bRes = res.data;
      newTopic = {
        id: bRes.id,
        title: bRes.title,
        description: bRes.description || '',
        contentType: (bRes.type === 'VIDEO_STREAM' ? 'video' : 'description') as ContentType,
        content: bRes.content || '',
        videoUrl: bRes.videoUrl || '',
        bunnyVideoId: bRes.bunnyVideoId || payload.bunnyVideoId || undefined,
        thumbnail: topicData.thumbnail || '',
        order: bRes.order || 1,
        status: bRes.status?.toLowerCase() === 'draft' ? 'draft' : 'published',
      };
    } catch (err) {
      console.warn('API addTopic failed, falling back to local ID:', err);
      newTopic = {
        ...topicData,
        id: `t-${Date.now().toString().slice(-4)}`,
        order: 1,
        status: topicData.status || 'published'
      };
    }

    setCourses((prev) =>
      prev.map((c) => {
        if (c.id === courseId) {
          const updatedModules = c.modules.map((m) => {
            if (m.id === moduleId) {
              const newOrder = m.topics.length + 1;
              const finalizedTopic = { ...newTopic, order: newOrder };
              return {
                ...m,
                topics: [...m.topics, finalizedTopic]
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

  const updateTopic = async (
    courseId: string,
    moduleId: string,
    topicId: string,
    updatedData: Partial<Topic>
  ): Promise<void> => {
    const payload: any = {};
    if (updatedData.title !== undefined) payload.title = updatedData.title;
    if (updatedData.description !== undefined) payload.description = updatedData.description;
    if (updatedData.contentType !== undefined) {
      payload.type = updatedData.contentType === 'video' ? 'VIDEO_STREAM' : 'PROTECTED_DOCUMENT';
    }
    if (updatedData.videoUrl !== undefined) payload.videoUrl = updatedData.videoUrl;
    if (updatedData.bunnyVideoId !== undefined) {
      payload.bunnyVideoId = updatedData.bunnyVideoId;
    } else if (updatedData.videoUrl) {
      payload.bunnyVideoId = updatedData.videoUrl.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1] || null;
    }
    if (updatedData.content !== undefined) payload.content = updatedData.content;
    if (updatedData.order !== undefined) payload.order = updatedData.order;
    if (updatedData.status !== undefined) payload.status = updatedData.status.toUpperCase();

    try {
      await api.put(`/courses/topics/${topicId}`, payload);
    } catch (e) {
      console.warn('API updateTopic failed:', e);
    }

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

  const deleteTopic = async (courseId: string, moduleId: string, topicId: string): Promise<void> => {
    try {
      await api.delete(`/courses/topics/${topicId}`);
    } catch (e) {
      console.warn('API deleteTopic failed:', e);
    }

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

              reindexed.forEach((t) => {
                api.put(`/courses/topics/${t.id}`, { order: t.order }).catch(() => {});
              });

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
        isLoading,
        refreshCourses,
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
