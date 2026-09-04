import { NextFunction, Request, Response } from 'express';
import { fileService } from '../services/file.service';
import { CreateFileInput, UpdateFileInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseBody(body: unknown): CreateFileInput & UpdateFileInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const name = v.requireString('name', b.name);
  const detail = v.optionalString('detail', b.detail);
  v.throwIfInvalid();
  return { name, detail: detail ?? null };
}

export const fileController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await fileService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await fileService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await fileService.create(parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await fileService.update(id, parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await fileService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
