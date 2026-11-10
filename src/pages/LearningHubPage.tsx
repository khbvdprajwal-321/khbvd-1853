import { ArrowLeft, ArrowRight, BookOpen, Briefcase, Building2, ClipboardList, Clock, GraduationCap, Landmark } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { navigate } from '@/App';
import { useAuth } from '@/lib/auth-context';
import { useSSLCLanguages } from '@/lib/use-sslc-languages';
import { SSLC_FIRST_LANGUAGES } from '@/lib/sslc-content';
import type { PracticeTrack } from '@/lib/types';

interface LearningHubPageProps {
  segments: string[];
}

const PUC_SUBJECTS: Record<string, string[]> = {
  cet: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  neet: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
  jee: ['Physics', 'Chemistry', 'Mathematics', 'Biology'],
};

const IT_SUBJECTS = [
  'C', 'C++', 'Java', 'Python', 'JavaScript', 'HTML/CSS', 'SQL',
  'Data Structures and Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering',
];

const NON_IT_SUBJECTS = [
  'Civil Engineering', 'Mechanical Engineering', 'Electrical Engineering',
  'Electronics and Communication', 'Chemical Engineering', 'Production Engineering', 'Biotechnology',
];

const BUSINESS_AREAS: Record<string, string[]> = {
  hr: ['Human Resource Management', 'Recruitment and Selection', 'Training and Development', 'Payroll', 'Employee Relations', 'Performance Management', 'Labour Laws', 'HR Analytics'],
  operations: ['Operations Management', 'Supply Chain Management', 'Inventory Management', 'Quality Management', 'Logistics', 'Production Planning', 'Process Improvement', 'Operations Analytics'],
  management: ['Principles of Management', 'Marketing Management', 'Financial Management', 'Business Strategy', 'Entrepreneurship', 'Business Communication', 'Business Analytics', 'Leadership and Decision Making'],
};
const SSLC_LANGUAGE_GROUPS = [
  { id: 'first-language', title: 'First Language', profileKey: 'first_language' as const },
  { id: 'second-language', title: 'Second Language', profileKey: 'second_language' as const },
  { id: 'third-language', title: 'Third Language', profileKey: 'third_language' as const },
];
const SSLC_CORE_SUBJECTS = ['Mathematics', 'Science', 'Social Science'];

const PUC_LABELS: Record<string, string> = { cet: 'CET', neet: 'NEET', jee: 'JEE' };
const TRACK_LABELS: Record<string, string> = {
  sslc: 'SSLC', cet: 'CET', neet: 'NEET', jee: 'JEE',
  'degree-it': 'BE / B.Tech · IT',
  'degree-nonit': 'BE / B.Tech · Non-IT',
  'business-hr': 'Business Postgraduate · HR',
  'business-operations': 'Business Postgraduate · Operations',
  'business-management': 'Business Postgraduate · Business Management',
};

function StudyCard({ title, description, onClick, icon: Icon = BookOpen }: {
  title: string;
  description: string;
  onClick: () => void;
  icon?: typeof BookOpen;
}) {
  return (
    <button type="button" onClick={onClick} className="card p-5 text-left hover:border-teal-300 hover:shadow-md transition-all group">
      <div className="flex items-center justify-between mb-3">
        <span className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center"><Icon className="w-5 h-5 text-teal-700" /></span>
        <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-teal-700" />
      </div>
      <h2 className="font-heading font-bold text-base text-slate-900">{title}</h2>
      <p className="text-sm text-slate-500 mt-1">{description}</p>
    </button>
  );
}

