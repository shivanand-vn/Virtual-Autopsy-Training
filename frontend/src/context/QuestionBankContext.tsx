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

export const QuestionBankProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [questions, setQuestions] = useState<BankQuestion[]>(INITIAL_MOCK_QUESTIONS);

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
