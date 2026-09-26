import React from 'react';
import { Link } from 'react-router-dom';
import { Pin, MessageSquare, Lock, Calendar, FileText, UserCheck } from 'lucide-react';
import type { Discussion } from '../../types/discussions';
import { DocumentPreview } from './DocumentPreview';

interface DiscussionCardProps {
  discussion: Discussion;
  isAdmin?: boolean;
  onTogglePin?: (id: string) => void;
  onToggleClose?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export const DiscussionCard: React.FC<DiscussionCardProps> = ({
  discussion,
  isAdmin = false,
  onTogglePin,
  onToggleClose,
  onDelete
}) => {
  return (
    <div
      className={`bg-white rounded-2xl border transition-all duration-200 hover:shadow-lg p-5 sm:p-6 flex flex-col justify-between ${
        discussion.isPinned
          ? 'border-amber-300 ring-1 ring-amber-400/30 bg-gradient-to-br from-amber-50/30 via-white to-white'
          : 'border-slate-200/80 hover:border-slate-300'
      }`}
    >
      <div className="space-y-4">
        {/* Top Badges & Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-2">
            {discussion.isPinned && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-500 text-slate-950 font-extrabold text-[11px] rounded-lg shadow-xs">
                <Pin className="w-3 h-3 fill-slate-950" />
                <span>Pinned Topic</span>
              </span>
            )}
            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg uppercase tracking-wider">
              {discussion.category}
            </span>
            {discussion.status === 'closed' && (
              <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-200 text-slate-700 font-bold text-xs rounded-lg">
                <Lock className="w-3 h-3" />
                <span>Closed</span>
              </span>
            )}
          </div>

          <div className="flex items-center space-x-1 text-xs text-slate-400">
            <Calendar className="w-3.5 h-3.5" />
            <span>{discussion.createdAt}</span>
          </div>
        </div>

        {/* Title & Description */}
        <div>
          <Link
            to={isAdmin ? `/admin/discussions/${discussion.id}` : `/discussions/${discussion.id}`}
            className="group"
          >
            <h3 className="text-base sm:text-lg font-bold text-[#0A192F] group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
              {discussion.title}
            </h3>
          </Link>
          <p className="text-xs sm:text-sm text-slate-600 mt-2 line-clamp-2 leading-relaxed">
            {discussion.description}
          </p>
        </div>

        {/* Attached Document Preview if present */}
        {discussion.attachedDocument && (
          <div className="pt-1">
            <DocumentPreview document={discussion.attachedDocument} compact />
          </div>
        )}
      </div>

      {/* Footer Info & Action */}
      <div className="pt-4 mt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
        {/* Author details */}
        <div className="flex items-center space-x-2">
          <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center font-extrabold text-xs">
            {discussion.authorName.charAt(0)}
          </div>
          <div>
            <div className="text-xs font-bold text-[#0A192F] flex items-center space-x-1">
              <span>{discussion.authorName}</span>
              {discussion.authorRole === 'admin' && (
                <span className="px-1.5 py-0.2 bg-amber-100 text-amber-900 font-bold text-[10px] rounded">
                  Instructor
                </span>
              )}
            </div>
            <div className="text-[11px] text-slate-400">Course Leader</div>
          </div>
        </div>

        {/* Stats & Link */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-xs font-semibold text-slate-600">
            <MessageSquare className="w-4 h-4 text-amber-500" />
            <span>{discussion.postsCount} {discussion.postsCount === 1 ? 'Comment' : 'Comments'}</span>
          </div>

          <Link
            to={isAdmin ? `/admin/discussions/${discussion.id}` : `/discussions/${discussion.id}`}
            className="inline-flex items-center space-x-1 px-3.5 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
          >
            <span>View Topic</span>
          </Link>
        </div>
      </div>
    </div>
  );
};
