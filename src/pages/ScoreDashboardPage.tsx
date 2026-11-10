import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Award, BarChart3, Clock, Target } from 'lucide-react';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import type { ExamAttempt } from '@/lib/types';

interface ScoreDashboardPageProps {
  track: string;
}

const TRACK_NAMES: Record<string, string> = {
  cet: 'CET', neet: 'NEET', jee: 'JEE', sslc: 'SSLC', degree: 'Degree',
  'degree-it': 'BE / B.Tech · IT',
  'degree-nonit': 'BE / B.Tech · Non-IT',
  'business-hr': 'Business Postgraduate · HR',
  'business-operations': 'Business Postgraduate · Operations',
  'business-management': 'Business Postgraduate · Business Management',
};

const DEGREE_TRACKS = ['degree-it', 'degree-nonit', 'business-hr', 'business-operations', 'business-management'];

export function ScoreDashboardPage({ track }: ScoreDashboardPageProps) {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState<ExamAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!profile) return;
    let active = true;
    let query = supabase.from('exam_attempts').select('*').eq('user_id', profile.id).eq('assessment_mode', 'mock');
    query = track === 'degree'
      ? query.in('track', DEGREE_TRACKS)
      : query.eq('track', track);
    query.order('started_at', { ascending: false }).then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError('Scores could not be loaded. Please try again later.');
      setAttempts((data ?? []) as ExamAttempt[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, [profile, track]);

  const average = attempts.length
    ? Math.round(attempts.reduce((sum, attempt) => sum + (attempt.score_percentage ?? 0), 0) / attempts.length)
    : 0;
  const highest = attempts.reduce((best, attempt) => Math.max(best, attempt.score_percentage ?? 0), 0);
  const totalMarks = attempts.reduce((sum, attempt) => sum + (attempt.correct_answers ?? 0), 0);
  const subjectSummaries = useMemo(() => {
    const groups = new Map<string, ExamAttempt[]>();
    attempts.forEach((attempt) => groups.set(attempt.subject, [...(groups.get(attempt.subject) ?? []), attempt]));
    return [...groups.entries()].map(([subject, entries]) => ({
      subject,
      attempts: entries.length,
      highest: Math.max(...entries.map((entry) => entry.score_percentage ?? 0)),
      average: Math.round(entries.reduce((sum, entry) => sum + (entry.score_percentage ?? 0), 0) / entries.length),
    }));
  }, [attempts]);

  const backPath = track === 'degree' ? '/learn/degree' : track === 'sslc' ? '/learn/sslc' : `/learn/${track}`;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button type="button" onClick={() => navigate(backPath)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <div className="mb-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Mock test performance</p>
          <h1 className="text-2xl font-heading font-bold text-slate-900 mt-1">{TRACK_NAMES[track] ?? 'Score Dashboard'}</h1>
        </div>
        {loading ? (
          <div className="card p-10 flex justify-center"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
        ) : error ? (
          <div role="alert" className="card p-6 text-rose-700">{error}</div>
        ) : (
          <>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[
                { label: 'Mock attempts', value: attempts.length, icon: Target },
                { label: 'Total correct', value: totalMarks, icon: BarChart3 },
                { label: 'Highest score', value: `${highest}%`, icon: Award },
                { label: 'Average score', value: `${average}%`, icon: Clock },
              ].map((stat) => <div key={stat.label} className="card p-5">
                <stat.icon className="w-5 h-5 text-teal-700 mb-3" />
                <p className="text-2xl font-heading font-bold text-slate-900">{stat.value}</p>
                <p className="text-sm text-slate-500">{stat.label}</p>
              </div>)}
            </div>

            <section className="mb-8">
              <h2 className="font-heading font-bold text-lg text-slate-900 mb-3">Subject performance</h2>
              {subjectSummaries.length ? <div className="overflow-x-auto card">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-100 text-slate-600"><tr><th className="p-3">Subject</th><th className="p-3">Attempts</th><th className="p-3">Highest</th><th className="p-3">Average</th></tr></thead>
                  <tbody>{subjectSummaries.map((summary) => <tr key={summary.subject} className="border-t border-slate-100">
                    <td className="p-3 font-semibold text-slate-800">{summary.subject}</td><td className="p-3">{summary.attempts}</td><td className="p-3">{summary.highest}%</td><td className="p-3">{summary.average}%</td>
                  </tr>)}</tbody>
                </table>
              </div> : <div className="card p-6 text-sm text-slate-500">No mock test scores recorded for this learning path yet.</div>}
            </section>

            <section>
              <h2 className="font-heading font-bold text-lg text-slate-900 mb-3">Attempt history</h2>
              <div className="space-y-2">
                {attempts.map((attempt) => <article key={attempt.id} className="card p-4 flex flex-wrap items-center justify-between gap-3">
                  <div><h3 className="font-semibold text-slate-900">{attempt.subject}</h3><p className="text-xs text-slate-500 mt-1">{new Date(attempt.started_at).toLocaleString()} · {attempt.total_questions} questions</p></div>
                  <div className="text-right"><p className="font-heading font-bold text-teal-800">{attempt.correct_answers ?? 0}/{attempt.total_questions}</p><p className="text-xs text-slate-500">{attempt.score_percentage ?? 0}%</p></div>
                </article>)}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
}