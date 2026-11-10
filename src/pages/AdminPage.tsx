import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { AlertCircle, BookOpen, Building2, ClipboardList, Users } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { SSLC_CORE_SUBJECTS } from '@/lib/sslc-content';
import type { PracticeQuestion, PracticeTrack } from '@/lib/types';

const TRACKS: { id: PracticeTrack; label: string }[] = [
  { id: 'sslc', label: 'SSLC' }, { id: 'cet', label: 'CET' }, { id: 'neet', label: 'NEET' }, { id: 'jee', label: 'JEE' },
  { id: 'degree-it', label: 'Degree · IT' }, { id: 'degree-nonit', label: 'Degree · Non-IT' },
  { id: 'business-hr', label: 'Business · HR' }, { id: 'business-operations', label: 'Business · Operations' },
  { id: 'business-management', label: 'Business · Management' },
];

type Tab = 'questions' | 'catalog' | 'companies' | 'students';
interface CatalogRow { track: string; subject: string; topic: string; active: boolean }
interface CompanyRow { id: string; name: string; introduction: string; careers_url: string }
interface StudentRow {
  id: string;
  full_name: string;
  user_type: string | null;
  attempt_count: number;
  average_score: number | null;
  total_profiles: number;
}

const STUDENT_PAGE_SIZE = 50;

