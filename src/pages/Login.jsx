import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/AuthLayout';
import {
  Eye,
  EyeOff,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
} from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/admin/dashboard';

  const handleKeyDown = (e) => {
    if (e.getModifierState && typeof e.getModifierState === 'function') {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

  const handleQuickFill = () => {
    setEmail('admin@gyanvaniai.com');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid administrative credentials. Please verify your email and password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Administrator Sign In"
      subtitle="Enter your verified administrative credentials to access the console."
      badgeText="Enterprise Identity Gateway"
      sideTagline="Autonomous Voice Telephony & Omnichannel CRM"
      sideDescription="Orchestrating mission-critical AI voice bots, enterprise WhatsApp pipelines, multi-tenant lead routing, and zero-trust RBAC governance."
    >
      {/* Error Alert */}
      {error && (
        <div className="mb-3.5 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5 animate-fade-in shadow-xs">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
          <div className="flex-1">
            <p className="font-bold text-rose-900">Authentication Failed</p>
            <p className="text-rose-700 text-[11px] leading-tight mt-0.5">{error}</p>
          </div>
        </div>
      )}

      {/* Main Login Form */}
      <form onSubmit={handleSubmit} className="space-y-3.5" onKeyDown={handleKeyDown}>
        {/* Email Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Workstation Email
            </label>
            <span className="text-[9px] text-slate-400 font-medium tracking-wide">REQUIRED</span>
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

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[10px] font-bold text-slate-700 uppercase tracking-wider">
              Secure Password
            </label>
            <Link
              to="/admin/forgot-password"
              className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
          <div className="relative group">
            <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full pl-9 pr-10 py-2 bg-slate-50/60 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all shadow-xs"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors focus:outline-none"
              title={showPassword ? 'Hide password' : 'Show password'}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Caps Lock Indicator */}
          {capsLockActive && (
            <div className="mt-1 flex items-center gap-1.5 text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              <span className="font-semibold">Caps Lock is active</span>
            </div>
          )}
        </div>

        {/* Remember Workstation Checkbox */}
        <div className="flex items-center justify-between pt-0.5">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="w-3.5 h-3.5 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500 cursor-pointer"
            />
            <span className="text-[11px] text-slate-600 font-medium">
              Trust device (30 days)
            </span>
          </label>

          {/* Quick Demo Pre-fill Pill */}
          <button
            type="button"
            onClick={handleQuickFill}
            className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-2 py-0.5 rounded-lg border border-slate-200 transition-colors cursor-pointer"
            title="Auto-fill default admin username"
          >
            <Sparkles className="w-3 h-3 text-indigo-500" />
            <span>Autofill Admin</span>
          </button>
        </div>

        {/* Primary Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full mt-1.5 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
        >
          {submitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-white" />
              <span>Verifying Session...</span>
            </>
          ) : (
            <>
              <span>Sign In to Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </>
          )}
        </button>
      </form>

      {/* Enterprise SSO Divider */}
      <div className="mt-4 pt-3 border-t border-slate-100 text-center">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] text-slate-500">
          <Shield className="w-3 h-3 text-indigo-500" />
          <span>SAML 2.0 / Okta Enterprise SSO Ready</span>
        </div>
      </div>
    </AuthLayout>
  );
}
