import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDiscussions } from '../context/DiscussionsContext';
import { DocumentPreview } from '../components/discussions/DocumentPreview';
import { DiscussionPostItem } from '../components/discussions/DiscussionPostItem';
import { CommentComposer } from '../components/discussions/CommentComposer';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import {
  ArrowLeft,
  Pin,
  Lock,
  MessageSquare,
  Calendar,
  User,
  ShieldCheck,
  Share2,
  Check,
  AlertCircle
} from 'lucide-react';

export const DiscussionDetail: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const { discussions, addPost, addReply } = useDiscussions();
  const [copiedLink, setCopiedLink] = useState(false);

  const discussion = discussions.find((d) => d.id === discussionId);

  if (!discussion) {
    return (
      <DashboardLayout>
        <div className="space-y-6 pb-12">
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A192F]">Discussion Topic Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The requested topic may have been removed or the URL is invalid.
              </p>
            </div>
            <Link
              to="/discussions"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to All Discussions</span>
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddPost = (content: string) => {
    addPost(discussion.id, {
      authorId: 'user-curr',
      authorName: 'Dr. Sarah Jenkins',
      authorRole: 'student',
      content
    });
  };

  const handleAddReply = (postId: string, content: string) => {
    addReply(discussion.id, postId, {
      authorId: 'user-curr',
      authorName: 'Dr. Sarah Jenkins',
      authorRole: 'student',
      content
    });
  };

  const isClosed = discussion.status === 'closed';

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-16 max-w-4xl mx-auto">
        {/* Navigation & Top Bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate('/discussions')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>Back to Discussions</span>
          </button>

          <button
            onClick={handleCopyLink}
            className="inline-flex items-center space-x-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs transition-colors"
          >
            {copiedLink ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700">Link Copied!</span>
              </>
            ) : (
              <>
                <Share2 className="w-3.5 h-3.5 text-slate-400" />
                <span>Share Topic</span>
              </>
            )}
          </button>
        </div>

        {/* Main Topic Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-sm space-y-6">
          {/* Badges & Meta */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-2">
              {discussion.isPinned && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-xs">
                  <Pin className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pinned Topic</span>
                </span>
              )}
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider">
                {discussion.category}
              </span>
              {isClosed && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Closed Topic</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Posted {discussion.createdAt}</span>
            </div>
          </div>

          {/* Title */}
          <h1 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] tracking-tight leading-snug">
            {discussion.title}
          </h1>

          {/* Author Bar */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#0A192F] text-amber-400 flex items-center justify-center font-extrabold text-sm shadow-xs">
              {discussion.authorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#0A192F]">{discussion.authorName}</span>
                {discussion.authorRole === 'admin' && (
                  <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded">
                    <ShieldCheck className="w-3 h-3" />
                    <span>Course Instructor</span>
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-500">Virtual Autopsy Global Solutions Lead</div>
            </div>
          </div>

          {/* Description Text */}
          <div className="text-xs sm:text-sm text-slate-700 leading-relaxed space-y-3 whitespace-pre-line border-t border-slate-100 pt-4">
            {discussion.description}
          </div>

          {/* Shared Document Attachment Card */}
          {discussion.attachedDocument && (
            <div className="pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Shared Learning Document
              </h4>
              <DocumentPreview document={discussion.attachedDocument} />
            </div>
          )}
        </div>

        {/* Discussion Thread Feed Header */}
        <div className="flex items-center justify-between px-2 pt-2">
          <div className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5 text-amber-500" />
            <h2 className="text-base font-bold text-[#0A192F]">
              Discussion Comments ({discussion.postsCount})
            </h2>
          </div>
          <span className="text-xs text-slate-400">Chronological Order</span>
        </div>

        {/* Posts Feed */}
        <div className="space-y-4">
          {discussion.posts.map((post) => (
            <DiscussionPostItem
              key={post.id}
              post={post}
              isClosed={isClosed}
              onAddReply={handleAddReply}
            />
          ))}
        </div>

        {/* New Comment Form Composer */}
        <div className="pt-2">
          <CommentComposer onAddPost={handleAddPost} isClosed={isClosed} />
        </div>
      </div>
    </DashboardLayout>
  );
};
