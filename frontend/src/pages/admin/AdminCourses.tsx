import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Award,
  FileText,
  Clock,
  Layers,
  Edit3,
  Trash2,
  Eye,
  CheckCircle2,
  X
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';

export interface CourseModule {
  id: string;
  code: string;
  title: string;
  cmeCredits: number;
  casesCount: number;
  enrolledStudents: number;
  status: 'active' | 'draft' | 'archived';
  description: string;
}

export const MOCK_COURSES: CourseModule[] = [
  {
    id: 'crs-1',
    code: 'MOD-01',
    title: 'Post-Mortem Computed Tomography (PMCT) Fundamentals',
    cmeCredits: 12,
    casesCount: 15,
    enrolledStudents: 342,
    status: 'active',
    description: 'Basic multi-slice CT scanning protocols, radiation safety, post-mortem decomposition artifacts, and baseline organ attenuation profiling.',
  },
  {
    id: 'crs-2',
    code: 'MOD-02',
    title: 'Cardiovascular & PMCTA Angiography Protocols',
    cmeCredits: 15,
    casesCount: 12,
    enrolledStudents: 298,
    status: 'active',
    description: 'Targeted femoral arterial cannulation, lipophilic contrast agent infusion, coronary lumen stenosis identification, and myocardial infarction mapping.',
  },
  {
    id: 'crs-3',
    code: 'MOD-03',
    title: 'Traumatology & Forensic Wound Morphology',
    cmeCredits: 18,
    casesCount: 20,
    enrolledStudents: 215,
    status: 'active',
    description: 'High-velocity ballistic trauma reconstruction, sharp force trauma kerf analysis, cranial fracture line dynamics, and polytrauma scoring.',
  },
  {
    id: 'crs-4',
    code: 'MOD-04',
    title: 'Virtopsy 3D Surface Scanning & Photogrammetry',
    cmeCredits: 10,
    casesCount: 8,
    enrolledStudents: 180,
    status: 'draft',
    description: 'Merging 3D optical surface scans with volumetric CT data for medico-legal court presentations and wound pattern matching.',
  },
];

export const AdminCoursesPage: React.FC = () => {
  const [courses, setCourses] = useState<CourseModule[]>(MOCK_COURSES);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<CourseModule | null>(null);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout title="Course & Curriculum Management" subtitle="Courses">
      <div className="space-y-6">
        {/* Top Metrics Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Modules</p>
              <h3 className="text-2xl font-black text-[#0A192F] mt-1">{courses.length}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-100 border border-amber-300 text-amber-900 rounded-2xl flex items-center justify-center font-bold">
              <BookOpen className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total CME Credits</p>
              <h3 className="text-2xl font-black text-amber-600 mt-1">
                {courses.reduce((acc, c) => acc + c.cmeCredits, 0)} hrs
              </h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl flex items-center justify-center">
              <Award className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">DICOM Vignettes</p>
              <h3 className="text-2xl font-black text-sky-600 mt-1">
                {courses.reduce((acc, c) => acc + c.casesCount, 0)} Cases
              </h3>
            </div>
            <div className="w-12 h-12 bg-sky-50 border border-sky-200 text-sky-700 rounded-2xl flex items-center justify-center">
              <Layers className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Enrolled Fellows</p>
              <h3 className="text-2xl font-black text-emerald-600 mt-1">1,035</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="bg-white p-4 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search course modules by title or code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          <button className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-2xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2 shrink-0">
            <Plus className="w-4 h-4" />
            <span>Create New Module</span>
          </button>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-3xl border border-slate-200/80 shadow-xs p-6 space-y-4 hover:border-amber-400/60 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                    {course.code}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      course.status === 'active'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {course.status}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-[#0A192F]">{course.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{course.description}</p>
              </div>

              <div className="pt-4 border-t border-slate-100 space-y-4">
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold">CME CREDITS</p>
                    <p className="font-extrabold text-amber-600 mt-0.5">{course.cmeCredits} Hours</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold">CASES</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{course.casesCount} DICOM</p>
                  </div>
                  <div className="p-2 bg-slate-50 rounded-xl">
                    <p className="text-[10px] text-slate-400 font-bold">ENROLLED</p>
                    <p className="font-extrabold text-slate-800 mt-0.5">{course.enrolledStudents}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-2">
                  <button
                    onClick={() => setSelectedCourse(course)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>View Curriculum</span>
                  </button>
                  <button className="px-4 py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-1.5">
                    <Edit3 className="w-3.5 h-3.5" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Course Detail Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-8 max-w-xl w-full space-y-6">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100">
              <div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-900 px-3 py-1 rounded-full">
                  {selectedCourse.code}
                </span>
                <h3 className="text-lg font-black text-[#0A192F] mt-2">{selectedCourse.title}</h3>
              </div>
              <button
                onClick={() => setSelectedCourse(null)}
                className="p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="p-4 bg-slate-50 rounded-2xl">
                <p className="font-bold text-slate-400 uppercase text-[10px]">MODULE DESCRIPTION</p>
                <p className="text-slate-700 mt-1 leading-relaxed">{selectedCourse.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl">
                  <p className="font-bold text-amber-900">Accredited CME Credits</p>
                  <p className="text-lg font-black text-amber-700 mt-0.5">{selectedCourse.cmeCredits} Hours</p>
                </div>
                <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl">
                  <p className="font-bold text-sky-900">Total DICOM Case Studies</p>
                  <p className="text-lg font-black text-sky-700 mt-0.5">{selectedCourse.casesCount} Cases</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-3 pt-2 border-t border-slate-100">
              <button
                onClick={() => setSelectedCourse(null)}
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
