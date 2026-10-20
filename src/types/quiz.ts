export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number; // index of the correct option
  feedback: string;
}

export interface Quiz {
  mloId: string;
  questions: QuizQuestion[];
}
