import { NextFunction, Request, Response } from 'express';
import { errorMiddleware } from '../error.middleware';
import { ApiError } from '../../ult/api-error';

function mockRes(): Response & { statusCode: number; body: unknown } {
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return res as unknown as Response & { statusCode: number; body: unknown };
}

const req = {} as Request;
const next = jest.fn() as NextFunction;

describe('errorMiddleware', () => {
  it('maps an ApiError to its status and message', () => {
    const res = mockRes();
    errorMiddleware(ApiError.notFound('Customer not found'), req, res, next);
    expect(res.statusCode).toBe(404);
    expect(res.body).toMatchObject({ error: 'Customer not found' });
  });

  it('includes validation details when present', () => {
    const res = mockRes();
    errorMiddleware(ApiError.badRequest('Validation failed', { email: 'bad' }), req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: 'Validation failed', details: { email: 'bad' } });
  });

  it('maps a MySQL duplicate-entry error to 409', () => {
    const res = mockRes();
    const dupe = Object.assign(new Error('dupe'), { code: 'ER_DUP_ENTRY' });
    errorMiddleware(dupe, req, res, next);
    expect(res.statusCode).toBe(409);
  });

  it('maps a referenced-row error to 409', () => {
    const res = mockRes();
    const fk = Object.assign(new Error('fk'), { code: 'ER_ROW_IS_REFERENCED_2' });
    errorMiddleware(fk, req, res, next);
    expect(res.statusCode).toBe(409);
  });

  it('falls back to 500 for an unknown error', () => {
    const res = mockRes();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    errorMiddleware(new Error('boom'), req, res, next);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal error' });
  });
});
