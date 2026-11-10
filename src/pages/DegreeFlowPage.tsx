import { useState } from 'react';
import { ArrowLeft, Briefcase, Building2, TrendingUp, Award, ArrowRight, CheckCircle, Code2, Cpu, HardHat, Wrench, Landmark, IndianRupee, Clock, ChevronDown, BookOpen, Camera, FileQuestion } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import {
  degreeTypes, getCompaniesForDegree, govJobs, codingConcepts,
  type Company, type CompanyPost,
} from '@/lib/question-engine';

export function DegreeFlowPage() {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'IT' | 'Non-IT'>('IT');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [selectedPost, setSelectedPost] = useState<CompanyPost | null>(null);
  const [showAll, setShowAll] = useState(false);
  const [showCoding, setShowCoding] = useState(false);
  const [selectedGovJob, setSelectedGovJob] = useState<typeof govJobs[0] | null>(null);

  if (!profile) return null;

  const degreeName = degreeTypes.find((d) => d.id === profile.degree_type)?.name || 'Your Degree';
  const isDiploma = profile.degree_type === 'Diploma';
  const isMBA = profile.degree_type === 'MBA';
  const isFresher = profile.experience_level !== 'experienced';
  const allCompanies = getCompaniesForDegree(profile.degree_type || 'BE');
  const itCompanies = allCompanies.filter((c) => c.category === 'IT');
  const nonItCompanies = allCompanies.filter((c) => c.category === 'Non-IT');
  const activeCompanies = activeTab === 'IT' ? itCompanies : nonItCompanies;
  const visibleCompanies = showAll ? activeCompanies : activeCompanies.slice(0, 20);

  // ─── Coding Concepts View ──────────────────────────────
  if (showCoding) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setShowCoding(false)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to roles
          </button>
          <div className="card p-6 mb-8 gradient-hero text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Code2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold">Coding & Concepts</h1>
                <p className="text-teal-100/80 text-sm mt-0.5">Master the fundamentals with concept explanations</p>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-5">
            {codingConcepts.map((concept) => (
              <div key={concept.id} className="card p-5">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center">
                    <Cpu className="w-5 h-5 text-teal-600" />
                  </div>
                  <h3 className="font-heading font-bold text-base">{concept.title}</h3>
                </div>
                <p className="text-sm text-slate-600 mb-3 leading-relaxed">{concept.summary}</p>
                <div className="mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Key Points</p>
                  <ul className="space-y-1.5">
                    {concept.keyPoints.map((kp, i) => (
                      <li key={i} className="text-sm text-slate-600 flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                        <span>{kp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Sample Q</p>
                  <p className="text-sm text-slate-700 mb-2">{concept.sampleQ}</p>
                  <p className="text-xs font-semibold text-teal-600 uppercase tracking-wider mb-1">Answer</p>
                  <p className="text-sm text-slate-600">{concept.sampleA}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="card p-5 mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-5 h-5 text-teal-600" />
              <p className="text-sm text-slate-700 flex-1">Ready to test your coding knowledge? Start a practice exam.</p>
              <button onClick={() => navigate('/practice/degree/mock')} className="btn-primary text-sm">Start Exam</button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ─── Post Detail View ──────────────────────────────
  if (selectedPost && selectedCompany) {
    const postSkills = selectedPost.requiredSkills;
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setSelectedPost(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to {selectedCompany.name}
          </button>

          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-heading font-bold mb-1">{selectedPost.postTitle}</h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <Building2 className="w-4 h-4" /> {selectedCompany.name}
                </p>
              </div>
              <span className={`px-3 py-1 text-sm font-medium rounded-lg ${selectedPost.category === 'IT' ? 'bg-teal-50 text-teal-700 border border-teal-200' : 'bg-cyan-50 text-cyan-700 border border-cyan-200'}`}>
                {selectedPost.category}
              </span>
            </div>

            {/* Package info */}
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className={`p-4 rounded-xl border ${isFresher ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <IndianRupee className="w-4 h-4 text-teal-600" />
                  <p className="text-xs font-semibold text-slate-500 uppercase">Fresher Package</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{selectedPost.fresherPackage}</p>
              </div>
              <div className={`p-4 rounded-xl border ${!isFresher ? 'bg-teal-50 border-teal-300 ring-1 ring-teal-300' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="w-4 h-4 text-teal-600" />
                  <p className="text-xs font-semibold text-slate-500 uppercase">Experienced</p>
                </div>
                <p className="text-lg font-bold text-slate-900">{selectedPost.experiencedPackage}</p>
              </div>
            </div>

            {/* Required skills */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {postSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-200">{skill}</span>
                ))}
              </div>
            </div>

            {/* Requirements */}
            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Eligibility & Requirements</p>
              <ul className="space-y-1.5">
                {selectedPost.requirements.map((req, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {selectedPost.lastUpdated}
            </div>

            {/* Action buttons: Learn / Assignment / Exam */}
            <div className="grid sm:grid-cols-3 gap-3">
              <button
                onClick={() => navigate('/practice/degree/daily')}
                className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Learn</h3>
                <p className="text-xs text-slate-500">Concept explanations with Show Answer</p>
              </button>
              <button
                onClick={() => navigate('/practice/degree/assignment')}
                className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <Camera className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Assignment</h3>
                <p className="text-xs text-slate-500">Upload photo, get corrections + 3 solutions</p>
              </button>
              <button
                onClick={() => navigate('/practice/degree/mock')}
                className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <FileQuestion className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Exam</h3>
                <p className="text-xs text-slate-500">25 questions, 25 sec each, medals</p>
              </button>
            </div>

            <button onClick={() => navigate('/resume')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Check My Skills Against This Post <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Company Detail View ──────────────────────────────
  if (selectedCompany) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setSelectedCompany(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to companies
          </button>

          <div className="card p-6 mb-6 gradient-hero text-white">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
                <Building2 className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-2xl font-heading font-bold">{selectedCompany.name}</h1>
                <p className="text-teal-100/80 text-sm mt-0.5">{selectedCompany.posts.length} open position{selectedCompany.posts.length > 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            {selectedCompany.posts.map((post) => (
              <button
                key={post.postTitle}
                onClick={() => setSelectedPost(post)}
                className="card w-full p-5 text-left transition-all duration-200 hover:shadow-lg hover:border-teal-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-bold text-lg">{post.postTitle}</h3>
                    <p className="text-sm text-slate-500">{post.role}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-slate-300" />
                </div>
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex items-center gap-1.5">
                    <IndianRupee className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-semibold text-teal-700">{isFresher ? post.fresherPackage : post.experiencedPackage}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Clock className="w-3.5 h-3.5" />
                    {post.lastUpdated}
                  </div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {post.requiredSkills.slice(0, 4).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">{s}</span>
                  ))}
                  {post.requiredSkills.length > 4 && <span className="px-2 py-0.5 text-slate-400 text-xs">+{post.requiredSkills.length - 4} more</span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ─── Diploma Government Job Detail ─────────────────────────
  if (isDiploma && selectedGovJob) {
    return (
      <div className="min-h-screen bg-slate-50">
        <AppHeader />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
          <button onClick={() => setSelectedGovJob(null)} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to government jobs
          </button>

          <div className="card p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-2xl font-heading font-bold mb-1">{selectedGovJob.title}</h1>
                <p className="text-slate-500 flex items-center gap-2">
                  <Landmark className="w-4 h-4" /> {selectedGovJob.department}
                </p>
              </div>
              <span className="px-3 py-1 bg-amber-50 text-amber-700 text-sm font-medium rounded-lg border border-amber-200">Govt Job</span>
            </div>

            <div className="p-4 bg-emerald-50 rounded-xl mb-5">
              <div className="flex items-center gap-2">
                <IndianRupee className="w-5 h-5 text-emerald-600" />
                <span className="text-lg font-bold text-emerald-900">{selectedGovJob.packageRange}</span>
              </div>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Eligibility Criteria</p>
              <ul className="space-y-1.5">
                {selectedGovJob.eligibility.map((e, i) => (
                  <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-teal-500 mt-0.5 flex-shrink-0" />
                    <span>{e}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-5">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Skills Needed</p>
              <div className="flex flex-wrap gap-2">
                {selectedGovJob.requiredSkills.map((skill) => (
                  <span key={skill} className="px-3 py-1.5 bg-teal-50 text-teal-700 text-sm font-medium rounded-lg border border-teal-200">{skill}</span>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400 mb-5">
              <Clock className="w-3.5 h-3.5" />
              Last updated: {selectedGovJob.lastUpdated}
            </div>

            <div className="grid sm:grid-cols-3 gap-3">
              <button onClick={() => navigate('/practice/degree/daily')} className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <BookOpen className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Learn</h3>
              </button>
              <button onClick={() => navigate('/practice/degree/assignment')} className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <Camera className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Assignment</h3>
              </button>
              <button onClick={() => navigate('/practice/degree/mock')} className="card p-4 text-center hover:shadow-lg hover:border-teal-200 transition-all group">
                <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center mx-auto mb-2 group-hover:bg-teal-100 transition-colors">
                  <FileQuestion className="w-5 h-5 text-teal-600" />
                </div>
                <h3 className="font-heading font-bold text-sm mb-1">Exam</h3>
              </button>
            </div>

            <button onClick={() => navigate('/resume')} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
              Check My Eligibility <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Main Career Map View ──────────────────────────────
  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="card p-6 mb-8 gradient-hero text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              {isDiploma ? <Wrench className="w-7 h-7" /> : isMBA ? <Briefcase className="w-7 h-7" /> : <HardHat className="w-7 h-7" />}
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">Career Map — {degreeName}</h1>
              <p className="text-teal-100/80 text-sm mt-0.5">
                {isDiploma ? 'Government job posts with eligibility and skill requirements' : 'Companies hiring for your degree with posts and package info'}
              </p>
            </div>
          </div>
        </div>

        {/* Coding concepts entry for IT roles (BE only) */}
        {!isMBA && !isDiploma && (
          <div className="card p-5 mb-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
            <div className="flex items-center gap-3">
              <Code2 className="w-5 h-5 text-teal-600" />
              <p className="text-sm text-slate-700 flex-1">Explore coding concepts — arrays, trees, sorting, graphs, and more.</p>
              <button onClick={() => setShowCoding(true)} className="btn-primary text-sm flex items-center gap-1">
                Learn Coding <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ─── Diploma: Government Jobs ─── */}
        {isDiploma ? (
          <div>
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Landmark className="w-5 h-5 text-amber-600" /> Government Job Posts
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {govJobs.map((job) => (
                <button
                  key={job.title}
                  onClick={() => setSelectedGovJob(job)}
                  className="card p-5 text-left transition-all duration-200 hover:shadow-lg hover:border-amber-200"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-heading font-bold text-base">{job.title}</h3>
                    <ArrowRight className="w-4 h-4 text-slate-300" />
                  </div>
                  <p className="text-sm text-slate-500 mb-3 flex items-center gap-1.5">
                    <Landmark className="w-3.5 h-3.5" /> {job.department}
                  </p>
                  <div className="flex items-center gap-2 mb-3">
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                    <span className="text-sm font-semibold text-emerald-700">{job.packageRange}</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.requiredSkills.slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-md">{s}</span>
                    ))}
                    {job.requiredSkills.length > 3 && <span className="px-2 py-0.5 text-slate-400 text-xs">+{job.requiredSkills.length - 3}</span>}
                  </div>
                </button>
              ))}
            </div>

            <div className="card p-5 mt-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <p className="text-sm text-slate-700 flex-1">Upload your resume to check eligibility and skill gaps for government jobs.</p>
                <button onClick={() => navigate('/resume')} className="btn-primary text-sm">Upload Resume</button>
              </div>
            </div>
          </div>
        ) : (
          /* ─── BE / MBA: Company Post Flow ─── */
          <>
            {/* IT / Non-IT Tabs */}
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => { setActiveTab('IT'); setShowAll(false); }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'IT' ? 'bg-teal-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-4 h-4" /> IT Companies
                </span>
              </button>
              <button
                onClick={() => { setActiveTab('Non-IT'); setShowAll(false); }}
                className={`px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${activeTab === 'Non-IT' ? 'bg-cyan-600 text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300'}`}
              >
                <span className="flex items-center gap-2">
                  <HardHat className="w-4 h-4" /> Non-IT Companies
                </span>
              </button>
            </div>

            {/* Company list */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {visibleCompanies.map((company) => (
                <button
                  key={company.name}
                  onClick={() => setSelectedCompany(company)}
                  className="card p-5 text-left transition-all duration-200 hover:shadow-lg hover:border-teal-200"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${activeTab === 'IT' ? 'bg-teal-50' : 'bg-cyan-50'}`}>
                      <Building2 className={`w-5 h-5 ${activeTab === 'IT' ? 'text-teal-600' : 'text-cyan-600'}`} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-heading font-bold text-sm">{company.name}</h3>
                      <p className="text-xs text-slate-400">{company.posts.length} post{company.posts.length > 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {company.posts.slice(0, 2).map((p) => (
                      <span key={p.postTitle} className="px-2 py-0.5 bg-slate-100 text-slate-600 text-xs rounded">{p.postTitle}</span>
                    ))}
                  </div>
                </button>
              ))}
            </div>

            {/* Expand to Top 50 */}
            {activeCompanies.length > 20 && (
              <div className="text-center mb-6">
                <button
                  onClick={() => setShowAll(!showAll)}
                  className="btn-secondary inline-flex items-center gap-2 text-sm"
                >
                  {showAll ? 'Show Top 20' : `Expand to All ${activeCompanies.length} Companies`}
                  <ChevronDown className={`w-4 h-4 transition-transform ${showAll ? 'rotate-180' : ''}`} />
                </button>
              </div>
            )}

            <div className="card p-5 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-teal-600" />
                <p className="text-sm text-slate-700 flex-1">Upload your resume to get a personalized skill gap report for any post.</p>
                <button onClick={() => navigate('/resume')} className="btn-primary text-sm">Upload Resume</button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
