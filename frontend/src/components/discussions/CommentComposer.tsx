import React, { useState } from 'react';
import { Send, MessageSquare, AlertCircle } from 'lucide-react';

interface CommentComposerProps {
  onAddPost: (content: string) => void;
  isClosed?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  onAddPost,
  isClosed = false
}) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isClosed) return;

    setIsSubmitting(true);
    setTimeout(() => {
      onAddPost(content.trim());
      setContent('');
      setIsSubmitting(false);
    }, 400);
  };

  if (isClosed) {
    return (
      <div className="bg-slate-100 border border-slate-200/80 rounded-2xl p-5 text-center flex items-center justify-center space-x-2 text-slate-500 text-xs sm:text-sm font-semibold">
        <AlertCircle className="w-4 h-4 text-slate-400" />
        <span>This discussion topic is locked by course administrators. New comments are disabled.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-sm space-y-4">
      <div className="flex items-center space-x-2">
        <div className="p-2 bg-amber-100 rounded-xl text-amber-900">
          <MessageSquare className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-[#0A192F]">Join the Discussion</h3>
          <p className="text-[11px] text-slate-500">Share your analysis, questions, or clinical observations with the course cohort.</p>
        </div>
      </div>

      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        rows={4}
        placeholder="Type your comment or response here..."
        className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all leading-relaxed"
        required
      />

      <div className="flex items-center justify-between pt-1">
        <span className="text-[11px] text-slate-400">
          Be respectful & adhere to Virtual Autopsy training guidelines.
        </span>
        <button
          type="submit"
          disabled={isSubmitting || !content.trim()}
          className="inline-flex items-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <Send className="w-4 h-4" />
          <span>{isSubmitting ? 'Posting Comment...' : 'Post Comment'}</span>
        </button>
      </div>
    </form>
  );
};
