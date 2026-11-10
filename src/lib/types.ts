export type UserType = 'puc' | 'degree' | 'school';
export type ExamStream = 'cet' | 'neet' | 'jee';
export type SubscriptionTier = 'free' | 'premium' | 'institutional';
export type ExamType = 'subject' | 'stream_practice' | 'gap_assessment' | 'homework' | 'assignment';
export type DegreeCategory = 'BE' | 'MBA' | 'Diploma';
export type ExperienceLevel = 'fresher' | 'experienced';
export type PucGroup = 'pcmb' | 'pcm' | 'commerce' | 'arts';

export interface Profile {
  id: string;
  full_name: string;
  username: string | null;
  gender: string;
  age: number;
  district: string;
  state: string;
  pincode: string;
  user_type: UserType | null;
  exam_stream: ExamStream | null;
  degree_type: string | null;
  department: string | null;
  experience_level: ExperienceLevel | null;
  current_semester: number;
  puc_year: number | null;
  puc_group: PucGroup | null;
  school_class: number | null;
  first_language: string | null;
  second_language: string | null;
  third_language: string | null;
  is_premium: boolean;
  subscription_tier: SubscriptionTier;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  user_id: string;
  exam_type: ExamType;
  subject: string;
  total_questions: number;
  correct_answers: number | null;
  score_percentage: number | null;
  difficulty_breakdown: Record<string, unknown> | null;
  question_data: Question[] | null;
  answers: Record<number, number> | null;
  started_at: string;
  completed_at: string | null;
}

export interface HomeworkTracking {
  id: string;
  user_id: string;
  subject: string;
  cycle_day: number;
  questions_target: number;
  questions_completed: number;
  status: 'pending' | 'in_progress' | 'completed';
  assigned_date: string;
  completed_at: string | null;
}

export interface ResumeAnalysis {
  id: string;
  user_id: string;
  degree_type: string;
  target_role: string;
  resume_text: string;
  identified_skills: string[];
  missing_skills: string[];
  skill_gap_score: number;
  generated_questions: Question[];
  created_at: string;
}

export interface CareerMapping {
  id: string;
  degree_type: string;
  target_role: string;
  company_examples: string[];
  required_skills: string[];
  average_salary_range: string;
}

export type Difficulty = 'easy' | 'medium' | 'difficult';

export interface Question {
  id: number;
  subject: string;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  topic: string;
  yearAsked: number | null;
}

export type PracticeTrack =
  | 'cet'
  | 'neet'
  | 'jee'
  | 'degree'
  | 'sslc'
  | 'degree-it'
  | 'degree-nonit'
  | 'business-hr'
  | 'business-operations'
  | 'business-management';

export interface PracticeQuestion {
  id: string;
  track: PracticeTrack;
  subject: string;
  chapter?: string | null;
  topic: string;
  question_type?: 'single_choice' | 'numerical_choice';
  language?: string | null;
  language_category?: 'first_language' | 'second_language' | 'third_language' | null;
  difficulty: Difficulty;
  question: string;
  options: string[];
  correct_index: number;
  explanation: string;
  year_asked: number | null;
  source_type: 'practice' | 'generated' | 'previous_year';
  source_name: string | null;
  source_url: string | null;
  source_verified_at: string | null;
  research_reference?: string | null;
}

export interface AppSession {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  loading: boolean;
}
