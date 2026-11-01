import React, { useState, useEffect, useCallback, useMemo } from "react";
import { api } from "../services/api";
import {
  ShieldCheck,
  RefreshCw,
  Globe,
  Users,
  TrendingUp,
  Loader2,
  AlertTriangle,
  Trash2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  X,
  BarChart3,
  CheckCircle2,
  XCircle,
  Settings2,
  MapPin,
  Clock,
  FileText,
  ExternalLink,
  Info,
  Download,
  Copy,
  Check,
  Sliders,
  Shield,
  Lock,
  Layers,
  Calendar,
  Sparkles,
  Database,
  Laptop,
  CheckSquare,
  Square,
  Play,
  RotateCcw,
  BookOpen,
  HelpCircle,
  FileSpreadsheet,
} from "lucide-react";

/* ── Standard Status Config with Dynamic Fallback ────────────────────────── */
const STATUS_CONFIG = {
  all: {
    label: "Accept All",
    badge: "badge-emerald",
    icon: CheckCircle2,
    color: "#059669",
    bg: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  essential: {
    label: "Essential Only",
    badge: "badge-amber",
    icon: Settings2,
    color: "#d97706",
    bg: "bg-amber-50 text-amber-700 border-amber-200",
  },
  rejected: {
    label: "Reject All",
    badge: "badge-rose",
    icon: XCircle,
    color: "#e11d48",
    bg: "bg-rose-50 text-rose-700 border-rose-200",
  },
  custom: {
    label: "Custom",
    badge: "badge-purple",
    icon: Sliders,
    color: "#7c3aed",
    bg: "bg-purple-50 text-purple-700 border-purple-200",
  },
};

function getStatusConfig(status) {
  if (status && STATUS_CONFIG[status]) return STATUS_CONFIG[status];
  return {
    label: status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown",
    badge: "badge-slate",
    icon: Info,
    color: "#64748b",
    bg: "bg-slate-50 text-slate-700 border-slate-200",
  };
}

/* ── Dynamic Channel Badge & Icon Helper ──────────────────────────────────── */
function getChannelMeta(channel) {
  const norm = (channel || "crm").toLowerCase();
  if (norm.includes("portfolio")) {
    return {
      label: "Portfolio Site",
      icon: "🌐",
      badge: "bg-purple-50 text-purple-700 border-purple-200",
      activeTab: "bg-purple-600 text-white shadow-sm",
    };
  }
  if (norm.includes("crm")) {
    return {
      label: "CRM Platform",
      icon: "💼",
      badge: "bg-indigo-50 text-indigo-700 border-indigo-200",
      activeTab: "bg-indigo-600 text-white shadow-sm",
    };
  }
  if (norm.includes("mobile") || norm.includes("app")) {
    return {
      label: "Mobile Client",
      icon: "📱",
      badge: "bg-teal-50 text-teal-700 border-teal-200",
      activeTab: "bg-teal-600 text-white shadow-sm",
    };
  }
  // Generic / Custom channel
  const title = norm.replace(/[_-]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    label: title,
    icon: "🏢",
    badge: "bg-slate-50 text-slate-700 border-slate-200",
    activeTab: "bg-slate-800 text-white shadow-sm",
  };
}

/* ── Enterprise Interactive Area Sparkline Chart ─────────────────────────── */
function SvgTrendAreaChart({ data = [] }) {
  const [hoverIdx, setHoverIdx] = useState(null);

  // Synthesize last 14 days dynamic timeline
  const today = new Date();
  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (13 - i));
      const key = d.toISOString().split("T")[0];
      const match = data.find((r) => r.date === key);
      return {
        date: key,
        label: d.toLocaleDateString("en", { month: "short", day: "numeric" }),
        fullDate: d.toLocaleDateString("en", { weekday: "short", month: "short", day: "numeric", year: "numeric" }),
        count: match?.count || 0,
        accepted: match?.accepted || 0,
        rejected: match?.rejected || 0,
      };
    });
  }, [data]);

  const maxCount = Math.max(...days.map((d) => d.count), 6);
  const width = 640;
  const height = 140;
  const paddingX = 24;
  const paddingY = 20;
  const chartW = width - paddingX * 2;
  const chartH = height - paddingY * 2;

  const points = days.map((d, i) => {
    const x = paddingX + (i / (days.length - 1)) * chartW;
    const y = paddingY + chartH - (d.count / maxCount) * chartH;
    return { ...d, x, y };
  });

  const pathD = points.reduce((acc, p, i) => {
    return i === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  const areaD = `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`;

  return (
    <div className="relative w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-36 overflow-visible select-none"
        onMouseLeave={() => setHoverIdx(null)}
      >
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#4f46e5" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.5, 1].map((ratio, i) => {
          const y = paddingY + chartH * (1 - ratio);
          return (
            <g key={i}>
              <line
                x1={paddingX}
                y1={y}
                x2={width - paddingX}
                y2={y}
                stroke="#e2e8f0"
                strokeDasharray={ratio === 0 ? "none" : "3 3"}
                strokeWidth={1}
              />
              <text
                x={paddingX - 6}
                y={y + 3}
                textAnchor="end"
                className="text-[9px] fill-slate-400 font-sans"
              >
                {Math.round(maxCount * ratio)}
              </text>
            </g>
          );
        })}

        {/* Filled Area */}
        <path d={areaD} fill="url(#trendGradient)" />

        {/* Stroke Line */}
        <path
          d={pathD}
          fill="none"
          stroke="url(#lineGradient)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Data points & hit areas */}
        {points.map((p, idx) => (
          <g key={idx}>
            {/* Hit area */}
            <circle
              cx={p.x}
              cy={p.y}
              r={12}
              fill="transparent"
              className="cursor-pointer"
              onMouseEnter={() => setHoverIdx(idx)}
            />
            {/* Visual Dot */}
            <circle
              cx={p.x}
              cy={p.y}
              r={hoverIdx === idx ? 5 : 3}
              className={`transition-all duration-150 ${
                hoverIdx === idx ? "fill-indigo-600 stroke-white stroke-2" : "fill-indigo-500"
              }`}
            />
            {/* Day label below */}
            {idx % 2 === 0 && (
              <text
                x={p.x}
                y={height - 4}
                textAnchor="middle"
                className="text-[9px] fill-slate-400 font-sans font-medium"
              >
                {p.label}
              </text>
            )}
          </g>
        ))}

        {/* Active hover vertical crosshair line */}
        {hoverIdx !== null && points[hoverIdx] && (
          <line
            x1={points[hoverIdx].x}
            y1={paddingY}
            x2={points[hoverIdx].x}
            y2={height - paddingY}
            stroke="#6366f1"
            strokeDasharray="2 2"
            strokeWidth="1.5"
          />
        )}
      </svg>

      {/* Floating tooltip */}
      {hoverIdx !== null && points[hoverIdx] && (
        <div
          className="absolute z-30 pointer-events-none -top-2 transform -translate-x-1/2 -translate-y-full bg-slate-900/95 backdrop-blur-sm text-white px-3 py-2 rounded-xl shadow-xl text-xs border border-slate-700/60 transition-all duration-100"
          style={{ left: `${(points[hoverIdx].x / width) * 100}%` }}
        >
          <div className="font-semibold text-slate-200 border-b border-slate-700/80 pb-1 mb-1 text-[11px]">
            {points[hoverIdx].fullDate}
          </div>
          <div className="flex items-center justify-between gap-3 text-[11px]">
            <span className="text-slate-400">Total Consents:</span>
            <span className="font-bold text-indigo-400">{points[hoverIdx].count}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px] mt-0.5">
            <span className="text-emerald-400">Accept All:</span>
            <span className="font-semibold text-emerald-300">{points[hoverIdx].accepted}</span>
          </div>
          <div className="flex items-center justify-between gap-3 text-[10px]">
            <span className="text-rose-400">Reject:</span>
            <span className="font-semibold text-rose-300">{points[hoverIdx].rejected}</span>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Metric Card ──────────────────────────────────────────────────────────── */
function MetricCard({ label, value, sub, badge, icon: Icon, color = "indigo" }) {
  const scheme = {
    indigo: {
      bg: "bg-indigo-50/80 text-indigo-600 border-indigo-100",
      pill: "bg-indigo-100/70 text-indigo-700 border-indigo-200",
      accent: "from-indigo-500 to-indigo-600",
    },
    emerald: {
      bg: "bg-emerald-50/80 text-emerald-600 border-emerald-100",
      pill: "bg-emerald-100/70 text-emerald-700 border-emerald-200",
      accent: "from-emerald-500 to-emerald-600",
    },
    rose: {
      bg: "bg-rose-50/80 text-rose-600 border-rose-100",
      pill: "bg-rose-100/70 text-rose-700 border-rose-200",
      accent: "from-rose-500 to-rose-600",
    },
    amber: {
      bg: "bg-amber-50/80 text-amber-600 border-amber-100",
      pill: "bg-amber-100/70 text-amber-700 border-amber-200",
      accent: "from-amber-500 to-amber-600",
    },
  }[color];

  return (
    <div className="card-enterprise relative overflow-hidden p-5 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${scheme.accent}`} />
      <div className="flex items-start justify-between gap-2">
        <div>
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
            {label}
          </span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight leading-none font-heading">
              {value ?? "—"}
            </span>
            {badge && (
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${scheme.pill}`}>
                {badge}
              </span>
            )}
          </div>
        </div>
        <div className={`w-10 h-10 rounded-xl ${scheme.bg} border flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      {sub && <p className="text-xs text-slate-500 mt-3 pt-2 border-t border-slate-100">{sub}</p>}
    </div>
  );
}

/* ── Dynamic Category Opt-In Meter ────────────────────────────────────────── */
function CategoryOptInMeter({ label, count, pct, color = "indigo", description }) {
  const barColors = {
    indigo: "bg-indigo-600",
    emerald: "bg-emerald-600",
    amber: "bg-amber-600",
    purple: "bg-purple-600",
    teal: "bg-teal-600",
  }[color] || "bg-indigo-600";

  return (
    <div className="space-y-1.5 p-3 rounded-xl bg-slate-50/70 border border-slate-100 hover:border-slate-200 transition-colors">
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-slate-800">{label}</span>
          {description && (
            <span className="text-[10px] text-slate-400 hidden sm:inline">({description})</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-mono text-[11px]">{count.toLocaleString()} users</span>
          <span className="font-bold text-slate-900 min-w-8 text-right font-mono">{pct}%</span>
        </div>
      </div>
      <div className="h-2 w-full bg-slate-200/80 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColors} rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
    </div>
  );
}

/* ── Exhaustive Cookie Registry Data (Self-Documenting) ───────────────────── */
const DEFAULT_COOKIE_REGISTRY = [
  {
    key: "hk_portfolio_cookie_consent",
    storageType: "LocalStorage",
    category: "necessary",
    categoryLabel: "Strictly Necessary",
    duration: "1 Year",
    purpose: "Cryptographically stores statutory consent selections across categories according to DPDP & GDPR rules.",
    provider: "First Party (GyanVani / Portfolio)",
  },
  {
    key: "theme",
    storageType: "LocalStorage",
    category: "functional",
    categoryLabel: "Functional",
    duration: "1 Year",
    purpose: "Persists visitor Dark Mode vs. Light Mode aesthetic editorial preference across sessions.",
    provider: "First Party (Platform)",
  },
  {
    key: "hk_reading_mode",
    storageType: "SessionStorage",
    category: "functional",
    categoryLabel: "Functional",
    duration: "Session",
    purpose: "Remembers distraction-free reading mode state during deep-dive case study and article reading.",
    provider: "First Party (Portfolio)",
  },
  {
    key: "__cf_bm",
    storageType: "HTTP Cookie",
    category: "necessary",
    categoryLabel: "Strictly Necessary",
    duration: "30 Minutes",
    purpose: "Cloudflare edge bot mitigation token shielding against automated DDoS scraping and scraping vectors.",
    provider: "Cloudflare (Infrastructure Edge)",
  },
  {
    key: "admin_session",
    storageType: "HTTP Cookie (HttpOnly)",
    category: "necessary",
    categoryLabel: "Strictly Necessary",
    duration: "24 Hours",
    purpose: "Secure administrative JWT authentication token with double-submit CSRF anti-forgery protection.",
    provider: "First Party (CMS Auth)",
  },
  {
    key: "_ga / _gid",
    storageType: "HTTP Cookie",
    category: "analytics",
    categoryLabel: "Analytics & Telemetry",
    duration: "2 Years / 24 Hours",
    purpose: "Collects anonymous, privacy-preserving aggregate telemetry and page velocity statistics (only if enabled).",
    provider: "Google Analytics 4 (Privacy Sandboxed)",
  },
  {
    key: "meta_wa_widget",
    storageType: "Script / SessionStorage",
    category: "marketing",
    categoryLabel: "Marketing & Embeds",
    duration: "Session",
    purpose: "Controls whether live Meta WhatsApp integration and interactive demonstration widgets are loaded.",
    provider: "Meta Cloud API (Opt-in)",
  },
];

/* ── Record Detail Drawer (Enterprise Slide-Over) ─────────────────────────── */
function RecordDrawer({ record, onClose, onDelete, onCopyToast }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [copied, setCopied] = useState(false);

  if (!record) return null;

  const sc = getStatusConfig(record.status);
  const cm = getChannelMeta(record.channel);
  const prefs = record.preferences || {};

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    if (onCopyToast) onCopyToast("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-slate-900/40 backdrop-blur-xs transition-opacity" />
      <div
        className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-slate-200 animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className={`badge ${sc.badge} text-xs font-bold`}>{sc.label}</span>
              <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cm.badge}`}>
                <span>{cm.icon}</span>
                <span>{cm.label}</span>
              </span>
              <span className="text-xs text-slate-400 font-mono">
                ID: {record.id ? record.id.slice(0, 10) + "…" : "—"}
              </span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 font-heading">Consent Audit Dossier</h2>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-xl hover:bg-slate-200/60 text-slate-500 hover:text-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Tabs */}
        <div className="flex items-center gap-1 px-6 border-b border-slate-200 bg-white text-xs font-semibold">
          <button
            onClick={() => setActiveTab("overview")}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === "overview"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Consent &amp; Categories
          </button>
          <button
            onClick={() => setActiveTab("visitor")}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === "visitor"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Technical &amp; Geo
          </button>
          <button
            onClick={() => setActiveTab("proof")}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === "proof"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Statutory Legal Basis
          </button>
          <button
            onClick={() => setActiveTab("json")}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === "json"
                ? "border-indigo-600 text-indigo-700 font-bold"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            Raw Ledger JSON
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6 text-sm">
          {activeTab === "overview" && (
            <div className="space-y-5">
              {/* Timestamp Card */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-slate-600">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <span>Recorded Timestamp (UTC):</span>
                </div>
                <span className="font-semibold text-slate-900 font-mono">
                  {record.createdAt ? new Date(record.createdAt).toUTCString() : "—"}
                </span>
              </div>

              {/* Category Acceptance Breakdown */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Declared Category Preferences
                </h4>
                <div className="space-y-2">
                  {[
                    {
                      key: "necessary",
                      label: "Strictly Necessary",
                      desc: "Security, CSRF mitigation, session integrity",
                      val: true,
                      mandatory: true,
                    },
                    {
                      key: "functional",
                      label: "Functional Telemetry",
                      desc: "Dark mode, reading view, language preferences",
                      val: Boolean(prefs.functional),
                    },
                    {
                      key: "analytics",
                      label: "Aggregate Analytics",
                      desc: "Anonymous page performance and error monitoring",
                      val: Boolean(prefs.analytics),
                    },
                    {
                      key: "marketing",
                      label: "Third-Party & Marketing",
                      desc: "External Meta WhatsApp and demo interactive widgets",
                      val: Boolean(prefs.marketing),
                    },
                  ].map((cat) => (
                    <div
                      key={cat.key}
                      className="p-3.5 rounded-xl border flex items-center justify-between gap-3 bg-white border-slate-200 shadow-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs">{cat.label}</span>
                          {cat.mandatory && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                              Mandatory
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{cat.desc}</p>
                      </div>
                      <span
                        className={`badge text-[11px] font-bold shrink-0 ${
                          cat.val ? "badge-emerald" : "badge-slate text-slate-400"
                        }`}
                      >
                        {cat.val ? "✓ Consented" : "✗ Declined"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Source & Channel Origin */}
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Origin Context
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Capture Channel:</span>
                    <span className="font-bold text-slate-900 capitalize">{record.channel || "crm"}</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                    <span className="text-slate-500">Banner Source Identifier:</span>
                    <span className="font-mono text-slate-700 text-[11px] bg-white px-2 py-0.5 rounded border border-slate-200">
                      {record.source || "default_banner"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <span className="text-slate-500">Landing URL:</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate max-w-xs" title={record.pageUrl}>
                      {record.pageUrl || "Direct Interaction"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "visitor" && (
            <div className="space-y-5">
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Geographic Intelligence (Analytics Opt-in only)
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                  <div className="flex items-center gap-2 text-slate-700">
                    <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-500">Location:</span>
                    <span className="font-semibold text-slate-900 ml-auto">
                      {[record.city, record.region, record.country].filter(Boolean).join(", ") || "Not Captured (Privacy Preserved)"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <Globe className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-500">Country ISO:</span>
                    <span className="font-mono font-semibold text-slate-900 ml-auto">
                      {record.countryCode || "—"}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-700">
                    <LanguagesIcon className="w-4 h-4 text-indigo-500 shrink-0" />
                    <span className="text-slate-500">Browser Locale:</span>
                    <span className="font-semibold text-slate-900 ml-auto">
                      {record.language || "en-US"}
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
                  Device &amp; User Agent String
                </h4>
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <Laptop className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <span className="font-semibold text-slate-700 block mb-1">Raw User Agent</span>
                      <p className="font-mono text-[11px] text-slate-600 break-all bg-white p-2.5 rounded-lg border border-slate-200 leading-relaxed">
                        {record.userAgent || "No user agent provided"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "proof" && (
            <div className="space-y-5">
              <div className="p-4 rounded-xl bg-indigo-50/80 border border-indigo-200/80 text-xs text-indigo-900 space-y-2">
                <div className="flex items-center gap-2 font-bold text-sm text-indigo-950">
                  <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
                  Statutory Compliance Proof
                </div>
                <p className="leading-relaxed">
                  This record serves as cryptographic and auditable evidence of affirmative consent pursuant to international data privacy regulations.
                </p>
                <div className="pt-2 border-t border-indigo-200/60 space-y-1.5 font-mono text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Legal Basis:</span>
                    <span className="font-bold text-indigo-950">{record.legalBasis || "GDPR Art.7 / DPDP Act §6"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Framework Version:</span>
                    <span className="font-bold text-indigo-950">v{record.consentVersion || "2.0"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-indigo-700">Ledger Hash:</span>
                    <span className="font-bold text-indigo-950 truncate max-w-xs">{record.id}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 text-xs">
                <h5 className="font-bold text-slate-800">Statutory Citations Applicable:</h5>
                <ul className="space-y-2 text-slate-600 list-disc list-inside">
                  <li><strong>GDPR Article 7(1):</strong> Controller must be able to demonstrate that the data subject has consented to processing.</li>
                  <li><strong>India DPDP Act 2023 §6(1):</strong> Consent must be free, specific, informed, unconditional, and unambiguous.</li>
                  <li><strong>CCPA §1798.120:</strong> Clear opt-out mechanism for tracking and sharing.</li>
                  <li><strong>GDPR Article 17:</strong> Right to Erasure ("Right to be Forgotten") executable below.</li>
                </ul>
              </div>
            </div>
          )}

          {activeTab === "json" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  MongoDB Ledger Document
                </span>
                <button
                  onClick={() => handleCopy(JSON.stringify(record, null, 2))}
                  className="btn-secondary py-1 px-2.5 text-xs flex items-center gap-1.5"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? "Copied" : "Copy JSON"}
                </button>
              </div>
              <pre className="p-4 rounded-xl bg-slate-900 text-slate-100 font-mono text-xs overflow-x-auto max-h-96 leading-relaxed border border-slate-800">
                {JSON.stringify(record, null, 2)}
              </pre>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex flex-col gap-2">
          <button
            onClick={() => onDelete(record.id)}
            className="btn-danger w-full flex items-center justify-center gap-2 text-xs font-semibold py-2.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Permanently Erase Record (GDPR Art.17 Right to be Forgotten)</span>
          </button>
          <p className="text-[10px] text-slate-400 text-center">
            Permanent cryptographic purge. This cannot be undone.
          </p>
        </div>
      </div>
    </div>
  );
}

function LanguagesIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 8 6 6" />
      <path d="m4 14 6-6 2-3" />
      <path d="M2 5h12" />
      <path d="M7 2h1" />
      <path d="m22 22-5-10-5 10" />
      <path d="M14 18h6" />
    </svg>
  );
}

/* ── Main CookieConsentManager Component ──────────────────────────────────── */
export default function CookieConsentManager() {
  const [activeViewTab, setActiveViewTab] = useState("ledger"); // 'ledger' | 'analytics' | 'catalog' | 'simulator'
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0, limit: 15 });
  const [loading, setLoading] = useState(true);
  const [aLoading, setALoading] = useState(true);
  const [error, setError] = useState(null);
  const [successToast, setSuccessToast] = useState(null);

  // Filters state
  const [channelFilter, setChannelFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all_status");
  const [countryFilter, setCountryFilter] = useState("all_countries");
  const [dateFilter, setDateFilter] = useState("all_time"); // 'all_time' | 'today' | 'last_7' | 'last_30'
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(15);

  // Selection & Details state
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [deleting, setDeleting] = useState(null);
  const [bulkDeleting, setBulkDeleting] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(null);

  // Cookie Catalog state
  const [cookieRegistry, setCookieRegistry] = useState(DEFAULT_COOKIE_REGISTRY);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [catalogCategory, setCatalogCategory] = useState("all");

  // Simulator state
  const [simBannerStyle, setSimBannerStyle] = useState("broadsheet"); // 'broadsheet' | 'modal'
  const [simPrefs, setSimPrefs] = useState({ necessary: true, functional: true, analytics: false, marketing: false });
  const [simOutput, setSimOutput] = useState(null);

  const showToast = useCallback((msg) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 3500);
  }, []);

  /* ── Load Analytics ── */
  const loadAnalytics = useCallback(async () => {
    setALoading(true);
    try {
      const params = {};
      if (channelFilter !== "all") params.channel = channelFilter;
      const data = await api.getCookieAnalytics(params);
      setAnalytics(data);
    } catch (err) {
      console.warn("Analytics fetch failed:", err);
    } finally {
      setALoading(false);
    }
  }, [channelFilter]);

  /* ── Load Records ── */
  const loadRecords = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = { page, limit };
      if (channelFilter !== "all") params.channel = channelFilter;
      if (statusFilter !== "all_status") params.status = statusFilter;
      if (countryFilter !== "all_countries") params.country = countryFilter;
      if (search.trim()) params.search = search.trim();

      const res = await api.getCookieConsents(params);
      let loaded = res.records || [];

      // Client-side date filter if requested
      if (dateFilter !== "all_time") {
        const now = new Date();
        const cutoff = new Date();
        if (dateFilter === "today") cutoff.setHours(0, 0, 0, 0);
        else if (dateFilter === "last_7") cutoff.setDate(now.getDate() - 7);
        else if (dateFilter === "last_30") cutoff.setDate(now.getDate() - 30);
        loaded = loaded.filter((r) => r.createdAt && new Date(r.createdAt) >= cutoff);
      }

      setRecords(loaded);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: loaded.length, limit });
      setSelectedIds(new Set());
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || "Failed to load consent records from server.");
    } finally {
      setLoading(false);
    }
  }, [page, limit, channelFilter, statusFilter, countryFilter, search, dateFilter]);

  useEffect(() => {
    loadAnalytics();
  }, [loadAnalytics]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  /* ── Dynamic Channel Options Extraction ── */
  const availableChannels = useMemo(() => {
    const list = [...(analytics?.channelBreakdown || [])];
    const found = new Set(list.map((c) => c.channel?.toLowerCase()));
    records.forEach((r) => {
      const ch = (r.channel || "").toLowerCase();
      if (ch && !found.has(ch)) {
        list.push({ channel: r.channel, count: 0 });
        found.add(ch);
      }
    });
    return list;
  }, [analytics, records]);

  /* ── Dynamic Country Options Extraction ── */
  const availableCountries = useMemo(() => {
    const map = new Map();
    (analytics?.topCountries || []).forEach((c) => {
      if (c.country) map.set(c.country, c.count);
    });
    records.forEach((r) => {
      if (r.country && !map.has(r.country)) {
        map.set(r.country, 1);
      }
    });
    return Array.from(map.entries()).map(([country, count]) => ({ country, count }));
  }, [analytics, records]);

  /* ── Selection Helpers ── */
  const handleToggleSelectAll = () => {
    if (selectedIds.size === records.length && records.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(records.map((r) => r.id)));
    }
  };

  const handleToggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  /* ── Single Deletion ── */
  const handleDelete = async (id) => {
    if (!window.confirm("Permanently erase this consent record under GDPR Article 17 (Right to be Forgotten)?")) return;
    setDeleting(id);
    try {
      await api.deleteConsentRecord(id);
      showToast("Consent record permanently erased from MongoDB audit ledger.");
      setSelectedRecord(null);
      loadRecords();
      loadAnalytics();
    } catch (err) {
      alert("Failed to erase record: " + err.message);
    } finally {
      setDeleting(null);
    }
  };

  /* ── Bulk Deletion (GDPR Art. 17) ── */
  const handleBulkDelete = async () => {
    const count = selectedIds.size;
    if (count === 0) return;
    if (!window.confirm(`Permanently erase ${count} selected consent records from the audit ledger? (GDPR Art.17)`)) {
      return;
    }

    setBulkDeleting(true);
    try {
      const ids = Array.from(selectedIds);
      if (typeof api.bulkDeleteConsentRecords === "function") {
        await api.bulkDeleteConsentRecords(ids);
      } else {
        await Promise.allSettled(ids.map((id) => api.deleteConsentRecord(id)));
      }
      showToast(`Successfully erased ${count} consent records under GDPR Art. 17.`);
      setSelectedIds(new Set());
      loadRecords();
      loadAnalytics();
    } catch (err) {
      alert("Bulk deletion failed: " + err.message);
    } finally {
      setBulkDeleting(false);
    }
  };

  /* ── Export to RFC-4180 CSV ── */
  const handleExportCsv = () => {
    if (!records.length) {
      alert("No records to export.");
      return;
    }
    const headers = [
      "Record ID",
      "Timestamp (UTC)",
      "Channel",
      "Source",
      "Consent Status",
      "Necessary",
      "Functional",
      "Analytics",
      "Marketing",
      "Country",
      "City",
      "Region",
      "Language",
      "Page URL",
      "Legal Basis",
      "Version",
      "User Agent",
    ];

    const rows = records.map((r) => [
      r.id,
      r.createdAt ? new Date(r.createdAt).toISOString() : "",
      r.channel || "crm",
      r.source || "",
      r.status || "",
      "true",
      r.preferences?.functional ? "true" : "false",
      r.preferences?.analytics ? "true" : "false",
      r.preferences?.marketing ? "true" : "false",
      `"${(r.country || "").replace(/"/g, '""')}"`,
      `"${(r.city || "").replace(/"/g, '""')}"`,
      `"${(r.region || "").replace(/"/g, '""')}"`,
      r.language || "",
      `"${(r.pageUrl || "").replace(/"/g, '""')}"`,
      `"${(r.legalBasis || "").replace(/"/g, '""')}"`,
      r.consentVersion || "2.0",
      `"${(r.userAgent || "").replace(/"/g, '""')}"`,
    ]);

    const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((row) => row.join(","))].join("\r\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cookie-consent-audit-ledger-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("CSV Audit Ledger exported successfully.");
  };

  /* ── Export to JSON Compliance Package ── */
  const handleExportJson = () => {
    if (!records.length) {
      alert("No records to export.");
      return;
    }
    const payload = {
      exportTimestamp: new Date().toISOString(),
      statutoryFramework: "GDPR Art. 7/17 · India DPDP Act 2023 §6 · CCPA §1798.120",
      channelFilter,
      totalRecordsExported: records.length,
      records,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `cookie-consent-statutory-package-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast("JSON Compliance Package exported successfully.");
  };

  /* ── Clear All Active Filters ── */
  const handleResetFilters = () => {
    setChannelFilter("all");
    setStatusFilter("all_status");
    setCountryFilter("all_countries");
    setDateFilter("all_time");
    setSearch("");
    setPage(1);
  };

  const hasActiveFilters =
    channelFilter !== "all" ||
    statusFilter !== "all_status" ||
    countryFilter !== "all_countries" ||
    dateFilter !== "all_time" ||
    search.trim() !== "";

  const ov = analytics?.overview || {};
  const cats = analytics?.categoryAcceptance || {};

  return (
    <div className="space-y-6 animate-fade-in text-slate-800">
      {/* Toast Notification */}
      {successToast && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-emerald-600 text-white text-xs font-semibold rounded-xl shadow-xl animate-fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
          <span>{successToast}</span>
        </div>
      )}

      {/* ── Page Hero Header ────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-50/90 via-white to-purple-50/50 border border-indigo-100 p-6 md:p-8 shadow-xs">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2.5">
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Statutory Privacy Governance &amp; Multi-Channel Consent</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900 tracking-tight font-heading">
              Cookie Consent Manager
            </h1>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl leading-relaxed font-body">
              Enterprise compliance ledger compliant with{" "}
              <strong className="text-slate-800 font-semibold">GDPR (Art. 7 &amp; 17)</strong>,{" "}
              <strong className="text-slate-800 font-semibold">DPDP Act 2023 (§6 &amp; 12)</strong>, and{" "}
              <strong className="text-slate-800 font-semibold">CCPA (§1798.120)</strong>. Real-time telemetry isolation between portfolio visitors and administrative platform.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {lastRefresh && (
              <span className="text-xs text-slate-400 font-mono hidden lg:block">
                Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
              </span>
            )}
            <button
              onClick={() => {
                loadAnalytics();
                loadRecords();
                showToast("Refreshed consent telemetry.");
              }}
              className="btn-secondary text-xs font-semibold py-2 px-3.5 flex items-center gap-2"
              title="Refresh ledger and analytics"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || aLoading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </button>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleExportCsv}
                className="btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
                title="Export active table to RFC-4180 CSV"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={handleExportJson}
                className="btn-secondary text-xs font-semibold py-2 px-3 flex items-center gap-1.5"
                title="Export statutory JSON archive"
              >
                <Download className="w-3.5 h-3.5 text-indigo-600" />
                <span>JSON</span>
              </button>
            </div>
          </div>
        </div>

        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-100/40 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* ── Top Level Navigation Tabs ──────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-0.5">
        {[
          { id: "ledger", label: "Consent Audit Ledger", icon: Database, count: ov.total },
          { id: "analytics", label: "Analytics & Geo Intelligence", icon: BarChart3 },
          { id: "catalog", label: "Cookie Registry & Taxonomy", icon: Lock, count: cookieRegistry.length },
          { id: "simulator", label: "Statutory Banner Simulator", icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeViewTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveViewTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-4 text-xs font-semibold border-b-2 whitespace-nowrap transition-all duration-150 ${
                isActive
                  ? "border-indigo-600 text-indigo-700 font-bold bg-white"
                  : "border-transparent text-slate-500 hover:text-slate-900 hover:border-slate-300"
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? "text-indigo-600" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive ? "bg-indigo-100 text-indigo-700 font-bold" : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {tab.count.toLocaleString()}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Dynamic Channel Isolation Pill Bar ──────────────────────── */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Channel Filter:
          </span>
          <div className="inline-flex p-1 bg-slate-100/90 rounded-xl gap-1 flex-wrap">
            {/* All Channels Tab */}
            <button
              onClick={() => {
                setChannelFilter("all");
                setPage(1);
              }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                channelFilter === "all"
                  ? "bg-white text-slate-900 shadow-xs font-bold"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Channels ({ov.total || records.length || 0})
            </button>

            {/* Dynamic Channels Extracted from Analytics & DB */}
            {availableChannels.map((c) => {
              const meta = getChannelMeta(c.channel);
              const isSelected = channelFilter === c.channel;
              return (
                <button
                  key={c.channel}
                  onClick={() => {
                    setChannelFilter(c.channel);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 ${
                    isSelected ? meta.activeTab : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                  <span className="text-[10px] font-mono opacity-80">({c.count || 0})</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500 shrink-0">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">Channel Isolation Active</span>
          <span className="text-slate-300">|</span>
          <span className="text-[11px] font-mono text-slate-400">Atlas Encrypted</span>
        </div>
      </div>

      {/* ── KPI Metric Cards ───────────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Consents"
          value={aLoading ? "…" : (ov.total ?? records.length)?.toLocaleString()}
          sub={channelFilter === "all" ? "Audited across all web channels" : `Channel: ${channelFilter}`}
          badge="Ledger Total"
          icon={ShieldCheck}
          color="indigo"
        />
        <MetricCard
          label="Acceptance Rate"
          value={aLoading ? "…" : `${ov.acceptRate ?? 0}%`}
          sub="Opt-in to all or functional tiers"
          badge="Compliant"
          icon={TrendingUp}
          color="emerald"
        />
        <MetricCard
          label="Rejection / Essential"
          value={aLoading ? "…" : `${ov.rejectRate ?? 0}%`}
          sub="Restricted to mandatory storage"
          badge="Privacy First"
          icon={XCircle}
          color="rose"
        />
        <MetricCard
          label="30-Day Velocity"
          value={aLoading ? "…" : (ov.last30 ?? 0)?.toLocaleString()}
          sub={`${ov.last7 ?? 0} events recorded past 7 days`}
          badge="Live Feed"
          icon={Calendar}
          color="amber"
        />
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          TAB 1: CONSENT AUDIT LEDGER
         ══════════════════════════════════════════════════════════════════ */}
      {activeViewTab === "ledger" && (
        <div className="space-y-4">
          {/* Audit Table Card */}
          <div className="card-enterprise">
            {/* Card Header */}
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-slate-900 font-heading">
                    Statutory Consent Ledger &amp; Audit Trail
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200/80">
                    {pagination.total?.toLocaleString() || records.length} records
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Showing {records.length} of {pagination.total?.toLocaleString()} events · Filtered by Channel:{" "}
                  <strong className="capitalize text-slate-700 font-semibold">{channelFilter}</strong>
                </p>
              </div>

              {hasActiveFilters && (
                <button
                  onClick={handleResetFilters}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Reset All Filters</span>
                </button>
              )}
            </div>

            {/* Dedicated Enterprise Filter Toolbar */}
            <div className="p-4 bg-slate-50/70 border-b border-slate-200/80">
              <div className="flex flex-col lg:flex-row items-stretch lg:items-center gap-2.5">
                {/* Search Input Box */}
                <div className="relative flex-1 min-w-[220px]">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="Search by URL, country, source, IP address…"
                    value={search}
                    onChange={(e) => {
                      setSearch(e.target.value);
                      setPage(1);
                    }}
                    className="w-full pl-10 pr-9 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-xs"
                  />
                  {search && (
                    <button
                      onClick={() => {
                        setSearch("");
                        setPage(1);
                      }}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-md hover:bg-slate-100 transition-colors"
                      title="Clear search"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filter Select Controls Inline Row */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Filter */}
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={statusFilter}
                      onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                      <option value="all_status">Status: All</option>
                      <option value="all">Accept All (Full)</option>
                      <option value="essential">Essential Only</option>
                      <option value="rejected">Reject All</option>
                      <option value="custom">Custom Tiers</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  {/* Country Filter */}
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={countryFilter}
                      onChange={(e) => {
                        setCountryFilter(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all max-w-[170px] truncate"
                    >
                      <option value="all_countries">Country: All</option>
                      {availableCountries.map((c) => (
                        <option key={c.country} value={c.country}>
                          {c.country} ({c.count})
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  {/* Date Range Filter */}
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={dateFilter}
                      onChange={(e) => {
                        setDateFilter(e.target.value);
                        setPage(1);
                      }}
                      className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                    >
                      <option value="all_time">Time: All</option>
                      <option value="today">Today Only</option>
                      <option value="last_7">Past 7 Days</option>
                      <option value="last_30">Past 30 Days</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
                  </div>

                  {/* Page Limit Selector */}
                  <div className="relative flex items-center shrink-0">
                    <select
                      value={limit}
                      onChange={(e) => {
                        setLimit(Number(e.target.value));
                        setPage(1);
                      }}
                      className="appearance-none pl-3 pr-7 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                      title="Records per page"
                    >
                      <option value={15}>15 / page</option>
                      <option value={25}>25 / page</option>
                      <option value={50}>50 / page</option>
                      <option value={100}>100 / page</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Active Filter Chips Sub-bar */}
              {hasActiveFilters && (
                <div className="flex items-center gap-1.5 pt-3 mt-3 border-t border-slate-200/60 flex-wrap text-xs">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                    Active Filters:
                  </span>
                  {search.trim() && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Search className="w-3 h-3 text-slate-400" />
                      <span>&ldquo;{search}&rdquo;</span>
                      <button onClick={() => setSearch("")} className="hover:text-rose-500 ml-0.5" title="Remove search">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {statusFilter !== "all_status" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Sliders className="w-3 h-3 text-slate-400" />
                      <span>Status: {getStatusConfig(statusFilter).label}</span>
                      <button onClick={() => setStatusFilter("all_status")} className="hover:text-rose-500 ml-0.5" title="Reset status">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {countryFilter !== "all_countries" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Globe className="w-3 h-3 text-slate-400" />
                      <span>{countryFilter}</span>
                      <button onClick={() => setCountryFilter("all_countries")} className="hover:text-rose-500 ml-0.5" title="Reset country">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  {dateFilter !== "all_time" && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium bg-white border border-slate-200 text-slate-700 shadow-2xs">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      <span>{dateFilter === "today" ? "Today" : dateFilter === "last_7" ? "Past 7 Days" : "Past 30 Days"}</span>
                      <button onClick={() => setDateFilter("all_time")} className="hover:text-rose-500 ml-0.5" title="Reset date">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                  <button
                    onClick={handleResetFilters}
                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-700 underline ml-1 cursor-pointer"
                  >
                    Clear all
                  </button>
                </div>
              )}
            </div>

            {/* Bulk Selection Floating Action Bar */}
            {selectedIds.size > 0 && (
              <div className="bg-indigo-50/90 border-b border-indigo-200 px-5 py-2.5 flex items-center justify-between text-xs animate-fade-in">
                <div className="flex items-center gap-2 text-indigo-900 font-semibold">
                  <CheckSquare className="w-4 h-4 text-indigo-600" />
                  <span>
                    {selectedIds.size} {selectedIds.size === 1 ? "record" : "records"} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBulkDelete}
                    disabled={bulkDeleting}
                    className="btn-danger py-1 px-3 text-xs flex items-center gap-1.5 font-semibold"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>{bulkDeleting ? "Purging…" : "Bulk Erase (GDPR Art. 17)"}</span>
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    className="btn-secondary py-1 px-2.5 text-xs"
                  >
                    Deselect All
                  </button>
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="m-5 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            {/* Main Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                    <th className="py-3 px-4 w-10 text-center">
                      <button
                        onClick={handleToggleSelectAll}
                        className="text-slate-400 hover:text-indigo-600 transition-colors"
                        title={selectedIds.size === records.length ? "Deselect All" : "Select All On Page"}
                      >
                        {selectedIds.size === records.length && records.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-indigo-600" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Channel &amp; Origin</th>
                    <th className="py-3 px-4 hidden md:table-cell">Geographic Origin</th>
                    <th className="py-3 px-4 hidden lg:table-cell">Categories Consented</th>
                    <th className="py-3 px-4 hidden sm:table-cell">Page URL</th>
                    <th className="py-3 px-4 text-right">Recorded At</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-body">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center">
                        <Loader2 className="w-7 h-7 animate-spin text-indigo-500 mx-auto mb-2" />
                        <span className="text-slate-500 text-xs font-semibold">
                          Streaming consent records from MongoDB Atlas…
                        </span>
                      </td>
                    </tr>
                  ) : records.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="py-16 text-center text-slate-400">
                        <div className="max-w-xs mx-auto space-y-2">
                          <Shield className="w-8 h-8 text-slate-300 mx-auto" />
                          <p className="text-sm font-bold text-slate-700">No consent records match your query</p>
                          <p className="text-xs text-slate-400">
                            Try adjusting your search criteria, clearing the channel filter, or simulating a test consent below.
                          </p>
                          {hasActiveFilters && (
                            <button
                              onClick={handleResetFilters}
                              className="btn-secondary text-xs mt-2 py-1 px-3"
                            >
                              Reset Active Filters
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    records.map((r) => {
                      const sc = getStatusConfig(r.status);
                      const cm = getChannelMeta(r.channel);
                      const prefs = r.preferences || {};
                      const isSelected = selectedIds.has(r.id);

                      return (
                        <tr
                          key={r.id}
                          className={`hover:bg-slate-50/80 transition-colors ${
                            isSelected ? "bg-indigo-50/40" : ""
                          }`}
                        >
                          {/* Row Checkbox */}
                          <td className="py-3 px-4 text-center">
                            <button
                              onClick={() => handleToggleSelectOne(r.id)}
                              className="text-slate-400 hover:text-indigo-600 transition-colors"
                            >
                              {isSelected ? (
                                <CheckSquare className="w-4 h-4 text-indigo-600" />
                              ) : (
                                <Square className="w-4 h-4" />
                              )}
                            </button>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            <span className={`badge ${sc.badge} text-[10px] font-bold`}>
                              {sc.label}
                            </span>
                          </td>

                          {/* Channel Badge */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${cm.badge}`}>
                              <span>{cm.icon}</span>
                              <span>{cm.label}</span>
                            </span>
                          </td>

                          {/* Country */}
                          <td className="py-3 px-4 hidden md:table-cell">
                            <div className="flex items-center gap-1.5 text-slate-700">
                              <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                              <span className="font-medium">{r.country || "Not Recorded"}</span>
                              {r.countryCode && (
                                <span className="text-[10px] text-slate-400 font-mono">
                                  ({r.countryCode})
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Category Chips */}
                          <td className="py-3 px-4 hidden lg:table-cell">
                            <div className="flex items-center gap-1">
                              {[
                                { key: "necessary", label: "NEC", active: true },
                                { key: "functional", label: "FUNC", active: prefs.functional },
                                { key: "analytics", label: "ANAL", active: prefs.analytics },
                                { key: "marketing", label: "MKT", active: prefs.marketing },
                              ].map((cat) => (
                                <span
                                  key={cat.key}
                                  className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                                    cat.active
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}
                                  title={`${cat.label}: ${cat.active ? "Consented" : "Declined"}`}
                                >
                                  {cat.label}
                                </span>
                              ))}
                            </div>
                          </td>

                          {/* Page URL */}
                          <td className="py-3 px-4 hidden sm:table-cell">
                            <span
                              className="text-slate-500 font-mono text-[11px] truncate max-w-44 block"
                              title={r.pageUrl}
                            >
                              {r.pageUrl ? (r.pageUrl.startsWith("http") ? new URL(r.pageUrl).pathname : r.pageUrl) : "—"}
                            </span>
                          </td>

                          {/* Recorded Date */}
                          <td className="py-3 px-4 text-right text-slate-500 font-mono text-[11px] whitespace-nowrap">
                            {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                          </td>

                          {/* Actions */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => setSelectedRecord(r)}
                                className="w-7 h-7 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-indigo-600 hover:text-indigo-800 transition-colors"
                                title="Inspect Consent Record"
                              >
                                <Eye className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDelete(r.id)}
                                disabled={deleting === r.id}
                                className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-rose-500 hover:text-rose-700 transition-colors"
                                title="Erase Record (GDPR Art. 17)"
                              >
                                {deleting === r.id ? (
                                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                ) : (
                                  <Trash2 className="w-3.5 h-3.5" />
                                )}
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
              <div className="px-5 py-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
                <span className="text-slate-500">
                  Showing Page <strong className="text-slate-800">{pagination.page}</strong> of{" "}
                  <strong className="text-slate-800">{pagination.totalPages}</strong> ({pagination.total?.toLocaleString()} total records)
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1 || loading}
                    className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 text-slate-700 font-semibold"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <span className="px-2 font-mono text-slate-500">
                    {page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    disabled={page >= pagination.totalPages || loading}
                    className="py-1 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center gap-1 text-slate-700 font-semibold"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 2: ANALYTICS & GEO INSIGHTS
         ══════════════════════════════════════════════════════════════════ */}
      {activeViewTab === "analytics" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Daily Trend Interactive SVG Sparkline */}
            <div className="lg:col-span-2 card-enterprise p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 font-heading">
                    14-Day Statutory Consent Velocity
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Daily breakdown of affirmative opt-ins vs. statutory rejections
                  </p>
                </div>
                <span className="badge badge-indigo text-[10px] font-mono">Real-time Stream</span>
              </div>

              {aLoading ? (
                <div className="h-36 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              ) : (
                <SvgTrendAreaChart data={analytics?.dailyTrend || []} />
              )}

              {/* Status Breakdown Pills */}
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                  Breakdown:
                </span>
                {(analytics?.statusBreakdown || []).map((s) => {
                  const sc = getStatusConfig(s.status);
                  return (
                    <span key={s.status} className={`badge ${sc.badge} text-[10px] font-semibold`}>
                      {sc.label}: {s.count}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Top Countries Distribution */}
            <div className="card-enterprise p-6 space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 font-heading">Top Geographic Origins</h3>
                <p className="text-xs text-slate-500 mt-0.5">Visitor volume across the last 30 days</p>
              </div>

              {aLoading ? (
                <div className="h-44 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-slate-300" />
                </div>
              ) : (
                <div className="space-y-3">
                  {(analytics?.topCountries || []).slice(0, 6).map((c, i) => {
                    const maxCount = analytics.topCountries[0]?.count || 1;
                    const pct = Math.round((c.count / maxCount) * 100);
                    return (
                      <div key={i} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-semibold text-slate-700 flex items-center gap-1.5">
                            <MapPin className="w-3.5 h-3.5 text-indigo-500" />
                            {c.country || "Anonymous / Masked"}
                          </span>
                          <span className="font-mono text-slate-500 font-semibold">{c.count}</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                  {!analytics?.topCountries?.length && (
                    <p className="text-xs text-slate-400 text-center py-6">
                      No geo records registered yet (Analytics consent required for geo resolution).
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Category Acceptance Meters */}
          <div className="card-enterprise p-6 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 font-heading">
                Dynamic Category Acceptance Breakdown
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Independent adoption percentages across each consented storage tier
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <CategoryOptInMeter
                label="Strictly Necessary"
                count={ov.total || 0}
                pct={100}
                color="indigo"
                description="Core Security & CSRF"
              />
              <CategoryOptInMeter
                label="Functional"
                count={cats.functional?.count ?? 0}
                pct={cats.functional?.pct ?? 0}
                color="amber"
                description="Dark/Light Mode & Reader"
              />
              <CategoryOptInMeter
                label="Analytics"
                count={cats.analytics?.count ?? 0}
                pct={cats.analytics?.pct ?? 0}
                color="emerald"
                description="Aggregated Telemetry"
              />
              <CategoryOptInMeter
                label="Marketing & Embeds"
                count={cats.marketing?.count ?? 0}
                pct={cats.marketing?.pct ?? 0}
                color="purple"
                description="Third-party WhatsApp"
              />
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 3: COOKIE REGISTRY & TAXONOMY
         ══════════════════════════════════════════════════════════════════ */}
      {activeViewTab === "catalog" && (
        <div className="card-enterprise space-y-5">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 font-heading">
                Exhaustive Cookie &amp; Storage Registry
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Technical disclosures of all persistent and session client-side keys according to GDPR &amp; DPDP transparency rules
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                  placeholder="Filter keys or purposes…"
                  value={catalogSearch}
                  onChange={(e) => setCatalogSearch(e.target.value)}
                />
              </div>

              <div className="relative flex items-center">
                <select
                  className="appearance-none pl-3 pr-8 py-2 text-xs font-semibold rounded-xl border border-slate-300 bg-white text-slate-700 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 cursor-pointer transition-all"
                  value={catalogCategory}
                  onChange={(e) => setCatalogCategory(e.target.value)}
                >
                  <option value="all">All Categories</option>
                  <option value="necessary">Strictly Necessary</option>
                  <option value="functional">Functional</option>
                  <option value="analytics">Analytics</option>
                  <option value="marketing">Marketing</option>
                </select>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 pointer-events-none" />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-body">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-3 px-5">Key / Cookie Name</th>
                  <th className="py-3 px-5">Storage Type</th>
                  <th className="py-3 px-5">Category</th>
                  <th className="py-3 px-5">Retention Duration</th>
                  <th className="py-3 px-5">Provider / Origin</th>
                  <th className="py-3 px-5">Exact Functional Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {cookieRegistry
                  .filter((item) => {
                    if (catalogCategory !== "all" && item.category !== catalogCategory) return false;
                    if (catalogSearch.trim()) {
                      const q = catalogSearch.toLowerCase();
                      return (
                        item.key.toLowerCase().includes(q) ||
                        item.purpose.toLowerCase().includes(q) ||
                        item.provider.toLowerCase().includes(q)
                      );
                    }
                    return true;
                  })
                  .map((item, idx) => {
                    const catColors = {
                      necessary: "bg-indigo-50 text-indigo-700 border-indigo-200",
                      functional: "bg-amber-50 text-amber-700 border-amber-200",
                      analytics: "bg-emerald-50 text-emerald-700 border-emerald-200",
                      marketing: "bg-purple-50 text-purple-700 border-purple-200",
                    }[item.category] || "bg-slate-50 text-slate-700 border-slate-200";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3.5 px-5 font-bold font-mono text-slate-900">
                          {item.key}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">
                          {item.storageType}
                        </td>
                        <td className="py-3.5 px-5">
                          <span className={`badge text-[10px] font-bold ${catColors}`}>
                            {item.categoryLabel}
                          </span>
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 font-mono text-[11px]">
                          {item.duration}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 text-[11px]">
                          {item.provider}
                        </td>
                        <td className="py-3.5 px-5 text-slate-600 leading-relaxed max-w-sm">
                          {item.purpose}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════
          TAB 4: STATUTORY FRAMEWORKS & SIMULATOR
         ══════════════════════════════════════════════════════════════════ */}
      {activeViewTab === "simulator" && (
        <div className="space-y-6">
          {/* Statutory Framework Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card-enterprise p-5 space-y-2 border-l-4 border-l-indigo-600">
              <span className="badge badge-indigo text-[10px] font-bold">EU Regulation 2016/679</span>
              <h4 className="font-bold text-slate-900 text-sm">GDPR Compliance Standard</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Requires affirmative prior opt-in for all non-essential cookies. Records must store proof of consent and allow seamless erasure (Art. 17).
              </p>
            </div>

            <div className="card-enterprise p-5 space-y-2 border-l-4 border-l-emerald-600">
              <span className="badge badge-emerald text-[10px] font-bold">Statutory Act No. 22 of 2023</span>
              <h4 className="font-bold text-slate-900 text-sm">India DPDP Act 2023 §6 &amp; §12</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Mandates clear statutory notice before collecting consent. Supports unconditional withdrawal and automated erasure upon purpose fulfillment.
              </p>
            </div>

            <div className="card-enterprise p-5 space-y-2 border-l-4 border-l-amber-600">
              <span className="badge badge-amber text-[10px] font-bold">Cal. Civ. Code §1798.120</span>
              <h4 className="font-bold text-slate-900 text-sm">CCPA / CPRA "Do Not Sell"</h4>
              <p className="text-xs text-slate-600 leading-relaxed">
                Guarantees consumer rights to opt out of third-party tracking, pixel syndication, and cross-context behavioral marketing.
              </p>
            </div>
          </div>

          {/* Interactive Banner Simulator Sandbox */}
          <div className="card-enterprise p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 font-heading">
                  Interactive Cookie Consent Simulator
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Simulate the exact visitor banner experience and inspect generated cryptographic ledger payloads in real time
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Banner Form:</span>
                <button
                  onClick={() => setSimBannerStyle("broadsheet")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    simBannerStyle === "broadsheet"
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Portfolio Broadsheet
                </button>
                <button
                  onClick={() => setSimBannerStyle("modal")}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg border transition-colors ${
                    simBannerStyle === "modal"
                      ? "bg-indigo-600 text-white border-indigo-600 font-bold"
                      : "bg-white text-slate-700 border-slate-200"
                  }`}
                >
                  Corporate Center Modal
                </button>
              </div>
            </div>

            {/* Simulated Banner Preview Canvas */}
            <div className="p-6 rounded-2xl bg-slate-100 border border-slate-200/80 flex items-center justify-center min-h-[260px] relative">
              <div
                className={`w-full max-w-xl bg-white border border-slate-200 shadow-xl p-5 space-y-4 rounded-2xl ${
                  simBannerStyle === "modal" ? "border-indigo-200" : ""
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200">
                        DPDP Act 2023 &amp; Statutory Notice
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-1">
                      Statutory Cookie &amp; Telemetry Consent
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      We use strictly necessary telemetry for security, CSRF protection, and dark/light theme persistence. We do <strong>NOT</strong> sell data or track cross-site activity.
                    </p>
                  </div>
                </div>

                {/* Simulated Toggles */}
                <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-not-allowed">
                    <input type="checkbox" checked disabled className="rounded text-indigo-600" />
                    <span className="font-semibold text-slate-700">Strictly Necessary (Mandatory)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simPrefs.functional}
                      onChange={(e) => setSimPrefs((p) => ({ ...p, functional: e.target.checked }))}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Functional (Themes &amp; Reader)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simPrefs.analytics}
                      onChange={(e) => setSimPrefs((p) => ({ ...p, analytics: e.target.checked }))}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Analytics (Telemetry)</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 rounded-lg bg-slate-50 border border-slate-200 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={simPrefs.marketing}
                      onChange={(e) => setSimPrefs((p) => ({ ...p, marketing: e.target.checked }))}
                      className="rounded text-indigo-600"
                    />
                    <span className="font-semibold text-slate-700">Third-Party WhatsApp</span>
                  </label>
                </div>

                {/* Simulated Action Buttons */}
                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    onClick={() => {
                      const payload = {
                        status: "rejected",
                        preferences: { necessary: true, functional: false, analytics: false, marketing: false },
                        channel: "portfolio",
                        source: "simulator_test",
                        simulatedAt: new Date().toISOString(),
                      };
                      setSimOutput(payload);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    Reject Non-Essential
                  </button>
                  <button
                    onClick={() => {
                      const payload = {
                        status: "custom",
                        preferences: simPrefs,
                        channel: "portfolio",
                        source: "simulator_test",
                        simulatedAt: new Date().toISOString(),
                      };
                      setSimOutput(payload);
                    }}
                    className="btn-secondary text-xs py-1.5 px-3 font-semibold text-indigo-700"
                  >
                    Save Selections
                  </button>
                  <button
                    onClick={() => {
                      const payload = {
                        status: "all",
                        preferences: { necessary: true, functional: true, analytics: true, marketing: true },
                        channel: "portfolio",
                        source: "simulator_test",
                        simulatedAt: new Date().toISOString(),
                      };
                      setSimOutput(payload);
                    }}
                    className="btn-primary text-xs py-1.5 px-3.5"
                  >
                    Accept All Cookies
                  </button>
                </div>
              </div>
            </div>

            {/* Simulated Generated JSON Payload Output */}
            {simOutput && (
              <div className="p-4 rounded-xl bg-slate-900 text-slate-100 text-xs font-mono space-y-2 border border-slate-800 animate-fade-in">
                <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold text-emerald-400">✓ Simulated Payload Captured:</span>
                  <span className="text-[11px]">{simOutput.simulatedAt}</span>
                </div>
                <pre className="overflow-x-auto text-[11px] leading-relaxed">
                  {JSON.stringify(simOutput, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Slide-Over Detail Drawer ────────────────────────────────── */}
      <RecordDrawer
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
        onDelete={handleDelete}
        onCopyToast={showToast}
      />
    </div>
  );
}
