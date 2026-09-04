import { NextFunction, Request, Response } from 'express';
import { corsMiddleware } from '../cors.middleware';

function mockReq(method: string, headers: Record<string, string> = {}): Request {
  const lower: Record<string, string> = {};
  for (const [k, v] of Object.entries(headers)) lower[k.toLowerCase()] = v;
  return {
    method,
    header: (name: string) => lower[name.toLowerCase()],
  } as unknown as Request;
}

function mockRes(): Response & { headers: Record<string, string>; statusCode: number; ended: boolean } {
  const res = {
    headers: {} as Record<string, string>,
    statusCode: 0,
    ended: false,
    setHeader(name: string, value: string) {
      this.headers[name] = value;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    send() {
      this.ended = true;
      return this;
    },
  };
  return res as unknown as Response & {
    headers: Record<string, string>;
    statusCode: number;
    ended: boolean;
  };
}

describe('corsMiddleware', () => {
  it('reflects the request Origin and always advertises the allowed methods', () => {
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    corsMiddleware(mockReq('GET', { Origin: 'http://localhost:3000' }), res, next);

    expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:3000');
    expect(res.headers['Access-Control-Allow-Methods']).toContain('DELETE');
    expect(next).toHaveBeenCalledTimes(1);
  });

  it('echoes requested headers on a preflight and short-circuits with 204', () => {
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    corsMiddleware(
      mockReq('OPTIONS', {
        Origin: 'http://localhost:3000',
        'Access-Control-Request-Headers': 'authorization,content-type',
      }),
      res,
      next,
    );

    expect(res.statusCode).toBe(204);
    expect(res.ended).toBe(true);
    expect(res.headers['Access-Control-Allow-Headers']).toBe('authorization,content-type');
    expect(next).not.toHaveBeenCalled();
  });

  it('passes non-preflight requests through to the next handler', () => {
    const res = mockRes();
    const next = jest.fn() as NextFunction;

    corsMiddleware(mockReq('POST', { Origin: 'http://localhost:3000' }), res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect(res.ended).toBe(false);
  });
});
