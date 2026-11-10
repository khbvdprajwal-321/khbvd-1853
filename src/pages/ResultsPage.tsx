import { useState, useEffect } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, Award, BarChart3 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import type { ExamAttempt, Difficulty } from '@/lib/types';
import { difficultyColors } from '@/lib/question-engine';

interface ResultsPageProps {
  attemptId: string;
}

export function ResultsPage({ attemptId }: ResultsPageProps) {
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from('exam_attempts').select('*').eq('id', attemptId).maybeSingle().then(({ data }) => {
      setAttempt(data as ExamAttempt | null);
      setLoading(false);
    });
  }, [attemptId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  if (!attempt) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <p className="text-slate-500">Results not found.</p>
          <button onClick={() => navigate('/dashboard')} className="btn-primary mt-4">Go to Dashboard</button>
        </div>
      </div>
    );
  }

  const score = attempt.score_percentage || 0;
  const correct = attempt.correct_answers || 0;
  const total = attempt.total_questions;
  const questions = attempt.question_data || [];
  const answers = attempt.answers || {};
  const breakdown = (attempt.difficulty_breakdown || {}) as Record<Difficulty, { correct: number; total: number }>;

  const scoreColor = score >= 70 ? 'emerald' : score >= 40 ? 'amber' : 'rose';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        {/* Score Card */}
        <div className="card p-8 mb-6 text-center">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 bg-${scoreColor}-100`}>
            <span className={`text-3xl font-heading font-bold text-${scoreColor}-600`}>{score}%</span>
          </div>
          <h1 className="text-2xl font-heading font-bold mb-1">{attempt.subject} Results</h1>
          <p className="text-slate-500 text-sm mb-6">
            {correct} out of {total} correct — {new Date(attempt.started_at).toLocaleDateString()}
          </p>

          {/* Difficulty Breakdown */}
          <div className="grid grid-cols-3 gap-3">
            {(['easy', 'medium', 'difficult'] as Difficulty[]).map((diff) => {
              const data = breakdown[diff];
              if (!data) return null;
              return (
                <div key={diff} className="p-3 rounded-xl bg-slate-50">
                  <div className={`text-xs font-semibold capitalize mb-1 ${difficultyColors[diff].split(' ')[0]}`}>{diff}</div>
                  <div className="text-lg font-bold text-slate-900">{data.correct}/{data.total}</div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full mt-1.5 overflow-hidden">
                    <div className={`h-full rounded-full ${diff === 'easy' ? 'bg-emerald-500' : diff === 'medium' ? 'bg-amber-500' : 'bg-rose-500'}`} style={{ width: `${data.total > 0 ? (data.correct / data.total) * 100 : 0}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Question Review */}
        <h2 className="font-heading font-bold text-lg mb-4">Question Review</h2>
        <div className="space-y-4">
          {questions.map((q, idx) => {
            const userAnswer = answers[idx];
            const isCorrect = userAnswer === q.correctAnswer;
            const isUnanswered = userAnswer === undefined;
            return (
              <div key={idx} className="card p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${isCorrect ? 'bg-emerald-100' : 'bg-rose-100'}`}>
                    {isCorrect ? <CheckCircle className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-rose-600" />}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-slate-400">Q{idx + 1}</span>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-semibold border ${difficultyColors[q.difficulty]}`}>{q.difficulty}</span>
                      <span className="text-xs text-slate-400">{q.topic}</span>
                    </div>
                    <p className="font-heading font-semibold text-sm text-slate-900 mb-3">{q.question}</p>
                    <div className="space-y-2">
                      {q.options.map((opt, oIdx) => {
                        const isUserChoice = userAnswer === oIdx;
                        const isRightAnswer = q.correctAnswer === oIdx;
                        return (
                          <div key={oIdx} className={`p-2.5 rounded-lg border text-sm flex items-center gap-2 ${
                            isRightAnswer ? 'border-emerald-300 bg-emerald-50 text-emerald-900' :
                            isUserChoice ? 'border-rose-300 bg-rose-50 text-rose-900' :
                            'border-slate-200 text-slate-600'
                          }`}>
                            <span className="font-semibold">{String.fromCharCode(65 + oIdx)}.</span>
                            <span className="flex-1">{opt}</span>
                            {isRightAnswer && <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />}
                            {isUserChoice && !isRightAnswer && <XCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                    {isUnanswered && <p className="text-xs text-amber-600 mt-2">Not answered</p>}
                    <div className="mt-3 p-2.5 bg-teal-50 rounded-lg">
                      <p className="text-xs text-teal-800"><span className="font-semibold">Explanation: </span>{q.explanation}</p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex gap-3 mt-6">
          <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
          <button onClick={() => navigate(`/exam/${encodeURIComponent(attempt.subject)}/subject`)} className="btn-primary flex-1">Retake Exam</button>
        </div>
      </div>
    </div>
  );
}
