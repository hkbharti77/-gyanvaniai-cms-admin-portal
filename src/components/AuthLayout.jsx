import React from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Lock,
  Cpu,
  Layers,
  Activity,
  ExternalLink,
  Sparkles,
} from 'lucide-react';

export default function AuthLayout({
  title,
  subtitle,
  badgeText = 'Enterprise Admin Console',
  children,
  sideTagline = 'Autonomous Telephony & Omnichannel Intelligence',
  sideDescription = 'Mission-critical administration hub for orchestrating AI voice bots, WhatsApp conversational pipelines, RBAC governance, and dynamic enterprise CMS.',
}) {
  return (
    <div className="h-screen max-h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 selection:bg-indigo-500 selection:text-white overflow-hidden">
      {/* =========================================================================
          LEFT PANE: Enterprise Command Center & Brand Showcase (Desktop)
          Strictly constrained to 100vh with no scrollbar
          ========================================================================= */}
      <div
        className="hidden lg:flex lg:w-1/2 xl:w-[50%] h-full max-h-screen relative flex-col justify-between p-6 xl:p-8 2xl:p-10 bg-slate-950 text-white overflow-hidden border-r border-slate-800 z-0"
        style={{
          clipPath: 'inset(0)',
          contain: 'strict',
          background:
            'radial-gradient(circle at 15% 15%, rgba(6, 182, 212, 0.16) 0%, transparent 50%), radial-gradient(circle at 85% 80%, rgba(99, 102, 241, 0.16) 0%, transparent 55%), #050811',
        }}
      >
        {/* Micro-grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.06] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(rgba(255, 255, 255, 0.8) 1px, transparent 1px)`,
            backgroundSize: '24px 24px',
          }}
        />

        {/* --- Top Brand Bar --- */}
        <div className="relative z-10 flex items-center justify-between flex-shrink-0">
          <Link
            to="/admin/login"
            className="flex items-center gap-3 group focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl"
          >
            {/* GyanVani AI 3D Circuit Brand Logo */}
            <div className="w-10 h-10 rounded-xl bg-slate-900/90 border border-cyan-500/40 p-1.5 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:border-cyan-400 group-hover:shadow-cyan-400/30 transition-all duration-300 flex-shrink-0">
              <img
                src="/logo.webp"
                alt="Gyan Vani AI Official Logo"
                className="w-full h-full object-contain filter drop-shadow(0 2px 6px rgba(6, 182, 212, 0.45)) group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-white group-hover:text-cyan-200 transition-colors">
                  Gyan Vani AI
                </span>
                <span className="px-2 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                  Enterprise
                </span>
              </div>
              <span className="text-[11px] text-slate-400 font-medium tracking-wide">
                Mission-Control Admin Hub
              </span>
            </div>
          </Link>

          {/* Live System Status Indicator */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span className="font-mono text-[10px] text-emerald-400 font-semibold">99.99% UPTIME</span>
            <span className="text-slate-600">•</span>
            <span className="text-slate-400 text-[10px]">US-East-1 Cluster</span>
          </div>
        </div>

        {/* --- Center Hero Value Proposition --- */}
        <div className="relative z-10 my-auto py-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-[11px] font-semibold mb-3">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            <span>Next-Gen Multi-Agent Architecture</span>
          </div>

          <h1
            className="text-2xl xl:text-3xl 2xl:text-4xl font-extrabold tracking-tight leading-snug mb-2.5"
            style={{ color: '#ffffff' }}
          >
            {sideTagline}
          </h1>

          <p className="text-xs xl:text-sm text-slate-300 leading-relaxed mb-5 max-w-xl">
            {sideDescription}
          </p>

          {/* 4-Pillar Enterprise Capability Grid */}
          <div className="grid grid-cols-2 gap-2.5 max-w-xl mb-4">
            <div className="p-2.5 xl:p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs mb-1">
                <Cpu className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Sub-300ms Voice Telephony</span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-slate-400 leading-normal">
                Autonomous inbound & outbound mesh with live supervisor handoff.
              </p>
            </div>

            <div className="p-2.5 xl:p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs mb-1">
                <Activity className="w-3.5 h-3.5 flex-shrink-0" />
                <span>WhatsApp Business API</span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-slate-400 leading-normal">
                High-throughput conversational automation & instant CRM sync.
              </p>
            </div>

            <div className="p-2.5 xl:p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <ShieldCheck className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Zero-Trust RBAC & Audits</span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-slate-400 leading-normal">
                Granular permission matrix and immutable audit trail logging.
              </p>
            </div>

            <div className="p-2.5 xl:p-3 rounded-xl bg-slate-900/70 border border-slate-800 backdrop-blur-md hover:border-slate-700 transition-colors">
              <div className="flex items-center gap-2 text-sky-400 font-bold text-xs mb-1">
                <Layers className="w-3.5 h-3.5 flex-shrink-0" />
                <span>Omnichannel CRM Engine</span>
              </div>
              <p className="text-[10px] xl:text-[11px] text-slate-400 leading-normal">
                Unified content control, multi-tenant pipelines, and telemetry.
              </p>
            </div>
          </div>

          {/* Enterprise Security Stamp Card */}
          <div className="p-2.5 xl:p-3 rounded-xl bg-slate-900/80 border border-cyan-500/20 flex items-center justify-between text-xs text-slate-300 max-w-xl">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <div>
                <p className="font-semibold text-white text-[11px]">Cryptographically Signed Sessions</p>
                <p className="text-[10px] text-slate-400">
                  AES-256 GCM encryption and per-session CSRF token rotation.
                </p>
              </div>
            </div>
            <span className="hidden sm:inline-block px-1.5 py-0.5 rounded bg-slate-800 text-[9px] font-mono font-bold text-slate-300 uppercase">
              TLS 1.3
            </span>
          </div>
        </div>

        {/* --- Bottom Trust & Compliance Bar --- */}
        <div className="relative z-10 pt-3 border-t border-slate-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-2 text-[10px] text-slate-400 flex-shrink-0">
          <div className="flex flex-wrap items-center gap-2 font-mono text-[10px]">
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              SOC 2 Type II
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              ISO/IEC 27001
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              HIPAA Compliant
            </span>
            <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300">
              256-Bit SSL
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            © 2026 GyanVani AI Inc.
          </span>
        </div>
      </div>

      {/* =========================================================================
          RIGHT PANE: Precision Authentication Form Container
          Strictly constrained to 100vh with no outer scroll needed on desktop
          ========================================================================= */}
      <div className="flex-1 h-full max-h-screen flex flex-col justify-between p-4 sm:p-5 lg:p-6 xl:p-8 relative bg-slate-50 z-10 overflow-y-auto">
        {/* Top Utility Bar */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto flex items-center justify-between mb-2 flex-shrink-0">
          {/* Mobile-only brand badge (visible when left pane is hidden) */}
          <div className="flex lg:hidden items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-1 shadow-xs flex items-center justify-center">
              <img
                src="/logo.webp"
                alt="Gyan Vani AI"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <span className="font-extrabold text-xs tracking-tight text-slate-900 block leading-tight">
                Gyan Vani AI
              </span>
              <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-600 block">
                Enterprise Console
              </span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Secure Admin Gateway Active</span>
          </div>

          {/* Quick link to live site */}
          <a
            href="https://www.gyanvaniai.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
          >
            <span>Live Website</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        {/* Main Center Card (Sized so 100% fits within 660px viewport without scrolling) */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto my-auto animate-fade-in flex-shrink-0 py-1">
          <div className="bg-white rounded-2xl sm:rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 p-5 sm:p-6 lg:p-7 relative">
            {/* Prominent Official Logo Emblem Header */}
            <div className="text-center mb-5">
              <div className="relative inline-block mb-1.5">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-b from-slate-50 to-white border border-slate-200 shadow-md shadow-indigo-100/50 flex items-center justify-center p-2 transition-transform hover:scale-105 duration-300">
                  <img
                    src="/logo.webp"
                    alt="Gyan Vani AI Official Logo"
                    className="w-full h-full object-contain filter drop-shadow(0 2px 6px rgba(14, 165, 233, 0.4))"
                  />
                </div>
              </div>

              {/* Brand Typography */}
              <div className="mb-1">
                <span className="text-sm font-extrabold text-slate-900 tracking-tight block">
                  Gyan Vani AI
                </span>
                <span className="inline-block px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] font-bold tracking-wider uppercase mt-0.5">
                  {badgeText}
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight mt-1">
                {title}
              </h2>
              <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5 max-w-xs mx-auto leading-relaxed">
                {subtitle}
              </p>
            </div>

            {/* Form Slot */}
            {children}

            {/* Trust Footnote */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span>TLS 1.3 • AES-256 Encrypted Session • RBAC Enforced</span>
            </div>
          </div>
        </div>

        {/* Bottom Auxiliary Links */}
        <div className="w-full max-w-sm sm:max-w-md mx-auto mt-2 flex items-center justify-between text-[11px] text-slate-400 font-medium flex-shrink-0">
          <a
            href="https://www.gyanvaniai.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            Privacy Policy
          </a>
          <span>•</span>
          <a
            href="https://www.gyanvaniai.com/security"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            Security Standards
          </a>
          <span>•</span>
          <a
            href="https://www.gyanvaniai.com/documentation"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-slate-600 transition-colors"
          >
            Documentation
          </a>
        </div>
      </div>
    </div>
  );
}
