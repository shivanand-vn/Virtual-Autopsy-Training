import React, { createContext, useContext, useState, useEffect } from 'react';
import type { FinalExam, FinalExamQuestion } from '../types/finalExam';

const LOCAL_STORAGE_KEY = 'virtual_autopsy_final_exams';

interface FinalExamContextType {
  finalExams: FinalExam[];
  createFinalExam: (exam: Omit<FinalExam, 'id' | 'createdAt' | 'updatedAt' | 'totalMarks'> & { totalMarks?: number }) => FinalExam;
  updateFinalExam: (id: string, exam: Partial<FinalExam>) => void;
  deleteFinalExam: (id: string) => void;
  getFinalExamById: (id: string) => FinalExam | undefined;
  getPublishedExamByCourseId: (courseId?: string) => FinalExam | undefined;
  publishFinalExam: (id: string) => { success: boolean; error?: string };
  unpublishFinalExam: (id: string) => void;
  validateExamForPublishing: (exam: Partial<FinalExam>) => { isValid: boolean; error?: string };
}

const FinalExamContext = createContext<FinalExamContextType | undefined>(undefined);

export const FinalExamProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [finalExams, setFinalExams] = useState<FinalExam[]>(() => {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error('Failed to load final exams from localStorage', e);
    }
    return [];
  });

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

  return (
    <FinalExamContext.Provider
      value={{
        finalExams,
        createFinalExam,
        updateFinalExam,
        deleteFinalExam,
        getFinalExamById,
        getPublishedExamByCourseId,
        publishFinalExam,
        unpublishFinalExam,
        validateExamForPublishing
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
