import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, ArrowRight, Pin, FileText, ChevronRight } from 'lucide-react';
import { useDiscussions } from '../../context/DiscussionsContext';

export const RecentDiscussionsWidget: React.FC = () => {
  const { discussions } = useDiscussions();

  // Pick top 3 discussions (pinned first, then most recent)
  const recentTopics = [...discussions]
    .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
    .slice(0, 3);

  return (
    <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-[#0A192F]">Course Discussions</h2>
            <p className="text-xs text-slate-500">Collaborate & review shared clinical materials</p>
          </div>
        </div>

        <Link
          to="/discussions"
          className="inline-flex items-center space-x-1 text-xs font-bold text-amber-600 hover:text-amber-700 transition-colors"
        >
          <span>View All</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      <div className="space-y-3">
        {recentTopics.map((topic) => (
          <Link
            key={topic.id}
            to={`/discussions/${topic.id}`}
            className="block p-4 rounded-2xl bg-slate-50/70 hover:bg-slate-100/80 border border-slate-200/70 transition-all group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center space-x-2">
                  {topic.isPinned && (
                    <span className="inline-flex items-center space-x-0.5 px-2 py-0.5 bg-amber-500 text-slate-950 font-extrabold text-[10px] rounded-md">
                      <Pin className="w-2.5 h-2.5" />
                      <span>Pinned</span>
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    {topic.category}
                  </span>
                </div>
                <h3 className="text-xs sm:text-sm font-bold text-[#0A192F] group-hover:text-amber-600 transition-colors truncate">
                  {topic.title}
                </h3>
              </div>

              <div className="flex items-center space-x-1 text-xs text-slate-500 font-semibold flex-shrink-0 bg-white px-2.5 py-1 rounded-xl border border-slate-200/60 shadow-2xs">
                <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                <span>{topic.postsCount}</span>
              </div>
            </div>

            {topic.attachedDocument && (
              <div className="mt-2.5 flex items-center space-x-1.5 text-[11px] text-slate-500 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/50 w-fit">
                <FileText className="w-3 h-3 text-red-500" />
                <span className="font-semibold text-slate-700 truncate max-w-[220px]">
                  {topic.attachedDocument.title}
                </span>
              </div>
            )}
          </Link>
        ))}
      </div>

      <Link
        to="/discussions"
        className="w-full py-3 bg-[#0A192F] hover:bg-slate-800 text-white rounded-2xl text-xs font-bold transition-all flex items-center justify-center space-x-2 shadow-xs group"
      >
        <span>Open Discussion Forum</span>
        <ArrowRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
      </Link>
    </div>
  );
};
