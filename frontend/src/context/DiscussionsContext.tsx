import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Discussion, DiscussionPost, Reply, SharedDocument } from '../types/discussions';

export const INITIAL_DISCUSSIONS: Discussion[] = [];

export interface DiscussionsContextType {
  discussions: Discussion[];
  getDiscussionById: (id: string) => Discussion | undefined;
  addPost: (discussionId: string, postData: { authorId?: string; authorName: string; authorRole: string; content: string }) => void;
  addReply: (discussionId: string, postId: string, replyData: { authorId?: string; authorName: string; authorRole: string; content: string }) => void;
  createDiscussion: (discussionData: {
    title: string;
    description: string;
    category: 'Course Materials' | 'Case Studies' | 'Announcements' | 'General Discussion';
    authorId?: string;
    authorName: string;
    authorRole: string;
    attachedDocument?: SharedDocument;
    isPinned?: boolean;
  }) => void;
  togglePinDiscussion: (id: string) => void;
  toggleCloseDiscussion: (id: string) => void;
  deleteDiscussion: (id: string) => void;
}

const defaultContextValue: DiscussionsContextType = {
  discussions: INITIAL_DISCUSSIONS,
  getDiscussionById: (id: string) => INITIAL_DISCUSSIONS.find((d) => d.id === id),
  addPost: () => {},
  addReply: () => {},
  createDiscussion: () => {},
  togglePinDiscussion: () => {},
  toggleCloseDiscussion: () => {},
  deleteDiscussion: () => {}
};

const DiscussionsContext = createContext<DiscussionsContextType | undefined>(undefined);

export const DiscussionsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [discussions, setDiscussions] = useState<Discussion[]>(INITIAL_DISCUSSIONS);

  const getDiscussionById = (id: string) => {
    return discussions.find((d) => d.id === id);
  };

  const addPost = (
    discussionId: string,
    postData: { authorId?: string; authorName: string; authorRole: string; content: string }
  ) => {
    const newPost: DiscussionPost = {
      id: `post-${Date.now()}`,
      discussionId,
      authorId: postData.authorId || 'user-current',
      authorName: postData.authorName,
      authorRole: postData.authorRole,
      createdAt: 'Just now',
      timestamp: 'Just now',
      content: postData.content,
      replies: []
    };

    setDiscussions((prev) =>
      prev.map((disc) => {
        if (disc.id === discussionId) {
          const updatedPosts = [...disc.posts, newPost];
          return {
            ...disc,
            posts: updatedPosts,
            postsCount: updatedPosts.length,
            repliesCount: (disc.repliesCount || 0) + 1,
            lastActivity: 'Just now'
          };
        }
        return disc;
      })
    );
  };

  const addReply = (
    discussionId: string,
    postId: string,
    replyData: { authorId?: string; authorName: string; authorRole: string; content: string }
  ) => {
    const newReply: Reply = {
      id: `rep-${Date.now()}`,
      postId,
      authorId: replyData.authorId || 'user-current',
      authorName: replyData.authorName,
      authorRole: replyData.authorRole,
      createdAt: 'Just now',
      timestamp: 'Just now',
      content: replyData.content
    };

    setDiscussions((prev) =>
      prev.map((disc) => {
        if (disc.id === discussionId) {
          const updatedPosts = disc.posts.map((post) => {
            if (post.id === postId) {
              return {
                ...post,
                replies: [...(post.replies || []), newReply]
              };
            }
            return post;
          });

          return {
            ...disc,
            posts: updatedPosts,
            repliesCount: (disc.repliesCount || 0) + 1,
            lastActivity: 'Just now'
          };
        }
        return disc;
      })
    );
  };

  const createDiscussion = (discussionData: {
    title: string;
    description: string;
    category: 'Course Materials' | 'Case Studies' | 'Announcements' | 'General Discussion';
    authorId?: string;
    authorName: string;
    authorRole: string;
    attachedDocument?: SharedDocument;
    isPinned?: boolean;
  }) => {
    const newDisc: Discussion = {
      id: `disc-${Date.now()}`,
      title: discussionData.title,
      description: discussionData.description,
      category: discussionData.category,
      authorId: discussionData.authorId || 'admin-1',
      authorName: discussionData.authorName,
      postedBy: discussionData.authorName,
      authorRole: discussionData.authorRole,
      postedByRole: discussionData.authorRole === 'admin' ? 'Faculty' : 'Student',
      attachedDocument: discussionData.attachedDocument,
      relatedDocument: discussionData.attachedDocument,
      createdAt: 'Just now',
      postedDate: 'Just now',
      isPinned: !!discussionData.isPinned,
      status: discussionData.isPinned ? 'pinned' : 'active',
      postsCount: 0,
      repliesCount: 0,
      participantsCount: 1,
      lastActivity: 'Just now',
      posts: []
    };

    setDiscussions((prev) => [newDisc, ...prev]);
  };

  const togglePinDiscussion = (id: string) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextPinned = !d.isPinned;
          return {
            ...d,
            isPinned: nextPinned,
            status: nextPinned ? 'pinned' : (d.status === 'closed' ? 'closed' : 'active')
          };
        }
        return d;
      })
    );
  };

  const toggleCloseDiscussion = (id: string) => {
    setDiscussions((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const nextClosed = d.status !== 'closed';
          return {
            ...d,
            status: nextClosed ? 'closed' : (d.isPinned ? 'pinned' : 'active')
          };
        }
        return d;
      })
    );
  };

  const deleteDiscussion = (id: string) => {
    setDiscussions((prev) => prev.filter((d) => d.id !== id));
  };

  return (
    <DiscussionsContext.Provider
      value={{
        discussions,
        getDiscussionById,
        addPost,
        addReply,
        createDiscussion,
        togglePinDiscussion,
        toggleCloseDiscussion,
        deleteDiscussion
      }}
    >
      {children}
    </DiscussionsContext.Provider>
  );
};

export const useDiscussions = () => {
  const context = useContext(DiscussionsContext);
  if (!context) {
    // Return fallback context instead of crashing the UI if rendered outside Provider
    return defaultContextValue;
  }
  return context;
};
