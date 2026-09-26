export const DISCUSSION_CATEGORIES = [
  'Course Materials',
  'Case Studies',
  'Announcements',
  'General Discussion'
] as const;

export type DiscussionCategory = (typeof DISCUSSION_CATEGORIES)[number];

export interface SharedDocument {
  id: string;
  title: string;
  name?: string;
  fileType: 'pdf' | 'dicom' | 'image' | 'doc';
  type?: 'pdf' | 'dicom' | 'image' | 'doc';
  fileSize: string;
  size?: string;
  downloadUrl?: string;
  previewUrl?: string;
}

export interface Reply {
  id: string;
  postId?: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  content: string;
  createdAt: string;
  timestamp?: string;
}

export interface DiscussionPost {
  id: string;
  discussionId?: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: string;
  content: string;
  createdAt: string;
  timestamp?: string;
  replies: Reply[];
}

export interface Discussion {
  id: string;
  title: string;
  description: string;
  category: DiscussionCategory;
  authorId?: string;
  authorName: string;
  postedBy?: string;
  authorRole: string;
  postedByRole?: string;
  attachedDocument?: SharedDocument;
  relatedDocument?: SharedDocument;
  createdAt: string;
  postedDate?: string;
  isPinned: boolean;
  status: 'active' | 'pinned' | 'closed';
  postsCount: number;
  repliesCount?: number;
  participantsCount?: number;
  lastActivity?: string;
  newRepliesCount?: number;
  posts: DiscussionPost[];
}
