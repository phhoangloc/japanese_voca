import { NextFunction, Request, Response } from 'express';
import { adminService } from '../services/admin.service';
import { CreateAdminInput, UpdateAdminInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseCreate(body: unknown): CreateAdminInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input = {
    username: v.requireString('username', b.username),
    password: v.requireString('password', b.password),
    email: v.email('email', b.email),
  };
  v.throwIfInvalid();
  return input;
}

function parseUpdate(body: unknown): UpdateAdminInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input: UpdateAdminInput = {
    username: v.requireString('username', b.username),
    email: v.email('email', b.email),
    password: v.optionalString('password', b.password),
  };
  v.throwIfInvalid();
  return input;
}

export const adminController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await adminService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await adminService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await adminService.create(parseCreate(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await adminService.update(id, parseUpdate(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await adminService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
