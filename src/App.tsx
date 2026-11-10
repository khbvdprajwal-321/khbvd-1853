import { lazy, Suspense, useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth-context';

const LandingPage = lazy(() => import('@/pages/LandingPage').then((module) => ({ default: module.LandingPage })));
const AuthPage = lazy(() => import('@/pages/AuthPage').then((module) => ({ default: module.AuthPage })));
const OnboardingPage = lazy(() => import('@/pages/OnboardingPage').then((module) => ({ default: module.OnboardingPage })));
const DashboardPage = lazy(() => import('@/pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const ExamPage = lazy(() => import('@/pages/ExamPage').then((module) => ({ default: module.ExamPage })));
const ResultsPage = lazy(() => import('@/pages/ResultsPage').then((module) => ({ default: module.ResultsPage })));
const SubjectPage = lazy(() => import('@/pages/SubjectPage').then((module) => ({ default: module.SubjectPage })));
const DegreeFlowPage = lazy(() => import('@/pages/DegreeFlowPage').then((module) => ({ default: module.DegreeFlowPage })));
const ResumeAnalysisPage = lazy(() => import('@/pages/ResumeAnalysisPage').then((module) => ({ default: module.ResumeAnalysisPage })));
const PricingPage = lazy(() => import('@/pages/PricingPage').then((module) => ({ default: module.PricingPage })));
const ProfilePage = lazy(() => import('@/pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const HomeworkPage = lazy(() => import('@/pages/HomeworkPage').then((module) => ({ default: module.HomeworkPage })));
const AssistantPage = lazy(() => import('@/pages/AssistantPage').then((module) => ({ default: module.AssistantPage })));
const PracticePage = lazy(() => import('@/pages/PracticePage').then((module) => ({ default: module.PracticePage })));
const LearningHubPage = lazy(() => import('@/pages/LearningHubPage').then((module) => ({ default: module.LearningHubPage })));
const ScoreDashboardPage = lazy(() => import('@/pages/ScoreDashboardPage').then((module) => ({ default: module.ScoreDashboardPage })));
const CompanyCatalogPage = lazy(() => import('@/pages/CompanyCatalogPage').then((module) => ({ default: module.CompanyCatalogPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((module) => ({ default: module.AdminPage })));

type Route =
  | { name: 'landing' }
  | { name: 'auth'; mode: 'login' | 'register' }
  | { name: 'onboarding' }
  | { name: 'dashboard' }
  | { name: 'subject'; subject: string; languageCategory?: 'first_language' | 'second_language' | 'third_language' }
  | { name: 'homework'; subject: string }
  | { name: 'exam'; subject: string; examType: string }
  | { name: 'results'; attemptId: string }
  | { name: 'degree' }
  | { name: 'resume' }
  | { name: 'pricing' }
  | { name: 'profile' }
  | { name: 'assistant' }
  | { name: 'practice'; track: string; mode: string; subject?: string; topic?: string; languageCategory?: 'first_language' | 'second_language' | 'third_language' }
  | { name: 'learning'; segments: string[] }
  | { name: 'scores'; track: string }
  | { name: 'companies' }
  | { name: 'admin' };

function parseHash(): Route {
  const hash = window.location.hash.slice(1) || '/';
  const parts = hash.split('/').filter(Boolean);

  if (parts.length === 0 || parts[0] === 'home') return { name: 'landing' };
  if (parts[0] === 'auth') return { name: 'auth', mode: (parts[1] as 'login' | 'register') || 'login' };
  if (parts[0] === 'onboarding') return { name: 'onboarding' };
  if (parts[0] === 'dashboard') return { name: 'dashboard' };
  if (parts[0] === 'subject' && parts[1]) {
    const categoryBySlug = {
      'first-language': 'first_language',
      'second-language': 'second_language',
      'third-language': 'third_language',
    } as const;
    const languageCategory = parts.length >= 3
      ? categoryBySlug[parts[1] as keyof typeof categoryBySlug]
      : undefined;
    return languageCategory
      ? { name: 'subject', subject: decodeURIComponent(parts[2]), languageCategory }
      : { name: 'subject', subject: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'homework' && parts[1]) return { name: 'homework', subject: decodeURIComponent(parts[1]) };
  if (parts[0] === 'exam' && parts[1] && parts[2]) return { name: 'exam', subject: decodeURIComponent(parts[1]), examType: parts[2] };
  if (parts[0] === 'results' && parts[1]) return { name: 'results', attemptId: parts[1] };
  if (parts[0] === 'degree') return { name: 'degree' };
  if (parts[0] === 'resume') return { name: 'resume' };
  if (parts[0] === 'pricing') return { name: 'pricing' };
  if (parts[0] === 'profile') return { name: 'profile' };
  if (parts[0] === 'assistant') return { name: 'assistant' };
  if (parts[0] === 'practice') return {
    name: 'practice',
    track: parts[1] ? decodeURIComponent(parts[1]) : '',
    mode: parts[2] ?? '',
    subject: parts[3] ? decodeURIComponent(parts[3]) : undefined,
    topic: parts[4] ? decodeURIComponent(parts[4]) : undefined,
    languageCategory: parts[5] === 'first-language'
      ? 'first_language'
      : parts[5] === 'second-language'
        ? 'second_language'
        : parts[5] === 'third-language'
          ? 'third_language'
          : undefined,
  };
  if (parts[0] === 'learn') return { name: 'learning', segments: parts.slice(1).map(decodeURIComponent) };
  if (parts[0] === 'scores') return { name: 'scores', track: parts[1] ? decodeURIComponent(parts[1]) : '' };
  if (parts[0] === 'companies') return { name: 'companies' };
  if (parts[0] === 'admin') return { name: 'admin' };
  return { name: 'landing' };
}

export function navigate(route: string) {
  window.location.hash = route;
  window.scrollTo(0, 0);
}

export function App() {
  const { session, profile, profileError, loading, refreshProfile, signOut } = useAuth();
  const [route, setRoute] = useState<Route>(parseHash());

  useEffect(() => {
    const onHashChange = () => setRoute(parseHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-teal-200 border-t-teal-600 rounded-full animate-spin" />
          <p className="text-slate-500 font-medium">Loading KHBV.D...</p>
        </div>
      </div>
    );
  }

  if (session && profileError) {
    return (
      <main className="min-h-screen bg-slate-50 px-4 py-16">
        <section role="alert" className="card mx-auto max-w-lg p-6 text-center">
          <h1 className="font-heading text-xl font-bold text-slate-900">We couldn’t load your account</h1>
          <p className="mt-2 text-sm text-slate-600">{profileError}</p>
          <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
            <button type="button" onClick={() => void refreshProfile()} className="btn-primary">Retry</button>
            <button type="button" onClick={() => void signOut()} className="btn-secondary">Sign out</button>
          </div>
        </section>
      </main>
    );
  }

  // Route guards
  const isAuthed = !!session;
  const needsOnboarding = isAuthed && !!profile && !profile.user_type;

  if (!isAuthed && route.name !== 'auth') {
    navigate('/auth/login');
    return null;
  }
  if (isAuthed && (route.name === 'landing' || route.name === 'auth')) {
    navigate(needsOnboarding ? '/onboarding' : '/dashboard');
    return null;
  }
  if (needsOnboarding && route.name !== 'onboarding' && route.name !== 'auth' && route.name !== 'pricing') {
    navigate('/onboarding');
    return null;
  }

  switch (route.name) {
    default:
      return (
        <Suspense fallback={<div className="min-h-screen bg-slate-50 p-8 text-center text-sm text-slate-500">Loading page…</div>}>
          {route.name === 'landing' && <LandingPage />}
          {route.name === 'auth' && <AuthPage mode={route.mode} />}
          {route.name === 'onboarding' && <OnboardingPage />}
          {route.name === 'dashboard' && <DashboardPage />}
          {route.name === 'subject' && <SubjectPage subject={route.subject} languageCategory={route.languageCategory} />}
          {route.name === 'homework' && <HomeworkPage subject={route.subject} />}
          {route.name === 'exam' && <ExamPage subject={route.subject} examType={route.examType} />}
          {route.name === 'results' && <ResultsPage attemptId={route.attemptId} />}
          {route.name === 'degree' && <DegreeFlowPage />}
          {route.name === 'resume' && <ResumeAnalysisPage />}
          {route.name === 'pricing' && <PricingPage />}
          {route.name === 'profile' && <ProfilePage />}
          {route.name === 'assistant' && <AssistantPage />}
          {route.name === 'practice' && <PracticePage key={`${route.track}-${route.mode}-${route.subject ?? ''}-${route.topic ?? ''}-${route.languageCategory ?? ''}`} track={route.track} mode={route.mode} subject={route.subject} topic={route.topic} languageCategory={route.languageCategory} />}
          {route.name === 'learning' && <LearningHubPage segments={route.segments} />}
          {route.name === 'scores' && <ScoreDashboardPage track={route.track} />}
          {route.name === 'companies' && <CompanyCatalogPage />}
          {route.name === 'admin' && <AdminPage />}
        </Suspense>
      );
  }
}
