import React, { useState, useEffect, useRef } from 'react';
import {
  HelpCircle,
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  X,
  Send,
  Clock,
  Eye,
  Maximize2,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { DashboardLayout } from '../../components/dashboard/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { saveSupportIssue, getMySupportIssues } from '../../lib/supportStorage';
import { SupportIssueReport } from '../../types/support';

const CATEGORY_OPTIONS = [
  'Technical Issue',
  'Account & Login',
  'Course Content',
  'Assessment & Exam',
  'Certificate',
  'Payment & Billing',
  'Other',
] as const;

export const SupportPage: React.FC = () => {
  const { user } = useAuth();
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<string>('');
  const [screenshotData, setScreenshotData] = useState<string | null>(null);
  const [screenshotName, setScreenshotName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [studentIssues, setStudentIssues] = useState<SupportIssueReport[]>([]);
  const [previewModalImage, setPreviewModalImage] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch previously submitted issues for this student
  useEffect(() => {
    if (user) {
      getMySupportIssues()
        .then((data) => setStudentIssues(data))
        .catch((err) => console.warn('[SupportPage] Failed to fetch previous issues:', err));
    }
  }, [user]);

  // Handle direct Clipboard Paste (Ctrl + V)
  useEffect(() => {
    const handlePaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const file = items[i].getAsFile();
          if (file) {
            handleImageFile(file);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handlePaste);
    return () => window.removeEventListener('paste', handlePaste);
  }, []);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setValidationError('Please upload an image file (PNG, JPG, WebP).');
      return;
    }
    // Limit to 5MB (matches backend ~7MB base64 limit)
    if (file.size > 5 * 1024 * 1024) {
      setValidationError('Screenshot file size must be less than 5MB.');
      return;
    }

    setValidationError(null);
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setScreenshotData(reader.result);
        setScreenshotName(file.name || 'clipboard-screenshot.png');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleImageFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!category) {
      setValidationError('Please select an issue category.');
      return;
    }
    if (!description.trim() || description.trim().length < 5) {
      setValidationError('Please provide a description of at least 5 characters.');
      return;
    }

    setIsSubmitting(true);
    setValidationError(null);
    setApiError(null);

    try {
      const created = await saveSupportIssue({
        studentName: user?.fullName || 'Enrolled Student',
        studentEmail: user?.email || 'student@domain.com',
        category,
        description: description.trim(),
        screenshotBase64: screenshotData || undefined,
      });

      // Track the newly created issue in local component state for student view
      setStudentIssues((prev) => [created, ...prev]);

      setDescription('');
      setCategory('');
      setScreenshotData(null);
      setScreenshotName('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err: any) {
      console.error('Failed to submit issue:', err);
      setApiError(
        err?.message || 'Failed to submit your issue report. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout headerTitle="Help & Technical Support" headerSubtitle="HELP & SUPPORT">
      <div className="max-w-4xl mx-auto space-y-6 pb-12">
        {/* Top Header Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 bg-amber-100 text-amber-900 rounded-full border border-amber-300">
              Student Assistance Desk
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-[#0A192F] mt-2">
              Report an Issue or Question
            </h1>
            <p className="text-xs text-slate-500 max-w-xl leading-relaxed">
              Facing an error, broken page, or question? Describe the problem below and optionally attach a screenshot. Our administrative team will review it and help you promptly.
            </p>
          </div>

          <div className="flex items-center space-x-3 bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-2xl shrink-0">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-10 h-10 rounded-full object-cover border border-amber-400"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-amber-500 text-slate-950 font-black text-sm flex items-center justify-center">
                {user?.fullName?.charAt(0) || 'S'}
              </div>
            )}
            <div className="text-left">
              <p className="text-[10px] uppercase font-bold text-slate-400">Reporting as</p>
              <p className="text-xs font-black text-slate-800">{user?.fullName || 'Student'}</p>
              <p className="text-[11px] text-slate-500 font-mono">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Submission Success Toast */}
        {submitSuccess && (
          <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center space-x-3 text-xs text-emerald-900 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="font-extrabold text-emerald-950">Issue Report Submitted Successfully!</p>
              <p className="text-emerald-800 text-[11px] mt-0.5">
                Our support team has received your report. You can track its status below.
              </p>
            </div>
          </div>
        )}

        {/* Validation Error Toast */}
        {validationError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{validationError}</span>
          </div>
        )}

        {/* API Error Toast */}
        {apiError && (
          <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center space-x-3 text-xs text-rose-800 animate-in fade-in duration-200">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <span className="font-bold">{apiError}</span>
          </div>
        )}

        {/* Issue Report Form Card */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Field 1: Category Selector */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center space-x-1">
                <span>Issue Category</span>
                <span className="text-rose-500 font-bold text-sm leading-none">*</span>
              </label>
              <div className="relative">
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white transition-all appearance-none cursor-pointer"
                >
                  <option value="" disabled>
                    Select a category...
                  </option>
                  {CATEGORY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>

            {/* Field 2: Issue Description */}
            <div className="space-y-1.5">
              <label className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center space-x-1">
                <span>What issue are you experiencing?</span>
                <span className="text-rose-500 font-bold text-sm leading-none">*</span>
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Example: When I click the Submit button on Quiz 4, nothing happens and the page remains stuck..."
                className="w-full px-4 py-3 text-xs bg-slate-50 border border-slate-200 rounded-2xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:bg-white resize-y transition-all"
              />
            </div>

            {/* Field 3: Screenshot Attachment with Clipboard Paste */}
            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center justify-between">
                <span className="flex items-center space-x-1">
                  <span>Attach Screenshot</span>
                  <span className="text-slate-400 font-medium text-[10px] normal-case">(optional)</span>
                </span>
                <span className="text-[10px] text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                  Ctrl + V to Paste directly
                </span>
              </label>

              {!screenshotData ? (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-300 hover:border-amber-500 bg-slate-50/60 hover:bg-amber-50/20 rounded-2xl p-6 sm:p-8 text-center cursor-pointer transition-all space-y-3 group"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileInputChange}
                    className="hidden"
                  />
                  <div className="w-12 h-12 bg-white rounded-2xl border border-slate-200 text-slate-400 group-hover:text-amber-600 flex items-center justify-center mx-auto shadow-2xs transition-colors">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">
                      Click to upload or drag & drop screenshot
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      PNG, JPG, or WebP up to 5MB. Simply upload <strong className="text-amber-700">your screenshot</strong> here.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="relative p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 max-h-72 bg-slate-900/5 flex items-center justify-center group">
                    <img
                      src={screenshotData}
                      alt="Screenshot preview"
                      className="max-h-72 w-auto object-contain rounded-lg"
                    />
                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(screenshotData)}
                        className="p-2 bg-white/90 hover:bg-white text-slate-900 rounded-xl font-bold text-xs shadow-md transition-transform hover:scale-105 inline-flex items-center space-x-1"
                      >
                        <Maximize2 className="w-3.5 h-3.5 text-slate-800" />
                        <span>Enlarge</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1 px-1">
                    <div className="flex items-center space-x-2 text-slate-600 font-medium">
                      <ImageIcon className="w-4 h-4 text-emerald-600" />
                      <span className="truncate max-w-xs">{screenshotName || 'Attached Screenshot'}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setScreenshotData(null);
                        setScreenshotName('');
                        if (fileInputRef.current) fileInputRef.current.value = '';
                      }}
                      className="text-rose-600 hover:text-rose-800 font-bold text-xs inline-flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Submit Action */}
            <div className="pt-2 flex items-center justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition-all shadow-md hover:shadow-lg flex items-center space-x-2 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isSubmitting ? 'Submitting...' : 'Submit Issue Report'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Previous Reports by This Student (tracked locally from POST responses) */}
        {studentIssues.length > 0 && (
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-8 shadow-xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#0A192F] flex items-center space-x-2">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Your Submitted Reports ({studentIssues.length})</span>
              </h3>
            </div>

            <div className="divide-y divide-slate-100">
              {studentIssues.map((issue) => (
                <div key={issue.id} className="py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-start space-x-3.5 min-w-0">
                    {/* Clickable thumbnail (if screenshot exists) */}
                    {issue.screenshotBase64 ? (
                      <button
                        type="button"
                        onClick={() => setPreviewModalImage(issue.screenshotBase64!)}
                        className="relative w-16 h-12 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 shrink-0 group cursor-pointer hover:ring-2 hover:ring-amber-500"
                      >
                        <img
                          src={issue.screenshotBase64}
                          alt="Issue thumbnail"
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <Eye className="w-3.5 h-3.5 text-white" />
                        </div>
                      </button>
                    ) : (
                      <div className="w-16 h-12 rounded-xl border border-slate-200 bg-slate-100 shrink-0 flex items-center justify-center">
                        <HelpCircle className="w-5 h-5 text-slate-300" />
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 leading-relaxed">
                        {issue.description}
                      </p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                          {issue.category}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          Reported on {new Date(issue.submittedAt).toLocaleDateString()} at{' '}
                          {new Date(issue.submittedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span
                    className={`shrink-0 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider border ${issue.status === 'solved'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                      : 'bg-amber-100 text-amber-900 border-amber-300'
                      }`}
                  >
                    {issue.status === 'solved' ? '✓ Solved' : 'Pending Review'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Lightbox Screenshot Modal */}
      {previewModalImage && (
        <div
          onClick={() => setPreviewModalImage(null)}
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <span className="text-xs font-extrabold text-[#0A192F]">Screenshot Preview</span>
              <button
                type="button"
                onClick={() => setPreviewModalImage(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="rounded-2xl overflow-hidden bg-slate-950/5 flex items-center justify-center p-2 border border-slate-200">
              <img
                src={previewModalImage}
                alt="Enlarged screenshot"
                className="max-h-[70vh] w-auto object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
