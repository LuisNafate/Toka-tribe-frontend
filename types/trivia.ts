export interface Option {
  answerId: string;
  text: string;
}

export interface Question {
  questionId: string;
  text: string;
  category: string;
  options: Option[];
  correctAnswerId: string;
  pointsBase: number;
  timeBonusMax: number;
}

export interface UserAnswer {
  questionId: string;
  selectedAnswerId: string;
  timeSpent: number; // seconds elapsed when answer was submitted
  isCorrect: boolean;
  pointsBase: number;
  timeBonusMax: number;
}

export interface TriviaResult {
  answers: UserAnswer[];
  baseScore: number;
  finalScore: number;
  multiplier: number;
  correctCount: number;
  totalQuestions: number;
  coupon: Coupon | null;
}

export interface Coupon {
  code: string;
  discount: string;
  store: string;
  minPoints: number;
}
