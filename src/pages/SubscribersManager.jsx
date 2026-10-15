import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Users,
  UserCheck,
  UserX,
  TrendingUp,
  Download,
  RefreshCw,
  Search,
  Filter,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  ShieldCheck,
} from 'lucide-react';

export default function SubscribersManager() {
  const [subscribers, setSubscribers] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    subscribed: 0,
    unsubscribed: 0,
    pending: 0,
    suppressed: 0,
    newLast30Days: 0,
    churnRate: 0,
    activeRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Load subscribers data
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setActionError(null);

    try {
      const [statsData, listData] = await Promise.all([
        api.getSubscriberStats(),
        api.getSubscribers({
          page,
          limit: 20,
          search: searchTerm,
          status: selectedStatus,
        }),
      ]);

      setStats(statsData || {});
      setSubscribers(listData.subscribers || []);
      setPagination(listData.pagination || { total: 0, totalPages: 1, limit: 20 });
    } catch (err) {
      console.error('Failed to load subscribers:', err);
      setActionError(err.message || 'Failed to load subscribers.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedStatus]);

  // Handle Search submit
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  // Status Toggle
  const handleToggleStatus = async (sub) => {
    const nextStatus = sub.status === 'subscribed' ? 'unsubscribed' : 'subscribed';
    const confirmMsg = nextStatus === 'unsubscribed'
      ? `Are you sure you want to manually mark ${sub.email} as unsubscribed?`
      : `Re-activate subscription for ${sub.email}? (Ensure prior consent)`;

    if (!window.confirm(confirmMsg)) return;

    try {
      await api.updateSubscriberStatus(sub.id, nextStatus, 'admin_console_toggle');
      setActionSuccess(`Updated ${sub.email} to ${nextStatus}.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData(true);
    } catch (err) {
      setActionError(err.message || 'Failed to update subscriber status.');
    }
  };

  // Delete (GDPR Right to Erasure)
  const handleDelete = async (sub) => {
    if (!window.confirm(`Permanently erase ${sub.email} from the database? This action complies with GDPR Article 17 and cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteSubscriber(sub.id);
      setActionSuccess(`Permanently erased subscriber record.`);
      setTimeout(() => setActionSuccess(null), 3000);
      loadData(true);
    } catch (err) {
      setActionError(err.message || 'Failed to erase subscriber.');
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    const exportUrl = api.getExportSubscribersUrl(selectedStatus);
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Mail className="w-7 h-7 text-indigo-600" />
            Newsletter &amp; Audience
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            CAN-SPAM, GDPR Art. 17 &amp; DPDP Act 2023 compliant subscription telemetry and audience exports.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => { setRefreshing(true); loadData(true); }}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 shadow-xs"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm transition-all"
          >
            <Download className="w-4 h-4" />
            Export CSV
          </button>
        </div>
      </div>

      {/* Notifications */}
      {actionSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-sm flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {actionError && (
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-sm flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Audience</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total || 0}</span>
            <span className="text-xs text-slate-500 font-medium">all-time signups</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Subscribed</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.subscribed || 0}</span>
            <span className="text-xs text-slate-500 font-medium">({stats.activeRate || 0}% active rate)</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Unsubscribed</span>
            <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
              <UserX className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-700">{stats.unsubscribed || 0}</span>
            <span className="text-xs text-slate-500 font-medium">({stats.churnRate || 0}% churn)</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">30-Day Velocity</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">+{stats.newLast30Days || 0}</span>
            <span className="text-xs text-slate-500 font-medium">new this month</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Status Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto">
          {[
            { id: 'all', label: 'All Subscribers' },
            { id: 'subscribed', label: 'Subscribed' },
            { id: 'unsubscribed', label: 'Unsubscribed' },
            { id: 'suppressed', label: 'Suppressed' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setSelectedStatus(tab.id); setPage(1); }}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                selectedStatus === tab.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search email or source..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
            />
          </div>
          <button
            type="submit"
            className="px-3 py-1.5 bg-slate-100 text-slate-700 hover:bg-slate-200 font-medium text-xs rounded-lg transition-colors"
          >
            Filter
          </button>
        </form>
      </div>

      {/* Subscribers Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-500">
            <div className="inline-block w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mb-2" />
            <p className="text-sm">Loading audience telemetry...</p>
          </div>
        ) : subscribers.length === 0 ? (
          <div className="py-16 text-center text-slate-500">
            <Mail className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-700">No subscribers found</p>
            <p className="text-xs text-slate-400 mt-0.5">Try clearing filters or search queries.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/75 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                  <th className="py-3 px-4">Subscriber</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Source</th>
                  <th className="py-3 px-4">Subscribed (UTC)</th>
                  <th className="py-3 px-4">Opt-Out Details</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subscribers.map((sub) => {
                  const isSubscribed = sub.status === 'subscribed';
                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{sub.email}</div>
                        <div className="text-[11px] text-slate-400">Policy: {sub.policyVersion || '2026.1'}</div>
                      </td>

                      <td className="py-3.5 px-4">
                        {isSubscribed ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Subscribed
                          </span>
                        ) : sub.status === 'unsubscribed' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                            Unsubscribed
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                            {sub.status}
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 capitalize">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-xs font-medium text-slate-700">
                          {sub.source || 'footer'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {sub.subscribedAt ? new Date(sub.subscribedAt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
                      </td>

                      <td className="py-3.5 px-4 text-xs text-slate-500">
                        {sub.unsubscribedAt ? (
                          <div>
                            <div>{new Date(sub.unsubscribedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}</div>
                            <div className="text-[11px] text-slate-400 italic">Reason: {sub.unsubscribeReason || 'user_request'}</div>
                          </div>
                        ) : (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleToggleStatus(sub)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors ${
                            isSubscribed
                              ? 'text-rose-700 hover:bg-rose-50 border border-rose-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                          title={isSubscribed ? 'Opt-out subscriber' : 'Re-activate subscriber'}
                        >
                          {isSubscribed ? 'Opt-out' : 'Activate'}
                        </button>

                        <button
                          onClick={() => handleDelete(sub)}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                          title="GDPR Art. 17 Permanent Erasure"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {!loading && pagination.total > 0 && (
          <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span>
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={pagination.page <= 1}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-100 transition-colors font-medium"
              >
                Previous
              </button>
              <span className="font-semibold text-slate-700 px-1">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={pagination.page >= pagination.totalPages}
                className="px-2.5 py-1 bg-white border border-slate-200 rounded-md disabled:opacity-40 hover:bg-slate-100 transition-colors font-medium"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
