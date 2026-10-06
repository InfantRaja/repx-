import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import API from '../services/api';

export const LoginPage = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Handle URL query parameters for demo OAuth fallback & tokens
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('google_token') || params.get('token');
    if (token) {
      localStorage.setItem('repx_token', token);
      const user = {
        name: params.get('name') || 'Google User',
        email: params.get('email') || 'google_user@repx.com',
        role: params.get('role') || 'user'
      };
      localStorage.setItem('repx_user', JSON.stringify(user));
      navigate('/dashboard', { replace: true });
      window.location.reload();
      return;
    }
    if (params.get('oauth_demo') && params.get('email')) {
      setEmail(params.get('email'));
      setPassword('demo123456');
    }
  }, [location, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await login(email, password);
      if (res?.success) {
        navigate('/dashboard');
      } else {
        setErrorMsg(res?.message || 'Invalid email or password.');
      }
    } catch (err) {
      setErrorMsg('Network error. Ensure the REPX backend is running on port 4000.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('demo@repx.com');
    setPassword('demo123456');
    setErrorMsg('');
  };

  const handleGoogleOAuth = async () => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await API.post('/auth/google');
      if (res.data?.success && res.data?.token) {
        localStorage.setItem('repx_token', res.data.token);
        localStorage.setItem('repx_user', JSON.stringify(res.data.user));
        navigate('/dashboard', { replace: true });
        window.location.reload();
        return;
      }
    } catch (err) {
      console.warn('Direct Google API login fallback to browser redirect', err);
    }
    window.location.href = '/api/auth/google';
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black font-display text-white tracking-tight">
          Welcome Back Athlete
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Sign in to access your workout metrics and personal records.
        </p>
      </div>

      {errorMsg && (
        <div className="mb-5 p-3 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* 1-Click Demo Login Helper */}
      <button
        type="button"
        onClick={handleFillDemo}
        className="w-full mb-5 py-2.5 px-4 rounded-xl bg-gradient-to-r from-repx-volt/15 to-repx-cyan/15 hover:from-repx-volt/25 hover:to-repx-cyan/25 border border-repx-volt/40 text-xs font-bold font-display text-slate-200 flex items-center justify-center gap-2 transition-all active:scale-95"
      >
        <Sparkles className="w-4 h-4 text-repx-volt" />
        Fill Demo Account Credentials (demo@repx.com)
      </button>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="athlete@repx.com"
              className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-repx-volt focus:ring-1 focus:ring-repx-volt transition-all"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-300">
              Password
            </label>
            <NavLink
              to="/forgot-password"
              className="text-xs font-medium text-slate-400 hover:text-repx-volt transition-colors"
            >
              Forgot password?
            </NavLink>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-repx-volt focus:ring-1 focus:ring-repx-volt transition-all"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3 rounded-xl bg-repx-volt text-black font-extrabold font-display text-sm hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95 disabled:opacity-50"
        >
          {loading ? 'Authenticating...' : 'Sign In'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-repx-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase font-extrabold text-slate-500">
            <span className="bg-repx-900 px-3">Or continue with</span>
          </div>
        </div>

        <button
          onClick={handleGoogleOAuth}
          type="button"
          disabled={loading}
          className="mt-4 w-full py-2.5 px-4 rounded-xl bg-repx-850 hover:bg-repx-800 border border-repx-border text-xs font-bold text-slate-200 flex items-center justify-center gap-2.5 transition-all"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24">
            <path
              fill="#EA4335"
              d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.4 9 5 12 5z"
            />
            <path
              fill="#4285F4"
              d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
            />
            <path
              fill="#FBBC05"
              d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3s.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12 0 12s.7 2.3 1.9 4.7l3.7-1.9z"
            />
            <path
              fill="#34A853"
              d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.2L1.9 16c1.8 3.7 5.6 7 10.1 7z"
            />
          </svg>
          Continue with Google
        </button>
      </div>

      <div className="mt-6 text-center text-xs text-slate-400">
        New to REPX?{' '}
        <NavLink to="/register" className="font-bold text-repx-volt hover:underline">
          Create an account
        </NavLink>
      </div>
    </div>
  );
};

export default LoginPage;