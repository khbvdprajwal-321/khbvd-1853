import { useState } from 'react';
import { GraduationCap, Briefcase, ArrowRight, BookOpen, Wrench, Cpu, HardHat } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth-context';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { degreeTypes, getDepartmentsForDegree } from '@/lib/question-engine';
import { useSSLCLanguages } from '@/lib/use-sslc-languages';
import { isSSLCFirstLanguage, SSLC_FIRST_LANGUAGES } from '@/lib/sslc-content';
import type { ExamStream, PucGroup } from '@/lib/types';

const PUC_GROUPS: { id: PucGroup; name: string; description: string }[] = [
  { id: 'pcmb', name: 'Science · PCMB', description: 'Physics, Chemistry, Mathematics and Biology' },
  { id: 'pcm', name: 'Science · PCM', description: 'Physics, Chemistry and Mathematics' },
  { id: 'commerce', name: 'Commerce', description: 'Commerce and business subjects' },
  { id: 'arts', name: 'Arts', description: 'Humanities and social-science subjects' },
];

const EXAM_STREAMS_BY_GROUP: Record<PucGroup, ExamStream[]> = {
  pcmb: ['cet', 'neet'],
  pcm: ['cet', 'jee'],
  commerce: [],
  arts: [],
};

const EXAM_STREAM_LABELS: Record<ExamStream, string> = {
  cet: 'CET',
  neet: 'NEET',
  jee: 'JEE',
};

function getExamSubjects(stream: ExamStream, group: PucGroup): string[] {
  if (stream === 'neet') return ['Biology', 'Chemistry', 'Physics'];
  if (stream === 'jee') return ['Physics', 'Chemistry', 'Mathematics'];
  return group === 'pcmb'
    ? ['Physics', 'Chemistry', 'Mathematics', 'Biology']
    : ['Physics', 'Chemistry', 'Mathematics'];
}

