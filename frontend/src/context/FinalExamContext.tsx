import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  FinalExam,
  FinalExamQuestion,
  StudentExamHistory,
  ExamAttemptRecord,
  ExamQuestionSets
} from '../types/finalExam';
import {
  DEFAULT_EXAM_QUESTION_SETS,
  FINAL_EXAM_SET_1,
  FINAL_EXAM_SET_2,
  FINAL_EXAM_SET_3
} from '../data/mockFinalExamSets';

const LOCAL_STORAGE_KEY = 'virtual_autopsy_final_exams_v3';
const STUDENT_HISTORY_KEY = 'virtual_autopsy_student_exam_history_v2';

const DEFAULT_INITIAL_FINAL_EXAM: FinalExam = {
  id: 'final-exam-c1',
  courseId: 'course-1',
  title: 'Fellowship Final Accreditation Examination',
  description: 'Rigorous 3-stage examination evaluating comprehensive competency in virtual autopsy, post-mortem computed tomography, traumatology, and decomposition pathology.',
  duration: 45,
  totalMarks: 60,
  passPercentage: 70,
  status: 'published',
  questions: FINAL_EXAM_SET_1,
  questionSets: DEFAULT_EXAM_QUESTION_SETS,
  createdAt: '2026-10-01T00:00:00.000Z',
  updatedAt: '2026-10-01T00:00:00.000Z'
};

interface FinalExamContextType {
  finalExams: FinalExam[];
  studentExamResult: StudentExamResult | null;
  saveStudentExamResult: (result: Omit<StudentExamResult, 'submitted'>) => void;
  resetStudentExamResult: () => void;
  createFinalExam: (exam: Omit<FinalExam, 'id' | 'createdAt' | 'updatedAt' | 'totalMarks'> & { totalMarks?: number }) => FinalExam;
  updateFinalExam: (id: string, exam: Partial<FinalExam>) => void;
  deleteFinalExam: (id: string) => void;
  getFinalExamById: (id: string) => FinalExam | undefined;
  getPublishedExamByCourseId: (courseId?: string) => FinalExam | undefined;
  publishFinalExam: (id: string) => { success: boolean; error?: string };
  unpublishFinalExam: (id: string) => void;
  validateExamForPublishing: (exam: Partial<FinalExam>) => { isValid: boolean; error?: string };

  // Phase 4: Multi-Set & 3-Attempt Operations
  studentHistories: Record<string, StudentExamHistory>;
  getStudentExamHistory: (examId: string) => StudentExamHistory;
  recordExamAttempt: (examId: string, attempt: ExamAttemptRecord) => StudentExamHistory;
  resetStudentExamHistory: (examId: string) => void;
  getQuestionsForAttempt: (exam: FinalExam, attemptNum: 1 | 2 | 3) => FinalExamQuestion[];
}

const FinalExamContext = createContext<FinalExamContextType | undefined>(undefined);

