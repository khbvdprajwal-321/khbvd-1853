import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Briefcase, Building2 } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';
import { navigate } from '@/App';
import { supabase } from '@/lib/supabase';

interface CompanyRecord {
  id: string;
  name: string;
  introduction: string;
  common_roles: string[];
  technical_skills: string[];
  programming_languages: string[];
  aptitude_topics: string[];
  interview_prep: string[];
  careers_url: string;
  learning_links: { label: string; url: string }[];
}

export function CompanyCatalogPage() {
  const [companies, setCompanies] = useState<CompanyRecord[]>([]);
  const [selected, setSelected] = useState<CompanyRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    supabase.from('company_catalog').select('*').order('name').then(({ data, error: queryError }) => {
      if (!active) return;
      if (queryError) setError('Company information could not be loaded. Apply the latest Supabase migration and try again.');
      setCompanies((data ?? []) as CompanyRecord[]);
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  const back = () => navigate('/learn/degree/engineering/it');

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <button type="button" onClick={selected ? () => setSelected(null) : back} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 mb-6">
          <ArrowLeft className="w-4 h-4" /> {selected ? 'Back to companies' : 'Back to IT / Non-IT'}
        </button>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">Career preparation</p>
        <h1 className="text-2xl font-heading font-bold text-slate-900 mt-1 mb-2">IT Company Catalogue</h1>
        <p className="text-sm text-slate-500 mb-6">Role and skill examples are general preparation guidance. Confirm current openings and requirements on each company’s official career site.</p>
        {loading ? <div className="card p-10 flex justify-center"><div className="w-10 h-10 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" /></div>
          : error ? <div role="alert" className="card p-6 text-amber-800">{error}</div>
            : selected ? (
              <article className="card p-6 sm:p-8">
                <div className="flex items-start gap-4 mb-6">
                  <span className="w-12 h-12 rounded-lg bg-teal-50 flex items-center justify-center"><Building2 className="w-6 h-6 text-teal-700" /></span>
                  <div><h2 className="text-xl font-heading font-bold text-slate-900">{selected.name}</h2><p className="text-sm text-slate-600 mt-1">{selected.introduction}</p></div>
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <List title="Common roles" entries={selected.common_roles} />
                  <List title="Technical skills" entries={selected.technical_skills} />
                  <List title="Programming languages" entries={selected.programming_languages} />
                  <List title="Aptitude and reasoning" entries={selected.aptitude_topics} />
                  <List title="Interview preparation" entries={selected.interview_prep} />
                </div>
                <div className="flex flex-wrap gap-3 mt-6 pt-5 border-t border-slate-200">
                  <a href={selected.careers_url} target="_blank" rel="noreferrer" className="btn-primary inline-flex items-center gap-2">Official career site <ArrowUpRight className="w-4 h-4" /></a>
                  <button type="button" onClick={() => navigate('/practice/degree/mock')} className="btn-secondary inline-flex items-center gap-2"><Briefcase className="w-4 h-4" /> General engineering mock test</button>
                </div>
                {selected.learning_links.length > 0 && <div className="mt-6">
                  <h3 className="font-semibold text-slate-800 mb-2">Learning links</h3>
                  <div className="flex flex-wrap gap-3">{selected.learning_links.map((link) => <a key={link.url} href={link.url} target="_blank" rel="noreferrer" className="text-sm font-semibold text-teal-800 hover:underline inline-flex items-center gap-1">{link.label}<ArrowUpRight className="w-3.5 h-3.5" /></a>)}</div>
                </div>}
              </article>
            ) : companies.length ? (
              <div className="grid sm:grid-cols-2 gap-4">{companies.map((company) => <button key={company.id} type="button" onClick={() => setSelected(company)} className="card p-5 text-left hover:border-teal-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between"><h2 className="font-heading font-bold text-lg text-slate-900">{company.name}</h2><ArrowUpRight className="w-4 h-4 text-slate-400" /></div>
                <p className="text-sm text-slate-500 mt-2">{company.introduction}</p>
                <p className="text-xs text-teal-800 mt-3">{company.common_roles.slice(0, 3).join(' · ')}</p>
              </button>)}</div>
            ) : <div className="card p-6 text-slate-600">No company profiles are available yet.</div>}
      </main>
    </div>
  );
}

function List({ title, entries }: { title: string; entries: string[] }) {
  return <section><h3 className="font-semibold text-slate-800 mb-2">{title}</h3><ul className="space-y-1.5">{entries.map((entry) => <li key={entry} className="text-sm text-slate-600">{entry}</li>)}</ul></section>;
}