export function LearningHubPage({ segments }: LearningHubPageProps) {
  const { profile } = useAuth();
  const { languagesByCategory, error: sslcLanguageError } = useSSLCLanguages();
  const section = segments[0] ?? '';
  const second = segments[1] ?? '';
  const third = segments[2] ?? '';
  const backSegments = segments.slice(0, -1);
  const backPath = backSegments.length ? `/learn/${backSegments.join('/')}` : '/learn';

  let title = 'Learning Areas';
  let items: { id: string; title: string; description: string; icon: typeof BookOpen; onClick: () => void }[] = [];
  let selectedTrack: PracticeTrack | null = null;
  let selectedSubject = '';

  if (!section) {
    items = [
      { id: 'sslc', title: 'SSLC', description: 'School subjects, chapter practice and exam preparation', icon: GraduationCap, onClick: () => navigate('/learn/sslc') },
      { id: 'puc', title: 'PUC', description: 'CET, NEET and JEE preparation', icon: BookOpen, onClick: () => navigate('/learn/puc') },
      { id: 'degree', title: 'Degree', description: 'Engineering and business postgraduate learning', icon: Briefcase, onClick: () => navigate('/learn/degree') },
    ];
  } else if (section === 'sslc' && segments.length === 1) {
    title = 'Karnataka SSLC Subjects';
    items = [
      ...SSLC_LANGUAGE_GROUPS.map(({ id, title: languageTitle }) => ({
        id,
        title: languageTitle,
        description: 'Choose your configured language to view its lessons',
        icon: BookOpen,
        onClick: () => navigate(`/learn/sslc/${id}`),
      })),
      ...SSLC_CORE_SUBJECTS.map((subject) => ({
        id: subject,
        title: subject,
        description: 'Learn, assignment and mock test',
        icon: BookOpen,
        onClick: () => navigate(`/learn/sslc/${encodeURIComponent(subject)}`),
      })),
    ];
  } else if (section === 'sslc' && SSLC_LANGUAGE_GROUPS.some(({ id }) => id === second) && segments.length === 2) {
    const languageGroup = SSLC_LANGUAGE_GROUPS.find(({ id }) => id === second)!;
    const configuredLanguage = profile?.[languageGroup.profileKey];
    const languages = languageGroup.profileKey === 'first_language'
      ? SSLC_FIRST_LANGUAGES
      : configuredLanguage ? [configuredLanguage] : languagesByCategory[languageGroup.profileKey];
    title = languageGroup.title;
    items = languages.map((language) => ({
      id: language,
      title: language,
      description: 'View available lessons and learning material in this language',
      icon: BookOpen,
      onClick: () => navigate(`/subject/${languageGroup.id}/${encodeURIComponent(language)}`),
    }));
  } else if (section === 'puc' && segments.length === 1) {
    title = 'PUC Examinations';
    items = Object.entries(PUC_LABELS).map(([id, label]) => ({
      id, title: `${label} · PCMB`, description: `Physics, Chemistry, Mathematics and Biology`, icon: GraduationCap,
      onClick: () => navigate(`/learn/puc/${id}`),
    }));
  } else if (section === 'puc' && segments.length === 2 && PUC_SUBJECTS[second]) {
    title = `${PUC_LABELS[second]} · PCMB Subjects`;
    items = PUC_SUBJECTS[second].map((subject) => ({
      id: subject, title: subject, description: `Study ${subject} for ${PUC_LABELS[second]} PCMB preparation`, icon: BookOpen,
      onClick: () => navigate(`/learn/puc/${second}/${encodeURIComponent(subject)}`),
    }));
  } else if (section === 'degree' && segments.length === 1) {
    title = 'Degree Programs';
    items = [
      { id: 'engineering', title: 'BE / B.Tech', description: 'IT and Non-IT engineering preparation', icon: Building2, onClick: () => navigate('/learn/degree/engineering') },
      { id: 'business', title: 'Business Postgraduate / Management', description: 'HR, Operations and Business Management', icon: Landmark, onClick: () => navigate('/learn/degree/business') },
    ];
  } else if (section === 'degree' && second === 'engineering' && segments.length === 2) {
    title = 'BE / B.Tech';
    items = [
      { id: 'it', title: 'IT', description: 'Programming, computer science and company preparation', icon: BookOpen, onClick: () => navigate('/learn/degree/engineering/it') },
      { id: 'nonit', title: 'Non-IT', description: 'Engineering branches and career preparation', icon: Building2, onClick: () => navigate('/learn/degree/engineering/nonit') },
    ];
  } else if (section === 'degree' && second === 'engineering' && segments.length === 3) {
    const isIt = third === 'it';
    selectedTrack = isIt ? 'degree-it' : 'degree-nonit';
    title = isIt ? 'IT Learning Subjects' : 'Non-IT Engineering Branches';
    items = (isIt ? IT_SUBJECTS : NON_IT_SUBJECTS).map((subject) => ({
      id: subject, title: subject, description: isIt ? 'Learn, assignment and mock test' : 'Branch knowledge and career preparation', icon: BookOpen,
      onClick: () => navigate(`/learn/degree/engineering/${third}/${encodeURIComponent(subject)}`),
    }));
  } else if (section === 'degree' && second === 'business' && segments.length === 2) {
    title = 'Business Postgraduate';
    items = [
      { id: 'hr', title: 'HR', description: 'People operations, recruitment and analytics', icon: Briefcase, onClick: () => navigate('/learn/degree/business/hr') },
      { id: 'operations', title: 'Operations', description: 'Supply chains, quality and process improvement', icon: Building2, onClick: () => navigate('/learn/degree/business/operations') },
      { id: 'management', title: 'Business Management', description: 'Strategy, marketing, finance and leadership', icon: Landmark, onClick: () => navigate('/learn/degree/business/management') },
    ];
  } else if (section === 'degree' && second === 'business' && segments.length === 3 && BUSINESS_AREAS[third]) {
    selectedTrack = `business-${third}` as PracticeTrack;
    title = `${third === 'hr' ? 'HR' : third === 'operations' ? 'Operations' : 'Business Management'} Topics`;
    items = BUSINESS_AREAS[third].map((subject) => ({
      id: subject, title: subject, description: 'Learn, assignment and mock test', icon: BookOpen,
      onClick: () => navigate(`/learn/degree/business/${third}/${encodeURIComponent(subject)}`),
    }));
  } else if (section === 'sslc' && segments.length === 2 && SSLC_CORE_SUBJECTS.includes(second)) {
    selectedTrack = 'sslc';
    selectedSubject = second;
    title = `${second} · SSLC`;
  } else if (section === 'puc' && segments.length === 3 && PUC_SUBJECTS[second]?.includes(third)) {
    selectedTrack = second as PracticeTrack;
    selectedSubject = third;
    title = `${second.toUpperCase()} · PCMB · ${third}`;
  } else if (section === 'degree' && second === 'engineering' && segments.length === 4) {
    selectedTrack = third === 'it' ? 'degree-it' : 'degree-nonit';
    selectedSubject = segments[3];
    title = `${selectedSubject} · ${third.toUpperCase()}`;
  } else if (section === 'degree' && second === 'business' && segments.length === 4 && BUSINESS_AREAS[third]) {
    selectedTrack = `business-${third}` as PracticeTrack;
    selectedSubject = segments[3];
    title = `${selectedSubject} · ${third === 'hr' ? 'HR' : third === 'operations' ? 'Operations' : 'Business Management'}`;
  }

  if (selectedTrack && selectedSubject) {
    const modes = [
      { id: 'daily', title: 'Learn', description: 'Five questions with answers and explanations', icon: BookOpen },
      { id: 'assignment', title: 'Assignment', description: 'Practice and review your score', icon: ClipboardList },
      { id: 'mock', title: 'Mock Test', description: '20 timed questions with detailed results', icon: Clock },
    ];
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
          <button type="button" onClick={() => navigate(backPath)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <div className="card p-6 mb-6 gradient-hero text-white">
            <p className="text-sm text-teal-100">{TRACK_LABELS[selectedTrack]}</p>
            <h1 className="text-2xl font-heading font-bold mt-1">{title}</h1>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            {modes.map((mode) => <StudyCard key={mode.id} title={mode.title} description={mode.description} icon={mode.icon} onClick={() => navigate(`/practice/${selectedTrack}/${mode.id}/${encodeURIComponent(selectedSubject)}`)} />)}
          </div>
          <button type="button" onClick={() => navigate(`/scores/${selectedTrack}`)} className="btn-secondary mt-6">View score dashboard</button>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {sslcLanguageError && section === 'sslc' && (
          <div className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{sslcLanguageError}</div>
        )}
        {segments.length > 0 && (
          <button type="button" onClick={() => navigate(backPath)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">KHBV.D Learning</p>
            <h1 className="text-2xl font-heading font-bold text-slate-900 mt-1">{title}</h1>
          </div>
          {section && !(section === 'degree' && selectedTrack) && <button type="button" onClick={() => navigate(`/scores/${section === 'puc' ? second || 'cet' : section === 'degree' ? 'degree' : 'sslc'}`)} className="btn-secondary text-sm">Scores</button>}
        </div>
        {items.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => <StudyCard key={item.id} title={item.title} description={item.description} icon={item.icon} onClick={item.onClick} />)}
          </div>
        ) : (
          <div className="card p-8 text-center">
            <p className="font-semibold text-slate-800">
              {section === 'sslc' && SSLC_LANGUAGE_GROUPS.some(({ id }) => id === second)
                ? 'No syllabus lessons are currently populated for this configured language.'
                : 'This learning section is not available.'}
            </p>
            <button type="button" onClick={() => navigate('/learn')} className="btn-primary mt-4">Learning areas</button>
          </div>
        )}
        {selectedTrack === 'degree-it' && (
          <button type="button" onClick={() => navigate('/companies')} className="btn-secondary mt-6">Company catalogue</button>
        )}
      </main>
    </div>
  );
}