export function AdminPage() {
  const { session } = useAuth();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [tab, setTab] = useState<Tab>('questions');
  const [studentPage, setStudentPage] = useState(0);
  const contentRequest = useRef(0);
  const [questions, setQuestions] = useState<PracticeQuestion[]>([]);
  const [catalog, setCatalog] = useState<CatalogRow[]>([]);
  const [companies, setCompanies] = useState<CompanyRow[]>([]);
  const [students, setStudents] = useState<StudentRow[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  const [questionForm, setQuestionForm] = useState({ track: 'cet' as PracticeTrack, subject: '', topic: '', language: 'English', languageCategory: '', difficulty: 'easy', question: '', options: '', correctIndex: '0', explanation: '', sourceType: 'practice', sourceName: '', sourceUrl: '', yearAsked: '', sourceVerified: false });
  const [catalogForm, setCatalogForm] = useState({ track: 'sslc' as PracticeTrack, subject: '', topic: '' });

  const loadContent = useCallback(async (requestedTab: Tab = tab, requestedStudentPage = studentPage) => {
    const requestId = ++contentRequest.current;
    setError('');
    try {
      if (requestedTab === 'questions') {
        const { data, error: queryError } = await supabase.from('practice_questions')
          .select('id, track, subject, topic, language, language_category, difficulty, question, options, correct_index, explanation, year_asked, source_type, source_name, source_url, source_verified_at')
          .order('track').order('subject').range(0, 299);
        if (requestId !== contentRequest.current) return;
        if (queryError) setError('Questions could not be loaded. Check your connection and try again.');
        else setQuestions((data ?? []) as PracticeQuestion[]);
        return;
      }

      if (requestedTab === 'catalog') {
        const { data, error: queryError } = await supabase.from('learning_catalog')
          .select('track, subject, topic, active')
          .order('track').order('subject').range(0, 499);
        if (requestId !== contentRequest.current) return;
        if (queryError) setError('The subject catalogue could not be loaded.');
        else setCatalog((data ?? []) as CatalogRow[]);
        return;
      }

      if (requestedTab === 'companies') {
        const { data, error: queryError } = await supabase.from('company_catalog')
          .select('id, name, introduction, careers_url')
          .order('name')
          .limit(500);
        if (requestId !== contentRequest.current) return;
        if (queryError) setError('The company catalogue could not be loaded.');
        else setCompanies((data ?? []) as CompanyRow[]);
        return;
      }

      const { data, error: queryError } = await supabase.rpc('admin_student_page', {
        p_limit: STUDENT_PAGE_SIZE,
        p_offset: requestedStudentPage * STUDENT_PAGE_SIZE,
      });
      if (requestId !== contentRequest.current) return;
      if (queryError) {
        setError('Student statistics could not be loaded. Apply the latest scalability migration and retry.');
        return;
      }
      setStudents((data ?? []) as StudentRow[]);
    } catch {
      if (requestId === contentRequest.current) setError('Admin data could not be loaded. Check your connection and retry.');
    }
  }, [studentPage, tab]);

  useEffect(() => {
    if (!session) return;
    let active = true;
    const verifyAdmin = async () => {
      try {
        const { data, error: roleError } = await supabase.from('admin_users')
          .select('user_id').eq('user_id', session.user.id).maybeSingle();
        if (!active) return;
        if (roleError) {
          setError('Admin access could not be verified. Apply the admin migration and provision an administrator.');
          setAuthorized(false);
          return;
        }
        setAuthorized(!!data);
      } catch {
        if (!active) return;
        setError('Admin access could not be verified. Check your connection and retry.');
        setAuthorized(false);
      }
    };
    void verifyAdmin();
    return () => { active = false; };
  }, [session]);

  useEffect(() => {
    if (!authorized) return;
    void loadContent(tab, studentPage);
    return () => { contentRequest.current += 1; };
  }, [authorized, loadContent, studentPage, tab]);

  const selectTab = (nextTab: Tab) => {
    setTab(nextTab);
    if (nextTab === 'students') setStudentPage(0);
  };

  const changeStudentPage = (nextPage: number) => {
    setStudentPage(nextPage);
  };

  const addQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    setNotice('');
    const options = questionForm.options.split('\n').map((option) => option.trim()).filter(Boolean);
    if (options.length !== 4) {
      setError('Enter exactly four answer options, one on each line.');
      return;
    }
    if (questionForm.sourceType === 'previous_year' && !questionForm.sourceUrl.trim()) {
      setError('A source URL is required for a previous-year question.');
      return;
    }
    if (questionForm.sourceType === 'previous_year' && !questionForm.sourceVerified) {
      setError('Verify the question against the cited paper before marking it as a previous-year question.');
      return;
    }
    if (questionForm.sourceType === 'previous_year'
      && (!Number.isInteger(Number(questionForm.yearAsked)) || Number(questionForm.yearAsked) < 1900 || Number(questionForm.yearAsked) > new Date().getFullYear())) {
      setError('Enter the year printed on the verified examination paper.');
      return;
    }
    if (questionForm.track === 'sslc' && !questionForm.language.trim()) {
      setError('Set the language used by this SSLC question.');
      return;
    }
    if (questionForm.track === 'sslc'
      && !(SSLC_CORE_SUBJECTS as readonly string[]).includes(questionForm.subject.trim())
      && !questionForm.languageCategory) {
      setError('Select the language category for this language-lesson question.');
      return;
    }
    setBusy(true);
    const { error: insertError } = await supabase.from('practice_questions').insert({
      track: questionForm.track,
      subject: questionForm.subject.trim(),
      topic: questionForm.topic.trim(),
      language: questionForm.track === 'sslc' ? questionForm.language.trim() : null,
      language_category: questionForm.track === 'sslc' && !(SSLC_CORE_SUBJECTS as readonly string[]).includes(questionForm.subject.trim())
        ? questionForm.languageCategory || null
        : null,
      difficulty: questionForm.difficulty,
      question: questionForm.question.trim(),
      options,
      correct_index: Number(questionForm.correctIndex),
      explanation: questionForm.explanation.trim(),
      source_type: questionForm.sourceType,
      source_name: questionForm.sourceName.trim() || null,
      source_url: questionForm.sourceUrl.trim() || null,
      source_verified_at: questionForm.sourceType === 'previous_year' && questionForm.sourceVerified ? new Date().toISOString() : null,
      year_asked: questionForm.yearAsked ? Number(questionForm.yearAsked) : null,
    });
    if (insertError) setError(insertError.message);
    else {
      setNotice('Question added.');
      setQuestionForm((form) => ({ ...form, subject: '', topic: '', question: '', options: '', explanation: '', sourceName: '', sourceUrl: '', yearAsked: '', sourceVerified: false }));
      await loadContent();
    }
    setBusy(false);
  };

  const addCatalogEntry = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');
    const { error: insertError } = await supabase.from('learning_catalog').insert({ ...catalogForm, active: true });
    if (insertError) setError(insertError.message);
    else {
      setNotice('Subject or topic added.');
      setCatalogForm((form) => ({ ...form, subject: '', topic: '' }));
      await loadContent();
    }
  };

  const updateCompany = async (company: CompanyRow, field: 'introduction' | 'careers_url', value: string) => {
    const { error: updateError } = await supabase.from('company_catalog').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', company.id);
    if (updateError) setError(updateError.message);
    else setNotice(`${company.name} updated.`);
  };

  const deleteQuestion = async (questionId: string) => {
    const { error: deleteError } = await supabase.from('practice_questions').delete().eq('id', questionId);
    if (deleteError) setError(deleteError.message);
    else await loadContent();
  };

  if (!session) return null;
  if (authorized === null) return <LoadingAdmin />;
  if (!authorized) return <div className="min-h-screen bg-slate-50"><AppHeader /><main className="max-w-xl mx-auto px-4 py-16"><div role="alert" className="card p-6"><h1 className="font-heading font-bold text-xl text-slate-900">Admin access required</h1><p className="text-sm text-slate-600 mt-2">This account is not authorized to manage learning content.</p></div></main></div>;

  const tabs: { id: Tab; label: string; icon: typeof BookOpen }[] = [
    { id: 'questions', label: 'Questions', icon: BookOpen }, { id: 'catalog', label: 'Subjects', icon: ClipboardList },
    { id: 'companies', label: 'Companies', icon: Building2 }, { id: 'students', label: 'Student stats', icon: Users },
  ];
  return (
    <div className="min-h-screen bg-slate-50"><AppHeader /><main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Content administration</p><h1 className="text-2xl font-heading font-bold text-slate-900 mt-1 mb-6">KHBV.D Admin</h1>
      {error && <div role="alert" className="mb-4 p-3 bg-rose-50 border border-rose-200 text-sm text-rose-800 rounded-lg flex gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{error}</div>}
      {notice && <p role="status" className="mb-4 text-sm text-emerald-800">{notice}</p>}
      <div className="flex flex-wrap gap-2 mb-6">{tabs.map((item) => <button key={item.id} type="button" onClick={() => selectTab(item.id)} className={`px-3 py-2 rounded-lg text-sm font-semibold inline-flex items-center gap-2 ${tab === item.id ? 'bg-teal-800 text-white' : 'bg-white border border-slate-200 text-slate-700'}`}><item.icon className="w-4 h-4" />{item.label}</button>)}</div>

      {tab === 'questions' && <div className="grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] gap-5">
        <form onSubmit={addQuestion} className="card p-5 space-y-3">
          <h2 className="font-heading font-bold text-lg">Add a question</h2>
          <div className="grid sm:grid-cols-2 gap-3"><select className="input-field" value={questionForm.track} onChange={(e) => setQuestionForm({ ...questionForm, track: e.target.value as PracticeTrack })}>{TRACKS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><select className="input-field" value={questionForm.difficulty} onChange={(e) => setQuestionForm({ ...questionForm, difficulty: e.target.value })}><option value="easy">Easy</option><option value="medium">Medium</option><option value="difficult">Difficult</option></select></div>
          <div className="grid sm:grid-cols-2 gap-3"><input required className="input-field" placeholder="Subject" value={questionForm.subject} onChange={(e) => setQuestionForm({ ...questionForm, subject: e.target.value })} /><input required className="input-field" placeholder="Topic" value={questionForm.topic} onChange={(e) => setQuestionForm({ ...questionForm, topic: e.target.value })} /></div>
          {questionForm.track === 'sslc' && <div className="grid sm:grid-cols-2 gap-3"><input required className="input-field" placeholder="Question language (e.g. Kannada)" value={questionForm.language} onChange={(e) => setQuestionForm({ ...questionForm, language: e.target.value })} /><select className="input-field" value={questionForm.languageCategory} onChange={(e) => setQuestionForm({ ...questionForm, languageCategory: e.target.value })}><option value="">Core subject / choose language category</option><option value="first_language">First Language</option><option value="second_language">Second Language</option><option value="third_language">Third Language</option></select></div>}
          <textarea required className="input-field min-h-20" placeholder="Question" value={questionForm.question} onChange={(e) => setQuestionForm({ ...questionForm, question: e.target.value })} />
          <textarea required className="input-field min-h-24" placeholder="Four options, one per line" value={questionForm.options} onChange={(e) => setQuestionForm({ ...questionForm, options: e.target.value })} />
          <div className="grid sm:grid-cols-2 gap-3"><select className="input-field" value={questionForm.correctIndex} onChange={(e) => setQuestionForm({ ...questionForm, correctIndex: e.target.value })}><option value="0">Correct answer: A</option><option value="1">Correct answer: B</option><option value="2">Correct answer: C</option><option value="3">Correct answer: D</option></select><select className="input-field" value={questionForm.sourceType} onChange={(e) => setQuestionForm({ ...questionForm, sourceType: e.target.value })}><option value="practice">Curated practice</option><option value="generated">Generated practice</option><option value="previous_year">Previous-year question</option></select></div>
          {questionForm.sourceType === 'previous_year' && <div className="space-y-3"><div className="grid sm:grid-cols-2 gap-3"><input required className="input-field" placeholder="Source name" value={questionForm.sourceName} onChange={(e) => setQuestionForm({ ...questionForm, sourceName: e.target.value })} /><input required type="url" className="input-field" placeholder="Source URL" value={questionForm.sourceUrl} onChange={(e) => setQuestionForm({ ...questionForm, sourceUrl: e.target.value })} /></div><label className="flex items-start gap-2 text-sm text-slate-700"><input type="checkbox" checked={questionForm.sourceVerified} onChange={(e) => setQuestionForm({ ...questionForm, sourceVerified: e.target.checked })} /><span>I verified this question and its year against the cited official paper.</span></label></div>}
          <div className="grid sm:grid-cols-2 gap-3"><input type="number" className="input-field" placeholder="Paper year (optional)" value={questionForm.yearAsked} onChange={(e) => setQuestionForm({ ...questionForm, yearAsked: e.target.value })} /><input required className="input-field" placeholder="Explanation" value={questionForm.explanation} onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })} /></div>
          <button type="submit" disabled={busy} className="btn-primary w-full disabled:opacity-50">{busy ? 'Saving…' : 'Add question'}</button>
        </form>
        <section className="space-y-3"><h2 className="font-heading font-bold text-lg">Question bank ({questions.length})</h2>{questions.map((question) => <article key={question.id} className="card p-4 flex items-start justify-between gap-3"><div><p className="text-xs font-semibold text-teal-800">{question.track} · {question.subject} · {question.difficulty}{question.language ? ` · ${question.language}` : ''}{question.language_category ? ` · ${question.language_category.replace('_', ' ')}` : ''}</p><p className="text-sm font-semibold text-slate-900 mt-1">{question.question}</p><p className="text-xs text-slate-500 mt-1">{question.source_type}{question.source_name ? ` · ${question.source_name}` : ''}</p></div><button type="button" onClick={() => void deleteQuestion(question.id)} className="text-xs text-rose-700 hover:underline">Delete</button></article>)}</section>
      </div>}

      {tab === 'catalog' && <div className="grid lg:grid-cols-[minmax(0,360px)_1fr] gap-5"><form onSubmit={addCatalogEntry} className="card p-5 space-y-3"><h2 className="font-heading font-bold text-lg">Add subject or topic</h2><select className="input-field" value={catalogForm.track} onChange={(e) => setCatalogForm({ ...catalogForm, track: e.target.value as PracticeTrack })}>{TRACKS.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><input required className="input-field" placeholder="Subject" value={catalogForm.subject} onChange={(e) => setCatalogForm({ ...catalogForm, subject: e.target.value })} /><input className="input-field" placeholder="Topic (optional)" value={catalogForm.topic} onChange={(e) => setCatalogForm({ ...catalogForm, topic: e.target.value })} /><button className="btn-primary w-full">Add to catalog</button></form><section className="card overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-slate-100"><tr><th className="p-3">Track</th><th className="p-3">Subject</th><th className="p-3">Topic</th><th className="p-3">Status</th></tr></thead><tbody>{catalog.map((row) => <tr key={`${row.track}-${row.subject}-${row.topic}`} className="border-t"><td className="p-3">{row.track}</td><td className="p-3">{row.subject}</td><td className="p-3">{row.topic || '—'}</td><td className="p-3">{row.active ? 'Active' : 'Inactive'}</td></tr>)}</tbody></table></section></div>}

      {tab === 'companies' && <div className="space-y-3">{companies.map((company) => <CompanyEditor key={company.id} company={company} onSave={updateCompany} />)}</div>}

      {tab === 'students' && <section className="card overflow-x-auto"><div className="p-4 border-b"><h2 className="font-heading font-bold">Student performance</h2><p className="text-sm text-slate-500">{students[0]?.total_profiles ?? 0} profiles · Page {studentPage + 1} (up to {STUDENT_PAGE_SIZE} at a time)</p></div><table className="w-full text-sm text-left"><thead className="bg-slate-100"><tr><th className="p-3">Student</th><th className="p-3">Program</th><th className="p-3">Attempts</th><th className="p-3">Average</th></tr></thead><tbody>{students.map((student) => <tr key={student.id} className="border-t"><td className="p-3 font-medium">{student.full_name}</td><td className="p-3">{student.user_type ?? 'Not set'}</td><td className="p-3">{student.attempt_count}</td><td className="p-3">{Math.round(student.average_score ?? 0)}%</td></tr>)}</tbody></table><div className="flex justify-between gap-3 p-4"><button type="button" disabled={studentPage === 0} onClick={() => changeStudentPage(studentPage - 1)} className="btn-secondary disabled:opacity-40">Previous</button><button type="button" disabled={students.length < STUDENT_PAGE_SIZE} onClick={() => changeStudentPage(studentPage + 1)} className="btn-secondary disabled:opacity-40">Next</button></div></section>}
    </main></div>
  );
}

function CompanyEditor({ company, onSave }: { company: CompanyRow; onSave: (company: CompanyRow, field: 'introduction' | 'careers_url', value: string) => Promise<void> }) {
  const [introduction, setIntroduction] = useState(company.introduction);
  const [careersUrl, setCareersUrl] = useState(company.careers_url);
  return <article className="card p-4 grid md:grid-cols-[140px_1fr_1fr_auto] gap-3 items-center"><h2 className="font-semibold text-slate-900">{company.name}</h2><input className="input-field" aria-label={`${company.name} introduction`} value={introduction} onChange={(e) => setIntroduction(e.target.value)} /><input className="input-field" type="url" aria-label={`${company.name} careers URL`} value={careersUrl} onChange={(e) => setCareersUrl(e.target.value)} /><button type="button" onClick={async () => { await onSave(company, 'introduction', introduction); await onSave(company, 'careers_url', careersUrl); }} className="btn-secondary text-sm">Save</button></article>;
}

function LoadingAdmin() {
  return <div className="min-h-screen bg-slate-50"><AppHeader /><div className="max-w-md mx-auto px-4 py-20 text-center text-slate-500">Checking administrator access…</div></div>;
}