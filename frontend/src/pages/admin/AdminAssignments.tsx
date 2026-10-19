import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  FileText,
  Eye,
  Download,
  X,
  User,
  Loader2
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { type AssignmentSubmission } from '../../types/course';

export const AdminAssignmentsPage: React.FC = () => {
  const { assignmentSubmissions, refreshAssignmentSubmissions } = useCourse();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);

  // Fetch real submissions on mount
  React.useEffect(() => {
    refreshAssignmentSubmissions();
  }, [refreshAssignmentSubmissions]);

  const totalCount = assignmentSubmissions.length;

  const filteredSubmissions = assignmentSubmissions.filter((s) => {
    const q = searchQuery.toLowerCase();
    return (
      s.studentName.toLowerCase().includes(q) ||
      s.studentEmail.toLowerCase().includes(q) ||
      s.courseName.toLowerCase().includes(q) ||
      s.moduleTitle.toLowerCase().includes(q) ||
      s.topicTitle.toLowerCase().includes(q)
    );
  });

  const handleOpenView = (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
  };

  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadedSubmissionId, setDownloadedSubmissionId] = useState<string | null>(null);

  const handleDownloadFile = async () => {
    if (!selectedSubmission) return;
    const fileUrl = selectedSubmission.uploadedFileUrl;
    const rawName = selectedSubmission.uploadedFileName || 'Assignment_Submission.pdf';
    let fileName = rawName.replace(/^[a-f0-9-]+_\d+_/, '');
    if (!fileName.toLowerCase().endsWith('.pdf')) {
      fileName = `${fileName}.pdf`;
    }

    if (!fileUrl) {
      alert(`No download file available for ${fileName}`);
      return;
    }

    setIsDownloading(true);
    try {
      const response = await fetch(fileUrl, { mode: 'cors' });
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const pdfBlob = new Blob([blob], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setTimeout(() => window.URL.revokeObjectURL(blobUrl), 1000);
      setDownloadedSubmissionId(selectedSubmission.id);
      setTimeout(() => setDownloadedSubmissionId(null), 2500);
    } catch {
      const link = document.createElement('a');
      link.href = fileUrl;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setDownloadedSubmissionId(selectedSubmission.id);
      setTimeout(() => setDownloadedSubmissionId(null), 2500);
    } finally {
      setTimeout(() => setIsDownloading(false), 500);
    }
  };

  return (
    <AdminLayout title="Assignment Submissions" subtitle="Assignments">
      <div className="space-y-6">
        {/* Search Bar & Total Submissions Counter */}
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

          <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600 px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl shrink-0 self-start sm:self-auto">
            <ClipboardList className="w-4 h-4 text-amber-600" />
            <span>Total Submissions:</span>
            <span className="font-extrabold text-[#0A192F] bg-amber-100 text-amber-950 px-2 py-0.5 rounded-lg border border-amber-300">
              {totalCount}
            </span>
          </div>
        </div>

        {/* Submissions Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed min-w-[850px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-[240px] py-3.5 px-4 font-bold text-left">STUDENT</th>
                  <th className="w-[230px] py-3.5 px-4 font-bold text-left">COURSE & MODULE</th>
                  <th className="w-[200px] py-3.5 px-4 font-bold text-left">TOPIC TITLE</th>
                  <th className="w-[140px] py-3.5 px-4 font-bold text-center">SUBMITTED DATE</th>
                  <th className="w-[140px] py-3.5 px-4 font-bold text-center">ACTIONS</th>
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
                        <button
                          onClick={() => handleOpenView(item)}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs inline-flex items-center space-x-1.5 cursor-pointer active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Assignment</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs">
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
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-2xl w-full space-y-6 max-h-[90vh] overflow-y-auto custom-scrollbar">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center space-x-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full">
                    Assignment Submission
                  </span>
                </div>
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
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 font-sans leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto custom-scrollbar">
                  {selectedSubmission.studentResponseText || 'No text response submitted.'}
                </div>
              </div>

              {/* Student Uploaded File */}
              {selectedSubmission.uploadedFileName && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-xs shrink-0">
                      PDF
                    </div>
                    <div className="min-w-0">
                      <p className="font-extrabold text-slate-900 truncate">
                        {selectedSubmission.uploadedFileName.replace(/^[a-f0-9-]+_\d+_/, '')}
                      </p>
                      <p className="text-[10px] text-slate-500">Submitted Case Evidentiary Dossier</p>
                    </div>
                  </div>
                  <button
                    onClick={handleDownloadFile}
                    disabled={isDownloading}
                    className={`px-3.5 py-2 font-bold rounded-xl text-xs transition-all duration-300 inline-flex items-center space-x-1.5 cursor-pointer shrink-0 disabled:opacity-75 active:scale-95 ${
                      downloadedSubmissionId === selectedSubmission.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-950 hover:bg-slate-800 text-amber-400'
                    }`}
                  >
                    {isDownloading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                        <span>Downloading...</span>
                      </>
                    ) : downloadedSubmissionId === selectedSubmission.id ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5 text-white animate-in zoom-in-75 duration-200" />
                        <span>Downloaded ✓</span>
                      </>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Download</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedSubmission(null)}
                className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
