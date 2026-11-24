import axiosClient from './axiosClient';

export const userApi = {
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
