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

  it('maps an over-limit request body to 413', () => {
    const res = mockRes();
    const tooLarge = Object.assign(new Error('request entity too large'), {
      type: 'entity.too.large',
      status: 413,
    });
    errorMiddleware(tooLarge, req, res, next);
    expect(res.statusCode).toBe(413);
    expect(res.body).toMatchObject({ error: 'Payload too large' });
  });

  it('maps a multer file-size-limit error to 413', () => {
    const res = mockRes();
    const tooBig = Object.assign(new Error('File too large'), {
      name: 'MulterError',
      code: 'LIMIT_FILE_SIZE',
    });
    errorMiddleware(tooBig, req, res, next);
    expect(res.statusCode).toBe(413);
    expect(res.body).toMatchObject({ error: 'File too large (max 10 MB)' });
  });

  it('maps other multer errors to 400', () => {
    const res = mockRes();
    const badField = Object.assign(new Error('Unexpected field'), {
      name: 'MulterError',
      code: 'LIMIT_UNEXPECTED_FILE',
    });
    errorMiddleware(badField, req, res, next);
    expect(res.statusCode).toBe(400);
  });

  it('maps a MySQL oversized-packet error to 413', () => {
    const res = mockRes();
    const packet = Object.assign(new Error('packet too big'), {
      code: 'ER_NET_PACKET_TOO_LARGE',
    });
    errorMiddleware(packet, req, res, next);
    expect(res.statusCode).toBe(413);
    expect(res.body).toMatchObject({ error: 'Payload too large' });
  });

  it('maps a malformed JSON body to 400', () => {
    const res = mockRes();
    const badJson = Object.assign(new Error('Unexpected token'), {
      type: 'entity.parse.failed',
      status: 400,
    });
    errorMiddleware(badJson, req, res, next);
    expect(res.statusCode).toBe(400);
    expect(res.body).toMatchObject({ error: 'Invalid JSON body' });
  });

  it('falls back to 500 for an unknown error', () => {
    const res = mockRes();
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
    errorMiddleware(new Error('boom'), req, res, next);
    expect(res.statusCode).toBe(500);
    expect(res.body).toEqual({ error: 'Internal error' });
  });
});
