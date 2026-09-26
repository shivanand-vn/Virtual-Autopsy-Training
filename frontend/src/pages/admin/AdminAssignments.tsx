import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  CheckCircle2,
  Clock,
  FileText,
  Eye,
  Award,
  Download,
  Check,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface AssignmentRecord {
  id: string;
  candidateName: string;
  avatar: string;
  caseTitle: string;
  submittedDate: string;
  status: 'graded' | 'pending';
  score?: string;
  dicomAttachment: string;
}

export const MOCK_ASSIGNMENTS: AssignmentRecord[] = [];

export const AdminAssignmentsPage: React.FC = () => {
  const [assignments, setAssignments] = useState<AssignmentRecord[]>(MOCK_ASSIGNMENTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [gradingAssignment, setGradingAssignment] = useState<AssignmentRecord | null>(null);
  const [inputScore, setInputScore] = useState('90');

  const filteredAssignments = assignments.filter((a) => {
    const matchesSearch =
      a.candidateName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.caseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const submitGrade = () => {
    if (!gradingAssignment) return;
    setAssignments((prev) =>
      prev.map((a) =>
        a.id === gradingAssignment.id
          ? { ...a, status: 'graded', score: `${inputScore} / 100` }
          : a
      )
    );
    setGradingAssignment(null);
  };

  return (
    <AdminLayout title="Assignments & Grading" subtitle="Assignments">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Submissions</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{assignments.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <ClipboardList className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Review</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {assignments.filter((a) => a.status === 'pending').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Graded Practical</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">
                {assignments.filter((a) => a.status === 'graded').length}
              </h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Average Score</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">96%</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Search & Filter */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search assignments by fellow or case title..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <div className="flex items-center space-x-2">
            {(['all', 'pending', 'graded'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold capitalize transition-colors ${
                  statusFilter === st
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">FELLOW</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">CASE TITLE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">SUBMITTED DATE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">SCORE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">STATUS</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAssignments.length > 0 ? (
                  filteredAssignments.map((item) => (
                    <tr key={item.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center space-x-3">
                          <img
                            src={item.avatar}
                            alt={item.candidateName}
                            className="w-10 h-10 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0"
                          />
                          <div className="min-w-0 text-left">
                            <div className="font-extrabold text-slate-900 text-sm truncate">{item.candidateName}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <div className="font-bold text-slate-800 truncate" title={item.caseTitle}>
                          {item.caseTitle}
                        </div>
                      </td>

                      <td className="py-4 px-4 text-center text-slate-600 font-mono text-[11px]">
                        {item.submittedDate}
                      </td>

                      <td className="py-4 px-4 text-center font-mono font-bold text-amber-700">
                        {item.score || '—'}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex items-center space-x-1 text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                            item.status === 'graded'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => {
                            setGradingAssignment(item);
                            setInputScore(item.score ? item.score.split('/')[0].trim() : '90');
                          }}
                          className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-xs"
                        >
                          {item.status === 'graded' ? 'Re-grade' : 'Grade Case'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No assignments available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grading Modal */}
      {gradingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0A192F]">Evaluate Practical DICOM Case</h3>
                <p className="text-xs text-slate-500">{gradingAssignment.candidateName}</p>
              </div>
              <button
                onClick={() => setGradingAssignment(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-1">
                <span className="font-bold text-slate-400 uppercase">CASE TITLE</span>
                <p className="font-extrabold text-slate-800">{gradingAssignment.caseTitle}</p>
              </div>

              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-xl bg-amber-500 text-slate-950 font-bold flex items-center justify-center text-[10px]">
                    DCM
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{gradingAssignment.dicomAttachment}</p>
                    <p className="text-[10px] text-slate-500">Volumetric Slice Annotation</p>
                  </div>
                </div>
                <button className="px-3 py-1.5 bg-slate-950 text-amber-400 font-bold rounded-xl text-xs hover:bg-slate-800 transition-colors inline-flex items-center space-x-1">
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>

              <div className="space-y-2">
                <label className="font-bold text-slate-800">Assign Score (Out of 100):</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={inputScore}
                  onChange={(e) => setInputScore(e.target.value)}
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-2xl font-mono text-base font-bold text-[#0A192F] focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setGradingAssignment(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
              >
                Cancel
              </button>
              <button
                onClick={submitGrade}
                className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs shadow-md"
              >
                Save Grade & Notify Fellow
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
