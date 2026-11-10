import { CheckCircle, XCircle } from 'lucide-react';
import { getSSLCPracticeLabels } from '@/lib/sslc-practice-labels';
import type { PracticeQuestion } from '@/lib/types';

interface QuestionCardProps {
  question: PracticeQuestion;
  number: number;
  selected: number | undefined;
  revealed: boolean;
  onSelect?: (optionIndex: number) => void;
  answerVisible?: boolean;
  onToggleAnswer?: () => void;
  showDifficulty?: boolean;
}

export function QuestionCard({
  question,
  number,
  selected,
  revealed,
  onSelect,
  answerVisible = false,
  onToggleAnswer,
  showDifficulty = false,
}: QuestionCardProps) {
  const answered = selected !== undefined;
  const wasCorrect = answered && selected === question.correct_index;
  const showAnswer = revealed || answerVisible;
  const explanationSteps = question.explanation.split(/(?<=[.!?])\s+/).filter(Boolean);
  const labels = getSSLCPracticeLabels(question.language);

  return (
    <div className="card p-5 sm:p-6 animate-fade-in">
      <div className="flex items-center gap-2 mb-3 flex-wrap">
        <span className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center text-xs font-bold text-teal-700">{number}</span>
        <span className="text-xs font-semibold text-slate-600">{question.subject}</span>
        <span className="text-xs text-slate-400">{question.topic}</span>
        {showDifficulty && (
          <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
            question.difficulty === 'difficult'
              ? 'bg-rose-50 text-rose-700'
              : question.difficulty === 'easy'
                ? 'bg-emerald-50 text-emerald-700'
                : 'bg-amber-50 text-amber-700'
          }`}>
            {labels.difficulty[question.difficulty]}
          </span>
        )}
        {question.source_type === 'previous_year' && question.source_url && question.source_verified_at ? (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            {labels.verifiedPreviousYear}{question.year_asked ? ` · ${question.year_asked}` : ''}
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-md text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
            {question.source_type === 'generated' ? labels.generatedPractice : labels.practiceQuestion}
          </span>
        )}
        {revealed && (
          <span className={`ml-auto flex items-center gap-1 text-xs font-semibold ${wasCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
            {wasCorrect ? <CheckCircle className="w-4 h-4" /> : <XCircle className="w-4 h-4" />}
            {answered ? (wasCorrect ? labels.correct : labels.incorrect) : labels.notAnswered}
          </span>
        )}
      </div>

      <h3 dir={question.language === 'Urdu' ? 'rtl' : undefined} className="font-heading font-semibold text-base text-slate-900 mb-4 leading-relaxed">{question.question}</h3>

      <div className="space-y-2">
        {question.options.map((option, optionIndex) => {
          const isCorrect = optionIndex === question.correct_index;
          const isSelected = selected === optionIndex;
          let style = 'border-slate-200 bg-white text-slate-700 hover:border-teal-300';
          if (showAnswer && isCorrect) style = 'border-emerald-400 bg-emerald-50 text-emerald-900';
          else if (showAnswer && isSelected) style = 'border-rose-400 bg-rose-50 text-rose-900';
          else if (!showAnswer && isSelected) style = 'border-teal-500 bg-teal-50 text-teal-900';

          return (
            <button
              key={optionIndex}
              type="button"
              disabled={showAnswer || !onSelect}
              onClick={() => onSelect?.(optionIndex)}
              className={`w-full p-3.5 rounded-xl border-2 text-left text-sm flex items-center gap-3 transition-all duration-200 disabled:cursor-default ${style}`}
            >
              <span className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold flex-shrink-0 opacity-80">
                {String.fromCharCode(65 + optionIndex)}
              </span>
              <span dir={question.language === 'Urdu' ? 'rtl' : undefined} className="flex-1">{option}</span>
            </button>
          );
        })}
      </div>

      {onToggleAnswer && !revealed && (
        <button
          type="button"
          aria-expanded={answerVisible}
          onClick={onToggleAnswer}
          className="btn-secondary mt-4 text-sm"
        >
          {answerVisible ? labels.hideAnswer : labels.showAnswer}
        </button>
      )}

      {showAnswer && (
        <div className="mt-4 p-4 bg-teal-50 rounded-xl" aria-live="polite">
          <p className="text-xs font-semibold text-teal-800 mb-1">{labels.correctAnswer}</p>
          <p className="text-sm text-teal-900 font-medium">
            {String.fromCharCode(65 + question.correct_index)}. {question.options[question.correct_index]}
          </p>
          <p className="text-xs font-semibold text-teal-800 mt-3 mb-1">{labels.whyCorrect}</p>
          <ol className="list-decimal pl-5 space-y-1 text-sm text-teal-900 leading-relaxed">
            {explanationSteps.map((step, index) => <li key={`${index}-${step}`}>{step}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
