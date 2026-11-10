import { useState } from 'react';
import { User, MapPin, Calendar, GraduationCap, Award, LogOut, Edit2, Save, X, Crown, Briefcase } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';
import { degreeTypes, departments } from '@/lib/question-engine';

export function ProfilePage() {
  const { profile, session, signOut, refreshProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [district, setDistrict] = useState(profile?.district || '');
  const [state, setState] = useState(profile?.state || '');
  const [pincode, setPincode] = useState(profile?.pincode || '');
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const handleSave = async () => {
    setSaving(true);
    await supabase.from('profiles').update({
      full_name: fullName,
      district,
      state,
      pincode,
      updated_at: new Date().toISOString(),
    }).eq('id', profile.id);
    await refreshProfile();
    setEditing(false);
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const degreeName = degreeTypes.find((d) => d.id === profile.degree_type)?.name || profile.degree_type;

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Profile header */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl gradient-mesh flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div className="flex-1">
              <h1 className="text-xl font-heading font-bold">{profile.full_name}</h1>
              <p className="text-sm text-slate-500">{session?.user?.email}</p>
              {profile.is_premium && (
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  <Crown className="w-3 h-3" /> Premium Member
                </span>
              )}
            </div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn-ghost text-sm flex items-center gap-1">
                <Edit2 className="w-4 h-4" /> Edit
              </button>
            )}
          </div>

          {/* Info grid */}
          <div className="grid sm:grid-cols-2 gap-4">
            {editing ? (
              <>
                <div>
                  <label className="label-text">Full Name</label>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text">District</label>
                  <input value={district} onChange={(e) => setDistrict(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text">State</label>
                  <input value={state} onChange={(e) => setState(e.target.value)} className="input-field" />
                </div>
                <div>
                  <label className="label-text">Pincode</label>
                  <input value={pincode} onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} className="input-field" maxLength={6} />
                </div>
              </>
            ) : (
              <>
                <InfoItem icon={User} label="Username" value={profile.username || ''} />
                <InfoItem icon={Calendar} label="Age" value={`${profile.age} years`} />
                <InfoItem icon={User} label="Gender" value={profile.gender} />
                <InfoItem icon={MapPin} label="District" value={profile.district} />
                <InfoItem icon={MapPin} label="State" value={profile.state} />
                <InfoItem icon={MapPin} label="Pincode" value={profile.pincode} />
                <InfoItem icon={GraduationCap} label="User Type" value={profile.user_type === 'puc' ? 'PUC Student' : 'Degree Student'} />
                {profile.user_type === 'puc' ? (
                  <>
                    <InfoItem icon={Award} label="PUC Group" value={profile.puc_group?.toUpperCase() || ''} />
                    {profile.exam_stream && <InfoItem icon={Award} label="Exam Stream" value={profile.exam_stream.toUpperCase()} />}
                    <InfoItem icon={GraduationCap} label="PUC Year" value={profile.puc_year ? `${profile.puc_year === 1 ? '1st' : '2nd'} PUC` : ''} />
                  </>
                ) : (
                  <>
                    <InfoItem icon={Award} label="Degree" value={degreeName || ''} />
                    {profile.department && (
                      <InfoItem icon={GraduationCap} label="Department" value={departments.find((d) => d.id === profile.department)?.name || profile.department} />
                    )}
                    {profile.experience_level && (
                      <InfoItem icon={Briefcase} label="Experience" value={profile.experience_level === 'fresher' ? 'Fresher' : 'Experienced'} />
                    )}
                  </>
                )}
                <InfoItem icon={Calendar} label="Semester" value={`Semester ${profile.current_semester}`} />
              </>
            )}
          </div>

          {editing && (
            <div className="flex gap-3 mt-6">
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
                <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => { setEditing(false); setFullName(profile.full_name); setDistrict(profile.district); setState(profile.state); setPincode(profile.pincode); }} className="btn-secondary flex items-center gap-2">
                <X className="w-4 h-4" /> Cancel
              </button>
            </div>
          )}
        </div>

        {/* Subscription card */}
        <div className="card p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Crown className="w-5 h-5 text-amber-600" />
            <h2 className="font-heading font-bold">Subscription</h2>
          </div>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div>
              <p className="font-semibold text-slate-900 capitalize">{profile.subscription_tier} Plan</p>
              <p className="text-sm text-slate-500">
                {profile.is_premium ? 'You have access to all premium features' : 'Upgrade for personalized roadmaps and unlimited exams'}
              </p>
            </div>
            {!profile.is_premium && (
              <button onClick={() => navigate('/pricing')} className="px-4 py-2 bg-amber-600 text-white font-semibold rounded-xl hover:bg-amber-700 transition-colors text-sm">
                Upgrade
              </button>
            )}
          </div>
        </div>

        {/* Sign out */}
        <button onClick={handleSignOut} className="w-full px-4 py-3 bg-rose-50 text-rose-600 font-semibold rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
          <LogOut className="w-4 h-4" /> Sign Out
        </button>
      </div>
    </div>
  );
}

function InfoItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-slate-400 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-medium text-slate-900 capitalize">{value}</p>
      </div>
    </div>
  );
}
