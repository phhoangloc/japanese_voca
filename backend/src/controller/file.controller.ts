import { NextFunction, Request, Response } from 'express';
import { fileService } from '../services/file.service';
import { UpdateFileInput } from '../types/entities';
import { ApiError } from '../ult/api-error';
import { toUploadUrl } from '../ult/upload';
import { parseIdParam, Validator } from '../ult/validate';

/** Body of a metadata-only update (PUT). The binary is never changed here. */
function parseUpdateBody(body: unknown): UpdateFileInput {
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

  /** `multipart/form-data`: field `file` (binary, required) + optional `name`. */
  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const uploaded = req.file;
      if (!uploaded) throw ApiError.badRequest('file is required');

      const rawName = typeof req.body?.name === 'string' ? req.body.name.trim() : '';
      const name = rawName || uploaded.originalname || uploaded.filename;

      res.status(201).json(
        await fileService.create({ name, detail: toUploadUrl(uploaded.filename) }),
      );
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await fileService.update(id, parseUpdateBody(req.body)));
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
