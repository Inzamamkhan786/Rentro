const Joi = require('joi');
const { validate } = require('../../../src/middleware/validate.middleware');

describe('Validate Middleware', () => {
  const schema = {
    body: Joi.object({
      name: Joi.string().required(),
      email: Joi.string().email().required(),
      age: Joi.number().integer().min(18).optional(),
    }),
  };

  it('should pass with valid body', () => {
    const middleware = validate(schema);
    const req = { body: { name: 'Test', email: 'test@test.com' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should fail with missing required fields', () => {
    const middleware = validate(schema);
    const req = { body: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
    expect(error.errors.length).toBeGreaterThan(0);
  });

  it('should fail with invalid email', () => {
    const middleware = validate(schema);
    const req = { body: { name: 'Test', email: 'invalid' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({
      statusCode: 400,
    }));
  });

  it('should strip unknown fields', () => {
    const middleware = validate(schema);
    const req = { body: { name: 'Test', email: 'test@test.com', unknown: 'field' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
    expect(req.body.unknown).toBeUndefined();
  });

  it('should validate query parameters', () => {
    const querySchema = {
      query: Joi.object({
        page: Joi.number().integer().min(1).required(),
      }),
    };
    const middleware = validate(querySchema);
    const req = { query: { page: '1' } };
    const next = jest.fn();

    middleware(req, {}, next);

    expect(next).toHaveBeenCalledWith();
  });

  it('should fail with invalid query params', () => {
    const querySchema = {
      query: Joi.object({
        page: Joi.number().integer().min(1).required(),
      }),
    };
    const middleware = validate(querySchema);
    const req = { query: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.statusCode).toBe(400);
  });

  it('should include field names in errors', () => {
    const middleware = validate(schema);
    const req = { body: {} };
    const next = jest.fn();

    middleware(req, {}, next);

    const error = next.mock.calls[0][0];
    expect(error.errors[0]).toHaveProperty('field');
    expect(error.errors[0]).toHaveProperty('message');
  });
});
