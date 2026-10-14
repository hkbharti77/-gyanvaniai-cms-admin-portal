import React, { useState, useEffect, useCallback } from "react";
import { api } from "../services/api";
import {
  Palette, RefreshCw, Lock, Globe, Check, AlertCircle,
  Loader2, CheckCircle2, Sparkles, Sun, Moon, Zap,
  ArrowUpRight, Clock, User, Info,
} from "lucide-react";

/* ── Theme swatch colours (mirrors ThemeContext.jsx) ─────────────────────── */
const THEME_META = {
  midnight: { gradient: "linear-gradient(135deg,#070b12 0%,#0d1628 100%)", ring: "#2dd4bf" },
  aurora:   { gradient: "linear-gradient(135deg,#031816 0%,#062e22 100%)", ring: "#10b981" },
  slate:    { gradient: "linear-gradient(135deg,#0f172a 0%,#1e2d44 100%)", ring: "#38bdf8" },
  quantum:  { gradient: "linear-gradient(135deg,#021820 0%,#04303e 100%)", ring: "#22d3ee" },
  amber:    { gradient: "linear-gradient(135deg,#140d06 0%,#2a1a0a 100%)", ring: "#f59e0b" },
  light:    { gradient: "linear-gradient(135deg,#f0f3f6 0%,#e2e8f0 100%)", ring: "#0f766e" },
  sapphire: { gradient: "linear-gradient(135deg,#07101f 0%,#0f2040 100%)", ring: "#60a5fa" },
};

