import axiosClient from './axiosClient';
import { saveSession, clearSession } from '../utils/tokenStorage';

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/admin-login', { email, password });
      const res = response.data;

      // Handle ApiResponse<LoginResponseDto> structure
      const loginData = res?.data;
      if (res && res.success && loginData && loginData.accessToken) {
        saveSession({
          accessToken: loginData.accessToken,
          refreshToken: loginData.refreshToken,
          user: loginData.user
        });

        return {
          success: true,
          data: loginData,
          message: res.message || 'Login successful'
        };
      } else {
        return {
          success: false,
          message: res?.message || 'Invalid response from server.'
        };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error.message ||
        'Login failed. Please check your credentials and try again.';

      return {
        success: false,
        message
      };
    }
  },

  logout: async () => {
    try {
      // Future hook: await axiosClient.post('/auth/logout');
    } catch {
      // Ignore network errors during logout
    } finally {
      clearSession();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }
};

export default authApi;
