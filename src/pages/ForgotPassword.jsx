import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import {
  Mail,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Copy,
  Check,
  ShieldAlert,
  KeyRound,
} from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [devToken, setDevToken] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const res = await api.forgotPassword({ email });
      setSubmitted(true);
      if (res?.devResetToken) {
        setDevToken(res.devResetToken);
      }
    } catch (err) {
      setError(err.message || 'Failed to dispatch password reset request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCopyLink = () => {
    if (!devToken) return;
    const url = `${window.location.origin}/admin/reset-password?token=${devToken}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <AuthLayout
      title="Recover Access"
      subtitle="Enter your verified administrative email to receive a recovery token."
      badgeText="Identity Recovery Protocol"
      sideTagline="Zero-Trust Identity & Recovery Governance"
      sideDescription="All account recovery requests trigger immutable audit log entries, anomaly detection telemetry, and single-use cryptographic token invalidation."
    >
      {submitted ? (
        <div className="space-y-4 text-center animate-fade-in">
          {/* Success Icon */}
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Recovery Dispatch Registered
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              If an active workstation matches <span className="font-semibold text-slate-900 bg-slate-100 px-1 py-0.5 rounded">{email}</span>, a single-use token was dispatched.
            </p>
          </div>

          {/* Dev Token Box (Local / Non-Production helper) */}
          {devToken && (
            <div className="p-3 rounded-xl bg-indigo-50/80 border border-indigo-200 text-left text-xs animate-fade-in shadow-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-bold text-indigo-900 uppercase tracking-wider flex items-center gap-1">
                  <KeyRound className="w-3 h-3 text-indigo-600" />
                  Development Security Token
                </span>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-700 hover:text-indigo-900 bg-white px-1.5 py-0.5 rounded border border-indigo-200 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-600" />
                      <span>Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Link</span>
                    </>
                  )}
                </button>
              </div>

              <Link
                to={`/admin/reset-password?token=${devToken}`}
                className="w-full py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <span>Proceed to Set New Password</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          )}

          {/* Security Advisory */}
          <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-500 text-[10px] flex items-center gap-2 text-left">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span>Single-use security tokens automatically invalidate after 15 minutes.</span>
          </div>

          {/* Return Button */}
          <Link
            to="/admin/login"
            className="w-full py-2 px-3 rounded-xl border border-slate-300 hover:border-slate-400 bg-white hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Login</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold text-rose-900">Request Error</p>
                <p className="text-rose-700 text-[11px] leading-tight mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Workstation Email
              </label>
              <span className="text-[9px] text-slate-400 font-medium">ADMIN ACCOUNT</span>
            </div>
            <div className="relative group">
              <Mail className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gyanvaniai.com"
                className="w-full pl-9 pr-3 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all shadow-xs"
                autoComplete="email"
              />
            </div>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[10px] text-slate-500 flex items-start gap-2">
            <ShieldAlert className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
            <span>
              A cryptographic reset token will be dispatched. Tokens invalidate automatically after 15 minutes.
            </span>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1.5 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Generating Token...</span>
              </>
            ) : (
              <>
                <span>Send Reset Token</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-1">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Sign In</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
