const ApiError = require('../../../src/utils/ApiError');

describe('ApiError', () => {
  describe('constructor', () => {
    it('should create an error with statusCode and message', () => {
      const error = new ApiError(400, 'Bad Request');
      expect(error).toBeInstanceOf(Error);
      expect(error).toBeInstanceOf(ApiError);
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
      expect(error.success).toBe(false);
      expect(error.isOperational).toBe(true);
      expect(error.errors).toEqual([]);
    });

    it('should include additional errors array', () => {
      const errors = ['Field 1 is required', 'Field 2 is invalid'];
      const error = new ApiError(400, 'Validation Error', errors);
      expect(error.errors).toEqual(errors);
    });

    it('should mark non-operational errors', () => {
      const error = new ApiError(500, 'Internal Error', [], false);
      expect(error.isOperational).toBe(false);
    });

    it('should capture stack trace', () => {
      const error = new ApiError(500, 'Test');
      expect(error.stack).toBeDefined();
    });
  });

  describe('static methods', () => {
    it('badRequest() should create 400 error', () => {
      const error = ApiError.badRequest('Invalid input');
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Invalid input');
    });

    it('badRequest() should use default message', () => {
      const error = ApiError.badRequest();
      expect(error.statusCode).toBe(400);
      expect(error.message).toBe('Bad Request');
    });

    it('badRequest() should include errors array', () => {
      const error = ApiError.badRequest('Error', ['detail']);
      expect(error.errors).toEqual(['detail']);
    });

    it('unauthorized() should create 401 error', () => {
      const error = ApiError.unauthorized('Not logged in');
      expect(error.statusCode).toBe(401);
      expect(error.message).toBe('Not logged in');
    });

    it('unauthorized() should use default message', () => {
      const error = ApiError.unauthorized();
      expect(error.message).toBe('Unauthorized');
    });

    it('forbidden() should create 403 error', () => {
      const error = ApiError.forbidden('Access denied');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('Access denied');
    });

    it('forbidden() should use default message', () => {
      const error = ApiError.forbidden();
      expect(error.message).toBe('Forbidden');
    });

    it('notFound() should create 404 error', () => {
      const error = ApiError.notFound('User not found');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
    });

    it('notFound() should use default message', () => {
      const error = ApiError.notFound();
      expect(error.message).toBe('Resource not found');
    });

    it('conflict() should create 409 error', () => {
      const error = ApiError.conflict('Email already exists');
      expect(error.statusCode).toBe(409);
      expect(error.message).toBe('Email already exists');
    });

    it('unprocessable() should create 422 error', () => {
      const error = ApiError.unprocessable('Bad data', ['field error']);
      expect(error.statusCode).toBe(422);
      expect(error.errors).toEqual(['field error']);
    });

    it('internal() should create 500 error with isOperational=false', () => {
      const error = ApiError.internal('Server crash');
      expect(error.statusCode).toBe(500);
      expect(error.isOperational).toBe(false);
    });

    it('internal() should use default message', () => {
      const error = ApiError.internal();
      expect(error.message).toBe('Internal Server Error');
    });
  });
});
