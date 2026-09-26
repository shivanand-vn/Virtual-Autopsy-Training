import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useDiscussions } from '../../context/DiscussionsContext';
import type { SharedDocument } from '../../types/discussions';
import {
  MessageSquare,
  Plus,
  Pin,
  Lock,
  Unlock,
  Trash2,
  FileText,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  X,
  AlertCircle,
  Paperclip,
  UploadCloud
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export const AdminDiscussions: React.FC = () => {
  const {
    discussions,
    createDiscussion,
    togglePinDiscussion,
    toggleCloseDiscussion,
    deleteDiscussion
  } = useDiscussions();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Simplified Add Discussion Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [validationError, setValidationError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Metrics
  const totalDiscussions = discussions.length;
  const pinnedCount = discussions.filter((d) => d.isPinned).length;
  const closedCount = discussions.filter((d) => d.status === 'closed').length;
  const totalComments = discussions.reduce((acc, d) => acc + d.postsCount, 0);

  const filtered = discussions.filter((d) => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.title.toLowerCase().includes(q) ||
      d.description.toLowerCase().includes(q) ||
      (d.attachedDocument && d.attachedDocument.title.toLowerCase().includes(q))
    );
  });

  const getFileSizeString = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getFileType = (filename: string): 'pdf' | 'dicom' | 'image' | 'doc' => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') return 'pdf';
    if (['dcm', 'dicom'].includes(ext)) return 'dicom';
    if (['jpg', 'jpeg', 'png', 'webp', 'gif'].includes(ext)) return 'image';
    return 'doc';
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setTitle('');
    setDescription('');
    setSelectedFile(null);
    setValidationError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handlePublishSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate Description & Context *
    if (!description.trim()) {
      setValidationError('Description & Context is required.');
      return;
    }

    setValidationError(null);

    // Prepare attached document if selected
    let attachedDocument: SharedDocument | undefined = undefined;
    if (selectedFile) {
      attachedDocument = {
        id: `doc-${Date.now()}`,
        title: selectedFile.name,
        name: selectedFile.name,
        fileType: getFileType(selectedFile.name),
        type: getFileType(selectedFile.name),
        fileSize: getFileSizeString(selectedFile.size),
        size: getFileSizeString(selectedFile.size),
        downloadUrl: '#'
      };
    }

    // Create discussion
    createDiscussion({
      title: title.trim() || 'Advanced Virtual Autopsy CT Findings',
      description: description.trim(),
      category: 'Course Materials',
      authorId: 'admin-1',
      authorName: 'Dr. Arthur Pendelton',
      authorRole: 'admin',
      attachedDocument,
      isPinned: false
    });

    // Success toast
    setToastMessage('Discussion published successfully.');
    setTimeout(() => setToastMessage(null), 4000);

    // Reset & Close
    handleCloseModal();
  };

  return (
    <AdminLayout title="Discussions & Learning Materials" subtitle="Discussions">
      <div className="space-y-6 pb-16">
        {/* Success Toast Banner */}
        {toastMessage && (
          <div className="bg-[#0A192F] text-white px-5 py-3.5 rounded-2xl shadow-xl border border-amber-500/40 flex items-center justify-between transition-all duration-300 animate-in slide-in-from-top">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">{toastMessage}</h4>
                <p className="text-[11px] text-slate-300">Published to both Admin and Student discussion feeds.</p>
              </div>
            </div>
            <button
              onClick={() => setToastMessage(null)}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0A192F]">Discussions & Learning Materials</h1>
            <p className="text-xs text-slate-500 mt-1">
              Share training documents, create course discussion topics, and moderate cohort interactions.
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center justify-center space-x-2 px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Discussion</span>
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Topics</div>
            <div className="text-2xl font-extrabold text-[#0A192F]">{totalDiscussions}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pinned Topics</div>
            <div className="text-2xl font-extrabold text-amber-600">{pinnedCount}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Comments</div>
            <div className="text-2xl font-extrabold text-blue-600">{totalComments}</div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs space-y-1">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Closed Topics</div>
            <div className="text-2xl font-extrabold text-slate-600">{closedCount}</div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by topic title, description, or attached document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500/30"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none"
            >
              <option value="all">All Categories</option>
              <option value="Course Materials">Course Materials</option>
              <option value="Case Studies">Case Studies</option>
              <option value="Announcements">Announcements</option>
              <option value="General Discussion">General Discussion</option>
            </select>
          </div>
        </div>

        {/* Discussions Management Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">Topic Details</th>
                  <th className="py-4 px-4">Category</th>
                  <th className="py-4 px-4">Attachment</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4 text-center">Comments</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                {filtered.length > 0 ? (
                  filtered.map((topic) => (
                    <tr key={topic.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Topic Title & Description */}
                      <td className="py-4 px-6 max-w-xs">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            {topic.isPinned && (
                              <span className="p-1 bg-amber-100 text-amber-900 rounded-md">
                                <Pin className="w-3 h-3 fill-amber-900" />
                              </span>
                            )}
                            <Link
                              to={`/admin/discussions/${topic.id}`}
                              className="font-bold text-[#0A192F] hover:text-amber-600 transition-colors line-clamp-1"
                            >
                              {topic.title}
                            </Link>
                          </div>
                          <p className="text-xs text-slate-500 line-clamp-1">{topic.description}</p>
                          <div className="text-[11px] text-slate-400">Created: {topic.createdAt}</div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 bg-slate-100 text-slate-700 font-bold text-xs rounded-lg">
                          {topic.category}
                        </span>
                      </td>

                      {/* Attached Document */}
                      <td className="py-4 px-4">
                        {topic.attachedDocument ? (
                          <div className="flex items-center space-x-2 max-w-[200px]">
                            <FileText className="w-4 h-4 text-amber-500 flex-shrink-0" />
                            <span className="font-semibold text-xs text-slate-800 truncate">
                              {topic.attachedDocument.title || topic.attachedDocument.name}
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">None</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4 whitespace-nowrap">
                        {topic.status === 'closed' ? (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-slate-100 text-slate-600 font-bold text-xs rounded-lg border border-slate-200">
                            <Lock className="w-3 h-3" />
                            <span>Closed</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Active</span>
                          </span>
                        )}
                      </td>

                      {/* Comments Count */}
                      <td className="py-4 px-4 text-center font-bold text-slate-800">
                        <div className="inline-flex items-center space-x-1 bg-slate-100 px-2.5 py-1 rounded-xl text-xs">
                          <MessageSquare className="w-3.5 h-3.5 text-amber-500" />
                          <span>{topic.postsCount}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right whitespace-nowrap space-x-1">
                        <Link
                          to={`/admin/discussions/${topic.id}`}
                          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#0A192F] hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer"
                          title="Join Discussion"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-400" />
                          <span>Join Discussion</span>
                        </Link>

                        <button
                          onClick={() => togglePinDiscussion(topic.id)}
                          className={`p-2 rounded-lg inline-block transition-colors ${
                            topic.isPinned
                              ? 'text-amber-600 bg-amber-50 hover:bg-amber-100'
                              : 'text-slate-400 hover:text-amber-600 hover:bg-amber-50'
                          }`}
                          title={topic.isPinned ? 'Unpin Topic' : 'Pin Topic'}
                        >
                          <Pin className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => toggleCloseDiscussion(topic.id)}
                          className={`p-2 rounded-lg inline-block transition-colors ${
                            topic.status === 'closed'
                              ? 'text-slate-700 bg-slate-100 hover:bg-slate-200'
                              : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
                          }`}
                          title={topic.status === 'closed' ? 'Reopen Discussion' : 'Lock Discussion'}
                        >
                          {topic.status === 'closed' ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(topic.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg inline-block transition-colors"
                          title="Delete Discussion"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500 text-xs font-semibold">
                      No discussions available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Simplified Add Discussion Modal */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-lg w-full space-y-5 max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#0A192F] text-amber-400 rounded-2xl flex items-center justify-center shadow-xs">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-[#0A192F]">Add Discussion</h3>
                    <p className="text-xs text-slate-500">Create a new discussion topic for students</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-xl transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handlePublishSubmit} className="space-y-4">
                {/* Field 1: Title */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter discussion title"
                    className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm font-medium text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Example: Advanced Virtual Autopsy CT Findings
                  </p>
                </div>

                {/* Field 2: Description & Context * */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Description & Context <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => {
                      setDescription(e.target.value);
                      if (validationError) setValidationError(null);
                    }}
                    rows={5}
                    placeholder="Provide the context or details for this discussion..."
                    className={`w-full p-3.5 bg-slate-50 border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-all leading-relaxed ${
                      validationError
                        ? 'border-rose-300 focus:ring-rose-500/30 focus:border-rose-500 bg-rose-50/20'
                        : 'border-slate-200 focus:ring-amber-500/30 focus:border-amber-500'
                    }`}
                  />
                  {validationError && (
                    <p className="text-xs font-bold text-rose-600 mt-1.5 flex items-center space-x-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{validationError}</span>
                    </p>
                  )}
                </div>

                {/* Field 3: Attachment */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Attachment
                  </label>

                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.dcm,image/*"
                    className="hidden"
                  />

                  {selectedFile ? (
                    <div className="flex items-center justify-between p-3.5 bg-amber-50/60 border border-amber-200/80 rounded-2xl">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 bg-white rounded-xl border border-amber-200 text-amber-600 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#0A192F] truncate">{selectedFile.name}</h4>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {getFileSizeString(selectedFile.size)} • Ready to attach
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition-colors flex-shrink-0"
                        title="Remove file"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed border-slate-200 hover:border-amber-400 bg-slate-50/60 hover:bg-amber-50/20 p-5 rounded-2xl text-center cursor-pointer transition-all group"
                    >
                      <div className="w-10 h-10 bg-white group-hover:bg-amber-100/60 rounded-full flex items-center justify-center mx-auto mb-2 text-slate-400 group-hover:text-amber-600 border border-slate-100 shadow-2xs transition-colors">
                        <Paperclip className="w-5 h-5" />
                      </div>
                      <h4 className="text-xs font-bold text-[#0A192F] group-hover:text-amber-600 transition-colors">
                        Attach a document
                      </h4>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        PDF, DOC, DOCX, PPT, PPTX or supported file
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions: Publish & Close */}
                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow-md shadow-amber-500/20 transition-all cursor-pointer"
                  >
                    Publish
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 max-w-sm w-full space-y-4 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0A192F]">Delete Discussion Topic?</h3>
              <p className="text-xs text-slate-500">
                Are you sure you want to delete this discussion topic and all associated comments?
              </p>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    deleteDiscussion(deleteConfirmId);
                    setDeleteConfirmId(null);
                  }}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md"
                >
                  Delete Topic
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
