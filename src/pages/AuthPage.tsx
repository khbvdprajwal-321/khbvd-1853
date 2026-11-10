import { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, Lock, User, MapPin, Calendar, Eye, EyeOff, Fingerprint, AlertCircle, Check, RefreshCw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { navigate } from '@/App';
import { AppHeader } from '@/components/AppHeader';

interface AuthPageProps {
  mode: 'login' | 'register';
}

function generateCaptcha(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars[Math.floor(Math.random() * chars.length)];
  }
  return result;
}

const indianStates = [
  'Andhra Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa', 'Gujarat',
  'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir',
];

export function AuthPage({ mode }: AuthPageProps) {
  const [isLogin, setIsLogin] = useState(mode === 'login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [captcha, setCaptcha] = useState(generateCaptcha());
  const [captchaInput, setCaptchaInput] = useState('');
  const [biometricStatus, setBiometricStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    setIsLogin(mode === 'login');
  }, [mode]);

  // Supabase auth requires an email field internally — we use username to construct a fake email
  const emailFromUsername = (uname: string) => `${uname.toLowerCase().replace(/[^a-z0-9]/g, '')}@khbvd.app`;

  const handleRegister = useCallback(async () => {
    setError('');

    if (!username || !password || !fullName || !gender || !age || !district || !state || !pincode) {
      setError('Please fill in all fields.');
      return;
    }
    if (captchaInput.toUpperCase() !== captcha) {
      setError('Captcha does not match. Please try again.');
      setCaptcha(generateCaptcha());
      setCaptchaInput('');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (username.length < 3) {
      setError('Username must be at least 3 characters long.');
      return;
    }
    if (pincode.length !== 6) {
      setError('Pincode must be 6 digits.');
      return;
    }

    setLoading(true);
    const fakeEmail = emailFromUsername(username);
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
    });

    if (signUpError) {
      if (signUpError.message.includes('already registered') || signUpError.message.includes('already been registered')) {
        setError('This username is already taken. Please choose another.');
      } else {
        setError(signUpError.message);
      }
      setLoading(false);
      return;
    }

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        full_name: fullName,
        gender,
        age: parseInt(age),
        district,
        state,
        pincode,
        username,
      });

      if (profileError) {
        setError('Account created but profile setup failed. Please try signing in.');
      } else {
        navigate('/');
      }
    }
    setLoading(false);
  }, [username, password, fullName, gender, age, district, state, pincode, captcha, captchaInput]);

  const handleLogin = useCallback(async () => {
    setError('');
    if (!username || !password) {
      setError('Please enter your username and password.');
      return;
    }
    setLoading(true);
    const fakeEmail = emailFromUsername(username);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email: fakeEmail, password });
    if (signInError) {
      setError('Invalid username or password.');
      setLoading(false);
      return;
    }
    navigate('/');
  }, [username, password]);

  const handleBiometric = async () => {
    setBiometricStatus('Scanning...');
    setError('');
    setTimeout(() => {
      setBiometricStatus('Biometric authentication is a demonstration feature. Please use username/password to sign in.');
      setTimeout(() => setBiometricStatus(''), 4000);
    }, 1500);
  };

  const switchMode = () => {
    setError('');
    setUsername('');
    setPassword('');
    setCaptchaInput('');
    navigate(isLogin ? '/auth/register' : '/auth/login');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <AppHeader />

      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-heading font-bold text-slate-900">
            {isLogin ? 'Welcome Back' : 'Create Your Account'}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isLogin ? 'Sign in to continue your learning journey' : 'Join KHBV.D and start learning today'}
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 animate-fade-in">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">{error}</p>
          </div>
        )}

        {biometricStatus && (
          <div className="mb-4 p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-start gap-2 animate-fade-in">
            <Fingerprint className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-teal-700">{biometricStatus}</p>
          </div>
        )}

        <div className="card p-6 space-y-4">
          {isLogin ? (
            <>
              <div>
                <label className="label-text">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Enter your username"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                </div>
              </div>
              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="••••••••"
                    onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                onClick={handleLogin}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div className="relative py-2">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-white px-3 text-xs text-slate-400">or</span>
                </div>
              </div>

              <button
                onClick={handleBiometric}
                className="w-full px-6 py-3 bg-slate-100 text-slate-700 font-semibold rounded-xl hover:bg-slate-200 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <Fingerprint className="w-5 h-5" />
                Sign in with Biometric
              </button>
            </>
          ) : (
            <>
              <div>
                <label className="label-text">Username</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value.replace(/\s/g, ''))}
                    className="input-field pl-10"
                    placeholder="Choose a username"
                    minLength={3}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-1">You'll use this to sign in. No email needed.</p>
              </div>

              <div>
                <label className="label-text">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">Gender</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="label-text">Age</label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="number"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                      className="input-field pl-9"
                      placeholder="18"
                      min="14"
                      max="60"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="label-text">District</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type="text"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="input-field pl-10"
                    placeholder="e.g. Bangalore Rural"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-text">State</label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Select State</option>
                    {indianStates.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-text">Pincode</label>
                  <input
                    type="text"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="input-field"
                    placeholder="560001"
                    maxLength={6}
                  />
                </div>
              </div>

              <div>
                <label className="label-text">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="input-field pl-10 pr-10"
                    placeholder="Min 6 characters"
                  />
                  <button
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Captcha */}
              <div>
                <label className="label-text">Captcha Verification</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-3 bg-slate-900 rounded-xl select-none">
                    <span className="text-xl font-bold text-white tracking-wider italic" style={{ fontFamily: 'monospace' }}>
                      {captcha}
                    </span>
                    <button
                      onClick={() => setCaptcha(generateCaptcha())}
                      className="text-slate-400 hover:text-white"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={captchaInput}
                    onChange={(e) => setCaptchaInput(e.target.value.toUpperCase())}
                    className="input-field flex-1"
                    placeholder="Enter captcha"
                    maxLength={6}
                  />
                </div>
              </div>

              <button
                onClick={handleRegister}
                disabled={loading}
                className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create Account'}
                {!loading && <Check className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>

        <p className="text-center text-sm text-slate-500 mt-6">
          {isLogin ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={switchMode}
            className="text-teal-600 font-semibold hover:underline"
          >
            {isLogin ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}
