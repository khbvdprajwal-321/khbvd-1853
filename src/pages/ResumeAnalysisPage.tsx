import { useState } from 'react';
import { ArrowLeft, Upload, FileText, Brain, CheckCircle, XCircle, TrendingUp, Target, Award, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { analyzeResume, type GapAnalysisResult } from '@/lib/gbsi-engine';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { degreeTypes } from '@/lib/question-engine';

export function ResumeAnalysisPage() {
  const { profile } = useAuth();
  const [resumeText, setResumeText] = useState('');
  const [analysis, setAnalysis] = useState<GapAnalysisResult | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [savedAnalysisId, setSavedAnalysisId] = useState<string | null>(null);

  if (!profile) return null;
  const degreeName = degreeTypes.find((d) => d.id === profile.degree_type)?.name || 'Your Degree';

  const handleAnalyze = async () => {
    if (!resumeText.trim()) return;
    setAnalyzing(true);
    
    // Simulate GBSI engine processing
    await new Promise((r) => setTimeout(r, 1500));
    
    const result = analyzeResume(resumeText, profile.degree_type || 'CS');
    setAnalysis(result);

    // Save to database
    const { data } = await supabase.from('resume_analyses').insert({
      user_id: profile.id,
      degree_type: profile.degree_type,
      target_role: result.targetRole,
      resume_text: resumeText,
      identified_skills: result.identifiedSkills,
      missing_skills: result.missingSkills,
      skill_gap_score: result.skillGapScore,
    }).select('id').single();

    if (data) setSavedAnalysisId(data.id);
    setAnalyzing(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setResumeText(ev.target?.result as string);
    };
    reader.readAsText(file);
  };

  const startGapExam = () => {
    navigate(`/exam/Gap%20Assessment/gap_assessment`);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>

        <div className="card p-6 mb-8 gradient-hero text-white">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center border border-white/20">
              <Brain className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold">GBSI Resume Analysis</h1>
              <p className="text-teal-100/80 text-sm mt-0.5">Upload your resume for AI-powered skill gap assessment</p>
            </div>
          </div>
        </div>

        {!analysis && (
          <div className="card p-6">
            <h2 className="font-heading font-bold text-lg mb-4">Upload Your Resume</h2>
            
            <div className="mb-4">
              <label className="label-text">Upload Resume File (.txt)</label>
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-slate-300 rounded-xl cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all">
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-slate-400" />
                  <span className="text-sm text-slate-500">Click to upload or drag and drop</span>
                  <span className="text-xs text-slate-400">TXT files only</span>
                </div>
                <input type="file" accept=".txt,text/plain" className="hidden" onChange={handleFileUpload} />
              </label>
            </div>

            <div className="mb-4">
              <label className="label-text">Or paste resume text directly</label>
              <textarea
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)}
                rows={8}
                className="input-field resize-none font-mono text-sm"
                placeholder="Paste your resume content here... Include skills, experience, education, and projects."
              />
            </div>

            <div className="p-3 bg-slate-50 rounded-xl mb-4">
              <p className="text-xs text-slate-500">
                <span className="font-semibold">Tip:</span> Include technical skills, programming languages, tools, and project descriptions for best results.
              </p>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={!resumeText.trim() || analyzing}
              className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {analyzing ? (
                <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing with GBSI Engine...</>
              ) : (
                <><Brain className="w-4 h-4" /> Analyze My Resume</>
              )}
            </button>
          </div>
        )}

        {analysis && (
          <div className="space-y-6 animate-fade-in-up">
            {/* Score Card */}
            <div className="card p-6 text-center">
              <div className={`w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-4 ${analysis.skillGapScore >= 70 ? 'bg-emerald-100' : analysis.skillGapScore >= 40 ? 'bg-amber-100' : 'bg-rose-100'}`}>
                <span className={`text-3xl font-heading font-bold ${analysis.skillGapScore >= 70 ? 'text-emerald-600' : analysis.skillGapScore >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>{analysis.skillGapScore}%</span>
              </div>
              <h2 className="text-xl font-heading font-bold mb-1">Skill Match Score</h2>
              <p className="text-slate-500 text-sm mb-4">
                Target role: <span className="font-semibold text-slate-700">{analysis.targetRole}</span>
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {analysis.matchedCompanies.map((c) => (
                  <span key={c} className="px-3 py-1 bg-slate-100 text-slate-700 text-xs font-medium rounded-lg">{c}</span>
                ))}
              </div>
            </div>

            {/* Identified Skills */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="font-heading font-bold">Skills You Have</h3>
                <span className="ml-auto text-sm text-slate-400">{analysis.identifiedSkills.length} found</span>
              </div>
              {analysis.identifiedSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.identifiedSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 text-sm font-medium rounded-lg border border-emerald-200">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-slate-400">No matching skills detected. Try adding more detail to your resume.</p>
              )}
            </div>

            {/* Missing Skills */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <XCircle className="w-5 h-5 text-rose-600" />
                <h3 className="font-heading font-bold">Skills to Develop</h3>
                <span className="ml-auto text-sm text-slate-400">{analysis.missingSkills.length} gaps</span>
              </div>
              {analysis.missingSkills.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {analysis.missingSkills.map((skill) => (
                    <span key={skill} className="px-3 py-1.5 bg-rose-50 text-rose-700 text-sm font-medium rounded-lg border border-rose-200">{skill}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-emerald-600 font-medium">No skill gaps detected — you're ready for this role!</p>
              )}
            </div>

            {/* Gap Exam CTA */}
            <div className="card p-6 bg-gradient-to-br from-teal-50 to-cyan-50 border-teal-200">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-teal-600" />
                </div>
                <div className="flex-1">
                  <h3 className="font-heading font-bold text-slate-900">Take a Gap Assessment Exam</h3>
                  <p className="text-sm text-slate-600 mt-0.5">25 questions to test your knowledge in areas matched to {analysis.targetRole}.</p>
                </div>
              </div>
              <button onClick={startGapExam} className="btn-primary w-full mt-4 flex items-center justify-center gap-2">
                Start Gap Exam <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <button onClick={() => { setAnalysis(null); setResumeText(''); setSavedAnalysisId(null); }} className="btn-ghost w-full text-sm">
              Analyze Another Resume
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
