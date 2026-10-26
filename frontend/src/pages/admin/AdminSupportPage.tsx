import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Search,
  CheckCircle2,
  Clock,
  Eye,
  X,
  Trash2,
  Maximize2,
  AlertTriangle
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import {
  getSupportIssues,
  updateSupportIssueStatus,
  deleteSupportIssue
} from '../../lib/supportStorage';
import { SupportIssueReport } from '../../types/support';

export const AdminSupportPage: React.FC = () => {
  const [issues, setIssues] = useState<SupportIssueReport[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'resolved'>('all');
  const [selectedIssue, setSelectedIssue] = useState<SupportIssueReport | null>(null);

  // Confirmation Modals State
  const [resolveConfirmIssue, setResolveConfirmIssue] = useState<SupportIssueReport | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const loadIssues = () => {
    setIssues(getSupportIssues());
  };

  useEffect(() => {
    loadIssues();
    window.addEventListener('vat_support_updated', loadIssues);
    return () => window.removeEventListener('vat_support_updated', loadIssues);
  }, []);

  const handleOpenResolveConfirm = (issue: SupportIssueReport, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setResolveConfirmIssue(issue);
  };

  const handleConfirmResolve = () => {
    if (!resolveConfirmIssue) return;
    updateSupportIssueStatus(resolveConfirmIssue.id, 'resolved');
    if (selectedIssue && selectedIssue.id === resolveConfirmIssue.id) {
      setSelectedIssue({ ...selectedIssue, status: 'resolved' });
    }
    setResolveConfirmIssue(null);
  };

  const handleOpenDeleteConfirm = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (!deleteConfirmId) return;
    deleteSupportIssue(deleteConfirmId);
    if (selectedIssue && selectedIssue.id === deleteConfirmId) {
      setSelectedIssue(null);
    }
    setDeleteConfirmId(null);
  };

  const filteredIssues = issues.filter((issue) => {
    const matchesSearch =
      issue.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.studentEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
      issue.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' || issue.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const totalCount = issues.length;
  const pendingCount = issues.filter((i) => i.status === 'pending').length;
  const resolvedCount = issues.filter((i) => i.status === 'resolved').length;

  return (
    <AdminLayout title="Student Issue Reports" subtitle="Support">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Reports</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-200 text-slate-700 rounded-2xl flex items-center justify-center font-bold">
              <HelpCircle className="w-6 h-6 text-amber-600" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">{pendingCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Solved</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{resolvedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student name, email, or issue keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* Status Tabs */}
          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-2xl self-stretch sm:self-auto">
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              All ({totalCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('pending')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'pending'
                  ? 'bg-amber-500 text-slate-950 font-black shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Pending ({pendingCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('resolved')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === 'resolved'
                  ? 'bg-emerald-600 text-white font-black shadow-2xs'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              Solved ({resolvedCount})
            </button>
          </div>
        </div>

        {/* Minimal Clean Issues Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-6 font-bold w-1/4">Student</th>
                  <th className="py-3.5 px-4 font-bold w-1/5 text-center">Screenshot</th>
                  <th className="py-3.5 px-6 font-bold w-2/5">Issue & Time</th>
                  <th className="py-3.5 px-6 font-bold text-center w-1/6">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredIssues.length > 0 ? (
                  filteredIssues.map((issue) => (
                    <tr
                      key={issue.id}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      {/* Column 1: Student Details */}
                      <td className="py-4 px-6 align-middle">
                        <div className="flex items-center space-x-3">
                          {issue.studentAvatar ? (
                            <img
                              src={issue.studentAvatar}
                              alt={issue.studentName}
                              className="w-10 h-10 rounded-full object-cover border border-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-slate-100 border border-slate-200 text-slate-700 font-extrabold flex items-center justify-center shrink-0">
                              {issue.studentName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-extrabold text-slate-900 truncate">
                              {issue.studentName}
                            </p>
                            <p className="text-[11px] text-slate-400 font-mono truncate">
                              {issue.studentEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Column 2: Screenshot Thumbnail */}
                      <td className="py-4 px-4 text-center align-middle">
                        <div className="inline-block relative">
                          <button
                            type="button"
                            onClick={() => setSelectedIssue(issue)}
                            title="Click to view full screenshot"
                            className="relative w-24 h-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-900/5 shadow-2xs group/thumb transition-all hover:scale-105 hover:border-amber-400 cursor-pointer"
                          >
                            <img
                              src={issue.screenshotUrl}
                              alt="Issue screenshot"
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/thumb:opacity-100 transition-opacity flex items-center justify-center">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </button>
                        </div>
                      </td>

                      {/* Column 3: Description & Timestamp (Static text, not clickable) */}
                      <td className="py-4 px-6 align-middle">
                        <div className="space-y-1">
                          <p className="text-xs font-semibold text-slate-800 line-clamp-2 leading-relaxed">
                            {issue.description}
                          </p>
                          <div className="flex items-center space-x-2 text-[10px] text-slate-400">
                            <Clock className="w-3 h-3 text-slate-400" />
                            <span>
                              {new Date(issue.createdAt).toLocaleDateString()} at{' '}
                              {new Date(issue.createdAt).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: Dynamic Status Display (Read-only badge, non-clickable) */}
                      <td className="py-4 px-6 text-center align-middle">
                        <span
                          className={`inline-flex items-center space-x-1.5 text-xs font-bold px-3 py-1 rounded-full border cursor-default select-none ${
                            issue.status === 'resolved'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              issue.status === 'resolved' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          />
                          <span>{issue.status === 'resolved' ? 'Solved' : 'Pending'}</span>
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-slate-400 text-xs font-semibold">
                      No issue reports found matching your criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Screenshot & Issue Details Lightbox Modal */}
      {selectedIssue && (
        <div
          onClick={() => setSelectedIssue(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full p-6 sm:p-8 space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] flex flex-col"
          >
            {/* Modal Header: Student Details & Status Actions */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 gap-4 shrink-0">
              <div className="flex items-center space-x-3.5">
                {selectedIssue.studentAvatar ? (
                  <img
                    src={selectedIssue.studentAvatar}
                    alt={selectedIssue.studentName}
                    className="w-12 h-12 rounded-full object-cover border border-amber-400 shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-amber-500 text-slate-950 font-black text-base flex items-center justify-center shrink-0">
                    {selectedIssue.studentName.charAt(0)}
                  </div>
                )}
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-black text-[#0A192F]">
                      {selectedIssue.studentName}
                    </h3>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider border cursor-default select-none ${
                        selectedIssue.status === 'resolved'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-amber-50 text-amber-800 border-amber-200'
                      }`}
                    >
                      {selectedIssue.status === 'resolved' ? '✓ Solved' : '● Pending'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">
                    {selectedIssue.studentEmail}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Reported on {new Date(selectedIssue.createdAt).toLocaleDateString()} at{' '}
                    {new Date(selectedIssue.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                {selectedIssue.status === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => handleOpenResolveConfirm(selectedIssue)}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center space-x-1.5 border shadow-2xs bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Mark as Resolved</span>
                  </button>
                ) : (
                  <span className="inline-flex items-center space-x-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 border border-emerald-300 px-3.5 py-2 rounded-xl">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Issue Solved</span>
                  </span>
                )}

                <button
                  type="button"
                  disabled={selectedIssue.status !== 'resolved'}
                  onClick={() => handleOpenDeleteConfirm(selectedIssue.id)}
                  title={
                    selectedIssue.status === 'resolved'
                      ? 'Delete issue report'
                      : 'Please mark issue as Solved before deleting'
                  }
                  className={`p-2 rounded-xl transition-all border ${
                    selectedIssue.status === 'resolved'
                      ? 'text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 cursor-pointer shadow-2xs'
                      : 'text-slate-300 bg-slate-50 border-slate-200 cursor-not-allowed opacity-40'
                  }`}
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedIssue(null)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body: Issue Description + Full Screenshot */}
            <div className="space-y-4 overflow-y-auto pr-1 flex-1 custom-scrollbar">
              {/* Description callout */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-xs space-y-1">
                <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  Student's Note
                </span>
                <p className="text-slate-800 font-medium leading-relaxed">
                  {selectedIssue.description}
                </p>
              </div>

              {/* High-res Screenshot Container */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                    Attached Screenshot
                  </span>
                  {selectedIssue.screenshotName && (
                    <span className="text-[11px] font-mono text-slate-400">
                      {selectedIssue.screenshotName}
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-slate-950/5 p-2 flex items-center justify-center">
                  <img
                    src={selectedIssue.screenshotUrl}
                    alt="Full screenshot"
                    className="max-h-[50vh] w-auto object-contain rounded-xl shadow-xs"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 1: Mark as Solved */}
      {resolveConfirmIssue && (
        <div
          onClick={() => setResolveConfirmIssue(null)}
          style={{ zIndex: 100 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-2xl flex items-center justify-center mx-auto border border-emerald-300 shadow-2xs">
              <CheckCircle2 className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-black text-slate-900 leading-snug">
                Are you sure that issue is Solved?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This will update the status to <strong className="text-emerald-700">Solved</strong> for {resolveConfirmIssue.studentName}.
              </p>
            </div>

            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setResolveConfirmIssue(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmResolve}
                className="w-1/2 py-2.5 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Yes, Solved
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Modal 2: Delete Report */}
      {deleteConfirmId && (
        <div
          onClick={() => setDeleteConfirmId(null)}
          style={{ zIndex: 100 }}
          className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-7 max-w-sm w-full space-y-4 text-center animate-in zoom-in-95 duration-150"
          >
            <div className="w-14 h-14 bg-rose-100 text-rose-700 rounded-2xl flex items-center justify-center mx-auto border border-rose-300 shadow-2xs">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h4 className="text-base font-black text-slate-900 leading-snug">
                Are you sure you want to delete this issue report?
              </h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                This report and attached screenshot will be permanently deleted.
              </p>
            </div>

            <div className="flex items-center space-x-2.5 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmId(null)}
                className="w-1/2 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-extrabold rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
