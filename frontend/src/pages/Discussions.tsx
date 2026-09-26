import React, { useState } from 'react';
import { useDiscussions } from '../context/DiscussionsContext';
import { DiscussionCard } from '../components/discussions/DiscussionCard';
import { DiscussionFilters } from '../components/discussions/DiscussionFilters';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { MessageSquare, Sparkles, Plus, BookOpen, AlertCircle } from 'lucide-react';

export const Discussions: React.FC = () => {
  const { discussions } = useDiscussions();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'recent' | 'active' | 'posts'>('recent');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter & Sort Logic
  const filteredDiscussions = discussions
    .filter((d) => {
      // Category filter
      if (selectedCategory !== 'all' && d.category !== selectedCategory) {
        return false;
      }
      // Status filter
      if (statusFilter === 'active' && d.status !== 'active') return false;
      if (statusFilter === 'pinned' && !d.isPinned) return false;
      if (statusFilter === 'closed' && d.status !== 'closed') return false;

      // Search query
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        d.title.toLowerCase().includes(q) ||
        d.description.toLowerCase().includes(q) ||
        d.authorName.toLowerCase().includes(q) ||
        (d.attachedDocument && d.attachedDocument.title.toLowerCase().includes(q))
      );
    })
    .sort((a, b) => {
      // Always keep pinned items on top unless sorting explicitly requested
      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }
      if (sortBy === 'posts') {
        return b.postsCount - a.postsCount;
      }
      // Default: recent
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  return (
    <DashboardLayout headerSubtitle="DISCUSSIONS">
      <div className="space-y-6 pb-12">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-[#0A192F] via-[#112240] to-[#0A192F] text-white p-6 sm:p-8 rounded-3xl shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl space-y-3">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-400 rounded-full text-xs font-bold border border-amber-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Interactive Learning Forum</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Course Discussions & Case Studies
            </h1>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Collaborate with course instructors and fellow students. Discuss shared PMCT learning materials, Virtual Autopsy protocols, and complex forensic cases.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-slate-400">
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span>{discussions.length} Active Topics</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <MessageSquare className="w-4 h-4 text-amber-400" />
                <span>Cohort Community</span>
              </span>
            </div>
          </div>
        </div>

        {/* Filters Bar */}
        <DiscussionFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
        />

        {/* Discussion List Grid */}
        {filteredDiscussions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {filteredDiscussions.map((discussion) => (
              <DiscussionCard key={discussion.id} discussion={discussion} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4">
            <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0A192F]">
                {discussions.length === 0 ? 'No discussions available.' : 'No Discussion Topics Found'}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                {discussions.length === 0
                  ? 'No discussion topics have been created yet.'
                  : 'No discussions matched your filter criteria or search query. Try resetting your search terms.'}
              </p>
            </div>
            {discussions.length > 0 && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setStatusFilter('all');
                }}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
