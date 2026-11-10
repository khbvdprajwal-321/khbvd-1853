import { useState, useEffect } from 'react';
import { ArrowLeft, Clock, CheckCircle, ArrowRight, Calendar } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { generateHomework, homeworkPattern } from '@/lib/question-engine';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import type { HomeworkTracking, Question } from '@/lib/types';

interface HomeworkPageProps {
  subject: string;
}

export function HomeworkPage({ subject }: HomeworkPageProps) {
  const { profile } = useAuth();
  const [homework, setHomework] = useState<HomeworkTracking[]>([]);
  const [currentDay, setCurrentDay] = useState(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResults, setShowResults] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;
    loadHomework();
  }, [profile]);

  async function loadHomework() {
    const { data } = await supabase
      .from('homework_tracking')
      .select('*')
      .eq('user_id', profile!.id)
      .eq('subject', subject)
      .order('assigned_date', { ascending: false })
      .limit(10);

    const hwData = (data || []) as HomeworkTracking[];
    setHomework(hwData);

    // Determine current day in cycle
    const today = hwData.find((h) => h.assigned_date === new Date().toISOString().slice(0, 10));
    if (today) {
      setCurrentDay(today.cycle_day);
      if (today.status === 'completed') {
        setShowResults(true);
      }
    } else {
      // Find next day based on completed homework
      const completedDays = hwData.filter((h) => h.status === 'completed').map((h) => h.cycle_day);
      const lastCompleted = completedDays.sort((a, b) => b - a)[0];
      const nextDay = lastCompleted ? (lastCompleted % 4) + 1 : 1;
      setCurrentDay(nextDay);
    }

    const targetCount = homeworkPattern[currentDay - 1]?.questions || 1;
    setQuestions(generateHomework(subject, currentDay));
    setLoading(false);
  }

  function startHomework() {
    const targetCount = homeworkPattern[currentDay - 1]?.questions || 1;
    setQuestions(generateHomework(subject, currentDay));
    setAnswers({});
    setShowResults(false);
  }

  async function submitHomework() {
    let correct = 0;
    questions.forEach((q, i) => {
      if (answers[i] === q.correctAnswer) correct++;
    });

    // Save homework tracking
    await supabase.from('homework_tracking').insert({
      user_id: profile!.id,
      subject,
      cycle_day: currentDay,
      questions_target: questions.length,
      questions_completed: Object.keys(answers).length,
      status: 'completed',
      completed_at: new Date().toISOString(),
    });

    // Also save as an exam attempt
    await supabase.from('exam_attempts').insert({
      user_id: profile!.id,
      exam_type: 'homework',
      subject,
      total_questions: questions.length,
      correct_answers: correct,
      score_percentage: Math.round((correct / questions.length) * 100),
      question_data: questions,
      answers,
      completed_at: new Date().toISOString(),
    });

    setShowResults(true);
    loadHomework();
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
      </div>
    );
  }

  const targetCount = homeworkPattern[currentDay - 1]?.questions || 1;
  const allAnswered = Object.keys(answers).length === questions.length;

  if (showResults) {
    let correct = 0;
    questions.forEach((q, i) => { if (answers[i] === q.correctAnswer) correct++; });

    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-2xl mx-auto px-4 py-12">
          <div className="card p-8 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-heading font-bold mb-2">Homework Complete!</h1>
            <p className="text-slate-500 mb-6">
              Day {currentDay} — You got {correct} out of {questions.length} correct.
            </p>
            <div className="flex gap-3">
              <button onClick={() => navigate('/dashboard')} className="btn-secondary flex-1">Dashboard</button>
              <button onClick={() => navigate(`/subject/${encodeURIComponent(subject)}`)} className="btn-primary flex-1">Back to Subject</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={() => navigate(`/subject/${encodeURIComponent(subject)}`)}
          className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to {subject}
        </button>

        <div className="card p-6 mb-6 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
          <div className="flex items-center gap-3 mb-4">
            <Clock className="w-6 h-6 text-amber-600" />
            <div>
              <h1 className="text-xl font-heading font-bold text-slate-900">Homework — Day {currentDay}</h1>
              <p className="text-sm text-slate-600">{subject} · {targetCount} question{targetCount > 1 ? 's' : ''} today</p>
            </div>
          </div>

          {/* Cycle progress */}
          <div className="flex items-center gap-2">
            {homeworkPattern.map((day) => {
              const completed = homework.some((h) => h.cycle_day === day.day && h.status === 'completed');
              const isCurrent = day.day === currentDay;
              return (
                <div
                  key={day.day}
                  className={`flex-1 h-2 rounded-full transition-all ${
                    completed ? 'bg-emerald-500' : isCurrent ? 'bg-amber-500' : 'bg-slate-200'
                  }`}
                />
              );
            })}
          </div>
          <div className="flex justify-between mt-1.5">
            {homeworkPattern.map((day) => (
              <span key={day.day} className="text-xs text-slate-400">D{day.day}</span>
            ))}
          </div>
        </div>

        {questions.length === 0 || Object.keys(answers).length === 0 ? (
          <div className="card p-8 text-center">
            <Calendar className="w-10 h-10 text-amber-400 mx-auto mb-3" />
            <h3 className="font-heading font-bold text-lg mb-2">Today's Homework</h3>
            <p className="text-slate-500 text-sm mb-6">
              {targetCount} question{targetCount > 1 ? 's' : ''} in {subject}. Take your time — no timer for homework!
            </p>
            <button onClick={startHomework} className="btn-primary">
              Start Homework
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {questions.map((q, qIdx) => (
              <div key={qIdx} className="card p-5 animate-fade-in" style={{ animationDelay: `${qIdx * 0.1}s`, opacity: 0 }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="w-6 h-6 rounded-lg bg-amber-50 flex items-center justify-center text-xs font-bold text-amber-600">
                    {qIdx + 1}
                  </span>
                  <span className="text-xs text-slate-400">{q.topic}</span>
                </div>
                <h3 className="font-heading font-semibold text-sm text-slate-900 mb-4 leading-relaxed">{q.question}</h3>
                <div className="space-y-2">
                  {q.options.map((option, idx) => {
                    const isSelected = answers[qIdx] === idx;
                    return (
                      <button
                        key={idx}
                        onClick={() => setAnswers({ ...answers, [qIdx]: idx })}
                        className={`w-full p-3 rounded-xl border-2 text-left transition-all duration-200 flex items-center gap-3 ${
                          isSelected ? 'border-amber-500 bg-amber-50' : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 ${isSelected ? 'border-amber-500 bg-amber-500' : 'border-slate-300'}`}>
                          {isSelected && <div className="w-1.5 h-1.5 bg-white rounded-full m-auto mt-[3px]" />}
                        </div>
                        <span className={`text-sm ${isSelected ? 'text-amber-900 font-medium' : 'text-slate-700'}`}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <button
              onClick={submitHomework}
              disabled={!allAnswered}
              className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {allAnswered ? 'Submit Homework' : `Answer all questions (${Object.keys(answers).length}/${questions.length})`}
              {allAnswered && <ArrowRight className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
