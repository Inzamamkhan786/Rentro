const asyncHandler = require('../../../src/utils/asyncHandler');

describe('asyncHandler', () => {
  it('should return a function', () => {
    const handler = asyncHandler(async () => {});
    expect(typeof handler).toBe('function');
  });

  it('should throw TypeError if argument is not a function', () => {
    expect(() => asyncHandler('not a function')).toThrow(TypeError);
    expect(() => asyncHandler(123)).toThrow(TypeError);
    expect(() => asyncHandler(null)).toThrow(TypeError);
  });

  it('should call the wrapped function with req, res, next', async () => {
    const mockFn = jest.fn().mockResolvedValue('result');
    const handler = asyncHandler(mockFn);

    const req = {};
    const res = {};
    const next = jest.fn();

    await handler(req, res, next);

    expect(mockFn).toHaveBeenCalledWith(req, res, next);
    expect(next).not.toHaveBeenCalled();
  });

  it('should call next with error when async function rejects', async () => {
    const error = new Error('Test error');
    const mockFn = jest.fn().mockRejectedValue(error);
    const handler = asyncHandler(mockFn);

    const next = jest.fn();
    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should call next with error when async function throws synchronously', async () => {
    const error = new Error('Sync throw');
    const mockFn = jest.fn().mockImplementation(async () => {
      throw error;
    });
    const handler = asyncHandler(mockFn);

    const next = jest.fn();
    await handler({}, {}, next);

    expect(next).toHaveBeenCalledWith(error);
  });

  it('should handle successful promise resolution', async () => {
    const mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    const mockFn = async (req, res) => {
      res.status(200).json({ success: true });
    };

    const handler = asyncHandler(mockFn);
    const next = jest.fn();

    await handler({}, mockRes, next);

    expect(mockRes.status).toHaveBeenCalledWith(200);
    expect(next).not.toHaveBeenCalled();
  });
});
