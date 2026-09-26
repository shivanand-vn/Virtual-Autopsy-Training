import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useDiscussions } from '../../context/DiscussionsContext';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { DocumentPreview } from '../../components/discussions/DocumentPreview';
import { DiscussionPostItem } from '../../components/discussions/DiscussionPostItem';
import { CommentComposer } from '../../components/discussions/CommentComposer';
import {
  ArrowLeft,
  Pin,
  Lock,
  Unlock,
  Trash2,
  Edit,
  MessageSquare,
  Calendar,
  ShieldCheck,
  Share2,
  Check,
  AlertCircle,
  ChevronRight,
  FileText,
  ExternalLink,
  Download
} from 'lucide-react';

export const AdminDiscussionDetail: React.FC = () => {
  const { discussionId } = useParams<{ discussionId: string }>();
  const navigate = useNavigate();
  const {
    discussions,
    addPost,
    addReply,
    togglePinDiscussion,
    toggleCloseDiscussion,
    deleteDiscussion
  } = useDiscussions();

  const [copiedLink, setCopiedLink] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const discussion = discussions.find((d) => d.id === discussionId);

  if (!discussion) {
    return (
      <AdminLayout title="Discussion Topic Details" subtitle="Discussions">
        <div className="space-y-6 pb-12">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Link to="/admin/dashboard" className="hover:text-slate-800">Admin Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/admin/discussions" className="hover:text-slate-800">Discussions</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-semibold">Discussion Details</span>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#0A192F]">Discussion Topic Not Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                The requested discussion topic does not exist or has been deleted.
              </p>
            </div>
            <Link
              to="/admin/discussions"
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-amber-400" />
              <span>Back to Discussions</span>
            </Link>
          </div>
        </div>
      </AdminLayout>
    );
  }

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleAddAdminPost = (content: string) => {
    addPost(discussion.id, {
      authorId: 'admin-1',
      authorName: 'Dr. Arthur Pendelton',
      authorRole: 'admin',
      content
    });
  };

  const handleAddAdminReply = (postId: string, content: string) => {
    addReply(discussion.id, postId, {
      authorId: 'admin-1',
      authorName: 'Dr. Arthur Pendelton',
      authorRole: 'admin',
      content
    });
  };

  const handleDelete = () => {
    deleteDiscussion(discussion.id);
    navigate('/admin/discussions');
  };

  const isClosed = discussion.status === 'closed';

  return (
    <AdminLayout title="Discussion Topic Details" subtitle="Discussions">
      <div className="space-y-6 pb-16">
        {/* Breadcrumb Navigation */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Link to="/admin/dashboard" className="hover:text-slate-800 font-medium">Admin Dashboard</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to="/admin/discussions" className="hover:text-slate-800 font-medium">Discussions</Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-900 font-bold">Discussion Details</span>
          </div>

          {/* Back Button */}
          <button
            onClick={() => navigate('/admin/discussions')}
            className="inline-flex items-center space-x-2 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-amber-500" />
            <span>← Back to Discussions</span>
          </button>
        </div>

        {/* Top Action Controls Bar */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-[#0A192F]">Discussion Details</h1>
            <p className="text-xs text-slate-500 mt-0.5">Admin Management & Cohort Activity Monitor</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Share Link */}
            <button
              onClick={handleCopyLink}
              className="inline-flex items-center space-x-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-xl border border-slate-200 transition-colors"
            >
              {copiedLink ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">Link Copied!</span>
                </>
              ) : (
                <>
                  <Share2 className="w-3.5 h-3.5 text-slate-400" />
                  <span>Share</span>
                </>
              )}
            </button>

            {/* Pin Toggle */}
            <button
              onClick={() => togglePinDiscussion(discussion.id)}
              className={`inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-bold rounded-xl border transition-colors ${
                discussion.isPinned
                  ? 'bg-amber-100 text-amber-900 border-amber-300'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Pin className="w-3.5 h-3.5" />
              <span>{discussion.isPinned ? 'Pinned' : 'Pin Topic'}</span>
            </button>

            {/* Close / Reopen Toggle */}
            <button
              onClick={() => toggleCloseDiscussion(discussion.id)}
              className={`inline-flex items-center space-x-1.5 px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                isClosed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                  : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
              }`}
            >
              {isClosed ? (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Reopen Discussion</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Close Discussion</span>
                </>
              )}
            </button>

            {/* Delete Button */}
            <button
              onClick={() => setDeleteConfirm(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-xl text-xs font-bold transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Closed Banner Notice */}
        {isClosed && (
          <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 flex items-center space-x-3 shadow-md">
            <div className="p-2 bg-amber-500/20 text-amber-400 rounded-xl">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-amber-400">Discussion Closed</h4>
              <p className="text-xs text-slate-300 mt-0.5">
                This discussion is closed for new student activity. Students can read existing posts but cannot submit new comments.
              </p>
            </div>
          </div>
        )}

        {/* Main Topic Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          {/* Header Metadata */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div className="flex flex-wrap items-center gap-2">
              {discussion.isPinned && (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-amber-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-2xs">
                  <Pin className="w-3.5 h-3.5 fill-slate-950" />
                  <span>Pinned Topic</span>
                </span>
              )}
              <span className="px-3 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-xl uppercase tracking-wider">
                {discussion.category}
              </span>
              {isClosed ? (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-xl">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Closed</span>
                </span>
              ) : (
                <span className="inline-flex items-center space-x-1 px-3 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-xl border border-emerald-200">
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Active</span>
                </span>
              )}
            </div>

            <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-medium">
              <Calendar className="w-4 h-4 text-slate-400" />
              <span>Created {discussion.createdAt}</span>
            </div>
          </div>

          {/* Title */}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-[#0A192F] tracking-tight leading-snug">
              {discussion.title}
            </h2>
          </div>

          {/* Instructor Author Tag */}
          <div className="flex items-center space-x-3 p-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-10 h-10 rounded-full bg-[#0A192F] text-amber-400 flex items-center justify-center font-extrabold text-sm shadow-xs">
              {discussion.authorName.charAt(0)}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-[#0A192F]">{discussion.authorName}</span>
                <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded">
                  <ShieldCheck className="w-3 h-3" />
                  <span>Course Instructor</span>
                </span>
              </div>
              <div className="text-[11px] text-slate-500">Virtual Autopsy Global Solutions Lead</div>
            </div>
          </div>

          {/* Description & Context Section */}
          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Description & Context
            </h4>
            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
              {discussion.description}
            </div>
          </div>

          {/* Attachment Preview Section */}
          {discussion.attachedDocument && (
            <div className="space-y-2 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Attachment
              </h4>
              <div className="flex items-center justify-between p-4 bg-[#0A192F] text-white rounded-2xl border border-slate-800">
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="p-3 bg-white/10 rounded-xl border border-white/10 text-amber-400">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="min-w-0">
                    <span className="px-2 py-0.5 rounded text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {discussion.attachedDocument.fileType || discussion.attachedDocument.type || 'Document'}
                    </span>
                    <h3 className="text-sm font-bold text-white truncate mt-1">
                      {discussion.attachedDocument.title || discussion.attachedDocument.name}
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {discussion.attachedDocument.fileSize || discussion.attachedDocument.size}
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <a
                    href={discussion.attachedDocument.downloadUrl || '#'}
                    onClick={(e) => {
                      if (!discussion.attachedDocument?.downloadUrl) e.preventDefault();
                    }}
                    download
                    className="inline-flex items-center space-x-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl transition-all shadow-sm"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>View Attachment</span>
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Discussion Activity / Student Comments Section */}
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center space-x-2">
              <MessageSquare className="w-5 h-5 text-amber-500" />
              <h2 className="text-base font-extrabold text-[#0A192F]">
                Discussion Activity ({discussion.postsCount})
              </h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">Student & Instructor Responses</span>
          </div>

          {/* Feed List */}
          <div className="space-y-4">
            {discussion.posts.map((post) => (
              <DiscussionPostItem
                key={post.id}
                post={post}
                isClosed={isClosed}
                onAddReply={handleAddAdminReply}
              />
            ))}
          </div>

          {/* Admin Response Form */}
          {!isClosed && (
            <div className="pt-2">
              <CommentComposer onAddPost={handleAddAdminPost} isClosed={isClosed} />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-center">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-[#0A192F]">Delete Discussion Topic?</h3>
            <p className="text-xs text-slate-500">
              Are you sure you want to delete this discussion topic and remove all student comments?
            </p>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setDeleteConfirm(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
              >
                Delete Topic
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
