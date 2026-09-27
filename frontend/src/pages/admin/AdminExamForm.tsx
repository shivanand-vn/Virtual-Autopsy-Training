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
  Check
} from 'lucide-react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useFinalExams } from '../../context/FinalExamContext';
import { useCourses } from '../../context/CourseContext';
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
  const [duration, setDuration] = useState<number>(60);
  const [passPercentage, setPassPercentage] = useState<number>(70);
  const [status, setStatus] = useState<'draft' | 'published'>('draft');
  const [questions, setQuestions] = useState<FinalExamQuestion[]>([]);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Question Modal State
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Question Form Fields
  const [qType, setQType] = useState<FinalExamQuestionType>('single-choice');
  const [qText, setQText] = useState('');
  const [qImage, setQImage] = useState<string | undefined>(undefined);
  const [qMarks, setQMarks] = useState<number>(1);
  const [qExplanation, setQExplanation] = useState('');
  
  // Single / Multiple Response Options
  const [qOptions, setQOptions] = useState<FinalExamQuestionOption[]>([
    { id: 'opt_1', text: '' },
    { id: 'opt_2', text: '' },
    { id: 'opt_3', text: '' },
    { id: 'opt_4', text: '' }
  ]);
  const [qCorrectAnswer, setQCorrectAnswer] = useState<string>(''); // For single choice & true-false
  const [qCorrectAnswers, setQCorrectAnswers] = useState<string[]>([]); // For multiple response

  // True/False Statements
  const [qStatement1, setQStatement1] = useState('');
  const [qStatement2, setQStatement2] = useState('');

  // Populate data in edit mode
  useEffect(() => {
    if (isEditMode && examId) {
      const existing = getFinalExamById(examId);
      if (existing) {
        setCourseId(existing.courseId);
        setTitle(existing.title);
        setDescription(existing.description || '');
        setDuration(existing.duration || 60);
        setPassPercentage(existing.passPercentage || 70);
        setStatus(existing.status);
        setQuestions(existing.questions || []);
      }
    } else if (courses.length > 0 && !courseId) {
      setCourseId(courses[0].id);
    }
  }, [isEditMode, examId, getFinalExamById, courses]);

  // Recalculate total marks dynamically
  const totalMarks = questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);

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

  // Question Modal Error State
  const [modalError, setModalError] = useState<string | null>(null);

  const resetQuestionForm = () => {
    setQType('single-choice');
    setQText('');
    setQImage(undefined);
    setQMarks(1);
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
    setQMarks(q.marks || 1);
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
        { id: 'opt_2', text: '' }
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
        ? questions.find(q => q.id === editingQuestionId)?.order || questions.length + 1
        : questions.length + 1
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
        { id: 'A', text: 'Both statements are True' },
        { id: 'B', text: 'Statement 1 is True, Statement 2 is False' },
        { id: 'C', text: 'Statement 1 is False, Statement 2 is True' },
        { id: 'D', text: 'Both statements are False' }
      ];
      questionData.correctAnswer = qCorrectAnswer;
    }

    if (editingQuestionId) {
      setQuestions(prev => prev.map(q => q.id === editingQuestionId ? questionData : q));
    } else {
      setQuestions(prev => [...prev, questionData]);
    }

    setIsQuestionModalOpen(false);
    resetQuestionForm();
  };

  const handleDeleteQuestion = (id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id).map((q, idx) => ({ ...q, order: idx + 1 })));
  };

  const handleMoveQuestion = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === questions.length - 1) return;

    const newQuestions = [...questions];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const temp = newQuestions[index];
    newQuestions[index] = newQuestions[targetIndex];
    newQuestions[targetIndex] = temp;

    // Update order property
    const reordered = newQuestions.map((q, idx) => ({ ...q, order: idx + 1 }));
    setQuestions(reordered);
  };

  const handleSaveExam = (targetStatus: 'draft' | 'published') => {
    setValidationError(null);

    const examPayload = {
      courseId,
      title: title.trim(),
      description: description.trim(),
      duration: Number(duration) || 60,
      totalMarks,
      passPercentage: Number(passPercentage) || 70,
      status: targetStatus,
      questions
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
          <h3 className="font-extrabold text-base text-[#0A192F] border-b border-slate-100 pb-3">
            Final Exam Details
          </h3>

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
                placeholder="e.g. Virtual Autopsy Fellowship Final Exam"
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
                placeholder="Brief instructions or summary for candidate fellows..."
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

            {/* Pass Percentage */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Pass Percentage (%) *
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={passPercentage}
                onChange={(e) => setPassPercentage(Number(e.target.value))}
                className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Questions Builder Section */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="font-extrabold text-base text-[#0A192F]">Questions ({questions.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Total Marks: <span className="font-bold text-amber-600">{totalMarks} Pts</span>
              </p>
            </div>
            <button
              onClick={handleOpenAddQuestion}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl text-xs transition-colors shadow-sm inline-flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Question</span>
            </button>
          </div>

          {/* Question List */}
          {questions.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-300 space-y-2">
              <HelpCircle className="w-8 h-8 text-slate-400 mx-auto" />
              <p className="text-xs font-bold text-slate-600">No questions added to this final exam yet.</p>
              <p className="text-[11px] text-slate-400">Click "+ Add Question" above to add exam questions.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, idx) => (
                <div
                  key={q.id}
                  className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-3 transition-all hover:border-amber-300"
                >
                  <div className="flex items-start justify-between">
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
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
                        title="Move Up"
                      >
                        <ArrowUp className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMoveQuestion(idx, 'down')}
                        disabled={idx === questions.length - 1}
                        className="p-1.5 text-slate-600 hover:bg-slate-200 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent"
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

                  {/* Optional Image Preview (ONLY IF PRESENT) */}
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
                <h3 className="font-extrabold text-base text-[#0A192F]">
                  {editingQuestionId ? 'Edit Exam Question' : 'Add Exam Question'}
                </h3>
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

              {/* Question Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Type *
                </label>
                <select
                  value={qType}
                  onChange={(e) => {
                    const newType = e.target.value as FinalExamQuestionType;
                    setQType(newType);
                    setQCorrectAnswer('');
                    setQCorrectAnswers([]);
                  }}
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="single-choice">Single Choice (Radio)</option>
                  <option value="multiple-response">Multiple Response (Checkboxes)</option>
                  <option value="true-false-combination">True/False Combination</option>
                </select>
              </div>

              {/* Question Text */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Text *
                </label>
                <textarea
                  value={qText}
                  onChange={(e) => setQText(e.target.value)}
                  rows={3}
                  placeholder="Enter clinical vignette or exam question..."
                  className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* Optional Question Image */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                  Question Image (Optional)
                </label>
                {qImage ? (
                  <div className="space-y-2">
                    <img
                      src={qImage}
                      alt="Question preview"
                      className="max-h-40 rounded-xl border border-slate-300 object-contain bg-slate-100"
                    />
                    <button
                      type="button"
                      onClick={() => setQImage(undefined)}
                      className="text-xs font-bold text-rose-600 hover:text-rose-700 inline-flex items-center space-x-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove Image</span>
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <label className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl cursor-pointer inline-flex items-center space-x-2 border border-slate-200">
                      <ImageIcon className="w-4 h-4 text-amber-600" />
                      <span>+ Upload Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="hidden"
                      />
                    </label>
                    <span className="text-xs text-slate-400">PNG, JPG, WEBP up to 5MB</span>
                  </div>
                )}
              </div>

              {/* Question Type Options Setup */}
              {qType === 'single-choice' && (
                <div className="space-y-3">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Options & Correct Answer (Select Exactly One) *
                  </label>
                  {qOptions.map((opt, i) => (
                    <div key={opt.id} className="flex items-center space-x-3">
                      <input
                        type="radio"
                        name="single_choice_correct"
                        checked={qCorrectAnswer === opt.id}
                        onChange={() => setQCorrectAnswer(opt.id)}
                        className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[i].text = e.target.value;
                          setQOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                    </div>
                  ))}
                </div>
              )}

              {qType === 'multiple-response' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Options & Correct Answers (Select Multiple) *
                    </label>
                    <button
                      type="button"
                      onClick={() => setQOptions(prev => [...prev, { id: `opt_${Date.now()}`, text: '' }])}
                      className="text-xs font-bold text-amber-600 hover:text-amber-700"
                    >
                      + Add Option
                    </button>
                  </div>
                  {qOptions.map((opt, i) => (
                    <div key={opt.id} className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={qCorrectAnswers.includes(opt.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setQCorrectAnswers(prev => [...prev, opt.id]);
                          } else {
                            setQCorrectAnswers(prev => prev.filter(id => id !== opt.id));
                          }
                        }}
                        className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => {
                          const updated = [...qOptions];
                          updated[i].text = e.target.value;
                          setQOptions(updated);
                        }}
                        placeholder={`Option ${String.fromCharCode(65 + i)}`}
                        className="flex-1 text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      />
                      {qOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            setQOptions(prev => prev.filter(o => o.id !== opt.id));
                            setQCorrectAnswers(prev => prev.filter(id => id !== opt.id));
                          }}
                          className="text-slate-400 hover:text-rose-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {qType === 'true-false-combination' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Statement 1 *
                    </label>
                    <input
                      type="text"
                      value={qStatement1}
                      onChange={(e) => setQStatement1(e.target.value)}
                      placeholder="Enter first clinical statement..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                      Statement 2 *
                    </label>
                    <input
                      type="text"
                      value={qStatement2}
                      onChange={(e) => setQStatement2(e.target.value)}
                      placeholder="Enter second clinical statement..."
                      className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-800"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Correct Combination Answer *
                    </label>
                    <div className="space-y-2">
                      {[
                        { id: 'A', text: 'A. Both statements are True' },
                        { id: 'B', text: 'B. Statement 1 is True, Statement 2 is False' },
                        { id: 'C', text: 'C. Statement 1 is False, Statement 2 is True' },
                        { id: 'D', text: 'D. Both statements are False' }
                      ].map(choice => (
                        <label
                          key={choice.id}
                          className="flex items-center space-x-3 p-2.5 bg-slate-50 rounded-xl border border-slate-200 text-xs font-medium cursor-pointer hover:bg-amber-50/50"
                        >
                          <input
                            type="radio"
                            name="tf_combination_answer"
                            checked={qCorrectAnswer === choice.id}
                            onChange={() => setQCorrectAnswer(choice.id)}
                            className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                          />
                          <span>{choice.text}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Marks & Explanation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Marks *
                  </label>
                  <input
                    type="number"
                    min={1}
                    value={qMarks}
                    onChange={(e) => setQMarks(Number(e.target.value))}
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-bold text-slate-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                    Explanation (Optional)
                  </label>
                  <input
                    type="text"
                    value={qExplanation}
                    onChange={(e) => setQExplanation(e.target.value)}
                    placeholder="Rationale for correct answer..."
                    className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 font-medium text-slate-800"
                  />
                </div>
              </div>

              {/* Modal Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsQuestionModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveQuestion}
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-sm"
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
