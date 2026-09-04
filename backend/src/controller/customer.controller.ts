import { NextFunction, Request, Response } from 'express';
import { customerService } from '../services/customer.service';
import { CreateCustomerInput, UpdateCustomerInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseCreate(body: unknown): CreateCustomerInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input: CreateCustomerInput = {
    username: v.requireString('username', b.username),
    password: v.requireString('password', b.password),
    email: v.email('email', b.email),
    point: v.optionalNonNegativeInt('point', b.point) ?? 0,
    avatarId: v.id('avatarId', b.avatarId, false) ?? null,
    adminId: v.id('adminId', b.adminId, true) ?? 0,
  };
  v.throwIfInvalid();
  return input;
}

function parseUpdate(body: unknown): UpdateCustomerInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input: UpdateCustomerInput = {
    username: v.requireString('username', b.username),
    password: v.optionalString('password', b.password),
    email: v.email('email', b.email),
    point: v.optionalNonNegativeInt('point', b.point),
    avatarId: v.id('avatarId', b.avatarId, false) ?? null,
    adminId: v.id('adminId', b.adminId, true) ?? 0,
  };
  v.throwIfInvalid();
  return input;
}

export const customerController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await customerService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await customerService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await customerService.create(parseCreate(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await customerService.update(id, parseUpdate(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await customerService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
