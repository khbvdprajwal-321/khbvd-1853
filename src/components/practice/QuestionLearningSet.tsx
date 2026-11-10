import { useLayoutEffect, useRef, useState } from 'react';
import { ArrowDown, ArrowUp, RefreshCw } from 'lucide-react';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { getSSLCPracticeLabels } from '@/lib/sslc-practice-labels';
import type { PracticeQuestion } from '@/lib/types';

const INITIAL_QUESTION_COUNT = 5;

interface QuestionLearningSetProps {
  questions: PracticeQuestion[];
  assignment?: boolean;
  onNextAssignment?: (completedQuestions: PracticeQuestion[]) => void;
  onNextSet?: (completedQuestions: PracticeQuestion[]) => void;
  onRevealQuestion?: (questionId: string) => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  loadMoreError?: string | null;
  onLoadMore?: () => Promise<boolean>;
  answerOnSelect?: boolean;
}

export function QuestionLearningSet({
  questions,
  assignment = false,
  onNextAssignment,
  onNextSet,
  onRevealQuestion,
  hasMore = false,
  loadingMore = false,
  loadMoreError,
  onLoadMore,
  answerOnSelect = false,
}: QuestionLearningSetProps) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_QUESTION_COUNT);
  const [revealedIds, setRevealedIds] = useState<Set<string>>(new Set());
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [assignmentSubmitted, setAssignmentSubmitted] = useState(false);
  const actionsRef = useRef<HTMLDivElement>(null);
  const previousActionsTop = useRef<number | null>(null);
  const visibleQuestions = questions.slice(0, visibleCount);
  const allVisibleAnswersShown = visibleQuestions.every((question) => answerOnSelect
    ? assignment ? assignmentSubmitted : selectedAnswers[question.id] !== undefined
    : revealedIds.has(question.id));
  const labels = getSSLCPracticeLabels(visibleQuestions[0]?.language);

  useLayoutEffect(() => {
    if (previousActionsTop.current === null) return;
    const newTop = actionsRef.current?.getBoundingClientRect().top;
    if (newTop !== undefined) window.scrollBy(0, newTop - previousActionsTop.current);
    previousActionsTop.current = null;
  }, [visibleCount]);

  const toggleAnswer = (id: string) => {
    const isRevealed = revealedIds.has(id);
    setRevealedIds((current) => {
      const next = new Set(current);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
    if (!isRevealed) onRevealQuestion?.(id);
  };

  return (
    <div className="space-y-4">
      {visibleQuestions.map((question, index) => (
        <QuestionCard
          key={question.id}
          question={question}
          number={index + 1}
          selected={selectedAnswers[question.id]}
          revealed={answerOnSelect && (assignment ? assignmentSubmitted : selectedAnswers[question.id] !== undefined)}
          answerVisible={revealedIds.has(question.id)}
          onToggleAnswer={answerOnSelect && assignment ? undefined : () => toggleAnswer(question.id)}
          onSelect={answerOnSelect && !(assignment && assignmentSubmitted) ? (optionIndex) => {
            setSelectedAnswers((current) => ({ ...current, [question.id]: optionIndex }));
            if (!assignment) onRevealQuestion?.(question.id);
          } : undefined}
          showDifficulty={assignment}
        />
      ))}

      {answerOnSelect && assignment && (
        <div className="card p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {assignmentSubmitted ? (
            <p className="font-semibold text-slate-800">
              Score: {visibleQuestions.filter((question) => selectedAnswers[question.id] === question.correct_index).length} / {visibleQuestions.length}
            </p>
          ) : (
            <p className="text-sm text-slate-600">Answer the questions, then submit to see the correct answers and explanations.</p>
          )}
          {!assignmentSubmitted && (
            <button
              type="button"
              disabled={visibleQuestions.some((question) => selectedAnswers[question.id] === undefined)}
              onClick={() => setAssignmentSubmitted(true)}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Assignment
            </button>
          )}
        </div>
      )}

      <div ref={actionsRef} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <p className="text-sm text-slate-500">
          {labels.showing(visibleQuestions.length, questions.length)}
        </p>
        <div className="flex flex-wrap gap-2">
          {(visibleCount < questions.length || (hasMore && !onNextSet)) && (
            <button
              type="button"
              disabled={loadingMore}
              onClick={() => {
                if (visibleCount < questions.length) {
                  setVisibleCount((count) => Math.min(count + INITIAL_QUESTION_COUNT, questions.length));
                } else if (onLoadMore) {
                  void onLoadMore().then((loaded) => {
                    if (loaded) setVisibleCount((count) => count + INITIAL_QUESTION_COUNT);
                  });
                }
              }}
              className="btn-secondary inline-flex items-center gap-2 disabled:opacity-50"
            >
              <ArrowDown className="w-4 h-4" /> {loadingMore ? labels.loading : labels.showMore}
            </button>
          )}
          {visibleCount > INITIAL_QUESTION_COUNT && (
            <button
              type="button"
              onClick={() => {
                previousActionsTop.current = actionsRef.current?.getBoundingClientRect().top ?? null;
                setVisibleCount(INITIAL_QUESTION_COUNT);
              }}
              className="btn-secondary inline-flex items-center gap-2"
            >
              <ArrowUp className="w-4 h-4" /> {labels.showLess}
            </button>
          )}
          {assignment && onNextAssignment && (
            <button
              type="button"
              disabled={!allVisibleAnswersShown}
              onClick={() => onNextAssignment(visibleQuestions)}
              className="btn-primary inline-flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <RefreshCw className="w-4 h-4" /> {labels.nextAssignment}
            </button>
          )}
          {onNextSet && (
            <button type="button" onClick={() => onNextSet(visibleQuestions)} className="btn-primary inline-flex items-center gap-2">
              <RefreshCw className="w-4 h-4" /> {labels.nextSet}
            </button>
          )}
        </div>
        {loadMoreError && <p role="alert" className="text-sm text-rose-700">{loadMoreError} {labels.showMore}</p>}
      </div>
      {assignment && !allVisibleAnswersShown && (
        <p className="text-xs text-slate-500 text-right">{labels.revealAnswersToContinue}</p>
      )}
    </div>
  );
}
