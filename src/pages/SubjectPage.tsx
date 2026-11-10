import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle, FileText, GraduationCap, ListChecks } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { navigate } from '@/App';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import {
  getCurrentSSLCAcademicYear,
  OFFICIAL_SSLC_SOURCES,
  SSLC_CORE_SUBJECTS,
  isSSLCFirstLanguage,
  type SSLCLanguageCategory,
  type SSLCPaper,
} from '@/lib/sslc-content';
import { useSSLCContent } from '@/lib/use-sslc-content';

type PageSection = 'syllabus' | 'lesson' | 'vault';

const LANGUAGE_CATEGORIES: SSLCLanguageCategory[] = ['first_language', 'second_language', 'third_language'];

const LABELS: Record<string, Record<string, string>> = {
  Kannada: {
    syllabus: 'ಪಠ್ಯಕ್ರಮ', lesson: 'ಪಾಠ', vault: 'ಪರೀಕ್ಷಾ ಪತ್ರಿಕೆಗಳು', summary: 'ಪಾಠದ ಸಾರಾಂಶ',
    points: 'ಮುಖ್ಯ ಅಂಶಗಳು', vocabulary: 'ಪದಕೋಶ', questions: 'ಪ್ರಮುಖ ಪ್ರಶ್ನೆಗಳು ಮತ್ತು ಉತ್ತರಗಳು',
    exam: 'ಪರೀಕ್ಷಾ ತಯಾರಿ', complete: 'ಪಾಠ ಪೂರ್ಣಗೊಳಿಸಿ', completed: 'ಪಾಠ ಪೂರ್ಣಗೊಂಡಿದೆ',
    learn: 'ಕಲಿಕೆ', assignment: 'ಅಸೈನ್‌ಮೆಂಟ್', mock: 'ಮಾದರಿ ಪರೀಕ್ಷೆ', noContent: 'ಈ ವರ್ಷದ ಪರಿಶೀಲಿತ ಪಾಠದ ವಿಷಯ ಇನ್ನೂ ಲಭ್ಯವಿಲ್ಲ.',
    backToLessons: 'ಪಾಠಗಳ ಪಟ್ಟಿಗೆ ಹಿಂತಿರುಗಿ',
  },
  English: {
    syllabus: 'Syllabus', lesson: 'Lesson', vault: 'Exam Papers', summary: 'Lesson summary',
    points: 'Important points', vocabulary: 'Vocabulary', questions: 'Important questions and answers',
    exam: 'Exam preparation', complete: 'Mark lesson complete', completed: 'Lesson completed',
    learn: 'Learn', assignment: 'Assignment', mock: 'Mock Test', noContent: 'Verified lesson content for this academic year is not available yet.',
    backToLessons: 'Back to Lessons',
  },
  Hindi: {
    syllabus: 'पाठ्यक्रम', lesson: 'पाठ', vault: 'परीक्षा प्रश्नपत्र', summary: 'पाठ का सारांश',
    points: 'मुख्य बिंदु', vocabulary: 'शब्दावली', questions: 'महत्वपूर्ण प्रश्न और उत्तर',
    exam: 'परीक्षा की तैयारी', complete: 'पाठ पूरा करें', completed: 'पाठ पूरा हुआ',
    learn: 'सीखें', assignment: 'असाइनमेंट', mock: 'मॉक टेस्ट', noContent: 'इस शैक्षणिक वर्ष की सत्यापित पाठ सामग्री अभी उपलब्ध नहीं है।',
    backToLessons: 'पाठ सूची पर वापस जाएँ',
  },
  Sanskrit: {
    syllabus: 'पाठ्यक्रमः', lesson: 'पाठः', vault: 'परीक्षाप्रश्नपत्राणि', summary: 'पाठस्य सारांशः',
    points: 'मुख्यबिन्दवः', vocabulary: 'शब्दार्थाः', questions: 'महत्त्वपूर्णप्रश्नोत्तराणि',
    exam: 'परीक्षासज्जता', complete: 'पाठं पूर्णं कुरुत', completed: 'पाठः पूर्णः',
    learn: 'अध्ययनम्', assignment: 'अभ्यासकार्यम्', mock: 'नमूनापरीक्षा', noContent: 'अस्य शैक्षणिकवर्षस्य प्रमाणितं पाठ्यसामग्री अद्यापि न उपलब्धम्।',
    backToLessons: 'पाठसूचीं प्रति गच्छतु',
  },
  Urdu: {
    syllabus: 'نصاب', lesson: 'سبق', vault: 'امتحانی پرچے', summary: 'سبق کا خلاصہ',
    points: 'اہم نکات', vocabulary: 'الفاظ اور معنی', questions: 'اہم سوالات اور جوابات',
    exam: 'امتحان کی تیاری', complete: 'سبق مکمل کریں', completed: 'سبق مکمل ہوگیا',
    learn: 'سیکھیں', assignment: 'اسائنمنٹ', mock: 'ماک ٹیسٹ', noContent: 'اس تعلیمی سال کا تصدیق شدہ سبق ابھی دستیاب نہیں ہے۔',
    backToLessons: 'اسباق کی فہرست پر واپس جائیں',
  },
};

