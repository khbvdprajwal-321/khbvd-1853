import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import type { Profile } from './types';

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  profileError: string | null;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  profile: null,
  profileError: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const profileRequest = useRef(0);

  useEffect(() => {
    let active = true;
    let authEventReceived = false;
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      authEventReceived = true;
      profileRequest.current += 1;
      setSession(newSession);
      if (newSession) {
        void loadProfile(newSession.user.id);
      } else {
        setProfile(null);
        setProfileError(null);
        setLoading(false);
      }
    });

    supabase.auth.getSession().then(({ data, error }) => {
      if (!active || authEventReceived) return;
      if (error) {
        setProfileError('Your sign-in session could not be checked. Please retry or sign in again.');
        setLoading(false);
        return;
      }
      setSession(data.session);
      if (data.session) void loadProfile(data.session.user.id);
      else setLoading(false);
    }).catch(() => {
      if (!active || authEventReceived) return;
      setProfileError('Your sign-in session could not be checked. Please retry or sign in again.');
      setLoading(false);
    });

    return () => {
      active = false;
      profileRequest.current += 1;
      authListener.subscription.unsubscribe();
    };
  }, []);

  async function loadProfile(userId: string) {
    const requestId = ++profileRequest.current;
    setLoading(true);
    setProfileError(null);
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
      if (requestId !== profileRequest.current) return;
      if (error) {
        setProfile(null);
        setProfileError('Your account details could not be loaded. Check your connection and retry.');
      } else if (!data) {
        setProfile(null);
        setProfileError('Your student profile could not be found. Please retry or contact support.');
      } else {
        setProfile(data as Profile);
      }
    } catch {
      if (requestId !== profileRequest.current) return;
      setProfile(null);
      setProfileError('Your account details could not be loaded. Check your connection and retry.');
    } finally {
      if (requestId === profileRequest.current) setLoading(false);
    }
  }

  async function refreshProfile() {
    if (session) await loadProfile(session.user.id);
    else {
      setProfileError(null);
      setLoading(true);
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        setProfileError('Your sign-in session could not be checked. Please sign in again.');
        setLoading(false);
      } else if (data.session) {
        setSession(data.session);
        await loadProfile(data.session.user.id);
      } else {
        setLoading(false);
      }
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setProfile(null);
    setProfileError(null);
  }

  return (
    <AuthContext.Provider value={{ session, profile, profileError, loading, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
