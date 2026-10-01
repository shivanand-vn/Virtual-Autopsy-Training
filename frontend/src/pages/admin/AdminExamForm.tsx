import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import {
  GraduationCap,
  ArrowLeft,
  Plus,
  Trash2,
  Edit,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  HelpCircle,
  Save,
  Check,
  Layers,
  Award
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourses } from '../../context/CourseContext';
import { DEFAULT_EXAM_QUESTION_SETS } from '../../data/mockFinalExamSets';
import type {
  FinalExamQuestion,
  FinalExamQuestionType,
  FinalExamQuestionOption
} from '../../types/finalExam';

export const AdminExamFormPage: React.FC = () => {
  const { examId } = useParams<{ examId?: string }>();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const {
    getFinalExamById,
    createFinalExam,
    updateFinalExam,
    publishFinalExam,
    validateExamForPublishing
  } = useFinalExams();

  const isEditMode = Boolean(examId);

  // Form State
  const [courseId, setCourseId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState<number>(45);
  const [passPercentage, setPassPercentage] = useState<number>(70);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [validationError, setValidationError] = useState<string | null>(null);

  // 3 Question Sets State
  const [activeSetTab, setActiveSetTab] = useState<'set1' | 'set2' | 'set3'>('set1');
  const [set1Questions, setSet1Questions] = useState<FinalExamQuestion[]>(DEFAULT_EXAM_QUESTION_SETS.set1);
  const [set2Questions, setSet2Questions] = useState<FinalExamQuestion[]>(DEFAULT_EXAM_QUESTION_SETS.set2);
  const [set3Questions, setSet3Questions] = useState<FinalExamQuestion[]>(DEFAULT_EXAM_QUESTION_SETS.set3);

  // Active set helper
  const currentSetQuestions =
    activeSetTab === 'set1' ? set1Questions : activeSetTab === 'set2' ? set2Questions : set3Questions;

  const setCurrentSetQuestions = (
    updater: FinalExamQuestion[] | ((prev: FinalExamQuestion[]) => FinalExamQuestion[])
  ) => {
    if (activeSetTab === 'set1') {
      setSet1Questions(updater);
    } else if (activeSetTab === 'set2') {
      setSet2Questions(updater);
    } else {
      setSet3Questions(updater);
    }
  };

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Question Form Fields
  const [qType, setQType] = useState<FinalExamQuestionType>('single-choice');
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState<string | undefined>(undefined);
  const [qMarks, setQMarks] = useState<number>(10);
  const [qExplanation, setQExplanation] = useState('');

  // Single / Multiple Response Options
  const [qOptions, setQOptions] = useState<FinalExamQuestionOption[]>([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
    { id: 'opt_4', text: '' }
  ]);
  const [qCorrectAnswer, setQCorrectAnswer] = useState<string>('');
  const [qCorrectAnswers, setQCorrectAnswers] = useState<string[]>([]);

  // True/False Statements
  const [qStatement1, setQStatement1] = useState('');
  const [qStatement2, setQStatement2] = useState('');

  // Question Modal Error State
  const [modalError, setModalError] = useState<string | null>(null);

  // Populate data in edit mode
  useEffect(() => {
    if (isEditMode && examId) {
      const existing = getFinalExamById(examId);
      if (existing) {
        setCourseId(existing.courseId);
        setTitle(existing.title);
        setDescription(existing.description || '');
        setDuration(existing.duration || 45);
        setPassPercentage(70); // Fixed 70% per client specification
        setStatus(existing.status);

        if (existing.questionSets) {
          setSet1Questions(existing.questionSets.set1 || []);
          setSet2Questions(existing.questionSets.set2 || []);
          setSet3Questions(existing.questionSets.set3 || []);
        } else if (existing.questions && existing.questions.length > 0) {
          setSet1Questions(existing.questions);
          setSet2Questions(DEFAULT_EXAM_QUESTION_SETS.set2);
          setSet3Questions(DEFAULT_EXAM_QUESTION_SETS.set3);
        }
      }
    } else if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [isEditMode, examId, getFinalExamById, courses]);

  // Recalculate marks dynamically for each set
  const set1Marks = set1Questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);
  const set2Marks = set2Questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);
  const set3Marks = set3Questions.reduce((sum, q) => sum + (Number(q.marks) || 10), 0);
  const totalMarks = Math.max(set1Marks, set2Marks, set3Marks, 60);

  // Handle Question Image Upload
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setQImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetQuestionForm = () => {
    setQType('single-choice');
    setQText('');
    setQImage(undefined);
    setQMarks(10);
    setQExplanation('');
    setQOptions([
      { id: 'opt_1', text: '' },
      { id: 'opt_2', text: '' },
      { id: 'opt_3', text: '' },
      { id: 'opt_4', text: '' }
    ]);
    setQCorrectAnswer('');
    setQCorrectAnswers([]);
    setQStatement1('');
    setQStatement2('');
    setEditingQuestionId(null);
    setModalError(null);
  };

  const handleOpenAddQuestion = () => {
    resetQuestionForm();
    setIsQuestionModalOpen(true);
  };

  const handleOpenEditQuestion = (q: FinalExamQuestion) => {
    setEditingQuestionId(q.id);
    setQType(q.type);
    setQText(q.text);
    setQImage(q.image);
    setQMarks(q.marks || 10);
    setQExplanation(q.explanation || '');
    setModalError(null);

    if (q.type === 'single-choice') {
      setQOptions(q.options || [
        { id: 'opt_1', text: '' },
        { id: 'opt_2', text: '' },
        { id: 'opt_3', text: '' },
        { id: 'opt_4', text: '' }
      ]);
      setQCorrectAnswer(q.correctAnswer || '');
    } else if (q.type === 'multiple-response') {
      setQOptions(q.options || [
        { id: 'opt_1', text: '' },
        { id: 'opt_2', text: '' },
        { id: 'opt_3', text: '' },
        { id: 'opt_4', text: '' }
      ]);
      setQCorrectAnswers(q.correctAnswers || []);
    } else if (q.type === 'true-false-combination') {
      setQStatement1(q.statements?.statement1 || '');
      setQStatement2(q.statements?.statement2 || '');
      setQCorrectAnswer(q.correctAnswer || '');
    }

    setIsQuestionModalOpen(true);
  };

  const handleSaveQuestion = () => {
    setModalError(null);
    if (!qText.trim()) {
      setModalError('Please enter question text.');
      return;
    }
    if (qMarks <= 0) {
      setModalError('Marks must be greater than 0.');
      return;
    }

    if (qType === 'single-choice') {
      if (qOptions.some(o => !o.text.trim())) {
        setModalError('Please fill in all option fields.');
        return;
      }
      if (!qCorrectAnswer) {
        setModalError('Please select the correct answer option.');
        return;
      }
    } else if (qType === 'multiple-response') {
      if (qOptions.some(o => !o.text.trim())) {
        setModalError('Please fill in all option fields.');
        return;
      }
      if (qCorrectAnswers.length === 0) {
        setModalError('Please select at least one correct answer.');
        return;
      }
    } else if (qType === 'true-false-combination') {
      if (!qStatement1.trim() || !qStatement2.trim()) {
        setModalError('Please enter text for both Statement 1 and Statement 2.');
        return;
      }
      if (!qCorrectAnswer) {
        setModalError('Please select the correct answer choice.');
        return;
      }
    }

    const questionData: FinalExamQuestion = {
      id: editingQuestionId || `q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      examId: examId || '',
      type: qType,
      text: qText.trim(),
      image: qImage,
      marks: qMarks,
      explanation: qExplanation.trim(),
      order: editingQuestionId
        ? currentSetQuestions.find(q => q.id === editingQuestionId)?.order || currentSetQuestions.length + 1
        : currentSetQuestions.length + 1
    };

    if (qType === 'single-choice') {
      questionData.options = qOptions;
      questionData.correctAnswer = qCorrectAnswer;
    } else if (qType === 'multiple-response') {
      questionData.options = qOptions;
      questionData.correctAnswers = qCorrectAnswers;
    } else if (qType === 'true-false-combination') {
      questionData.statements = {
        statement1: qStatement1.trim(),
        statement2: qStatement2.trim()
      };
      questionData.options = [
        { id: 'opt-1', text: 'Both Statement 1 and Statement 2 are True' },
        { id: 'opt-2', text: 'Statement 1 is True, Statement 2 is False' },
        { id: 'opt-3', text: 'Statement 1 is False, Statement 2 is True' },
        { id: 'opt-4', text: 'Both Statement 1 and Statement 2 are False' }
      ];
      questionData.correctAnswer = qCorrectAnswer;
    }

    if (editingQuestionId) {
      setCurrentSetQuestions(prev => prev.map(q => q.id === editingQuestionId ? questionData : q));
    } else {
      setCurrentSetQuestions(prev => [...prev, questionData]);
    }

    setIsQuestionModalOpen(false);
    resetQuestionForm();
  };

  const handleDeleteQuestion = (id: string) => {
    setCurrentSetQuestions(prev => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === currentSetQuestions.length - 1) return;

    const newQuestions = [...currentSetQuestions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    const reordered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    setCurrentSetQuestions(reordered);
  };

  const handleSaveExam = (targetStatus: 'draft' | 'published') => {
    setValidationError(null);

    if (targetStatus === 'published') {
      if (set1Questions.length === 0) {
        setValidationError('Question Set 1 must have at least one question.');
        return;
      }
      if (set2Questions.length === 0) {
        setValidationError('Question Set 2 must have at least one question.');
        return;
      }
      if (set3Questions.length === 0) {
        setValidationError('Question Set 3 must have at least one question.');
        return;
      }
    }

    const examPayload = {
      courseId,
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration) || 45,
      totalMarks,
      passPercentage: 70, // Strictly 70% threshold
      status: targetStatus,
      questions: set1Questions, // backward compatibility
      questionSets: {
        set1: set1Questions,
        set2: set2Questions,
        set3: set3Questions
      }
    };

    if (targetStatus === 'published') {
      const validation = validateExamForPublishing(examPayload);
      if (!validation.isValid) {
        setValidationError(validation.error || 'Invalid exam data.');
        return;
      }
    }

    if (isEditMode && examId) {
      updateFinalExam(examId, examPayload);
    } else {
      createFinalExam(examPayload);
    }

    navigate('/admin/exams');
  };

  return (
    <AdminLayout title={isEditMode ? 'Edit Final Exam' : 'Create Final Exam'} subtitle="Exams">
      <div className="space-y-6 max-w-5xl mx-auto pb-12">
        {/* Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/exams"
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Final Exams</span>
          </Link>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => handleSaveExam('draft')}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl text-xs transition-colors inline-flex items-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Save as Draft</span>
            </button>
            <button
              onClick={() => handleSaveExam('published')}
              className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Publish Exam</span>
            </button>
          </div>
        </div>

        {/* Validation Error Banner */}
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-800">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-xs font-bold">Publishing Validation Failed</h4>
              <p className="text-xs mt-0.5">{validationError}</p>
            </div>
            <button onClick={() => setValidationError(null)} className="text-rose-500 hover:text-rose-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Exam Metadata Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="font-extrabold text-base text-[#0A192F]">
              Final Exam Details & Accreditation Policy
            </h3>
            <span className="text-[10px] font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Strict 70% Pass Rule • 3-Set Dynamic Engine
            </span>
          </div>

          {courses.length === 0 ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-bold text-amber-900">
              No courses available. Create a course first in Course Management.
            </div>
          ) : null}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Course Select */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Course *
              </label>
              <select
                value={courseId}
                onChange={(e) => setCourseId(e.target.value)}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {courses.length === 0 ? (
                  <option value="">No courses available</option>
                ) : (
                  courses.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Exam Title */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Exam Title *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Fellowship Final Accreditation Examination"
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="Candidate instructions, testing scope, Daubert/evidence requirements..."
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Duration (mins) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Duration (Minutes) *
              </label>
              <input
                type="number"
                min={5}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {/* Pass Percentage (Locked at 70%) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pass Percentage (Fixed 70%) *
              </label>
              <div className="relative">
                <input
                  type="number"
                  disabled
                  value={70}
                  className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl px-3.5 py-2.5 font-black text-slate-600 cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[11px] font-bold text-emerald-700">
                  Fixed Accreditation Threshold
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3-SET TABBED QUESTION BUILDER SECTION */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-4 gap-3">
            <div>
              <h3 className="font-extrabold text-base text-[#0A192F] flex items-center space-x-2">
                <Layers className="w-5 h-5 text-amber-600" />
                <span>3-Attempt Question Bank Configurator</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Students receive Set 1 on Attempt 1, Set 2 on Attempt 2, and Set 3 on Attempt 3. Total marks: <strong className="text-amber-700">{totalMarks} Pts</strong>
              </p>
            </div>
            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question to {activeSetTab === 'set1' ? 'Set 1' : activeSetTab === 'set2' ? 'Set 2' : 'Set 3'}</span>
            </button>
          </div>

          {/* 3 TABS */}
          <div className="flex border-b border-slate-200 gap-2">
            <button
              type="button"
              onClick={() => setActiveSetTab('set1')}
              className={`px-4 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set1'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>Question Set 1 (Attempt 1)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${activeSetTab === 'set1' ? 'bg-amber-200/60 text-amber-950 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {set1Questions.length} Qs • {set1Marks} Pts
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSetTab('set2')}
              className={`px-4 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set2'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>Question Set 2 (Attempt 2)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${activeSetTab === 'set2' ? 'bg-amber-200/60 text-amber-950 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {set2Questions.length} Qs • {set2Marks} Pts
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSetTab('set3')}
              className={`px-4 py-3 text-xs font-black rounded-t-2xl transition-all border-b-2 flex items-center space-x-2 ${
                activeSetTab === 'set3'
                  ? 'border-amber-500 text-amber-900 bg-amber-50/60 shadow-xs'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50'
              }`}
            >
              <span>Question Set 3 (Attempt 3 - Final)</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold border ${activeSetTab === 'set3' ? 'bg-amber-200/60 text-amber-950 border-amber-300' : 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                {set3Questions.length} Qs • {set3Marks} Pts
              </span>
            </button>
          </div>

          {/* Active Question List */}
          {currentSetQuestions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">
                No questions added to {activeSetTab === 'set1' ? 'Question Set 1' : activeSetTab === 'set2' ? 'Question Set 2' : 'Question Set 3'} yet.
              </p>
              <p className="text-[11px] text-slate-400">Click "+ Add Question" above to curate this set.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {currentSetQuestions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-3 hover:border-slate-300 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="w-7 h-7 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs rounded-xl flex items-center justify-center">
                        {String(idx + 1).padStart(2, '0')}
                      </span>
                      <span className="text-[10px] uppercase font-extrabold tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md">
                        {q.type.replace('-', ' ')}
                      </span>
                      <span className="text-xs font-bold text-amber-700">
                        {q.marks} Mark{q.marks > 1 ? 's' : ''}
                      </span>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleMoveQuestion(idx, 'up')}
                        disabled={idx === 0}
                        className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(idx, 'down')}
                        disabled={idx === currentSetQuestions.length - 1}
                        className="p-1.5 text-slate-500 hover:text-slate-800 disabled:opacity-30 rounded-lg hover:bg-slate-200"
                        title="Move Down"
                      >
                        <ArrowDown className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleOpenEditQuestion(q)}
                        className="p-1.5 text-amber-600 hover:bg-amber-100 rounded-lg transition-colors ml-1"
                        title="Edit Question"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteQuestion(q.id)}
                        className="p-1.5 text-rose-500 hover:bg-rose-100 rounded-lg transition-colors"
                        title="Delete Question"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Question Text */}
                  <p className="text-sm font-bold text-[#0A192F]">{q.text}</p>

                  {/* Optional Image Preview */}
                  {q.image && (
                    <div className="mt-2">
                      <img
                        src={q.image}
                        alt="Question visual vignette"
                        className="max-h-48 max-w-full rounded-xl border border-slate-300 object-contain bg-black/5"
                      />
                    </div>
                  )}

                  {/* True/False Statements */}
                  {q.type === 'true-false-combination' && q.statements && (
                    <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1 text-xs text-slate-700">
                      <p><span className="font-bold text-slate-900">Statement 1:</span> {q.statements.statement1}</p>
                      <p><span className="font-bold text-slate-900">Statement 2:</span> {q.statements.statement2}</p>
                    </div>
                  )}

                  {/* Options List */}
                  {q.options && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options.map(opt => {
                        const isCorrect =
                          q.correctAnswer === opt.id ||
                          q.correctAnswers?.includes(opt.id);

                        return (
                          <div
                            key={opt.id}
                            className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${
                              isCorrect
                                ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-bold'
                                : 'bg-white border-slate-200 text-slate-700'
                            }`}
                          >
                            <span>{opt.text}</span>
                            {isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 ml-2" />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal Question Form */}
        {isQuestionModalOpen && (
          <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-5 my-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center space-x-2">
                  <h3 className="font-extrabold text-base text-[#0A192F]">
                    {editingQuestionId ? 'Edit Exam Question' : 'Add Exam Question'}
                  </h3>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 border border-amber-300">
                    Target: {activeSetTab === 'set1' ? 'Set 1 (Attempt 1)' : activeSetTab === 'set2' ? 'Set 2 (Attempt 2)' : 'Set 3 (Attempt 3)'}
                  </span>
                </div>
                <button
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* In-UI Validation Error Alert Banner */}
              {modalError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between text-rose-800 text-xs font-bold animate-in fade-in">
                  <div className="flex items-center space-x-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                    <span>{modalError}</span>
                  </div>
                  <button onClick={() => setModalError(null)} className="text-rose-500 hover:text-rose-700">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Question Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Question Type *
                    </label>
                    <select
                      value={qType}
                      onChange={(e) => setQType(e.target.value as FinalExamQuestionType)}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="single-choice">Single Choice (1 Correct)</option>
                      <option value="multiple-response">Multiple Response (Select all)</option>
                      <option value="true-false-combination">Statement Combination (A/B/C/D)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Marks *
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={qMarks}
                      onChange={(e) => setQMarks(Number(e.target.value))}
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Question Text / Case Prompt *
                  </label>
                  <textarea
                    value={qText}
                    onChange={(e) => setQText(e.target.value)}
                    rows={3}
                    placeholder="Enter the clinical scenario or question statement..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Optional Image */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Optional PMCT Image / Scan Vignette
                  </label>
                  <div className="flex items-center space-x-3">
                    <label className="cursor-pointer px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors inline-flex items-center space-x-2">
                      <ImageIcon className="w-4 h-4 text-slate-500" />
                      <span>{qImage ? 'Replace Image' : 'Upload Image'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    {qImage && (
                      <button
                        type="button"
                        onClick={() => setQImage(undefined)}
                        className="text-xs text-rose-600 hover:text-rose-800 font-bold"
                      >
                        Remove Image
                      </button>
                    )}
                  </div>
                  {qImage && (
                    <div className="mt-2 p-2 bg-slate-50 rounded-xl border border-slate-200 inline-block">
                      <img src={qImage} alt="Preview" className="max-h-32 rounded-lg object-contain" />
                    </div>
                  )}
                </div>

                {/* Conditional statement inputs for true-false-combination */}
                {qType === 'true-false-combination' && (
                  <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800">Statement Configuration</h4>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Statement 1 *</label>
                      <input
                        type="text"
                        value={qStatement1}
                        onChange={(e) => setQStatement1(e.target.value)}
                        placeholder="e.g. Statement 1: Multiphase PMCTA requires arterial and venous cannulation."
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Statement 2 *</label>
                      <input
                        type="text"
                        value={qStatement2}
                        onChange={(e) => setQStatement2(e.target.value)}
                        placeholder="e.g. Statement 2: Contrast extravasation confirms vascular tear."
                        className="w-full text-xs bg-white border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-medium"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Correct Answer Combination *</label>
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                          { id: 'opt-1', label: 'Both Statements are True' },
                          { id: 'opt-2', label: 'Statement 1 True, Statement 2 False' },
                          { id: 'opt-3', label: 'Statement 1 False, Statement 2 True' },
                          { id: 'opt-4', label: 'Both Statements are False' }
                        ].map((c) => (
                          <button
                            key={c.id}
                            type="button"
                            onClick={() => setQCorrectAnswer(c.id)}
                            className={`p-2.5 rounded-xl border text-left font-bold transition-all ${
                              qCorrectAnswer === c.id
                                ? 'bg-amber-100 border-amber-400 text-amber-950 ring-1 ring-amber-400'
                                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            {c.label}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Single Choice Options */}
                {qType === 'single-choice' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Options & Correct Answer (Select radio for correct answer) *
                    </label>
                    <div className="space-y-2">
                      {qOptions.map((opt, idx) => (
                        <div key={opt.id} className="flex items-center space-x-2">
                          <input
                            type="radio"
                            name="correctAnswerOption"
                            checked={qCorrectAnswer === opt.id}
                            onChange={() => setQCorrectAnswer(opt.id)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={opt.text}
                            onChange={(e) => {
                              const updated = [...qOptions];
                              updated[idx].text = e.target.value;
                              setQOptions(updated);
                            }}
                            placeholder={`Option ${idx + 1}`}
                            className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Multiple Response Options */}
                {qType === 'multiple-response' && (
                  <div className="space-y-3">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Options & Correct Answers (Check all that apply) *
                    </label>
                    <div className="space-y-2">
                      {qOptions.map((opt, idx) => {
                        const isChecked = qCorrectAnswers.includes(opt.id);
                        return (
                          <div key={opt.id} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setQCorrectAnswers(qCorrectAnswers.filter(id => id !== opt.id));
                                } else {
                                  setQCorrectAnswers([...qCorrectAnswers, opt.id]);
                                }
                              }}
                              className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500 cursor-pointer"
                            />
                            <input
                              type="text"
                              value={opt.text}
                              onChange={(e) => {
                                const updated = [...qOptions];
                                updated[idx].text = e.target.value;
                                setQOptions(updated);
                              }}
                              placeholder={`Option ${idx + 1}`}
                              className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800"
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Pathological Rationale & Explanation
                  </label>
                  <textarea
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    rows={2}
                    placeholder="Provide diagnostic feedback explaining the correct forensic answer..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold rounded-xl transition-colors shadow-sm"
                >
                  {editingQuestionId ? 'Update Question' : 'Save Question'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
