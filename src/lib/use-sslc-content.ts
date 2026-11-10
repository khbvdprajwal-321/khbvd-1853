import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  getCurrentSSLCAcademicYear,
  type SSLCLanguageCategory,
  type SSLCChapter,
  type SSLCPaper,
} from '@/lib/sslc-content';

export function useSSLCContent(subject: string, languageCategory?: SSLCLanguageCategory, contentLanguage = 'English') {
  const [chapters, setChapters] = useState<SSLCChapter[]>([]);
  const [papers, setPapers] = useState<SSLCPaper[]>([]);
  const [loading, setLoading] = useState(true);
  const [sourceError, setSourceError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setSourceError(null);
    const academicYear = getCurrentSSLCAcademicYear();

    Promise.all([
      supabase.from('sslc_chapters')
        .select('id, subject, chapter_number, title, language, language_category, section, curriculum_status, summary, key_points, formulas, literature, academic_year, lesson_content, source_url, source_verified_at')
        .eq('subject', subject)
        .eq('language', contentLanguage)
        .eq('academic_year', academicYear)
        .eq('curriculum_status', 'included')
        .not('source_url', 'is', null)
        .not('source_verified_at', 'is', null)
        .order('chapter_number')
        .range(0, 199)
        .returns<SSLCChapter[]>(),
      supabase.from('sslc_papers')
        .select('id, subject, year, paper_type, title, description, questions, answer_script_url, source_url, source_verified_at')
        .eq('subject', subject)
        .not('source_url', 'is', null)
        .not('source_verified_at', 'is', null)
        .order('year', { ascending: false })
        .range(0, 99)
        .returns<SSLCPaper[]>(),
    ]).then(([chapterResult, paperResult]) => {
      if (!active) return;
      if (chapterResult.error || paperResult.error) {
        setSourceError('The verified Karnataka syllabus catalogue could not be loaded. Please retry later.');
        setChapters([]);
        setPapers([]);
      } else {
        const remoteChapters = chapterResult.data ?? [];
        setChapters(languageCategory
          ? remoteChapters.filter((chapter) => chapter.language_category === languageCategory)
          : remoteChapters.filter((chapter) => !chapter.language_category));
        setPapers(paperResult.data ?? []);
      }
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setSourceError('The verified Karnataka syllabus catalogue could not be loaded. Please retry later.');
      setChapters([]);
      setPapers([]);
      setLoading(false);
    });

    return () => { active = false; };
  }, [contentLanguage, languageCategory, subject]);

  return { chapters, papers, loading, sourceError };
}
