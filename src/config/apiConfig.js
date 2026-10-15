/**
 * Centralized Backend & API Configuration for CMS Admin Portal
 * Reads exclusively from environment variables (import.meta.env)
 */

const rawBackendUrl = (
  import.meta.env.VITE_BACKEND_URL ||
  import.meta.env.VITE_API_URL ||
  import.meta.env.VITE_CMS_API_URL ||
  ''
).trim().replace(/\/+$/, '');

function resolveBackendUrl() {
  const isBrowser = typeof window !== 'undefined';
  const isLocalHost = isBrowser && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

  if (rawBackendUrl) {
    if (isBrowser && !isLocalHost && (rawBackendUrl.includes('localhost') || rawBackendUrl.includes('127.0.0.1'))) {
      return '';
    }
    return rawBackendUrl;
  }

  if (!isBrowser || isLocalHost) {
    return 'http://localhost:5000';
  }

  return '';
}

export const BACKEND_URL = resolveBackendUrl();
export const API_BASE_URL = BACKEND_URL;
export const IS_BACKEND_CONFIGURED = Boolean(BACKEND_URL);

/**
 * Resolves full API endpoint URL
 * @param {string} endpoint - Path like '/api/admin/auth/login'
 * @returns {string} Fully qualified URL
 */
export function getApiUrl(endpoint = '') {
  if (!endpoint) return BACKEND_URL;
  if (endpoint.startsWith('http://') || endpoint.startsWith('https://')) {
    return endpoint;
  }
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return `${BACKEND_URL}${cleanEndpoint}`;
}

export default {
  BACKEND_URL,
  API_BASE_URL,
  getApiUrl,
};
