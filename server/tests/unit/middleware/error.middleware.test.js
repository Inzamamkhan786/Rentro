const ApiError = require('../../../src/utils/ApiError');
const { errorHandler, notFoundHandler } = require('../../../src/middleware/error.middleware');

describe('Error Middleware', () => {
  let mockRes;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe('errorHandler', () => {
    it('should handle ApiError', () => {
      const error = ApiError.badRequest('Invalid input');
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'Invalid input',
      }));
    });

    it('should handle SequelizeValidationError', () => {
      const error = {
        name: 'SequelizeValidationError',
        errors: [
          { message: 'Name is required' },
          { message: 'Email is invalid' },
        ],
      };
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle SequelizeUniqueConstraintError', () => {
      const error = {
        name: 'SequelizeUniqueConstraintError',
        errors: [{ path: 'email' }],
      };
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(409);
    });

    it('should handle SequelizeForeignKeyConstraintError', () => {
      const error = {
        name: 'SequelizeForeignKeyConstraintError',
      };
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });

    it('should handle JsonWebTokenError', () => {
      const error = { name: 'JsonWebTokenError', message: 'jwt malformed' };
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should handle TokenExpiredError', () => {
      const error = { name: 'TokenExpiredError', message: 'jwt expired' };
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it('should default to 500 for unknown errors', () => {
      const error = new Error('Something went wrong');
      errorHandler(error, {}, mockRes, jest.fn());

      expect(mockRes.status).toHaveBeenCalledWith(500);
    });

    it('should include errors array when present', () => {
      const error = ApiError.badRequest('Validation', ['Error 1', 'Error 2']);
      errorHandler(error, {}, mockRes, jest.fn());

      const response = mockRes.json.mock.calls[0][0];
      expect(response.errors).toEqual(['Error 1', 'Error 2']);
    });
  });

  describe('notFoundHandler', () => {
    it('should call next with 404 error', () => {
      const req = { method: 'GET', originalUrl: '/api/nonexistent' };
      const next = jest.fn();

      notFoundHandler(req, {}, next);

      expect(next).toHaveBeenCalledWith(expect.objectContaining({
        statusCode: 404,
      }));
    });

    it('should include method and URL in error message', () => {
      const req = { method: 'POST', originalUrl: '/api/test' };
      const next = jest.fn();

      notFoundHandler(req, {}, next);

      const error = next.mock.calls[0][0];
      expect(error.message).toContain('POST');
      expect(error.message).toContain('/api/test');
    });
  });
});
