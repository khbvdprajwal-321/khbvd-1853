import {
  GraduationCap, BookOpen, Brain, TrendingUp, FileText, Clock,
  Target, Award, Users, ArrowRight, CheckCircle, Sparkles, Zap, BarChart3,
  Briefcase, Crown, MessageCircle, ChevronRight, LogIn,
} from 'lucide-react';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { useAuth } from '@/lib/auth-context';

export function LandingPage() {
  const { session } = useAuth();

  const handlePathSelect = (pathId: string) => {
    window.localStorage.setItem('khbvd_selected_path', pathId);
    navigate(session ? '/onboarding' : '/auth/register');
  };

  return (
    <div className="min-h-screen bg-white">
      <AppHeader />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-teal-300 blur-3xl animate-float" />
          <div className="absolute bottom-10 right-20 w-96 h-96 rounded-full bg-cyan-400 blur-3xl animate-float delay-200" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-fade-in-up">
              <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 rounded-full text-sm font-medium border border-white/20 mb-6">
                <Sparkles className="w-4 h-4 text-teal-300" />
                AI-Powered Learning Platform
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-heading font-bold leading-tight mb-6">
                Learn smarter.<br />
                <span className="text-teal-300">Master your exams.</span><br />
                Build your future.
              </h1>
              <p className="text-lg text-teal-50/80 mb-8 max-w-xl leading-relaxed">
                KHBV.D supports PUC students with CET, NEET, and JEE preparation, and Degree and Diploma students through role-focused learning, mock tests, and assignments.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/auth/register')}
                  className="px-8 py-4 bg-white text-teal-700 font-bold rounded-xl hover:bg-teal-50 transition-all duration-200 active:scale-95 shadow-xl flex items-center justify-center gap-2 group"
                >
                  Start Free Today
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={() => navigate('/pricing')}
                  className="px-8 py-4 bg-white/10 text-white font-bold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-200 active:scale-95"
                >
                  View Plans
                </button>
              </div>

              <div className="flex items-center gap-6 mt-10">
                <div>
                  <div className="text-2xl font-heading font-bold">5</div>
                  <div className="text-sm text-teal-200/70">Questions in each Learn set</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <div className="text-2xl font-heading font-bold">20</div>
                  <div className="text-sm text-teal-200/70">Mock test questions</div>
                </div>
                <div className="w-px h-10 bg-white/20" />
                <div>
                  <div className="text-2xl font-heading font-bold">3</div>
                  <div className="text-sm text-teal-200/70">New assignment questions daily</div>
                </div>
              </div>
            </div>

            <div className="hidden lg:flex justify-center animate-fade-in-up delay-300">
              <div className="relative">
                <div className="absolute inset-0 bg-teal-400/30 blur-3xl rounded-full" />
                <div className="relative w-80 h-96 bg-white/10 rounded-3xl border border-white/20 p-6 backdrop-blur-md">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-xl bg-teal-400/20 flex items-center justify-center">
                      <Brain className="w-6 h-6 text-teal-300" />
                    </div>
                    <div>
                      <div className="font-semibold">GBSI Engine</div>
                      <div className="text-xs text-teal-200/60">Skill Analysis</div>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {['Python', 'Data Structures', 'SQL', 'Machine Learning'].map((skill, i) => (
                      <div key={skill} className="flex items-center gap-3">
                        <CheckCircle className="w-4 h-4 text-teal-300" />
                        <span className="text-sm">{skill}</span>
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-teal-400 rounded-full"
                            style={{ width: `${85 - i * 15}%` }}
                          />
                        </div>
                      </div>
                    ))}
                    <div className="pt-3 border-t border-white/10">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-teal-200/70">Skill Score</span>
                        <span className="font-bold text-teal-300">72%</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Wave separator */}
        <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
          <path d="M0 80L1440 80L1440 20C1200 50 960 60 720 50C480 40 240 20 0 40L0 80Z" fill="white" />
        </svg>
      </section>

      {/* Direct path selection */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Start here</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-3">Start your PUC or degree journey</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">Choose CET, NEET or JEE for your 2nd PUC preparation, or a degree path for career-focused learning.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { id: 'cet', title: 'CET', detail: 'Maths, Physics, Chemistry, Biology', icon: GraduationCap, tone: 'teal' },
              { id: 'neet', title: 'NEET', detail: 'Biology, Chemistry, Physics', icon: BookOpen, tone: 'emerald' },
              { id: 'jee', title: 'JEE', detail: 'Maths, Physics, Chemistry', icon: Brain, tone: 'cyan' },
              { id: 'degree', title: 'Degree', detail: 'Subjects, careers, and hiring posts', icon: Briefcase, tone: 'amber' },
            ].map((path) => (
              <button
                key={path.id}
                onClick={() => handlePathSelect(path.id)}
                className="card p-5 text-left hover:-translate-y-1 hover:shadow-lg transition-all duration-200 group"
              >
                <div className={`w-11 h-11 rounded-xl bg-${path.tone}-50 flex items-center justify-center mb-4`}>
                  <path.icon className={`w-5 h-5 text-${path.tone}-600`} />
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-heading font-bold text-lg">{path.title}</h3>
                  <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-sm text-slate-500 mt-1">{path.detail}</p>
              </button>
            ))}
          </div>
          {!session && (
            <div className="text-center mt-6">
              <p className="text-sm text-slate-500 mb-3">Already have an account?</p>
              <button onClick={() => navigate('/auth/login')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm">
                <LogIn className="w-4 h-4" /> Sign In
              </button>
            </div>
          )}
          {session && (
            <div className="text-center mt-6">
              <button onClick={() => navigate('/dashboard')} className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 transition-colors text-sm">
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
          <button onClick={() => navigate('/assistant')} className="mx-auto mt-6 flex items-center gap-2 text-sm font-semibold text-teal-700 hover:text-teal-800 transition-colors">
            <MessageCircle className="w-4 h-4" /> Ask KHBV.D Assistant which path is right for you
          </button>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Features</span>
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-4">
            Everything you need to succeed
          </h2>
          <p className="text-slate-600 max-w-2xl mx-auto">
            From competitive exam prep to career-ready skill analysis, KHBV.D covers every step of your journey.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { icon: BookOpen, title: 'Smart Exam Engine', desc: 'Auto-generated questions with 30% easy, 50% medium, 20% difficult distribution across all subjects.' },
            { icon: Brain, title: 'GBSI Skill Analysis', desc: 'Upload your resume and get an instant skill gap report with personalized improvement recommendations.' },
            { icon: Target, title: 'Career Mapping', desc: 'Maps your degree to real company roles with required skills and salary expectations.' },
            { icon: Clock, title: 'Timed Practice', desc: '25 questions, 25 seconds each. Build speed and accuracy under realistic exam conditions.' },
            { icon: FileText, title: 'Homework System', desc: 'Structured 1-2-3-2 daily homework cycle keeps you consistently improving without burnout.' },
            { icon: BarChart3, title: 'Progress Tracking', desc: 'Detailed analytics on every attempt with difficulty breakdowns and topic-wise performance.' },
          ].map((feature, i) => (
            <div
              key={feature.title}
              className="card p-6 hover:shadow-lg hover:border-teal-200 transition-all duration-300 animate-fade-in-up"
              style={{ animationDelay: `${i * 0.1}s`, opacity: 0 }}
            >
              <div className="w-12 h-12 rounded-xl bg-teal-50 flex items-center justify-center mb-4">
                <feature.icon className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="font-heading font-bold text-lg mb-2">{feature.title}</h3>
              <p className="text-slate-600 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PUC + Degree Sections */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-teal-600 font-semibold text-sm uppercase tracking-wider">Who is it for?</span>
            <h2 className="text-3xl sm:text-4xl font-heading font-bold mt-2 mb-4">
              Two paths, one platform
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* PUC Card */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">
                  <GraduationCap className="w-7 h-7 text-teal-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">PUC Students</h3>
                  <p className="text-sm text-slate-500">CET / NEET / JEE preparation</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  'CET: Maths, Chemistry, Biology, Physics',
                  'NEET: Biology, Chemistry, Physics',
                  'JEE: Maths, Physics, Chemistry',
                  '25-question timed exams',
                  'Daily homework cycle system',
                  'Subject-wise learning materials',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth/register')}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                Start PUC Prep <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            {/* Degree Card */}
            <div className="card p-8 hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-cyan-100 flex items-center justify-center">
                  <Briefcase className="w-7 h-7 text-cyan-600" />
                </div>
                <div>
                  <h3 className="font-heading font-bold text-xl">Degree Students</h3>
                  <p className="text-sm text-slate-500">Career & skill gap analysis</p>
                </div>
              </div>
              <ul className="space-y-3 mb-6">
                {[
                  '9 degree paths: CS, IT, Engineering, MBA, more',
                  'Degree-to-company role mapping',
                  'Resume upload & GBSI skill analysis',
                  '25-question gap assessment exam',
                  'Skill gap report with % score',
                  'Personalized improvement roadmap',
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-cyan-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
              <button
                onClick={() => navigate('/auth/register')}
                className="px-6 py-3 bg-cyan-600 text-white font-semibold rounded-xl hover:bg-cyan-700 transition-all duration-200 active:scale-95 shadow-lg shadow-cyan-600/20 w-full flex items-center justify-center gap-2"
              >
                Start Career Analysis <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats / Pricing Teaser */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: 'Free Tier', desc: 'Skill assessment + gap report at zero cost. Start your journey without any commitment.', highlight: 'Get started free' },
            { icon: Crown, title: 'Premium', desc: 'Personalized roadmaps, detailed tracking, and unlimited practice exams.', highlight: 'Go premium' },
            { icon: Users, title: 'Institutional', desc: 'Bulk support for colleges and placement cells with student management tools.', highlight: 'Contact us' },
          ].map((tier) => (
            <div key={tier.title} className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4 group-hover:bg-teal-50 transition-colors">
                <tier.icon className="w-8 h-8 text-slate-600 group-hover:text-teal-600 transition-colors" />
              </div>
              <h3 className="font-heading font-bold text-xl mb-2">{tier.title}</h3>
              <p className="text-slate-600 text-sm mb-3">{tier.desc}</p>
              <button
                onClick={() => navigate('/pricing')}
                className="text-teal-600 font-semibold text-sm hover:underline inline-flex items-center gap-1"
              >
                {tier.highlight} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Award className="w-12 h-12 text-teal-600 mx-auto mb-4" />
          <h2 className="text-3xl sm:text-4xl font-heading font-bold mb-4">
            Ready to take the next step?
          </h2>
          <p className="text-slate-600 mb-8 max-w-2xl mx-auto">
            Join KHBV.D today and get a free skill assessment. Whether you're preparing for
            competitive exams or bridging the gap to your dream career, we've got you covered.
          </p>
          <button
            onClick={() => navigate('/auth/register')}
            className="btn-primary text-base px-10 py-4 inline-flex items-center gap-2"
          >
            Create Your Free Account <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg gradient-mesh flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
              <span className="font-heading font-bold text-lg text-white">
                KHBV<span className="text-teal-400">.D</span>
              </span>
            </div>
            <p className="text-sm">Learn and Gain Knowledge — Empowering students across India.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}


