import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { api } from '../services/api';
import {
  FileText,
  Search,
  Filter,
  Activity,
  CheckCircle2,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Info,
  X,
  Download,
  RefreshCw,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Clock,
  User,
  Laptop,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  Layers,
  Calendar,
  AlertCircle,
  Eye,
} from 'lucide-react';

const CATEGORY_TABS = [
  { key: '', label: 'All Telemetry' },
  { key: 'AUTH', label: 'Auth & Security' },
  { key: 'USERS', label: 'Users & Staff' },
  { key: 'ROLES', label: 'Roles & RBAC' },
  { key: 'CONTENT', label: 'CMS Articles & Media' },
  { key: 'LANDING', label: 'Landing Pages' },
  { key: 'LEADS', label: 'Leads & CRM' },
  { key: 'NEWSLETTER', label: 'Subscribers' },
  { key: 'SETTINGS', label: 'Settings & Theme' },
];

const DATE_PRESETS = [
  { key: 'all', label: 'All Time' },
  { key: 'today', label: 'Today' },
  { key: '7d', label: 'Last 7 Days' },
  { key: '30d', label: 'Last 30 Days' },
];

function getCategoryFromAction(action = '') {
  if (action.startsWith('AUTH_')) return { name: 'AUTH', color: 'indigo', label: 'Authentication' };
  if (action.startsWith('USER_')) return { name: 'USERS', color: 'blue', label: 'User Account' };
  if (action.startsWith('ROLE_') || action.startsWith('PERMISSION_')) return { name: 'ROLES', color: 'purple', label: 'Access Control' };
  if (action.startsWith('CMS_POST_') || action.startsWith('CATEGORY_') || action.startsWith('MEDIA_')) return { name: 'CONTENT', color: 'emerald', label: 'Content CMS' };
  if (action.startsWith('LANDING_PAGE_')) return { name: 'LANDING', color: 'teal', label: 'Landing Pages' };
  if (action.startsWith('LEAD_') || action.startsWith('lead.')) return { name: 'LEADS', color: 'amber', label: 'CRM & Leads' };
  if (action.startsWith('SUBSCRIBER')) return { name: 'NEWSLETTER', color: 'cyan', label: 'Newsletter' };
  if (action.startsWith('SETTINGS_') || action.startsWith('THEME_')) return { name: 'SETTINGS', color: 'slate', label: 'System Settings' };
  return { name: 'OTHER', color: 'slate', label: 'System Event' };
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Statistics
  const [stats, setStats] = useState({
    totalEvents: 0,
    events24h: 0,
    events7d: 0,
    failedEvents: 0,
    authFailures24h: 0,
    topActors: [],
    distinctActions: [],
  });

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [datePreset, setDatePreset] = useState('all');

  // Modals & UI States
  const [selectedLog, setSelectedLog] = useState(null);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportFormat, setExportFormat] = useState('csv');

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
      setPagination(prev => ({ ...prev, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Calculate start date based on preset
  const dateRange = useMemo(() => {
    if (datePreset === 'all') return { startDate: undefined, endDate: undefined };
    const now = new Date();
    if (datePreset === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      return { startDate: startOfDay, endDate: now.toISOString() };
    }
    if (datePreset === '7d') {
      const past7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: past7d, endDate: now.toISOString() };
    }
    if (datePreset === '30d') {
      const past30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString();
      return { startDate: past30d, endDate: now.toISOString() };
    }
    return { startDate: undefined, endDate: undefined };
  }, [datePreset]);

  // Load KPI metrics
  const fetchStats = useCallback(async () => {
    try {
      const data = await api.getAuditStats();
      setStats({
        totalEvents: data.totalEvents || 0,
        events24h: data.events24h || 0,
        events7d: data.events7d || 0,
        failedEvents: data.failedEvents || 0,
        authFailures24h: data.authFailures24h || 0,
        topActors: data.topActors || [],
        distinctActions: data.distinctActions || [],
      });
    } catch (err) {
      console.warn('Failed to load audit statistics:', err);
    }
  }, []);

  // Fetch paginated logs
  const fetchLogs = useCallback(async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const data = await api.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        action: actionFilter || undefined,
        outcome: outcomeFilter || undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
      });

      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [pagination.page, pagination.limit, debouncedSearch, categoryFilter, actionFilter, outcomeFilter, dateRange]);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Auto-refresh interval (20s)
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchLogs(true);
      fetchStats();
    }, 20000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchLogs, fetchStats]);

  // Export handler
  const handleExport = async (format = 'csv') => {
    try {
      setExporting(true);
      await api.downloadAuditExport({
        search: debouncedSearch || undefined,
        category: categoryFilter || undefined,
        action: actionFilter || undefined,
        outcome: outcomeFilter || undefined,
        startDate: dateRange.startDate,
        endDate: dateRange.endDate,
        format,
      });
    } catch (err) {
      console.error('Export failed:', err);
      alert('Failed to generate export file. Please verify network access.');
    } finally {
      setExporting(false);
    }
  };

  const handleCopyPayload = (metadata) => {
    try {
      navigator.clipboard.writeText(JSON.stringify(metadata, null, 2));
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 2000);
    } catch {
      // fallback
    }
  };

  const hasActiveFilters = Boolean(
    debouncedSearch || categoryFilter || actionFilter || outcomeFilter || datePreset !== 'all'
  );

  const clearAllFilters = () => {
    setSearchQuery('');
    setDebouncedSearch('');
    setCategoryFilter('');
    setActionFilter('');
    setOutcomeFilter('');
    setDatePreset('all');
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ── Page Header ────────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Trail</h1>
            <span className="badge badge-emerald flex items-center gap-1 text-[11px] font-semibold py-0.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              SOC2 & ISO 27001 Immutable Log
            </span>
          </div>
          <p className="text-xs md:text-sm text-slate-500 mt-1">
            Forensic cryptographic event telemetry recording authentication, permissions, user management, and content mutations.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Live Auto-Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(prev => !prev)}
            className={`btn-secondary text-xs py-2 px-3 flex items-center gap-2 transition-all ${
              autoRefresh ? 'bg-emerald-50 border-emerald-300 text-emerald-800' : ''
            }`}
            title="Auto-refresh records every 20 seconds"
          >
            <span className={`w-2 h-2 rounded-full ${autoRefresh ? 'bg-emerald-500 animate-ping' : 'bg-slate-300'}`} />
            <span>{autoRefresh ? 'Live Monitoring: ON' : 'Live Monitoring: OFF'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => {
              fetchLogs(true);
              fetchStats();
            }}
            disabled={refreshing || loading}
            className="btn-secondary text-xs py-2 px-3 flex items-center gap-1.5"
            title="Refresh logs and metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-indigo-600' : ''}`} />
            <span>Refresh</span>
          </button>

          {/* Compliance Export Dropdown */}
          <div className="relative inline-flex rounded-lg shadow-xs">
            <button
              onClick={() => handleExport(exportFormat)}
              disabled={exporting}
              className="btn-primary text-xs py-2 px-3 flex items-center gap-1.5 rounded-r-none"
            >
              {exporting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              <span>{exporting ? 'Exporting...' : `Export ${exportFormat.toUpperCase()}`}</span>
            </button>
            <select
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="bg-indigo-700 text-white border-l border-indigo-500 text-xs px-2 py-2 rounded-r-lg focus:outline-none hover:bg-indigo-800 cursor-pointer"
              title="Select export file format"
            >
              <option value="csv">CSV</option>
              <option value="json">JSON</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── KPI Telemetry Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Events */}
        <div className="card-enterprise p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Audit Records</span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.totalEvents.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-emerald-600">Immutable</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="w-3 h-3 text-emerald-500" />
            <span>Zero-deletion tamper evident</span>
          </div>
        </div>

        {/* 24-Hour Velocity */}
        <div className="card-enterprise p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">24h Event Velocity</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.events24h.toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-slate-500">events</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <Clock className="w-3 h-3 text-blue-500" />
            <span>Past 7 days: {stats.events7d.toLocaleString()}</span>
          </div>
        </div>

        {/* Security Alert Indicator */}
        <div className={`card-enterprise p-4 relative overflow-hidden ${
          stats.authFailures24h > 0 ? 'border-rose-200 bg-rose-50/20' : ''
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Auth Failures (24h)</span>
            <div className={`p-2 rounded-xl ${stats.authFailures24h > 0 ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className={`text-2xl font-extrabold ${stats.authFailures24h > 0 ? 'text-rose-600' : 'text-slate-900'}`}>
              {stats.authFailures24h}
            </span>
            <span className={`text-xs font-semibold ${stats.authFailures24h > 0 ? 'text-rose-600' : 'text-slate-500'}`}>
              {stats.authFailures24h > 0 ? 'High Priority' : 'Normal'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center gap-1">
            <AlertTriangle className={`w-3 h-3 ${stats.failedEvents > 0 ? 'text-amber-500' : 'text-slate-400'}`} />
            <span>All-time failures: {stats.failedEvents}</span>
          </div>
        </div>

        {/* Active Operators */}
        <div className="card-enterprise p-4 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Active Operators</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <User className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900">
              {stats.topActors.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">identities</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 truncate" title={stats.topActors[0]?.email || 'N/A'}>
            Top actor: <span className="font-semibold text-slate-700">{stats.topActors[0]?.email?.split('@')[0] || 'system'}</span> ({stats.topActors[0]?.count || 0})
          </div>
        </div>
      </div>

      {/* ── Category Navigation Tabs ───────────────────────────── */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-slate-200">
        {CATEGORY_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => {
              setCategoryFilter(tab.key);
              setActionFilter('');
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className={`px-3.5 py-2 text-xs font-bold rounded-t-xl transition-all whitespace-nowrap flex items-center gap-1.5 border-b-2 ${
              categoryFilter === tab.key
                ? 'border-indigo-600 text-indigo-700 bg-indigo-50/60 font-extrabold'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── Search & Filter Controls Toolbar ───────────────────── */}
      <div className="card-enterprise p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
          {/* Universal Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search email, IP, action, target..."
              className="input-field text-xs pl-9 pr-8 py-2 w-full font-mono"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {/* Outcome Filter */}
            <select
              value={outcomeFilter}
              onChange={(e) => {
                setOutcomeFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input-field text-xs py-2 w-full sm:w-36"
            >
              <option value="">All Outcomes</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failures / Blocked</option>
            </select>

            {/* Specific Action Filter */}
            <select
              value={actionFilter}
              onChange={(e) => {
                setActionFilter(e.target.value);
                setPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="input-field text-xs py-2 w-full sm:w-52 font-mono"
            >
              <option value="">All Actions ({stats.distinctActions.length || 'All'})</option>
              {stats.distinctActions.map((act) => (
                <option key={act} value={act}>
                  {act}
                </option>
              ))}
            </select>

            {/* Date Range Preset */}
            <div className="flex items-center rounded-lg border border-slate-200 bg-white p-0.5 shadow-2xs">
              {DATE_PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => {
                    setDatePreset(p.key);
                    setPagination(prev => ({ ...prev, page: 1 }));
                  }}
                  className={`text-[11px] font-semibold px-2.5 py-1.5 rounded-md transition-colors ${
                    datePreset === p.key
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Clear All Filters Button */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="btn-secondary text-xs py-1.5 px-2.5 text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center gap-1"
                title="Reset all active filters"
              >
                <X className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter Summary Badges */}
        {hasActiveFilters && (
          <div className="pt-2 border-t border-slate-100 flex items-center gap-2 flex-wrap text-[11px] text-slate-500">
            <span className="font-semibold text-slate-700">Active Filters:</span>
            {debouncedSearch && (
              <span className="badge badge-indigo">Query: &quot;{debouncedSearch}&quot;</span>
            )}
            {categoryFilter && (
              <span className="badge badge-purple">Category: {categoryFilter}</span>
            )}
            {actionFilter && (
              <span className="badge badge-blue">Action: {actionFilter}</span>
            )}
            {outcomeFilter && (
              <span className={`badge ${outcomeFilter === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'}`}>
                Outcome: {outcomeFilter}
              </span>
            )}
            {datePreset !== 'all' && (
              <span className="badge badge-amber">Timeframe: {datePreset}</span>
            )}
            <span className="text-slate-400">({pagination.total} matching records)</span>
          </div>
        )}
      </div>

      {/* ── Audit Logs Forensic Table ─────────────────────────── */}
      <div className="card-enterprise overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider bg-slate-50/80 font-bold">
                <th className="py-3 px-4">Timestamp (UTC/Local)</th>
                <th className="py-3 px-4">Event Action</th>
                <th className="py-3 px-4">Operator / Actor</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4 text-center">Outcome</th>
                <th className="py-3 px-4">Client IP</th>
                <th className="py-3 px-4 text-right">Forensic Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center text-slate-500">
                    <Loader2 className="w-7 h-7 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span className="font-semibold">Retrieving immutable audit records...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500">
                    <div className="max-w-sm mx-auto space-y-2">
                      <Shield className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="font-bold text-slate-700">No audit records match the current criteria.</p>
                      <p className="text-xs text-slate-400">Try adjusting your filters, searching for a different keyword, or resetting the timeframe.</p>
                      {hasActiveFilters && (
                        <button onClick={clearAllFilters} className="btn-secondary text-xs mt-2">
                          Reset All Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const cat = getCategoryFromAction(log.action);
                  const isFailure = log.outcome === 'FAILURE';
                  const isAuth = log.action.startsWith('AUTH_');

                  return (
                    <tr
                      key={log.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isFailure ? 'bg-rose-50/20' : ''
                      }`}
                    >
                      {/* Timestamp */}
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px] whitespace-nowrap">
                        <div className="font-semibold text-slate-800">
                          {new Date(log.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-2.5 h-2.5" />
                          {new Date(log.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })}
                        </div>
                      </td>

                      {/* Event Action Badge */}
                      <td className="py-3 px-4">
                        <div className="flex flex-col gap-1 items-start">
                          <span className={`inline-flex items-center gap-1 font-mono text-[11px] font-bold px-2 py-0.5 rounded-md ${
                            isFailure
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : cat.name === 'AUTH'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                              : cat.name === 'ROLES'
                              ? 'bg-purple-50 text-purple-700 border border-purple-100'
                              : cat.name === 'CONTENT'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                              : 'bg-slate-100 text-slate-800 border border-slate-200'
                          }`}>
                            {log.action}
                          </span>
                          <span className="text-[10px] font-medium text-slate-400">
                            {cat.label}
                          </span>
                        </div>
                      </td>

                      {/* Operator / Actor */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-[10px] font-bold shrink-0">
                            {(log.actorEmail || 'S')[0].toUpperCase()}
                          </div>
                          <div className="truncate max-w-[170px]">
                            <span className="font-semibold text-slate-800 block truncate" title={log.actorEmail}>
                              {log.actorEmail || 'system/anonymous'}
                            </span>
                            {log.actorUserId && (
                              <span className="text-[10px] text-slate-400 font-mono block">
                                ID: {log.actorUserId.slice(-6)}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Target Resource */}
                      <td className="py-3 px-4 text-[11px]">
                        {log.targetType ? (
                          <div>
                            <span className="font-semibold text-slate-700 uppercase tracking-wider text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                              {log.targetType}
                            </span>
                            {log.targetId && (
                              <span className="text-slate-500 font-mono text-[10px] block mt-0.5 truncate max-w-[130px]" title={log.targetId}>
                                {log.targetId}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Outcome Status */}
                      <td className="py-3 px-4 text-center">
                        <span
                          className={`badge ${
                            log.outcome === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'
                          }`}
                        >
                          {log.outcome === 'SUCCESS' ? (
                            <CheckCircle2 className="w-3 h-3 text-emerald-600 mr-1" />
                          ) : (
                            <AlertTriangle className="w-3 h-3 text-rose-600 mr-1" />
                          )}
                          {log.outcome}
                        </span>
                      </td>

                      {/* Client IP Address */}
                      <td className="py-3 px-4 text-slate-600 font-mono text-[11px] whitespace-nowrap">
                        <span className="bg-slate-100/90 border border-slate-200/70 px-1.5 py-0.5 rounded text-[10px] text-slate-700">
                          {log.ipAddress || 'unknown'}
                        </span>
                      </td>

                      {/* Details Inspection Trigger */}
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedLog(log)}
                          className="btn-secondary py-1 px-2.5 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 border-indigo-200 inline-flex items-center gap-1 shadow-2xs"
                          title="Inspect forensic payload & telemetry"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Inspect</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── Table Pagination & Page Size ────────────────────────── */}
        <div className="p-4 border-t border-slate-200 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600">
          <div className="flex items-center gap-3">
            <span>
              Showing <span className="font-bold text-slate-800">{logs.length}</span> of{' '}
              <span className="font-bold text-slate-800">{pagination.total.toLocaleString()}</span> forensic events
            </span>
            <div className="flex items-center gap-1">
              <span className="text-slate-400 text-[11px]">Per page:</span>
              <select
                value={pagination.limit}
                onChange={(e) => {
                  setPagination(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }));
                }}
                className="input-field text-xs py-1 px-2 font-mono cursor-pointer"
              >
                <option value={15}>15</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={pagination.page <= 1}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
            <span className="font-bold text-slate-800 px-2 py-1 rounded bg-white border border-slate-200">
              {pagination.page} / {pagination.totalPages}
            </span>
            <button
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
              className="btn-secondary py-1.5 px-3 text-xs disabled:opacity-40 flex items-center gap-1"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* ── FORENSIC DETAILS INSPECTION MODAL ────────────────────── */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className={`p-2 rounded-xl ${
                  selectedLog.outcome === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}>
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Security Forensic Audit Record</h2>
                  <p className="text-xs text-slate-500 font-mono">
                    Event ID: {selectedLog.id}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1.5 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="space-y-4 mt-5 text-xs">
              {/* Event Attributes Grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Action Name</span>
                  <span className="font-bold text-slate-900 font-mono text-[11px] break-all">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Outcome</span>
                  <span className={`badge ${selectedLog.outcome === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'} mt-0.5`}>
                    {selectedLog.outcome}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Timestamp</span>
                  <span className="font-mono text-[11px] text-slate-700 block">
                    {new Date(selectedLog.createdAt).toISOString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Actor Email</span>
                  <span className="text-slate-800 font-mono text-[11px] block truncate" title={selectedLog.actorEmail}>
                    {selectedLog.actorEmail}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Actor User ID</span>
                  <span className="text-slate-600 font-mono text-[11px] block">
                    {selectedLog.actorUserId || 'None / External'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">IP Address</span>
                  <span className="text-slate-800 font-mono text-[11px] block">
                    {selectedLog.ipAddress || 'unknown'}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Target Type</span>
                  <span className="text-slate-800 font-semibold block uppercase text-[11px]">
                    {selectedLog.targetType || '—'}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Target ID</span>
                  <span className="text-slate-700 font-mono text-[11px] block truncate">
                    {selectedLog.targetId || '—'}
                  </span>
                </div>
              </div>

              {/* User Agent Telemetry */}
              {selectedLog.userAgent && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-1">
                    <Laptop className="w-3.5 h-3.5 text-slate-500" />
                    <span>Client Environment Telemetry:</span>
                  </div>
                  <p className="font-mono text-[11px] text-slate-600 break-all leading-relaxed">
                    {selectedLog.userAgent}
                  </p>
                </div>
              )}

              {/* Sanitized Metadata Payload */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1 text-slate-700 font-bold">
                    <Terminal className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Sanitized Context Payload:</span>
                  </div>
                  <button
                    onClick={() => handleCopyPayload(selectedLog.metadata)}
                    className="btn-secondary py-1 px-2 text-[11px] flex items-center gap-1 text-slate-600"
                    title="Copy payload to clipboard"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>Copy JSON</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-56 shadow-inner leading-relaxed">
                  {JSON.stringify(selectedLog.metadata || {}, null, 2)}
                </pre>
              </div>

              {/* Compliance Notice */}
              <div className="p-3 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-start gap-2 text-[11px] text-indigo-900">
                <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                <p>
                  <strong>Cryptographic Immutability Notice:</strong> This audit trail record is strictly append-only.
                  Modifications, overwrites, or deletions are permanently rejected by the API layer in strict adherence to SOC 2, ISO 27001, and India DPDP Act compliance standards.
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end pt-4 mt-5 border-t border-slate-100">
              <button
                onClick={() => setSelectedLog(null)}
                className="btn-secondary text-xs px-4"
              >
                Close Forensics
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
