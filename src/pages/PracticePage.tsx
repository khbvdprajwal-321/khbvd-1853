import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Clock, ClipboardList, GraduationCap, ListChecks, Sparkles } from 'lucide-react';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { MockTest } from '@/components/practice/MockTest';
import { QuestionLearningSet } from '@/components/practice/QuestionLearningSet';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import {
  DAILY_SET_SIZE,
  MOCK_SECONDS_PER_QUESTION,
  MOCK_TEST_SIZE,
  PRACTICE_TRACKS,
  availableYears,
  filterByYear,
  isPracticeMode,
  isPracticeTrack,
  pickRandomQuestions,
  type PracticeMode,
} from '@/lib/practice-engine';
import { isSSLCFirstLanguage } from '@/lib/sslc-content';
import { getDegreeCourseActivityQuestionIds } from '@/lib/degree-course-practice-bank';
import { usePracticeQuestions } from '@/lib/use-practice-questions';
import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

interface PracticePageProps {
  track: string;
  mode: string;
  subject?: string;
  topic?: string;
  languageCategory?: 'first_language' | 'second_language' | 'third_language';
}

const MODES: { id: PracticeMode; label: string; icon: typeof ListChecks }[] = [
  { id: 'daily', label: 'Learn', icon: ListChecks },
  { id: 'assignment', label: 'Assignment', icon: ClipboardList },
  { id: 'mock', label: 'Mock Test', icon: Clock },
];

function rotateQuestions(pool: PracticeQuestion[], offset: number): PracticeQuestion[] {
  if (pool.length === 0) return pool;
  const shift = offset % pool.length;
  return [...pool.slice(shift), ...pool.slice(0, shift)];
}

