import React, { useState } from 'react';
import { Reply as ReplyIcon, Send, ShieldCheck, User, Clock, CheckCircle2 } from 'lucide-react';
import type { DiscussionPost } from '../../types/discussions';

interface DiscussionPostItemProps {
  post: DiscussionPost;
  isClosed?: boolean;
  onAddReply: (postId: string, content: string) => void;
}

export const DiscussionPostItem: React.FC<DiscussionPostItemProps> = ({
  post,
  isClosed = false,
  onAddReply
}) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyContent.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddReply(post.id, replyContent.trim());
      setReplyContent('');
      setShowReplyForm(false);
      setIsSubmitting(false);
    }, 300);
  };

  const isAdminPost = post.authorRole === 'admin';

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      isAdminPost
        ? 'bg-amber-50/20 border-amber-200/80 shadow-xs'
        : 'bg-white border-slate-200/80'
    }`}>
      {/* Main Comment Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center space-x-3">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-extrabold text-sm shadow-xs ${
            isAdminPost
              ? 'bg-[#0A192F] text-amber-400 ring-2 ring-amber-400/50'
              : 'bg-slate-800 text-white'
          }`}>
            {post.authorAvatar ? (
              <img src={post.authorAvatar} alt={post.authorName} className="w-full h-full rounded-full object-cover" />
            ) : (
              post.authorName.charAt(0)
            )}
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <h4 className="text-sm font-bold text-[#0A192F]">{post.authorName}</h4>
              {isAdminPost && (
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-md shadow-2xs">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Course Instructor</span>
                </span>
              )}
              {post.authorRole === 'student' && (
                <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-md border border-slate-200">
                  Enrolled Student
                </span>
              )}
            </div>
            <div className="flex items-center space-x-1.5 text-[11px] text-slate-400 mt-0.5">
              <Clock className="w-3 h-3 text-slate-400" />
              <span>{post.createdAt}</span>
            </div>
          </div>
        </div>

        {!isClosed && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors border border-transparent hover:border-amber-200"
          >
            <ReplyIcon className="w-3.5 h-3.5" />
            <span>Reply</span>
          </button>
        )}
      </div>

      {/* Comment Content */}
      <div className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed pl-0 sm:pl-13 whitespace-pre-line">
        {post.content}
      </div>

      {/* Replies Feed */}
      {post.replies && post.replies.length > 0 && (
        <div className="mt-4 sm:ml-12 pl-4 border-l-2 border-slate-200 space-y-3 pt-2">
          {post.replies.map((reply) => {
            const isReplyAdmin = reply.authorRole === 'admin';
            return (
              <div
                key={reply.id}
                className={`p-3.5 rounded-xl border ${
                  isReplyAdmin
                    ? 'bg-amber-50/40 border-amber-200/80'
                    : 'bg-slate-50/80 border-slate-200/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                      isReplyAdmin ? 'bg-[#0A192F] text-amber-400' : 'bg-slate-700 text-white'
                    }`}>
                      {reply.authorName.charAt(0)}
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0A192F]">{reply.authorName}</span>
                      {isReplyAdmin && (
                        <span className="ml-1.5 px-1.5 py-0.2 bg-amber-500 text-slate-950 font-extrabold text-[9px] rounded">
                          Instructor
                        </span>
                      )}
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400">{reply.createdAt}</span>
                </div>
                <p className="text-xs text-slate-700 mt-2 pl-9 leading-relaxed">
                  {reply.content}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {/* Inline Reply Form */}
      {showReplyForm && !isClosed && (
        <form onSubmit={handleReplySubmit} className="mt-4 sm:ml-12 pl-4 border-l-2 border-amber-400 space-y-2 pt-2">
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder={`Reply to ${post.authorName}...`}
            rows={2}
            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
            required
          />
          <div className="flex items-center justify-end space-x-2">
            <button
              type="button"
              onClick={() => setShowReplyForm(false)}
              className="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 rounded-lg"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !replyContent.trim()}
              className="inline-flex items-center space-x-1.5 px-4 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs disabled:opacity-50 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Posting...' : 'Post Reply'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
