import { NextFunction, Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { Validator } from '../ult/validate';

export const authController = {
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const v = new Validator();
      const username = v.requireString('username', req.body?.username);
      const password = v.requireString('password', req.body?.password);
      v.throwIfInvalid();

      const result = await authService.login(username, password);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  },
};
