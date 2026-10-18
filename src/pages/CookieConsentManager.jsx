import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import {
  ShieldCheck, RefreshCw, Globe, Users, TrendingUp, Loader2,
  AlertTriangle, Trash2, Eye, EyeOff, Search, Filter, ChevronLeft,
  ChevronRight, X, BarChart3, CheckCircle2, XCircle, Settings2,
  MapPin, Clock, FileText, ExternalLink, Info,
} from "lucide-react";

/* ── Status config ────────────────────────────────────────────────────────── */
const STATUS_CONFIG = {
  all:      { label: "Accept All",       badge: "badge-emerald", icon: CheckCircle2 },
  essential:{ label: "Essential Only",  badge: "badge-amber",   icon: Settings2    },
  rejected: { label: "Reject All",      badge: "badge-rose",    icon: XCircle      },
  custom:   { label: "Custom",          badge: "badge-purple",  icon: Filter       },
};

/* ── Mini bar chart ───────────────────────────────────────────────────────── */
function MiniBar({ pct, color = "#4f46e5" }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: "#f1f5f9", borderRadius: 99, overflow: "hidden" }}>
        <div style={{ width: `${Math.max(2, pct)}%`, height: "100%", background: color, borderRadius: 99, transition: "width .6s ease" }} />
      </div>
      <span style={{ fontSize: "0.72rem", fontWeight: 700, color: "#475569", minWidth: 32, textAlign: "right" }}>{pct}%</span>
    </div>
  );
}

