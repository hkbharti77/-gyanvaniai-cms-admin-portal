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
  RefreshCw,
  Clock,
  Layers,
  ArrowUpRight,
  Filter,
  Lock,
  Sparkles,
  Compass,
  MapPin,
  X,
  Search,
} from 'lucide-react';

/* ── Unicode Flag Helper from 2-letter ISO Country Code ────────────────────── */
function getFlagEmoji(countryCode) {
  if (!countryCode || countryCode === 'Unknown' || countryCode.length !== 2) return '🌐';
  try {
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  } catch {
    return '🌐';
  }
}

/* ── Interactive Trend Chart (Hourly or Daily) ────────────────────────────── */
function VisitorTrendChart({ data = [], isHourly = false }) {
  if (!data || data.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No visitor data recorded in this timeframe yet.
      </div>
    );
  }

  const maxViews = Math.max(...data.map((d) => d.pageviews || 0), 10);

  return (
    <div className="space-y-4">
      {/* Legend */}
      <div className="flex items-center justify-between text-xs font-semibold">
        <span className="text-slate-500 font-mono text-[11px]">
          {isHourly ? '⚡ Hourly Distribution (IST UTC+5:30)' : '📅 Daily Breakdown'}
        </span>
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-indigo-600 inline-block" />
            <span className="text-slate-700">Unique Visitors</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-xs bg-teal-400 inline-block" />
            <span className="text-slate-700">Pageviews</span>
          </div>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="flex items-end gap-1.5 md:gap-3 h-56 pt-6 pb-2 border-b border-slate-200 overflow-x-auto">
        {data.map((bucket, idx) => {
          const visitorHeight = Math.max(6, (bucket.visitors / maxViews) * 100);
          const viewsHeight = Math.max(6, (bucket.pageviews / maxViews) * 100);
          const isLatest = idx === data.length - 1;

          return (
            <div
              key={bucket.date || bucket.label || idx}
              className="flex-1 min-w-[28px] flex flex-col items-center h-full justify-end group relative"
            >
              {/* Tooltip on hover */}
              <div className="absolute -top-16 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-900 text-white text-[11px] rounded-lg p-2 pointer-events-none z-20 whitespace-nowrap shadow-lg">
                <div className="font-bold text-slate-200">{bucket.label} {bucket.date ? `(${bucket.date})` : ''}</div>
                <div className="text-indigo-300">👥 {bucket.visitors} unique visitors</div>
                <div className="text-teal-300">📄 {bucket.pageviews} pageviews</div>
              </div>

              {/* Bars Pair */}
              <div className="w-full flex items-end justify-center gap-0.5 md:gap-1 h-full">
                {/* Unique Visitors Bar */}
                <div
                  className={`w-full max-w-[16px] rounded-t-xs transition-all duration-500 ${
                    isLatest ? 'bg-indigo-600 ring-2 ring-indigo-400/30' : 'bg-indigo-500 hover:bg-indigo-600'
                  }`}
                  style={{ height: `${visitorHeight}%` }}
                />
                {/* Pageviews Bar */}
                <div
                  className="w-full max-w-[16px] rounded-t-xs bg-teal-400/80 hover:bg-teal-400 transition-all duration-500"
                  style={{ height: `${viewsHeight}%` }}
                />
              </div>

              {/* Label */}
              <span className={`text-[10px] mt-2 font-medium truncate w-full text-center ${isLatest ? 'text-indigo-600 font-bold' : 'text-slate-500'}`}>
                {bucket.label}
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

  // Filters State
  const [selectedChannel, setSelectedChannel] = useState('all'); // 'all' | 'crm' | 'portfolio'
  const [selectedTimeframe, setSelectedTimeframe] = useState('7d'); // '1h' | '6h' | '12h' | '24h' | 'today' | 'yesterday' | '7d' | '30d' | 'custom'
  const [selectedCountry, setSelectedCountry] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [countrySearch, setCountrySearch] = useState('');

  const [data, setData] = useState({
    timeframe: { key: '7d', label: 'Last 7 Days', isHourly: false },
    summary: {
      active: { visitors: 0, pageviews: 0 },
      today: { visitors: 0, pageviews: 0, date: '' },
      yesterday: { visitors: 0, pageviews: 0, date: '' },
      growth: { visitorsPercent: 0, pageviewsPercent: 0, isVisitorPositive: true, isPageviewPositive: true },
      totalAllTimePageviews: 0,
      consentRate: 100,
    },
    trend: [],
    topCountries: [],
    topPages: [],
    topReferrers: [],
    deviceBreakdown: [],
    externalTools: {},
    compliance: {},
  });

  const loadData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);
    try {
      const params = {
        channel: selectedChannel,
        timeframe: selectedTimeframe,
        country: selectedCountry,
      };

      if (selectedTimeframe === 'custom' && startDate && endDate) {
        params.startDate = startDate;
        params.endDate = endDate;
      }

      const res = await api.getVisitorAnalytics(params);
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
  }, [selectedChannel, selectedTimeframe, selectedCountry, startDate, endDate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const summary = data.summary || {};
  const active = summary.active || { visitors: 0, pageviews: 0 };
  const today = summary.today || {};
  const yesterday = summary.yesterday || {};
  const growth = summary.growth || {};

  const filteredCountries = (data.topCountries || []).filter((c) => {
    if (!countrySearch) return true;
    const s = countrySearch.toLowerCase();
    return c.country.toLowerCase().includes(s) || c.countryCode.toLowerCase().includes(s);
  });

  const TIMEFRAME_OPTIONS = [
    { key: '1h', label: '1 Hour' },
    { key: '6h', label: '6 Hours' },
    { key: '12h', label: '12 Hours' },
    { key: '24h', label: '24 Hours' },
    { key: 'today', label: 'Today' },
    { key: 'yesterday', label: 'Yesterday' },
    { key: '7d', label: '1 Week' },
    { key: '30d', label: '1 Month' },
    { key: 'custom', label: 'Custom' },
  ];

  return (
    <div className="space-y-6 md:space-y-8 animate-fade-in pb-12">
      {/* ── Page Header ────────────────────────────────────────────────────── */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
            <span>DPDP Act 2023 &amp; GDPR Compliant Telemetry</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
            Visitor Traffic &amp; Geography Analytics
          </h1>
          <p className="text-sm text-slate-500 mt-1 max-w-2xl">
            Live audience tracking with country-level demographics, timeframe filters (1h to 1m), and pageview breakdowns.
          </p>
        </div>

        {/* Site Switcher & Refresh */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-1 shadow-xs">
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

          <button
            onClick={() => {
              setRefreshing(true);
              loadData(true);
            }}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
            title="Refresh Visitor Stats"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* ── Timeframe Filter Bar ────────────────────────────────────────────── */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-indigo-600 shrink-0" />
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Timeframe Filter:
            </span>
          </div>

          {/* Quick Pill Buttons */}
          <div className="flex flex-wrap items-center gap-1.5">
            {TIMEFRAME_OPTIONS.map((opt) => (
              <button
                key={opt.key}
                onClick={() => setSelectedTimeframe(opt.key)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedTimeframe === opt.key
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Date Range Picker (shown when custom is selected) */}
        {selectedTimeframe === 'custom' && (
          <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center gap-3">
            <span className="text-xs font-medium text-slate-600">Select Date Window:</span>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={() => loadData()}
                disabled={!startDate || !endDate}
                className="px-3 py-1.5 text-xs font-semibold bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50"
              >
                Apply Range
              </button>
            </div>
          </div>
        )}

        {/* Active Country Filter Notification Badge */}
        {selectedCountry !== 'all' && (
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-indigo-700 font-medium">
              <span>Filtered by country:</span>
              <span className="font-bold inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 border border-indigo-200">
                <span>{getFlagEmoji(selectedCountry)}</span>
                <span>{selectedCountry}</span>
              </span>
            </div>
            <button
              onClick={() => setSelectedCountry('all')}
              className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
            >
              <X className="w-3.5 h-3.5" />
              <span>Clear Country Filter</span>
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => loadData()} className="text-xs font-bold underline">Retry</button>
        </div>
      )}

      {/* ── KPI Cards: Selected Timeframe + Today vs Yesterday ─────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Selected Timeframe Visitors */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visitors ({data.timeframe?.label || 'Selected'})
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {active.visitors ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">in this period</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            Total Views: <strong className="text-slate-800 font-semibold">{active.pageviews ?? 0}</strong>
          </div>
        </div>

        {/* Card 2: Today's Visitors & Growth */}
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Visitors Today
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>

          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-slate-900">
              {today.visitors ?? 0}
            </span>
            <span className="text-xs text-slate-500 font-medium">today</span>
          </div>

          {/* Growth Pill vs Yesterday */}
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

        {/* Card 3: Yesterday's Baseline */}
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
            <span className="text-xs text-slate-500 font-medium">yesterday</span>
          </div>

          <div className="mt-3 text-[11px] text-slate-500 font-medium">
            Pageviews: <strong className="text-slate-800 font-semibold">{yesterday.pageviews ?? 0}</strong>
          </div>
        </div>

        {/* Card 4: Compliance Status */}
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
            <span className="text-xl font-bold text-emerald-700">DPDP / GDPR 100%</span>
          </div>

          <div className="mt-2 space-y-1 text-[11px] text-emerald-800/80 font-medium leading-tight">
            <div>✓ Cookieless Telemetry (Zero PII)</div>
            <div>✓ Auto 90-Day Retention Purge</div>
            <div>✓ Statutory Consent Rate: <strong>{summary.consentRate ?? 100}%</strong></div>
          </div>
        </div>
      </div>

      {/* ── Trend Trajectory Chart ─────────────────────────────────────────── */}
      <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Traffic Trajectory &bull; {data.timeframe?.label || 'Selected Period'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {data.timeframe?.isHourly
                ? 'Showing hour-by-hour telemetry buckets'
                : 'Showing day-by-day telemetry buckets'}
            </p>
          </div>
          <div className="text-xs text-slate-500 font-mono">
            Total Views Logged: <strong>{active.pageviews || 0}</strong>
          </div>
        </div>

        <VisitorTrendChart data={data.trend} isHourly={Boolean(data.timeframe?.isHourly)} />
      </div>

      {/* ── Main Two-Column Analytics: Countries & Top Pages ─────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Country Demographics Table */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Globe className="w-4 h-4 text-indigo-600" />
                Visitor Geographic Distribution
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Click any country to filter all analytics for that region.
              </p>
            </div>

            {selectedCountry !== 'all' && (
              <button
                onClick={() => setSelectedCountry('all')}
                className="text-xs text-indigo-600 hover:text-indigo-800 font-bold"
              >
                Reset Filter
              </button>
            )}
          </div>

          {/* Country Search Bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search countries..."
              value={countrySearch}
              onChange={(e) => setCountrySearch(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Country</th>
                  <th className="py-2.5 px-3 text-right">Unique Visitors</th>
                  <th className="py-2.5 px-3 text-right">Views</th>
                  <th className="py-2.5 px-3 text-right">Traffic %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {filteredCountries.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="py-8 text-center text-slate-400 font-sans">
                      No country telemetry logged in this timeframe yet.
                    </td>
                  </tr>
                ) : (
                  filteredCountries.map((c) => {
                    const isSelected = selectedCountry === c.countryCode;
                    return (
                      <tr
                        key={c.countryCode}
                        onClick={() => setSelectedCountry(isSelected ? 'all' : c.countryCode)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-indigo-50/90 font-bold'
                            : 'hover:bg-slate-50/70'
                        }`}
                        title={`Click to filter by ${c.country}`}
                      >
                        <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2 font-sans">
                          <span className="text-base leading-none">{getFlagEmoji(c.countryCode)}</span>
                          <span className="truncate max-w-[150px]">{c.country}</span>
                          <span className="text-[10px] text-slate-400 font-mono">({c.countryCode})</span>
                        </td>
                        <td className="py-2.5 px-3 text-right font-bold text-indigo-600">
                          {c.visitors}
                        </td>
                        <td className="py-2.5 px-3 text-right text-slate-600 font-bold">
                          {c.views}
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden hidden sm:block">
                              <div
                                className="h-full bg-indigo-600 rounded-full"
                                style={{ width: `${Math.min(100, Math.max(3, c.percentage))}%` }}
                              />
                            </div>
                            <span className="text-slate-700 font-semibold">{c.percentage}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* 2. Top Visited Pages Table */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-4">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              Most Visited Pages &bull; {data.timeframe?.label || 'Selected Period'}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Breakdown of URL paths accessed by visitors in this timeframe.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-2.5 px-3">Path</th>
                  <th className="py-2.5 px-3 text-right">Visitors</th>
                  <th className="py-2.5 px-3 text-right">Pageviews</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono">
                {(!data.topPages || data.topPages.length === 0) ? (
                  <tr>
                    <td colSpan="3" className="py-8 text-center text-slate-400 font-sans">
                      No pageviews logged for this timeframe yet.
                    </td>
                  </tr>
                ) : (
                  data.topPages.map((page, i) => (
                    <tr key={page.path || i} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-2.5 px-3 font-semibold text-slate-800 flex items-center gap-2 font-mono">
                        <span className="text-slate-400 text-[10px] w-4">{i + 1}.</span>
                        <span className="truncate max-w-[220px] md:max-w-xs" title={page.path}>
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
      </div>

      {/* ── Sub-Grids: Referrers & Devices ─────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Traffic Sources */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-xs space-y-3">
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Compass className="w-4 h-4 text-teal-600" />
            Top Traffic Referrers &bull; {data.timeframe?.label || 'Selected'}
          </h3>

          <div className="space-y-2 pt-1 text-xs">
            {(!data.topReferrers || data.topReferrers.length === 0) ? (
              <div className="text-slate-400 py-4 text-center">No referral sources logged yet.</div>
            ) : (
              data.topReferrers.map((r, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <span className="font-medium text-slate-700 truncate max-w-[220px]" title={r.referrer}>
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
            Device Form Factors &bull; {data.timeframe?.label || 'Selected'}
          </h3>

          <div className="space-y-2 pt-1 text-xs">
            {(!data.deviceBreakdown || data.deviceBreakdown.length === 0) ? (
              <div className="text-slate-400 py-4 text-center">No device telemetry logged yet.</div>
            ) : (
              data.deviceBreakdown.map((d, i) => {
                const Icon = d.device === 'mobile' ? Smartphone : (d.device === 'tablet' ? Tablet : Monitor);
                return (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <div className="flex items-center gap-2 font-medium text-slate-700 capitalize">
                      <Icon className="w-4 h-4 text-slate-400" />
                      <span>{d.device || 'Desktop'}</span>
                    </div>
                    <span className="font-bold text-slate-900 font-mono">{d.count} hits</span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* ── External Analytics Hub ─────────────────────────────────────────── */}
      <div className="p-6 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl shadow-md border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-slate-800 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-400 uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>External Analytics Hub</span>
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              Integrated Third-Party Analytics Consoles
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
