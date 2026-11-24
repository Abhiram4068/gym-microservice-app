import { getToken } from '../utils/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5256/api';

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

    if (config.body && typeof config.body === 'object' && !(config.body instanceof FormData)) {
      config.body = JSON.stringify(config.body);
    }

    const response = await fetch(url, config);
    let data = null;

    try {
      data = await response.json();
    } catch {
      data = null;
    }

    if (!response.ok) {
      const error = new Error(data?.message || `Request failed with status ${response.status}`);
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

  delete(endpoint, options = {}) {
    return this.request(endpoint, {
      method: 'DELETE',
      ...options
    });
  }
};

export default axiosClient;
