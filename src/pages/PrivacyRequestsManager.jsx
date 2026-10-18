import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  Search,
  Filter,
  RefreshCw,
  Clock,
  Mail,
  User,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ChevronRight,
  Eye,
  Calendar,
  FileText,
  Building,
  Check,
  X,
  ExternalLink,
  Shield,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

const STATUS_CONFIG = {
  received: {
    label: 'Received (New)',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
  under_review: {
    label: 'Under Review',
    bg: 'bg-blue-50 text-blue-800 border-blue-200',
    dot: 'bg-blue-500',
  },
  identity_verified: {
    label: 'Identity Verified',
    bg: 'bg-purple-50 text-purple-800 border-purple-200',
    dot: 'bg-purple-500',
  },
  in_progress: {
    label: 'In Investigation',
    bg: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    dot: 'bg-indigo-500',
  },
  resolved: {
    label: 'Fulfilled / Resolved',
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-500',
  },
  rejected: {
    label: 'Rejected',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    dot: 'bg-slate-400',
  },
  submitted: {
    label: 'Submitted (New)',
    bg: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-500',
  },
};

const REQUEST_TYPE_LABELS = {
  'Data Access Request': { label: 'Data Access & Summary (§11)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  'Data Correction Request': { label: 'Correction & Updating (§12)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  'Data Erasure Request': { label: 'Erasure & Right to be Forgotten (§12)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  'Consent Withdrawal': { label: 'Consent Withdrawal (§6(4))', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  'Privacy Complaint': { label: 'General Grievance / Inquiry (§13)', color: 'text-teal-700 bg-teal-50 border-teal-200' },
  'Other': { label: 'Other Privacy Request', color: 'text-slate-700 bg-slate-50 border-slate-200' },
  access: { label: 'Data Access & Summary (§11)', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  correction: { label: 'Correction & Updating (§12)', color: 'text-purple-700 bg-purple-50 border-purple-200' },
  erasure: { label: 'Erasure & Right to be Forgotten (§12)', color: 'text-rose-700 bg-rose-50 border-rose-200' },
  consent_withdrawal: { label: 'Consent Withdrawal (§6(4))', color: 'text-amber-700 bg-amber-50 border-amber-200' },
  grievance: { label: 'General Grievance / Inquiry (§13)', color: 'text-teal-700 bg-teal-50 border-teal-200' },
};

export default function PrivacyRequestsManager() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [channelFilter, setChannelFilter] = useState('all');
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState(null);

  const fetchRequests = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = {};
      if (statusFilter !== 'all') params.status = statusFilter;
      if (typeFilter !== 'all') params.requestType = typeFilter;
      if (channelFilter !== 'all') params.channel = channelFilter;
      const res = await api.getPrivacyRequests(params);
      setRequests(res.requests || []);
    } catch (err) {
      setError(err.message || 'Failed to fetch privacy requests');
    } finally {
      setLoading(false);
    }
  }, [statusFilter, typeFilter, channelFilter]);

  useEffect(() => {
    fetchRequests();
  }, [fetchRequests]);

  const handleOpenDetail = (req) => {
    setSelectedRequest(req);
    setUpdateStatus(req.status);
    setResolutionNotes(req.resolutionNotes || '');
    setFeedbackMsg(null);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;
    try {
      setUpdating(true);
      const updated = await api.updatePrivacyRequest(selectedRequest._id, {
        status: updateStatus,
        resolutionNotes,
      });
      setFeedbackMsg({ type: 'success', text: 'Privacy request successfully updated and audit logged.' });
      setSelectedRequest(updated.request);
      fetchRequests();
    } catch (err) {
      setFeedbackMsg({ type: 'error', text: err.message || 'Failed to update request' });
    } finally {
      setUpdating(false);
    }
  };

  const filteredRequests = requests.filter((r) => {
    if (channelFilter !== 'all') {
      const ch = (r.channel || r.metadata?.channel || (r.metadata?.source?.includes('portfolio') ? 'portfolio' : 'saas_crm')).toLowerCase();
      if (ch !== channelFilter.toLowerCase()) return false;
    }
    const q = search.toLowerCase();
    const applicantName = (r.name || r.fullName || '').toLowerCase();
    const requestMessage = (r.description || r.message || '').toLowerCase();
    return (
      r.ticketId?.toLowerCase().includes(q) ||
      applicantName.includes(q) ||
      r.email?.toLowerCase().includes(q) ||
      requestMessage.includes(q)
    );
  });

  // Calculate SLA countdown
  const getSlaIndicator = (slaDate, status) => {
    if (status === 'resolved' || status === 'rejected') {
      return { label: 'Closed', color: 'text-slate-500 bg-slate-50 border-slate-200' };
    }
    const now = new Date();
    const due = new Date(slaDate);
    const diffDays = Math.ceil((due - now) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { label: `Breached (${Math.abs(diffDays)}d overdue)`, color: 'text-rose-700 bg-rose-50 border-rose-300 font-bold' };
    }
    if (diffDays <= 3) {
      return { label: `${diffDays}d remaining (Critical)`, color: 'text-amber-700 bg-amber-50 border-amber-300 font-semibold' };
    }
    return { label: `${diffDays}d remaining`, color: 'text-emerald-700 bg-emerald-50 border-emerald-200' };
  };

  const totalCount = requests.length;
  const pendingCount = requests.filter(r => r.status === 'received' || r.status === 'submitted').length;
  const inProgressCount = requests.filter(r => r.status === 'in_progress' || r.status === 'under_review' || r.status === 'identity_verified').length;
  const resolvedCount = requests.filter(r => r.status === 'resolved').length;

  return (
    <div className="space-y-6">
      {/* ── Page Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <Shield className="w-3.5 h-3.5" /> DPDP Act 2023 & Rules 2025 Mandated
            </span>
            <span className="text-xs text-slate-400">15-Day Statutory Redressal SLA</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Data Subject Rights & Grievance Portal
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage, investigate, and record resolution outcomes for statutory privacy requests submitted under Sections 6(4), 11, 12, & 13.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchRequests}
            disabled={loading}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-sm font-medium text-slate-700 bg-slate-50 border border-slate-200 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* ── Stats Summary Cards ─────────────────────────────────── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-bold text-slate-900">{totalCount}</p>
          <span className="text-xs text-slate-400">All received requests</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Pending Action</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-bold text-amber-700">{pendingCount}</p>
          <span className="text-xs text-amber-600/80 font-medium">Awaiting initial review</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">In Progress</span>
            <AlertTriangle className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-bold text-indigo-700">{inProgressCount}</p>
          <span className="text-xs text-indigo-600/80">Active investigations</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Fulfilled SLA</span>
            <CheckCircle className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-bold text-emerald-700">{resolvedCount}</p>
          <span className="text-xs text-emerald-600/80">Closed compliance cases</span>
        </div>
      </div>

      {/* ── Filters & Search ─────────────────────────────────────── */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search Ticket ID, name, email..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Filter className="w-3.5 h-3.5" />
            <span>Filter:</span>
          </div>

          <select
            value={channelFilter}
            onChange={(e) => setChannelFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Channels</option>
            <option value="portfolio">Portfolio Channel</option>
            <option value="saas_crm">SaaS CRM Channel</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Statuses</option>
            <option value="submitted">Submitted</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          >
            <option value="all">All Request Types</option>
            <option value="access">Access (§11)</option>
            <option value="correction">Correction (§12)</option>
            <option value="erasure">Erasure (§12)</option>
            <option value="consent_withdrawal">Consent Withdrawal (§6(4))</option>
            <option value="grievance">Grievance (§13)</option>
          </select>
        </div>
      </div>

      {/* ── Table of Requests ─────────────────────────────────────── */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-600" />
            <p className="text-sm">Loading statutory grievance records...</p>
          </div>
        ) : error ? (
          <div className="p-8 text-center text-rose-600">
            <AlertTriangle className="w-6 h-6 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : filteredRequests.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <ShieldAlert className="w-10 h-10 mx-auto mb-3 text-slate-300" />
            <p className="text-base font-semibold text-slate-700">No Privacy Requests Found</p>
            <p className="text-xs text-slate-400 mt-1">
              New submissions from the public privacy rights form will populate here with 15-business-day statutory tracking.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4">Ticket ID</th>
                  <th className="py-3 px-4">Channel</th>
                  <th className="py-3 px-4">Applicant</th>
                  <th className="py-3 px-4">Statutory Right</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">SLA Deadline</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRequests.map((r) => {
                  const statusConf = STATUS_CONFIG[r.status] || STATUS_CONFIG.submitted;
                  const typeConf = REQUEST_TYPE_LABELS[r.requestType] || { label: r.requestType, color: 'text-slate-700 bg-slate-50 border-slate-200' };
                  const sla = getSlaIndicator(r.slaResolutionDueAt, r.status);

                  return (
                    <tr
                      key={r._id}
                      className="hover:bg-slate-50/60 transition-colors cursor-pointer"
                      onClick={() => handleOpenDetail(r)}
                    >
                      <td className="py-3.5 px-4 font-mono text-xs font-bold text-indigo-700">
                        {r.ticketId}
                      </td>
                      <td className="py-3.5 px-4">
                        {(r.channel === 'portfolio' || r.metadata?.channel === 'portfolio' || r.metadata?.source?.includes('portfolio')) ? (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-purple-50 text-purple-700 border-purple-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                            Portfolio
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                            SaaS CRM
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-slate-900">{r.name || r.fullName}</div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {r.email}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs font-semibold border ${typeConf.color}`}>
                          {typeConf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusConf.bg}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConf.dot}`} />
                          {statusConf.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`inline-flex px-2 py-0.5 rounded-lg text-xs border ${sla.color}`}>
                          {sla.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-xs text-slate-500 whitespace-nowrap">
                        {new Date(r.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenDetail(r);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          View
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Detail & Resolution Modal / Drawer ─────────────────────── */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-slate-100">
              <div>
                <span className="font-mono text-xs font-bold text-indigo-600">
                  {selectedRequest.ticketId}
                </span>
                <h3 className="text-xl font-bold text-slate-900">
                  Statutory Privacy Grievance Dossier
                </h3>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Statutory Info Box */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Isolated Channel:</span>
                  <span className="font-bold text-slate-900">
                    {(selectedRequest.channel === 'portfolio' || selectedRequest.metadata?.channel === 'portfolio' || selectedRequest.metadata?.source?.includes('portfolio'))
                      ? 'Portfolio Privacy Portal'
                      : 'SaaS CRM Marketing Portal'}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Statutory Right:</span>
                  <span className="font-bold text-slate-900">
                    {REQUEST_TYPE_LABELS[selectedRequest.requestType]?.label || selectedRequest.requestType}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">SLA Due Date:</span>
                  <span className="font-bold text-rose-700">
                    {new Date(selectedRequest.slaResolutionDueAt).toLocaleDateString('en-IN', {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-semibold">Statutory Standard:</span>
                  <span>DPDP Act 2023 §13 & DPDP Rules 2025 Rule 11 (Max 15 Business Days)</span>
                </div>
              </div>

              {/* Applicant Profile */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <label className="text-slate-400 font-medium">Applicant Full Name</label>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedRequest.name || selectedRequest.fullName}</p>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Verified Email</label>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedRequest.email}</p>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Phone / WhatsApp</label>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">{selectedRequest.phone || 'Not provided'}</p>
                </div>
                <div>
                  <label className="text-slate-400 font-medium">Submission Timestamp</label>
                  <p className="font-semibold text-slate-900 text-sm mt-0.5">
                    {new Date(selectedRequest.createdAt).toLocaleString('en-IN')}
                  </p>
                </div>
              </div>

              {/* Data Subject Request Message */}
              <div>
                <label className="text-xs text-slate-400 font-medium">Detailed Request Description</label>
                <div className="mt-1 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
                  {selectedRequest.description || selectedRequest.message}
                </div>
              </div>

              {/* Action Form */}
              <form onSubmit={handleUpdate} className="space-y-4 pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900">Grievance Redressal Officer Action</h4>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Update Investigation Status
                  </label>
                  <select
                    value={updateStatus}
                    onChange={(e) => setUpdateStatus(e.target.value)}
                    className="w-full text-sm font-medium bg-white border border-slate-300 rounded-xl px-3 py-2 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="received">Received (Awaiting review)</option>
                    <option value="under_review">Under Review (Initial triage)</option>
                    <option value="identity_verified">Identity Verified (Identity confirmed)</option>
                    <option value="in_progress">In Investigation (Active technical audit)</option>
                    <option value="resolved">Fulfilled / Resolved (Data deleted / provided / corrected)</option>
                    <option value="rejected">Rejected (Legally non-actionable or malicious)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Compliance Resolution Notes & Legal Justification
                  </label>
                  <textarea
                    rows={3}
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Enter technical fulfillment steps taken (e.g. database anonymization complete, export PDF emailed to data principal, etc.)..."
                    className="w-full p-3 text-sm bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>

                {feedbackMsg && (
                  <div
                    className={`p-3 rounded-xl text-xs font-medium ${
                      feedbackMsg.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}
                  >
                    {feedbackMsg.text}
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedRequest(null)}
                    className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 rounded-xl hover:bg-slate-100"
                  >
                    Close
                  </button>
                  <button
                    type="submit"
                    disabled={updating}
                    className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm transition-colors disabled:opacity-50"
                  >
                    {updating ? 'Recording Audit...' : 'Save Resolution Outcome'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
