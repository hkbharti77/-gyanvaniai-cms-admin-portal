import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  Inbox,
  Search,
  Filter,
  Download,
  RefreshCw,
  Trash2,
  CheckCircle,
  AlertTriangle,
  Clock,
  Building,
  Mail,
  Phone,
  MessageSquare,
  ShieldCheck,
  ChevronRight,
  X,
  ExternalLink,
  Flame,
  Send,
  User,
  PlusCircle,
  Eye,
  Check,
} from 'lucide-react';

const STATUS_CONFIG = {
  new: { label: 'New', bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  contacted: { label: 'Contacted', bg: 'bg-blue-50 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  in_progress: { label: 'In Progress', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', dot: 'bg-indigo-500' },
  qualified: { label: 'Qualified', bg: 'bg-purple-50 text-purple-700 border-purple-200', dot: 'bg-purple-500' },
  converted: { label: 'Converted', bg: 'bg-amber-50 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  closed: { label: 'Closed', bg: 'bg-slate-100 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  spam: { label: 'Spam', bg: 'bg-rose-50 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
};

const PRIORITY_CONFIG = {
  urgent: { label: 'Urgent', bg: 'bg-rose-100 text-rose-800' },
  high: { label: 'High', bg: 'bg-amber-100 text-amber-800' },
  medium: { label: 'Medium', bg: 'bg-indigo-100 text-indigo-800' },
  low: { label: 'Low', bg: 'bg-slate-100 text-slate-700' },
};

export default function LeadsManager() {
  const [leads, setLeads] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    new: 0,
    contacted: 0,
    inProgress: 0,
    qualified: 0,
    converted: 0,
    closed: 0,
    spam: 0,
    todayCount: 0,
    last30Days: 0,
    conversionRate: 0,
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, limit: 20 });
  const [actionError, setActionError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Detail Drawer State
  const [selectedLead, setSelectedLead] = useState(null);
  const [newNoteText, setNewNoteText] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Load leads and stats
  const loadData = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setActionError(null);

    try {
      const [statsData, listData] = await Promise.all([
        api.getLeadStats(),
        api.getLeads({
          page,
          limit: 20,
          search: searchTerm,
          status: selectedStatus,
          priority: selectedPriority,
        }),
      ]);

      setStats(statsData || {});
      setLeads(listData.leads || []);
      setPagination(listData.pagination || { total: 0, totalPages: 1, limit: 20 });
    } catch (err) {
      console.error('Failed to load leads:', err);
      setActionError(err.message || 'Failed to load leads.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [page, selectedStatus, selectedPriority]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleStatusChange = async (leadId, nextStatus) => {
    try {
      await api.updateLead(leadId, { status: nextStatus });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, status: nextStatus, updatedAt: new Date().toISOString() } : l))
      );
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead((prev) => ({ ...prev, status: nextStatus }));
      }
      setActionSuccess('Lead status updated.');
      setTimeout(() => setActionSuccess(null), 2500);
      // Reload stats silently
      api.getLeadStats().then((s) => setStats(s || {}));
    } catch (err) {
      setActionError(err.message || 'Failed to update status.');
    }
  };

  const handlePriorityChange = async (leadId, nextPriority) => {
    try {
      await api.updateLead(leadId, { priority: nextPriority });
      setLeads((prev) =>
        prev.map((l) => (l._id === leadId ? { ...l, priority: nextPriority } : l))
      );
      if (selectedLead && selectedLead._id === leadId) {
        setSelectedLead((prev) => ({ ...prev, priority: nextPriority }));
      }
      setActionSuccess('Priority updated.');
      setTimeout(() => setActionSuccess(null), 2500);
    } catch (err) {
      setActionError(err.message || 'Failed to update priority.');
    }
  };

  const handleDelete = async (lead) => {
    if (!window.confirm(`Permanently delete inquiry from "${lead.name}" (${lead.email})? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.deleteLead(lead._id);
      setActionSuccess(`Deleted lead from ${lead.name}.`);
      if (selectedLead && selectedLead._id === lead._id) {
        setSelectedLead(null);
      }
      setTimeout(() => setActionSuccess(null), 3000);
      loadData(true);
    } catch (err) {
      setActionError(err.message || 'Failed to delete lead.');
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !selectedLead) return;

    setAddingNote(true);
    try {
      const res = await api.addLeadNote(selectedLead._id, newNoteText.trim());
      if (res.note) {
        setSelectedLead((prev) => ({
          ...prev,
          notes: [...(prev.notes || []), res.note],
        }));
        setNewNoteText('');
        setActionSuccess('Note added successfully.');
        setTimeout(() => setActionSuccess(null), 2500);
      }
    } catch (err) {
      setActionError(err.message || 'Failed to add note.');
    } finally {
      setAddingNote(false);
    }
  };

  const handleExportCsv = () => {
    const exportUrl = api.getExportLeadsUrl(selectedStatus);
    window.open(exportUrl, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Inbox className="w-7 h-7 text-indigo-600" />
            Leads &amp; Customer Inquiries
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Enterprise-grade inbound lead ingestion, deduplication telemetry, and DPDP Act 2023 consent records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setRefreshing(true);
              loadData(true);
            }}
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Leads</span>
            <div className="w-9 h-9 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{stats.total || 0}</span>
            <span className="text-xs text-slate-500 font-medium">all-time inquiries</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">New / Unread</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
              <Flame className="w-5 h-5 text-emerald-600" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600">{stats.new || 0}</span>
            <span className="text-xs text-slate-500 font-medium">awaiting response</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">In Progress</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600">{(stats.contacted || 0) + (stats.inProgress || 0)}</span>
            <span className="text-xs text-slate-500 font-medium">active dialogue</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Converted</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600">
              <Check className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600">{stats.converted || 0}</span>
            <span className="text-xs text-slate-500 font-medium">won deals</span>
          </div>
        </div>

        <div className="p-5 bg-white border border-slate-200 rounded-xl shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Conversion Rate</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600">{stats.conversionRate || 0}%</span>
            <span className="text-xs text-slate-500 font-medium">pipeline velocity</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full md:max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search by prospect name, email, company or message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </form>

        <div className="flex items-center gap-3 w-full md:w-auto">
          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <select
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Statuses</option>
              <option value="new">New</option>
              <option value="contacted">Contacted</option>
              <option value="in_progress">In Progress</option>
              <option value="qualified">Qualified</option>
              <option value="converted">Converted</option>
              <option value="closed">Closed</option>
              <option value="spam">Spam</option>
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => {
                setSelectedPriority(e.target.value);
                setPage(1);
              }}
              className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>

          {(searchTerm || selectedStatus !== 'all' || selectedPriority !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedStatus('all');
                setSelectedPriority('all');
                setPage(1);
              }}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Leads Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Prospect</th>
                <th className="px-6 py-3.5">Company &amp; Phone</th>
                <th className="px-6 py-3.5">Inquiry Details</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Received</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading && leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                    Loading leads database...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-400">
                    <Inbox className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    No customer leads match the current criteria.
                  </td>
                </tr>
              ) : (
                leads.map((lead) => {
                  const statusInfo = STATUS_CONFIG[lead.status] || STATUS_CONFIG.new;
                  const priorityInfo = PRIORITY_CONFIG[lead.priority] || PRIORITY_CONFIG.medium;
                  return (
                    <tr key={lead._id} className="hover:bg-slate-50/70 transition-colors">
                      {/* Prospect */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{lead.name}</div>
                        <div className="text-xs text-slate-500 font-mono mt-0.5">{lead.email}</div>
                        <span className="inline-block mt-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                          {lead.source === 'website_demo_modal' ? 'Demo Modal' : 'Contact Form'}
                        </span>
                      </td>

                      {/* Company & Phone */}
                      <td className="px-6 py-4 text-slate-600">
                        {lead.company ? (
                          <div className="flex items-center gap-1.5 font-medium text-slate-800 text-xs">
                            <Building className="w-3.5 h-3.5 text-slate-400" />
                            {lead.company}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs italic">Individual</span>
                        )}
                        {lead.phone && (
                          <a
                            href={`https://wa.me/${lead.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 mt-1 font-mono font-medium"
                          >
                            <Phone className="w-3 h-3 text-emerald-500" />
                            {lead.phone}
                          </a>
                        )}
                      </td>

                      {/* Message Preview */}
                      <td className="px-6 py-4">
                        <div
                          onClick={() => setSelectedLead(lead)}
                          className="text-xs text-slate-700 max-w-xs truncate cursor-pointer hover:text-indigo-600"
                          title="Click to view full message"
                        >
                          {lead.message}
                        </div>
                        {lead.dedupeHits > 0 && (
                          <span className="text-[10px] text-amber-600 font-semibold mt-0.5 block">
                            ↻ {lead.dedupeHits} duplicate submit prevented
                          </span>
                        )}
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <select
                          value={lead.priority || 'medium'}
                          onChange={(e) => handlePriorityChange(lead._id, e.target.value)}
                          className={`text-xs font-semibold px-2 py-1 rounded-md border-0 cursor-pointer ${priorityInfo.bg}`}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <select
                          value={lead.status}
                          onChange={(e) => handleStatusChange(lead._id, e.target.value)}
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer ${statusInfo.bg}`}
                        >
                          <option value="new">New</option>
                          <option value="contacted">Contacted</option>
                          <option value="in_progress">In Progress</option>
                          <option value="qualified">Qualified</option>
                          <option value="converted">Converted</option>
                          <option value="closed">Closed</option>
                          <option value="spam">Spam</option>
                        </select>
                      </td>

                      {/* Received Date & DPDP */}
                      <td className="px-6 py-4 text-xs text-slate-500 whitespace-nowrap">
                        <div>{new Date(lead.createdAt).toLocaleDateString()}</div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(lead.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {lead.consent?.granted && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] text-emerald-600 font-medium mt-0.5"
                            title={`DPDP Act 2023 Consent Recorded: ${new Date(lead.consent.recordedAt).toLocaleString()}`}
                          >
                            <ShieldCheck className="w-3 h-3" /> DPDP
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                            title="View Lead Details & Notes"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(lead)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Delete Lead Record"
                          >
                            <Trash2 className="w-4 h-4" />
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

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing {leads.length} of {pagination.total} leads (Page {pagination.page} of {pagination.totalPages})
            </div>
            <div className="flex items-center gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 border border-slate-200 rounded-lg bg-white disabled:opacity-50 hover:bg-slate-50"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Slide-over Detail Modal */}
      {selectedLead && (
        <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/40 backdrop-blur-xs flex justify-end">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col overflow-y-auto">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                  {selectedLead.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-900">{selectedLead.name}</h3>
                  <p className="text-xs text-slate-500">{selectedLead.company || 'Individual Prospect'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedLead(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 flex-1">
              {/* Quick Contact & Status Bar */}
              <div className="grid grid-cols-2 gap-3 p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                <div>
                  <span className="text-slate-400 font-medium block">Email:</span>
                  <a href={`mailto:${selectedLead.email}`} className="text-indigo-600 font-mono font-medium hover:underline">
                    {selectedLead.email}
                  </a>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block">Phone / WhatsApp:</span>
                  {selectedLead.phone ? (
                    <a
                      href={`https://wa.me/${selectedLead.phone.replace(/[^0-9]/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 font-mono font-medium hover:underline flex items-center gap-1"
                    >
                      {selectedLead.phone} ↗
                    </a>
                  ) : (
                    <span className="text-slate-400 italic">Not provided</span>
                  )}
                </div>
              </div>

              {/* Status and Priority Changers */}
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Status</label>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleStatusChange(selectedLead._id, e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="new">New</option>
                    <option value="contacted">Contacted</option>
                    <option value="in_progress">In Progress</option>
                    <option value="qualified">Qualified</option>
                    <option value="converted">Converted</option>
                    <option value="closed">Closed</option>
                    <option value="spam">Spam</option>
                  </select>
                </div>

                <div className="flex-1">
                  <label className="text-xs font-semibold text-slate-600 block mb-1">Priority</label>
                  <select
                    value={selectedLead.priority || 'medium'}
                    onChange={(e) => handlePriorityChange(selectedLead._id, e.target.value)}
                    className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {/* Inquiry Message */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 block mb-2">
                  Inquiry Message:
                </label>
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 leading-relaxed whitespace-pre-wrap font-sans">
                  {selectedLead.message}
                </div>
              </div>

              {/* DPDP Consent & Audit Record */}
              <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-xl text-xs space-y-1.5">
                <div className="flex items-center gap-1.5 text-emerald-800 font-semibold">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  India DPDP Act, 2023 Consent Audit Trail
                </div>
                <div className="text-emerald-700">
                  Consent version: <strong>{selectedLead.consent?.version || 'DPDP-2023-v1'}</strong>
                </div>
                <div className="text-emerald-700">
                  Recorded at: {new Date(selectedLead.consent?.recordedAt || selectedLead.createdAt).toLocaleString()}
                </div>
                <div className="text-emerald-700 font-mono text-[11px]">
                  IP: {selectedLead.metadata?.ip || 'N/A'} • Agent: {selectedLead.metadata?.userAgent?.slice(0, 50) || 'N/A'}
                </div>
              </div>

              {/* Internal Staff Notes & Timeline */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <MessageSquare className="w-4 h-4" />
                    Staff Activity &amp; Internal Notes
                  </h4>
                  <span className="text-xs text-slate-400">{(selectedLead.notes || []).length} notes</span>
                </div>

                {/* Notes Thread */}
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {(selectedLead.notes || []).length === 0 ? (
                    <p className="text-xs text-slate-400 italic">No notes added yet. Add a note below.</p>
                  ) : (
                    selectedLead.notes.map((n, i) => (
                      <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-1">
                        <div className="flex items-center justify-between text-slate-500">
                          <span className="font-semibold text-slate-700">{n.authorName}</span>
                          <span>{new Date(n.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="text-slate-800">{n.note}</p>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Note Form */}
                <form onSubmit={handleAddNote} className="flex gap-2">
                  <input
                    type="text"
                    value={newNoteText}
                    onChange={(e) => setNewNoteText(e.target.value)}
                    placeholder="Add follow-up notes (e.g. Scheduled demo for Thursday)..."
                    className="flex-1 text-xs border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                  />
                  <button
                    type="submit"
                    disabled={addingNote || !newNoteText.trim()}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 disabled:opacity-50"
                  >
                    Post Note
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => handleDelete(selectedLead)}
                className="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Lead
              </button>
              <button
                onClick={() => setSelectedLead(null)}
                className="px-4 py-2 bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold hover:bg-slate-300"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
