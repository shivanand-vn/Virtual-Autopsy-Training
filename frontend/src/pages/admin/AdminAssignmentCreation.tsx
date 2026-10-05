import React, { useState, useEffect, useCallback } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { api } from '../../lib/api';
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  FileText,
  UploadCloud,
  ExternalLink,
  Eye,
  EyeOff,
  BookOpen,
  FilePlus,
  Paperclip
} from 'lucide-react';

export interface AdminAssignmentItem {
  id: string;
  courseId: string;
  courseName: string;
  moduleId: string;
  moduleName: string;
  moduleOrder?: number;
  title: string;
  instructions: string;
  submissionGuidelines?: string;
  attachmentUrl?: string;
  attachmentName?: string;
  status: 'DRAFT' | 'PUBLISHED';
  maxScore: number;
  dueDate?: string;
  createdAt?: string;
}

export const AdminAssignmentCreationPage: React.FC = () => {
  const { courses, updateModuleAssignment } = useCourse();

  const [assignments, setAssignments] = useState<AdminAssignmentItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filter State
  const [selectedCourseId, setSelectedCourseId] = useState<string>('all');
  const [selectedModuleId, setSelectedModuleId] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingAssignment, setEditingAssignment] = useState<AdminAssignmentItem | null>(null);

  // Form State
  const [formCourseId, setFormCourseId] = useState<string>('');
  const [formModuleId, setFormModuleId] = useState<string>('');
  const [formTitle, setFormTitle] = useState<string>('');
  const [formInstructions, setFormInstructions] = useState<string>('');
  const [formSubmissionGuidelines, setFormSubmissionGuidelines] = useState<string>('');
  const [formAttachmentUrl, setFormAttachmentUrl] = useState<string>('');
  const [formAttachmentName, setFormAttachmentName] = useState<string>('');
  const [formStatus, setFormStatus] = useState<'DRAFT' | 'PUBLISHED'>('PUBLISHED');
  const [formMaxScore, setFormMaxScore] = useState<number>(100);
  const [formDueDate, setFormDueDate] = useState<string>('');
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Delete & Toast State
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Derive initial assignments list from backend API or CourseContext fallback
  const fetchAssignments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/assignments');
      if (res && res.data && Array.isArray(res.data)) {
        const mapped: AdminAssignmentItem[] = res.data.map((item: any) => {
          const mod = item.module;
          const crs = mod?.course;
          return {
            id: item.id,
            courseId: crs?.id || mod?.courseId || '',
            courseName: crs?.title || crs?.name || 'Virtual Autopsy Training',
            moduleId: item.moduleId,
            moduleName: mod ? `Module 0${mod.order || 1}: ${mod.title}` : 'Course Module',
            moduleOrder: mod?.order || 1,
            title: item.title,
            instructions: item.instructions || '',
            submissionGuidelines: item.submissionGuidelines || '',
            attachmentUrl: item.attachmentUrl || '',
            attachmentName: item.attachmentUrl ? item.attachmentUrl.split('/').pop() : '',
            status: item.status === 'DRAFT' ? 'DRAFT' : 'PUBLISHED',
            maxScore: item.maxScore || 100,
            dueDate: item.dueDate ? item.dueDate.split('T')[0] : '',
            createdAt: item.createdAt,
          };
        });
        setAssignments(mapped);
      } else {
        fallbackFromCourses();
      }
    } catch {
      fallbackFromCourses();
    } finally {
      setIsLoading(false);
    }
  }, [courses]);

  const fallbackFromCourses = () => {
    const fallbackList: AdminAssignmentItem[] = [];
    courses.forEach((crs) => {
      crs.modules.forEach((mod) => {
        if (mod.assignment) {
          fallbackList.push({
            id: mod.assignment.id || `asgn-${mod.id}`,
            courseId: crs.id,
            courseName: crs.name,
            moduleId: mod.id,
            moduleName: `Module 0${mod.moduleNumber}: ${mod.title}`,
            moduleOrder: mod.moduleNumber,
            title: mod.assignment.title || 'Case Report Assignment',
            instructions: mod.assignment.instructions || mod.assignment.description || '',
            submissionGuidelines: 'Submit a comprehensive PDF report formatted with figures, references, and forensic findings.',
            attachmentUrl: mod.assignment.templateFileUrl || '',
            attachmentName: mod.assignment.templateFileName || '',
            status: 'PUBLISHED',
            maxScore: mod.assignment.totalMarks || 100,
            dueDate: mod.assignment.dueDate || '',
          });
        }
      });
    });
    setAssignments(fallbackList);
  };

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  // Derived modules for filtering & form
  const selectedCourseObj = courses.find((c) => c.id === selectedCourseId);
  const filterModules = selectedCourseObj ? selectedCourseObj.modules : [];

  const formCourseObj = courses.find((c) => c.id === formCourseId);
  const formModules = formCourseObj ? formCourseObj.modules : [];

  // Filtered Assignments
  const filteredAssignments = assignments.filter((a) => {
    if (selectedCourseId !== 'all' && a.courseId !== selectedCourseId) return false;
    if (selectedModuleId !== 'all' && a.moduleId !== selectedModuleId) return false;
    if (selectedStatus !== 'all' && a.status !== selectedStatus) return false;
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase();
      const matchTitle = a.title.toLowerCase().includes(q);
      const matchMod = a.moduleName.toLowerCase().includes(q);
      const matchCrs = a.courseName.toLowerCase().includes(q);
      if (!matchTitle && !matchMod && !matchCrs) return false;
    }
    return true;
  });

  // Handle Create New
  const handleOpenCreateModal = () => {
    setEditingAssignment(null);
    const initialCourseId = courses[0]?.id || '';
    const initialCourseObj = courses.find((c) => c.id === initialCourseId);
    const initialModuleId = initialCourseObj?.modules[0]?.id || '';

    setFormCourseId(initialCourseId);
    setFormModuleId(initialModuleId);
    setFormTitle('');
    setFormInstructions('');
    setFormSubmissionGuidelines('Upload single PDF document under 25MB including case figures and citations.');
    setFormAttachmentUrl('/dossier-template.pdf');
    setFormAttachmentName('Module_Assignment_Case_Briefing.pdf');
    setFormStatus('PUBLISHED');
    setFormMaxScore(100);
    setFormDueDate('');
    setIsModalOpen(true);
  };

  // Handle Edit
  const handleOpenEditModal = (asgn: AdminAssignmentItem) => {
    setEditingAssignment(asgn);
    setFormCourseId(asgn.courseId || courses[0]?.id || '');
    setFormModuleId(asgn.moduleId);
    setFormTitle(asgn.title);
    setFormInstructions(asgn.instructions);
    setFormSubmissionGuidelines(asgn.submissionGuidelines || 'Upload single PDF document under 25MB including case figures and citations.');
    setFormAttachmentUrl(asgn.attachmentUrl || '/dossier-template.pdf');
    setFormAttachmentName(asgn.attachmentName || (asgn.attachmentUrl ? asgn.attachmentUrl.split('/').pop() || '' : 'Module_Assignment_Case_Briefing.pdf'));
    setFormStatus(asgn.status);
    setFormMaxScore(asgn.maxScore || 100);
    setFormDueDate(asgn.dueDate || '');
    setIsModalOpen(true);
  };

  // Handle Course selection change in Form (dynamically updates Module list)
  const handleFormCourseChange = (newCourseId: string) => {
    setFormCourseId(newCourseId);
    const crs = courses.find((c) => c.id === newCourseId);
    if (crs && crs.modules.length > 0) {
      setFormModuleId(crs.modules[0].id);
    } else {
      setFormModuleId('');
    }
  };

  // File Attachment Upload Handler
  const handleAttachmentUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      // Attempt upload to backend API or fallback to mock object URL
      try {
        const res = await api.upload('/upload/document', formData);
        if (res && res.data && res.data.fileUrl) {
          setFormAttachmentUrl(res.data.fileUrl);
          setFormAttachmentName(file.name);
          showToast(`File "${file.name}" uploaded successfully.`);
          return;
        }
      } catch {
        // Fallback mock attachment URL
      }

      const localUrl = URL.createObjectURL(file);
      setFormAttachmentUrl(localUrl);
      setFormAttachmentName(file.name);
      showToast(`Attached file "${file.name}".`);
    } finally {
      setIsUploading(false);
    }
  };

  // Save / Update Assignment Handler
  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formCourseId || !formModuleId) {
      showToast('Please select a valid Course and Module.');
      return;
    }
    if (!formTitle.trim()) {
      showToast('Assignment Title is required.');
      return;
    }
    if (!formInstructions.trim()) {
      showToast('Assignment Description / Instructions are required.');
      return;
    }
    if (!formAttachmentUrl && !formAttachmentName) {
      showToast('Reference File / Attachment Briefing is mandatory. Please upload or attach a reference document.');
      return;
    }

    const payload = {
      moduleId: formModuleId,
      title: formTitle.trim(),
      instructions: formInstructions.trim(),
      submissionGuidelines: formSubmissionGuidelines.trim(),
      attachmentUrl: formAttachmentUrl || null,
      status: formStatus,
      maxScore: formMaxScore,
      dueDate: formDueDate || null,
    };

    try {
      if (editingAssignment) {
        // Update via backend API
        try {
          await api.put(`/assignments/${editingAssignment.id}`, payload);
        } catch (err) {
          console.warn('API update failed, updating local state:', err);
        }

        // Update local list
        setAssignments((prev) =>
          prev.map((item) =>
            item.id === editingAssignment.id
              ? {
                ...item,
                courseId: formCourseId,
                courseName: courses.find((c) => c.id === formCourseId)?.name || item.courseName,
                moduleId: formModuleId,
                moduleName: `Module: ${courses.find((c) => c.id === formCourseId)?.modules.find((m) => m.id === formModuleId)?.title || 'Selected Module'}`,
                title: formTitle.trim(),
                instructions: formInstructions.trim(),
                submissionGuidelines: formSubmissionGuidelines.trim(),
                attachmentUrl: formAttachmentUrl,
                attachmentName: formAttachmentName,
                status: formStatus,
                maxScore: formMaxScore,
                dueDate: formDueDate,
              }
              : item
          )
        );

        // Update CourseContext for student portal sync
        updateModuleAssignment(formCourseId, formModuleId, {
          title: formTitle.trim(),
          description: formInstructions.trim(),
          instructions: formInstructions.trim(),
          templateFileUrl: formAttachmentUrl,
          templateFileName: formAttachmentName || 'Assignment_Reference_Dossier.pdf',
          totalMarks: formMaxScore,
        });

        showToast('Assignment updated successfully.');
      } else {
        // Create new assignment via backend API
        let createdId = `asgn-${Date.now()}`;
        try {
          const res = await api.post('/assignments', payload);
          if (res?.data?.id) {
            createdId = res.data.id;
          }
        } catch (err) {
          console.warn('API creation failed, creating in local state:', err);
        }

        const newAsgnItem: AdminAssignmentItem = {
          id: createdId,
          courseId: formCourseId,
          courseName: courses.find((c) => c.id === formCourseId)?.name || 'Course',
          moduleId: formModuleId,
          moduleName: `Module: ${courses.find((c) => c.id === formCourseId)?.modules.find((m) => m.id === formModuleId)?.title || 'Selected Module'}`,
          title: formTitle.trim(),
          instructions: formInstructions.trim(),
          submissionGuidelines: formSubmissionGuidelines.trim(),
          attachmentUrl: formAttachmentUrl,
          attachmentName: formAttachmentName,
          status: formStatus,
          maxScore: formMaxScore,
          dueDate: formDueDate,
        };

        setAssignments((prev) => [newAsgnItem, ...prev]);

        // Sync to CourseContext so students see it immediately
        updateModuleAssignment(formCourseId, formModuleId, {
          id: createdId,
          moduleId: formModuleId,
          title: formTitle.trim(),
          description: formInstructions.trim(),
          instructions: formInstructions.trim(),
          templateFileUrl: formAttachmentUrl,
          templateFileName: formAttachmentName || 'Assignment_Reference_Dossier.pdf',
          totalMarks: formMaxScore,
          submissionStatus: 'pending',
        });

        showToast('Assignment created successfully.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to save assignment.');
    } finally {
      setIsModalOpen(false);
    }
  };

  // Toggle Publish / Unpublish Status
  const handleToggleStatus = async (asgn: AdminAssignmentItem) => {
    const nextStatus = asgn.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      await api.patch(`/assignments/${asgn.id}/status`, { status: nextStatus });
    } catch (e) {
      console.warn('API status patch failed, updating local state:', e);
    }

    setAssignments((prev) =>
      prev.map((item) => (item.id === asgn.id ? { ...item, status: nextStatus } : item))
    );
    showToast(`Assignment "${asgn.title}" is now ${nextStatus.toLowerCase()}.`);
  };

  // Delete Assignment Confirm Handler
  const handleDeleteConfirm = async () => {
    if (!deletingId) return;

    try {
      await api.delete(`/assignments/${deletingId}`);
    } catch (e) {
      console.warn('API delete failed, updating local state:', e);
    }

    setAssignments((prev) => prev.filter((item) => item.id !== deletingId));
    setDeletingId(null);
    showToast('Assignment deleted successfully.');
  };

  return (
    <AdminLayout title="Assignment Creation" subtitle="Create, configure, and publish practical case assignments for course modules.">
      <div className="space-y-6 pb-12">
        {/* Toast Notification */}
        {toastMessage && (
          <div className="bg-emerald-600 text-white px-4 py-3 rounded-2xl shadow-lg font-bold text-xs flex items-center justify-between animate-fade-in">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{toastMessage}</span>
            </div>
            <button onClick={() => setToastMessage(null)} className="text-emerald-200 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Top Actions & Heading Bar */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-extrabold text-[#0A192F] flex items-center space-x-2">
              <FilePlus className="w-6 h-6 text-amber-500" />
              <span>Module Assignment Builder</span>
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Configure practical assignments associated with specific course modules for fellow submissions.
            </p>
          </div>

          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center justify-center space-x-2 px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span> Create Assignment</span>
          </button>
        </div>

        {/* Search & Filtering Control Bar */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex items-center space-x-2 text-xs font-bold text-[#0A192F] uppercase tracking-wider">
            <Filter className="w-4 h-4 text-amber-500" />
            <span>Filter Assignments</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Course Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Course</label>
              <select
                value={selectedCourseId}
                onChange={(e) => {
                  setSelectedCourseId(e.target.value);
                  setSelectedModuleId('all');
                }}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Courses</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Module Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Module</label>
              <select
                value={selectedModuleId}
                onChange={(e) => setSelectedModuleId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Modules</option>
                {filterModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module 0{m.moduleNumber}: {m.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
              >
                <option value="all">All Statuses</option>
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
              </select>
            </div>

            {/* Search Input */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1">Search</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search title or module..."
                  className="w-full text-xs pl-8 pr-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Assignments Table / Card List */}
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Showing {filteredAssignments.length} Assignment{filteredAssignments.length === 1 ? '' : 's'}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-mono text-[10px] border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4 font-bold">Assignment Title</th>
                  <th className="py-3.5 px-4 font-bold">Course / Module</th>
                  <th className="py-3.5 px-4 font-bold text-center">Reference File</th>
                  <th className="py-3.5 px-4 font-bold text-center">Max Marks</th>
                  <th className="py-3.5 px-4 font-bold text-center">Status</th>
                  <th className="py-3.5 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      Loading assignments...
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-400 font-semibold text-xs">
                      No assignments available. Click "+ Create Assignment" to add a new module assignment.
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                      {/* Assignment Title & Details */}
                      <td className="py-4 px-4 max-w-xs sm:max-w-md">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-2">{a.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 line-clamp-1">{a.instructions}</p>
                      </td>

                      {/* Course / Module */}
                      <td className="py-4 px-4 text-slate-600">
                        <p className="font-bold text-slate-800 truncate max-w-[200px]">{a.moduleName}</p>
                        <p className="text-[10px] text-slate-400 truncate max-w-[200px]">{a.courseName}</p>
                      </td>

                      {/* Reference Attachment File */}
                      <td className="py-4 px-4 text-center">
                        {a.attachmentUrl || a.attachmentName ? (
                          <a
                            href={a.attachmentUrl || '#'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-2.5 py-1 rounded-md transition-colors"
                          >
                            <Paperclip className="w-3 h-3 text-amber-600" />
                            <span className="truncate max-w-[100px]">{a.attachmentName || 'Attachment'}</span>
                          </a>
                        ) : (
                          <span className="text-[10px] text-slate-400 italic">None</span>
                        )}
                      </td>

                      {/* Max Marks */}
                      <td className="py-4 px-4 text-center font-extrabold text-slate-800">
                        {a.maxScore} Pts
                      </td>

                      {/* Status Badge */}
                      <td className="py-4 px-4 text-center">
                        <button
                          onClick={() => handleToggleStatus(a)}
                          className={`inline-flex items-center space-x-1 text-[10px] font-bold px-2.5 py-1 rounded-full cursor-pointer transition-colors ${a.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                              : 'bg-amber-100 text-amber-900 hover:bg-amber-200'
                            }`}
                          title="Click to toggle Draft / Published status"
                        >
                          {a.status === 'PUBLISHED' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-3 h-3 text-amber-600" />
                              <span>Draft</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEditModal(a)}
                          className="p-1.5 text-amber-700 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit Assignment"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeletingId(a.id)}
                          className="p-1.5 text-rose-600 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors cursor-pointer"
                          title="Delete Assignment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* CREATE / EDIT ASSIGNMENT MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-hidden">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 flex flex-col max-h-[90vh] overflow-hidden">
              {/* Fixed Modal Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 shrink-0">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center">
                    <FilePlus className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-extrabold text-[#0A192F]">
                      {editingAssignment ? 'Edit Module Assignment' : 'Create New Module Assignment'}
                    </h3>
                    <p className="text-xs text-slate-500">
                      Specify assignment instructions, target module, and reference materials.
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Container */}
              <form onSubmit={handleSubmitForm} className="flex flex-col flex-1 min-h-0 overflow-hidden pt-4">
                {/* Scrollable Form Body */}
                <div className="flex-1 overflow-y-auto space-y-4 pr-1.5 text-xs">
                  {/* 1. SELECT COURSE */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Select Course *
                    </label>
                    <select
                      value={formCourseId}
                      onChange={(e) => handleFormCourseChange(e.target.value)}
                      required
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                    >
                      {courses.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* 2. SELECT MODULE (DYNAMICALLY POPULATED) */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Select Module *
                    </label>
                    <select
                      value={formModuleId}
                      onChange={(e) => setFormModuleId(e.target.value)}
                      required
                      disabled={formModules.length === 0}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900 disabled:opacity-50"
                    >
                      {formModules.length === 0 ? (
                        <option value="">No modules available for this course</option>
                      ) : (
                        formModules.map((m) => (
                          <option key={m.id} value={m.id}>
                            Module 0{m.moduleNumber}: {m.title}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  {/* 3. ASSIGNMENT TITLE */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Assignment Title *
                    </label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Module 01 Case Assignment: Evidentiary Admissibility & Chain-of-Custody Report"
                      required
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                    />
                  </div>

                  {/* 4. DESCRIPTION & INSTRUCTIONS */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Assignment Description / Instructions *
                    </label>
                    <textarea
                      rows={4}
                      value={formInstructions}
                      onChange={(e) => setFormInstructions(e.target.value)}
                      placeholder="Provide clear instructions for fellow case evaluation, requirements, and forensic reporting criteria..."
                      required
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-medium text-slate-800"
                    />
                  </div>

                  {/* 5. SUBMISSION GUIDELINES */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Submission Guidelines (Optional)
                    </label>
                    <textarea
                      rows={2}
                      value={formSubmissionGuidelines}
                      onChange={(e) => setFormSubmissionGuidelines(e.target.value)}
                      placeholder="e.g. Upload a single PDF document under 25MB including case figures, findings, and citations."
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-700"
                    />
                  </div>

                  {/* 6. REFERENCE FILE / ATTACHMENT */}
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                      Reference File / Attachment Briefing *
                    </label>

                    <div className="flex flex-col sm:flex-row items-center gap-3">
                      <label className="cursor-pointer px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold text-xs border border-slate-200 flex items-center space-x-2 transition-colors">
                        <UploadCloud className="w-4 h-4 text-amber-600" />
                        <span>{isUploading ? 'Uploading...' : 'Choose Reference PDF'}</span>
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={handleAttachmentUpload}
                          className="hidden"
                        />
                      </label>

                      {formAttachmentName ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 flex items-center space-x-1 truncate max-w-xs">
                          <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
                          <span className="truncate">{formAttachmentName}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No reference file uploaded</span>
                      )}
                    </div>
                  </div>

                  {/* 7. STATUS & MARKS ROW */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                        Status *
                      </label>
                      <select
                        value={formStatus}
                        onChange={(e) => setFormStatus(e.target.value as 'DRAFT' | 'PUBLISHED')}
                        className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                      >
                        <option value="PUBLISHED">Published</option>
                        <option value="DRAFT">Draft</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1.5">
                        Maximum Score / Marks
                      </label>
                      <input
                        type="number"
                        value={formMaxScore}
                        onChange={(e) => setFormMaxScore(Number(e.target.value) || 100)}
                        min={10}
                        max={1000}
                        className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                {/* Fixed Modal Footer Action Buttons */}
                <div className="flex items-center justify-end space-x-3 pt-4 mt-2 border-t border-slate-100 shrink-0">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="px-6 py-2.5 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 rounded-xl shadow-md transition-all cursor-pointer"
                  >
                    {editingAssignment ? 'Save Assignment Changes' : 'Create & Save Assignment'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* DELETE CONFIRMATION MODAL */}
        {deletingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="w-14 h-14 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto">
                <AlertTriangle className="w-7 h-7" />
              </div>

              <div className="space-y-1">
                <h3 className="text-xl font-extrabold text-[#0A192F]">Delete Assignment?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to delete this module assignment? This action cannot be undone.
                </p>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setDeletingId(null)}
                  className="flex-1 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="flex-1 py-2.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-md transition-colors cursor-pointer"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
