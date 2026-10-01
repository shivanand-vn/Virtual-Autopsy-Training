import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Download,
  Check,
  X,
  XCircle,
  AlertCircle,
  User,
  BookOpen
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { type AssignmentSubmission, type SubmissionStatus } from '../../types/course';

export const AdminAssignmentsPage: React.FC = () => {
  const { assignmentSubmissions, updateSubmissionStatus } = useCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [adminFeedbackInput, setAdminFeedbackInput] = useState('');
  const [feedbackError, setFeedbackError] = useState('');

  const totalCount = assignmentSubmissions.length;
  const pendingCount = assignmentSubmissions.filter((s) => s.status === 'PENDING').length;
  const approvedCount = assignmentSubmissions.filter((s) => s.status === 'APPROVED').length;
  const rejectedCount = assignmentSubmissions.filter((s) => s.status === 'REJECTED').length;

  const filteredSubmissions = assignmentSubmissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      s.studentName.toLowerCase().includes(q) ||
      s.studentEmail.toLowerCase().includes(q) ||
      s.courseName.toLowerCase().includes(q) ||
      s.moduleTitle.toLowerCase().includes(q) ||
      s.topicTitle.toLowerCase().includes(q);

    const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleOpenReview = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setAdminFeedbackInput(submission.adminFeedback || '');
    setFeedbackError('');
  };

  const handleApprove = () => {
    if (!selectedSubmission) return;
    updateSubmissionStatus(selectedSubmission.id, 'APPROVED', adminFeedbackInput);
    setSelectedSubmission(null);
  };

  const handleReject = () => {
    if (!selectedSubmission) return;
    if (!adminFeedbackInput.trim()) {
      setFeedbackError('Please provide feedback explaining why the assignment is rejected.');
      return;
    }
    updateSubmissionStatus(selectedSubmission.id, 'REJECTED', adminFeedbackInput);
    setSelectedSubmission(null);
  };

  return (
    <AdminLayout title="Assignment Submissions" subtitle="Review & grade student assignment submissions">
      <div className="space-y-6">
        {/* Top Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{totalCount}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <ClipboardList className="w-6 h-6" />
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
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Approved</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">{approvedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Rejected</p>
              <h3 className="text-2xl font-black text-rose-600 mt-1">{rejectedCount}</h3>
            </div>
            <div className="w-12 h-12 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl flex items-center justify-center">
              <XCircle className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by student, course, module, or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-medium"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {(['ALL', 'PENDING', 'APPROVED', 'REJECTED'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-all cursor-pointer ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st === 'ALL' ? 'All' : st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/4 py-3.5 px-4 font-bold text-left">STUDENT</th>
                  <th className="w-1/4 py-3.5 px-4 font-bold text-left">COURSE & MODULE</th>
                  <th className="w-1/4 py-3.5 px-4 font-bold text-left">TOPIC TITLE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">SUBMITTED DATE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-left">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 border border-slate-300 text-slate-600 flex items-center justify-center font-bold shrink-0">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-xs truncate">{item.studentName}</div>
                            <div className="text-[11px] text-slate-400 truncate">{item.studentEmail}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-left">
                        <div className="font-bold text-slate-800 text-xs truncate">{item.courseName}</div>
                        <div className="text-[11px] text-amber-700 font-medium truncate">{item.moduleTitle}</div>
                      </td>

                      <td className="py-4 px-4 text-left">
                        <div className="font-semibold text-slate-800 text-xs truncate" title={item.topicTitle}>
                          {item.topicTitle}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-600 font-mono text-[11px]">
                        {item.submittedAt}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            item.status === 'APPROVED'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : item.status === 'REJECTED'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-900 border border-amber-300'
                          }`}
                        >
                          {item.status === 'APPROVED' && <Check className="w-3 h-3 text-emerald-600" />}
                          {item.status === 'REJECTED' && <X className="w-3 h-3 text-rose-600" />}
                          {item.status === 'PENDING' && <Clock className="w-3 h-3 text-amber-600" />}
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleOpenReview(item)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center space-x-1 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Review</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No assignment submissions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Review Submission Detailed Modal */}
      {selectedSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                  Assignment Review
                </span>
                <h3 className="text-lg font-black text-[#0A192F] mt-1">{selectedSubmission.topicTitle}</h3>
                <p className="text-xs text-slate-500">
                  Submitted by <strong className="text-slate-800">{selectedSubmission.studentName}</strong> ({selectedSubmission.studentEmail})
                </p>
              </div>
              <button
                onClick={() => setSelectedSubmission(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              {/* Context Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80">
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">COURSE</span>
                  <p className="font-extrabold text-slate-800 truncate">{selectedSubmission.courseName}</p>
                </div>
                <div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase">MODULE</span>
                  <p className="font-extrabold text-amber-800 truncate">{selectedSubmission.moduleTitle}</p>
                </div>
              </div>

              {/* Assignment Instructions */}
              {selectedSubmission.assignmentInstructions && (
                <div className="p-4 bg-amber-50/60 border border-amber-200/80 rounded-2xl space-y-1">
                  <span className="font-extrabold text-amber-900 uppercase text-[10px] tracking-wider">
                    Assignment Prompt / Instructions
                  </span>
                  <p className="text-slate-800 leading-relaxed font-medium">
                    {selectedSubmission.assignmentInstructions}
                  </p>
                </div>
              )}

              {/* Student Response Text */}
              <div className="space-y-1.5">
                <span className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider">
                  Student Response Text:
                </span>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-serif leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {selectedSubmission.studentResponseText || 'No text response submitted.'}
                </div>
              </div>

              {/* Student Uploaded File */}
              {selectedSubmission.uploadedFileName && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs">
                      FILE
                    </div>
                    <div>
                      <p className="font-extrabold text-slate-900">{selectedSubmission.uploadedFileName}</p>
                      <p className="text-[10px] text-slate-500">Submitted Attachment</p>
                    </div>
                  </div>
                  <button
                    onClick={() => alert(`Downloading attachment: ${selectedSubmission.uploadedFileName}`)}
                    className="px-3.5 py-2 bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1 cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                </div>
              )}

              {/* Admin Feedback Input */}
              <div className="space-y-1.5 pt-2">
                <label className="font-extrabold text-slate-900 uppercase text-[10px] tracking-wider block">
                  Admin Feedback & Remarks:
                </label>
                <textarea
                  rows={3}
                  value={adminFeedbackInput}
                  onChange={(e) => {
                    setAdminFeedbackInput(e.target.value);
                    if (e.target.value.trim()) setFeedbackError('');
                  }}
                  placeholder="Enter evaluation remarks or rejection feedback for the student..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
                {feedbackError && (
                  <p className="text-rose-600 font-bold text-[11px] flex items-center space-x-1">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>{feedbackError}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs cursor-pointer"
              >
                Cancel
              </button>

              <div className="w-full sm:w-auto flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handleReject}
                  className="flex-1 sm:flex-none px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md inline-flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                  <span>Reject Assignment</span>
                </button>

                <button
                  type="button"
                  onClick={handleApprove}
                  className="flex-1 sm:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs transition-colors shadow-md inline-flex items-center justify-center space-x-1 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Approve Assignment</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
