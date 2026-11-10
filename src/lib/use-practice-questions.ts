import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getBusinessPracticeQuestions } from '@/lib/business-practice-bank';
import { getDegreeCoursePracticeQuestions } from '@/lib/degree-course-practice-bank';
import { generateExam, hasCuratedQuestionBank, streamSubjects } from '@/lib/question-engine';
import { isPracticeTrack } from '@/lib/practice-engine';
import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

interface PracticeQuestionFilter {
  subject?: string;
  topic?: string;
  language?: string;
  languageCategory?: 'first_language' | 'second_language' | 'third_language';
}

const QUESTION_PAGE_SIZE = 50;
const COMPLETE_QUESTION_COLUMNS = 'id, track, subject, chapter, topic, question_type, language, language_category, difficulty, question, options, correct_index, explanation, year_asked, source_type, source_name, source_url, source_verified_at, research_reference';
const FULL_QUESTION_COLUMNS = 'id, track, subject, topic, language, language_category, difficulty, question, options, correct_index, explanation, year_asked, source_type, source_name, source_url, source_verified_at';
const LANGUAGE_QUESTION_COLUMNS = 'id, track, subject, topic, language, language_category, difficulty, question, options, correct_index, explanation, year_asked';
const BASE_QUESTION_COLUMNS = 'id, track, subject, topic, difficulty, question, options, correct_index, explanation, year_asked';

