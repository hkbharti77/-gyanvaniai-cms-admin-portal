import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  Users,
  Eye,
  TrendingUp,
  TrendingDown,
  Calendar,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  ShieldCheck,
  ExternalLink,
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  Lock,
  Sparkles,
  Compass,
} from 'lucide-react';

/* ── Interactive Trend Chart ──────────────────────────────────────────────── */
function VisitorTrendChart({ data = [] }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No visitor data recorded in this timeframe yet.
      </div>
    );
  }

  const maxVisitors = Math.max(...data.map((d) => d.visitors || 0), 5);
  const maxViews = Math.max(...data.map((d) => d.pageviews || 0), 10);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-end gap-6 text-xs font-semibold">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
          <span className="text-slate-700">Unique Visitors</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-teal-400 inline-block" />
          <span className="text-slate-700">Total Pageviews</span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="flex items-end gap-2 md:gap-4 h-56 pt-6 pb-2 border-b border-slate-200">
        {data.map((day, idx) => {
          const visitorHeight = Math.max(8, (day.visitors / maxViews) * 100);
          const viewsHeight = Math.max(8, (day.pageviews / maxViews) * 100);
          const isToday = idx === data.length - 1;

          return (
            <div key={day.date} className="flex-1 flex flex-col items-center h-full justify-end group relative">
              {/* Tooltip on hover */}
              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] rounded-lg p-2 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                <div className="font-bold text-slate-200">{day.label} ({day.date})</div>
                <div className="text-indigo-300">👥 {day.visitors} unique visitors</div>
                <div className="text-teal-300">📄 {day.pageviews} pageviews</div>
              </div>

              {/* Bars Pair */}
              <div className="w-full flex items-end justify-center gap-1 h-full">
                {/* Unique Visitors Bar */}
                <div
                  className={`w-full max-w-[18px] rounded-t-sm transition-all duration-500 ${
                    isToday ? 'bg-indigo-600 ring-2 ring-indigo-400/30' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ height: `${visitorHeight}%` }}
                />
                {/* Pageviews Bar */}
                <div
                  className="w-full max-w-[18px] rounded-t-sm bg-teal-400/80 hover:bg-teal-400 transition-all duration-500"
                  style={{ height: `${viewsHeight}%` }}
                />
              </div>

              {/* Day Label */}
              <span className={`text-[11px] mt-2 font-medium truncate ${isToday ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                {day.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function VisitorAnalytics() {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChannel, setSelectedChannel] = useState('all');
  const [selectedRange, setSelectedRange] = useState('7');

  const [data, setData] = useState({
    summary: {
      today: { visitors: 0, pageviews: 0, date: '' },
      yesterday: { visitors: 0, pageviews: 0, date: '' },
      growth: { visitorsPercent: 0, pageviewsPercent: 0, isVisitorPositive: true, isPageviewPositive: true },
      totalAllTimePageviews: 0,
      consentRate: 100,
    },
    dailyTrend: [],
    topPages: [],
    topReferrers: [],
    deviceBreakdown: [],
    channelBreakdown: [],
    externalTools: {},
    compliance: {},
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const res = await api.getVisitorAnalytics({
        channel: selectedChannel,
        days: selectedRange,
      });
      if (res) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load visitor analytics:', err);
      setError(err.message || 'Failed to load visitor analytics.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedChannel, selectedRange]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data.summary || {};
  const today = summary.today || {};
  const yesterday = summary.yesterday || {};
  const growth = summary.growth || {};

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>DPDP Act 2023 &amp; GDPR Compliant Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Visitor Traffic &amp; Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live real-time comparison of today&apos;s audience versus yesterday, cookieless unique visitor telemetry, and external dashboard integration.
          </p>
        </div>

        {/* Channel & Time Filter Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Channel Selector */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
            <button
              onClick={() => setSelectedChannel('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChannel === 'all'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Sites
            </button>
            <button
              onClick={() => setSelectedChannel('crm')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChannel === 'crm'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              SaaS CRM
            </button>
            <button
              onClick={() => setSelectedChannel('portfolio')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                selectedChannel === 'portfolio'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Portfolio
            </button>
          </div>

          {/* Timeframe Selector */}
          <select
            value={selectedRange}
            onChange={(e) => setSelectedRange(e.target.value)}
            className="text-xs font-semibold border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="7">Last 7 Days</option>
            <option value="14">Last 14 Days</option>
            <option value="30">Last 30 Days</option>
          </select>

          {/* Refresh Action */}
          <button
            onClick={() => {
              setRefreshing(true);
              loadData(true);
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
            title="Refresh Visitor Stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadData()} className="text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* ── KPI Cards: Today vs Yesterday ──────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today's Unique Visitors */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visitors Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {today.visitors ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">unique individuals</span>
          </div>

          {/* Growth Comparison Pill vs Yesterday */}
          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            {growth.isVisitorPositive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                {growth.visitorsPercent > 0 ? `+${growth.visitorsPercent}%` : '0%'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <TrendingDown className="w-3.5 h-3.5" />
                {growth.visitorsPercent}%
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs yesterday ({yesterday.visitors ?? 0})</span>
          </div>
        </div>

        {/* Card 2: Yesterday's Unique Visitors */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visitors Yesterday
            </span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-700">
              {yesterday.visitors ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">unique visitors</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            Generated {yesterday.pageviews ?? 0} total pageviews
          </div>
        </div>

        {/* Card 3: Today's Pageviews */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Pageviews Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600">
              <Eye className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-teal-600">
              {today.pageviews ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">views today</span>
          </div>

          <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold">
            {growth.isPageviewPositive ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" />
                {growth.pageviewsPercent > 0 ? `+${growth.pageviewsPercent}%` : '0%'}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                <TrendingDown className="w-3.5 h-3.5" />
                {growth.pageviewsPercent}%
              </span>
            )}
            <span className="text-slate-500 text-[11px]">vs yesterday ({yesterday.pageviews ?? 0})</span>
          </div>
        </div>

        {/* Card 4: DPDP & GDPR Compliance Status */}
        <div className="p-5 bg-gradient-to-br from-emerald-50/80 to-white border border-emerald-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-800">
              Privacy Compliance
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
              <Lock className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-xl font-bold text-emerald-700">100% Compliant</span>
          </div>

          <div className="mt-2 space-y-1 text-[11px] text-emerald-800/80 font-medium leading-tight">
            <div>✓ Cookieless Telemetry (Zero PII)</div>
            <div>✓ Auto 90-Day Retention Purge</div>
            <div>✓ Statutory Consent Rate: <strong>{summary.consentRate ?? 100}%</strong></div>
          </div>
        </div>
      </div>

      {/* ── Daily Trend Chart ──────────────────────────────────────────────── */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Visitor Traffic Trajectory ({data.dailyTrend?.length || 7} Days)
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily distinct visitor hashes vs total HTTP pageview hits.
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            All-time logged views: <strong>{summary.totalAllTimePageviews || 0}</strong>
          </div>
        </div>

        <VisitorTrendChart data={data.dailyTrend} />
      </div>

      {/* ── Breakdown Grids: Top Pages, Referrers, Devices ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            Top Visited Pages (Last 30 Days)
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Page Path</th>
                  <th className="py-2.5 px-3 text-right">Unique Visitors</th>
                  <th className="py-2.5 px-3 text-right">Total Views</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(!data.topPages || data.topPages.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="py-6 text-center text-slate-400 font-sans">
                      No pageviews logged yet.
                    </td>
                  </tr>
                ) : (
                  data.topPages.map((page, i) => (
                    <tr key={page.path || i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2">
                        <span className="text-slate-400 text-[10px] w-4">{i + 1}.</span>
                        <span className="truncate max-w-xs md:max-w-md" title={page.path}>
                          {page.path}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                        {page.visitors}
                      </td>
                      <td className="py-2.5 px-3 text-right text-slate-600 font-bold">
                        {page.views}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Sources & Devices */}
        <div className="space-y-6">
          {/* Top Referrers */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Compass className="w-4 h-4 text-teal-600" />
              Traffic Sources / Referrers
            </h3>

            <div className="space-y-2 pt-1 text-xs">
              {(!data.topReferrers || data.topReferrers.length === 0) ? (
                <div className="text-slate-400 py-3 text-center">No external referrals recorded.</div>
              ) : (
                data.topReferrers.map((r, i) => (
                  <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                    <span className="font-medium text-slate-700 truncate max-w-[180px]" title={r.referrer}>
                      {r.referrer}
                    </span>
                    <span className="font-bold text-slate-900 font-mono">{r.count} hits</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Device Breakdown */}
          <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Monitor className="w-4 h-4 text-indigo-600" />
              Visitor Device Form Factor
            </h3>

            <div className="space-y-2 pt-1 text-xs">
              {(!data.deviceBreakdown || data.deviceBreakdown.length === 0) ? (
                <div className="text-slate-400 py-3 text-center">No device telemetry recorded.</div>
              ) : (
                data.deviceBreakdown.map((d, i) => {
                  const Icon = d.device === 'mobile' ? Smartphone : (d.device === 'tablet' ? Tablet : Monitor);
                  return (
                    <div key={i} className="flex items-center justify-between py-1.5 border-b border-slate-100 last:border-0">
                      <div className="flex items-center gap-2 font-medium text-slate-700 capitalize">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <span>{d.device || 'Desktop'}</span>
                      </div>
                      <span className="font-bold text-slate-900 font-mono">{d.count} views</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── External Analytics Command Center ─────────────────────────────── */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>External Analytics Hub</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Integrated Third-Party Analytics Tools
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Launch directly into your Google Analytics 4, Cloudflare, and Vercel consoles.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* GA4 */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Google Analytics 4</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Connected
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Measurement ID: <strong className="text-amber-300">G-RN6FQWDQ6M</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Google Consent Mode v2 active. Tracks funnel conversions, pageviews, and acquisition channels.
            </p>
            <a
              href="https://analytics.google.com/analytics/web/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Open GA4 Console</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Cloudflare */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Cloudflare Web Analytics</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Cookieless Beacon
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300 truncate" title="e68d0475ffde4e0ba1f1c7e1250d9e69">
              Token: <strong className="text-amber-300">e68d0475ff...</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Edge-level performance, Core Web Vitals, and aggregate privacy-preserving browser telemetry.
            </p>
            <a
              href="https://dash.cloudflare.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Open Cloudflare Dash</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Vercel */}
          <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">Vercel Web Analytics</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Active
              </span>
            </div>
            <div className="text-xs font-mono text-slate-300">
              Module: <strong className="text-amber-300">@vercel/analytics</strong>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Real-time serverless telemetry, deployment speed insights, and funnel event tracking.
            </p>
            <a
              href="https://vercel.com/dashboard"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-1.5 w-full py-2 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-lg transition-colors shadow-xs"
            >
              <span>Open Vercel Dash</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
