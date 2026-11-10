import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { getCurrentSSLCAcademicYear, type SSLCLanguageCategory } from '@/lib/sslc-content';

export type SSLCLanguagesByCategory = Record<SSLCLanguageCategory, string[]>;

const EMPTY_LANGUAGES: SSLCLanguagesByCategory = {
  first_language: [],
  second_language: [],
  third_language: [],
};

function isLanguageCategory(value: string | null): value is SSLCLanguageCategory {
  return value === 'first_language' || value === 'second_language' || value === 'third_language';
}

export function useSSLCLanguages() {
  const [languagesByCategory, setLanguagesByCategory] = useState<SSLCLanguagesByCategory>(EMPTY_LANGUAGES);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const loadOptions = async () => {
      try {
        const { data, error: queryError } = await supabase.from('sslc_chapters')
          .select('subject, language_category')
          .eq('academic_year', getCurrentSSLCAcademicYear())
          .eq('curriculum_status', 'included')
          .not('source_url', 'is', null)
          .not('source_verified_at', 'is', null)
          .not('language_category', 'is', null)
          .range(0, 199)
          .returns<{ subject: string; language_category: string | null }[]>();
        if (!active) return;
        if (queryError) {
          setLanguagesByCategory(EMPTY_LANGUAGES);
          setError('Verified language options could not be loaded from the Karnataka syllabus catalogue.');
          return;
        }

        const options: SSLCLanguagesByCategory = {
          first_language: [],
          second_language: [],
          third_language: [],
        };
        (data ?? []).forEach((row) => {
          if (isLanguageCategory(row.language_category) && row.subject && !options[row.language_category].includes(row.subject)) {
            options[row.language_category].push(row.subject);
          }
        });
        setLanguagesByCategory(options);
        setError(null);
      } catch {
        if (!active) return;
        setLanguagesByCategory(EMPTY_LANGUAGES);
        setError('Verified language options could not be loaded from the Karnataka syllabus catalogue.');
      }
    };
    void loadOptions();

    return () => { active = false; };
  }, []);

  return { languagesByCategory, error };
}