function isMissingColumn(error: { code?: string; message?: string }, columnNames: string[]): boolean {
  const message = error.message ?? '';
  return (error.code === '42703' || error.code === 'PGRST204')
    && columnNames.some((column) => message.includes(column));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isDifficulty(value: unknown): value is PracticeQuestion['difficulty'] {
  return value === 'easy' || value === 'medium' || value === 'difficult';
}

function isQuestionSource(value: unknown): value is PracticeQuestion['source_type'] {
  return value === 'practice' || value === 'generated' || value === 'previous_year';
}

function normalizeQuestionText(value: string): string {
  return value.normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
}

function questionContentKey(question: Pick<PracticeQuestion, 'question' | 'options' | 'correct_index' | 'explanation'>): string {
  return JSON.stringify([
    normalizeQuestionText(question.question),
    question.options.map(normalizeQuestionText),
    question.correct_index,
    normalizeQuestionText(question.explanation),
  ]);
}

function normalizeQuestions(rows: unknown[]): { questions: PracticeQuestion[]; rejectedCount: number } {
  const questions = rows.flatMap((candidate) => {
    if (!isRecord(candidate)) return [];
    const row = candidate;
    if (
      typeof row.id !== 'string'
      || typeof row.track !== 'string'
      || !isPracticeTrack(row.track)
      || typeof row.subject !== 'string'
      || typeof row.topic !== 'string'
      || typeof row.question !== 'string'
      || !row.question.trim()
      || !Array.isArray(row.options)
      || row.options.length !== 4
      || !row.options.every((option) => typeof option === 'string' && option.trim().length > 0)
      || typeof row.correct_index !== 'number'
      || !Number.isInteger(row.correct_index)
      || row.correct_index < 0
      || row.correct_index > 3
      || typeof row.explanation !== 'string'
      || !row.explanation.trim()
      || !isDifficulty(row.difficulty)
      || (row.source_type !== undefined && !isQuestionSource(row.source_type))
    ) return [];

    const languageCategory: PracticeQuestion['language_category'] =
      row.language_category === 'first_language' || row.language_category === 'second_language' || row.language_category === 'third_language'
        ? row.language_category
        : null;
    const sourceType = isQuestionSource(row.source_type) ? row.source_type : 'practice';
    return [{
      id: row.id,
      track: row.track as PracticeTrack,
      subject: row.subject,
      topic: row.topic,
      language: typeof row.language === 'string' ? row.language : null,
      language_category: languageCategory,
      difficulty: row.difficulty,
      chapter: typeof row.chapter === 'string' ? row.chapter : null,
      question: row.question,
      question_type: row.question_type === 'numerical_choice' ? 'numerical_choice' as const : 'single_choice' as const,
      options: row.options as string[],
      correct_index: row.correct_index,
      explanation: row.explanation,
      year_asked: typeof row.year_asked === 'number' ? row.year_asked : null,
      source_type: sourceType,
      source_name: typeof row.source_name === 'string' ? row.source_name : null,
      source_url: typeof row.source_url === 'string' ? row.source_url : null,
      source_verified_at: typeof row.source_verified_at === 'string' ? row.source_verified_at : null,
      research_reference: typeof row.research_reference === 'string' ? row.research_reference : null,
    }];
  });
  const rejectedCount = rows.length - questions.length;
  return { questions, rejectedCount };
}

function getGeneratedQuestions(track: PracticeTrack, subjects: string[], existing: PracticeQuestion[]): PracticeQuestion[] {
  return subjects.flatMap((subject) => {
    const currentQuestions = existing.filter((question) => question.subject === subject);
    const seenTexts = new Set(currentQuestions.map((question) => normalizeQuestionText(question.question)));
    const seenContent = new Set(currentQuestions.map(questionContentKey));
    const businessQuestions = getBusinessPracticeQuestions(track, subject);
    const degreeCourseQuestions = getDegreeCoursePracticeQuestions(track, subject);
    const candidates = businessQuestions.length > 0
      ? businessQuestions
      : degreeCourseQuestions.length > 0
        ? degreeCourseQuestions
        : track === 'degree-it' || track === 'degree-nonit' || track.startsWith('business-')
        ? []
      : hasCuratedQuestionBank(subject)
        ? generateExam(subject, 500).map((question) => ({
          id: `${track}-${subject}-${question.id}`,
          track,
          subject,
          topic: question.topic,
          chapter: null,
          question_type: 'single_choice' as const,
          language: null,
          language_category: null,
          difficulty: question.difficulty,
          question: question.question,
          options: question.options,
          correct_index: question.correctAnswer,
          explanation: question.explanation,
          year_asked: null,
          source_type: 'generated' as const,
          source_name: 'Built-in subject question bank',
          source_url: null,
          source_verified_at: null,
          research_reference: null,
        } satisfies PracticeQuestion))
        : [];
    return candidates
      .filter((question) => {
        const key = normalizeQuestionText(question.question);
        const contentKey = questionContentKey(question);
        if (seenTexts.has(key) || seenContent.has(contentKey)) return false;
        seenTexts.add(key);
        seenContent.add(contentKey);
        return true;
      });
  });
}

export function usePracticeQuestions(track: PracticeTrack, filter?: PracticeQuestionFilter) {
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dataWarning, setDataWarning] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const offset = useRef(0);
  const requestId = useRef(0);
  const isLoadingMore = useRef(false);

  const loadPage = useCallback(async (start: number, append: boolean): Promise<boolean> => {
    const request = ++requestId.current;
    if (append) {
      isLoadingMore.current = true;
      setLoadingMore(true);
    } else {
      setLoading(true);
      setError(null);
      setDataWarning(null);
      setLoadMoreError(null);
      setQuestions([]);
      setHasMore(false);
      offset.current = 0;
    }

    try {
      const buildQuery = (columns: string) => {
        let query = supabase.from('practice_questions').select(columns).eq('track', track);
        if (filter?.subject !== undefined) query = query.eq('subject', filter.subject);
        if (filter?.topic) query = query.eq('topic', filter.topic);
        if (filter?.language) query = query.eq('language', filter.language);
        if (filter?.languageCategory) query = query.eq('language_category', filter.languageCategory);
        return query.order('year_asked', { ascending: false }).order('id', { ascending: true }).range(start, start + QUESTION_PAGE_SIZE - 1);
      };

      let result = await buildQuery(COMPLETE_QUESTION_COLUMNS);
      if (result.error && isMissingColumn(result.error, [
        'chapter', 'question_type', 'research_reference',
        'source_type', 'source_name', 'source_url', 'source_verified_at',
      ])) {
        result = await buildQuery(FULL_QUESTION_COLUMNS);
      }
      if (result.error && isMissingColumn(result.error, ['source_type', 'source_name', 'source_url', 'source_verified_at'])) {
        result = await buildQuery(LANGUAGE_QUESTION_COLUMNS);
      }
      if (result.error && isMissingColumn(result.error, ['language', 'language_category'])) {
        if (filter?.language || filter?.languageCategory) {
          if (request === requestId.current) {
            setError('SSLC language-filtered questions require the latest SSLC practice metadata migration. Apply the migration, then tag each question with its verified language and language category.');
          }
          return false;
        }
        result = await buildQuery(BASE_QUESTION_COLUMNS);
      }
      const { data, error: queryError } = result;
      if (request !== requestId.current) return false;
      if (queryError || !Array.isArray(data)) {
        const detail = queryError?.message ? ` (${queryError.message})` : '';
        if (
          !append
          && filter?.subject
          && (
            track === 'degree-it'
            || track === 'degree-nonit'
            || track === 'business-hr'
            || track === 'business-operations'
            || track === 'business-management'
          )
        ) {
          const localQuestions = getGeneratedQuestions(track, [filter.subject], []);
          if (localQuestions.length > 0) {
            setQuestions(localQuestions);
            setDataWarning(`Supabase questions could not be retrieved${detail}. Showing ${localQuestions.length} local practice questions; database counts and progress could not be verified.`);
            setError(null);
            return true;
          }
        }
        if (append) setLoadMoreError(`More questions could not be loaded. Check your connection and try again.${detail}`);
        else setError(`The question bank could not be queried. Check the Supabase migration, read policy and connection.${detail}`);
        return false;
      }

      const normalized = normalizeQuestions(data);
      let pageQuestions = normalized.questions;
      if (!append && normalized.rejectedCount > 0) {
        setDataWarning(`${normalized.rejectedCount} question record(s) were skipped because required fields or four-option answer data were invalid.`);
      }
      const generatedSubjects = !append && !filter?.language && !filter?.languageCategory
        ? filter?.subject
          ? [filter.subject]
          : track === 'cet' || track === 'neet' || track === 'jee'
            ? streamSubjects[track]
            : []
        : [];
      if (generatedSubjects.length > 0) {
        const generatedQuestions = getGeneratedQuestions(track, generatedSubjects, pageQuestions);
        pageQuestions = [...pageQuestions, ...generatedQuestions];
        if (generatedQuestions.length > 0) {
          setDataWarning(
            `Supabase returned ${data.length} question record(s) on this page. ${generatedQuestions.length} additional locally bundled or generated questions are shown; they are not saved to Supabase.`,
          );
        }
      }

      offset.current = start + data.length;
      setHasMore(data.length === QUESTION_PAGE_SIZE);
      setQuestions((current) => {
        const combined = append ? [...current, ...pageQuestions] : pageQuestions;
        const seen = new Set<string>();
        return combined.filter((question) => {
          const questionKey = `${question.track}:${question.subject}:${normalizeQuestionText(question.question)}`;
          if (seen.has(questionKey)) return false;
          seen.add(questionKey);
          return true;
        });
      });
      if (append) setLoadMoreError(null);
      else setError(null);
      return true;
    } catch (caught) {
      if (request === requestId.current) {
        const detail = caught instanceof Error ? ` (${caught.message})` : '';
        if (append) setLoadMoreError(`More questions could not be loaded. Check your connection and try again.${detail}`);
        else setError(`We could not load questions right now. Please check your connection and retry.${detail}`);
      }
      return false;
    } finally {
      if (request === requestId.current) {
        setLoading(false);
        setLoadingMore(false);
        isLoadingMore.current = false;
      }
    }
  }, [filter?.language, filter?.languageCategory, filter?.subject, filter?.topic, track]);

  useEffect(() => {
    void loadPage(0, false);
    return () => { requestId.current += 1; };
  }, [loadPage]);

  const loadMore = useCallback(async () => {
    if (!hasMore || isLoadingMore.current) return false;
    return loadPage(offset.current, true);
  }, [hasMore, loadPage]);

  useEffect(() => {
    const shouldLoadAllPages = ['cet', 'neet', 'jee', 'degree-it', 'degree-nonit', 'business-hr', 'business-operations', 'business-management'].includes(track);
    if (!filter?.subject || !shouldLoadAllPages || !hasMore || loading || loadingMore) return;
    void loadMore();
  }, [filter?.subject, hasMore, loadMore, loading, loadingMore, track]);

  const retry = useCallback(() => loadPage(0, false), [loadPage]);

  return { questions, loading, loadingMore, hasMore, error, dataWarning, loadMoreError, loadMore, retry };
}
