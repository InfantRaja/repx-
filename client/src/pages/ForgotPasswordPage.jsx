import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Mail, ArrowLeft, CheckCircle2, AlertCircle } from 'lucide-react';
import API from '../services/api';

export const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;

    try {
      setLoading(true);
      setErrorMsg('');
      const res = await API.post('/auth/forgot-password', { email });
      if (res.data?.success) {
        setSubmitted(true);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="text-center mb-6">
        <h2 className="text-2xl font-black font-display text-white tracking-tight">
          Reset Password
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Enter your registered email address and we'll dispatch reset instructions.
        </p>
      </div>

      {submitted ? (
        <div className="text-center py-4 space-y-4">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-white">Reset Link Dispatched</h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            We sent instructions to <span className="text-white font-medium">{email}</span>.
            For development testing, you can use the default demo password: <code className="text-repx-volt bg-repx-800 px-1 py-0.5 rounded">demo123456</code>.
          </p>
          <NavLink
            to="/login"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-repx-800 text-xs font-bold text-white hover:bg-repx-700 transition-all"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Sign In
          </NavLink>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-repx-crimson/15 border border-repx-crimson/40 text-repx-crimson text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

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
                className="w-full bg-repx-900 border border-repx-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-repx-volt transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-repx-volt text-black font-extrabold font-display text-sm hover:bg-repx-voltHover transition-all flex items-center justify-center gap-2 shadow-volt-glow active:scale-95 disabled:opacity-50"
          >
            {loading ? 'Submitting...' : 'Send Recovery Instructions'}
          </button>

          <div className="text-center pt-2">
            <NavLink
              to="/login"
              className="text-xs font-medium text-slate-400 hover:text-slate-200 inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Login
            </NavLink>
          </div>
        </form>
      )}
    </div>
  );
};

export default ForgotPasswordPage;
