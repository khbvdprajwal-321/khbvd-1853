export type SSLCLanguageCategory = 'first_language' | 'second_language' | 'third_language';

export const SSLC_FIRST_LANGUAGES = ['Kannada', 'English', 'Urdu', 'Sanskrit', 'Hindi'] as const;

export function isSSLCFirstLanguage(value: string): value is (typeof SSLC_FIRST_LANGUAGES)[number] {
  return SSLC_FIRST_LANGUAGES.some((language) => language === value);
}

export interface SSLCChapter {
  id: string;
  subject: string;
  chapter_number: number;
  title: string;
  language: string;
  language_category: SSLCLanguageCategory | null;
  section: string | null;
  curriculum_status: 'included' | 'excluded' | 'removed';
  summary: string;
  key_points: string[];
  formulas: string[];
  literature: { story_focus?: string; poem_focus?: string };
  academic_year: string;
  lesson_content: {
    story?: string;
    important_questions?: { question: string; answer: string; explanation: string }[];
    vocabulary?: { word: string; meaning: string }[];
    exam_preparation?: string[];
    source_pdf?: string;
    source_part?: 1 | 2;
  };
  source_url: string;
  source_verified_at: string;
}

export interface SSLCPaper {
  id: string;
  subject: string;
  year: number | null;
  paper_type: 'main' | 'supplementary' | 'model' | 'topper';
  title: string;
  description: string;
  questions: { marks: number; type: string }[];
  answer_script_url: string | null;
  source_url: string;
  source_verified_at: string;
}

export const SSLC_CORE_SUBJECTS = ['Mathematics', 'Science', 'Social Science'] as const;

export function getCurrentSSLCAcademicYear(date = new Date()): string {
  const startYear = date.getMonth() >= 5 ? date.getFullYear() : date.getFullYear() - 1;
  return `${startYear}-${String(startYear + 1).slice(-2)}`;
}

export const OFFICIAL_SSLC_SOURCES = [
  'https://kseab.karnataka.gov.in/',
  'https://dsert.karnataka.gov.in/60/syllabus--curriculum/kn',
  'https://textbooks.karnataka.gov.in/',
] as const;
