import axiosClient from './axiosClient';
import { setToken, setRefreshToken } from '../utils/tokenStorage';

export const authApi = {
  login: async (email, password) => {
    try {
      const response = await axiosClient.post('/auth/admin-login', { email, password });
      const data = response.data;

      if (data && data.success && data.data && data.data.accessToken) {
        setToken(data.data.accessToken);

        if (data.data.refreshToken) {
          setRefreshToken(data.data.refreshToken);
        }

        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data?.message || 'Invalid response from server: Token missing.'
        };
      }
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'Login failed. Please check your credentials and try again.';

      return { success: false, message };
    }
  },

  registerGym: async (gymData) => {
    try {
      const response = await axiosClient.post('/user/gym-register', gymData);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const respData = error.response?.data;
      const message = respData?.message || 'Gym registration failed.';
      const errors = respData?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  }
};

export default authApi;
