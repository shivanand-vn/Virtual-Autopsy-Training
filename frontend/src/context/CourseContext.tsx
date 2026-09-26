import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type Course, type CourseModule, type Topic, INITIAL_COURSES } from '../types/course';

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

  // Student Progress Operations
  completedTopicIds: Record<string, boolean>; // topicId -> boolean
  toggleTopicCompletion: (topicId: string) => void;
  isModuleCompletedByStudent: (moduleId: string) => boolean;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(INITIAL_COURSES);
  
  // Student completed topic tracking (by topic id)
  const [completedTopicIds, setCompletedTopicIds] = useState<Record<string, boolean>>({});

  const activeCourse = courses[0];

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

  // STUDENT PROGRESS OPERATIONS
  const toggleTopicCompletion = (topicId: string) => {
    setCompletedTopicIds((prev) => ({
      ...prev,
      [topicId]: !prev[topicId]
    }));
  };

  const isModuleCompletedByStudent = (moduleId: string): boolean => {
    for (const c of courses) {
      const targetMod = c.modules.find((m) => m.id === moduleId);
      if (targetMod) {
        if (targetMod.topics.length === 0) return false;
        return targetMod.topics.every((t) => Boolean(completedTopicIds[t.id]));
      }
    }
    return false;
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

        completedTopicIds,
        toggleTopicCompletion,
        isModuleCompletedByStudent
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