export const FinalExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [finalExams, setFinalExams] = useState<FinalExam[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((e: FinalExam) => ({
            ...e,
            passPercentage: 70,
            questionSets: e.questionSets || DEFAULT_EXAM_QUESTION_SETS
          }));
        }
      }
    } catch (e) {
      console.error('Failed to load final exams from localStorage', e);
    }
    return [DEFAULT_INITIAL_FINAL_EXAM];
  });

  const [studentHistories, setStudentHistories] = useState<Record<string, StudentExamHistory>>(() => {
    try {
      const stored = localStorage.getItem(STUDENT_HISTORY_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load student exam histories from localStorage', e);
    }
    return {};
  });

  const [studentExamResult, setStudentExamResult] = useState<StudentExamResult | null>(() => {
    try {
      const stored = localStorage.getItem(RESULT_LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load student exam result from localStorage', e);
    }
    return null;
  });

  const saveStudentExamResult = (result: Omit<StudentExamResult, 'submitted'>) => {
    const newResult: StudentExamResult = {
      ...result,
      submitted: true,
      submittedAt: new Date().toISOString()
    };
    setStudentExamResult(newResult);
    try {
      localStorage.setItem(RESULT_LOCAL_STORAGE_KEY, JSON.stringify(newResult));
    } catch (e) {
      console.error('Failed to save student exam result to localStorage', e);
    }
  };

  const resetStudentExamResult = () => {
    setStudentExamResult(null);
    try {
      localStorage.removeItem(RESULT_LOCAL_STORAGE_KEY);
    } catch (e) {
      console.error('Failed to remove student exam result from localStorage', e);
    }
  };

  useEffect(() => {
    try {
      localStorage.setItem(STUDENT_HISTORY_KEY, JSON.stringify(studentHistories));
    } catch (e) {
      console.error('Failed to save student exam histories to localStorage', e);
    }
  }, [studentHistories]);


  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(finalExams));
    } catch (e) {
      console.error('Failed to save final exams to localStorage', e);
    }
  }, [finalExams]);

  const calculateTotalMarks = (questions: FinalExamQuestion[] = []): number => {
    return questions.reduce((sum, q) => sum + (Number(q.marks) || 0), 0);
  };

  const validateExamForPublishing = (exam: Partial<FinalExam>): { isValid: boolean; error?: string } => {
    if (!exam.courseId || !exam.courseId.trim()) {
      return { isValid: false, error: 'Please select a Course for the Final Exam.' };
    }
    if (!exam.title || !exam.title.trim()) {
      return { isValid: false, error: 'Please enter an Exam Title.' };
    }
    if (!exam.questions || exam.questions.length === 0) {
      return { isValid: false, error: 'Add at least one question before publishing the exam.' };
    }

    for (let i = 0; i < exam.questions.length; i++) {
      const q = exam.questions[i];
      const qNum = i + 1;

      if (!q.text || !q.text.trim()) {
        return { isValid: false, error: `Question ${qNum} is missing question text.` };
      }

      if (!q.marks || q.marks <= 0) {
        return { isValid: false, error: `Question ${qNum} must have valid marks greater than 0.` };
      }

      if (q.type === 'single-choice') {
        if (!q.options || q.options.length < 2) {
          return { isValid: false, error: `Question ${qNum} must have at least 2 options.` };
        }
        if (q.options.some(o => !o.text.trim())) {
          return { isValid: false, error: `Question ${qNum} has empty option fields.` };
        }
        if (!q.correctAnswer) {
          return { isValid: false, error: `Question ${qNum} does not have a correct answer selected.` };
        }
      } else if (q.type === 'multiple-response') {
        if (!q.options || q.options.length < 2) {
          return { isValid: false, error: `Question ${qNum} must have at least 2 options.` };
        }
        if (q.options.some(o => !o.text.trim())) {
          return { isValid: false, error: `Question ${qNum} has empty option fields.` };
        }
        if (!q.correctAnswers || q.correctAnswers.length === 0) {
          return { isValid: false, error: `Question ${qNum} must have at least one correct answer selected.` };
        }
      } else if (q.type === 'true-false-combination') {
        if (!q.statements || !q.statements.statement1.trim() || !q.statements.statement2.trim()) {
          return { isValid: false, error: `Question ${qNum} must have non-empty text for both Statement 1 and Statement 2.` };
        }
        if (!q.correctAnswer) {
          return { isValid: false, error: `Question ${qNum} does not have a correct answer selected.` };
        }
      }
    }

    return { isValid: true };
  };

  const createFinalExam = (examData: Omit<FinalExam, 'id' | 'createdAt' | 'updatedAt' | 'totalMarks'> & { totalMarks?: number }): FinalExam => {
    const newId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    const questions = (examData.questions || []).map((q, idx) => ({
      ...q,
      examId: newId,
      order: idx + 1
    }));

    const computedMarks = calculateTotalMarks(questions);

    const newExam: FinalExam = {
      ...examData,
      id: newId,
      questions,
      totalMarks: examData.totalMarks || computedMarks,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setFinalExams(prev => [newExam, ...prev]);
    return newExam;
  };

  const updateFinalExam = (id: string, examData: Partial<FinalExam>) => {
    setFinalExams(prev => prev.map(exam => {
      if (exam.id !== id) return exam;

      const questions = (examData.questions || exam.questions || []).map((q, idx) => ({
        ...q,
        examId: id,
        order: idx + 1
      }));

      const computedMarks = calculateTotalMarks(questions);

      return {
        ...exam,
        ...examData,
        questions,
        totalMarks: examData.totalMarks !== undefined ? examData.totalMarks : computedMarks,
        updatedAt: new Date().toISOString()
      };
    }));
  };

  const deleteFinalExam = (id: string) => {
    setFinalExams(prev => prev.filter(exam => exam.id !== id));
  };

  const getFinalExamById = (id: string) => {
    return finalExams.find(exam => exam.id === id);
  };

  const getPublishedExamByCourseId = (courseId?: string) => {
    if (!courseId) {
      // If no courseId specified, return first published exam
      return finalExams.find(exam => exam.status === 'published');
    }
    return finalExams.find(exam => exam.courseId === courseId && exam.status === 'published');
  };

  const publishFinalExam = (id: string): { success: boolean; error?: string } => {
    const exam = getFinalExamById(id);
    if (!exam) return { success: false, error: 'Exam not found.' };

    const validation = validateExamForPublishing(exam);
    if (!validation.isValid) {
      return { success: false, error: validation.error };
    }

    updateFinalExam(id, { status: 'published' });
    return { success: true };
  };

  const unpublishFinalExam = (id: string) => {
    updateFinalExam(id, { status: 'draft' });
  };

  const getStudentExamHistory = (examId: string): StudentExamHistory => {
    return studentHistories[examId] || {
      examId,
      status: 'not_started',
      attemptsUsed: 0,
      bestPercentage: 0,
      passed: false,
      attempts: [],
      locked: false
    };
  };

  const recordExamAttempt = (examId: string, attempt: ExamAttemptRecord): StudentExamHistory => {
    const current = getStudentExamHistory(examId);
    const updatedAttempts = [...current.attempts, attempt];
    const attemptsUsed = updatedAttempts.length;
    const hasPassed = updatedAttempts.some(a => a.passed);
    const bestPercentage = Math.max(...updatedAttempts.map(a => a.percentage), 0);

    let status: StudentExamHistory['status'] = 'in_progress';
    let locked = false;

    if (hasPassed) {
      status = 'passed';
      locked = true;
    } else if (attemptsUsed >= 3) {
      status = 'failed_attempts_exhausted';
      locked = true;
    }

    const updatedHistory: StudentExamHistory = {
      examId,
      status,
      attemptsUsed,
      bestPercentage,
      passed: hasPassed,
      attempts: updatedAttempts,
      locked
    };

    setStudentHistories(prev => ({
      ...prev,
      [examId]: updatedHistory
    }));

    return updatedHistory;
  };

  const resetStudentExamHistory = (examId: string) => {
    setStudentHistories(prev => {
      const copy = { ...prev };
      delete copy[examId];
      return copy;
    });
  };

  const getQuestionsForAttempt = (exam: FinalExam, attemptNum: 1 | 2 | 3): FinalExamQuestion[] => {
    if (exam.questionSets) {
      if (attemptNum === 1 && exam.questionSets.set1 && exam.questionSets.set1.length > 0) {
        return exam.questionSets.set1;
      }
      if (attemptNum === 2 && exam.questionSets.set2 && exam.questionSets.set2.length > 0) {
        return exam.questionSets.set2;
      }
      if (attemptNum === 3 && exam.questionSets.set3 && exam.questionSets.set3.length > 0) {
        return exam.questionSets.set3;
      }
    }
    return exam.questions || [];
  };

  return (
    <FinalExamContext.Provider
      value={{
        finalExams,
        studentExamResult,
        saveStudentExamResult,
        resetStudentExamResult,
        createFinalExam,
        updateFinalExam,
        deleteFinalExam,
        getFinalExamById,
        getPublishedExamByCourseId,
        publishFinalExam,
        unpublishFinalExam,
        validateExamForPublishing,
        studentHistories,
        getStudentExamHistory,
        recordExamAttempt,
        resetStudentExamHistory,
        getQuestionsForAttempt
      }}
    >
      {children}
    </FinalExamContext.Provider>
  );
};

export const useFinalExams = () => {
  const context = useContext(FinalExamContext);
  if (!context) {
    throw new Error('useFinalExams must be used within a FinalExamProvider');
  }
  return context;
};