/* ── Daily Trend sparkline ────────────────────────────────────────────────── */
function TrendChart({ data = [] }) {
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(today); d.setDate(d.getDate() - (13 - i));
    const key = d.toISOString().split("T")[0];
    const found = data.find(r => r.date === key);
    return { key, count: found?.count || 0, label: d.toLocaleDateString("en", { month: "short", day: "numeric" }) };
  });
  const max = Math.max(...days.map(d => d.count), 1);
  const [hovered, setHovered] = useState(null);
  return (
    <div style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 48 }}>
        {days.map((d, i) => (
          <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", height: "100%", position: "relative", cursor: "pointer" }}
            onMouseEnter={() => setHovered(i)} onMouseLeave={() => setHovered(null)}>
            <div style={{ width: "100%", borderRadius: "3px 3px 0 0", minHeight: 2,
              height: `${Math.max(d.count > 0 ? 12 : 2, (d.count / max) * 100)}%`,
              background: d.count > 0 ? "linear-gradient(to top, #4f46e5, #818cf8)" : "#e2e8f0",
              transition: "height .3s ease" }} />
            {hovered === i && d.count > 0 && (
              <div style={{ position: "absolute", bottom: "110%", background: "#0f172a", color: "#fff", fontSize: "0.65rem", fontWeight: 700, padding: "3px 8px", borderRadius: 6, whiteSpace: "nowrap", zIndex: 20, pointerEvents: "none" }}>
                {d.label}: {d.count}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── KPI Card ─────────────────────────────────────────────────────────────── */
function KpiCard({ label, value, sub, icon: Icon, color = "indigo" }) {
  const c = {
    indigo:  { bg: "bg-indigo-50",  text: "text-indigo-600",  border: "border-indigo-100"  },
    emerald: { bg: "bg-emerald-50", text: "text-emerald-600", border: "border-emerald-100" },
    rose:    { bg: "bg-rose-50",    text: "text-rose-600",    border: "border-rose-100"    },
    amber:   { bg: "bg-amber-50",   text: "text-amber-600",   border: "border-amber-100"   },
  }[color];
  return (
    <div className="card-enterprise p-5 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900 tracking-tight leading-none">{value ?? "—"}</p>
          {sub && <p className="text-xs text-slate-500 mt-1.5">{sub}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl ${c.bg} ${c.text} border ${c.border} flex items-center justify-center shrink-0`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

/* ── Record detail drawer ─────────────────────────────────────────────────── */
/* ── Record detail drawer ─────────────────────────────────────────────────── */
function RecordDrawer({ record, onClose, onDelete }) {
  if (!record) return null;
  const sc = STATUS_CONFIG[record.status] || STATUS_CONFIG.all;
  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" />
      <div className="w-full max-w-md bg-white h-full shadow-2xl overflow-y-auto flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900">Consent Record</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5 flex-1 space-y-5 text-sm">

          <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className={`badge ${sc.badge} text-xs`}>{sc.label}</span>
            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
              record.channel === 'portfolio' 
                ? 'bg-purple-50 text-purple-700 border-purple-200' 
                : 'bg-indigo-50 text-indigo-700 border-indigo-200'
            }`}>
              {record.channel === 'portfolio' ? '🌐 Portfolio' : '💼 CRM Platform'}
            </span>
            <span className="text-xs text-slate-500 ml-auto">{record.createdAt ? new Date(record.createdAt).toLocaleString() : "—"}</span>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Channel & Origin Isolation</p>
            <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Channel:</span>
                <span className="font-semibold text-slate-800 capitalize">{record.channel || 'crm'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Source:</span>
                <span className="font-mono text-slate-700 text-[11px]">{record.source || 'default'}</span>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Cookie Categories</p>
            <div className="space-y-2">
              {[
                { key: "necessary",  label: "Strictly Necessary", color: "#059669" },
                { key: "functional", label: "Functional",          color: "#d97706" },
                { key: "analytics",  label: "Analytics",           color: "#0284c7" },
                { key: "marketing",  label: "Marketing",           color: "#7c3aed" },
              ].map(cat => (
                <div key={cat.key} className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="font-medium text-slate-700 text-xs">{cat.label}</span>
                  {record.preferences?.[cat.key]
                    ? <span className="badge badge-emerald text-[10px]">✓ Accepted</span>
                    : <span className="badge badge-slate text-[10px]">✗ Declined</span>}
                </div>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Geo & Device</p>
            <div className="space-y-1.5 text-xs text-slate-600">
              <div className="flex gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /><span>{[record.city, record.region, record.country].filter(Boolean).join(", ") || "Not recorded"}</span></div>
              <div className="flex gap-2"><Globe className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /><span className="truncate">{record.language || "—"}</span></div>
              <div className="flex gap-2"><FileText className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" /><span className="truncate">{record.pageUrl || "—"}</span></div>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Legal Metadata</p>
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-xs text-indigo-700">
              <p className="font-semibold mb-1">Legal Basis</p>
              <p>{record.legalBasis || "GDPR Art.7 / DPDP Act 2023 §6 / CCPA §1798.120"}</p>
              <p className="mt-1">Version: {record.consentVersion || "1.0"}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">User Agent</p>
            <p className="text-xs text-slate-500 break-all">{record.userAgent || "—"}</p>
          </div>
        </div>

        <div className="p-5 border-t border-slate-100">
          <button onClick={() => onDelete(record.id)} className="btn-danger w-full flex items-center justify-center gap-2 text-sm">
            <Trash2 className="w-4 h-4" />
            Erase Record (GDPR Art.17)
          </button>
          <p className="text-[10px] text-slate-400 text-center mt-2">Permanent deletion — cannot be undone</p>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function CookieConsentManager() {
  const [analytics, setAnalytics] = useState(null);
  const [records, setRecords]     = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading]     = useState(true);
  const [aLoading, setALoading]   = useState(true);
  const [error, setError]         = useState(null);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [channelFilter, setChannelFilter]   = useState("all");
  const [statusFilter, setStatusFilter]     = useState("all_status");
  const [search, setSearch]                 = useState("");
  const [page, setPage]                     = useState(1);
  const [deleting, setDeleting]             = useState(null);
  const [lastRefresh, setLastRefresh]       = useState(null);

  const loadAnalytics = useCallback(async () => {
    setALoading(true);
    try {
      const params = {};
      if (channelFilter !== "all") params.channel = channelFilter;
      setAnalytics(await api.getCookieAnalytics(params));
    } catch {}
    setALoading(false);
  }, [channelFilter]);

  const loadRecords = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = { page, limit: 15 };
      if (channelFilter !== "all") params.channel = channelFilter;
      if (statusFilter !== "all_status") params.status = statusFilter;
      if (search.trim()) params.search = search.trim();
      const res = await api.getCookieConsents(params);
      setRecords(res.records || []);
      setPagination(res.pagination || { page: 1, totalPages: 1, total: 0 });
      setLastRefresh(new Date());
    } catch (err) {
      setError(err.message || "Failed to load consent records.");
    } finally {
      setLoading(false);
    }
  }, [page, channelFilter, statusFilter, search]);

  useEffect(() => { loadAnalytics(); }, [loadAnalytics]);
  useEffect(() => { loadRecords(); }, [loadRecords]);

  const handleDelete = async (id) => {
    if (!window.confirm("Permanently erase this consent record? (GDPR Art.17)")) return;
    setDeleting(id);
    try {
      await api.deleteConsentRecord(id);
      setSelectedRecord(null);
      loadRecords(); loadAnalytics();
    } catch (err) {
      alert("Failed to erase: " + err.message);
    } finally { setDeleting(null); }
  };

  const ov = analytics?.overview || {};
  const cats = analytics?.categoryAcceptance || {};
  const channelBreakdown = analytics?.channelBreakdown || [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" /><span>Cookie Compliance &amp; Channel Isolation</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Cookie Consent Manager</h1>
          <p className="text-sm text-slate-500 mt-0.5">GDPR · DPDP Act 2023 · CCPA — consent audit trail separated by channel (Portfolio vs CRM SaaS).</p>
        </div>
        <div className="flex items-center gap-3">
          {lastRefresh && <span className="text-xs text-slate-400 hidden sm:block">Updated {lastRefresh.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>}
          <button onClick={() => { loadAnalytics(); loadRecords(); }} className="btn-secondary text-xs font-semibold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading || aLoading ? "animate-spin" : ""}`} />Refresh
          </button>
        </div>
      </div>

      {/* Channel Isolation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1">Channel Filter:</span>
          <div className="inline-flex p-1 bg-slate-100 rounded-lg gap-1">
            <button
              onClick={() => { setChannelFilter("all"); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                channelFilter === "all"
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              All Channels ({ov.total || 0})
            </button>
            <button
              onClick={() => { setChannelFilter("portfolio"); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                channelFilter === "portfolio"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-purple-700"
              }`}
            >
              <span>🌐</span> Portfolio Website ({channelBreakdown.find(c => c.channel === 'portfolio')?.count || 0})
            </button>
            <button
              onClick={() => { setChannelFilter("crm"); setPage(1); }}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-1.5 ${
                channelFilter === "crm"
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-indigo-700"
              }`}
            >
              <span>💼</span> CRM Platform ({channelBreakdown.find(c => c.channel === 'crm')?.count || 0})
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time channel differentiation active</span>
        </div>
      </div>

      {/* Compliance framework info */}
      <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-indigo-50 border border-indigo-100 text-xs">
        <Info className="w-4 h-4 text-indigo-500 shrink-0" />
        <span className="text-indigo-700 font-medium">Legal frameworks:</span>
        {["GDPR Art.6, 7 & 17", "India DPDP Act 2023 §6, 12", "CCPA §1798.100–120", "IAB TCF v2.2"].map(f => (
          <span key={f} className="px-2 py-0.5 rounded-full bg-white border border-indigo-200 text-indigo-700 font-semibold">{f}</span>
        ))}
        <span className="text-slate-500 ml-auto hidden md:block">Records stored in MongoDB Atlas · Multi-channel isolation</span>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Consents" value={aLoading ? "…" : ov.total?.toLocaleString()} sub={channelFilter === 'all' ? "All channels combined" : `Channel: ${channelFilter}`} icon={ShieldCheck} color="indigo" />
        <KpiCard label="Accept Rate" value={aLoading ? "…" : `${ov.acceptRate ?? 0}%`} sub={`${ov.last7 ?? 0} this week`} icon={TrendingUp} color="emerald" />
        <KpiCard label="Reject Rate" value={aLoading ? "…" : `${ov.rejectRate ?? 0}%`} sub="Reject All responses" icon={XCircle} color="rose" />
        <KpiCard label="This Month" value={aLoading ? "…" : ov.last30?.toLocaleString()} sub="30-day consent events" icon={BarChart3} color="amber" />
      </div>

      {/* Category Acceptance + Trend + Country Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Category acceptance */}
        <div className="card-enterprise p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">Category Acceptance</h2>
          <p className="text-xs text-slate-500 mb-4">% of visitors who enabled each category</p>
          {aLoading ? <div className="h-24 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div> : (
            <div className="space-y-3">
              {[
                { key: "functional", label: "Functional",  color: "#d97706" },
                { key: "analytics",  label: "Analytics",   color: "#0284c7" },
                { key: "marketing",  label: "Marketing",   color: "#7c3aed" },
              ].map(c => (
                <div key={c.key}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="font-medium text-slate-700">{c.label}</span>
                    <span className="text-slate-500">{cats[c.key]?.count ?? 0} users</span>
                  </div>
                  <MiniBar pct={cats[c.key]?.pct ?? 0} color={c.color} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Daily trend */}
        <div className="card-enterprise p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">14-Day Consent Trend</h2>
          <p className="text-xs text-slate-500 mb-4">Daily consent events</p>
          {aLoading ? <div className="h-12 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div> : (
            <TrendChart data={analytics?.dailyTrend || []} />
          )}
          <div className="mt-3 pt-3 border-t border-slate-100 flex gap-3 text-xs">
            {(analytics?.statusBreakdown || []).map(s => {
              const sc = STATUS_CONFIG[s.status] || {};
              return <span key={s.status} className={`badge ${sc.badge || "badge-slate"} text-[10px]`}>{sc.label || s.status}: {s.count}</span>;
            })}
          </div>
        </div>

        {/* Top countries */}
        <div className="card-enterprise p-6">
          <h2 className="text-sm font-bold text-slate-900 mb-0.5">Top Countries</h2>
          <p className="text-xs text-slate-500 mb-4">Consent volume — last 30 days</p>
          {aLoading ? <div className="h-24 flex items-center justify-center"><Loader2 className="w-5 h-5 animate-spin text-slate-300" /></div> : (
            <div className="space-y-2.5">
              {(analytics?.topCountries || []).slice(0, 6).map((c, i) => {
                const maxCount = analytics.topCountries[0]?.count || 1;
                return (
                  <div key={i} className="flex items-center gap-3">
                    <span className="text-xs font-medium text-slate-600 w-24 truncate shrink-0">{c.country || "Unknown"}</span>
                    <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500" style={{ width: `${(c.count / maxCount) * 100}%` }} />
                    </div>
                    <span className="text-xs font-bold text-slate-700 w-8 text-right shrink-0">{c.count}</span>
                  </div>
                );
              })}
              {!analytics?.topCountries?.length && <p className="text-xs text-slate-400 text-center py-4">No geo data yet</p>}
            </div>
          )}
        </div>
      </div>

      {/* Records Table */}
      <div className="card-enterprise">
        {/* Table header / filters */}
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Consent Audit Log</h2>
            <p className="text-xs text-slate-500 mt-0.5">{pagination.total?.toLocaleString()} records · Channel: <strong className="capitalize">{channelFilter}</strong></p>
          </div>
          <div className="flex items-center gap-2 ml-auto flex-wrap">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                className="input-field pl-8 pr-3 py-2 text-xs w-44"
                placeholder="Search channel, country, URL…"
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            <select
              className="input-field py-2 text-xs pr-8"
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="all_status">All Statuses</option>
              <option value="all">Accept All</option>
              <option value="essential">Essential Only</option>
              <option value="rejected">Reject All</option>
              <option value="custom">Custom</option>
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="m-5 flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" /><p>{error}</p>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4 font-semibold">Status</th>
                <th className="py-3 px-4 font-semibold">Channel</th>
                <th className="py-3 px-4 font-semibold hidden md:table-cell">Country</th>
                <th className="py-3 px-4 font-semibold hidden lg:table-cell">Categories</th>
                <th className="py-3 px-4 font-semibold hidden sm:table-cell">Page</th>
                <th className="py-3 px-4 font-semibold text-right">Date</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr><td colSpan={7} className="py-12 text-center"><Loader2 className="w-6 h-6 animate-spin text-slate-300 mx-auto" /></td></tr>
              ) : records.length === 0 ? (
                <tr><td colSpan={7} className="py-12 text-center text-slate-400">No consent records found for this channel</td></tr>
              ) : records.map(r => {
                const sc = STATUS_CONFIG[r.status] || STATUS_CONFIG.all;
                const prefs = r.preferences || {};
                const isPortfolio = r.channel === 'portfolio';
                return (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3 px-4">
                      <span className={`badge ${sc.badge} text-[10px]`}>{sc.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border ${
                        isPortfolio 
                          ? 'bg-purple-50 text-purple-700 border-purple-200' 
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}>
                        {isPortfolio ? '🌐 Portfolio' : '💼 CRM Platform'}
                      </span>
                    </td>
                    <td className="py-3 px-4 hidden md:table-cell">
                      <div className="flex items-center gap-1.5">
                        {r.countryCode && <span>{r.countryCode}</span>}
                        <span className="text-slate-600">{r.country || "—"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden lg:table-cell">
                      <div className="flex gap-1">
                        {["functional","analytics","marketing"].map(k => (
                          <span key={k} className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${prefs[k] ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-slate-100 text-slate-400 border-slate-200"}`}>
                            {k.slice(0,3).toUpperCase()}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <span className="text-slate-500 truncate max-w-[140px] block" title={r.pageUrl}>
                        {r.pageUrl ? (r.pageUrl.startsWith('http') ? new URL(r.pageUrl).pathname : r.pageUrl) : "—"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400 whitespace-nowrap">
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en", { day: "numeric", month: "short", year: "2-digit" }) : "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setSelectedRecord(r)} className="w-7 h-7 rounded-lg hover:bg-indigo-50 flex items-center justify-center text-indigo-500 hover:text-indigo-700 transition-colors" title="View details">
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => handleDelete(r.id)} disabled={deleting === r.id} className="w-7 h-7 rounded-lg hover:bg-rose-50 flex items-center justify-center text-rose-400 hover:text-rose-600 transition-colors" title="Erase (GDPR Art.17)">
                          {deleting === r.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Page {pagination.page} of {pagination.totalPages}</span>
            <div className="flex gap-1">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center">
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setPage(p => Math.min(pagination.totalPages, p + 1))} disabled={page >= pagination.totalPages}
                className="w-8 h-8 rounded-lg border border-slate-200 hover:bg-slate-50 disabled:opacity-40 flex items-center justify-center">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over detail drawer */}
      <RecordDrawer record={selectedRecord} onClose={() => setSelectedRecord(null)} onDelete={handleDelete} />
    </div>
  );
}
