import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

export const PRACTICE_TRACKS: { id: PracticeTrack; label: string }[] = [
  { id: 'cet', label: 'CET' },
  { id: 'neet', label: 'NEET' },
  { id: 'jee', label: 'JEE' },
  { id: 'degree', label: 'Degree' },
  { id: 'sslc', label: 'SSLC' },
  { id: 'degree-it', label: 'Degree IT' },
  { id: 'degree-nonit', label: 'Degree Non-IT' },
  { id: 'business-hr', label: 'HR' },
  { id: 'business-operations', label: 'Operations' },
  { id: 'business-management', label: 'Business Management' },
];

export const DAILY_SET_SIZE = 5;
export const PUC_ASSIGNMENT_SET_SIZE = 5;
export const COURSE_ASSIGNMENT_SET_SIZE = 20;
export const MOCK_TEST_SIZE = 20;
export const MOCK_SECONDS_PER_QUESTION = 20;

export type PracticeMode = 'daily' | 'assignment' | 'mock';

export function isPracticeMode(value: string): value is PracticeMode {
  return value === 'daily' || value === 'assignment' || value === 'mock';
}

export function isPracticeTrack(value: string): value is PracticeTrack {
  return PRACTICE_TRACKS.some((track) => track.id === value);
}

export function filterByYear(pool: PracticeQuestion[], year: number | null): PracticeQuestion[] {
  return year === null
    ? pool
    : pool.filter((question) => isVerifiedPreviousYearQuestion(question) && question.year_asked === year);
}

export function availableYears(pool: PracticeQuestion[]): number[] {
  const years = new Set<number>();
  pool.forEach((question) => {
    if (isVerifiedPreviousYearQuestion(question) && question.year_asked !== null) years.add(question.year_asked);
  });
  return [...years].sort((a, b) => b - a);
}

export function isVerifiedPreviousYearQuestion(question: PracticeQuestion): boolean {
  return question.source_type === 'previous_year' && !!question.source_url && !!question.source_verified_at;
}

export function pickRandomQuestions(
  pool: PracticeQuestion[],
  count: number,
  excludedIds: ReadonlySet<string> = new Set(),
): PracticeQuestion[] {
  const shuffled = pool.filter((question) => !excludedIds.has(question.id));
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, count);
}
