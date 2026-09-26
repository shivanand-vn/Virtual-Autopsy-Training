import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { type ContentType, type CourseModule, type Topic } from '../../types/course';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ChevronUp,
  ChevronDown,
  FileText,
  Video,
  Layers,
  CheckCircle2,
  X,
  AlertCircle,
  PlayCircle
} from 'lucide-react';

export const AdminCourseForm: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const isEditing = Boolean(courseId);
  const { addCourse, updateCourse, getCourse, addModule, addTopic } = useCourse();

  // Course Form State (NO FEE OR PRICE FIELDS)
  const [courseName, setCourseName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('6 Months');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [modules, setModules] = useState<CourseModule[]>([]);

  // Module Modal / Inline State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  // Topic Modal State
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [targetModuleIdForTopic, setTargetModuleIdForTopic] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicContentType, setTopicContentType] = useState<ContentType>('description');
  const [topicContent, setTopicContent] = useState('');
  const [topicVideoUrl, setTopicVideoUrl] = useState('');
  const [topicThumbnail, setTopicThumbnail] = useState('');
  const [topicStatus, setTopicStatus] = useState<'draft' | 'published'>('published');

  const [validationError, setValidationError] = useState<string | null>(null);

  // Pre-populate if editing
  useEffect(() => {
    if (isEditing && courseId) {
      const existing = getCourse(courseId);
      if (existing) {
        setCourseName(existing.name);
        setShortDescription(existing.shortDescription);
        setDescription(existing.description);
        setDuration(existing.duration);
        setStatus(existing.status);
        setModules(existing.modules || []);
      }
    }
  }, [isEditing, courseId]);

  // MODULE HANDLERS
  const openAddModuleModal = () => {
    setEditingModuleId(null);
    setModuleTitle('');
    setModuleDescription('');
    setShowModuleModal(true);
  };

  const openEditModuleModal = (mod: CourseModule) => {
    setEditingModuleId(mod.id);
    setModuleTitle(mod.title);
    setModuleDescription(mod.description);
    setShowModuleModal(true);
  };

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!moduleTitle.trim()) return;

    if (editingModuleId) {
      setModules((prev) =>
        prev.map((m) =>
          m.id === editingModuleId
            ? { ...m, title: moduleTitle, description: moduleDescription }
            : m
        )
      );
    } else {
      const newModuleNum = modules.length + 1;
      const newMod: CourseModule = {
        id: `mod-${Date.now().toString().slice(-4)}`,
        moduleNumber: newModuleNum,
        title: moduleTitle,
        subtitle: `Module ${newModuleNum} Learning Path`,
        description: moduleDescription,
        duration: '2h 00m',
        cmeCredits: 4,
        order: newModuleNum,
        status: 'published',
        topics: []
      };
      setModules((prev) => [...prev, newMod]);
    }

    setShowModuleModal(false);
  };

  const handleDeleteModule = (modId: string) => {
    setModules((prev) => {
      const filtered = prev.filter((m) => m.id !== modId);
      return filtered.map((m, idx) => ({
        ...m,
        moduleNumber: idx + 1,
        order: idx + 1
      }));
    });
  };

  const handleReorderModule = (modId: string, direction: 'up' | 'down') => {
    setModules((prev) => {
      const index = prev.findIndex((m) => m.id === modId);
      if (index === -1) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;

      const newArr = [...prev];
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;

      return newArr.map((m, idx) => ({
        ...m,
        moduleNumber: idx + 1,
        order: idx + 1
      }));
    });
  };

  // TOPIC HANDLERS
  const openAddTopicModal = (modId: string) => {
    setTargetModuleIdForTopic(modId);
    setEditingTopicId(null);
    setTopicTitle('');
    setTopicDescription('');
    setTopicContentType('description');
    setTopicContent('');
    setTopicVideoUrl('https://example.com/videos/sample-lesson.mp4');
    setTopicThumbnail('');
    setTopicStatus('published');
    setShowTopicModal(true);
  };

  const openEditTopicModal = (modId: string, top: Topic) => {
    setTargetModuleIdForTopic(modId);
    setEditingTopicId(top.id);
    setTopicTitle(top.title);
    setTopicDescription(top.description);
    setTopicContentType(top.contentType);
    setTopicContent(top.content || '');
    setTopicVideoUrl(top.videoUrl || '');
    setTopicThumbnail(top.thumbnail || '');
    setTopicStatus(top.status || 'published');
    setShowTopicModal(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetModuleIdForTopic) return;

    setModules((prev) =>
      prev.map((m) => {
        if (m.id === targetModuleIdForTopic) {
          if (editingTopicId) {
            const updatedTopics = m.topics.map((t) =>
              t.id === editingTopicId
                ? {
                  ...t,
                  title: topicTitle,
                  description: topicDescription,
                  contentType: topicContentType,
                  content: topicContentType === 'description' ? topicContent : undefined,
                  videoUrl: topicContentType === 'video' ? topicVideoUrl : undefined,
                  thumbnail: topicThumbnail || undefined,
                  status: topicStatus
                }
                : t
            );
            return { ...m, topics: updatedTopics };
          } else {
            const nextOrder = m.topics.length + 1;
            const newTopic: Topic = {
              id: `t-${Date.now().toString().slice(-4)}`,
              title: topicTitle,
              description: topicDescription,
              contentType: topicContentType,
              content: topicContentType === 'description' ? topicContent : undefined,
              videoUrl: topicContentType === 'video' ? topicVideoUrl : undefined,
              thumbnail: topicThumbnail || undefined,
              order: nextOrder,
              status: topicStatus
            };
            return { ...m, topics: [...m.topics, newTopic] };
          }
        }
        return m;
      })
    );

    setShowTopicModal(false);
  };

  const handleDeleteTopic = (modId: string, topicId: string) => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          const filtered = m.topics.filter((t) => t.id !== topicId);
          const reindexed = filtered.map((t, idx) => ({ ...t, order: idx + 1 }));
          return { ...m, topics: reindexed };
        }
        return m;
      })
    );
  };

  const handleReorderTopic = (modId: string, topicId: string, direction: 'up' | 'down') => {
    setModules((prev) =>
      prev.map((m) => {
        if (m.id === modId) {
          const index = m.topics.findIndex((t) => t.id === topicId);
          if (index === -1) return m;
          const targetIndex = direction === 'up' ? index - 1 : index + 1;
          if (targetIndex < 0 || targetIndex >= m.topics.length) return m;

          const newTopics = [...m.topics];
          const temp = newTopics[index];
          newTopics[index] = newTopics[targetIndex];
          newTopics[targetIndex] = temp;

          const reindexed = newTopics.map((t, idx) => ({ ...t, order: idx + 1 }));
          return { ...m, topics: reindexed };
        }
        return m;
      })
    );
  };

  // SAVE COURSE
  const handleSaveCourse = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!courseName.trim()) {
      setValidationError('Please enter a Course Name.');
      return;
    }

    if (modules.length === 0) {
      setValidationError('Please add at least 1 module to the course curriculum.');
      return;
    }

    const coursePayload = {
      name: courseName,
      shortDescription,
      description,
      duration,
      status,
      modules
    };

    if (isEditing && courseId) {
      updateCourse(courseId, coursePayload);
      navigate(`/admin/courses/${courseId}`);
    } else {
      const created = addCourse(coursePayload);
      navigate(`/admin/courses/${created.id}`);
    }
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Course' : 'Add New Course'}
      subtitle={
        isEditing
          ? 'Modify course settings and curriculum hierarchy.'
          : 'Create a new course and build its modules and topic content structure.'
      }
    >
      <div className="space-y-6 pb-16">
        {/* Back Button */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/courses"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Courses</span>
          </Link>
        </div>

        {/* Validation Error Notice */}
        {validationError && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl flex items-center justify-between text-xs font-bold animate-fade-in">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
              <span>{validationError}</span>
            </div>
            <button onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-800">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        <form onSubmit={handleSaveCourse} className="space-y-6">
          {/* COURSE GENERAL INFORMATION CARD (NO FEES/PRICES) */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <h3 className="text-base font-extrabold text-[#0A192F] pb-3 border-b border-slate-100">
              Course Information
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Course Name *</label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="e.g. Virtual Autopsy – An Online Introduction"
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Short Description</label>
                <input
                  type="text"
                  value={shortDescription}
                  onChange={(e) => setShortDescription(e.target.value)}
                  placeholder="Brief 1-line overview of the course scope..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Full Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Detailed course description, prerequisites, and learning objectives..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Course Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    placeholder="e.g. 6 Months"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Publish Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value as 'draft' | 'published')}
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-bold"
                  >
                    <option value="published">Published</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* COURSE CURRICULUM BUILDER CARD */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-extrabold text-[#0A192F] flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  <span>Course Curriculum Architecture</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Hierarchy: Course → Modules → Topics. Topics support Description/Text or Video lessons.
                </p>
              </div>

              <button
                type="button"
                onClick={openAddModuleModal}
                className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
                <span>+ Add Module</span>
              </button>
            </div>

            {/* Modules & Topics Tree */}
            <div className="space-y-6">
              {modules.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 text-slate-400 space-y-2">
                  <p className="font-bold text-xs">No modules added yet.</p>
                  <p className="text-[11px]">Click "+ Add Module" to start building your course modules and topics.</p>
                </div>
              ) : (
                modules.map((mod, modIdx) => {
                  const paddedNum = mod.moduleNumber < 10 ? `0${mod.moduleNumber}` : `${mod.moduleNumber}`;

                  return (
                    <div
                      key={mod.id}
                      className="border border-slate-200 rounded-2xl bg-white overflow-hidden shadow-2xs space-y-4 p-5"
                    >
                      {/* Module Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 rounded-xl bg-[#0A192F] text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                            {paddedNum}
                          </div>
                          <div>
                            <h4 className="font-extrabold text-sm text-[#0A192F]">
                              Module {mod.moduleNumber}: {mod.title}
                            </h4>
                            <p className="text-xs text-slate-500">{mod.topics.length} Topic{mod.topics.length === 1 ? '' : 's'}</p>
                          </div>
                        </div>

                        {/* Module Action Controls & Reorder */}
                        <div className="flex items-center space-x-2 shrink-0">
                          <div className="flex items-center space-x-1 border-r border-slate-200 pr-2">
                            <button
                              type="button"
                              onClick={() => handleReorderModule(mod.id, 'up')}
                              disabled={modIdx === 0}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                              title="Move Module Up"
                            >
                              <ChevronUp className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleReorderModule(mod.id, 'down')}
                              disabled={modIdx === modules.length - 1}
                              className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-30 cursor-pointer"
                              title="Move Module Down"
                            >
                              <ChevronDown className="w-4 h-4" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => openEditModuleModal(mod)}
                            className="p-1.5 text-amber-700 bg-amber-50 hover:bg-amber-100 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteModule(mod.id)}
                            className="p-1.5 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-lg text-xs font-bold cursor-pointer"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => openAddTopicModal(mod.id)}
                            className="inline-flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5 text-amber-400" />
                            <span>+ Topic</span>
                          </button>
                        </div>
                      </div>

                      {/* Topics List within Module */}
                      <div className="space-y-3 pl-2 sm:pl-4">
                        {mod.topics.length === 0 ? (
                          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-2">
                            <p className="text-xs font-semibold text-slate-500">No topics added to Module {mod.moduleNumber} yet.</p>
                            <button
                              type="button"
                              onClick={() => openAddTopicModal(mod.id)}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>+ Add First Topic</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {mod.topics.map((top, topIdx) => (
                                <div
                                  key={top.id}
                                  className="p-3 bg-slate-50/80 rounded-xl border border-slate-200 flex items-center justify-between text-xs transition-all hover:bg-slate-100/80"
                                >
                                  <div className="flex items-center space-x-3 min-w-0">
                                    <div className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center shrink-0">
                                      {topIdx + 1}
                                    </div>

                                    <div className="min-w-0">
                                      <div className="flex items-center space-x-2">
                                        <span className="font-extrabold text-slate-900 truncate">{top.title}</span>
                                        <span className="inline-flex items-center space-x-1 text-[10px] px-2 py-0.5 rounded-full font-bold bg-slate-200 text-slate-700">
                                          {top.contentType === 'video' ? (
                                            <>
                                              <Video className="w-3 h-3 text-amber-600" />
                                              <span>Video</span>
                                            </>
                                          ) : (
                                            <>
                                              <FileText className="w-3 h-3 text-slate-500" />
                                              <span>Description</span>
                                            </>
                                          )}
                                        </span>
                                        {top.status === 'draft' && (
                                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 border border-amber-300">
                                            Draft
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{top.description}</p>
                                    </div>
                                  </div>

                                  {/* Topic Actions & Reordering */}
                                  <div className="flex items-center space-x-2 shrink-0 ml-2">
                                    <button
                                      type="button"
                                      onClick={() => handleReorderTopic(mod.id, top.id, 'up')}
                                      disabled={topIdx === 0}
                                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ChevronUp className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleReorderTopic(mod.id, top.id, 'down')}
                                      disabled={topIdx === mod.topics.length - 1}
                                      className="p-1 text-slate-400 hover:text-slate-700 disabled:opacity-30 cursor-pointer"
                                    >
                                      <ChevronDown className="w-3.5 h-3.5" />
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => openEditTopicModal(mod.id, top)}
                                      className="text-amber-800 hover:underline font-bold text-[11px] cursor-pointer"
                                    >
                                      Edit
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleDeleteTopic(mod.id, top.id)}
                                      className="text-rose-600 hover:underline font-bold text-[11px] cursor-pointer"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                            <div className="pt-1">
                              <button
                                type="button"
                                onClick={() => openAddTopicModal(mod.id)}
                                className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                              >
                                <Plus className="w-3.5 h-3.5 text-amber-600" />
                                <span>+ Add Another Topic</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-2">
            <Link
              to="/admin/courses"
              className="px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isEditing ? 'Update Course & Curriculum' : 'Save Course'}
            </button>
          </div>
        </form>

        {/* MODULE MODAL */}
        {showModuleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-[#0A192F]">
                  {editingModuleId ? 'Edit Module' : 'Add Module'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowModuleModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveModule} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Module Title *</label>
                  <input
                    type="text"
                    required
                    value={moduleTitle}
                    onChange={(e) => setModuleTitle(e.target.value)}
                    placeholder="e.g. Introduction to Virtual Autopsy"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Module Description</label>
                  <textarea
                    value={moduleDescription}
                    onChange={(e) => setModuleDescription(e.target.value)}
                    rows={3}
                    placeholder="Overview of topics covered in this module..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowModuleModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    Save Module
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* TOPIC MODAL */}
        {showTopicModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <h3 className="text-base font-extrabold text-[#0A192F]">
                  {editingTopicId ? 'Edit Topic' : 'Add Topic'}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowTopicModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTopic} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Topic Title *</label>
                  <input
                    type="text"
                    required
                    value={topicTitle}
                    onChange={(e) => setTopicTitle(e.target.value)}
                    placeholder="e.g. Basic Principles of PMCT Scanning"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Topic Description</label>
                  <input
                    type="text"
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    placeholder="Short summary of lesson..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Content Type *</label>
                    <select
                      value={topicContentType}
                      onChange={(e) => setTopicContentType(e.target.value as ContentType)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    >
                      <option value="description">Description / Text</option>
                      <option value="video">Video</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Topic Status *</label>
                    <select
                      value={topicStatus}
                      onChange={(e) => setTopicStatus(e.target.value as 'draft' | 'published')}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    >
                      <option value="published">Published</option>
                      <option value="draft">Draft</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Thumbnail Image URL (Optional)</label>
                  <input
                    type="url"
                    value={topicThumbnail}
                    onChange={(e) => setTopicThumbnail(e.target.value)}
                    placeholder="https://example.com/topic-thumbnail.jpg"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                  />
                </div>

                {/* CONDITIONALLY RENDER CONTENT INPUT BASED ON TYPE */}
                {topicContentType === 'description' ? (
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Learning Content (Text / Educational Lesson)</label>
                    <textarea
                      value={topicContent}
                      onChange={(e) => setTopicContent(e.target.value)}
                      rows={5}
                      placeholder="Enter the lesson text content displayed to students..."
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed font-medium"
                    />
                  </div>
                ) : (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1">Video URL *</label>
                      <input
                        type="url"
                        value={topicVideoUrl}
                        onChange={(e) => setTopicVideoUrl(e.target.value)}
                        placeholder="https://example.com/video.mp4"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-amber-900"
                      />
                    </div>
                    <div className="aspect-video bg-slate-950 rounded-xl flex items-center justify-center text-amber-400 text-xs font-mono border border-slate-800">
                      <PlayCircle className="w-8 h-8 mr-2 text-amber-500" />
                      <span>Mock Video Player Preview</span>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowTopicModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer"
                  >
                    Save Topic
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
