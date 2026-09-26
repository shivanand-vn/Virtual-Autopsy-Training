export type ContentType = 'description' | 'video';

export interface Topic {
  id: string;
  title: string;
  description: string;
  contentType: ContentType;
  content?: string; // For text / description topics
  videoUrl?: string; // For video topics
  thumbnail?: string;
  order: number;
  status: 'draft' | 'published';
}

export interface CourseModule {
  id: string;
  moduleNumber: number; // Derived from position (1, 2, 3...)
  title: string;
  subtitle?: string;
  description: string;
  duration: string;
  cmeCredits: number;
  order: number;
  status: 'draft' | 'published';
  topics: Topic[];
}

export interface Course {
  id: string;
  name: string;
  shortDescription: string;
  description: string;
  duration: string;
  thumbnail?: string;
  status: 'draft' | 'published';
  createdAt: string;
  modules: CourseModule[];
}

// INITIAL STATE STARTS COMPLETELY EMPTY
export const INITIAL_COURSES: Course[] = [];
