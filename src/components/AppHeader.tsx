import { useEffect, useState } from 'react';
import { GraduationCap, Menu, X, LogOut, User, Crown, Home, MessageCircle, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { navigate } from '@/App';
import { supabase } from '@/lib/supabase';

export function AppHeader() {
  const { session, profile, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    let active = true;
    if (!session) {
      setIsAdmin(false);
      return () => { active = false; };
    }
    supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).maybeSingle().then(({ data }) => {
      if (active) setIsAdmin(!!data);
    });
    return () => { active = false; };
  }, [session]);

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth/login');
  };

  return (
    <header className="sticky top-0 z-50 bg-white/90 glass border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={() => navigate(profile?.user_type ? '/dashboard' : '/')}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-slate-900">
              KHBV<span className="text-teal-600">.D</span>
            </span>
          </button>

          {session ? (
            <div className="flex items-center gap-3">
              <nav className="hidden md:flex items-center gap-1">
                <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm flex items-center gap-1.5"><Home className="w-4 h-4" /> Home</button>
                <button onClick={() => navigate('/dashboard')} className="btn-ghost text-sm">Dashboard</button>
                {profile?.user_type === 'degree' && (
                  <button onClick={() => navigate('/degree')} className="btn-ghost text-sm">Career Map</button>
                )}
                <button onClick={() => navigate('/assistant')} className="btn-ghost text-sm flex items-center gap-1.5"><MessageCircle className="w-4 h-4" /> Assistant</button>
                {isAdmin && <button onClick={() => navigate('/admin')} className="btn-ghost text-sm">Admin</button>}
                <button onClick={() => navigate('/pricing')} className="btn-ghost text-sm">Plans</button>
              </nav>

              {profile?.is_premium && (
                <span className="hidden sm:flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 text-xs font-semibold rounded-full border border-amber-200">
                  <Crown className="w-3.5 h-3.5" /> Premium
                </span>
              )}

              <button
                onClick={() => navigate('/profile')}
                className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center hover:bg-teal-200 transition-colors"
              >
                <User className="w-4 h-4 text-teal-700" />
              </button>

              <button
                onClick={handleSignOut}
                className="btn-ghost text-sm hidden sm:flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>

              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="md:hidden p-2 rounded-lg hover:bg-slate-100"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/')} className="btn-ghost text-sm flex items-center gap-1.5">
                <Home className="w-4 h-4" /> Home
              </button>
              <button onClick={() => navigate('/auth/login')} className="btn-ghost text-sm">
                Sign In
              </button>
              <button onClick={() => navigate('/auth/register')} className="btn-primary text-sm">
                Get Started
              </button>
            </div>
          )}
        </div>

        {menuOpen && session && (
          <div className="md:hidden py-3 border-t border-slate-200 space-y-1">
            <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Home</button>
            <button onClick={() => { navigate('/dashboard'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Dashboard</button>
            {profile?.user_type === 'degree' && (
              <button onClick={() => { navigate('/degree'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Career Map</button>
            )}
            <button onClick={() => { navigate('/assistant'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">KHBV.D Assistant</button>
            {isAdmin && <button onClick={() => { navigate('/admin'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Admin</button>}
            <button onClick={() => { navigate('/pricing'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Plans</button>
            <button onClick={() => { navigate('/profile'); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-slate-100 text-sm font-medium">Profile</button>
            <button onClick={() => { handleSignOut(); setMenuOpen(false); }} className="block w-full text-left px-3 py-2 rounded-lg hover:bg-rose-50 text-rose-600 text-sm font-medium">Sign Out</button>
          </div>
        )}
      </div>
    </header>
  );
}