export function PracticePage({ track, mode: modeParam, subject: subjectParam, topic: topicParam, languageCategory }: PracticePageProps) {
  const { profile } = useAuth();
  const defaultTrack: PracticeTrack = profile?.exam_stream ?? (profile?.user_type === 'degree' ? 'degree' : 'cet');
  const activeTrack: PracticeTrack = isPracticeTrack(track) ? track : defaultTrack;
  const isPucEntranceTrack = activeTrack === 'cet' || activeTrack === 'neet' || activeTrack === 'jee';
  const isBusinessPostgraduateTrack = activeTrack === 'business-hr'
    || activeTrack === 'business-operations'
    || activeTrack === 'business-management';
  const isDegreeTrack = activeTrack === 'degree-it'
    || activeTrack === 'degree-nonit'
    || isBusinessPostgraduateTrack;

  const mode: PracticeMode = isPracticeMode(modeParam) ? modeParam : 'daily';
  const [year, setYear] = useState<number | null>(null);
  const [setSeed, setSetSeed] = useState(0);
  const [mockStarted, setMockStarted] = useState(false);
  const [startingMock, setStartingMock] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState(subjectParam || 'All subjects');
  const [seenQuestionIds, setSeenQuestionIds] = useState<Set<string>>(new Set());
  const [saveNotice, setSaveNotice] = useState('');
  const [mockStartError, setMockStartError] = useState('');
  const mockAttemptId = useRef<string | null>(null);
  const mockAnswerSaveQueue = useRef<Promise<void>>(Promise.resolve());
  const isFirstLanguageSSLC = activeTrack === 'sslc'
    && languageCategory === 'first_language'
    && isSSLCFirstLanguage(selectedSubject);
  const isLanguageQuestion = isFirstLanguageSSLC
    || [profile?.first_language, profile?.second_language, profile?.third_language].includes(selectedSubject);
  const questionLanguage = isLanguageQuestion ? selectedSubject : profile?.first_language || 'English';
  const questionFilter = useMemo(() => {
    if (activeTrack === 'sslc') {
      return {
        subject: selectedSubject === 'All subjects' ? '__choose_a_subject__' : selectedSubject,
        topic: topicParam,
        language: questionLanguage,
        languageCategory: isLanguageQuestion ? languageCategory : undefined,
      };
    }
    if (selectedSubject !== 'All subjects' || topicParam) {
      return {
        subject: selectedSubject === 'All subjects' ? undefined : selectedSubject,
        topic: topicParam,
      };
    }
    return undefined;
  }, [activeTrack, isLanguageQuestion, languageCategory, questionLanguage, selectedSubject, topicParam]);
  const { questions, loading, loadingMore, hasMore, error, dataWarning, loadMoreError, loadMore, retry } = usePracticeQuestions(activeTrack, questionFilter);
  const degreeActivityIds = isDegreeTrack && selectedSubject !== 'All subjects'
    ? getDegreeCourseActivityQuestionIds(
      activeTrack,
      selectedSubject,
      mode === 'daily' ? 'learn' : mode,
      questions,
    )
    : null;
  const activityQuestions = useMemo(
    () => degreeActivityIds ? questions.filter((question) => degreeActivityIds.has(question.id)) : questions,
    [degreeActivityIds, questions],
  );

  useEffect(() => {
    setSelectedSubject(subjectParam || 'All subjects');
  }, [subjectParam, activeTrack]);

  const subjectOptions = useMemo(() => [...new Set(activityQuestions.map((question) => question.subject))].sort(), [activityQuestions]);
  const subjectPool = useMemo(() => {
    const courseQuestions = selectedSubject === 'All subjects'
      ? activityQuestions
      : activityQuestions.filter((question) => question.subject === selectedSubject);
    return topicParam ? courseQuestions.filter((question) => question.topic === topicParam) : courseQuestions;
  }, [activityQuestions, selectedSubject, topicParam]);
  const years = useMemo(() => availableYears(subjectPool), [subjectPool]);
  const pool = useMemo(() => filterByYear(subjectPool, year), [subjectPool, year]);
  const unusedPool = useMemo(() => pool.filter((question) => !seenQuestionIds.has(question.id)), [pool, seenQuestionIds]);
  const seededUnusedPool = useMemo(() => rotateQuestions(unusedPool, setSeed), [unusedPool, setSeed]);
  const easyQuestions = useMemo(
    () => unusedPool.filter((question) => question.difficulty === 'easy').sort((a, b) => a.id.localeCompare(b.id)),
    [unusedPool],
  );
  const difficultQuestions = useMemo(
    () => unusedPool.filter((question) => question.difficulty === 'difficult').sort((a, b) => a.id.localeCompare(b.id)),
    [unusedPool],
  );
  const difficultTarget = isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack ? 3 : 2;
  const easyTarget = isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack ? 2 : 3;
  const mediumTarget = 0;
  const learnPool = seededUnusedPool;
  const dailyQuestions = useMemo(
    () => pickRandomQuestions(learnPool, learnPool.length),
    [learnPool],
  );
  const assignmentQuestions = useMemo(() => {
    const difficult = pickRandomQuestions(difficultQuestions, difficultTarget);
    const easy = pickRandomQuestions(easyQuestions, easyTarget);
    const medium = mediumTarget > 0
      ? pickRandomQuestions(unusedPool.filter((question) => question.difficulty === 'medium'), mediumTarget)
      : [];
    const firstSet = [...difficult, ...medium, ...easy];
    const selectedIds = new Set(firstSet.map((question) => question.id));
    const remaining = pickRandomQuestions(unusedPool.filter((question) => !selectedIds.has(question.id)), unusedPool.length);
    return [...firstSet, ...remaining];
  }, [difficultQuestions, easyQuestions, difficultTarget, easyTarget, mediumTarget, unusedPool]);
  const mockQuestions = useMemo(() => {
    if (isDegreeTrack) {
      const selectDifficulty = (difficulty: PracticeQuestion['difficulty'], count: number) => {
        const questionsOfDifficulty = pool.filter((question) => question.difficulty === difficulty);
        const unseen = questionsOfDifficulty.filter((question) => !seenQuestionIds.has(question.id));
        const freshQuestions = pickRandomQuestions(unseen, count);
        const freshIds = new Set(freshQuestions.map((question) => question.id));
        const repeatQuestions = pickRandomQuestions(
          questionsOfDifficulty.filter((question) => !freshIds.has(question.id)),
          count - freshQuestions.length,
        );
        return [...freshQuestions, ...repeatQuestions];
      };
      const selected = [
        ...selectDifficulty('difficult', 10),
        ...selectDifficulty('easy', 5),
        ...selectDifficulty('medium', 5),
      ];
      return selected.length === MOCK_TEST_SIZE ? pickRandomQuestions(selected, MOCK_TEST_SIZE) : [];
    }
    const unseen = rotateQuestions(pool.filter((question) => !seenQuestionIds.has(question.id)), setSeed);
    const first = pickRandomQuestions(unseen, MOCK_TEST_SIZE);
    if (first.length === MOCK_TEST_SIZE) return first;
    const selectedIds = new Set(first.map((question) => question.id));
    const fill = pickRandomQuestions(
      rotateQuestions(pool.filter((question) => !selectedIds.has(question.id)), setSeed),
      MOCK_TEST_SIZE - first.length,
    );
    return [...first, ...fill];
  }, [isDegreeTrack, pool, seenQuestionIds, setSeed]);

  const trackLabel = PRACTICE_TRACKS.find((item) => item.id === activeTrack)?.label ?? 'Practice';
  const enoughForMock = isDegreeTrack
    ? mockQuestions.length === MOCK_TEST_SIZE
    : pool.length >= MOCK_TEST_SIZE;
  const mediumQuestions = isBusinessPostgraduateTrack ? unusedPool.filter((question) => question.difficulty === 'medium') : [];
  const courseAssignmentReady = easyQuestions.length >= easyTarget
    && difficultQuestions.length >= difficultTarget
    && mediumQuestions.length >= mediumTarget;
  const scopedSubject = languageCategory && isLanguageQuestion
    ? `${languageCategory}:${selectedSubject}`
    : selectedSubject;
  const progressSubjectBase = topicParam ? `${scopedSubject}:${topicParam}` : scopedSubject;
  const progressSubject = activeTrack === 'sslc'
    ? `${progressSubjectBase}:${mode === 'daily' ? 'learn' : 'assignment'}`
    : isPucEntranceTrack || isDegreeTrack
      ? `${progressSubjectBase}:${mode === 'daily' ? 'learn' : mode}`
    : progressSubjectBase;

  useEffect(() => {
    if (!profile) return;
    let active = true;
    setSetSeed(0);
    setSeenQuestionIds(new Set());
    const loadProgress = async () => {
      try {
        const { data, error: progressError } = await supabase.from('learning_progress')
          .select('completed_sets, seen_question_ids')
          .eq('user_id', profile.id)
          .eq('track', activeTrack)
          .eq('subject', progressSubject)
          .maybeSingle();
        if (!active) return;
        if (progressError) {
          setSaveNotice(`Questions are available, but saved learning progress could not be loaded (${progressError.code ?? 'database error'}: ${progressError.message}). Apply the scoped practice-progress migration and retry.`);
          return;
        }
        setSetSeed(data?.completed_sets ?? 0);
        setSeenQuestionIds(new Set(Array.isArray(data?.seen_question_ids) ? data.seen_question_ids as string[] : []));
      } catch (caught) {
        const detail = caught instanceof Error ? ` (${caught.message})` : '';
        if (active) setSaveNotice(`Questions are available, but saved learning progress could not be loaded. Check your connection and retry.${detail}`);
      }
    };
    void loadProgress();
    return () => { active = false; };
  }, [activeTrack, profile, progressSubject]);

  const startMock = useCallback(async () => {
    if (startingMock) return;
    setMockStartError('');
    if (!isPucEntranceTrack && !isDegreeTrack) {
      setMockStarted(true);
      return;
    }
    if (!profile || mockQuestions.length !== MOCK_TEST_SIZE) {
      setMockStartError('A complete 20-question mock test is not available for this subject yet.');
      return;
    }

    setStartingMock(true);
    try {
      const attemptId = crypto.randomUUID();
      const startedAt = new Date().toISOString();
      const { error: insertError } = await supabase.from('exam_attempts').insert({
        id: attemptId,
        user_id: profile.id,
        exam_type: 'stream_practice',
        subject: scopedSubject,
        total_questions: MOCK_TEST_SIZE,
        question_data: mockQuestions,
        answers: {},
        started_at: startedAt,
        track: activeTrack,
        assessment_mode: 'mock',
      });
      if (insertError) {
        setSaveNotice(`This mock test could not be saved to Supabase (${insertError.code ?? 'database error'}: ${insertError.message}). You can continue, but the attempt may not persist.`);
        mockAttemptId.current = null;
        setMockStarted(true);
        return;
      }

      mockAnswerSaveQueue.current = Promise.resolve();
      mockAttemptId.current = attemptId;
      setMockStarted(true);
    } catch (caught) {
      const detail = caught instanceof Error ? ` (${caught.message})` : '';
      setSaveNotice(`This mock test could not be saved because of a connection error${detail}. You can continue, but the attempt may not persist.`);
      mockAttemptId.current = null;
      setMockStarted(true);
    } finally {
      setStartingMock(false);
    }
  }, [activeTrack, isDegreeTrack, isPucEntranceTrack, mockQuestions, profile, scopedSubject, startingMock]);

  const saveMockDraftAnswers = useCallback((answers: Record<number, number>) => {
    const attemptId = mockAttemptId.current;
    if (!attemptId || !profile) return;
    mockAnswerSaveQueue.current = mockAnswerSaveQueue.current
      .then(async () => {
        const { error: updateError } = await supabase.from('exam_attempts')
          .update({ answers })
          .eq('id', attemptId)
          .eq('user_id', profile.id);
        if (updateError) setSaveNotice(`Your selected answers could not be autosaved (${updateError.code ?? 'database error'}: ${updateError.message}). They will be retried when the test is submitted.`);
      })
      .catch((caught: unknown) => {
        const detail = caught instanceof Error ? ` (${caught.message})` : '';
        setSaveNotice(`Your selected answers could not be autosaved. They will be retried when the test is submitted.${detail}`);
      });
  }, [profile]);

  const saveAttempt = useCallback(async (
    assessmentMode: PracticeMode,
    attemptQuestions: typeof questions,
    answers: Record<number, number>,
    durationSeconds: number | null = null,
  ) => {
    if (!profile || attemptQuestions.length === 0) return;
    const correct = attemptQuestions.reduce((total, question, index) => total + (answers[index] === question.correct_index ? 1 : 0), 0);
    const answered = Object.keys(answers).length;
    const breakdown = { easy: { correct: 0, total: 0 }, medium: { correct: 0, total: 0 }, difficult: { correct: 0, total: 0 } };
    attemptQuestions.forEach((question, index) => {
      const current = breakdown[question.difficulty];
      current.total += 1;
      if (answers[index] === question.correct_index) current.correct += 1;
    });
    try {
      const attemptData = {
        user_id: profile.id,
        exam_type: assessmentMode === 'assignment' ? 'assignment' : 'stream_practice',
        subject: topicParam ? `${scopedSubject} · ${topicParam}` : scopedSubject,
        total_questions: attemptQuestions.length,
        correct_answers: correct,
        score_percentage: Math.round((correct / attemptQuestions.length) * 100),
        difficulty_breakdown: breakdown,
        question_data: attemptQuestions,
        answers,
        completed_at: new Date().toISOString(),
        track: activeTrack,
        assessment_mode: assessmentMode,
        duration_seconds: durationSeconds,
        answered_count: answered,
        incorrect_answers: answered - correct,
        unanswered_count: attemptQuestions.length - answered,
      };
      const attemptId = assessmentMode === 'mock' ? mockAttemptId.current : null;
      if (attemptId) await mockAnswerSaveQueue.current;
      const result = attemptId
        ? await supabase.from('exam_attempts').update(attemptData).eq('id', attemptId).eq('user_id', profile.id)
        : await supabase.from('exam_attempts').insert(attemptData);
      if (result.error) {
        setSaveNotice(`Your result could not be saved (${result.error.code ?? 'database error'}: ${result.error.message}). Please try again after the practice migration is applied.`);
      } else {
        mockAttemptId.current = null;
        setSaveNotice('Result saved to your progress.');
      }
    } catch (caught) {
      const detail = caught instanceof Error ? ` (${caught.message})` : '';
      setSaveNotice(`Your result could not be saved. Please try again later.${detail}`);
    }
  }, [activeTrack, profile, scopedSubject, topicParam]);

  const saveLearningProgress = useCallback(async (nextSeenIds: Set<string>, completedSets: number) => {
    if (!profile) return;
    try {
      const { error: saveError } = await supabase.from('learning_progress').upsert({
        user_id: profile.id,
        track: activeTrack,
        subject: progressSubject,
        completed_sets: completedSets,
        seen_question_ids: [...nextSeenIds],
        last_practiced_at: new Date().toISOString(),
      }, { onConflict: 'user_id,track,subject' });
      if (saveError) setSaveNotice(`Learning progress could not be saved (${saveError.code ?? 'database error'}: ${saveError.message}). Apply the scoped practice-progress migration and retry.`);
    } catch (caught) {
      const detail = caught instanceof Error ? ` (${caught.message})` : '';
      setSaveNotice(`Learning progress could not be saved. Please try again later.${detail}`);
    }
  }, [activeTrack, profile, progressSubject]);

  const recordQuestionViewed = useCallback((questionId: string) => {
    if (mode !== 'daily' || seenQuestionIds.has(questionId)) return;
    const nextSeenIds = new Set(seenQuestionIds);
    nextSeenIds.add(questionId);
    setSeenQuestionIds(nextSeenIds);
    void saveLearningProgress(nextSeenIds, setSeed);
  }, [mode, saveLearningProgress, seenQuestionIds, setSeed]);

  const startNextSet = (completedQuestions: typeof questions) => {
    const nextSeen = new Set(seenQuestionIds);
    completedQuestions.forEach((question) => nextSeen.add(question.id));
    const completedSets = setSeed + 1;
    setSeenQuestionIds(nextSeen);
    setSetSeed(completedSets);
    void saveLearningProgress(nextSeen, completedSets);
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="card p-10 flex justify-center">
          <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
        </div>
      );
    }
    if (error) {
      return (
        <div className="card p-8 text-center">
          <p className="text-slate-700 font-semibold mb-2">Questions are unavailable</p>
          <p className="text-sm text-slate-500">{error}</p>
          <button type="button" disabled={loading} onClick={() => void retry()} className="btn-secondary mt-4 disabled:opacity-50">{loading ? 'Retrying…' : 'Retry'}</button>
        </div>
      );
    }
    if (pool.length === 0) {
      return (
        <div className="card p-8 text-center">
          <GraduationCap className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-slate-700 font-semibold">{activeTrack === 'sslc' && selectedSubject === 'All subjects' ? 'Choose an SSLC subject or language from the learning hub to see its questions.' : `No questions are currently available for ${selectedSubject === 'All subjects' ? trackLabel : `${selectedSubject} · ${trackLabel}`}.`}</p>
          <p className="text-sm text-slate-500 mt-2">{dataWarning ?? (activeTrack === 'sslc'
            ? 'SSLC practice appears only after questions are populated with the selected language and language-slot metadata.'
            : 'No matching question records or built-in subject bank were found. An administrator must populate this subject in the question bank; no unrelated questions are shown.')}</p>
          {activeTrack === 'sslc' && selectedSubject === 'All subjects' && <button type="button" onClick={() => navigate('/learn/sslc')} className="btn-primary mt-4">Choose an SSLC subject</button>}
          {hasMore && <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary mt-4 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load questions'}</button>}
          {!error && <button type="button" disabled={loading} onClick={() => void retry()} className="btn-secondary mt-4 disabled:opacity-50">{loading ? 'Retrying…' : 'Retry'}</button>}
          {loadMoreError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadMoreError}</p>}
        </div>
      );
    }

    if (mode === 'mock') {
      if (!mockStarted) {
        return (
          <div className="card p-6 sm:p-8 text-center animate-fade-in">
            <div className="w-14 h-14 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
              <Clock className="w-7 h-7 text-teal-700" />
            </div>
            <h2 className="text-xl font-heading font-bold text-slate-900 mb-2">{trackLabel} Mock Test</h2>
            <p className="text-sm text-slate-500 mb-6">
              {MOCK_TEST_SIZE} questions{isFirstLanguageSSLC ? '' : `, ${MOCK_SECONDS_PER_QUESTION} seconds each`}{isPucEntranceTrack || isDegreeTrack ? ' · total 6 minutes 40 seconds' : ''}{isDegreeTrack ? ' · 10 difficult, 5 easy, 5 medium' : ''}. Your full answer review appears when you finish.
            </p>
            {enoughForMock ? (
              <button type="button" disabled={startingMock} onClick={() => void startMock()} className="btn-primary w-full py-3 disabled:opacity-50">
                {startingMock ? 'Preparing test…' : 'Start Mock Test'}
              </button>
            ) : (
              <div className="space-y-3">
                <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  {isDegreeTrack
                    ? `This course needs 10 difficult, 5 easy and 5 medium questions for a mock test. Current bank: ${pool.filter((question) => question.difficulty === 'difficult').length} difficult, ${pool.filter((question) => question.difficulty === 'easy').length} easy and ${pool.filter((question) => question.difficulty === 'medium').length} medium.`
                    : `This filter currently has ${pool.length} questions; a test requires ${MOCK_TEST_SIZE} distinct questions.`}
                </p>
                {hasMore && <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary w-full disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load More Questions'}</button>}
                {loadMoreError && <p role="alert" className="text-sm text-rose-700">{loadMoreError}</p>}
              </div>
            )}
            {mockStartError && <p role="alert" className="mt-3 text-sm text-rose-700">{mockStartError}</p>}
          </div>
        );
      }
      return (
        <MockTest
          key={setSeed}
          questions={mockQuestions}
          timed={!isFirstLanguageSSLC}
          allowSkip={isPucEntranceTrack || isDegreeTrack}
          allowBack={isPucEntranceTrack || isDegreeTrack}
          onAnswersChange={isPucEntranceTrack || isDegreeTrack ? saveMockDraftAnswers : undefined}
          detailedScorecard={isDegreeTrack}
          onRetake={() => { mockAttemptId.current = null; setMockStarted(false); setSetSeed((seed) => seed + 1); }}
          onExit={() => { mockAttemptId.current = null; setMockStarted(false); setSetSeed((seed) => seed + 1); }}
          onComplete={(answers, durationSeconds) => {
            if (isPucEntranceTrack || isDegreeTrack) {
              const nextSeen = new Set(seenQuestionIds);
              mockQuestions.forEach((question) => nextSeen.add(question.id));
              setSeenQuestionIds(nextSeen);
              void saveLearningProgress(nextSeen, setSeed);
            }
            void saveAttempt('mock', mockQuestions, answers, durationSeconds);
          }}
        />
      );
    }

    if (mode === 'daily' && pool.length < DAILY_SET_SIZE) {
      return (
        <div className="card p-8 text-center">
          <p className="text-slate-700 font-semibold">Learn needs {DAILY_SET_SIZE} questions; this selection currently has {pool.length}.</p>
          <p className="text-sm text-slate-500 mt-2">More questions must be added to the selected subject before the lesson can start.</p>
          {hasMore && <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary mt-4 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load More Questions'}</button>}
          {loadMoreError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadMoreError}</p>}
        </div>
      );
    }

    const isAssignment = mode === 'assignment';
    const setQuestions = isAssignment
      ? (isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack ? assignmentQuestions.slice(0, DAILY_SET_SIZE) : assignmentQuestions)
      : (isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack ? dailyQuestions.slice(0, DAILY_SET_SIZE) : dailyQuestions);
    if (isAssignment && !courseAssignmentReady) {
      return (
        <div className="card p-6 border-amber-200 bg-amber-50">
          <p className="font-semibold text-amber-900">
            {isBusinessPostgraduateTrack && !hasMore ? 'No complete unseen assignment set remains.' : 'This assignment is not ready yet.'}
          </p>
          <p className="text-sm text-amber-800 mt-2">
            It requires at least {difficultTarget} difficult{mediumTarget > 0 ? `, ${mediumTarget} medium, and` : ' and'} {easyTarget} easy questions. The selected subject currently has {difficultQuestions.length} difficult, {mediumQuestions.length} medium, and {easyQuestions.length} easy questions.
          </p>
          {hasMore && <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary mt-4 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load More Questions'}</button>}
          {isBusinessPostgraduateTrack && !hasMore && (
            <button type="button" onClick={() => { setSeenQuestionIds(new Set()); setSetSeed(0); }} className="btn-primary mt-4">
              Reset assignment sequence
            </button>
          )}
          {loadMoreError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadMoreError}</p>}
        </div>
      );
    }
    if (!isAssignment && (isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack) && setQuestions.length < DAILY_SET_SIZE) {
      return (
        <div className="card p-6 text-center">
          <p className="font-semibold text-slate-800">
            {hasMore ? 'More lesson questions are available.' : 'There are no more unseen questions for another set.'}
          </p>
          {hasMore && <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary mt-4 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load More Questions'}</button>}
          {!hasMore && (isPucEntranceTrack || isDegreeTrack) && (
            <button type="button" onClick={() => { setSeenQuestionIds(new Set()); setSetSeed(0); }} className="btn-primary mt-4">Start again</button>
          )}
          {loadMoreError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadMoreError}</p>}
        </div>
      );
    }
    if (isAssignment && assignmentQuestions.length < DAILY_SET_SIZE) {
      return (
        <div className="card p-6 text-center">
          {hasMore ? (
            <>
              <p className="text-slate-700 font-semibold">More questions are available in the bank.</p>
              <button type="button" disabled={loadingMore} onClick={() => void loadMore()} className="btn-secondary mt-4 disabled:opacity-50">{loadingMore ? 'Loading…' : 'Load More Questions'}</button>
            </>
          ) : (
            <>
              <p className="text-slate-700 font-semibold">There are no more unseen questions for another assignment set.</p>
              <p className="text-sm text-slate-500 mt-1">You can reveal the available questions again after resetting this sequence.</p>
              <button type="button" onClick={() => { setSeenQuestionIds(new Set()); setSetSeed(0); }} className="btn-primary mt-4">Reset sequence</button>
            </>
          )}
          {loadMoreError && <p role="alert" className="mt-3 text-sm text-rose-700">{loadMoreError}</p>}
        </div>
      );
    }
    return (
      <div className="space-y-4">
        <div className="card p-4 bg-teal-50 border-teal-200">
          <p className="text-sm text-teal-900">
            {isAssignment
              ? `Assignment set ${setSeed + 1}: ${difficultTarget} difficult, ${mediumTarget} medium, and ${easyTarget} easy questions.`
              : `Learning set ${setSeed + 1}: the first ${DAILY_SET_SIZE} questions are shown initially. Reveal answers individually and load more when ready.`}
          </p>
        </div>
        <QuestionLearningSet
          key={`${mode}-${year ?? 'all'}-${setSeed}`}
          questions={setQuestions}
          assignment={isAssignment}
          onNextAssignment={isAssignment ? startNextSet : undefined}
          onNextSet={!isAssignment && (isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack) ? startNextSet : undefined}
          onRevealQuestion={!isAssignment && !isPucEntranceTrack && !isBusinessPostgraduateTrack && !isDegreeTrack ? recordQuestionViewed : undefined}
          answerOnSelect={isDegreeTrack}
          hasMore={isFirstLanguageSSLC || isPucEntranceTrack || isDegreeTrack ? false : hasMore}
          loadingMore={loadingMore}
          loadMoreError={loadMoreError}
          onLoadMore={loadMore}
        />
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to dashboard
        </button>

        <div className="card p-6 mb-6 gradient-hero text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Sparkles className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">{trackLabel} Practice</h1>
              <p className="text-teal-100/90 text-sm mt-0.5">Daily learning, assignments and timed mock tests</p>
              {topicParam && <p className="text-sm text-teal-100 mt-2">{selectedSubject} · {topicParam}</p>}
            </div>
          </div>
        </div>

        {!topicParam && activeTrack !== 'sslc' ? <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-5">
          <label htmlFor="practice-subject" className="text-sm font-semibold text-slate-700">Subject</label>
          <select
            id="practice-subject"
            value={selectedSubject}
            onChange={(event) => { setSelectedSubject(event.target.value); setSeenQuestionIds(new Set()); setSetSeed(0); setYear(null); setMockStarted(false); setSaveNotice(''); }}
            className="input-field sm:max-w-xs"
          >
            <option>All subjects</option>
            {subjectOptions.map((subject) => <option key={subject}>{subject}</option>)}
          </select>
          {mode === 'daily' && <span className="text-xs text-slate-500">Progress: {setSeed} completed set{setSeed === 1 ? '' : 's'}</span>}
        </div> : <p className="text-sm font-semibold text-slate-700 mb-5">Lesson: {topicParam}</p>}

        {saveNotice && <p role="status" className="text-sm text-slate-600 mb-4">{saveNotice}</p>}
        {dataWarning && pool.length > 0 && <p role="status" className="text-sm text-amber-800 bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">{dataWarning}</p>}

        <div className="grid grid-cols-3 gap-2 mb-4">
          {MODES.map((item) => {
            const Icon = item.icon;
            const active = item.id === mode;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => navigate(`/practice/${activeTrack}/${item.id}${selectedSubject === 'All subjects' ? '' : `/${encodeURIComponent(selectedSubject)}`}${topicParam ? `/${encodeURIComponent(topicParam)}` : ''}${languageCategory ? `/${languageCategory.replace('_', '-')}` : ''}`)}
                className={`p-3 rounded-xl text-sm font-semibold flex flex-col sm:flex-row items-center justify-center gap-2 transition-all ${
                  active ? 'bg-white border-2 border-teal-600 text-teal-800 shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                <Icon className="w-4 h-4" /> {item.label}
              </button>
            );
          })}
        </div>

        {years.length > 0 && (
          <div className="mb-6">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Previous year papers</p>
            <div className="flex flex-wrap gap-2">
              {[null, ...years].map((option) => {
                const active = option === year;
                return (
                  <button
                    key={option ?? 'all'}
                    type="button"
                    onClick={() => { setYear(option); setSetSeed((seed) => seed + 1); setMockStarted(false); }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                      active ? 'bg-amber-500 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-300'
                    }`}
                  >
                    {option === null ? 'All years' : option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {renderContent()}
      </div>
    </div>
  );
}
