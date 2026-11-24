import axiosClient from './axiosClient';

export const userApi = {
  /**
   * Create a new Receptionist staff account for the current gym
   * @param {Object} data - { firstName, lastName, email, phoneNumber, password, confirmPassword }
   */
  createReceptionist: async (data) => {
    try {
      const response = await axiosClient.post('/user/receptionist', data);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Receptionist created successfully.'
      };
    } catch (error) {
      const respData = error.response?.data;
      const message = respData?.message || 'Failed to create receptionist.';
      const errors = respData?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  /**
   * Fetch all Receptionists for the current gym
   */
  getReceptionists: async () => {
    try {
      const response = await axiosClient.get('/user/receptionists');
      return {
        success: true,
        data: response.data?.data || [],
        message: response.data?.message
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        data: [],
        message: respData?.message || 'Failed to fetch receptionists.'
      };
    }
  },

  /**
   * Toggle active/inactive status of a staff user
   * @param {string} id - User Guid
   */
  toggleStatus: async (id) => {
    try {
      const response = await axiosClient.patch(`/user/${id}/status`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Status updated.'
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        message: respData?.message || 'Failed to update status.'
      };
    }
  }
};

export default userApi;
