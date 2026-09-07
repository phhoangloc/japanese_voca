import { NextFunction, Request, Response } from 'express';
import { chapterService } from '../services/chapter.service';
import { CreateChapterInput, UpdateChapterInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseBody(body: unknown): CreateChapterInput & UpdateChapterInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input = {
    number: v.requireNonNegativeInt('number', b.number),
    name: v.requireString('name', b.name),
    imageId: v.id('imageId', b.imageId, false) ?? null,
    courseId: v.id('courseId', b.courseId, true) ?? 0,
  };
  v.throwIfInvalid();
  return input;
}

export const chapterController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await chapterService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await chapterService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await chapterService.create(parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await chapterService.update(id, parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await chapterService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
