/**
 * Standardized API response wrapper.
 * Ensures consistent response format across all endpoints.
 */
class ApiResponse {
  /**
   * Create a success response
   * @param {number} statusCode - HTTP status code
   * @param {*} data - Response data
   * @param {string} message - Success message
   */
  constructor(statusCode, data, message = 'Success') {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
  }

  /**
   * 200 OK response
   */
  static ok(data, message = 'Success') {
    return new ApiResponse(200, data, message);
  }

  /**
   * 201 Created response
   */
  static created(data, message = 'Resource created successfully') {
    return new ApiResponse(201, data, message);
  }

  /**
   * 204 No Content response
   */
  static noContent(message = 'Resource deleted successfully') {
    return new ApiResponse(204, null, message);
  }

  /**
   * Paginated response
   * @param {Array} data - Array of items
   * @param {number} page - Current page
   * @param {number} limit - Items per page
   * @param {number} total - Total items
   */
  static paginated(data, page, limit, total) {
    return new ApiResponse(200, {
      items: data,
      pagination: {
        page: parseInt(page, 10),
        limit: parseInt(limit, 10),
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    }, 'Success');
  }
}

module.exports = ApiResponse;
