// API Client with automatic CSRF token injection and credentials support

function getCookie(name) {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
  return match ? decodeURIComponent(match[3]) : null;
}

export async function request(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : endpoint;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  // Double-submit CSRF cookie injection on mutating requests
  const method = (options.method || 'GET').toUpperCase();
  if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(method)) {
    const csrfToken = getCookie('gyanvani_csrf_token');
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken;
    }
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include', // Guarantees HttpOnly session cookie transmission
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

export const api = {
  // Authentication
  getCsrf: () => request('/api/admin/auth/csrf'),
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
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/audit-logs?${query}`);
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

  // Cookie Consent Management (GDPR/DPDP/CCPA Compliance)
  getCookieConsents: (params = {}) => {
    const query = new URLSearchParams(params).toString();
    return request(`/api/admin/cookies?${query}`);
  },
  getCookieAnalytics: () => request('/api/admin/cookies/analytics'),
  deleteConsentRecord: (id) => request(`/api/admin/cookies/${id}`, { method: 'DELETE' }),

  // Website Theme Management
  getThemeSettings: () => request('/api/admin/settings/theme'),
  updateThemeSettings: (data) => request('/api/admin/settings/theme', { method: 'PUT', body: JSON.stringify(data) }),
};
