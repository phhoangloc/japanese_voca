import { NextFunction, Request, Response } from 'express';
import { authMiddleware } from '../auth.middleware';
import { ApiError } from '../../ult/api-error';
import { sign } from '../../ult/jwt';

function mockReq(authorization?: string): Request {
  return {
    header: (name: string) =>
      name.toLowerCase() === 'authorization' ? authorization : undefined,
  } as unknown as Request;
}

const res = {} as Response;

describe('authMiddleware', () => {
  it('passes an ApiError(401) to next when no header is present', () => {
    const next = jest.fn() as NextFunction;
    authMiddleware(mockReq(undefined), res, next);
    expect(next).toHaveBeenCalledWith(expect.any(ApiError));
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(401);
  });

  it('rejects a malformed Authorization header', () => {
    const next = jest.fn() as NextFunction;
    authMiddleware(mockReq('Token abc.def'), res, next);
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(401);
  });

  it('rejects an invalid token', () => {
    const next = jest.fn() as NextFunction;
    authMiddleware(mockReq('Bearer not-a-real-token'), res, next);
    expect((next as jest.Mock).mock.calls[0][0].status).toBe(401);
  });

  it('calls next() with no error and populates req.admin for a valid token', () => {
    const token = sign({ sub: 42, username: 'root' });
    const req = mockReq(`Bearer ${token}`);
    const next = jest.fn() as NextFunction;

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalledTimes(1);
    expect((next as jest.Mock).mock.calls[0][0]).toBeUndefined();
    expect(req.admin).toEqual({ id: 42, username: 'root' });
  });
});
