import { useState, useEffect, useCallback, useRef } from 'react';
import { Clock, ChevronLeft, ChevronRight, AlertCircle, CheckCircle, XCircle, ShieldAlert, Medal, Award, Shield, RefreshCw, Eye, EyeOff, Star } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { generateExam, generateAssignment, difficultyColors, getScoreTier, tierConfig, type ScoreTier } from '@/lib/question-engine';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import type { Question, Difficulty } from '@/lib/types';

interface ExamPageProps {
  subject: string;
  examType: string;
}

const TIME_PER_QUESTION = 25;
const TOTAL_QUESTIONS = 25;

const tierIcons: Record<ScoreTier, React.ComponentType<{ className?: string }>> = {
  gold: Medal,
  silver: Award,
  bronze: Shield,
  try_again: RefreshCw,
};

export function ExamPage({ subject, examType }: ExamPageProps) {
  const { profile } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [timeLeft, setTimeLeft] = useState(TIME_PER_QUESTION);
  const [examStarted, setExamStarted] = useState(false);
  const [examFinished, setExamFinished] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);
  const [attemptId, setAttemptId] = useState<string>('');
  const [cheatDetected, setCheatDetected] = useState(false);
  const [showAntiCheatWarning, setShowAntiCheatWarning] = useState(false);
  const [violationCount, setViolationCount] = useState(0);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSaved, setReviewSaved] = useState(false);
  const [reviewSaving, setReviewSaving] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isAssignment = examType === 'assignment';

  useEffect(() => {
    const qs = isAssignment ? generateAssignment(subject, 10) : generateExam(subject, TOTAL_QUESTIONS);
    setQuestions(qs);
    setLoading(false);
  }, [subject, isAssignment]);

  // Anti-cheat: visibility change (tab switch / app switch)
  useEffect(() => {
    if (!examStarted || examFinished || cheatDetected) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        const newCount = violationCount + 1;
        setViolationCount(newCount);
        setShowAntiCheatWarning(true);
        if (newCount >= 1) {
          triggerCheatDetection();
        }
      }
    };

    const handleBlur = () => {
      if (examStarted && !examFinished && !cheatDetected) {
        const newCount = violationCount + 1;
        setViolationCount(newCount);
        setShowAntiCheatWarning(true);
        if (newCount >= 1) {
          triggerCheatDetection();
        }
      }
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
      setShowAntiCheatWarning(true);
    };

    const handleKeyCombo = (e: KeyboardEvent) => {
      if (e.key === 'PrintScreen' || (e.ctrlKey && e.key === 'c') || (e.metaKey && e.key === 'c')) {
        e.preventDefault();
        setShowAntiCheatWarning(true);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyCombo);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyCombo);
    };
  }, [examStarted, examFinished, cheatDetected, violationCount]);

  const triggerCheatDetection = useCallback(() => {
    setCheatDetected(true);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const finishExam = useCallback(async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setExamFinished(true);

    let correct = 0;
    const diffBreakdown: Record<Difficulty, { correct: number; total: number }> = {
      easy: { correct: 0, total: 0 },
      medium: { correct: 0, total: 0 },
      difficult: { correct: 0, total: 0 },
    };

    questions.forEach((q, i) => {
      diffBreakdown[q.difficulty].total++;
      if (answers[i] === q.correctAnswer) {
        correct++;
        diffBreakdown[q.difficulty].correct++;
      }
    });

    const score = Math.round((correct / questions.length) * 100);

    const { data } = await supabase.from('exam_attempts').insert({
      user_id: profile!.id,
      exam_type: examType,
      subject,
      total_questions: questions.length,
      correct_answers: correct,
      score_percentage: score,
      difficulty_breakdown: diffBreakdown,
      question_data: questions,
      answers,
      completed_at: new Date().toISOString(),
    }).select('id').single();

    if (data) {
      setAttemptId(data.id);
      setShowResults(true);
    }
  }, [answers, questions, subject, examType, profile]);

  const nextQuestion = useCallback(() => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
      setTimeLeft(TIME_PER_QUESTION);
    } else {
      finishExam();
    }
  }, [currentQ, questions.length, finishExam]);

  useEffect(() => {
    if (!examStarted || examFinished || cheatDetected) return;
    if (isAssignment) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextQuestion();
          return TIME_PER_QUESTION;
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [examStarted, examFinished, cheatDetected, isAssignment, currentQ, nextQuestion]);

  const selectAnswer = (qIndex: number, optionIndex: number) => {
    setAnswers({ ...answers, [qIndex]: optionIndex });
  };

  const startExam = () => {
    setExamStarted(true);
    setTimeLeft(TIME_PER_QUESTION);
  };

  const saveReview = async () => {
    if (!profile || !attemptId || reviewRating === 0) return;
    setReviewSaving(true);
    const { error } = await supabase.from('exam_reviews').upsert({
      attempt_id: attemptId,
      user_id: profile.id,
      rating: reviewRating,
      comment: reviewComment.trim() || null,
    }, { onConflict: 'attempt_id' });
    if (!error) setReviewSaved(true);
    setReviewSaving(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  // Cheat detected screen
  if (cheatDetected) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="card p-8 max-w-md text-center animate-scale-in">
          <div className="w-20 h-20 rounded-full bg-rose-100 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-10 h-10 text-rose-600" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-rose-900 mb-2">Exam Reset</h1>
          <p className="text-slate-600 mb-2">
            You switched away from the exam or attempted to take a screenshot.
          </p>
          <p className="text-sm text-slate-500 mb-6">
            This counts as a <span className="font-semibold text-rose-600">Try Again</span> result.
            Anti-cheat protection ensures fair testing for all students.
          </p>
          <div className="flex flex-col gap-3">
            <button onClick={() => navigate('/dashboard')} className="btn-primary">Back to Dashboard</button>
            <button onClick={() => { setCheatDetected(false); setExamStarted(false); setExamFinished(false); setAnswers({}); setCurrentQ(0); setViolationCount(0); }} className="btn-ghost text-sm">
              Retake Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });
    const score = Math.round((correct / questions.length) * 100);
    const tier = getScoreTier(correct);
    const TierIcon = tierIcons[tier];
    const tierInfo = tierConfig[tier];

    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="card p-8 text-center animate-scale-in">
            <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${tierInfo.bgColor} border-2 ${tierInfo.borderColor}`}>
              <TierIcon className={`w-12 h-12 ${tierInfo.color}`} />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-1">{tierInfo.label}</h1>
            <p className="text-slate-500 text-sm mb-2">{tierInfo.description}</p>
            <p className="text-3xl font-heading font-bold text-slate-900 mb-4">{score}%</p>
            <p className="text-slate-500 mb-6">
              You scored {correct} out of {questions.length} correct answers.
            </p>
            <div className="grid grid-cols-3 gap-3 mb-6">
              {(['easy', 'medium', 'difficult'] as Difficulty[]).map((diff) => {
                const total = questions.filter((q) => q.difficulty === diff).length;
                const right = questions.filter((q, i) => q.difficulty === diff && answers[i] === q.correctAnswer).length;
                return (
                  <div key={diff} className="p-3 rounded-xl bg-slate-50">
                    <div className={`text-xs font-semibold capitalize mb-1 ${difficultyColors[diff].split(' ')[0]}`}>{diff}</div>
                    <div className="text-lg font-bold text-slate-900">{right}/{total}</div>
                  </div>
                );
              })}
            </div>
            <div className="p-5 bg-amber-50 border border-amber-200 rounded-xl mb-6 text-left">
              <div className="flex items-center gap-2 mb-2">
                <Star className="w-5 h-5 text-amber-600" />
                <h2 className="font-heading font-bold text-slate-900">How was this {isAssignment ? 'assignment' : 'exam'}?</h2>
              </div>
              <p className="text-sm text-slate-600 mb-3">Your feedback helps KHBV.D improve your learning experience.</p>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button" onClick={() => { setReviewRating(star); setReviewSaved(false); }} className="p-1" aria-label={`${star} star${star > 1 ? 's' : ''}`}>
                    <Star className={`w-7 h-7 transition-colors ${star <= reviewRating ? 'fill-amber-400 text-amber-500' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
              <textarea value={reviewComment} onChange={(event) => { setReviewComment(event.target.value); setReviewSaved(false); }} className="input-field min-h-20 mb-3" placeholder="Optional: tell us what helped or what felt difficult" />
              <button onClick={saveReview} disabled={reviewRating === 0 || reviewSaving || reviewSaved} className="px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-semibold disabled:opacity-50 hover:bg-amber-700 transition-colors">
                {reviewSaved ? 'Review Saved' : reviewSaving ? 'Saving...' : 'Submit Review'}
              </button>
            </div>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
              <button onClick={() => navigate(`/results/${attemptId}`)} className="btn-primary flex-1">View Details</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="card p-8 animate-fade-in-up">
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-teal-600" />
              </div>
              <h1 className="text-2xl font-heading font-bold mb-2">
                {isAssignment ? `${subject} Assignment` : `${subject} Exam`}
              </h1>
              <p className="text-slate-500">
                {isAssignment ? 'Practice questions from previous years' : 'Get ready to test your knowledge!'}
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <div className="text-2xl font-heading font-bold text-slate-900">{questions.length}</div>
                <div className="text-xs text-slate-500 mt-1">Questions</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <div className="text-2xl font-heading font-bold text-slate-900">{isAssignment ? 'No timer' : `${TIME_PER_QUESTION}s`}</div>
                <div className="text-xs text-slate-500 mt-1">{isAssignment ? 'Untimed' : 'Per Question'}</div>
              </div>
              <div className="text-center p-4 rounded-xl bg-slate-50">
                <div className="text-2xl font-heading font-bold text-slate-900">30/50/20</div>
                <div className="text-xs text-slate-500 mt-1">E/M/D Split</div>
              </div>
            </div>

            {/* Score tier info */}
            {!isAssignment && (
              <div className="p-4 bg-slate-50 rounded-xl mb-6">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Score Tiers</p>
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { label: 'Gold', desc: '20+', color: 'text-amber-700', bg: 'bg-amber-100' },
                    { label: 'Silver', desc: '15-19', color: 'text-slate-600', bg: 'bg-slate-200' },
                    { label: 'Bronze', desc: '10-14', color: 'text-orange-700', bg: 'bg-orange-100' },
                    { label: 'Try Again', desc: '1-9', color: 'text-rose-600', bg: 'bg-rose-100' },
                  ].map((t) => (
                    <div key={t.label} className={`text-center p-2 rounded-lg ${t.bg}`}>
                      <div className={`text-xs font-bold ${t.color}`}>{t.label}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{t.desc}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl mb-6">
              <div className="flex items-start gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-rose-800">
                  <p className="font-semibold mb-1">Anti-Cheat Protection:</p>
                  <ul className="space-y-0.5 text-xs">
                    <li>No screenshots allowed during the exam</li>
                    <li>Switching tabs or apps will reset the exam</li>
                    <li>Copying is disabled during the exam</li>
                    {!isAssignment && <li>Each question has a {TIME_PER_QUESTION}-second timer</li>}
                  </ul>
                </div>
              </div>
            </div>

            <button onClick={startExam} className="btn-primary w-full text-base py-4">
              {isAssignment ? 'Start Assignment' : 'Start Exam'}
            </button>
            <button onClick={() => navigate('/dashboard')} className="btn-ghost w-full mt-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQ];
  const progress = ((currentQ + 1) / questions.length) * 100;
  const timeColor = timeLeft <= 5 ? 'text-rose-600' : timeLeft <= 10 ? 'text-amber-600' : 'text-teal-600';

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      {/* Anti-cheat warning toast */}
      {showAntiCheatWarning && !cheatDetected && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 px-4 py-3 bg-rose-600 text-white rounded-xl shadow-lg flex items-center gap-2 animate-fade-in">
          <ShieldAlert className="w-5 h-5" />
          <span className="text-sm font-semibold">Warning: Do not switch tabs or take screenshots!</span>
          <button onClick={() => setShowAntiCheatWarning(false)} className="ml-2">
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Progress bar */}
      <div className="sticky top-16 z-40 bg-white border-b border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-slate-700">
              Question {currentQ + 1} of {questions.length}
            </span>
            <div className="flex items-center gap-3">
              {!isAssignment && (
                <div className="flex items-center gap-2">
                  <Clock className={`w-5 h-5 ${timeColor}`} />
                  <span className={`text-lg font-heading font-bold ${timeColor} ${timeLeft <= 5 ? 'animate-pulse' : ''}`}>
                    {timeLeft}s
                  </span>
                </div>
              )}
              <div className="flex items-center gap-1 text-xs text-slate-400">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                <span>Protected</span>
              </div>
            </div>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-teal-500 rounded-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="card p-6 sm:p-8 animate-fade-in" key={currentQ}>
          <div className="flex items-center gap-2 mb-4 flex-wrap">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold border ${difficultyColors[question.difficulty]}`}>
              {question.difficulty}
            </span>
            <span className="text-xs text-slate-400">{question.topic}</span>
            {question.yearAsked && (
              <span className="px-2 py-1 rounded-md text-xs font-semibold bg-indigo-50 text-indigo-600 border border-indigo-200">
                Asked in {question.yearAsked}
              </span>
            )}
          </div>

          <h2 className="text-lg sm:text-xl font-heading font-semibold text-slate-900 mb-6 leading-relaxed">
            {question.question}
          </h2>

          <div className="space-y-3">
            {question.options.map((option, idx) => {
              const isSelected = answers[currentQ] === idx;
              return (
                <button
                  key={idx}
                  onClick={() => selectAnswer(currentQ, idx)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                    isSelected
                      ? 'border-teal-500 bg-teal-50'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-teal-500 bg-teal-500' : 'border-slate-300'
                  }`}>
                    {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                  </div>
                  <span className={`text-sm ${isSelected ? 'text-teal-900 font-medium' : 'text-slate-700'}`}>
                    {option}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between mt-8">
            <button
              onClick={() => currentQ > 0 && setCurrentQ(currentQ - 1)}
              disabled={currentQ === 0}
              className="btn-ghost flex items-center gap-1 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="w-4 h-4" /> Prev
            </button>

            <div className="flex gap-1">
              {questions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentQ(i)}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === currentQ ? 'bg-teal-600 w-6' : answers[i] !== undefined ? 'bg-teal-300' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {currentQ === questions.length - 1 ? (
              <button onClick={finishExam} className="btn-primary text-sm flex items-center gap-1">
                Finish <CheckCircle className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={nextQuestion} className="btn-primary text-sm flex items-center gap-1">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
