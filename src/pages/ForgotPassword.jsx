import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { Sparkles, Mail, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.forgotPassword({ email });
      setSubmitted(true);
      if (res.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to submit password reset request.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 bg-slate-50 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/60 to-transparent pointer-events-none" />

      <div className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-lg p-8 md:p-10 relative z-10 animate-fade-in">
        <div className="text-center mb-8">
          <div className="w-12 h-12 mx-auto rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-200 mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Password Recovery</h1>
          <p className="text-sm text-slate-500 mt-1">
            Enter your administrative email to receive recovery instructions.
          </p>
        </div>

        {submitted ? (
          <div className="space-y-6 text-center animate-fade-in">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Instructions Registered</h2>
              <p className="text-sm text-slate-600 mt-1">
                If the email address <span className="text-slate-900 font-semibold">{email}</span> matches an active administrative account, a secure single-use reset token has been registered.
              </p>
            </div>

            {devToken && (
              <div className="p-4 rounded-xl bg-indigo-50 border border-indigo-200 text-left text-xs">
                <span className="text-indigo-800 font-bold uppercase tracking-wider block mb-1">
                  Non-Production Testing Link
                </span>
                <p className="text-indigo-700 mb-2">
                  Use the generated token to set your new password directly:
                </p>
                <Link
                  to={`/admin/reset-password?token=${devToken}`}
                  className="font-mono text-indigo-600 underline break-all font-semibold"
                >
                  /admin/reset-password?token={devToken}
                </Link>
              </div>
            )}

            <Link
              to="/admin/login"
              className="btn-secondary w-full py-2.5 text-xs font-semibold"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Return to Login</span>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-600" />
                <p>{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Registered Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@gyanvaniai.com"
                  className="input-field pl-10"
                  autoComplete="email"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full py-2.5 text-sm font-semibold"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Generating instructions...</span>
                </>
              ) : (
                <>
                  <span>Send Reset Link</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="text-center pt-2">
              <Link
                to="/admin/login"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to sign in</span>
              </Link>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
