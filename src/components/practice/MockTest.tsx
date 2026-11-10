import { useCallback, useEffect, useRef, useState } from 'react';
import { Clock, Medal, RotateCcw } from 'lucide-react';
import { QuestionCard } from '@/components/practice/QuestionCard';
import { MOCK_SECONDS_PER_QUESTION } from '@/lib/practice-engine';
import { getSSLCPracticeLabels } from '@/lib/sslc-practice-labels';
import type { PracticeQuestion } from '@/lib/types';

interface MockTestProps {
  questions: PracticeQuestion[];
  onRetake: () => void;
  onExit: () => void;
  onComplete?: (answers: Record<number, number>, durationSeconds: number) => void;
  onAnswersChange?: (answers: Record<number, number>) => void;
  timed?: boolean;
  allowSkip?: boolean;
  allowBack?: boolean;
  detailedScorecard?: boolean;
}

export function MockTest({ questions, onRetake, onExit, onComplete, onAnswersChange, timed = true, allowSkip = false, allowBack = false, detailedScorecard = false }: MockTestProps) {
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const startedAt = useRef(Date.now());
  const submitted = useRef(false);

  const isLast = index === questions.length - 1;
  const timeLeft = questionTimes[index] ?? MOCK_SECONDS_PER_QUESTION;
  const labels = getSSLCPracticeLabels(questions[0]?.language);

  const finishTest = useCallback(() => {
    if (submitted.current) return;
    submitted.current = true;
    setFinished(true);
    onComplete?.(answers, Math.max(0, Math.round((Date.now() - startedAt.current) / 1000)));
  }, [answers, onComplete]);

  const moveOn = useCallback(() => {
    if (index < questions.length - 1) {
      setIndex(index + 1);
    } else {
      finishTest();
    }
  }, [finishTest, index, questions.length]);

  useEffect(() => {
    if (finished || !timed) return;
    const timer = window.setInterval(() => {
      setQuestionTimes((current) => ({
        ...current,
        [index]: Math.max((current[index] ?? MOCK_SECONDS_PER_QUESTION) - 1, 0),
      }));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [finished, index, timed]);

  useEffect(() => {
    if (!finished && timeLeft === 0) moveOn();
  }, [timeLeft, finished, moveOn]);

  const selectAnswer = (optionIndex: number) => {
    const next = { ...answers, [index]: optionIndex };
    setAnswers(next);
    onAnswersChange?.(next);
  };

  const score = questions.reduce((total, question, i) => total + (answers[i] === question.correct_index ? 1 : 0), 0);
  const answeredCount = Object.keys(answers).length;
  const incorrectCount = answeredCount - score;
  const unansweredCount = questions.length - answeredCount;
  const percentage = Math.round((score / questions.length) * 100);
  const performanceSummary = percentage >= 85
    ? 'Excellent command of the course material.'
    : percentage >= 70
      ? 'Strong performance; review the missed concepts to improve further.'
      : percentage >= 50
        ? 'Developing understanding; revisit the explanations and practise the weaker areas.'
        : 'More practice is recommended; review the fundamentals before retaking the test.';
  const progress = ((index + 1) / questions.length) * 100;
  const timerColor = timeLeft <= 5 ? 'text-rose-600' : timeLeft <= 10 ? 'text-amber-600' : 'text-teal-700';

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="card p-6 sm:p-8 text-center animate-scale-in">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mx-auto mb-4">
            <Medal className="w-8 h-8 text-amber-600" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-slate-900">{labels.mockComplete}</h2>
          <p className="text-3xl font-heading font-bold text-teal-700 mt-2">{score} / {questions.length}</p>
          {detailedScorecard ? (
            <div className="mt-4 space-y-2 text-sm text-slate-700">
              <p>{labels.correctCount(score)} · {labels.incorrectCount(incorrectCount)} · {labels.unansweredCount(unansweredCount)}</p>
              <p className="font-semibold">{percentage}%</p>
              <p className="text-slate-600">{performanceSummary}</p>
            </div>
          ) : (
            <>
              <p className="text-sm text-slate-500 mt-1">
                {labels.correctCount(score)}, {labels.incorrectCount(incorrectCount)}, {labels.unansweredCount(unansweredCount)}
              </p>
              <p className="text-sm font-semibold text-slate-700 mt-1">{percentage}%</p>
            </>
          )}
          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <button type="button" onClick={onRetake} className="btn-primary flex-1 flex items-center justify-center gap-2">
              <RotateCcw className="w-4 h-4" /> {labels.startNewMock}
            </button>
            <button type="button" onClick={onExit} className="btn-secondary flex-1">{labels.backToPractice}</button>
          </div>
        </div>

        <h3 className="font-heading font-bold text-lg text-slate-900 pt-2">{labels.allAnswers}</h3>
        {questions.map((question, i) => (
          <QuestionCard key={question.id} question={question} number={i + 1} selected={answers[i]} revealed />
        ))}
      </div>
    );
  }

  const question = questions[index];

  return (
    <div className="space-y-4">
      <div className="card p-4 sm:p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">{labels.questionOf(index + 1, questions.length)}</span>
          {timed && (
            <div className={`flex items-center gap-2 font-heading font-bold text-lg ${timerColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
              <Clock className="w-5 h-5" />
              {timeLeft}s
            </div>
          )}
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <QuestionCard
        key={question.id}
        question={question}
        number={index + 1}
        selected={answers[index]}
        revealed={false}
        onSelect={selectAnswer}
      />

      <div className="flex items-center justify-between gap-3">
        <button type="button" onClick={onExit} className="btn-ghost text-sm">{labels.leaveTest}</button>
        <div className="flex gap-2">
          {allowBack && (
            <button type="button" onClick={() => setIndex((current) => Math.max(current - 1, 0))} disabled={index === 0} className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
          )}
          <button type="button" onClick={moveOn} disabled={!allowSkip && answers[index] === undefined} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
            {isLast ? labels.finishTest : labels.nextQuestion}
          </button>
        </div>
      </div>
    </div>
  );
}
