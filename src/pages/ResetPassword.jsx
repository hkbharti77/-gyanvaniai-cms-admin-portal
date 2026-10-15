import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import AuthLayout from '../components/AuthLayout';
import {
  Lock,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Loader2,
  ArrowLeft,
  Eye,
  EyeOff,
  Check,
  X,
} from 'lucide-react';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const tokenFromQuery = searchParams.get('token') || '';

  const [token, setToken] = useState(tokenFromQuery);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const navigate = useNavigate();

  useEffect(() => {
    if (tokenFromQuery) {
      setToken(tokenFromQuery);
    }
  }, [tokenFromQuery]);

  useEffect(() => {
    let timer;
    if (success) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate('/admin/login');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [success, navigate]);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasNumberOrSymbol = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;

  let strengthScore = 0;
  if (hasMinLength) strengthScore += 1;
  if (hasUppercase) strengthScore += 1;
  if (hasNumberOrSymbol) strengthScore += 1;
  if (newPassword.length >= 12) strengthScore += 1;

  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong'];
  const strengthColors = ['bg-rose-500', 'bg-amber-500', 'bg-sky-500', 'bg-emerald-500'];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!token.trim()) {
      setError('Please provide a valid security token.');
      return;
    }

    if (!hasMinLength) {
      setError('Password must contain at least 8 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Confirmation password does not match.');
      return;
    }

    setSubmitting(true);

    try {
      await api.resetPassword({ token: token.trim(), newPassword });
      setSuccess(true);
    } catch (err) {
      setError(
        err.message || 'Failed to reset password. The link or token may have expired or already been used.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Passphrase"
      subtitle="Input your single-use security token and configure strong credentials."
      badgeText="Security Token Handshake"
      sideTagline="NIST 800-63B Credential Enforcement"
      sideDescription="Institutional security requirements enforce continuous entropy checks. Upon password modification, all prior active sessions and refresh tokens are immediately revoked."
    >
      {success ? (
        <div className="space-y-4 text-center animate-fade-in">
          <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shadow-xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight">
              Password Successfully Updated
            </h3>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed">
              Your administrative credentials have been updated. All existing sessions were revoked across active terminals.
            </p>
          </div>

          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
            Redirecting to login in{' '}
            <span className="font-mono font-bold text-indigo-600">{countdown}s</span>...
          </div>

          <Link
            to="/admin/login"
            className="w-full py-2.5 px-3 rounded-xl font-bold text-xs text-white bg-indigo-600 hover:bg-indigo-700 flex items-center justify-center gap-1.5 transition-colors shadow-xs"
          >
            <span>Sign In Immediately</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2 animate-fade-in shadow-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-600" />
              <div className="flex-1">
                <p className="font-bold text-rose-900">Update Error</p>
                <p className="text-rose-700 text-[11px] leading-tight mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Token Field */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Security Token
              </label>
              <span className="text-[9px] text-slate-400 font-mono">SINGLE-USE</span>
            </div>
            <div className="relative group">
              <KeyRound className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type="text"
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="Paste security token"
                className="w-full pl-9 pr-3 py-1.5 sm:py-2 bg-slate-50/60 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs font-mono text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all shadow-xs"
              />
            </div>
          </div>

          {/* New Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                New Passphrase
              </label>
              <span className="text-[9px] text-slate-400">MIN 8 CHARACTERS</span>
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-1.5 sm:py-2 bg-slate-50/60 focus:bg-white border border-slate-300 focus:border-indigo-600 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 focus:ring-indigo-500/10 transition-all shadow-xs"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Password Strength Indicator */}
            {newPassword.length > 0 && (
              <div className="mt-1.5 space-y-1 animate-fade-in">
                <div className="flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Strength:</span>
                  <span className="font-bold text-slate-700">
                    {strengthLabels[Math.max(0, strengthScore - 1)]}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-1 h-1">
                  {[0, 1, 2, 3].map((index) => (
                    <div
                      key={index}
                      className={`h-full rounded-full transition-all duration-300 ${
                        index < strengthScore
                          ? strengthColors[strengthScore - 1]
                          : 'bg-slate-200'
                      }`}
                    />
                  ))}
                </div>

                <div className="flex flex-wrap gap-2 text-[9px] text-slate-500 pt-0.5">
                  <span className={`inline-flex items-center gap-0.5 ${hasMinLength ? 'text-emerald-600 font-semibold' : ''}`}>
                    {hasMinLength ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} 8+ Chars
                  </span>
                  <span className={`inline-flex items-center gap-0.5 ${hasUppercase ? 'text-emerald-600 font-semibold' : ''}`}>
                    {hasUppercase ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} Uppercase
                  </span>
                  <span className={`inline-flex items-center gap-0.5 ${hasNumberOrSymbol ? 'text-emerald-600 font-semibold' : ''}`}>
                    {hasNumberOrSymbol ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />} Num/Sym
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[10px] font-bold text-slate-700 uppercase tracking-wider">
                Confirm Passphrase
              </label>
              {confirmPassword.length > 0 && (
                <span className={`text-[9px] font-bold ${passwordsMatch ? 'text-emerald-600' : 'text-rose-500'}`}>
                  {passwordsMatch ? 'MATCH' : 'MISMATCH'}
                </span>
              )}
            </div>
            <div className="relative group">
              <Lock className="w-4 h-4 text-slate-400 group-focus-within:text-indigo-600 absolute left-3 top-1/2 -translate-y-1/2 transition-colors pointer-events-none" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••••••"
                className={`w-full pl-9 pr-10 py-1.5 sm:py-2 bg-slate-50/60 focus:bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-3 transition-all shadow-xs ${
                  confirmPassword.length > 0 && !passwordsMatch
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-rose-500/10'
                    : 'border-slate-300 focus:border-indigo-600 focus:ring-indigo-500/10'
                }`}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
              >
                {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-1.5 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-gradient-to-r from-indigo-600 via-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed shadow-md shadow-indigo-600/20 hover:shadow-indigo-600/30 transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Re-encrypting...</span>
              </>
            ) : (
              <>
                <span>Save New Password</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </>
            )}
          </button>

          <div className="text-center pt-0.5">
            <Link
              to="/admin/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel</span>
            </Link>
          </div>
        </form>
      )}
    </AuthLayout>
  );
}
