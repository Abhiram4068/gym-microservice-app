import axiosClient from './axiosClient';

export const membersApi = {
  /**
   * Create a new member for the authenticated Receptionist's gym (Members Service)
   * @param {Object} data - { firstName, lastName, email, phoneNumber, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone }
   */
  createMember: async (data) => {
    try {
      const response = await axiosClient.post('/members', data);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Member created successfully.'
      };
    } catch (error) {
      const respData = error.response?.data;
      const message = respData?.message || 'Failed to create member.';
      const errors = respData?.errors || [];
      return {
        success: false,
        message,
        errors
      };
    }
  },

  /**
   * Fetch paginated, sorted, filterable, and searchable members for the authenticated Receptionist's gym
   * @param {Object} params - { search, gender, bloodGroup, status, sortBy, sortOrder, pageNumber, pageSize }
   */
  getMembers: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.search) queryParams.append('search', params.search.trim());
      if (params.gender !== undefined && params.gender !== null && params.gender !== '') queryParams.append('gender', params.gender);
      if (params.bloodGroup !== undefined && params.bloodGroup !== null && params.bloodGroup !== '') queryParams.append('bloodGroup', params.bloodGroup);
      if (params.status !== undefined && params.status !== null && params.status !== '') queryParams.append('status', params.status);
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);
      if (params.pageNumber) queryParams.append('pageNumber', params.pageNumber);
      if (params.pageSize) queryParams.append('pageSize', params.pageSize);

      const queryString = queryParams.toString();
      const response = await axiosClient.get(`/members${queryString ? `?${queryString}` : ''}`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        data: null,
        message: respData?.message || 'Failed to fetch members.'
      };
    }
  },

  /**
   * Fetch a single member by ID
   * @param {string} id - Member Guid
   */
  getMemberById: async (id) => {
    try {
      const response = await axiosClient.get(`/members/${id}`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        message: respData?.message || 'Failed to fetch member.'
      };
    }
  }
};
