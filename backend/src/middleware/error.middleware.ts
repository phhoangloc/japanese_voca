import { NextFunction, Request, Response } from 'express';
import { ApiError } from '../ult/api-error';

interface MysqlError extends Error {
  code?: string;
}

/**
 * The single place that writes an error response. Maps ApiError and known MySQL
 * driver errors to the JSON error model in docs/spec/functional-design.md.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorMiddleware(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ApiError) {
    res.status(err.status).json({ error: err.message, details: err.details });
    return;
  }

  const code = (err as MysqlError)?.code;
  if (code === 'ER_DUP_ENTRY') {
    res.status(409).json({ error: 'A record with the same unique value already exists' });
    return;
  }
  if (code === 'ER_ROW_IS_REFERENCED_2' || code === 'ER_ROW_IS_REFERENCED') {
    res.status(409).json({ error: 'Record is still referenced by another record' });
    return;
  }
  if (code === 'ER_NO_REFERENCED_ROW_2' || code === 'ER_NO_REFERENCED_ROW') {
    res.status(400).json({ error: 'Referenced record does not exist' });
    return;
  }

  // eslint-disable-next-line no-console
  console.error('[error]', err);
  res.status(500).json({ error: 'Internal error' });
}
