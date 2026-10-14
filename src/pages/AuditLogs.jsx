import React, { useState, useEffect, useCallback } from 'react';
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
} from 'lucide-react';

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 15, total: 0, totalPages: 1 });

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState('');
  const [selectedLog, setSelectedLog] = useState(null);

  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getAuditLogs({
        page: pagination.page,
        limit: pagination.limit,
        action: actionFilter || undefined,
        outcome: outcomeFilter || undefined,
      });
      setLogs(data.logs || []);
      setPagination(data.pagination || { page: 1, limit: 15, total: 0, totalPages: 1 });
    } catch (err) {
      console.error('Failed to fetch audit trail:', err);
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, actionFilter, outcomeFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Security Audit Trail</h1>
        <p className="text-sm text-slate-500 mt-1">
          Immutable forensic log of authentication, authorization, and administrative modifications.
        </p>
      </div>

      {/* Filter toolbar */}
      <div className="card-enterprise p-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-indigo-600" />
          <span className="text-xs font-bold text-slate-700">Filter Event History:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-field text-xs py-2 w-full sm:w-36"
          >
            <option value="">All Outcomes</option>
            <option value="SUCCESS">Success</option>
            <option value="FAILURE">Failure</option>
          </select>

          <select
            value={actionFilter}
            onChange={(e) => {
              setActionFilter(e.target.value);
              setPagination(prev => ({ ...prev, page: 1 }));
            }}
            className="input-field text-xs py-2 w-full sm:w-56 font-mono"
          >
            <option value="">All Actions</option>
            <option value="AUTH_LOGIN_SUCCESS">AUTH_LOGIN_SUCCESS</option>
            <option value="AUTH_LOGIN_FAILED">AUTH_LOGIN_FAILED</option>
            <option value="AUTH_LOGOUT">AUTH_LOGOUT</option>
            <option value="USER_CREATED">USER_CREATED</option>
            <option value="USER_UPDATED">USER_UPDATED</option>
            <option value="USER_DELETED">USER_DELETED</option>
            <option value="ROLE_CREATED">ROLE_CREATED</option>
            <option value="ROLE_UPDATED">ROLE_UPDATED</option>
            <option value="MENU_ITEM_CREATED">MENU_ITEM_CREATED</option>
            <option value="MENU_ITEM_UPDATED">MENU_ITEM_UPDATED</option>
            <option value="SETTINGS_UPDATED">SETTINGS_UPDATED</option>
          </select>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card-enterprise overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-600 uppercase tracking-wider bg-slate-50 font-semibold">
                <th className="py-3.5 px-4 font-semibold">Timestamp</th>
                <th className="py-3.5 px-4 font-semibold">Action</th>
                <th className="py-3.5 px-4 font-semibold">Actor Email</th>
                <th className="py-3.5 px-4 font-semibold">Target</th>
                <th className="py-3.5 px-4 font-semibold">Outcome</th>
                <th className="py-3.5 px-4 font-semibold">IP Address</th>
                <th className="py-3.5 px-4 font-semibold text-right">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-mono">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 font-sans">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-indigo-600 mb-2" />
                    <span>Loading security events...</span>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-500 font-sans">
                    No audit records found matching the criteria.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 text-slate-500 text-[11px] whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-800">
                      {log.action}
                    </td>

                    <td className="py-3 px-4 text-slate-600 truncate max-w-[150px]">
                      {log.actorEmail}
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.targetType || '—'} {log.targetId ? `(${log.targetId.slice(-6)})` : ''}
                    </td>

                    <td className="py-3 px-4 font-sans">
                      <span
                        className={`badge ${
                          log.outcome === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'
                        }`}
                      >
                        <span className={`status-dot ${log.outcome === 'SUCCESS' ? 'status-dot-active' : 'status-dot-inactive'}`} />
                        {log.outcome}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-slate-500 text-[11px]">
                      {log.ipAddress || 'unknown'}
                    </td>

                    <td className="py-3 px-4 text-right font-sans">
                      <button
                        onClick={() => setSelectedLog(log)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                        title="View sanitized payload"
                      >
                        <Info className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-600 font-sans">
            <span>
              Showing {logs.length} of {pagination.total} events
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={pagination.page <= 1}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span>Prev</span>
              </button>
              <span className="font-semibold text-slate-700">
                {pagination.page} / {pagination.totalPages}
              </span>
              <button
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                className="btn-secondary py-1 px-2.5 text-xs disabled:opacity-40"
              >
                <span>Next</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* AUDIT DETAILS INSPECTION MODAL */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-fade-in font-sans">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full p-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Event Details</h2>
              <button onClick={() => setSelectedLog(null)} className="text-slate-400 hover:text-slate-600 hover:bg-slate-100 p-1 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Action</span>
                  <span className="font-bold text-slate-900 font-mono">{selectedLog.action}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Outcome</span>
                  <span className={`badge ${selectedLog.outcome === 'SUCCESS' ? 'badge-emerald' : 'badge-rose'} mt-0.5`}>
                    {selectedLog.outcome}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">Actor Email</span>
                  <span className="text-slate-700 font-mono">{selectedLog.actorEmail}</span>
                </div>
                <div>
                  <span className="text-slate-500 uppercase tracking-wider block text-[10px] font-bold">IP Address</span>
                  <span className="text-slate-700 font-mono">{selectedLog.ipAddress}</span>
                </div>
              </div>

              <div>
                <span className="text-slate-700 font-bold block mb-1">Sanitized Metadata Payload:</span>
                <pre className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-[11px] font-mono text-emerald-400 overflow-x-auto max-h-48 shadow-inner">
                  {JSON.stringify(selectedLog.metadata, null, 2)}
                </pre>
              </div>

              {selectedLog.userAgent && (
                <div>
                  <span className="text-slate-500 text-[10px] uppercase tracking-wider block font-bold">User Agent</span>
                  <span className="text-slate-600 font-mono text-[11px] break-all">{selectedLog.userAgent}</span>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4 mt-4 border-t border-slate-100">
              <button onClick={() => setSelectedLog(null)} className="btn-secondary text-xs">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
