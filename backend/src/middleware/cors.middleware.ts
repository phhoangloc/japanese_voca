import { NextFunction, Request, Response } from 'express';

/**
 * Minimal CORS support so a browser-based client (the `/admin` console) can call
 * this API from a different origin. Allowed origins come from `CORS_ORIGINS`
 * (comma-separated); `*` — or an unset value in development — allows any origin.
 */
const raw = process.env.CORS_ORIGINS ?? '*';
const allowList = raw.split(',').map((s) => s.trim()).filter(Boolean);
const allowAny = allowList.length === 0 || allowList.includes('*');

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void {
  const origin = req.header('origin');

  if (origin && (allowAny || allowList.includes(origin))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  } else if (allowAny && !origin) {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    req.header('access-control-request-headers') ?? 'Content-Type,Authorization',
  );
  res.setHeader('Access-Control-Max-Age', '600');

  if (req.method === 'OPTIONS') {
    res.status(204).send();
    return;
  }

  next();
}
