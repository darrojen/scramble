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


export interface userInfo{
  id: string;
  avatar_url: string | null;
  email: string | null;
  full_name: string | null;
  username: string | null;
  created_at: string | null;
}

export interface RawSender {
  id: string;
  username: string;
  avatar_url: string;
  user_type: string;
}
export interface RawMessage {
  id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  parent_message_id: string | null;
  created_at: string;
  is_read: boolean;
  sender?: RawSender[];
}