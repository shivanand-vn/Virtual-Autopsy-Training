import React, { useState } from 'react';
import {
  GraduationCap,
  FileQuestion,
  Award,
  ShieldCheck,
  Plus,
  Eye,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface ExamVignette {
  id: string;
  code: string;
  topic: string;
  difficulty: 'Board Level' | 'Advanced' | 'Core';
  questionPreview: string;
  correctAnswer: string;
}

export const MOCK_EXAM_VIGNETTES: ExamVignette[] = [];

export const AdminExamsPage: React.FC = () => {
  const [vignettes] = useState<ExamVignette[]>(MOCK_EXAM_VIGNETTES);
  const [selectedVignette, setSelectedVignette] = useState<ExamVignette | null>(null);

  return (
    <AdminLayout title="Fellowship Exam & Question Bank" subtitle="Exams">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Exam Questions</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{vignettes.length} Vignettes</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <FileQuestion className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pass Benchmark</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">75% Passing Score</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Board Attempts</p>
              <h3 className="text-2xl font-black text-slate-800 mt-1">0 Fellows</h3>
            </div>
            <div className="w-12 h-12 bg-slate-100 border border-slate-300 text-slate-700 rounded-2xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Proctor Security</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">Shielded</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Question Bank Table */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <h3 className="font-extrabold text-base text-[#0A192F]">Fellowship Vignette Bank</h3>
            <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2">
              <Plus className="w-4 h-4" />
              <span>Add Board Vignette</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs table-fixed">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 uppercase text-[10px] tracking-wider">
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">CODE</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">TOPIC</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">DIFFICULTY</th>
                  <th className="w-2/6 py-3.5 px-4 font-bold text-center">CLINICAL VIGNETTE PREVIEW</th>
                  <th className="w-1/6 py-3.5 px-4 font-bold text-center">ACTIONS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {vignettes.length > 0 ? (
                  vignettes.map((v) => (
                    <tr key={v.id} className="hover:bg-amber-50/20 transition-colors">
                      <td className="py-4 px-4 text-center font-mono font-bold text-slate-800">{v.code}</td>
                      <td className="py-4 px-4 text-center font-bold text-slate-800">{v.topic}</td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-1 bg-amber-100 text-amber-900 font-bold rounded-full text-[10px]">
                          {v.difficulty}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-slate-600 truncate">{v.questionPreview}</td>
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => setSelectedVignette(v)}
                          className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1"
                        >
                          <Eye className="w-3.5 h-3.5 text-amber-600" />
                          <span>Inspect Vignette</span>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No exams available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Vignette Modal */}
      {selectedVignette && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-lg w-full space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  {selectedVignette.code}
                </span>
                <h3 className="text-lg font-black text-[#0A192F] mt-2">{selectedVignette.topic}</h3>
              </div>
              <button
                onClick={() => setSelectedVignette(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="font-bold text-slate-400 uppercase text-[10px]">CLINICAL CASE SCENARIO</p>
                <p className="text-slate-800 mt-1 leading-relaxed font-medium">{selectedVignette.questionPreview}</p>
              </div>

              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                <p className="font-bold text-emerald-900 uppercase text-[10px]">CORRECT PATHOLOGICAL CRITERIA</p>
                <p className="text-slate-800 mt-1 font-bold">{selectedVignette.correctAnswer}</p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setSelectedVignette(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs"
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
