import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { useQuestionBank } from '../../context/QuestionBankContext';
import {
  ArrowLeft,
  Edit,
  FileQuestion,
  CheckCircle2,
  Image as ImageIcon,
  Award,
  BookOpen,
  HelpCircle,
  Clock
} from 'lucide-react';

export const AdminQuestionDetail: React.FC = () => {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { getQuestion } = useQuestionBank();

  const question = questionId ? getQuestion(questionId) : undefined;

  if (!question) {
    return (
      <AdminLayout title="Question Details" subtitle="View assessment question details">
        <div className="bg-white rounded-3xl border border-slate-200/80 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto">
            <FileQuestion className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-[#0A192F]">Question Not Found</h3>
          <p className="text-xs text-slate-500">The requested question record could not be found in the repository.</p>
          <Link
            to="/admin/question-bank"
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#0A192F] text-white text-xs font-bold rounded-xl hover:bg-slate-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-amber-400" />
            <span>Return to Question Bank</span>
          </Link>
        </div>
      </AdminLayout>
    );
  }

  const getTypeTitle = (type: string) => {
    switch (type) {
      case 'single':
        return 'Single Choice (1 Correct Answer)';
      case 'multiple':
        return 'Multiple Response (Multiple Correct Answers)';
      case 'true_false':
        return 'True/False Combination (2 Statements)';
      default:
        return type;
    }
  };

  return (
    <AdminLayout title="Question Details" subtitle={`Viewing question ${question.id} associated with ${question.moduleName}`}>
      <div className="space-y-6 pb-16">
        {/* Top Action Bar */}
        <div className="flex items-center justify-between">
          <Link
            to="/admin/question-bank"
            className="inline-flex items-center space-x-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3.5 py-2 rounded-xl transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Question Bank</span>
          </Link>

          <button
            onClick={() => navigate(`/admin/question-bank/${question.id}/edit`)}
            className="inline-flex items-center space-x-2 text-xs font-black text-slate-950 bg-amber-500 hover:bg-amber-400 px-4 py-2.5 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Edit className="w-4 h-4" />
            <span>Edit Question</span>
          </button>
        </div>

        {/* Main Details Card */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          {/* Header Metadata Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">COURSE</span>
              <span className="font-bold text-[#0A192F] truncate block mt-0.5">{question.courseName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">MODULE</span>
              <span className="font-bold text-amber-800 truncate block mt-0.5">{question.moduleName}</span>
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">QUESTION TYPE</span>
              <span className="font-bold text-slate-800 block mt-0.5">{getTypeTitle(question.type)}</span>
            </div>
          </div>

          {/* Question Prompt */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">QUESTION PROMPT</span>
            <h2 className="text-base sm:text-lg font-extrabold text-[#0A192F] leading-snug">
              {question.text}
            </h2>
          </div>

          {/* Attached Image if Present */}
          {question.image && (
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">ATTACHED IMAGE</span>
              <div className="aspect-video max-w-lg bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800">
                <img src={question.image} alt="Question Attachment" className="w-full h-full object-cover" />
                <div className="absolute top-3 left-3 bg-black/80 px-2.5 py-1 rounded text-[10px] font-mono text-amber-400 border border-amber-500/30">
                  {question.imageName || 'ATTACHMENT_IMAGE.JPG'}
                </div>
              </div>
            </div>
          )}

          {/* Answer Options Breakdown (Admin View with Correct Highlight) */}
          <div className="space-y-3 pt-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              ANSWER OPTIONS & CORRECT KEY (ADMIN SPECIFICATION)
            </span>

            {/* Single Choice Options */}
            {question.type === 'single' && (
              <div className="space-y-2.5">
                {question.options?.map((opt) => {
                  const isCorrect = question.correctAnswer === opt.id;

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-[#0A192F] text-amber-400'
                      }`}>
                        {opt.label}
                      </span>
                      <div className="flex-1">
                        <p className={`font-bold ${isCorrect ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {opt.text}
                        </p>
                      </div>
                      {isCorrect && (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                          ✓ Correct Answer Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Multiple Response Options */}
            {question.type === 'multiple' && (
              <div className="space-y-2.5">
                {question.options?.map((opt) => {
                  const isCorrect = question.correctAnswers?.includes(opt.id);

                  return (
                    <div
                      key={opt.id}
                      className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs transition-all ${
                        isCorrect
                          ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30'
                          : 'bg-white border-slate-200'
                      }`}
                    >
                      <span className={`w-7 h-7 rounded-lg font-black text-xs flex items-center justify-center shrink-0 ${
                        isCorrect ? 'bg-emerald-600 text-white' : 'bg-[#0A192F] text-amber-400'
                      }`}>
                        {opt.label}
                      </span>
                      <div className="flex-1">
                        <p className={`font-bold ${isCorrect ? 'text-emerald-950' : 'text-slate-800'}`}>
                          {opt.text}
                        </p>
                      </div>
                      {isCorrect && (
                        <span className="bg-emerald-100 text-emerald-800 font-extrabold text-[10px] px-2.5 py-1 rounded-full border border-emerald-300 shrink-0">
                          ✓ Correct Answer Key
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* True/False Combination Statements */}
            {question.type === 'true_false' && (
              <div className="space-y-3">
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <strong className="text-slate-900 block mb-1">Statement 1:</strong>
                  <span className="text-slate-700 font-medium">{question.statements ? question.statements[0] : 'N/A'}</span>
                </div>
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <strong className="text-slate-900 block mb-1">Statement 2:</strong>
                  <span className="text-slate-700 font-medium">{question.statements ? question.statements[1] : 'N/A'}</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                  {[
                    { id: 'A', text: 'A. Both True' },
                    { id: 'B', text: 'B. Statement 1 True, Statement 2 False' },
                    { id: 'C', text: 'C. Statement 1 False, Statement 2 True' },
                    { id: 'D', text: 'D. Both False' },
                  ].map((combo) => {
                    const isCorrect = question.correctAnswer === combo.id;

                    return (
                      <div
                        key={combo.id}
                        className={`p-3 rounded-xl border flex items-center justify-between ${
                          isCorrect
                            ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-400/30 text-emerald-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span>{combo.text}</span>
                        {isCorrect && (
                          <span className="bg-emerald-200 text-emerald-900 font-black text-[10px] px-2 py-0.5 rounded">
                            ✓ Key
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Marks & Optional Explanation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 text-xs">
            <div className="p-4 bg-amber-50/60 rounded-2xl border border-amber-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">MARKS ALLOCATED</span>
              <p className="text-xl font-black text-amber-900 mt-0.5">{question.marks} {question.marks === 1 ? 'Mark' : 'Marks'}</p>
            </div>

            <div className="sm:col-span-2 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <span className="text-[10px] font-bold text-slate-400 uppercase">EXPLANATION</span>
              <p className="text-slate-700 font-medium mt-0.5 leading-relaxed">
                {question.explanation || 'No rationale explanation recorded for this question.'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};
