import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useQuestionBank } from '../../context/QuestionBankContext';
import { useCourse } from '../../context/CourseContext';
import {
  type QuestionType,
  type QuestionOption,
  type BankQuestion
} from '../../types/questionBank';
import {
  Plus,
  Trash2,
  Upload,
  Image as ImageIcon,
  Eye,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  X,
  Sparkles,
  HelpCircle
} from 'lucide-react';

export const AdminQuestionForm: React.FC = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId?: string }>();
  const isEditing = Boolean(questionId);
  const { addQuestion, updateQuestion, getQuestion } = useQuestionBank();
  const { courses } = useCourse();

  // Form Fields State
  const [courseId, setCourseId] = useState<string>('course-1');
  const [moduleId, setModuleId] = useState<string>('mod-3');
  const [questionType, setQuestionType] = useState<QuestionType>('single');
  const [questionText, setQuestionText] = useState<string>('');

  // Image State
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [imageName, setImageName] = useState<string | undefined>(undefined);

  // Dynamic Options for Single / Multiple Choice
  const [options, setOptions] = useState<QuestionOption[]>([
    { id: 'opt-a', label: 'A', text: '' },
    { id: 'opt-b', label: 'B', text: '' },
    { id: 'opt-c', label: 'C', text: '' },
    { id: 'opt-d', label: 'D', text: '' },
  ]);
  const [singleCorrect, setSingleCorrect] = useState<string>('');
  const [multipleCorrect, setMultipleCorrect] = useState<string[]>([]);

  // True/False Combination State
  const [statement1, setStatement1] = useState<string>('');
  const [statement2, setStatement2] = useState<string>('');
  const [tfCorrect, setTfCorrect] = useState<string>('');

  // Marks & Explanation
  const [marks, setMarks] = useState<number>(1);
  const [explanation, setExplanation] = useState<string>('');

  // Modals & Errors State
  const [validationError, setValidationError] = useState<string | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState<boolean>(false);

  // Pre-populate if editing
  useEffect(() => {
    if (isEditing && questionId) {
      const existing = getQuestion(questionId);
      if (existing) {
        setCourseId(existing.courseId);
        setModuleId(existing.moduleId);
        setQuestionType(existing.type);
        setQuestionText(existing.text);
        setImageUrl(existing.image);
        setImageName(existing.imageName);
        setMarks(existing.marks);
        setExplanation(existing.explanation || '');

        if (existing.type === 'single') {
          setOptions(existing.options || []);
          setSingleCorrect(existing.correctAnswer || '');
        } else if (existing.type === 'multiple') {
          setOptions(existing.options || []);
          setMultipleCorrect(existing.correctAnswers || []);
        } else if (existing.type === 'true_false') {
          setStatement1(existing.statements ? existing.statements[0] : '');
          setStatement2(existing.statements ? existing.statements[1] : '');
          setTfCorrect(existing.correctAnswer || '');
        }
      }
    }
  }, [isEditing, questionId]);

  const selectedCourseObj = courses.find((c) => c.id === courseId) || courses[0];
  const availableModules = selectedCourseObj ? selectedCourseObj.modules : [];

  // Re-generate Labels A, B, C, D...
  const updateOptionLabels = (opts: QuestionOption[]) => {
    return opts.map((opt, idx) => ({
      ...opt,
      label: String.fromCharCode(65 + idx)
    }));
  };

  const handleAddOption = () => {
    const nextChar = String.fromCharCode(65 + options.length);
    const newOpt: QuestionOption = {
      id: `opt-${Date.now()}-${options.length + 1}`,
      label: nextChar,
      text: ''
    };
    setOptions(updateOptionLabels([...options, newOpt]));
  };

  const handleRemoveOption = (id: string) => {
    if (options.length <= 2) {
      setValidationError('A minimum of 2 options is required.');
      return;
    }
    const filtered = options.filter((o) => o.id !== id);
    setOptions(updateOptionLabels(filtered));

    if (singleCorrect === id) {
      setSingleCorrect('');
    }
    setMultipleCorrect((prev) => prev.filter((oId) => oId !== id));
  };

  const handleOptionTextChange = (id: string, text: string) => {
    setOptions((prev) =>
      prev.map((o) => (o.id === id ? { ...o, text } : o))
    );
  };

  // Mock File Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setImageName(file.name);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  const handleRemoveImage = () => {
    setImageUrl(undefined);
    setImageName(undefined);
  };

  // Form Validation & Save
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setValidationError(null);

    if (!questionText.trim()) {
      setValidationError('Please enter the question text.');
      return;
    }

    if (!courseId || !moduleId) {
      setValidationError('Please select a course and module.');
      return;
    }

    if (marks <= 0) {
      setValidationError('Please enter a positive numeric value for marks.');
      return;
    }

    const selectedCourseObj = MOCK_COURSES.find((c) => c.id === courseId);
    const selectedModuleObj = availableModules.find((m) => m.id === moduleId);

    if (questionType === 'single') {
      const emptyOpt = options.find((o) => !o.text.trim());
      if (emptyOpt) {
        setValidationError(`Option ${emptyOpt.label} text cannot be empty.`);
        return;
      }
      if (!singleCorrect) {
        setValidationError('Please select a correct answer radio button for Single Choice.');
        return;
      }
    } else if (questionType === 'multiple') {
      const emptyOpt = options.find((o) => !o.text.trim());
      if (emptyOpt) {
        setValidationError(`Option ${emptyOpt.label} text cannot be empty.`);
        return;
      }
      if (multipleCorrect.length === 0) {
        setValidationError('Please check at least one correct answer for Multiple Response.');
        return;
      }
    } else if (questionType === 'true_false') {
      if (!statement1.trim() || !statement2.trim()) {
        setValidationError('Both Statement 1 and Statement 2 are required for True/False Combination.');
        return;
      }
      if (!tfCorrect) {
        setValidationError('Please select the correct answer combination (A, B, C, or D).');
        return;
      }
    }

    const questionPayload: Omit<BankQuestion, 'id' | 'createdAt'> = {
      courseId,
      courseName: selectedCourseObj?.name || 'Advanced Virtual Autopsy Training',
      moduleId,
      moduleName: selectedModuleObj?.name || 'Module 03: Image Interpretation & Trauma Signs',
      type: questionType,
      text: questionText,
      image: imageUrl,
      imageName: imageName,
      marks: Number(marks),
      explanation: explanation.trim() ? explanation : undefined,
      status: 'active',
      ...(questionType === 'single' && {
        options,
        correctAnswer: singleCorrect
      }),
      ...(questionType === 'multiple' && {
        options,
        correctAnswers: multipleCorrect
      }),
      ...(questionType === 'true_false' && {
        statements: [statement1, statement2],
        correctAnswer: tfCorrect
      })
    };

    if (isEditing && questionId) {
      updateQuestion(questionId, questionPayload);
    } else {
      addQuestion(questionPayload);
    }

    navigate('/admin/question-bank');
  };

  return (
    <AdminLayout
      title={isEditing ? 'Edit Question' : 'Add Question'}
      subtitle={
        isEditing
          ? 'Modify assessment question details and module mapping.'
          : 'Create a question and assign it to a specific course module.'
      }
    >
      <div className="space-y-6 pb-16">
        {/* Back Link & Header Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/question-bank"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Question Bank</span>
          </Link>

          <button
            type="button"
            onClick={() => setShowPreviewModal(true)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-500 px-4 py-2 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Eye className="w-4 h-4" />
            <span>Student Preview</span>
          </button>
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

        {/* Main Form Container */}
        <form onSubmit={handleSave} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* SECTION 1: COURSE & MODULE MAPPING */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-6 border-b border-slate-100">
            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Course *</label>
              <select
                value={courseId}
                onChange={(e) => {
                  const newCourseId = e.target.value;
                  setCourseId(newCourseId);
                  const targetCourse = courses.find((c) => c.id === newCourseId);
                  if (targetCourse && targetCourse.modules.length > 0) {
                    setModuleId(targetCourse.modules[0].id);
                  } else {
                    setModuleId('');
                  }
                }}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold text-slate-800"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Module *</label>
              <select
                value={moduleId}
                onChange={(e) => setModuleId(e.target.value)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold text-slate-800"
              >
                {availableModules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Module 0{m.moduleNumber}: {m.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* SECTION 2: QUESTION TYPE & TEXT */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Question Type *</label>
              <select
                value={questionType}
                onChange={(e) => setQuestionType(e.target.value as QuestionType)}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-semibold text-slate-800"
              >
                <option value="single">Single Choice (Only 1 correct answer)</option>
                <option value="multiple">Multiple Response (Check all applicable answers)</option>
                <option value="true_false">True/False Combination (2 Statements)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Question *</label>
              <textarea
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
                rows={4}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 leading-relaxed font-medium"
                placeholder="Enter question prompt or diagnostic vignette..."
              />
            </div>

            {/* OPTIONAL QUESTION IMAGE ATTACHMENT */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold text-[#0A192F]">
                Question Image (Optional — CT Scan / Photomacrograph)
              </label>

              {imageUrl ? (
                <div className="space-y-3">
                  <div className="aspect-video max-w-sm bg-slate-950 rounded-xl overflow-hidden relative border border-slate-800">
                    <img src={imageUrl} alt="Question Preview" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex items-center space-x-3 text-xs">
                    <span className="font-mono text-slate-500 truncate max-w-xs">{imageName || 'attached_image.jpg'}</span>
                    <label className="text-amber-700 font-bold hover:underline cursor-pointer">
                      <span>Replace Image</span>
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <button
                      type="button"
                      onClick={handleRemoveImage}
                      className="text-rose-600 font-bold hover:underline cursor-pointer"
                    >
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="inline-flex items-center space-x-2 px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100 cursor-pointer shadow-2xs">
                  <Upload className="w-4 h-4 text-amber-500" />
                  <span>Upload Image (JPG, PNG, WEBP)</span>
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* SECTION 3: DYNAMIC ANSWER OPTIONS BUILDER */}
          <div className="pt-4 border-t border-slate-100 space-y-4">
            {/* SINGLE CHOICE BUILDER */}
            {questionType === 'single' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0A192F]">
                    Answer Options (Select the ONE correct answer)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {options.length} options defined
                  </span>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt) => (
                    <div key={opt.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                      <span className="w-7 h-7 rounded-lg bg-[#0A192F] text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                        {opt.label}
                      </span>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                        placeholder={`Option ${opt.label} text...`}
                        className="flex-1 text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                      />
                      <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer shrink-0">
                        <input
                          type="radio"
                          name="single-correct-group"
                          checked={singleCorrect === opt.id}
                          onChange={() => setSingleCorrect(opt.id)}
                          className="accent-amber-500 w-4 h-4"
                        />
                        <span className={singleCorrect === opt.id ? 'text-amber-800 font-black' : ''}>
                          {singleCorrect === opt.id ? '✓ Correct' : 'Correct'}
                        </span>
                      </label>
                      <button
                        type="button"
                        onClick={() => handleRemoveOption(opt.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>+ Add Option</span>
                </button>
              </div>
            )}

            {/* MULTIPLE RESPONSE BUILDER */}
            {questionType === 'multiple' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0A192F]">
                    Answer Options (Check ALL applicable correct answers)
                  </label>
                  <span className="text-[11px] text-slate-400 font-normal">
                    {options.length} options defined
                  </span>
                </div>

                <div className="space-y-2.5">
                  {options.map((opt) => {
                    const isChecked = multipleCorrect.includes(opt.id);

                    return (
                      <div key={opt.id} className="flex items-center space-x-3 bg-slate-50 p-3 rounded-2xl border border-slate-200">
                        <span className="w-7 h-7 rounded-lg bg-[#0A192F] text-amber-400 font-black text-xs flex items-center justify-center shrink-0">
                          {opt.label}
                        </span>
                        <input
                          type="text"
                          value={opt.text}
                          onChange={(e) => handleOptionTextChange(opt.id, e.target.value)}
                          placeholder={`Option ${opt.label} text...`}
                          className="flex-1 text-xs p-2 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                        />
                        <label className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 cursor-pointer shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setMultipleCorrect((prev) => [...prev, opt.id]);
                              } else {
                                setMultipleCorrect((prev) => prev.filter((id) => id !== opt.id));
                              }
                            }}
                            className="accent-amber-500 w-4 h-4"
                          />
                          <span className={isChecked ? 'text-amber-800 font-black' : ''}>
                            {isChecked ? '✓ Correct' : 'Correct'}
                          </span>
                        </label>
                        <button
                          type="button"
                          onClick={() => handleRemoveOption(opt.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleAddOption}
                  className="inline-flex items-center space-x-1.5 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3.5 py-2 rounded-xl transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-600" />
                  <span>+ Add Option</span>
                </button>
              </div>
            )}

            {/* TRUE / FALSE COMBINATION BUILDER */}
            {questionType === 'true_false' && (
              <div className="space-y-4">
                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-[#0A192F]">Statement 1 *</label>
                  <textarea
                    value={statement1}
                    onChange={(e) => setStatement1(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium"
                    placeholder="Enter first statement..."
                  />
                </div>

                <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
                  <label className="block text-xs font-bold text-[#0A192F]">Statement 2 *</label>
                  <textarea
                    value={statement2}
                    onChange={(e) => setStatement2(e.target.value)}
                    rows={2}
                    className="w-full text-xs p-2.5 rounded-xl bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800 font-medium"
                    placeholder="Enter second statement..."
                  />
                </div>

                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold text-[#0A192F]">Correct Answer Combination *</label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { id: 'A', text: 'A. Both True' },
                      { id: 'B', text: 'B. Statement 1 True, Statement 2 False' },
                      { id: 'C', text: 'C. Statement 1 False, Statement 2 True' },
                      { id: 'D', text: 'D. Both False' },
                    ].map((combo) => (
                      <label
                        key={combo.id}
                        className={`p-3 rounded-xl border flex items-center space-x-2.5 cursor-pointer transition-all ${tfCorrect === combo.id
                          ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-400/30 text-slate-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                          }`}
                      >
                        <input
                          type="radio"
                          name="tf-combo-group"
                          checked={tfCorrect === combo.id}
                          onChange={() => setTfCorrect(combo.id)}
                          className="accent-amber-500 w-4 h-4"
                        />
                        <span>{combo.text}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SECTION 4: MARKS & EXPLANATION */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Marks *</label>
              <input
                type="number"
                min={1}
                value={marks}
                onChange={(e) => setMarks(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 font-bold text-amber-900"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-[#0A192F] mb-1.5">Explanation (Optional)</label>
              <textarea
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                rows={2}
                className="w-full text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-400 text-slate-800"
                placeholder="Optional explanation shown after student submits..."
              />
            </div>
          </div>

          {/* SECTION 5: FORM ACTION BUTTONS */}
          <div className="pt-4 flex items-center justify-end space-x-3 border-t border-slate-100">
            <Link
              to="/admin/question-bank"
              className="px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {isEditing ? 'Update Question' : 'Save Question'}
            </button>
          </div>
        </form>

        {/* STUDENT-STYLE PREVIEW MODAL */}
        {showPreviewModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center space-x-2 text-xs font-bold text-amber-700 uppercase tracking-wider">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Student View Preview</span>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="text-xs text-slate-500 font-semibold">
                  Module: <span className="text-[#0A192F] font-bold">Module 03: Image Interpretation</span>
                </div>

                <h3 className="font-extrabold text-sm text-[#0A192F] leading-snug">
                  {questionText || '[ Question text preview will appear here ]'}
                </h3>

                {imageUrl && (
                  <div className="aspect-video bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 max-w-md">
                    <img src={imageUrl} alt="Preview CT Scan" className="w-full h-full object-cover" />
                  </div>
                )}

                {/* Single / Multiple Choice Preview */}
                {(questionType === 'single' || questionType === 'multiple') && (
                  <div className="space-y-2">
                    {options.map((opt) => (
                      <div
                        key={opt.id}
                        className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center space-x-3 text-xs"
                      >
                        <input
                          type={questionType === 'multiple' ? 'checkbox' : 'radio'}
                          readOnly
                          className="accent-amber-500 w-4 h-4"
                        />
                        <span className="font-bold text-slate-900">
                          {opt.label}. {opt.text || `[ Option ${opt.label} text ]`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* True / False Combination Preview */}
                {questionType === 'true_false' && (
                  <div className="space-y-3 text-xs">
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Statement 1:</strong>{' '}
                      {statement1 || '[ Statement 1 text ]'}
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                      <strong className="text-slate-900">Statement 2:</strong>{' '}
                      {statement2 || '[ Statement 2 text ]'}
                    </div>

                    <div className="space-y-1.5 pt-1">
                      {[
                        'A. Both True',
                        'B. Statement 1 True, Statement 2 False',
                        'C. Statement 1 False, Statement 2 True',
                        'D. Both False',
                      ].map((txt) => (
                        <div key={txt} className="p-2.5 rounded-xl border border-slate-200 bg-white flex items-center space-x-2">
                          <input type="radio" readOnly className="accent-amber-500 w-4 h-4" />
                          <span className="font-medium text-slate-800">{txt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between text-xs font-bold text-slate-500 border-t border-slate-100">
                  <span>Marks: {marks}</span>
                  <span className="text-amber-700 font-extrabold">Student Assessment Preview</span>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setShowPreviewModal(false)}
                  className="px-5 py-2.5 bg-[#0A192F] text-white font-bold text-xs rounded-xl hover:bg-slate-800 cursor-pointer"
                >
                  Close Preview
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};
