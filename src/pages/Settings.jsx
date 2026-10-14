import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Settings as SettingsIcon,
  Shield,
  Server,
  Lock,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Database,
  Cpu,
  KeyRound,
  FileCheck2,
} from 'lucide-react';

export default function Settings() {
  const { hasPermission } = useAuth();
  const [settingsData, setSettingsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    async function loadSettings() {
      try {
        setLoading(true);
        const data = await api.getSettings();
        setSettingsData(data.settings);
      } catch (err) {
        showToast(err.message || 'Failed to load system settings', 'error');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  return (
    <div className="space-y-6 max-w-5xl">
      {toastMessage && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg flex items-center gap-3 text-sm font-medium animate-fade-in border ${
            toastMessage.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          )}
          <span>{toastMessage.message}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200/80 text-indigo-700 text-xs font-semibold mb-2">
          <SettingsIcon className="w-3.5 h-3.5 text-indigo-600" />
          <span>System Architecture & Governance</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System & Security Settings</h1>
        <p className="text-sm text-slate-500 mt-1">
          Review cryptographic enforcement, session policies, rate limiting, and runtime infrastructure telemetry.
        </p>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center card-enterprise">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mb-3" />
          <p className="text-sm text-slate-500 font-medium">Querying system diagnostics and security configs...</p>
        </div>
      ) : settingsData ? (
        <div className="space-y-6">
          {/* Section 1: Security Policies */}
          <div className="card-enterprise p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold">
                  <Shield className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Authentication & Session Hardening</h2>
                  <p className="text-xs text-slate-500">Active cryptographic & middleware protection rules</p>
                </div>
              </div>
              <span className="badge badge-emerald flex items-center gap-1">
                <FileCheck2 className="w-3 h-3" />
                <span>Compliant</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">Session Duration</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">Server TTL Expiry</span>
                  <span className="badge badge-indigo">
                    {settingsData.security.sessionDurationHours} Hours
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Automatic idle timeout & DB session expiry with rolling refresh tokens.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">Password Complexity</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">Minimum Length</span>
                  <span className="badge badge-slate">
                    {settingsData.security.passwordMinLength} Chars (Bcrypt 12)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Enforces uppercase, lowercase, numbers, and symbols on credentials.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">Rate Limiting</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">Brute-Force Guard</span>
                  <span className="badge badge-emerald">
                    {settingsData.security.rateLimitMaxLoginAttempts} attempts / {settingsData.security.rateLimitLoginWindowMinutes} min
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">IP-based sliding window rate limiter protects admin authentication endpoints.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">CSRF Protection</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">Double-Submit Cookie</span>
                  <span className="badge badge-emerald">Enforced</span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">State-changing POST, PUT, DELETE requests require valid cryptographic CSRF token.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">Cookie Security Policy</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">HttpOnly & SameSite</span>
                  <span className="badge badge-indigo">
                    Lax / HttpOnly: true
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Prevents client-side script access to session tokens, mitigating XSS extraction.</p>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <span className="text-slate-500 font-medium block mb-1">Multi-Factor Authentication</span>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-slate-800 font-semibold text-sm">MFA Extensibility Hook</span>
                  <span className="badge badge-slate">
                    {settingsData.security.mfaSupported ? 'Active' : 'Architecture Ready'}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Pluggable TOTP/Authenticator app verification architecture supported.</p>
              </div>
            </div>
          </div>

          {/* Section 2: Runtime Telemetry */}
          <div className="card-enterprise p-6">
            <div className="flex items-center justify-between pb-4 mb-5 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                  <Server className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Infrastructure & Runtime Diagnostics</h2>
                  <p className="text-xs text-slate-500">Node environment, database connection, and active telemetry</p>
                </div>
              </div>
              <span className="badge badge-cyan">Operational</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Database className="w-4 h-4 text-emerald-600" />
                  <span className="font-semibold text-xs">Database Engine</span>
                </div>
                <span className="text-slate-900 font-bold text-base block">{settingsData.system.database}</span>
                <span className="text-[11px] font-mono text-slate-500 mt-1 block">Cluster: {settingsData.system.databaseName}</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Cpu className="w-4 h-4 text-indigo-600" />
                  <span className="font-semibold text-xs">Node.js Runtime</span>
                </div>
                <span className="text-slate-900 font-bold text-base block">{settingsData.system.nodeVersion}</span>
                <span className="text-[11px] font-semibold text-indigo-600 capitalize mt-1 block">{settingsData.system.environment} mode</span>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition-colors">
                <div className="flex items-center gap-2 text-slate-600 mb-2">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="font-semibold text-xs">Active Sessions</span>
                </div>
                <span className="text-slate-900 font-bold text-base block">{settingsData.system.activeSessions} Active</span>
                <span className="text-[11px] text-slate-500 mt-1 block">Unrevoked authenticated sessions</span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
