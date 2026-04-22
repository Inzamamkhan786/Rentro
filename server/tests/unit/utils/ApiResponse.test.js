const ApiResponse = require('../../../src/utils/ApiResponse');

describe('ApiResponse', () => {
  describe('constructor', () => {
    it('should create a success response for status < 400', () => {
      const response = new ApiResponse(200, { id: 1 }, 'OK');
      expect(response.success).toBe(true);
      expect(response.statusCode).toBe(200);
      expect(response.data).toEqual({ id: 1 });
      expect(response.message).toBe('OK');
    });

    it('should create a failure response for status >= 400', () => {
      const response = new ApiResponse(404, null, 'Not Found');
      expect(response.success).toBe(false);
    });

    it('should use default message', () => {
      const response = new ApiResponse(200, {});
      expect(response.message).toBe('Success');
    });
  });

  describe('ok()', () => {
    it('should create 200 response', () => {
      const response = ApiResponse.ok({ name: 'Test' });
      expect(response.statusCode).toBe(200);
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Test');
    });

    it('should accept custom message', () => {
      const response = ApiResponse.ok(null, 'Custom message');
      expect(response.message).toBe('Custom message');
    });
  });

  describe('created()', () => {
    it('should create 201 response', () => {
      const response = ApiResponse.created({ id: 1 });
      expect(response.statusCode).toBe(201);
      expect(response.success).toBe(true);
      expect(response.message).toBe('Resource created successfully');
    });

    it('should accept custom message', () => {
      const response = ApiResponse.created({}, 'User created');
      expect(response.message).toBe('User created');
    });
  });

  describe('noContent()', () => {
    it('should create 204 response', () => {
      const response = ApiResponse.noContent();
      expect(response.statusCode).toBe(204);
      expect(response.data).toBeNull();
    });

    it('should accept custom message', () => {
      const response = ApiResponse.noContent('Removed');
      expect(response.message).toBe('Removed');
    });
  });

  describe('paginated()', () => {
    it('should create paginated response', () => {
      const items = [{ id: 1 }, { id: 2 }];
      const response = ApiResponse.paginated(items, 1, 10, 25);
      
      expect(response.statusCode).toBe(200);
      expect(response.data.items).toEqual(items);
      expect(response.data.pagination.page).toBe(1);
      expect(response.data.pagination.limit).toBe(10);
      expect(response.data.pagination.total).toBe(25);
      expect(response.data.pagination.totalPages).toBe(3);
      expect(response.data.pagination.hasNext).toBe(true);
      expect(response.data.pagination.hasPrev).toBe(false);
    });

    it('should handle last page correctly', () => {
      const response = ApiResponse.paginated([], 3, 10, 25);
      expect(response.data.pagination.hasNext).toBe(false);
      expect(response.data.pagination.hasPrev).toBe(true);
    });

    it('should handle single page', () => {
      const response = ApiResponse.paginated([{ id: 1 }], 1, 10, 1);
      expect(response.data.pagination.totalPages).toBe(1);
      expect(response.data.pagination.hasNext).toBe(false);
      expect(response.data.pagination.hasPrev).toBe(false);
    });

    it('should parse string page and limit', () => {
      const response = ApiResponse.paginated([], '2', '5', 20);
      expect(response.data.pagination.page).toBe(2);
      expect(response.data.pagination.limit).toBe(5);
    });
  });
});
