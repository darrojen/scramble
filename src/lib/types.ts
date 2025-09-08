export interface Question {
  text: string;
  options: string[];
  correct: number;
}

export type QuizFormat = 'WAEC' | 'JAMB' | 'normal';