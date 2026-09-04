import 'express';

declare global {
  namespace Express {
    interface Request {
      /** Populated by auth.middleware once a valid Bearer token is verified. */
      admin?: {
        id: number;
        username: string;
      };
    }
  }
}

export {};
