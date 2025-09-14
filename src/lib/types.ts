export interface Question {
  text: string;
  options: string[];
  correct: number;
}

export type QuizFormat = 'WAEC' | 'JAMB' | 'normal';



export type QuizScoreRow = {
  id: string;
  points: number;
  student_id: string;
  quiz_id: string;
  taken_at: string;
  exam_type: string;
  celebrated_bronze: boolean;
  celebrated_silver: boolean;
  celebrated_gold: boolean;
  celebrated_platinum: boolean;
  celebrated_diamond: boolean;
  celebrated_palladium: boolean;
};



