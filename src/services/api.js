// API Client with automatic CSRF token injection and credentials support
import { getApiUrl, BACKEND_URL } from '../config/apiConfig';

let memoryCsrfToken = null;

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

// Internal raw fetch — no retry, used by refreshAndGetCsrf
async function rawRequest(url, fetchOptions) {
  const response = await fetch(url, {
    ...fetchOptions,
    credentials: 'include',
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  if (!response.ok) {
    const errorMsg = data?.error || (typeof data === 'string' ? data : 'Request failed');
    const err = new Error(errorMsg);
    err.status = response.status;
    err.code = data?.code;
    err.data = data;
    throw err;
  }

  return data;
}

// Silently refresh CSRF token from the server and update memoryCsrfToken
async function refreshCsrfToken() {
  try {
    const csrfUrl = getApiUrl('/api/admin/auth/csrf');
    const res = await fetch(csrfUrl, { credentials: 'include' });
    if (res.ok) {
      const data = await res.json();
      if (data?.csrfToken) {
        memoryCsrfToken = data.csrfToken;
      }
    }
  } catch (_) {
    // Ignore refresh errors — original error will surface
  }
}

export async function request(endpoint, options = {}) {
  const url = getApiUrl(endpoint);
  const method = (options.method || 'GET').toUpperCase();

  const buildHeaders = () => {
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      const csrfToken = memoryCsrfToken || getCookie('gyanvani_csrf_token');
      if (csrfToken) {
        headers['X-CSRF-Token'] = csrfToken;
      }
    }
    return headers;
  };

  const fetchOptions = { ...options, headers: buildHeaders(), credentials: 'include' };

  try {
    return await rawRequest(url, fetchOptions);
  } catch (err) {
    // On CSRF failure or stale token (403 CSRF_INVALID), refresh token and retry once
    const isCsrfError =
      err.status === 403 && (err.code === 'CSRF_INVALID' || err.message?.includes('CSRF'));
    // On connection reset / network failure, also retry once with fresh CSRF
    const isNetworkError = !err.status && err.message && (
      err.message.includes('Failed to fetch') ||
      err.message.includes('NetworkError') ||
      err.message.includes('ERR_CONNECTION_RESET')
    );

    if ((isCsrfError || isNetworkError) && ['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
      console.warn('[API] Refreshing CSRF token and retrying request:', endpoint);
      await refreshCsrfToken();
      // Short delay to ensure backend has recovered if connection was reset
      await new Promise((r) => setTimeout(r, 400));
      const retryOptions = { ...options, headers: buildHeaders(), credentials: 'include' };
      return await rawRequest(url, retryOptions);
    }

    throw err;
  }
}

export const api = {
  // Authentication
  getCsrf: async () => {
    const data = await request('/api/admin/auth/csrf');
    if (data?.csrfToken) {
      memoryCsrfToken = data.csrfToken;
    }
    return data;
  },
  login: (credentials) => request('/api/admin/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  logout: () => request('/api/admin/auth/logout', { method: 'POST' }),
  getMe: () => request('/api/admin/auth/me'),
  forgotPassword: (body) => request('/api/admin/auth/forgot-password', { method: 'POST', body: JSON.stringify(body) }),
  resetPassword: (body) => request('/api/admin/auth/reset-password', { method: 'POST', body: JSON.stringify(body) }),

  // Dynamic Navigation Menus
  getMenuConfig: () => request('/api/admin/menus/config'),
  getMenus: () => request('/api/admin/menus'),
  createMenuItem: (data) => request('/api/admin/menus', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id, data) => request(`/api/admin/menus/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteMenuItem: (id) => request(`/api/admin/menus/${id}`, { method: 'DELETE' }),
  reorderMenus: (items) => request('/api/admin/menus/reorder', { method: 'PATCH', body: JSON.stringify({ items }) }),

  // Users Management
  getUsers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/users?${query}`);
  },
  getUserById: (id) => request(`/api/admin/users/${id}`),
  createUser: (data) => request('/api/admin/users', { method: 'POST', body: JSON.stringify(data) }),
  updateUser: (id, data) => request(`/api/admin/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteUser: (id) => request(`/api/admin/users/${id}`, { method: 'DELETE' }),

  // Roles & Permissions
  getRoles: () => request('/api/admin/roles'),
  createRole: (data) => request('/api/admin/roles', { method: 'POST', body: JSON.stringify(data) }),
  updateRole: (id, data) => request(`/api/admin/roles/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRole: (id) => request(`/api/admin/roles/${id}`, { method: 'DELETE' }),
  getPermissions: () => request('/api/admin/permissions'),

  // Audit Logs
  getAuditLogs: (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    return request(`/api/admin/audit-logs?${query}`);
  },
  getAuditStats: () => request('/api/admin/audit-logs/stats'),
  downloadAuditExport: async (params = {}) => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== null && v !== '')
    );
    const query = new URLSearchParams(cleanParams).toString();
    const url = getApiUrl(`/api/admin/audit-logs/export?${query}`);
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(errorText || 'Failed to export audit logs');
    }
    const blob = await res.blob();
    const disposition = res.headers.get('content-disposition');
    let filename = `security-audit-report-${new Date().toISOString().slice(0, 10)}.csv`;
    if (disposition && disposition.includes('filename=')) {
      const match = disposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) filename = match[1];
    }
    const downloadUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.URL.revokeObjectURL(downloadUrl);
  },


  // Settings
  getSettings: () => request('/api/admin/settings'),
  updateSettings: (data) => request('/api/admin/settings', { method: 'PATCH', body: JSON.stringify(data) }),

  // CMS Articles & Posts
  getPosts: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/posts?${query}`);
  },
  getPostById: (id) => request(`/api/admin/posts/${id}`),
  createPost: (data) => request('/api/admin/posts', { method: 'POST', body: JSON.stringify(data) }),
  updatePost: (id, data) => request(`/api/admin/posts/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  publishPost: (id) => request(`/api/admin/posts/${id}/publish`, { method: 'POST' }),
  unpublishPost: (id) => request(`/api/admin/posts/${id}/unpublish`, { method: 'POST' }),
  deletePost: (id) => request(`/api/admin/posts/${id}`, { method: 'DELETE' }),
  getRevisions: (id) => request(`/api/admin/posts/${id}/revisions`),
  rollbackRevision: (id, version) => request(`/api/admin/posts/${id}/revisions/${version}/rollback`, { method: 'POST' }),
  getPreviewToken: (id) => request(`/api/admin/posts/${id}/preview-token`),
  getPostsAnalytics: () => request('/api/admin/posts/analytics/summary'),
  pingPostIndexNow: (id) => request(`/api/admin/posts/${id}/ping-indexnow`, { method: 'POST' }),

  // CMS Categories
  getCategories: () => request('/api/admin/categories'),
  createCategory: (data) => request('/api/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id, data) => request(`/api/admin/categories/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCategory: (id) => request(`/api/admin/categories/${id}`, { method: 'DELETE' }),

  // CMS Media Library
  getMedia: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/media?${query}`);
  },
  uploadMedia: (data) => request('/api/admin/media/upload', { method: 'POST', body: JSON.stringify(data) }),
  deleteMedia: (id) => request(`/api/admin/media/${id}`, { method: 'DELETE' }),

  // Portfolio Assets (Resume & Intro Video)
  getPortfolioSiteMedia: () => request('/api/admin/media/portfolio'),
  updatePortfolioSiteMedia: (data) => request('/api/admin/media/portfolio', { method: 'PUT', body: JSON.stringify(data) }),
  uploadPortfolioResume: (data) => request('/api/admin/media/portfolio/upload-resume', { method: 'POST', body: JSON.stringify(data) }),
  uploadPortfolioVideo: (data) => request('/api/admin/media/portfolio/upload-video', { method: 'POST', body: JSON.stringify(data) }),

  // Cookie Consent Management (GDPR/DPDP/CCPA Compliance)
  getCookieConsents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/cookies?${query}`);
  },
  getCookieAnalytics: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/cookies/analytics${query ? '?' + query : ''}`);
  },
  deleteConsentRecord: (id) => request(`/api/admin/cookies/${id}`, { method: 'DELETE' }),

  // Website Theme Management
  getThemeSettings: () => request('/api/admin/settings/theme'),
  updateThemeSettings: (data) => request('/api/admin/settings/theme', { method: 'PUT', body: JSON.stringify(data) }),

  // Newsletter & Subscribers Management
  getSubscribers: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/subscribers?${query}`);
  },
  getSubscriberStats: () => request('/api/admin/subscribers/stats'),
  updateSubscriberStatus: (id, status, reason) => request(`/api/admin/subscribers/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status, reason }),
  }),
  deleteSubscriber: (id) => request(`/api/admin/subscribers/${id}`, { method: 'DELETE' }),
  getExportSubscribersUrl: (status = 'all') => getApiUrl(`/api/admin/subscribers/export?status=${status}`),

  // Leads & Customer Inquiries Management
  getLeads: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/leads?${query}`);
  },
  getLeadStats: (params = {}) => {
    const query = typeof params === 'string' ? `channel=${encodeURIComponent(params)}` : new URLSearchParams(params).toString();
    return request(`/api/admin/leads/stats${query ? '?' + query : ''}`);
  },
  getLeadById: (id) => request(`/api/admin/leads/${id}`),
  updateLead: (id, data) => request(`/api/admin/leads/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  addLeadNote: (id, note) => request(`/api/admin/leads/${id}/notes`, {
    method: 'POST',
    body: JSON.stringify({ note }),
  }),
  deleteLead: (id) => request(`/api/admin/leads/${id}`, { method: 'DELETE' }),
  getExportLeadsUrl: (status = 'all', channel = 'all') => getApiUrl(`/api/admin/leads/export?status=${status}&channel=${channel}`),

  // Enterprise Dynamic Landing Page CMS
  getLandingPageDraft: () => request('/api/admin/landing-page/draft'),
  updateLandingPageDraft: (data) => request('/api/admin/landing-page/draft', { method: 'PUT', body: JSON.stringify(data) }),
  updateDraftLandingPage: (data) => request('/api/admin/landing-page/draft', { method: 'PUT', body: JSON.stringify(data) }),
  publishLandingPage: (data) => request('/api/admin/landing-page/publish', { method: 'POST', body: JSON.stringify(data) }),
  getLandingPageRevisions: () => request('/api/admin/landing-page/revisions'),
  rollbackLandingPageRevision: (version) => request(`/api/admin/landing-page/revisions/${version}/rollback`, { method: 'POST' }),
  getLandingPagePreview: () => request('/api/admin/landing-page/preview'),

  // DPDP Act 2023 / Data Subject Rights (DSR) Grievance Management
  getPrivacyRequests: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/privacy-requests?${query}`);
  },
  updatePrivacyRequest: (id, data) => request(`/api/admin/privacy-requests/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
};
