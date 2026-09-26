import React, { createContext, useContext, useState, ReactNode } from 'react';
import type { Discussion, DiscussionPost, Reply, SharedDocument } from '../types/discussions';

export const INITIAL_DISCUSSIONS: Discussion[] = [
  {
    id: 'disc-1',
    title: 'Discussion: Advanced Virtual Autopsy CT Findings',
    description: 'Discuss the multi-slice cranial CT findings, bone window presets, and post-mortem artifact differentiations presented in the shared training dossier.',
    category: 'Course Materials',
    authorId: 'admin-1',
    authorName: 'Dr. Arthur Pendelton',
    postedBy: 'Dr. Arthur Pendelton',
    authorRole: 'admin',
    postedByRole: 'Faculty',
    createdAt: '26 Sep 2026',
    postedDate: '26 Sep 2026',
    isPinned: true,
    status: 'pinned',
    postsCount: 3,
    repliesCount: 3,
    participantsCount: 12,
    lastActivity: '2 hours ago',
    newRepliesCount: 3,
    attachedDocument: {
      id: 'doc-1',
      title: 'Advanced Virtual Autopsy Training – CT Findings.pdf',
      name: 'Advanced Virtual Autopsy Training – CT Findings.pdf',
      fileType: 'pdf',
      type: 'pdf',
      fileSize: '4.2 MB',
      size: '4.2 MB',
      downloadUrl: '#'
    },
    relatedDocument: {
      id: 'doc-1',
      title: 'Advanced Virtual Autopsy Training – CT Findings.pdf',
      name: 'Advanced Virtual Autopsy Training – CT Findings.pdf',
      fileType: 'pdf',
      type: 'pdf',
      fileSize: '4.2 MB',
      size: '4.2 MB',
      downloadUrl: '#'
    },
    posts: [
      {
        id: 'post-101',
        discussionId: 'disc-1',
        authorId: 'user-rahul',
        authorName: 'Dr. Rahul Sharma',
        authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        authorRole: 'student',
        createdAt: '2 hours ago',
        timestamp: '2 hours ago',
        content: 'I found the CT findings in section 3 interesting. Can someone explain how calvarial heat fracture lines differ from ante-mortem cranial trauma in PMCT?',
        replies: [
          {
            id: 'rep-201',
            postId: 'post-101',
            authorId: 'user-priya',
            authorName: 'Dr. Priya Patel',
            authorAvatar: 'https://images.unsplash.com/photo-1594824813566-78a933f443e6?w=150&auto=format&fit=crop&q=80',
            authorRole: 'student',
            createdAt: '1 hour ago',
            timestamp: '1 hour ago',
            content: 'Thermal heat baking produces epidural crescentic margins and charring contraction patterns, whereas ante-mortem trauma displays kerf margins and fracture propagation across suture lines.'
          }
        ]
      },
      {
        id: 'post-102',
        discussionId: 'disc-1',
        authorId: 'admin-1',
        authorName: 'Dr. Arthur Pendelton',
        authorAvatar: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80',
        authorRole: 'admin',
        createdAt: '30 mins ago',
        timestamp: '30 mins ago',
        content: 'Excellent observation Priya. Pay close attention to slice 42 where lipophilic contrast shows coronary arterial patency.',
        replies: []
      }
    ]
  },
  {
    id: 'disc-2',
    title: 'Discussion: Post-Mortem CT Angiography (PMCTA) Interpretation',
    description: 'Targeted femoral arterial cannulation protocols, contrast agent lipophilic ratios, and coronary lumen stenosis identification.',
    category: 'Case Studies',
    authorId: 'admin-1',
    authorName: 'Dr. Arthur Pendelton',
    postedBy: 'Dr. Arthur Pendelton',
    authorRole: 'admin',
    postedByRole: 'Faculty',
    createdAt: '24 Sep 2026',
    postedDate: '24 Sep 2026',
    isPinned: false,
    status: 'active',
    postsCount: 1,
    repliesCount: 1,
    participantsCount: 9,
    lastActivity: '4 hours ago',
    newRepliesCount: 1,
    attachedDocument: {
      id: 'doc-2',
      title: 'PMCTA Interpretation & Coronary Contrast Guide.pdf',
      name: 'PMCTA Interpretation & Coronary Contrast Guide.pdf',
      fileType: 'pdf',
      type: 'pdf',
      fileSize: '8.1 MB',
      size: '8.1 MB',
      downloadUrl: '#'
    },
    relatedDocument: {
      id: 'doc-2',
      title: 'PMCTA Interpretation & Coronary Contrast Guide.pdf',
      name: 'PMCTA Interpretation & Coronary Contrast Guide.pdf',
      fileType: 'pdf',
      type: 'pdf',
      fileSize: '8.1 MB',
      size: '8.1 MB',
      downloadUrl: '#'
    },
    posts: [
      {
        id: 'post-201',
        discussionId: 'disc-2',
        authorId: 'user-marcus',
        authorName: 'Dr. Marcus Thorne',
        authorAvatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
        authorRole: 'student',
        createdAt: '4 hours ago',
        timestamp: '4 hours ago',
        content: 'When evaluating the multi-slice PMCTA scans in case #12, the filling defect in the left anterior descending artery corresponds directly with histopathological calcification.',
        replies: []
      }
    ]
  },
  {
    id: 'disc-3',
    title: 'Discussion: Image-Based Case Study — High-Velocity Ballistic Entry',
    description: 'Review of 3D CT surface reconstructions, internal wound track beveling, and metallic projectile fragment localization.',
    category: 'Announcements',
    authorId: 'admin-1',
    authorName: 'Dr. Arthur Pendelton',
    postedBy: 'Dr. Arthur Pendelton',
    authorRole: 'admin',
    postedByRole: 'Course Admin',
    createdAt: '20 Sep 2026',
    postedDate: '20 Sep 2026',
    isPinned: false,
    status: 'closed',
    postsCount: 1,
    repliesCount: 1,
    participantsCount: 15,
    lastActivity: '2 days ago',
    attachedDocument: {
      id: 'doc-3',
      title: 'Case Study 03 – Ballistic Reconstruction Slices.dcm',
      name: 'Case Study 03 – Ballistic Reconstruction Slices.dcm',
      fileType: 'dicom',
      type: 'dicom',
      fileSize: '15.4 MB',
      size: '15.4 MB',
      downloadUrl: '#'
    },
    relatedDocument: {
      id: 'doc-3',
      title: 'Case Study 03 – Ballistic Reconstruction Slices.dcm',
      name: 'Case Study 03 – Ballistic Reconstruction Slices.dcm',
      fileType: 'dicom',
      type: 'dicom',
      fileSize: '15.4 MB',
      size: '15.4 MB',
      downloadUrl: '#'
    },
    posts: [
      {
        id: 'post-301',
        discussionId: 'disc-3',
        authorId: 'user-kenji',
        authorName: 'Dr. Kenji Sato',
        authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        authorRole: 'student',
        createdAt: '2 days ago',
        timestamp: '2 days ago',
        content: 'The 3D volume rendering clearly shows the internal beveling on the parietal bone table. This case study was extremely helpful.',
        replies: []
      }
    ]
  }
];

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
