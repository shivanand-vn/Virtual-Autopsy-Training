import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useCourse } from '../../context/CourseContext';
import { type ContentType, type CourseModule, type Topic, type ModuleAssignment } from '../../types/course';
import { api } from '../../lib/api';
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
  PlayCircle,
  Upload,
  Loader2,
  Shield,
  Image as ImageIcon,
  FileCheck,
  Paperclip
} from 'lucide-react';

export const AdminCourseForm: React.FC = () => {
  const navigate = useNavigate();
  const { courseId } = useParams<{ courseId?: string }>();
  const isEditing = Boolean(courseId);
  const { addCourse, updateCourse, getCourse, refreshCourses } = useCourse();

  // Course Form State (NO FEE OR PRICE FIELDS)
  const [courseName, setCourseName] = useState('');
  const [shortDescription, setShortDescription] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('6 Months');
  const [status, setStatus] = useState<'draft' | 'published'>('published');
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [initialModules, setInitialModules] = useState<CourseModule[]>([]);
  const [initialCourseMeta, setInitialCourseMeta] = useState<{
    name: string;
    shortDescription: string;
    description: string;
    duration: string;
    status: 'draft' | 'published';
  } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Module Modal / Inline State
  const [showModuleModal, setShowModuleModal] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleDescription, setModuleDescription] = useState('');

  // Module Assignment Modal & State
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [targetModuleIdForAssignment, setTargetModuleIdForAssignment] = useState<string | null>(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [assignmentInstructionsInput, setAssignmentInstructionsInput] = useState('');
  const [assignmentDueDate, setAssignmentDueDate] = useState('');
  const [assignmentTotalMarks, setAssignmentTotalMarks] = useState<number>(100);
  const [assignmentPdfUrl, setAssignmentPdfUrl] = useState('');
  const [assignmentPdfFileName, setAssignmentPdfFileName] = useState<string | null>(null);
  const [isUploadingAssignmentPdf, setIsUploadingAssignmentPdf] = useState(false);
  const [assignmentPdfProgress, setAssignmentPdfProgress] = useState<number>(0);
  const [assignmentPdfError, setAssignmentPdfError] = useState<string | null>(null);

  // Topic Modal State
  const [showTopicModal, setShowTopicModal] = useState(false);
  const [targetModuleIdForTopic, setTargetModuleIdForTopic] = useState<string | null>(null);
  const [editingTopicId, setEditingTopicId] = useState<string | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [topicContentType, setTopicContentType] = useState<ContentType>('theory');
  const [topicContent, setTopicContent] = useState('');
  const [topicVideoUrl, setTopicVideoUrl] = useState('');
  const [topicBunnyVideoId, setTopicBunnyVideoId] = useState<string | null>(null);
  const [requiredWatchPercentage, setRequiredWatchPercentage] = useState<number>(99);
  const [assignmentInstructions, setAssignmentInstructions] = useState('');
  const [submissionInstructions, setSubmissionInstructions] = useState('');
  const [referenceAttachmentName, setReferenceAttachmentName] = useState('');
  const [topicThumbnail, setTopicThumbnail] = useState('');
  const [topicStatus, setTopicStatus] = useState<'draft' | 'published'>('published');
  
  // Theory Content & PDF Document State
  const [topicTheoryFormat, setTopicTheoryFormat] = useState<'text' | 'pdf'>('text');
  const [topicPdfUrl, setTopicPdfUrl] = useState('');
  const [topicPdfFileName, setTopicPdfFileName] = useState<string | null>(null);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [pdfUploadProgress, setPdfUploadProgress] = useState<number>(0);
  const [pdfUploadError, setPdfUploadError] = useState<string | null>(null);

  // Video Source & Upload State
  const [videoSourceMode, setVideoSourceMode] = useState<'url' | 'file'>('url');
  const [uploadedVideoFileName, setUploadedVideoFileName] = useState<string | null>(null);
  const [isUploadingVideo, setIsUploadingVideo] = useState(false);
  const [videoUploadProgress, setVideoUploadProgress] = useState<number>(0);
  const [videoUploadError, setVideoUploadError] = useState<string | null>(null);
  const videoUploadAbortControllerRef = useRef<AbortController | null>(null);

  // Thumbnail Source & Upload State
  const [thumbnailSourceMode, setThumbnailSourceMode] = useState<'url' | 'file'>('url');
  const [uploadedThumbnailFileName, setUploadedThumbnailFileName] = useState<string | null>(null);
  const [thumbnailLocalPreview, setThumbnailLocalPreview] = useState<string | null>(null);
  const [isUploadingThumbnail, setIsUploadingThumbnail] = useState(false);
  const [thumbnailUploadProgress, setThumbnailUploadProgress] = useState<number>(0);
  const [thumbnailUploadError, setThumbnailUploadError] = useState<string | null>(null);
  const thumbnailUploadAbortControllerRef = useRef<AbortController | null>(null);

  const [isDeletingThumbnail, setIsDeletingThumbnail] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Auto-sign Bunny video URLs if an unsigned embed URL is present
  useEffect(() => {
    if (topicVideoUrl && topicVideoUrl.includes('iframe.mediadelivery.net') && !topicVideoUrl.includes('token=')) {
      const match = topicVideoUrl.match(/embed\/\d+\/([a-zA-Z0-9-]+)/);
      if (match && match[1]) {
        const videoId = match[1];
        setTopicBunnyVideoId(videoId);
        api.get<{ embedUrl: string }>(`/courses/stream-token/${videoId}`)
          .then((res) => {
            if (res?.data?.embedUrl) {
              setTopicVideoUrl(res.data.embedUrl);
            }
          })
          .catch((err) => {
            console.warn('Could not auto-sign stream embed URL:', err);
          });
      }
    }
  }, [topicVideoUrl]);

  const handleVideoFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!file.type.startsWith('video/')) {
      setVideoUploadError('Please select a valid video file (MP4, WebM, MOV, etc.).');
      return;
    }

    const MAX_SIZE = 100 * 1024 * 1024; // 100MB limit
    if (file.size > MAX_SIZE) {
      setVideoUploadError('Video file exceeds maximum allowed size of 100MB.');
      return;
    }

    const abortController = new AbortController();
    videoUploadAbortControllerRef.current = abortController;

    setUploadedVideoFileName(file.name);
    setIsUploadingVideo(true);
    setVideoUploadProgress(0);
    setVideoUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.upload<{ url: string; fileName: string; bunnyVideoId?: string }>(
        '/courses/upload-media',
        formData,
        (percent) => setVideoUploadProgress(percent),
        abortController.signal
      );
      if (response && response.data && response.data.url) {
        setTopicVideoUrl(response.data.url);
        if (response.data.bunnyVideoId) {
          setTopicBunnyVideoId(response.data.bunnyVideoId);
        }
        setVideoUploadProgress(100);
      } else {
        throw new Error(response?.message || 'Failed to upload video.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.log('Video upload was cancelled by user.');
        return;
      }
      console.error('Video upload failed:', err);
      const rawMsg = err.data?.message || err.message || '';
      const msg = rawMsg.toLowerCase().includes('fetch failed') || rawMsg.toLowerCase().includes('timeout')
        ? 'Video upload connection timed out or was interrupted. Please check network connection and try again.'
        : (rawMsg || 'Failed to upload video. Please check connection and try again.');
      setVideoUploadError(msg);
    } finally {
      setIsUploadingVideo(false);
      videoUploadAbortControllerRef.current = null;
    }
  };

  const handleThumbnailFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setThumbnailUploadError('Please select a valid image file (JPG, PNG, WebP, etc.).');
      return;
    }

    const MAX_SIZE = 10 * 1024 * 1024; // 10MB limit
    if (file.size > MAX_SIZE) {
      setThumbnailUploadError('Image file exceeds maximum allowed size of 10MB.');
      return;
    }

    const abortController = new AbortController();
    thumbnailUploadAbortControllerRef.current = abortController;

    const localUrl = URL.createObjectURL(file);
    setThumbnailLocalPreview(localUrl);
    setUploadedThumbnailFileName(file.name);
    setIsUploadingThumbnail(true);
    setThumbnailUploadProgress(0);
    setThumbnailUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await api.upload<{ url: string; fileName: string }>(
        '/courses/upload-media',
        formData,
        (percent) => setThumbnailUploadProgress(percent),
        abortController.signal
      );
      if (response && response.data && response.data.url) {
        setTopicThumbnail(response.data.url);
        setThumbnailUploadProgress(100);
      } else {
        throw new Error(response?.message || 'Failed to upload thumbnail image.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('aborted')) {
        console.log('Thumbnail upload was cancelled by user.');
        return;
      }
      console.error('Thumbnail upload failed:', err);
      const msg = err.data?.message || err.message || 'Failed to upload thumbnail image. Please try again.';
      setThumbnailUploadError(msg);
    } finally {
      setIsUploadingThumbnail(false);
      thumbnailUploadAbortControllerRef.current = null;
    }
  };

  const handleRemoveThumbnail = async () => {
    // 1. If currently uploading, cancel the upload so it is NOT uploaded
    if (isUploadingThumbnail && thumbnailUploadAbortControllerRef.current) {
      thumbnailUploadAbortControllerRef.current.abort();
      thumbnailUploadAbortControllerRef.current = null;
      setIsUploadingThumbnail(false);
      setThumbnailUploadProgress(0);
      if (thumbnailLocalPreview) {
        URL.revokeObjectURL(thumbnailLocalPreview);
        setThumbnailLocalPreview(null);
      }
      setUploadedThumbnailFileName(null);
      setThumbnailUploadError(null);
      return;
    }

    // 2. If already uploaded, delete it from storage
    if (thumbnailLocalPreview) {
      URL.revokeObjectURL(thumbnailLocalPreview);
      setThumbnailLocalPreview(null);
    }
    const urlToDelete = topicThumbnail;
    setTopicThumbnail('');
    setUploadedThumbnailFileName(null);
    setThumbnailUploadError(null);
    if (urlToDelete && urlToDelete.startsWith('http')) {
      setIsDeletingThumbnail(true);
      try {
        await api.post('/courses/delete-media', { url: urlToDelete, provider: 'cloudinary' });
      } catch (err) {
        console.warn('Failed to delete thumbnail from storage:', err);
      } finally {
        setIsDeletingThumbnail(false);
      }
    }
  };

  const handlePdfFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type !== 'application/pdf') {
      setPdfUploadError('Please select a valid PDF file (.pdf).');
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setPdfUploadError('PDF file exceeds maximum allowed size of 50MB.');
      return;
    }

    setTopicPdfFileName(file.name);
    setIsUploadingPdf(true);
    setPdfUploadProgress(0);
    setPdfUploadError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload<{ url: string; fileName: string }>(
        '/courses/upload-media',
        formData,
        (percent) => setPdfUploadProgress(percent)
      );
      if (res && res.data && res.data.url) {
        setTopicPdfUrl(res.data.url);
        setTopicPdfFileName(res.data.fileName || file.name);
        setPdfUploadProgress(100);
      } else {
        throw new Error(res?.message || 'Failed to upload PDF document.');
      }
    } catch (err: any) {
      console.error('PDF upload failed:', err);
      setPdfUploadError(err.data?.message || err.message || 'Failed to upload PDF.');
    } finally {
      setIsUploadingPdf(false);
    }
  };

  const handleRemovePdf = async () => {
    const urlToDelete = topicPdfUrl;
    setTopicPdfUrl('');
    setTopicPdfFileName(null);
    setPdfUploadError(null);
    if (urlToDelete && urlToDelete.startsWith('http')) {
      try {
        await api.post('/courses/delete-media', { url: urlToDelete, provider: 'cloudinary' });
      } catch (err) {
        console.warn('Failed to delete PDF from storage:', err);
      }
    }
  };

  const handleRemoveVideo = async () => {
    // 1. If currently uploading, abort so it is NOT uploaded
    if (isUploadingVideo && videoUploadAbortControllerRef.current) {
      videoUploadAbortControllerRef.current.abort();
      videoUploadAbortControllerRef.current = null;
      setIsUploadingVideo(false);
      setVideoUploadProgress(0);
      setUploadedVideoFileName(null);
      setVideoUploadError(null);
      return;
    }

    // 2. If already uploaded, delete from storage
    const urlToDelete = topicVideoUrl;
    const bunnyIdToDelete = topicBunnyVideoId;
    setTopicVideoUrl('');
    setTopicBunnyVideoId(null);
    setUploadedVideoFileName(null);
    setVideoUploadError(null);
    if ((urlToDelete && urlToDelete.startsWith('http')) || bunnyIdToDelete) {
      setIsDeletingVideo(true);
      try {
        await api.post('/courses/delete-media', {
          url: urlToDelete,
          bunnyVideoId: bunnyIdToDelete,
          provider: 'bunny',
        });
      } catch (err) {
        console.warn('Failed to delete video from storage:', err);
      } finally {
        setIsDeletingVideo(false);
      }
    }
  };

  // Pre-populate if editing
  useEffect(() => {
    if (isEditing && courseId) {
      const existing = getCourse(courseId);
      if (existing) {
        const meta = {
          name: existing.name || existing.title || '',
          shortDescription: existing.shortDescription || '',
          description: existing.description || '',
          duration: existing.duration || '6 Months',
          status: existing.status,
        };
        setCourseName(meta.name);
        setShortDescription(meta.shortDescription);
        setDescription(meta.description);
        setDuration(meta.duration);
        setStatus(meta.status);
        setInitialCourseMeta(meta);
        setModules(JSON.parse(JSON.stringify(existing.modules || [])));
        setInitialModules(JSON.parse(JSON.stringify(existing.modules || [])));
      }
    }
  }, [isEditing, courseId, getCourse]);

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

  // MODULE ASSIGNMENT HANDLERS
  const openEditAssignmentModal = (modId: string) => {
    const mod = modules.find((m) => m.id === modId);
    if (!mod) return;
    setTargetModuleIdForAssignment(modId);
    if (mod.assignment) {
      setAssignmentTitle(mod.assignment.title || `Module ${mod.moduleNumber} Case Assignment`);
      setAssignmentDescription(mod.assignment.description || '');
      setAssignmentInstructionsInput(mod.assignment.instructions || '');
      setAssignmentDueDate(mod.assignment.dueDate || '');
      setAssignmentTotalMarks(mod.assignment.totalMarks || 100);
      setAssignmentPdfUrl(mod.assignment.templateFileUrl || '');
      setAssignmentPdfFileName(mod.assignment.templateFileName || null);
    } else {
      setAssignmentTitle(`Module ${mod.moduleNumber} Case Assignment`);
      setAssignmentDescription('');
      setAssignmentInstructionsInput('');
      setAssignmentDueDate('');
      setAssignmentTotalMarks(100);
      setAssignmentPdfUrl('');
      setAssignmentPdfFileName(null);
    }
    setIsUploadingAssignmentPdf(false);
    setAssignmentPdfProgress(0);
    setAssignmentPdfError(null);
    setShowAssignmentModal(true);
  };

  const handleAssignmentPdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    if (file.type !== 'application/pdf') {
      setAssignmentPdfError('Please select a valid PDF file (.pdf only).');
      return;
    }

    const MAX_SIZE = 50 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      setAssignmentPdfError('PDF file exceeds maximum allowed size of 50MB.');
      return;
    }

    setAssignmentPdfFileName(file.name);
    setIsUploadingAssignmentPdf(true);
    setAssignmentPdfProgress(0);
    setAssignmentPdfError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await api.upload<{ url: string; fileName: string }>(
        '/courses/upload-media',
        formData,
        (percent) => setAssignmentPdfProgress(percent)
      );
      if (res && res.data && res.data.url) {
        setAssignmentPdfUrl(res.data.url);
        setAssignmentPdfFileName(res.data.fileName || file.name);
        setAssignmentPdfProgress(100);
      } else {
        throw new Error(res?.message || 'Failed to upload assignment document.');
      }
    } catch (err: any) {
      console.warn('Backend upload failed, converting to Data URL fallback:', err);
      const reader = new FileReader();
      reader.onload = () => {
        setAssignmentPdfUrl(reader.result as string);
        setAssignmentPdfFileName(file.name);
        setAssignmentPdfProgress(100);
        setIsUploadingAssignmentPdf(false);
      };
      reader.onerror = () => {
        setAssignmentPdfError('Failed to read and process PDF file.');
        setIsUploadingAssignmentPdf(false);
      };
      reader.readAsDataURL(file);
      return;
    } finally {
      setIsUploadingAssignmentPdf(false);
    }
  };

  const handleRemoveAssignmentPdf = async () => {
    const urlToDelete = assignmentPdfUrl;
    setAssignmentPdfUrl('');
    setAssignmentPdfFileName(null);
    setAssignmentPdfError(null);
    if (urlToDelete && urlToDelete.startsWith('http')) {
      try {
        await api.post('/courses/delete-media', { url: urlToDelete, provider: 'cloudinary' });
      } catch (err) {
        console.warn('Failed to delete assignment PDF from storage:', err);
      }
    }
  };

  const handleSaveAssignment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetModuleIdForAssignment) return;
    if (!assignmentTitle.trim()) {
      setAssignmentPdfError('Please provide an assignment title.');
      return;
    }

    setModules((prev) =>
      prev.map((m) => {
        if (m.id === targetModuleIdForAssignment) {
          const updatedAssignment: ModuleAssignment = {
            id: m.assignment?.id || `asgn-${m.id}`,
            moduleId: m.id,
            title: assignmentTitle.trim(),
            description: assignmentDescription.trim(),
            instructions: assignmentInstructionsInput.trim(),
            totalMarks: Number(assignmentTotalMarks) || 100,
            dueDate: assignmentDueDate.trim() || undefined,
            templateFileName: assignmentPdfFileName || undefined,
            templateFileUrl: assignmentPdfUrl || undefined,
            submissionStatus: m.assignment?.submissionStatus || 'pending',
          };
          return {
            ...m,
            assignment: updatedAssignment,
          };
        }
        return m;
      })
    );

    setShowAssignmentModal(false);
  };

  // TOPIC HANDLERS
  const openAddTopicModal = (modId: string) => {
    setTargetModuleIdForTopic(modId);
    setEditingTopicId(null);
    setTopicTitle('');
    setTopicDescription('');
    setTopicContentType('theory');
    setTopicContent('');
    setTopicVideoUrl('');
    setRequiredWatchPercentage(99);
    setAssignmentInstructions('');
    setSubmissionInstructions('');
    setReferenceAttachmentName('');
    setTopicThumbnail('');
    setTopicStatus('published');
    setVideoSourceMode('url');
    setUploadedVideoFileName(null);
    setIsUploadingVideo(false);
    setVideoUploadProgress(0);
    setVideoUploadError(null);
    if (thumbnailLocalPreview) {
      URL.revokeObjectURL(thumbnailLocalPreview);
      setThumbnailLocalPreview(null);
    }
    setThumbnailSourceMode('url');
    setUploadedThumbnailFileName(null);
    setIsUploadingThumbnail(false);
    setThumbnailUploadProgress(0);
    setThumbnailUploadError(null);
    setTopicTheoryFormat('text');
    setTopicPdfUrl('');
    setTopicPdfFileName(null);
    setIsUploadingPdf(false);
    setPdfUploadProgress(0);
    setPdfUploadError(null);
    setTopicBunnyVideoId(null);
    setShowTopicModal(true);
  };

  const openEditTopicModal = (modId: string, top: Topic) => {
    if (thumbnailLocalPreview) {
      URL.revokeObjectURL(thumbnailLocalPreview);
      setThumbnailLocalPreview(null);
    }
    setTargetModuleIdForTopic(modId);
    setEditingTopicId(top.id);
    setTopicTitle(top.title);
    setTopicDescription(top.description);
    const normalizedType = ((top.contentType as string) === 'description' || top.contentType === 'theory') ? 'theory' : top.contentType;
    setTopicContentType(normalizedType);
    setTopicContent(top.content || '');
    setTopicPdfUrl(top.pdfUrl || '');
    setTopicPdfFileName(top.pdfFileName || (top.pdfUrl ? top.pdfUrl.split('/').pop() || 'Document.pdf' : null));
    setTopicTheoryFormat(top.pdfUrl ? 'pdf' : 'text');
    setIsUploadingPdf(false);
    setPdfUploadProgress(0);
    setPdfUploadError(null);
    setTopicVideoUrl(top.videoUrl || '');
    setTopicBunnyVideoId(top.bunnyVideoId || (top.videoUrl?.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1]) || null);
    setRequiredWatchPercentage(99);
    setAssignmentInstructions(top.assignmentInstructions || '');
    setSubmissionInstructions(top.submissionInstructions || '');
    setReferenceAttachmentName(top.referenceAttachmentName || '');
    setTopicThumbnail(top.thumbnail || '');
    setTopicStatus(top.status || 'published');
    setIsUploadingVideo(false);
    setVideoUploadProgress(0);
    setVideoUploadError(null);
    setIsUploadingThumbnail(false);
    setThumbnailUploadProgress(0);
    setThumbnailUploadError(null);

    // Detect if videoUrl or thumbnail is a hosted/uploaded file
    if (top.videoUrl && (top.videoUrl.includes('mediadelivery.net') || top.videoUrl.includes('bunny') || top.videoUrl.includes('b-cdn.net') || top.videoUrl.includes('cloudinary') || top.videoUrl.startsWith('data:video'))) {
      setVideoSourceMode('file');
      setUploadedVideoFileName(top.videoUrl.split('/').pop() || 'Uploaded Video');
    } else {
      setVideoSourceMode('url');
      setUploadedVideoFileName(null);
    }

    if (top.thumbnail && (top.thumbnail.includes('cloudinary') || top.thumbnail.startsWith('data:image'))) {
      setThumbnailSourceMode('file');
      setUploadedThumbnailFileName(top.thumbnail.split('/').pop() || 'Uploaded Thumbnail');
    } else {
      setThumbnailSourceMode('url');
      setUploadedThumbnailFileName(null);
    }

    setShowTopicModal(true);
  };

  const handleSaveTopic = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topicTitle.trim() || !targetModuleIdForTopic) return;
    if (isUploadingVideo || isUploadingThumbnail || isUploadingPdf) return;

    const extractedBunnyId = topicContentType === 'video' ? (topicBunnyVideoId || (topicVideoUrl?.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1]) || undefined) : undefined;

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
                  content: topicContent.trim() ? topicContent : undefined,
                  pdfUrl: topicPdfUrl || undefined,
                  pdfFileName: topicPdfFileName || undefined,
                  videoUrl: topicContentType === 'video' ? topicVideoUrl : undefined,
                  bunnyVideoId: extractedBunnyId,
                  requiredWatchPercentage: topicContentType === 'video' ? 99 : undefined,
                  assignmentInstructions: topicContentType === 'assignment' ? (assignmentInstructions.trim() || undefined) : undefined,
                  submissionInstructions: topicContentType === 'assignment' ? (submissionInstructions.trim() || undefined) : undefined,
                  referenceAttachmentName: topicContentType === 'assignment' ? (referenceAttachmentName.trim() || undefined) : undefined,
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
              content: topicContent.trim() ? topicContent : undefined,
              pdfUrl: topicPdfUrl || undefined,
              pdfFileName: topicPdfFileName || undefined,
              videoUrl: topicContentType === 'video' ? topicVideoUrl : undefined,
              bunnyVideoId: extractedBunnyId,
              requiredWatchPercentage: topicContentType === 'video' ? 99 : undefined,
              assignmentInstructions: topicContentType === 'assignment' ? (assignmentInstructions.trim() || undefined) : undefined,
              submissionInstructions: topicContentType === 'assignment' ? (submissionInstructions.trim() || undefined) : undefined,
              referenceAttachmentName: topicContentType === 'assignment' ? (referenceAttachmentName.trim() || undefined) : undefined,
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
    // Delete associated media from cloud storage if uploaded
    const targetModule = modules.find((m) => m.id === modId);
    const targetTopic = targetModule?.topics.find((t) => t.id === topicId);
    if (targetTopic) {
      if (targetTopic.videoUrl || targetTopic.bunnyVideoId) {
        api.post('/courses/delete-media', {
          url: targetTopic.videoUrl,
          bunnyVideoId: targetTopic.bunnyVideoId,
          provider: 'bunny',
        }).catch((err) => console.warn('Failed to delete video on topic delete:', err));
      }
      if (targetTopic.thumbnail && targetTopic.thumbnail.includes('cloudinary')) {
        api.post('/courses/delete-media', {
          url: targetTopic.thumbnail,
          provider: 'cloudinary',
        }).catch((err) => console.warn('Failed to delete thumbnail on topic delete:', err));
      }
    }

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
  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!courseName.trim()) {
      setValidationError('Please enter a Course Name.');
      return;
    }

    if (!description.trim()) {
      setValidationError('Please enter a Course Description.');
      return;
    }

    if (modules.length === 0) {
      setValidationError('Please add at least 1 module to the course curriculum.');
      return;
    }

    setIsSaving(true);

    try {
      if (isEditing && courseId) {
        // 1. Update Course metadata ONLY IF CHANGED
        const isCourseMetaChanged = !initialCourseMeta ||
          courseName.trim() !== initialCourseMeta.name.trim() ||
          (shortDescription || '').trim() !== (initialCourseMeta.shortDescription || '').trim() ||
          description.trim() !== initialCourseMeta.description.trim() ||
          duration.trim() !== initialCourseMeta.duration.trim() ||
          status !== initialCourseMeta.status;

        if (isCourseMetaChanged) {
          await api.put(`/courses/${courseId}`, {
            title: courseName,
            shortDescription: shortDescription || null,
            description,
            duration,
            status: status === 'draft' ? 'DRAFT' : 'PUBLISHED',
          });
        }

        // 2. Identify deleted modules and delete them from DB
        const currentModuleIds = new Set(modules.map((m) => m.id));
        for (const initialMod of initialModules) {
          if (!currentModuleIds.has(initialMod.id) && !initialMod.id.startsWith('mod-')) {
            try {
              await api.delete(`/courses/modules/${initialMod.id}`);
            } catch (err) {
              console.warn(`Could not delete module ${initialMod.id}:`, err);
            }
          }
        }

        // 3. Process current modules (Create new ones, update existing ones ONLY IF CHANGED)
        for (let modIdx = 0; modIdx < modules.length; modIdx++) {
          const mod = modules[modIdx];
          let activeModId = mod.id;

          if (mod.id.startsWith('mod-')) {
            // New Module -> Create in DB
            const modRes = await api.post(`/courses/${courseId}/modules`, {
              title: mod.title,
              subtitle: mod.subtitle || null,
              description: mod.description || null,
              duration: mod.duration || '2h 00m',
              durationMinutes: 120,
              cmeCredits: mod.cmeCredits ?? 4,
              status: mod.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
            });
            activeModId = modRes.data.id;
          } else {
            // Check if existing module has actually changed
            const initialMod = initialModules.find((im) => im.id === mod.id);
            const isModuleChanged = !initialMod ||
              initialMod.title !== mod.title ||
              (initialMod.subtitle || '') !== (mod.subtitle || '') ||
              (initialMod.description || '') !== (mod.description || '') ||
              initialMod.order !== (modIdx + 1) ||
              initialMod.status !== mod.status ||
              initialMod.duration !== mod.duration ||
              initialMod.cmeCredits !== mod.cmeCredits;

            if (isModuleChanged) {
              await api.put(`/courses/modules/${mod.id}`, {
                title: mod.title,
                subtitle: mod.subtitle || null,
                description: mod.description || null,
                duration: mod.duration || '2h 00m',
                cmeCredits: mod.cmeCredits ?? 4,
                order: modIdx + 1,
                status: mod.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
              });
            }
          }

          // Handle deleted topics within this module
          const initialMod = initialModules.find((im) => im.id === mod.id);
          if (initialMod) {
            const currentTopicIds = new Set(mod.topics.map((t) => t.id));
            for (const initTop of initialMod.topics) {
              if (!currentTopicIds.has(initTop.id) && !initTop.id.startsWith('t-')) {
                try {
                  await api.delete(`/courses/topics/${initTop.id}`);
                } catch (topDelErr) {
                  console.warn(`Could not delete topic ${initTop.id}:`, topDelErr);
                }
              }
            }
          }

          // Create or update topics ONLY IF CHANGED
          for (let topIdx = 0; topIdx < mod.topics.length; topIdx++) {
            const top = mod.topics[topIdx];
            const extractedBunnyId = top.bunnyVideoId || (top.videoUrl?.match(/embed\/\d+\/([a-zA-Z0-9-]+)/)?.[1]) || null;
            const newType = top.contentType === 'video' ? 'VIDEO_STREAM' : (top.contentType === 'assignment' ? 'DOWNLOADABLE_BRIEF' : 'PROTECTED_DOCUMENT');

            if (top.id.startsWith('t-')) {
              // New Topic -> Create in DB
              await api.post(`/courses/modules/${activeModId}/topics`, {
                title: top.title,
                description: top.description || null,
                type: newType,
                videoUrl: top.videoUrl || null,
                bunnyVideoId: extractedBunnyId,
                content: top.content || null,
                fileUrl: top.pdfUrl || null,
                status: top.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
              });
            } else {
              // Check if topic actually changed compared to initial state
              const initTop = initialMod?.topics.find((it) => it.id === top.id);
              const isTopicChanged = !initTop ||
                initTop.title !== top.title ||
                (initTop.description || '') !== (top.description || '') ||
                initTop.contentType !== top.contentType ||
                (initTop.content || '') !== (top.content || '') ||
                (initTop.pdfUrl || '') !== (top.pdfUrl || '') ||
                (initTop.videoUrl || '') !== (top.videoUrl || '') ||
                (initTop.bunnyVideoId || '') !== (extractedBunnyId || '') ||
                initTop.order !== (topIdx + 1) ||
                initTop.status !== top.status;

              if (isTopicChanged) {
                await api.put(`/courses/topics/${top.id}`, {
                  title: top.title,
                  description: top.description || null,
                  type: newType,
                  videoUrl: top.videoUrl || null,
                  bunnyVideoId: extractedBunnyId,
                  content: top.content || null,
                  fileUrl: top.pdfUrl || null,
                  order: topIdx + 1,
                  status: top.status === 'draft' ? 'DRAFT' : 'PUBLISHED',
                });
              }
            }
          }

          // Save or update Module Assignment ONLY IF CHANGED or new
          if (mod.assignment) {
            const initialMod = initialModules.find((im) => im.id === mod.id);
            const initAsgn = initialMod?.assignment;
            const curAsgn = mod.assignment;

            const isAssignmentChanged = !initAsgn ||
              (initAsgn.title || '') !== (curAsgn.title || '') ||
              (initAsgn.description || '') !== (curAsgn.description || '') ||
              (initAsgn.instructions || '') !== (curAsgn.instructions || '') ||
              (initAsgn.totalMarks || 100) !== (curAsgn.totalMarks || 100) ||
              (initAsgn.dueDate || '') !== (curAsgn.dueDate || '') ||
              (initAsgn.templateFileName || '') !== (curAsgn.templateFileName || '') ||
              (initAsgn.templateFileUrl || '') !== (curAsgn.templateFileUrl || '');

            if (isAssignmentChanged || mod.id.startsWith('mod-')) {
              try {
                await api.put(`/courses/modules/${activeModId}/assignment`, {
                  title: curAsgn.title,
                  description: curAsgn.description || null,
                  instructions: curAsgn.instructions || '',
                  maxScore: curAsgn.totalMarks || 100,
                  dueDate: curAsgn.dueDate || null,
                  templateFileName: curAsgn.templateFileName || null,
                  templateFileUrl: curAsgn.templateFileUrl || null,
                });
              } catch (asgnErr) {
                console.warn(`Could not save assignment for module ${activeModId}:`, asgnErr);
              }
            }
          }
        }

        // Sync modules with client context and local cache without duplicate backend PUT
        await updateCourse(courseId, {
          name: courseName,
          title: courseName,
          shortDescription,
          description,
          duration,
          status,
          modules,
        }, false);

        await refreshCourses();
        navigate(`/admin/courses/${courseId}`);
      } else {
        // Create new course with modules and topics through CourseContext.addCourse
        const coursePayload = {
          name: courseName,
          shortDescription,
          description,
          duration,
          status,
          modules,
        };

        const created = await addCourse(coursePayload);
        await refreshCourses();
        navigate(`/admin/courses/${created.id}`);
      }
    } catch (err: any) {
      console.error('Failed to save course:', err);
      const msg = err.data?.message || err.message || 'An error occurred while saving the course to the database.';
      setValidationError(msg);
    } finally {
      setIsSaving(false);
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
                <span>Add Module</span>
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
                            <span>Topic</span>
                          </button>
                        </div>
                      </div>

                      {/* Topics List within Module */}
                      <div className="space-y-3 pl-2 sm:pl-4">
                        {mod.topics.length === 0 ? (
                          <div className="p-4 bg-slate-50 border border-dashed border-slate-300 rounded-xl text-center space-y-1">
                            <p className="text-xs font-semibold text-slate-500">No topics added to Module {mod.moduleNumber} yet.</p>
                            <p className="text-[11px] text-slate-400">Click "+ Topic" above to add topics to this module.</p>
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
                                              <span>Theory</span>
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
                                <span>Add Topic</span>
                              </button>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Tier 2: Module Assignment Card */}
                      <div className="pt-3 border-t border-slate-100 space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-extrabold uppercase tracking-wider text-[#0A192F] flex items-center space-x-1.5">
                            <span className="w-5 h-5 rounded-md bg-amber-100 text-amber-900 font-bold text-[10px] flex items-center justify-center">
                              2
                            </span>
                            <span>Module Assignment (Case Evaluation)</span>
                          </span>

                          <button
                            type="button"
                            onClick={() => openEditAssignmentModal(mod.id)}
                            className="inline-flex items-center space-x-1 text-xs font-bold text-amber-800 hover:text-amber-900 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
                          >
                            <Edit className="w-3.5 h-3.5 text-amber-600" />
                            <span>{mod.assignment ? 'Edit Assignment' : 'Configure Assignment'}</span>
                          </button>
                        </div>

                        <div className="p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/80 space-y-2 text-xs">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div className="flex items-center space-x-2 min-w-0">
                              <FileCheck className="w-4 h-4 text-amber-600 shrink-0" />
                              <span className="font-extrabold text-slate-900 truncate">
                                {mod.assignment?.title || `Module ${mod.moduleNumber} Case Assignment`}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2 shrink-0">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-amber-200 text-amber-900">
                                {mod.assignment?.totalMarks || 100} Marks
                              </span>
                              {mod.assignment?.dueDate && (
                                <span className="text-[10px] font-semibold text-slate-500">
                                  Due: {mod.assignment.dueDate}
                                </span>
                              )}
                            </div>
                          </div>

                          {mod.assignment?.description && (
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              <strong className="text-slate-700">Scenario:</strong> {mod.assignment.description}
                            </p>
                          )}

                          {mod.assignment?.instructions && (
                            <p className="text-[11px] text-slate-600 line-clamp-2">
                              <strong className="text-slate-700">Instructions:</strong> {mod.assignment.instructions}
                            </p>
                          )}

                          <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                            {mod.assignment?.templateFileUrl ? (
                              <div className="flex items-center space-x-1.5 text-emerald-800 font-bold">
                                <Paperclip className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate max-w-[260px]">
                                  {mod.assignment.templateFileName || 'Assignment_Document.pdf'}
                                </span>
                                <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-mono">
                                  PDF Attached
                                </span>
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">
                                No PDF document attached (Optional — students will read text instructions)
                              </span>
                            )}
                          </div>
                        </div>
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
              disabled={isSaving}
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 flex items-center space-x-2"
            >
              {isSaving && <Loader2 className="w-4 h-4 animate-spin text-slate-950" />}
              <span>{isSaving ? 'Saving to Database...' : (isEditing ? 'Update Course & Curriculum' : 'Save Course')}</span>
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
                  <textarea
                    rows={2}
                    value={topicDescription}
                    onChange={(e) => setTopicDescription(e.target.value)}
                    placeholder="Short summary of lesson..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 resize-y"
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
                      <option value="theory">Theory / Reading Lesson</option>
                      <option value="video">Video Lesson</option>
                      <option value="assignment">Assignment / Case Exercise</option>
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

                {/* THUMBNAIL IMAGE (DUAL-MODE: URL OR CLOUD UPLOAD) */}
                <div className="space-y-2 p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
                  <div className="flex items-center justify-between pb-1.5 border-b border-slate-200">
                    <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider flex items-center space-x-1.5">
                      <ImageIcon className="w-4 h-4 text-amber-500" />
                      <span>Thumbnail Image (Optional)</span>
                    </label>
                    <div className="flex items-center space-x-1 bg-slate-200 p-0.5 rounded-xl">
                      <button
                        type="button"
                        onClick={() => setThumbnailSourceMode('url')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          thumbnailSourceMode === 'url'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Image URL
                      </button>
                      <button
                        type="button"
                        onClick={() => setThumbnailSourceMode('file')}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          thumbnailSourceMode === 'file'
                            ? 'bg-amber-500 text-slate-950 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Upload File
                      </button>
                    </div>
                  </div>

                  {thumbnailUploadError && (
                    <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                      <span>{thumbnailUploadError}</span>
                    </div>
                  )}

                  {thumbnailSourceMode === 'url' ? (
                    <div>
                      <input
                        type="url"
                        value={topicThumbnail}
                        onChange={(e) => setTopicThumbnail(e.target.value)}
                        placeholder="https://example.com/topic-thumbnail.jpg"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  ) : (
                    <div>
                      {isUploadingThumbnail ? (
                        <div className="p-4 bg-white rounded-xl border border-amber-300 space-y-2">
                          <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                            <div className="flex items-center space-x-2">
                              <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                              <span>
                                {thumbnailUploadProgress < 100
                                  ? `Uploading thumbnail (${thumbnailUploadProgress}%)...`
                                  : 'Finalizing image upload...'}
                              </span>
                            </div>
                            <span className="font-mono text-amber-700">{thumbnailUploadProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden border border-slate-200">
                            <div
                              className="bg-amber-500 h-2 rounded-full transition-all duration-200 ease-out"
                              style={{ width: `${Math.max(5, thumbnailUploadProgress)}%` }}
                            />
                          </div>
                        </div>
                      ) : topicThumbnail ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                              <ImageIcon className="w-6 h-6 text-slate-400" />
                              {(thumbnailLocalPreview || topicThumbnail) && (
                                <img
                                  src={thumbnailLocalPreview || topicThumbnail}
                                  alt="Thumbnail preview"
                                  className="w-full h-full object-cover absolute inset-0"
                                  onError={(e) => {
                                    (e.target as HTMLElement).style.display = 'none';
                                  }}
                                />
                              )}
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-bold text-slate-800 truncate">{uploadedThumbnailFileName || 'Uploaded Thumbnail'}</p>
                              <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Uploaded successfully
                              </p>
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={isDeletingThumbnail}
                            onClick={handleRemoveThumbnail}
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-2 cursor-pointer disabled:opacity-50"
                          >
                            {isDeletingThumbnail ? 'Removing...' : 'Remove'}
                          </button>
                        </div>
                      ) : (
                        <label className="w-full p-4 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors space-y-1.5 text-center">
                          <Upload className="w-6 h-6 text-amber-600" />
                          <span className="text-xs font-bold text-slate-800">+ Select Image File (JPG, PNG, WebP)</span>
                          <span className="text-[10px] text-slate-400">Direct upload to secure storage</span>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleThumbnailFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  )}

                  {/* Thumbnail Image preview in URL mode */}
                  {thumbnailSourceMode === 'url' && topicThumbnail && (
                    <div className="flex items-center space-x-3 p-2 bg-white rounded-xl border border-slate-200">
                      <div className="w-12 h-12 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden relative">
                        <ImageIcon className="w-5 h-5 text-slate-400" />
                        <img
                          src={topicThumbnail}
                          alt="Preview"
                          className="w-full h-full object-cover absolute inset-0"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      </div>
                      <div className="min-w-0 text-xs text-slate-600 truncate">
                        <span className="font-semibold text-slate-800">Preview: </span>
                        <span className="font-mono text-[11px]">{topicThumbnail}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* CONDITIONALLY RENDER CONTENT INPUT BASED ON TYPE */}
                {topicContentType === 'theory' ? (
                  <div className="space-y-4 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                      <div>
                        <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider flex items-center space-x-1.5">
                          <FileText className="w-4 h-4 text-amber-500" />
                          <span>Theory & Reading Content *</span>
                        </label>
                        <p className="text-[11px] text-slate-500 mt-0.5">Provide reading materials as rich text notes or upload a PDF document.</p>
                      </div>

                      {/* Format Selector: Text vs PDF */}
                      <div className="flex items-center space-x-1 bg-slate-200 p-0.5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setTopicTheoryFormat('text')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            topicTheoryFormat === 'text'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <FileText className="w-3 h-3" />
                          <span>Text Format</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTopicTheoryFormat('pdf')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
                            topicTheoryFormat === 'pdf'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Upload className="w-3 h-3" />
                          <span>PDF Document</span>
                        </button>
                      </div>
                    </div>

                    {topicTheoryFormat === 'text' ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-slate-700">Lesson Text & Reading Notes *</label>
                          <span className="text-[11px] text-slate-400 font-medium">{topicContent.length} characters</span>
                        </div>
                        <textarea
                          value={topicContent}
                          onChange={(e) => setTopicContent(e.target.value)}
                          rows={8}
                          placeholder="Type or paste the complete theory lesson, educational notes, key takeaways, and references for students to read..."
                          className="w-full text-xs p-3.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed font-normal shadow-xs resize-y"
                        />
                        <p className="text-[11px] text-slate-400">Students will read through this structured text dossier directly in their course dashboard.</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <label className="block text-xs font-bold text-slate-700">PDF Document File (.pdf) *</label>
                        
                        {pdfUploadError && (
                          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center space-x-2">
                            <AlertCircle className="w-4 h-4 shrink-0" />
                            <span>{pdfUploadError}</span>
                          </div>
                        )}

                        {topicPdfUrl ? (
                          <div className="p-4 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="w-10 h-10 rounded-lg bg-amber-50 border border-amber-200 flex items-center justify-center shrink-0 text-amber-600 font-bold">
                                PDF
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{topicPdfFileName || 'Uploaded Document.pdf'}</p>
                                <a
                                  href={topicPdfUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[11px] text-amber-600 hover:text-amber-700 underline font-medium block truncate"
                                >
                                  View / Preview Document
                                </a>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={handleRemovePdf}
                              className="px-3 py-1.5 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer shrink-0 ml-3"
                            >
                              Remove PDF
                            </button>
                          </div>
                        ) : isUploadingPdf ? (
                          <div className="p-5 bg-white rounded-xl border border-amber-200 space-y-3">
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2 text-amber-700 font-semibold">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                                <span>Uploading PDF: {topicPdfFileName}</span>
                              </div>
                              <span className="font-mono font-bold text-amber-600">{pdfUploadProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                              <div
                                className="bg-amber-500 h-2 rounded-full transition-all duration-200"
                                style={{ width: `${pdfUploadProgress}%` }}
                              />
                            </div>
                          </div>
                        ) : (
                          <label className="w-full p-6 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors space-y-2 text-center group">
                            <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center group-hover:scale-105 transition-transform">
                              <Upload className="w-5 h-5 text-amber-600" />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-800 block">+ Select PDF Document (.pdf)</span>
                              <span className="text-[11px] text-slate-400">Up to 50MB. Uploads securely to course repository.</span>
                            </div>
                            <input
                              type="file"
                              accept="application/pdf"
                              onChange={handlePdfFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}

                        {/* Optional companion overview notes */}
                        <div className="pt-2">
                          <label className="block text-xs font-semibold text-slate-600 mb-1">Companion Lesson Overview (Optional)</label>
                          <textarea
                            value={topicContent}
                            onChange={(e) => setTopicContent(e.target.value)}
                            rows={3}
                            placeholder="Optional intro or instructions to accompany the PDF reading..."
                            className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed font-normal shadow-xs"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                ) : topicContentType === 'video' ? (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                      <label className="text-xs font-extrabold text-[#0A192F] uppercase tracking-wider flex items-center space-x-1.5">
                        <Video className="w-4 h-4 text-amber-500" />
                        <span>Video Source *</span>
                      </label>
                      <div className="flex items-center space-x-1 bg-slate-200 p-0.5 rounded-xl">
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode('url')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            videoSourceMode === 'url'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Video URL
                        </button>
                        <button
                          type="button"
                          onClick={() => setVideoSourceMode('file')}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            videoSourceMode === 'file'
                              ? 'bg-amber-500 text-slate-950 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          Upload File
                        </button>
                      </div>
                    </div>

                    {videoUploadError && (
                      <div className="p-2.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                        <span>{videoUploadError}</span>
                      </div>
                    )}

                    {videoSourceMode === 'url' ? (
                      <div>
                        <label className="block text-xs font-bold text-[#0A192F] mb-1">Video URL *</label>
                        <input
                          type="url"
                          value={topicVideoUrl}
                          onChange={(e) => setTopicVideoUrl(e.target.value)}
                          placeholder="https://example.com/video.mp4 or YouTube/Vimeo URL"
                          className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 font-mono text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-xs font-bold text-[#0A192F] mb-1">Upload Video File from System *</label>
                        {isUploadingVideo ? (
                          <div className="p-5 bg-white rounded-xl border border-amber-300 space-y-3.5">
                            <div className="flex items-center justify-between text-xs font-bold text-amber-900">
                              <div className="flex items-center space-x-2">
                                <Loader2 className="w-4 h-4 animate-spin text-amber-600 shrink-0" />
                                <span>
                                  {videoUploadProgress < 100
                                    ? `Uploading video file (${videoUploadProgress}%)...`
                                    : 'Processing video...'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <span className="font-mono text-xs font-black text-amber-700">
                                  {videoUploadProgress < 100 ? `${videoUploadProgress}%` : 'Processing...'}
                                </span>
                                <button
                                  type="button"
                                  onClick={handleRemoveVideo}
                                  className="text-xs font-bold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
                                >
                                  Cancel
                                </button>
                              </div>
                            </div>

                            <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                              {videoUploadProgress < 100 ? (
                                <div
                                  className="bg-gradient-to-r from-amber-500 to-amber-400 h-2.5 rounded-full transition-all duration-200 ease-out"
                                  style={{ width: `${Math.max(5, videoUploadProgress)}%` }}
                                />
                              ) : (
                                <div className="bg-gradient-to-r from-amber-500 via-amber-300 to-amber-500 h-2.5 rounded-full animate-pulse w-full" />
                              )}
                            </div>

                            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5 border-t border-slate-100">
                              <span>
                                {videoUploadProgress < 100
                                  ? 'Transferring video file. Click Cancel anytime to abort.'
                                  : 'Finalizing secure upload. Almost done...'}
                              </span>
                            </div>
                          </div>
                        ) : topicVideoUrl ? (
                          <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 min-w-0">
                              <Video className="w-5 h-5 text-amber-600 shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-slate-800 truncate">{uploadedVideoFileName || 'Video Lesson'}</p>
                                <p className="text-[10px] text-emerald-600 font-semibold flex items-center">
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Video linked successfully (DRM Protected)
                                </p>
                              </div>
                            </div>
                            <button
                              type="button"
                              disabled={isDeletingVideo}
                              onClick={handleRemoveVideo}
                              className="text-xs font-bold text-rose-600 hover:text-rose-700 ml-2 cursor-pointer disabled:opacity-50"
                            >
                              {isDeletingVideo ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        ) : (
                          <label className="w-full p-4 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors space-y-1.5 text-center">
                            <Upload className="w-6 h-6 text-amber-600" />
                            <span className="text-xs font-bold text-slate-800">+ Select Video File (MP4, WEBM, MOV)</span>
                            <span className="text-[10px] text-slate-400">Direct upload with DRM protection (up to 100MB)</span>
                            <input
                              type="file"
                              accept="video/*"
                              onChange={handleVideoFileUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    )}

                    {/* FIXED 99% WATCH REQUIREMENT (SYSTEM FIXED, NOT EDITABLE) */}
                    <div className="p-3.5 bg-amber-500/10 border border-amber-300/80 rounded-2xl flex items-center justify-between gap-3">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center shrink-0">
                          <Shield className="w-4 h-4 text-amber-700" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-extrabold text-[#0A192F]">Fixed Completion Threshold</p>
                          <p className="text-[11px] text-slate-600 font-medium">Students must watch at least 99% of this video lesson before the next topic unlocks.</p>
                        </div>
                      </div>
                      <div className="shrink-0 font-mono font-black text-xs text-amber-950 bg-amber-400/80 px-3 py-1.5 rounded-xl border border-amber-400">
                        99% Required
                      </div>
                    </div>

                    {/* VIDEO PREVIEW PLAYER (MATCHING STUDENT PLAYER EXPERIENCE) */}
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-bold text-slate-700">Video Player Preview</label>
                        {topicVideoUrl && (
                          <span className="text-[10px] font-semibold text-emerald-600 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live DRM Stream
                          </span>
                        )}
                      </div>

                      {topicVideoUrl ? (
                        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800 relative group space-y-0">
                          {/* DRM Status Chrome Bar matching MyCourse */}
                          <div className="bg-slate-900/95 text-[10px] uppercase font-mono tracking-widest text-slate-400 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-emerald-400 font-bold truncate">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1 shrink-0" />
                              <span>SECURE DRM STREAM (99% WATCH REQUIRED)</span>
                              <span className="text-slate-500 hidden sm:inline">• 256-BIT DICOM-RT ENCRYPTED</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-slate-400 shrink-0">
                              <Shield className="w-3 h-3 text-amber-400" />
                              <span>PREVIEW MODE</span>
                            </div>
                          </div>

                          {/* Responsive 16:9 Black Screen Container */}
                          <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                            {topicVideoUrl.includes('iframe.mediadelivery.net') || topicVideoUrl.includes('/embed/') ? (
                              <iframe
                                src={`${topicVideoUrl}${topicVideoUrl.includes('?') ? '&' : '?'}autoplay=false`}
                                loading="lazy"
                                className="w-full h-full border-0"
                                allow="accelerometer; gyroscope; autoplay; encrypted-media; picture-in-picture;"
                                allowFullScreen
                              />
                            ) : (
                              <video
                                src={topicVideoUrl}
                                controls
                                className="w-full h-full object-contain bg-black"
                              >
                                Your browser does not support HTML5 video playback.
                              </video>
                            )}
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-950 rounded-2xl overflow-hidden shadow-xl border border-slate-800">
                          <div className="bg-slate-900/90 text-[10px] uppercase font-mono tracking-widest text-slate-500 px-4 py-2 border-b border-slate-800 flex items-center justify-between">
                            <div className="flex items-center space-x-2 text-slate-400 font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-600 mr-1" />
                              <span>DRM STREAM PLAYER PREVIEW</span>
                            </div>
                            <div className="flex items-center space-x-1.5 text-slate-500">
                              <Shield className="w-3 h-3 text-slate-600" />
                              <span>STANDBY</span>
                            </div>
                          </div>
                          <div className="aspect-video bg-slate-950 flex flex-col items-center justify-center text-slate-500 text-xs font-mono p-6 text-center space-y-2">
                            <PlayCircle className="w-10 h-10 text-slate-700" />
                            <span className="text-slate-300 font-sans text-xs font-semibold">No video linked yet</span>
                            <span className="text-[11px] text-slate-500 font-sans">Upload a video file or enter a stream URL above to preview the secure player</span>
                          </div>
                        </div>
                      )}

                      {topicVideoUrl && (
                        <p className="text-[11px] text-slate-500 flex items-center gap-1.5 pt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                          <span>
                            <strong>Stream ready:</strong> Video is linked securely. You can save and publish your topic right away.
                          </span>
                        </p>
                      )}
                    </div>
                  </div>
                ) : (
                  /* ASSIGNMENT TOPIC INPUTS */
                  <div className="space-y-3.5 p-4 bg-amber-50/50 rounded-2xl border border-amber-200">
                    <div className="text-xs font-extrabold text-amber-900 uppercase tracking-wider border-b border-amber-200/80 pb-2">
                      Assignment Details & Instructions
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1">Assignment Instructions / Question *</label>
                      <textarea
                        rows={4}
                        required
                        value={assignmentInstructions}
                        onChange={(e) => setAssignmentInstructions(e.target.value)}
                        placeholder="Detail the case analysis task or exercise questions student must answer..."
                        className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1">Submission Guidelines / Instructions</label>
                      <input
                        type="text"
                        value={submissionInstructions}
                        onChange={(e) => setSubmissionInstructions(e.target.value)}
                        placeholder="e.g. Upload your findings PDF or type summary text below..."
                        className="w-full text-xs p-3 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 text-slate-800 font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#0A192F] mb-1">Optional Reference Attachment File Name</label>
                      <input
                        type="text"
                        value={referenceAttachmentName}
                        onChange={(e) => setReferenceAttachmentName(e.target.value)}
                        placeholder="e.g. Case_Dataset_Reference.pdf"
                        className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 text-slate-800 font-mono"
                      />
                    </div>

                    {/* Optional Reference Worksheet / Guidelines PDF */}
                    <div className="pt-2 border-t border-amber-200/80 space-y-2">
                      <label className="block text-xs font-bold text-[#0A192F]">Reference Document / Worksheet (.pdf) (Optional)</label>
                      {topicPdfUrl ? (
                        <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                          <div className="flex items-center space-x-2.5 min-w-0">
                            <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PDF</span>
                            <span className="text-xs font-medium text-slate-800 truncate">{topicPdfFileName || 'Reference_Document.pdf'}</span>
                          </div>
                          <button
                            type="button"
                            onClick={handleRemovePdf}
                            className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                          >
                            Remove
                          </button>
                        </div>
                      ) : isUploadingPdf ? (
                        <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-700 font-semibold flex items-center space-x-2">
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Uploading Reference Document ({pdfUploadProgress}%)...</span>
                        </div>
                      ) : (
                        <label className="p-3 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex items-center justify-center cursor-pointer space-x-2 text-xs text-slate-600 transition-colors">
                          <Upload className="w-4 h-4 text-amber-600" />
                          <span>+ Upload Reference Worksheet / Guide (.pdf)</span>
                          <input
                            type="file"
                            accept="application/pdf"
                            onChange={handlePdfFileUpload}
                            className="hidden"
                          />
                        </label>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    disabled={isUploadingVideo || isUploadingThumbnail}
                    onClick={() => setShowTopicModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl disabled:opacity-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingVideo || isUploadingThumbnail}
                    className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50 flex items-center"
                  >
                    {(isUploadingVideo || isUploadingThumbnail) && (
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                    )}
                    {isUploadingVideo || isUploadingThumbnail ? 'Uploading Media...' : 'Save Topic'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODULE ASSIGNMENT MODAL */}
        {showAssignmentModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 my-8">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <div className="flex items-center space-x-2">
                  <FileCheck className="w-5 h-5 text-amber-500" />
                  <h3 className="text-base font-extrabold text-[#0A192F]">
                    Configure Module Assignment
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignmentModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {assignmentPdfError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-bold flex items-center space-x-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{assignmentPdfError}</span>
                </div>
              )}

              <form onSubmit={handleSaveAssignment} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Assignment Title *</label>
                  <input
                    type="text"
                    required
                    value={assignmentTitle}
                    onChange={(e) => setAssignmentTitle(e.target.value)}
                    placeholder="e.g. Forensic PMCT Case Study Analysis"
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Case Briefing / Scenario (Optional)</label>
                  <textarea
                    rows={3}
                    value={assignmentDescription}
                    onChange={(e) => setAssignmentDescription(e.target.value)}
                    placeholder="Provide the case context or medical briefing scenario..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#0A192F] mb-1">Guidelines & Instructions *</label>
                  <textarea
                    rows={4}
                    required
                    value={assignmentInstructionsInput}
                    onChange={(e) => setAssignmentInstructionsInput(e.target.value)}
                    placeholder="Detail the analysis required, steps to complete, and submission criteria..."
                    className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Total Marks</label>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={assignmentTotalMarks}
                      onChange={(e) => setAssignmentTotalMarks(Number(e.target.value))}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-[#0A192F] mb-1">Due Date (Optional)</label>
                    <input
                      type="date"
                      value={assignmentDueDate}
                      onChange={(e) => setAssignmentDueDate(e.target.value)}
                      className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold"
                    />
                  </div>
                </div>

                {/* OPTIONAL ASSIGNMENT DOCUMENT UPLOAD (PDF ONLY) */}
                <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200/80 space-y-2">
                  <label className="block text-xs font-bold text-[#0A192F]">
                    Assignment Document / Worksheet (.pdf only) (Optional)
                  </label>
                  <p className="text-[11px] text-slate-500">
                    If attached, students can download this PDF directly from their assignment page. If omitted, no download prompt is displayed.
                  </p>

                  {assignmentPdfUrl ? (
                    <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center justify-between shadow-xs">
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">PDF</span>
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {assignmentPdfFileName || 'Assignment_Document.pdf'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleRemoveAssignmentPdf}
                        className="text-xs font-bold text-red-600 hover:text-red-700 cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  ) : isUploadingAssignmentPdf ? (
                    <div className="p-3 bg-white rounded-xl border border-amber-200 text-xs text-amber-700 font-semibold flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Uploading Assignment PDF ({assignmentPdfProgress}%)...</span>
                    </div>
                  ) : (
                    <label className="p-3 bg-white border border-dashed border-slate-300 hover:border-amber-500 rounded-xl flex items-center justify-center cursor-pointer space-x-2 text-xs text-slate-600 transition-colors">
                      <Upload className="w-4 h-4 text-amber-600" />
                      <span>+ Upload Assignment PDF (.pdf)</span>
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={handleAssignmentPdfUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="pt-2 flex justify-end space-x-2">
                  <button
                    type="button"
                    onClick={() => setShowAssignmentModal(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 text-xs font-bold rounded-xl cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isUploadingAssignmentPdf}
                    className="px-5 py-2 bg-amber-500 text-slate-950 text-xs font-black rounded-xl shadow-md cursor-pointer disabled:opacity-50"
                  >
                    Save Assignment
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
