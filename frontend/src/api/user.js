import axiosClient from './axiosClient';

export const userApi = {
  /**
   * Create a new customer/member for the authenticated Receptionist's gym
   * @param {Object} data - { firstName, lastName, email, phoneNumber, dateOfBirth, gender, bloodGroup, address, emergencyContactName, emergencyContactPhone }
   */
  createMember: async (data) => {
    try {
      const response = await axiosClient.post('/user/members', data);
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
      const response = await axiosClient.get(`/user/members${queryString ? `?${queryString}` : ''}`);
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
      const response = await axiosClient.get(`/user/members/${id}`);
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
  },

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
   * Fetch single Receptionist details by ID for the current gym
   * @param {string} id - User Guid
   */
  getReceptionistById: async (id) => {
    try {
      const response = await axiosClient.get(`/user/receptionists/${id}`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        message: respData?.message || 'Failed to fetch receptionist details.'
      };
    }
  },

  /**
   * Update Receptionist details (firstName, lastName)
   * @param {string} id - User Guid
   * @param {Object} data - { firstName, lastName }
   */
  updateReceptionist: async (id, data) => {
    try {
      const response = await axiosClient.put(`/user/receptionists/${id}`, data);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Receptionist details updated successfully.'
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        message: respData?.message || 'Failed to update receptionist.',
        errors: respData?.errors || []
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
  },

  /**
   * Soft-delete a receptionist user from the current gym
   * @param {string} id - User Guid
   */
  deleteReceptionist: async (id) => {
    try {
      const response = await axiosClient.delete(`/user/${id}`);
      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Receptionist deleted successfully.'
      };
    } catch (error) {
      const respData = error.response?.data;
      return {
        success: false,
        message: respData?.message || 'Failed to delete receptionist.'
      };
    }
  },

  /**
   * Fetch paginated, sorted, filterable list of gym owners.
   * Calls GET /api/user/gymowners
   * @param {Object} params - Query parameters (search, status, sortBy, sortOrder, pageNumber, pageSize)
   */
  getGymOwners: async (params = {}) => {
    try {
      const queryParams = new URLSearchParams();

      if (params.search) {
        queryParams.append('search', params.search.trim());
      }
      if (params.status !== undefined && params.status !== null && params.status !== '') {
        queryParams.append('status', params.status);
      }
      if (params.sortBy) {
        queryParams.append('sortBy', params.sortBy);
      }
      if (params.sortOrder) {
        queryParams.append('sortOrder', params.sortOrder);
      }
      if (params.pageNumber) {
        queryParams.append('pageNumber', params.pageNumber);
      }
      if (params.pageSize) {
        queryParams.append('pageSize', params.pageSize);
      }

      const queryString = queryParams.toString();
      const endpoint = `/user/gymowners${queryString ? `?${queryString}` : ''}`;

      const response = await axiosClient.get(endpoint);

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error.message ||
        'Failed to fetch gym owners.';

      return {
        success: false,
        message,
        errors: error.response?.data?.errors || []
      };
    }
  },

  /**
   * Fetch full details of a specific gym owner and their connected gym.
   * Calls GET /api/user/gymowners/{id}
   * @param {string} id - The Gym Owner's GUID
   */
  getGymOwnerById: async (id) => {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Gym Owner ID is required.'
        };
      }

      const response = await axiosClient.get(`/user/gymowners/${id}`);

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error.message ||
        'Failed to fetch gym owner details.';

      return {
        success: false,
        message,
        errors: error.response?.data?.errors || []
      };
    }
  },

  /**
   * Approve a gym owner and activate their account.
   * Calls POST /api/user/gymowners/{id}/approve
   * @param {string} id - The Gym Owner's GUID
   */
  approveGymOwner: async (id) => {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Gym Owner ID is required.'
        };
      }

      const response = await axiosClient.post(`/user/gymowners/${id}/approve`);

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Gym owner approved successfully.'
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error.message ||
        'Failed to approve gym owner.';

      return {
        success: false,
        message,
        errors: error.response?.data?.errors || []
      };
    }
  },

  /**
   * Reject a gym owner application with optional rejection reason.
   * Calls POST /api/user/gymowners/{id}/reject
   * @param {string} id - The Gym Owner's GUID
   * @param {string} rejectionReason - Optional reason for rejection
   */
  rejectGymOwner: async (id, rejectionReason = '') => {
    try {
      if (!id) {
        return {
          success: false,
          message: 'Gym Owner ID is required.'
        };
      }

      const response = await axiosClient.post(`/user/gymowners/${id}/reject`, {
        rejectionReason: rejectionReason?.trim() || null
      });

      return {
        success: true,
        data: response.data?.data,
        message: response.data?.message || 'Gym owner application rejected.'
      };
    } catch (error) {
      const message =
        error.response?.data?.message ||
        (Array.isArray(error.response?.data?.errors) ? error.response.data.errors.join(', ') : null) ||
        error.message ||
        'Failed to reject gym owner.';

      return {
        success: false,
        message,
        errors: error.response?.data?.errors || []
      };
    }
  }
};

export default userApi;
