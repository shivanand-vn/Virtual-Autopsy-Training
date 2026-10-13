import React, { createContext, useContext, useState, ReactNode } from 'react';
import { type BankQuestion, INITIAL_MOCK_QUESTIONS } from '../types/questionBank';

interface QuestionBankContextType {
  questions: BankQuestion[];
  addQuestion: (question: Omit<BankQuestion, 'id' | 'createdAt'>) => BankQuestion;
  updateQuestion: (id: string, updated: Partial<BankQuestion>) => void;
  deleteQuestion: (id: string) => void;
  getQuestion: (id: string) => BankQuestion | undefined;
}

const QuestionBankContext = createContext<QuestionBankContextType | undefined>(undefined);

const QB_LOCAL_STORAGE_KEY = 'va_lms_question_bank_questions';

export const QuestionBankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<BankQuestion[]>(() => {
    try {
      const saved = localStorage.getItem(QB_LOCAL_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.warn('Failed to parse question bank from localStorage', e);
    }
    return INITIAL_MOCK_QUESTIONS;
  });

  React.useEffect(() => {
    try {
      localStorage.setItem(QB_LOCAL_STORAGE_KEY, JSON.stringify(questions));
    } catch (e) {
      console.warn('Failed to save question bank to localStorage', e);
    }
  }, [questions]);

  const addQuestion = (questionData: Omit<BankQuestion, 'id' | 'createdAt'>): BankQuestion => {
    const newId = `qb-${Date.now().toString().slice(-4)}`;
    const newQuestion: BankQuestion = {
      ...questionData,
      id: newId,
      createdAt: new Date().toISOString().split('T')[0]
    };

    setQuestions((prev) => [newQuestion, ...prev]);
    return newQuestion;
  };

  const updateQuestion = (id: string, updatedData: Partial<BankQuestion>) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, ...updatedData } : q))
    );
  };

  const deleteQuestion = (id: string) => {
    setQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const getQuestion = (id: string): BankQuestion | undefined => {
    return questions.find((q) => q.id === id);
  };

  return (
    <QuestionBankContext.Provider
      value={{
        questions,
        addQuestion,
        updateQuestion,
        deleteQuestion,
        getQuestion
      }}
    >
      {children}
    </QuestionBankContext.Provider>
  );
};

export const useQuestionBank = () => {
  const context = useContext(QuestionBankContext);
  if (!context) {
    throw new Error('useQuestionBank must be used within a QuestionBankProvider');
  }
  return context;
};