function languageCategoryFor(profile: ReturnType<typeof useAuth>['profile'], subject: string, requested?: SSLCLanguageCategory) {
  if (requested) return requested;
  return LANGUAGE_CATEGORIES.find((category) => profile?.[category] === subject);
}

export function SubjectPage({
  subject,
  languageCategory: requestedCategory,
}: {
  subject: string;
  languageCategory?: SSLCLanguageCategory;
}) {
  const { profile } = useAuth();
  const category = languageCategoryFor(profile, subject, requestedCategory);
  const isCoreSubject = (SSLC_CORE_SUBJECTS as readonly string[]).includes(subject);
  const configuredLanguage = category ? profile?.[category] : null;
  const contentLanguage = isCoreSubject ? (profile?.first_language || 'English') : subject;
  const isAvailableFirstLanguage = category === 'first_language' && isSSLCFirstLanguage(subject);
  const selectionAllowed = isCoreSubject || isAvailableFirstLanguage || (!!category && configuredLanguage === subject);
  const { chapters, papers, loading, sourceError } = useSSLCContent(subject, category, contentLanguage);
  const [section, setSection] = useState<PageSection>('syllabus');
  const [selectedChapterId, setSelectedChapterId] = useState('');
  const [completedChapterIds, setCompletedChapterIds] = useState<Set<string>>(new Set());
  const [progressError, setProgressError] = useState('');

  const labels = LABELS[contentLanguage] ?? LABELS.English;
  const selectedChapter = useMemo(
    () => chapters.find((chapter) => chapter.id === selectedChapterId) ?? chapters[0],
    [chapters, selectedChapterId],
  );
  const currentYear = getCurrentSSLCAcademicYear();

  useEffect(() => {
    if (!selectedChapter && chapters.length > 0) setSelectedChapterId(chapters[0].id);
  }, [chapters, selectedChapter]);

  useEffect(() => {
    if (!profile || chapters.length === 0) {
      setCompletedChapterIds(new Set());
      return;
    }
    let active = true;
    const loadProgress = async () => {
      try {
        const { data, error } = await supabase.from('sslc_lesson_progress')
          .select('chapter_id')
          .eq('user_id', profile.id)
          .in('chapter_id', chapters.map((chapter) => chapter.id))
          .returns<{ chapter_id: string }[]>();
        if (!active) return;
        if (error) {
          setProgressError('Lesson progress could not be loaded. Apply the SSLC progress migration and retry.');
          return;
        }
        setCompletedChapterIds(new Set((data ?? []).map((row) => row.chapter_id)));
        setProgressError('');
      } catch {
        if (!active) return;
        setProgressError('Lesson progress could not be loaded. Check your connection and retry.');
      }
    };
    void loadProgress();
    return () => { active = false; };
  }, [chapters, profile]);

  if (!profile) return null;

  const markLessonComplete = async () => {
    if (!selectedChapter) return;
    setProgressError('');
    const { error } = await supabase.from('sslc_lesson_progress').upsert({
      user_id: profile.id,
      chapter_id: selectedChapter.id,
    }, { onConflict: 'user_id,chapter_id' });
    if (error) {
      setProgressError('This lesson could not be marked complete. Please retry.');
      return;
    }
    setCompletedChapterIds((current) => new Set(current).add(selectedChapter.id));
  };

  const setPageSection = (nextSection: PageSection) => {
    setSection(nextSection);
    if (nextSection === 'lesson' && selectedChapter) setSelectedChapterId(selectedChapter.id);
  };

  const practiceRoute = (mode: 'daily' | 'assignment' | 'mock') => {
    if (!selectedChapter) return;
    const categorySlug = category?.replace('_', '-');
    const route = `/practice/sslc/${mode}/${encodeURIComponent(subject)}/${encodeURIComponent(selectedChapter.title)}${categorySlug ? `/${categorySlug}` : ''}`;
    navigate(route);
  };

  const direction = contentLanguage === 'Urdu' ? 'rtl' : 'ltr';

  return (
    <div className="min-h-screen bg-slate-50" dir={direction}>
      <AppHeader />
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <button type="button" onClick={() => navigate('/learn/sslc')} className="mb-6 flex items-center gap-1 text-sm text-slate-500 hover:text-teal-700">
          <ArrowLeft className="h-4 w-4" /> {contentLanguage === 'English' ? 'Back to SSLC' : 'SSLC'}
        </button>

        <section className="card gradient-hero mb-6 overflow-hidden text-white">
          <div className="flex flex-col justify-between gap-5 p-6 sm:flex-row sm:items-center sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-amber-300/50 bg-white/10">
                <GraduationCap className="h-7 w-7 text-amber-300" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Karnataka SSLC · {currentYear}</p>
                <h1 className="mt-1 text-2xl font-heading font-bold sm:text-3xl">{subject}</h1>
                {category && <p className="mt-1 text-sm text-teal-100/80">{category.replace('_', ' ')}</p>}
              </div>
            </div>
            <p className="text-sm text-teal-100/80">{chapters.length} verified lessons</p>
          </div>
          <nav aria-label="SSLC subject navigation" className="flex gap-2 overflow-x-auto px-4 pb-4 sm:px-8">
            {([
              ['syllabus', labels.syllabus, ListChecks],
              ['lesson', labels.lesson, BookOpen],
              ['vault', labels.vault, FileText],
            ] as const).map(([id, label, Icon]) => (
              <button key={id} type="button" onClick={() => setPageSection(id)} aria-current={section === id ? 'page' : undefined}
                className={`flex shrink-0 items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold ${section === id ? 'bg-amber-300 text-slate-950' : 'bg-white/10 text-white hover:bg-white/20'}`}>
                <Icon className="h-4 w-4" />{label}
              </button>
            ))}
          </nav>
        </section>

        {!selectionAllowed && (
          <div role="alert" className="card mb-5 p-5 text-amber-900">
            This language is not assigned to a language category in your student profile. Choose the configured language from the SSLC learning hub.
          </div>
        )}
        {sourceError && <div role="alert" className="mb-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">{sourceError}</div>}
        {progressError && <div role="alert" className="mb-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">{progressError}</div>}
        {loading && <div className="card mb-5 p-6 text-sm text-slate-500">Loading verified Karnataka syllabus content…</div>}
        {!loading && !sourceError && chapters.length === 0 && (
          <section className="card mb-6 p-5">
            <h2 className="font-heading text-lg font-bold">{labels.noContent}</h2>
            <p className="mt-2 text-sm text-slate-600">
              This view intentionally excludes unverified, old-year, and non-Karnataka placeholder material. No lesson title or question is being inferred.
            </p>
            <div className="mt-4 flex flex-wrap gap-3 text-sm">
              {OFFICIAL_SSLC_SOURCES.map((url) => <a key={url} href={url} target="_blank" rel="noreferrer" className="text-teal-700 underline">{new URL(url).hostname}</a>)}
            </div>
          </section>
        )}

        {!selectionAllowed ? null : section === 'vault' ? (
          <PaperVault papers={papers} />
        ) : (
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <section className="card p-5">
              <h2 className="mb-4 font-heading text-lg font-bold">{labels.syllabus} · {chapters.length}</h2>
              <ol className="space-y-2">
                {chapters.map((chapter) => (
                  <li key={chapter.id}>
                    <button type="button" onClick={() => { setSelectedChapterId(chapter.id); setSection('lesson'); }}
                      className={`flex w-full items-start gap-3 rounded-xl border p-4 text-left ${selectedChapter?.id === chapter.id ? 'border-teal-400 bg-teal-50' : 'border-slate-200 hover:border-teal-300'}`}>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-xs font-bold">{chapter.chapter_number}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold text-slate-900">{chapter.title}</span>
                        {chapter.section && <span className="mt-1 block text-xs text-slate-500">{chapter.section}</span>}
                      </span>
                      {completedChapterIds.has(chapter.id) && <CheckCircle aria-label={labels.completed} className="h-5 w-5 shrink-0 text-emerald-600" />}
                    </button>
                  </li>
                ))}
              </ol>
            </section>

            {selectedChapter && section === 'lesson' && (
              <article lang={contentLanguage} className="card p-5 sm:p-6">
                {category === 'first_language' && (
                  <button type="button" onClick={() => setPageSection('syllabus')} className="mb-4 text-sm font-semibold text-teal-700 hover:text-teal-900">
                    <ArrowLeft className="mr-1 inline h-4 w-4" />{labels.backToLessons}
                  </button>
                )}
                <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">{selectedChapter.section || labels.lesson}</p>
                <h2 className="mt-1 font-heading text-xl font-bold">{selectedChapter.title}</h2>
                {selectedChapter.lesson_content?.source_pdf && (
                  <p className="mt-2 text-xs text-slate-500">
                    Source: {selectedChapter.lesson_content.source_pdf}
                    {selectedChapter.lesson_content.source_part ? ` · Part ${selectedChapter.lesson_content.source_part}` : ''}
                  </p>
                )}
                <h3 className="mt-5 font-semibold">{labels.summary}</h3>
                {selectedChapter.summary && <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selectedChapter.summary}</p>}
                {selectedChapter.lesson_content?.story && <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-slate-700">{selectedChapter.lesson_content.story}</p>}
                {selectedChapter.key_points.length > 0 && <ContentList title={labels.points} items={selectedChapter.key_points} />}
                {selectedChapter.formulas.length > 0 && <ContentList title={contentLanguage === 'English' ? 'Formulas and equations' : labels.points} items={selectedChapter.formulas} />}
                {selectedChapter.lesson_content?.vocabulary?.length ? (
                  <section className="mt-5">
                    <h3 className="font-semibold">{labels.vocabulary}</h3>
                    <dl className="mt-2 space-y-2">
                      {selectedChapter.lesson_content.vocabulary.map(({ word, meaning }) => <div key={word} className="rounded-lg bg-slate-50 p-3"><dt className="font-semibold">{word}</dt><dd className="mt-1 text-sm text-slate-600">{meaning}</dd></div>)}
                    </dl>
                  </section>
                ) : null}
                {selectedChapter.lesson_content?.important_questions?.length ? (
                  <section className="mt-5">
                    <h3 className="font-semibold">{labels.questions}</h3>
                    {selectedChapter.lesson_content.important_questions.map((item, index) => <div key={`${index}-${item.question}`} className="mt-2 rounded-lg border border-slate-200 p-3"><p className="font-medium">{item.question}</p><p className="mt-2 text-sm">{item.answer}</p><p className="mt-2 text-sm text-slate-600">{item.explanation}</p></div>)}
                  </section>
                ) : null}
                {selectedChapter.lesson_content?.exam_preparation?.length ? <ContentList title={labels.exam} items={selectedChapter.lesson_content.exam_preparation} /> : null}
                {selectedChapter.literature.story_focus && <p className="mt-4 rounded-lg bg-amber-50 p-3 text-sm">{selectedChapter.literature.story_focus}</p>}
                {selectedChapter.literature.poem_focus && <p className="mt-2 rounded-lg bg-amber-50 p-3 text-sm">{selectedChapter.literature.poem_focus}</p>}

                <button type="button" onClick={() => void markLessonComplete()} disabled={completedChapterIds.has(selectedChapter.id)}
                  className="btn-secondary mt-5 inline-flex items-center gap-2 disabled:opacity-60">
                  <CheckCircle className="h-4 w-4" />{completedChapterIds.has(selectedChapter.id) ? labels.completed : labels.complete}
                </button>
                <div className="mt-6 border-t border-slate-200 pt-5">
                  <h3 className="font-heading font-bold">{contentLanguage === 'English' ? 'Practice this lesson' : labels.lesson}</h3>
                  <div className="mt-3 grid gap-2 sm:grid-cols-3">
                    {([
                      ['daily', labels.learn],
                      ['assignment', labels.assignment],
                      ['mock', labels.mock],
                    ] as const).map(([mode, label]) => <button key={mode} type="button" onClick={() => practiceRoute(mode)} className="btn-secondary inline-flex items-center justify-center gap-2">{label}<ArrowRight className="h-4 w-4" /></button>)}
                  </div>
                </div>
              </article>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

function ContentList({ title, items }: { title: string; items: string[] }) {
  return <section className="mt-5"><h3 className="font-semibold">{title}</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed text-slate-700">{items.map((item, index) => <li key={`${index}-${item}`}>{item}</li>)}</ul></section>;
}

function PaperVault({ papers }: { papers: SSLCPaper[] }) {
  return (
    <section className="card p-5 sm:p-6">
      <h2 className="font-heading text-xl font-bold">Verified Karnataka SSLC papers</h2>
      {papers.length ? <ul className="mt-4 space-y-2">{papers.map((paper) => (
        <li key={paper.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 p-4">
          <div><h3 className="font-semibold">{paper.title}</h3><p className="mt-1 text-sm text-slate-500">{paper.year ?? 'Model'} · {paper.paper_type}</p></div>
          <a href={paper.source_url} target="_blank" rel="noreferrer" className="btn-secondary inline-flex items-center gap-2">Open source <ArrowRight className="h-4 w-4" /></a>
        </li>
      ))}</ul> : <p className="mt-3 text-sm text-slate-600">No source-verified papers have been added to this subject yet.</p>}
    </section>
  );
}
