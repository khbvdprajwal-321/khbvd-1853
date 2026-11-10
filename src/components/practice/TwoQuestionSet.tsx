import { useState } from 'react';
import { CheckCircle, RefreshCw } from 'lucide-react';
import { QuestionCard } from '@/components/practice/QuestionCard';
import type { PracticeQuestion } from '@/lib/types';

interface TwoQuestionSetProps {
  questions: PracticeQuestion[];
  onNewSet: () => void;
  pageSize?: number;
  onFinish?: (result: { answers: Record<number, number>; score: number }) => Promise<void> | void;
}

export function TwoQuestionSet({ questions, onNewSet, pageSize = questions.length, onFinish }: TwoQuestionSetProps) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [finished, setFinished] = useState(false);
  const [page, setPage] = useState(0);
  const pageCount = Math.ceil(questions.length / pageSize);
  const visibleQuestions = questions.slice(page * pageSize, (page + 1) * pageSize);

  const answeredCount = Object.keys(answers).length;
  const allAnswered = answeredCount === questions.length;
  const score = questions.reduce((total, question, index) => total + (answers[index] === question.correct_index ? 1 : 0), 0);

  const selectAnswer = (questionIndex: number, optionIndex: number) => {
    setAnswers((previous) => ({ ...previous, [questionIndex]: optionIndex }));
  };

  const finish = async () => {
    setFinished(true);
    await onFinish?.({ answers, score });
  };

  if (finished) {
    return (
      <div className="space-y-4">
        <div className="card p-6 text-center animate-scale-in">
          <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-3">
            <CheckCircle className="w-7 h-7 text-emerald-600" />
          </div>
          <h2 className="text-xl font-heading font-bold text-slate-900">You got {score} of {questions.length} correct</h2>
          <p className="text-sm text-slate-500 mt-1">Review each answer below.</p>
        </div>
        {questions.map((question, index) => (
          <QuestionCard key={question.id} question={question} number={index + 1} selected={answers[index]} revealed />
        ))}
        <div className="flex gap-3">
          <button type="button" onClick={onNewSet} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" /> New Set
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {visibleQuestions.map((question, visibleIndex) => {
        const index = page * pageSize + visibleIndex;
        return (
        <QuestionCard
          key={question.id}
          question={question}
          number={index + 1}
          selected={answers[index]}
          revealed={false}
          onSelect={(optionIndex) => selectAnswer(index, optionIndex)}
        />
      ); })}
      <div className="flex items-center justify-between gap-3 pt-2">
        <p className="text-sm text-slate-500">{answeredCount} of {questions.length} answered</p>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setPage((current) => Math.max(0, current - 1))} disabled={page === 0} className="btn-secondary disabled:opacity-40">
            Previous
          </button>
          {page < pageCount - 1 ? (
            <button type="button" onClick={() => setPage((current) => Math.min(pageCount - 1, current + 1))} className="btn-primary">
              Next
            </button>
          ) : (
            <button type="button" onClick={finish} disabled={!allAnswered} className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed">
              Submit
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