export function OnboardingPage() {
  const { profile, refreshProfile } = useAuth();
  const { languagesByCategory: sslcLanguages, error: sslcLanguageError } = useSSLCLanguages();
  const savedPath = typeof window !== 'undefined' ? window.localStorage.getItem('khbvd_selected_path') : null;
  const [userType, setUserType] = useState<'puc' | 'degree' | 'school' | null>(savedPath && ['cet', 'neet', 'jee'].includes(savedPath) ? 'puc' : savedPath === 'degree' ? 'degree' : null);
  const [examStream, setExamStream] = useState<string>(
    profile?.exam_stream ?? (savedPath && ['cet', 'neet', 'jee'].includes(savedPath) ? savedPath : ''),
  );
  const [degreeType, setDegreeType] = useState<string>('');
  const [department, setDepartment] = useState<string>('');
  const [semester, setSemester] = useState(1);
  const [pucYear, setPucYear] = useState<number | null>(null);
  const [pucGroup, setPucGroup] = useState<PucGroup | null>(
    profile?.puc_group ?? (profile?.exam_stream === 'neet' ? 'pcmb' : profile?.exam_stream === 'jee' ? 'pcm' : null),
  );
  const [experienceLevel, setExperienceLevel] = useState<'fresher' | 'experienced' | null>(null);
  const schoolClass = 10;
  const [firstLanguage, setFirstLanguage] = useState(profile?.first_language ?? '');
  const [secondLanguage, setSecondLanguage] = useState(profile?.second_language ?? '');
  const [thirdLanguage, setThirdLanguage] = useState(profile?.third_language ?? '');
  const [loading, setLoading] = useState(false);
  const [saveError, setSaveError] = useState('');

  const handleSubmit = async () => {
    if (!userType) return;
    if (userType === 'puc' && (!pucGroup || !pucYear)) return;
    if (userType === 'degree' && !degreeType) return;
    if (userType === 'degree' && degreeType === 'BE' && !department) return;
    if (userType === 'school' && (
      !isSSLCFirstLanguage(firstLanguage)
      || !sslcLanguages.second_language.includes(secondLanguage)
      || !sslcLanguages.third_language.includes(thirdLanguage)
    )) return;

    setSaveError('');
    const degreeData = degreeTypes.find((d) => d.id === degreeType);
    const maxSem = degreeData?.semesters || 8;

    setLoading(true);
    const { error } = await supabase.from('profiles').update({
      user_type: userType,
      exam_stream: userType === 'puc' && examStream ? examStream : null,
      ...(userType === 'puc' ? { puc_group: pucGroup } : {}),
      degree_type: userType === 'degree' ? degreeType : null,
      department: userType === 'degree' && degreeType === 'BE' ? department : null,
      experience_level: userType === 'degree' ? experienceLevel : null,
      current_semester: userType === 'degree' ? Math.min(semester, maxSem) : 1,
      puc_year: userType === 'puc' ? pucYear : null,
      school_class: userType === 'school' ? schoolClass : null,
      first_language: userType === 'school' ? firstLanguage || null : null,
      second_language: userType === 'school' ? secondLanguage || null : null,
      third_language: userType === 'school' ? thirdLanguage || null : null,
    }).eq('id', profile!.id);

    if (error) {
      setSaveError(error.code === '42703' || error.code === 'PGRST204'
        ? 'The profile schema is missing the PUC course-group field. Apply the pending PUC catalog migration, then retry.'
        : 'Your profile could not be saved. Check your connection and try again.');
      setLoading(false);
      return;
    }

    window.localStorage.removeItem('khbvd_selected_path');
    await refreshProfile();
    navigate('/dashboard');
  };

  const selectedDegree = degreeTypes.find((d) => d.id === degreeType);
  const maxSemesters = selectedDegree?.semesters || 8;
  const semesterList = Array.from({ length: maxSemesters }, (_, i) => i + 1);
  const availableDepartments = degreeType ? getDepartmentsForDegree(degreeType) : [];
  const pathReady = userType === 'school'
    ? !!firstLanguage && !!secondLanguage && !!thirdLanguage
      && isSSLCFirstLanguage(firstLanguage)
      && sslcLanguages.second_language.includes(secondLanguage)
      && sslcLanguages.third_language.includes(thirdLanguage)
    : userType === 'puc'
      ? !!pucGroup && !!pucYear
      : userType === 'degree' && !!degreeType && (degreeType !== 'BE' || !!department);

  const degreeCards = [
    { id: 'BE', name: 'B.E. / B.Tech', desc: 'IT & Non-IT career paths', icon: HardHat, duration: '4 years, 8 semesters' },
    { id: 'MBA', name: 'MBA & Business', desc: 'HR, Operations, Finance, Product', icon: Briefcase, duration: '2 years, 4 semesters' },
    { id: 'Diploma', name: 'Diploma', desc: 'Government jobs & technical roles', icon: Wrench, duration: '3 years, 6 semesters' },
  ];

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-heading font-bold text-slate-900 mb-2">
            Tell us about yourself
          </h1>
          <p className="text-slate-500">
            We'll personalize your learning experience based on your path.
          </p>
        </div>

        {/* Step 1: Choose path */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
            1. Choose your path
          </h2>
          <div className="grid sm:grid-cols-3 gap-4">
            <button
              onClick={() => setUserType('school')}
              className={`card p-6 text-left transition-all duration-200 ${userType === 'school' ? 'ring-2 ring-emerald-500 border-emerald-300' : 'hover:border-slate-300'}`}
            >
              <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6 text-emerald-700" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">SSLC Student</h3>
              <p className="text-sm text-slate-500">Class 10 learning and exam preparation</p>
            </button>
            <button
              onClick={() => setUserType('puc')}
              className={`card p-6 text-left transition-all duration-200 ${userType === 'puc' ? 'ring-2 ring-teal-500 border-teal-300' : 'hover:border-slate-300'}`}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-3">
                <GraduationCap className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">PUC Student</h3>
              <p className="text-sm text-slate-500">PUC stream learning and entrance preparation</p>
            </button>

            <button
              onClick={() => setUserType('degree')}
              className={`card p-6 text-left transition-all duration-200 ${userType === 'degree' ? 'ring-2 ring-cyan-500 border-cyan-300' : 'hover:border-slate-300'}`}
            >
              <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mb-3">
                <Briefcase className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-1">Degree Student</h3>
              <p className="text-sm text-slate-500">Career mapping & skill analysis</p>
            </button>
          </div>
        </div>

        {userType === 'school' && (
          <div className="mb-8 grid sm:grid-cols-3 gap-4 animate-fade-in-up">
            {([
              ['First Language', firstLanguage, setFirstLanguage, SSLC_FIRST_LANGUAGES],
              ['Second Language', secondLanguage, setSecondLanguage, sslcLanguages.second_language],
              ['Third Language', thirdLanguage, setThirdLanguage, sslcLanguages.third_language],
            ] as const).map(([label, value, setValue, languageOptions]) => (
              <label key={label} className="text-sm font-semibold text-slate-700">
                {label}
                <select
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  className="input-field mt-2"
                >
                  <option value="">Select a language</option>
                  {languageOptions.map((language) => <option key={language} value={language}>{language}</option>)}
                </select>
              </label>
            ))}
            <p className="sm:col-span-3 text-xs text-slate-500">
              Language choices are listed only after the current Karnataka syllabus catalogue is verified for each language category.
            </p>
            {Object.values(sslcLanguages).every((options) => options.length === 0) && !sslcLanguageError && (
              <p className="sm:col-span-3 text-sm text-amber-800" role="status">
                Verified 2026–27 language combinations have not been added yet. Your selections remain optional until the official catalogue is populated.
              </p>
            )}
            {sslcLanguageError && <p className="sm:col-span-3 text-xs text-amber-700">{sslcLanguageError}</p>}
          </div>
        )}

        {/* PUC course group */}
        {userType === 'puc' && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              2. Select your PUC course group
            </h2>
            <div className="space-y-3">
              {PUC_GROUPS.map((group) => (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => {
                    setPucGroup(group.id);
                    if (examStream && !EXAM_STREAMS_BY_GROUP[group.id].includes(examStream as ExamStream)) setExamStream('');
                  }}
                  className={`card w-full p-4 text-left flex items-center justify-between transition-all duration-200 ${pucGroup === group.id ? 'ring-2 ring-teal-500 border-teal-300' : 'hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-teal-50 flex items-center justify-center">
                      <BookOpen className="w-5 h-5 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-heading font-bold">{group.name}</h3>
                      <p className="text-sm text-slate-500">{group.description}</p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {userType === 'puc' && pucGroup && EXAM_STREAMS_BY_GROUP[pucGroup].length > 0 && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-2">
              Optional: Entrance exam preparation
            </h2>
            <p className="text-sm text-slate-500 mb-4">Choose an exam to personalize entrance-practice links. This does not change your PUC course group.</p>
            <div className="grid sm:grid-cols-2 gap-3">
              {EXAM_STREAMS_BY_GROUP[pucGroup].map((stream) => (
                <button
                  key={stream}
                  type="button"
                  onClick={() => setExamStream(examStream === stream ? '' : stream)}
                  className={`card p-4 text-left transition-all duration-200 ${examStream === stream ? 'ring-2 ring-teal-500 border-teal-300' : 'hover:border-slate-300'}`}
                >
                  <h3 className="font-heading font-bold">{EXAM_STREAM_LABELS[stream]}</h3>
                  <p className="text-sm text-slate-500">{getExamSubjects(stream, pucGroup).join(', ')}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* PUC year */}
        {userType === 'puc' && pucGroup && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              3. Select your PUC year
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setPucYear(1)}
                className={`card p-6 text-center transition-all duration-200 ${pucYear === 1 ? 'ring-2 ring-teal-500 border-teal-300' : 'hover:border-slate-300'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-heading font-bold text-teal-600">1</span>
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">1st PUC</h3>
                <p className="text-sm text-slate-500">First year</p>
              </button>
              <button
                onClick={() => setPucYear(2)}
                className={`card p-6 text-center transition-all duration-200 ${pucYear === 2 ? 'ring-2 ring-teal-500 border-teal-300' : 'hover:border-slate-300'}`}
              >
                <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl font-heading font-bold text-teal-600">2</span>
                </div>
                <h3 className="font-heading font-bold text-lg mb-1">2nd PUC</h3>
                <p className="text-sm text-slate-500">Second year</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Degree type — 3 options */}
        {userType === 'degree' && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              2. Select your degree
            </h2>
            <div className="space-y-3">
              {degreeCards.map((deg) => {
                const Icon = deg.icon;
                return (
                  <button
                    key={deg.id}
                    onClick={() => { setDegreeType(deg.id); setDepartment(''); setSemester(1); }}
                    className={`card w-full p-5 text-left flex items-center justify-between transition-all duration-200 ${degreeType === deg.id ? 'ring-2 ring-cyan-500 border-cyan-300' : 'hover:border-slate-300'}`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center">
                        <Icon className="w-6 h-6 text-cyan-600" />
                      </div>
                      <div>
                        <h3 className="font-heading font-bold text-lg">{deg.name}</h3>
                        <p className="text-sm text-slate-500">{deg.desc}</p>
                        <p className="text-xs text-slate-400 mt-0.5">{deg.duration}</p>
                      </div>
                    </div>
                    {degreeType === deg.id && <ArrowRight className="w-5 h-5 text-cyan-600" />}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 2b: Department selection for B.E. */}
        {userType === 'degree' && degreeType === 'BE' && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              3. Select your department
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {availableDepartments.map((dept) => (
                <button
                  key={dept.id}
                  onClick={() => setDepartment(dept.id)}
                  className={`card p-4 text-left transition-all duration-200 ${department === dept.id ? 'ring-2 ring-cyan-500 border-cyan-300' : 'hover:border-slate-300'}`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-cyan-600" />
                    <h3 className="font-semibold text-sm">{dept.name}</h3>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {dept.subjects.slice(0, 4).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded">{s.slice(0, 8)}</span>
                    ))}
                    {dept.subjects.length > 4 && <span className="text-xs text-slate-400">+{dept.subjects.length - 4}</span>}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Experience level for degree students */}
        {userType === 'degree' && degreeType && (degreeType !== 'BE' || department) && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              {degreeType === 'BE' ? '4' : '3'}. Experience level
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setExperienceLevel('fresher')}
                className={`card p-5 text-center transition-all duration-200 ${experienceLevel === 'fresher' ? 'ring-2 ring-cyan-500 border-cyan-300' : 'hover:border-slate-300'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-2">
                  <GraduationCap className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="font-heading font-bold mb-1">Fresher</h3>
                <p className="text-xs text-slate-500">Default 12 LPA package</p>
              </button>
              <button
                onClick={() => setExperienceLevel('experienced')}
                className={`card p-5 text-center transition-all duration-200 ${experienceLevel === 'experienced' ? 'ring-2 ring-cyan-500 border-cyan-300' : 'hover:border-slate-300'}`}
              >
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-2">
                  <Briefcase className="w-5 h-5 text-cyan-600" />
                </div>
                <h3 className="font-heading font-bold mb-1">Experienced</h3>
                <p className="text-xs text-slate-500">Enter your package choice</p>
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Semester — dynamic based on degree */}
        {userType === 'degree' && pathReady && (
          <div className="mb-8 animate-fade-in-up">
            <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wider mb-4">
              {userType === 'degree' ? (degreeType === 'BE' ? '5' : '4') : '4'}. Current semester
            </h2>
            <div className="flex flex-wrap gap-2">
              {semesterList.map((sem) => (
                <button
                  key={sem}
                  onClick={() => setSemester(sem)}
                  className={`w-12 h-12 rounded-xl font-bold transition-all duration-200 ${semester === sem ? 'bg-teal-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
                >
                  {sem}
                </button>
              ))}
            </div>
          </div>
        )}

        {saveError && <p role="alert" className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{saveError}</p>}

        {userType && pathReady && (
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed animate-fade-in-up"
          >
            {loading ? 'Setting up...' : 'Continue to Dashboard'}
            {!loading && <ArrowRight className="w-5 h-5" />}
          </button>
        )}
      </div>
    </div>
  );
}
