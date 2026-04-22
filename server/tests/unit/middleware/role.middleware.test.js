const { authorize } = require('../../../src/middleware/role.middleware');

describe('Role Middleware', () => {
  it('should allow access for matching role', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'admin' } };
    const res = {};
    const next = jest.fn();

    middleware(req, res, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should allow access for any matching role in list', () => {
    const middleware = authorize('admin', 'provider');
    const req = { user: { role: 'provider' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should deny access for non-matching role', () => {
    const middleware = authorize('admin');
    const req = { user: { role: 'consumer' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 403,
    }));
  });

  it('should deny access when no user on request', () => {
    const middleware = authorize('admin');
    const req = {};
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 401,
    }));
  });

  it('should throw error when no roles specified', () => {
    expect(() => authorize()).toThrow('At least one role must be specified');
  });

  it('should include role info in error message', () => {
    const middleware = authorize('admin', 'provider');
    const req = { user: { role: 'consumer' } };
    const next = jest.fn();

    middleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.message).toContain('admin');
    expect(error.message).toContain('provider');
    expect(error.message).toContain('consumer');
  });
});
