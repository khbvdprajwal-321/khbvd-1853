import { useState, useEffect, useRef, useCallback } from 'react';
import { GraduationCap, BookOpen, Brain, TrendingUp, Clock, Award, ArrowRight, BarChart3, FileText, Briefcase, Target, Flame, CheckCircle, BellRing, X, WifiOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { degreeTypes, homeworkPattern, getDepartmentSubjects, departments } from '@/lib/question-engine';
import { getDailyThought } from '@/lib/daily-thought';
import { getCurrentSSLCAcademicYear, type SSLCLanguageCategory } from '@/lib/sslc-content';
import type { ExamAttempt, HomeworkTracking } from '@/lib/types';

type DashboardAttempt = Pick<ExamAttempt, 'id' | 'subject' | 'total_questions' | 'correct_answers' | 'score_percentage' | 'started_at'>;
type DashboardHomework = Pick<HomeworkTracking, 'subject' | 'cycle_day' | 'status' | 'assigned_date'>;
type SSLCProgressSubject = { key: string; label: string; subject: string; category?: SSLCLanguageCategory };
type SSLCChapterProgress = { id: string; subject: string; language_category: SSLCLanguageCategory | null };
type SSLCLearningProgress = { subject: string; seen_question_ids: unknown; completed_sets: number };
type SSLCMockProgress = { subject: string; assessment_mode: string | null; score_percentage: number | null };

const PUC_EXAMS = [
  { id: 'cet', name: 'CET', detail: 'Karnataka CET entrance preparation' },
  { id: 'neet', name: 'NEET', detail: 'NEET medical entrance preparation' },
  { id: 'jee', name: 'JEE', detail: 'JEE engineering entrance preparation' },
];

export function DashboardPage() {
  const { profile } = useAuth();
  const [attempts, setAttempts] = useState<DashboardAttempt[]>([]);
  const [homework, setHomework] = useState<DashboardHomework[]>([]);
  const [streak, setStreak] = useState(0);
  const [showAssignmentReminder, setShowAssignmentReminder] = useState(false);
  const [activityLoading, setActivityLoading] = useState(true);
  const [activityError, setActivityError] = useState('');
  const [isOffline, setIsOffline] = useState(() => typeof navigator !== 'undefined' && !navigator.onLine);
  const [sslcChapters, setSslcChapters] = useState<SSLCChapterProgress[]>([]);
  const [sslcCompletedLessons, setSslcCompletedLessons] = useState<Set<string>>(new Set());
  const [sslcLearningProgress, setSslcLearningProgress] = useState<SSLCLearningProgress[]>([]);
  const [sslcAttempts, setSslcAttempts] = useState<SSLCMockProgress[]>([]);
  const [sslcProgressLoading, setSslcProgressLoading] = useState(false);
  const [sslcProgressError, setSslcProgressError] = useState('');
  const reminderTimerRef = useRef<number | null>(null);

  const loadData = useCallback(async () => {
    if (!profile) return;
    setActivityLoading(true);
    setActivityError('');
    const results = await Promise.all([
      supabase.from('exam_attempts')
        .select('id, subject, total_questions, correct_answers, score_percentage, started_at')
        .eq('user_id', profile.id)
        .order('started_at', { ascending: false })
        .limit(10),
      supabase.from('homework_tracking')
        .select('subject, cycle_day, status, assigned_date')
        .eq('user_id', profile.id)
        .order('assigned_date', { ascending: false })
        .limit(7),
    ]).then((responses) => responses, () => null);

    if (!results) {
      setActivityError('Recent activity is temporarily unavailable. Check your connection and try again.');
      setActivityLoading(false);
      return;
    }
    const [examRes, hwRes] = results;
    if (examRes.error || hwRes.error) {
      setActivityError('Recent activity is temporarily unavailable. Check your connection and try again.');
    }

    const examData = examRes.data || [];
    const homeworkData = hwRes.data || [];
    setAttempts(examData as DashboardAttempt[]);
    setHomework(homeworkData as DashboardHomework[]);
    setStreak(homeworkData.filter((item) => item.status === 'completed').length);

    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const todayHomework = homeworkData.find((item) => item.assigned_date === today);
    if ((!todayHomework || todayHomework.status !== 'completed') && navigator.onLine) {
      if (reminderTimerRef.current !== null) window.clearTimeout(reminderTimerRef.current);
      reminderTimerRef.current = window.setTimeout(() => setShowAssignmentReminder(true), 2000);
    }
    setActivityLoading(false);
  }, [profile]);

  useEffect(() => {
    void loadData();
    return () => {
      if (reminderTimerRef.current !== null) window.clearTimeout(reminderTimerRef.current);
    };
  }, [loadData]);

  useEffect(() => {
    const updateOnlineStatus = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, []);

  useEffect(() => {
    if (profile?.user_type !== 'school') {
      setSslcChapters([]);
      setSslcCompletedLessons(new Set());
      setSslcLearningProgress([]);
      setSslcAttempts([]);
      setSslcProgressError('');
      return;
    }

    let active = true;
    setSslcProgressLoading(true);
    setSslcProgressError('');
    const loadSSLCProgress = async () => {
      try {
        const [chapterResult, lessonResult, learningResult, attemptResult] = await Promise.all([
          supabase.from('sslc_chapters')
            .select('id, subject, language_category')
            .eq('academic_year', getCurrentSSLCAcademicYear())
            .eq('curriculum_status', 'included')
            .not('source_url', 'is', null)
            .not('source_verified_at', 'is', null)
            .range(0, 199)
            .returns<SSLCChapterProgress[]>(),
          supabase.from('sslc_lesson_progress')
            .select('chapter_id')
            .eq('user_id', profile.id)
            .range(0, 499)
            .returns<{ chapter_id: string }[]>(),
          supabase.from('learning_progress')
            .select('subject, seen_question_ids, completed_sets')
            .eq('user_id', profile.id)
            .eq('track', 'sslc')
            .range(0, 199)
            .returns<SSLCLearningProgress[]>(),
          supabase.from('exam_attempts')
            .select('subject, assessment_mode, score_percentage')
            .eq('user_id', profile.id)
            .eq('track', 'sslc')
            .in('assessment_mode', ['assignment', 'mock'])
            .order('started_at', { ascending: false })
            .range(0, 199)
            .returns<SSLCMockProgress[]>(),
        ]);
        if (!active) return;
        const failed = [chapterResult, lessonResult, learningResult, attemptResult].some((result) => result.error);
        if (failed) {
          setSslcProgressError('SSLC progress is temporarily unavailable. Apply the latest SSLC migration and retry.');
        } else {
          setSslcChapters(chapterResult.data ?? []);
          setSslcCompletedLessons(new Set((lessonResult.data ?? []).map((row) => row.chapter_id)));
          setSslcLearningProgress(learningResult.data ?? []);
          setSslcAttempts(attemptResult.data ?? []);
        }
      } catch {
        if (!active) return;
        setSslcProgressError('SSLC progress is temporarily unavailable. Check your connection and retry.');
      } finally {
        if (active) setSslcProgressLoading(false);
      }
    };
    void loadSSLCProgress();
    return () => { active = false; };
  }, [profile]);

  // Request notification permission for assignment alarms
  useEffect(() => {
    if (profile?.user_type === 'puc' && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [profile?.user_type]);

  // Assignment reminder notification
  useEffect(() => {
    if (showAssignmentReminder && profile?.user_type === 'puc' && 'Notification' in window && Notification.permission === 'granted') {
      new Notification('KHBV.D Assignment Reminder', {
        body: 'Your daily homework assignment is waiting! Keep your streak alive.',
        icon: '/vite.svg',
      });
    }
  }, [showAssignmentReminder, profile?.user_type]);

  if (!profile) return null;

  const isPUC = profile.user_type === 'puc';
  const isSchool = profile.user_type === 'school';
  const allowedPucExams = profile.puc_group === 'pcmb'
    ? ['cet', 'neet']
    : profile.puc_group === 'pcm'
      ? ['cet', 'jee']
      : profile.exam_stream ? [profile.exam_stream] : [];
  const availablePucExams = PUC_EXAMS.filter((exam) => allowedPucExams.includes(exam.id));
  const subjects = isSchool ? [
    { id: 'first-language', title: 'First Language', value: profile.first_language, languageCategory: 'first_language' },
    { id: 'second-language', title: 'Second Language', value: profile.second_language, languageCategory: 'second_language' },
    { id: 'third-language', title: 'Third Language', value: profile.third_language, languageCategory: 'third_language' },
    { id: 'Mathematics', title: 'Mathematics', value: null, languageCategory: null },
    { id: 'Science', title: 'Science', value: null, languageCategory: null },
    { id: 'Social Science', title: 'Social Science', value: null, languageCategory: null },
  ] : [];
  const departmentSubjects = !isPUC && profile.department ? getDepartmentSubjects(profile.department) : [];
  const departmentName = departments.find((d) => d.id === profile.department)?.name;
  const dailyThought = getDailyThought(profile.first_language);
  const thoughtDate = new Date(`${dailyThought.dateKey}T12:00:00`).toLocaleDateString(dailyThought.locale, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const sslcProgressSubjects: SSLCProgressSubject[] = [
    ...(profile.first_language ? [{ key: `first_language:${profile.first_language}`, label: `First Language · ${profile.first_language}`, subject: profile.first_language, category: 'first_language' as const }] : []),
    ...(profile.second_language ? [{ key: `second_language:${profile.second_language}`, label: `Second Language · ${profile.second_language}`, subject: profile.second_language, category: 'second_language' as const }] : []),
    ...(profile.third_language ? [{ key: `third_language:${profile.third_language}`, label: `Third Language · ${profile.third_language}`, subject: profile.third_language, category: 'third_language' as const }] : []),
    ...['Mathematics', 'Science', 'Social Science'].map((subject) => ({ key: subject, label: subject, subject })),
  ];
  const sslcProgressRows = sslcProgressSubjects.map((item) => {
    const matchesSubject = (value: string) => value === item.key
      || value.startsWith(`${item.key}:`)
      || value.startsWith(`${item.key} ·`);
    const chapters = sslcChapters.filter((chapter) => chapter.subject === item.subject
      && (item.category ? chapter.language_category === item.category : chapter.language_category === null));
    const completedLessons = chapters.filter((chapter) => sslcCompletedLessons.has(chapter.id)).length;
    const learningRows = sslcLearningProgress.filter((row) => matchesSubject(row.subject) && row.subject.endsWith(':learn'));
    const assignmentRows = sslcLearningProgress.filter((row) => matchesSubject(row.subject) && row.subject.endsWith(':assignment'));
    const seenIds = new Set(learningRows.flatMap((row) => Array.isArray(row.seen_question_ids)
      ? row.seen_question_ids.filter((id): id is string => typeof id === 'string')
      : []));
    const attemptsForSubject = sslcAttempts.filter((attempt) => matchesSubject(attempt.subject));
    const mocks = attemptsForSubject.filter((attempt) => attempt.assessment_mode === 'mock');
    const scores = mocks.map((attempt) => attempt.score_percentage ?? 0);
    return {
      ...item,
      completedLessons,
      lessonCount: chapters.length,
      learnedCount: seenIds.size,
      assignmentCount: assignmentRows.reduce((total, row) => total + row.completed_sets, 0),
      mockCount: mocks.length,
      latestScore: scores[0],
      highestScore: scores.length ? Math.max(...scores) : undefined,
      averageScore: scores.length ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : undefined,
      completion: chapters.length ? Math.round((completedLessons / chapters.length) * 100) : null,
    };
  });
  const firstName = profile.full_name?.trim().split(/\s+/)[0] || profile.username || 'learner';
  const avgScore = attempts.length > 0
    ? Math.round(attempts.reduce((sum, a) => sum + (a.score_percentage || 0), 0) / attempts.length)
    : 0;
  const totalExams = attempts.length;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      {/* Assignment reminder banner */}
      {showAssignmentReminder && isPUC && (
        <div className="sticky top-16 z-40 bg-gradient-to-r from-amber-500 to-orange-500 text-white animate-fade-in-down">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-3">
            <BellRing className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <p className="text-sm font-semibold flex-1">
              Assignment Reminder: Your daily homework is waiting!
            </p>
            <button
              onClick={() => navigate(`/practice/${profile.exam_stream || 'cet'}`)}
              className="px-3 py-1.5 bg-white text-orange-600 font-bold rounded-lg text-xs hover:bg-orange-50 transition-colors"
            >
              Start Now
            </button>
            <button onClick={() => setShowAssignmentReminder(false)} className="p-1 hover:bg-white/20 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isOffline && (
          <div role="status" className="card mb-5 flex items-center gap-3 border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <WifiOff className="h-5 w-5 shrink-0" />
            You are offline. Your daily thought is available; recent activity may need a connection.
          </div>
        )}
        {/* Welcome banner */}
        <div className="card p-6 mb-8 overflow-hidden relative gradient-hero text-white">
          <div className="absolute top-0 right-0 w-64 h-64 bg-teal-400/20 rounded-full blur-3xl -mr-20 -mt-20" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-heading font-bold mb-1">
                Welcome back, {firstName}!
              </h1>
              <p className="text-teal-100/80 text-sm">Your learning journey continues today.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-center bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <div className="text-2xl font-bold">{streak}</div>
                <div className="text-xs text-teal-200/70">Day streak</div>
              </div>
              {profile.is_premium && (
                <div className="text-center bg-amber-400/20 rounded-xl px-4 py-2 border border-amber-300/30">
                  <Award className="w-5 h-5 text-amber-300 mx-auto" />
                  <div className="text-xs text-amber-200/80 mt-0.5">Premium</div>
                </div>
              )}
            </div>
          </div>
        </div>

        <section aria-labelledby="daily-thought-heading" className="card mb-8 border-teal-100 bg-gradient-to-br from-white to-teal-50 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div>
              <h2 id="daily-thought-heading" className="text-xs font-semibold uppercase tracking-wide text-teal-700">{dailyThought.title}</h2>
              <p lang={dailyThought.locale} className="mt-2 text-lg font-semibold leading-relaxed text-slate-900">{dailyThought.text}</p>
            </div>
            <time dateTime={dailyThought.dateKey} className="shrink-0 text-xs text-slate-500">{thoughtDate}</time>
          </div>
        </section>

        {isSchool && (
          <section aria-labelledby="sslc-progress-heading" className="mb-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Karnataka SSLC · {getCurrentSSLCAcademicYear()}</p>
                <h2 id="sslc-progress-heading" className="mt-1 font-heading text-lg font-bold text-slate-900">Your subject progress</h2>
              </div>
              <button type="button" onClick={() => navigate('/learn/sslc')} className="text-sm font-semibold text-teal-700 hover:text-teal-900">Open SSLC subjects</button>
            </div>
            {sslcProgressError && <p role="alert" className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">{sslcProgressError}</p>}
            {sslcProgressLoading ? (
              <div role="status" className="card p-5 text-sm text-slate-500">Loading your SSLC progress…</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sslcProgressRows.map((row) => (
                  <article key={row.key} className="card p-4">
                    <h3 className="font-heading font-bold text-slate-900">{row.label}</h3>
                    <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-xs text-slate-600">
                      <p>Lessons <strong className="text-slate-900">{row.completedLessons}/{row.lessonCount}</strong></p>
                      <p>Learn questions <strong className="text-slate-900">{row.learnedCount}</strong></p>
                      <p>Assignments <strong className="text-slate-900">{row.assignmentCount}</strong></p>
                      <p>Mock tests <strong className="text-slate-900">{row.mockCount}</strong></p>
                      <p>Latest mark <strong className="text-slate-900">{row.latestScore === undefined ? '—' : `${Math.round(row.latestScore)}%`}</strong></p>
                      <p>Highest mark <strong className="text-slate-900">{row.highestScore === undefined ? '—' : `${Math.round(row.highestScore)}%`}</strong></p>
                      <p className="col-span-2">Average mock mark <strong className="text-slate-900">{row.averageScore === undefined ? '—' : `${row.averageScore}%`}</strong></p>
                    </div>
                    <div className="mt-3">
                      <div className="mb-1 flex justify-between text-xs text-slate-500">
                        <span>Lesson completion</span><span>{row.completion === null ? 'Syllabus pending verification' : `${row.completion}%`}</span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-teal-600 transition-all" style={{ width: `${row.completion ?? 0}%` }} />
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </section>
        )}

        <section aria-labelledby="learning-paths-heading" className="mb-8">
          <div className="flex items-end justify-between gap-3 mb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Learning paths</p>
              <h2 id="learning-paths-heading" className="font-heading font-bold text-lg text-slate-900 mt-1">Choose a program</h2>
            </div>
            <button type="button" onClick={() => navigate('/learn')} className="text-sm font-semibold text-teal-700 hover:text-teal-900">All programs</button>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { id: 'sslc', title: 'SSLC', detail: 'School subjects and exam preparation' },
              { id: 'puc', title: 'PUC', detail: 'CET, NEET and JEE subject practice' },
              { id: 'degree', title: 'Degree', detail: 'Engineering and management learning' },
            ].map((path) => (
              <button key={path.id} type="button" onClick={() => navigate(`/learn/${path.id}`)} className="card p-5 text-left hover:border-teal-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between gap-3">
                  <h3 className="font-heading font-bold text-base">{path.title}</h3>
                  <ArrowRight className="w-4 h-4 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500 mt-1">{path.detail}</p>
              </button>
            ))}
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { icon: FileText, label: 'Exams Taken', value: totalExams, color: 'teal' },
            { icon: Target, label: 'Avg Score', value: `${avgScore}%`, color: 'cyan' },
            { icon: Flame, label: 'Day Streak', value: streak, color: 'orange' },
            { icon: CheckCircle, label: 'Homework Done', value: homework.filter((h) => h.status === 'completed').length, color: 'emerald' },
          ].map((stat) => (
            <div key={stat.label} className="card p-5">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${stat.color}-50`}>
                <stat.icon className={`w-5 h-5 text-${stat.color}-600`} />
              </div>
              <div className="text-2xl font-heading font-bold text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main content area */}
          <div className="lg:col-span-2 space-y-6">
            {/* PUC: Subject grid */}
            {isSchool && (
              <div>
                <h2 className="font-heading font-bold text-lg mb-4">Your Subjects</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {subjects.map((subject) => (
                    <button
                      key={subject.id}
                      onClick={() => navigate(subject.languageCategory
                        ? `/learn/sslc/${subject.id}`
                        : `/subject/${encodeURIComponent(subject.id)}`)}
                      className="card p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                          <BookOpen className="w-5 h-5 text-teal-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-heading font-bold text-base mb-1">{subject.title}</h3>
                      <p className="text-sm text-slate-500">{subject.value ?? (subject.languageCategory ? 'Choose your registered language' : 'Verified lessons and practice')}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {isPUC && (
              <div>
                <h2 className="font-heading font-bold text-lg mb-4">
                  {profile.puc_group
                    ? `${profile.puc_group.toUpperCase()}${profile.puc_year ? ` · ${profile.puc_year === 1 ? '1st' : '2nd'} PUC` : ''}`
                    : 'PUC Learning'}
                </h2>
                {availablePucExams.length > 0 ? (
                  <div className="grid sm:grid-cols-3 gap-4">
                    {availablePucExams.map((exam) => (
                      <button
                        key={exam.id}
                        onClick={() => navigate(`/practice/${exam.id}`)}
                        className="card p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
                      >
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
                          <GraduationCap className="w-5 h-5 text-teal-600" />
                        </div>
                        <h3 className="font-heading font-bold text-base mb-1">{exam.name}</h3>
                        <p className="text-sm text-slate-500">{exam.detail}</p>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="card p-5 text-sm text-slate-600">
                    Entrance-exam practice is not selected for this PUC group. Verified course lessons will appear after the PUC syllabus catalog is populated.
                  </p>
                )}
              </div>
            )}

            {!isPUC && !isSchool && (
              <div>
                <h2 className="font-heading font-bold text-lg mb-4">Choose Your Degree</h2>
                <div className="grid sm:grid-cols-3 gap-4 mb-8">
                  {degreeTypes.map((type) => (
                    <button
                      key={type.id}
                      onClick={() => navigate('/practice/degree')}
                      className="card p-5 text-left hover:shadow-lg hover:border-cyan-200 transition-all duration-200 group"
                    >
                      <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3 group-hover:bg-cyan-100 transition-colors">
                        <Briefcase className="w-5 h-5 text-cyan-600" />
                      </div>
                      <h3 className="font-heading font-bold text-base mb-1">{type.name}</h3>
                      <p className="text-sm text-slate-500">{type.semesters} semesters</p>
                    </button>
                  ))}
                </div>
                <h2 className="font-heading font-bold text-lg mb-4">Degree Practice</h2>
                <div className="grid sm:grid-cols-3 gap-4">
                  {[
                    { mode: 'daily', title: 'Learn', detail: 'Five questions with answers and explanations', icon: BookOpen, tile: 'bg-teal-50 group-hover:bg-teal-100', iconColor: 'text-teal-600' },
                    { mode: 'assignment', title: 'Assignment', detail: 'Three questions for today, with answers after submitting', icon: FileText, tile: 'bg-cyan-50 group-hover:bg-cyan-100', iconColor: 'text-cyan-600' },
                    { mode: 'mock', title: 'Mock Test', detail: '20 questions, 20 seconds each, full review at the end', icon: Clock, tile: 'bg-amber-50 group-hover:bg-amber-100', iconColor: 'text-amber-600' },
                  ].map((section) => {
                    const Icon = section.icon;
                    return (
                      <button
                        key={section.mode}
                        onClick={() => navigate(`/practice/degree/${section.mode}`)}
                        className="card p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${section.tile}`}>
                          <Icon className={`w-5 h-5 ${section.iconColor}`} />
                        </div>
                        <h3 className="font-heading font-bold text-base mb-1">{section.title}</h3>
                        <p className="text-sm text-slate-500">{section.detail}</p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Degree: Quick actions */}
            {!isPUC && !isSchool && (
              <div>
                <h2 className="font-heading font-bold text-lg mb-4">Your Career Hub</h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => navigate('/degree')}
                    className="card p-5 text-left hover:shadow-lg hover:border-cyan-200 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mb-3 group-hover:bg-cyan-100 transition-colors">
                      <Briefcase className="w-5 h-5 text-cyan-600" />
                    </div>
                    <h3 className="font-heading font-bold text-base mb-1">Career Map</h3>
                    <p className="text-sm text-slate-500">View roles mapped to your degree</p>
                  </button>
                  <button
                    onClick={() => navigate('/resume')}
                    className="card p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mb-3 group-hover:bg-teal-100 transition-colors">
                      <Brain className="w-5 h-5 text-teal-600" />
                    </div>
                    <h3 className="font-heading font-bold text-base mb-1">Resume Analysis</h3>
                    <p className="text-sm text-slate-500">Upload resume for skill gap report</p>
                  </button>
                  <button
                    onClick={() => navigate('/assistant')}
                    className="card p-5 text-left hover:shadow-lg hover:border-amber-200 transition-all duration-200 group"
                  >
                    <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center mb-3 group-hover:bg-amber-100 transition-colors">
                      <Brain className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="font-heading font-bold text-base mb-1">KHBV.D Assistant</h3>
                    <p className="text-sm text-slate-500">Get routines, guidance, and motivation</p>
                  </button>
                </div>
              </div>
            )}

            {!isPUC && !isSchool && profile.degree_type === 'BE' && departmentSubjects.length > 0 && (
              <div>
                <div className="flex items-end justify-between mb-4">
                  <div>
                    <h2 className="font-heading font-bold text-lg">{departmentName || 'Department'} Subjects</h2>
                    <p className="text-sm text-slate-500 mt-1">Semester {profile.current_semester} · Coding and theory in one place</p>
                  </div>
                  <span className="text-xs font-semibold text-teal-700 bg-teal-50 border border-teal-200 px-2.5 py-1 rounded-lg">{departmentSubjects.length} subjects</span>
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  {departmentSubjects.map((subject) => (
                    <button
                      key={subject}
                      onClick={() => navigate(`/subject/${encodeURIComponent(subject)}`)}
                      className="card p-5 text-left hover:shadow-lg hover:border-teal-200 transition-all duration-200 group"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center group-hover:bg-teal-100 transition-colors">
                          <BookOpen className="w-5 h-5 text-teal-600" />
                        </div>
                        <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                      </div>
                      <h3 className="font-heading font-bold text-base mb-1">{subject}</h3>
                      <p className="text-sm text-slate-500">Learn, Assignment, and Exam</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Recent attempts */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-heading font-bold text-lg">Recent Activity</h2>
                {attempts.length > 0 && (
                  <button className="text-sm text-teal-600 font-semibold hover:underline">View all</button>
                )}
              </div>
              {activityError ? (
                <div role="alert" className="card p-5 text-sm text-amber-900">
                  <p>{activityError}</p>
                  <button type="button" onClick={() => void loadData()} className="btn-secondary mt-3 text-sm">Retry</button>
                </div>
              ) : activityLoading ? (
                <div aria-label="Loading recent activity" className="card p-6">
                  <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
                  <div className="mt-4 h-12 animate-pulse rounded-xl bg-slate-100" />
                </div>
              ) : attempts.length === 0 ? (
                <div className="card p-8 text-center">
                  <BarChart3 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No exams taken yet. Start practicing!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {attempts.slice(0, 5).map((attempt) => (
                    <button
                      key={attempt.id}
                      onClick={() => navigate(`/results/${attempt.id}`)}
                      className="card w-full p-4 flex items-center justify-between hover:shadow-md transition-all text-left"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${(attempt.score_percentage || 0) >= 70 ? 'bg-emerald-50' : (attempt.score_percentage || 0) >= 40 ? 'bg-amber-50' : 'bg-rose-50'}`}>
                          <span className={`text-sm font-bold ${(attempt.score_percentage || 0) >= 70 ? 'text-emerald-600' : (attempt.score_percentage || 0) >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                            {Math.round(attempt.score_percentage || 0)}%
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-slate-900">{attempt.subject}</p>
                          <p className="text-xs text-slate-500">
                            {attempt.correct_answers || 0}/{attempt.total_questions} correct — {new Date(attempt.started_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-300" />
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Homework tracker */}
            {isPUC && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-5 h-5 text-teal-600" />
                  <h3 className="font-heading font-bold">Homework Cycle</h3>
                </div>
                <div className="space-y-2">
                  {homeworkPattern.map((day) => {
                    const hw = homework.find((h) => h.cycle_day === day.day);
                    const completed = hw?.status === 'completed';
                    return (
                      <div key={day.day} className="flex items-center justify-between p-2 rounded-lg bg-slate-50">
                        <div className="flex items-center gap-2">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${completed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                            {completed ? <CheckCircle className="w-4 h-4" /> : day.day}
                          </div>
                          <span className="text-sm text-slate-700">Day {day.day}</span>
                        </div>
                        <span className="text-xs text-slate-500">{day.questions} Q{day.questions > 1 ? 's' : ''}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-xs text-slate-400 mt-3 text-center">1 → 2 → 3 → 2 pattern</p>
              </div>
            )}

            {/* Upgrade card */}
            {!profile.is_premium && (
              <div className="card p-5 bg-gradient-to-br from-amber-50 to-orange-50 border-amber-200">
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-amber-600" />
                  <h3 className="font-heading font-bold text-slate-900">Go Premium</h3>
                </div>
                <p className="text-sm text-slate-600 mb-4">
                  Unlock personalized roadmaps, detailed tracking, and unlimited practice exams.
                </p>
                <button
                  onClick={() => navigate('/pricing')}
                  className="w-full px-4 py-2.5 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors text-sm"
                >
                  Upgrade Now
                </button>
              </div>
            )}

            {/* Quick exam button */}
            {isSchool && subjects.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-5 h-5 text-teal-600" />
                  <h3 className="font-heading font-bold">Quick Practice</h3>
                </div>
                <p className="text-sm text-slate-500 mb-4">Choose an SSLC subject or configured language.</p>
                <button
                  onClick={() => navigate('/learn/sslc')}
                  className="btn-primary w-full text-sm"
                >
                  Choose Subject
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
