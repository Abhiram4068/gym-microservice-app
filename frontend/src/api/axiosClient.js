import {
  getToken,
  setToken,
  getRefreshToken,
  setRefreshToken,
  getUserRole,
  UserRole,
  clearSession
} from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

let refreshPromise = null;

const isAuthEndpoint = (endpoint) =>
  endpoint.includes('/auth/admin-login') ||
  endpoint.includes('/auth/gym-login') ||
  endpoint.includes('/auth/refresh');

const redirectToLogin = () => {
  const role = getUserRole();
  const isSuperAdminContext =
    role === UserRole.SuperAdmin ||
    (typeof window !== 'undefined' && window.location.pathname.startsWith('/superadmin'));

  clearSession();

  if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
    window.location.href = isSuperAdminContext
      ? '/superadmin/login?expired=true'
      : '/login?expired=true';
  }
};

const refreshAccessToken = async () => {
  if (refreshPromise) {
    return refreshPromise;
  }

  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    return null;
  }

  refreshPromise = (async () => {
    try {
      const response = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken })
      });

      if (!response.ok) {
        return null;
      }

      const payload = await response.json();
      const tokenData = payload?.data;
      if (payload?.success && tokenData?.accessToken) {
        setToken(tokenData.accessToken);
        if (tokenData.refreshToken) {
          setRefreshToken(tokenData.refreshToken);
        }
        return tokenData.accessToken;
      }
      return null;
    } catch {
      return null;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const axiosClient = {
  baseURL: BASE_URL,

  async request(endpoint, options = {}) {
    const url = endpoint.startsWith('http') ? endpoint : `${this.baseURL}${endpoint}`;
    const token = getToken();

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {})
    };

    const config = {
      ...options,
      headers
    };

    if (options.credentials) {
      config.credentials = options.credentials;
    }

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    try {
      let response = await fetch(url, config);

      // On 401 for protected endpoints, try refreshing the access token once and retry
      if (response.status === 401 && !isAuthEndpoint(endpoint) && !options._retried) {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          const retryConfig = {
            ...config,
            headers: {
              ...headers,
              Authorization: `Bearer ${newAccessToken}`
            }
          };
          response = await fetch(url, retryConfig);
        } else {
          redirectToLogin();
        }
      }

      let data = null;
      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        if (response.status === 401 && !isAuthEndpoint(endpoint)) {
          redirectToLogin();
        }

        const error = new Error(
          data?.message ||
          (Array.isArray(data?.errors) ? data.errors.join(', ') : null) ||
          `Request failed with status ${response.status}`
        );
        error.response = {
          status: response.status,
          data: data
        };
        throw error;
      }

      return {
        status: response.status,
        data
      };
    } catch (error) {
      if (!error.response && error.name === 'TypeError') {
        const networkError = new Error('Network error: Unable to connect to the server. Please ensure the backend is running.');
        networkError.response = { status: 0, data: null };
        throw networkError;
      }
      throw error;
    }
  },

  post(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'POST',
      body,
      ...options
    });
  },

  get(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'GET',
      ...options
    });
  },

  put(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PUT',
      body,
      ...options
    });
  },

  patch(endpoint, body, options = {}) {
    return this.request(endpoint, {
      method: 'PATCH',
      ...(body !== undefined ? { body } : {}),
      ...options
    });
  },

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
};

export default axiosClient;