/* ── Theme Card ───────────────────────────────────────────────────────────── */
function ThemeCard({ theme, selected, disabled, onClick, todayScheduled }) {
  const meta = THEME_META[theme.id] || {};
  return (
    <button
      type="button"
      onClick={() => onClick(theme.id)}
      disabled={disabled}
      className="relative group text-left transition-all duration-200 rounded-2xl overflow-hidden border-2 focus:outline-none"
      style={{
        borderColor: selected ? theme.accent : "transparent",
        boxShadow: selected ? `0 0 0 3px ${theme.accent}28, 0 8px 24px rgba(0,0,0,0.15)` : "0 2px 8px rgba(0,0,0,0.06)",
      }}
    >
      {/* Colour preview bar */}
      <div className="h-16 w-full" style={{ background: meta.gradient || theme.color }}>
        <div className="flex items-center gap-1.5 p-3">
          <span className="w-3 h-3 rounded-full border-2 border-white/30" style={{ background: theme.color }} />
          <span className="w-3 h-3 rounded-full border-2 border-white/30" style={{ background: theme.accent }} />
          {todayScheduled && (
            <span className="ml-auto text-[9px] font-bold bg-white/20 text-white px-1.5 py-0.5 rounded-full border border-white/30 backdrop-blur-sm">TODAY</span>
          )}
        </div>
      </div>

      {/* Info section */}
      <div className="p-3 bg-white border-t border-slate-100">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-bold text-slate-900 leading-tight">{theme.name}</p>
            <p className="text-[10px] text-slate-500 mt-0.5">{theme.description}</p>
          </div>
          {selected && <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" style={{ color: theme.accent }} />}
        </div>
      </div>
    </button>
  );
}

/* ── Schedule Day Card ────────────────────────────────────────────────────── */
function ScheduleCard({ item, themes, isToday, index }) {
  const t = themes.find(t => t.id === item.themeId) || {};
  const meta = THEME_META[item.themeId] || {};
  return (
    <div className={`rounded-xl overflow-hidden border-2 transition-all ${isToday ? "border-indigo-400 shadow-lg shadow-indigo-100" : "border-slate-200"}`}>
      <div className="h-8 w-full" style={{ background: meta.gradient || "#0f172a" }} />
      <div className="p-2.5 bg-white">
        <p className={`text-[10px] font-bold uppercase tracking-wider ${isToday ? "text-indigo-600" : "text-slate-500"}`}>
          {item.day} {isToday ? "· Active Today" : ""}
        </p>
        <p className="text-xs font-semibold text-slate-800 mt-0.5 leading-tight">{item.name}</p>
      </div>
    </div>
  );
}

/* ── Main Page ────────────────────────────────────────────────────────────── */
export default function WebsiteThemeManager() {
  const [data, setData]               = useState(null);
  const [loading, setLoading]         = useState(true);
  const [saving, setSaving]           = useState(false);
  const [error, setError]             = useState(null);
  const [toast, setToast]             = useState(null);
  const [themeMode, setThemeMode]     = useState("fixed");
  const [fixedTheme, setFixedTheme]   = useState("midnight");
  const [dirty, setDirty]             = useState(false);

  const todayIndex = new Date().getDay();

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const res = await api.getThemeSettings();
      setData(res);
      setThemeMode(res.themeMode || "fixed");
      setFixedTheme(res.fixedTheme || "midnight");
      setDirty(false);
    } catch (err) {
      setError(err.message || "Failed to load theme settings.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleModeChange = (mode) => {
    setThemeMode(mode);
    setDirty(true);
  };

  const handleThemeSelect = (themeId) => {
    setFixedTheme(themeId);
    setThemeMode("fixed");
    setDirty(true);
  };

  const handlePublish = async () => {
    setSaving(true);
    try {
      await api.updateThemeSettings({ themeMode, fixedTheme });
      setDirty(false);
      showToast(
        themeMode === "auto"
          ? "Auto Daily Rotation enabled — all visitors will see today's scheduled theme!"
          : `Theme locked to "${data?.themes?.find(t => t.id === fixedTheme)?.name}" for all website visitors!`,
        "success"
      );
      load();
    } catch (err) {
      showToast(err.message || "Failed to publish theme.", "error");
    } finally {
      setSaving(false);
    }
  };

  const themes        = data?.themes        || [];
  const dailySchedule = data?.dailySchedule || [];
  const todayItem     = dailySchedule[todayIndex] || {};
  const activeThemeObj = themes.find(t => t.id === (themeMode === "auto" ? todayItem.themeId : fixedTheme)) || {};

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-100/80 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Palette className="w-3.5 h-3.5" /><span>Website Appearance</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Enterprise Theme Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Control the live visual theme shown to all website visitors in real-time.</p>
        </div>
        <div className="flex items-center gap-3">
          {data?.updatedAt && (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>Published {new Date(data.updatedAt).toLocaleString()}</span>
            </div>
          )}
          <button onClick={load} disabled={loading} className="btn-secondary text-xs font-semibold flex items-center gap-2">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />Refresh
          </button>
          <button onClick={handlePublish} disabled={saving || loading || !dirty} className="btn-primary text-xs font-semibold flex items-center gap-2">
            {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Globe className="w-3.5 h-3.5" />}
            {saving ? "Publishing…" : "Publish Live"}
          </button>
        </div>
      </div>

      {/* Toast */}
      {toast && (
        <div className={`flex items-center gap-3 p-4 rounded-xl border text-sm font-medium ${toast.type === "error" ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-emerald-50 border-emerald-200 text-emerald-700"}`}>
          {toast.type === "error" ? <AlertCircle className="w-4 h-4 shrink-0" /> : <CheckCircle2 className="w-4 h-4 shrink-0" />}
          <span>{toast.msg}</span>
        </div>
      )}

      {/* Error */}
      {error && !loading && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div><p className="font-semibold">Failed to load theme settings</p><p className="text-xs mt-0.5 text-rose-600">{error}</p></div>
          <button onClick={load} className="ml-auto text-xs font-semibold hover:underline shrink-0">Retry</button>
        </div>
      )}

      {/* Active status banner */}
      {!loading && data && (
        <div className="flex items-center gap-3 p-4 rounded-xl border"
          style={{ background: `${activeThemeObj.accent || "#4f46e5"}12`, borderColor: `${activeThemeObj.accent || "#4f46e5"}30` }}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: activeThemeObj.accent || "#4f46e5" }}>
            <Globe className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {themeMode === "auto"
                ? <>Auto Daily Rotation Active — Today: <span style={{ color: activeThemeObj.accent }}>{todayItem.name}</span></>
                : <>Fixed Theme Active: <span style={{ color: activeThemeObj.accent }}>{activeThemeObj.name}</span></>}
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              {themeMode === "auto"
                ? "Every visitor sees today's scheduled theme. Rotates automatically at midnight."
                : "All visitors across all devices and pages see this theme."}
              {data.updatedBy && <> · Last changed by <strong>{data.updatedBy}</strong></>}
            </p>
          </div>
          {dirty && (
            <span className="ml-auto text-xs font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-1 rounded-full shrink-0">
              Unsaved changes
            </span>
          )}
        </div>
      )}

      {/* Mode Selection */}
      <div className="grid grid-cols-2 gap-4">
        {[
          { mode: "auto",  label: "Auto Daily Rotation",  desc: "7 themes rotate automatically — one per day of the week.", icon: RefreshCw  },
          { mode: "fixed", label: "Fixed Enterprise Theme", desc: "Lock one theme for all visitors across all pages.",          icon: Lock },
        ].map(m => (
          <button
            key={m.mode}
            type="button"
            disabled={loading}
            onClick={() => handleModeChange(m.mode)}
            className={`card-enterprise p-5 text-left transition-all duration-200 border-2 ${themeMode === m.mode ? "border-indigo-400 bg-indigo-50/50" : "border-transparent hover:border-slate-300"}`}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${themeMode === m.mode ? "bg-indigo-600" : "bg-slate-100"}`}>
                <m.icon className={`w-4 h-4 ${themeMode === m.mode ? "text-white" : "text-slate-500"}`} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-slate-900">{m.label}</p>
              </div>
              {themeMode === m.mode && <CheckCircle2 className="w-5 h-5 text-indigo-600 shrink-0" />}
            </div>
            <p className="text-xs text-slate-500">{m.desc}</p>
          </button>
        ))}
      </div>

      {/* Auto Rotation Schedule */}
      {themeMode === "auto" && !loading && (
        <div className="card-enterprise p-6">
          <div className="flex items-center gap-2 mb-4">
            <RefreshCw className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900">Weekly Rotation Schedule</h2>
            <span className="ml-2 text-xs text-slate-500">Automatically switches at 12:00 AM midnight</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            {dailySchedule.map((item, idx) => (
              <ScheduleCard key={item.day} item={item} themes={themes} isToday={idx === todayIndex} index={idx} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2 text-xs text-slate-500">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Schedule is fixed by design. Each day of the week maps to a distinct enterprise theme. You can change to Fixed mode to override.</span>
          </div>
        </div>
      )}

      {/* Fixed Theme Picker */}
      {themeMode === "fixed" && (
        <div className="card-enterprise p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Select Fixed Enterprise Theme</h2>
              <p className="text-xs text-slate-500 mt-0.5">This theme will be shown to all visitors across all pages and devices.</p>
            </div>
            {loading && <Loader2 className="w-4 h-4 animate-spin text-slate-300" />}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
            {themes.map(t => (
              <ThemeCard
                key={t.id}
                theme={t}
                selected={fixedTheme === t.id}
                disabled={saving || loading}
                onClick={handleThemeSelect}
                todayScheduled={dailySchedule[todayIndex]?.themeId === t.id}
              />
            ))}
          </div>
        </div>
      )}

      {/* How it works */}
      <div className="card-enterprise p-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4">How Website Theme Control Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: "1", title: "Admin Publishes", desc: 'Click "Publish Live" above to save theme settings to the database.', color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
            { icon: "2", title: "Database Syncs", desc: "Settings are stored in MongoDB and broadcast via Firestore real-time listeners.", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
            { icon: "3", title: "Visitors See Changes", desc: "All visitors instantly see the new theme — no page reload or deployment needed.", color: "bg-amber-50 text-amber-600 border-amber-100" },
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold border shrink-0 ${step.color}`}>{step.icon}</div>
              <div>
                <p className="text-sm font-semibold text-slate-900">{step.title}</p>
                <p className="text-xs text-slate-500 mt-0.5">{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
