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
  }
};

export default userApi;
