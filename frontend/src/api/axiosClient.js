import { getToken, clearSession } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';

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
      const response = await fetch(url, config);
      let data = null;

      try {
        data = await response.json();
      } catch {
        data = null;
      }

      if (!response.ok) {
        // Handle 401 Unauthorized (exclude login endpoints so bad credentials show inline error)
        if (
          response.status === 401 &&
          !endpoint.includes('/auth/admin-login') &&
          !endpoint.includes('/auth/gym-login')
        ) {
          clearSession();
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
            window.location.href = '/login?expired=true';
          }
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

