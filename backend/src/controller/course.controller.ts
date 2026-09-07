import { NextFunction, Request, Response } from 'express';
import { courseService } from '../services/course.service';
import { CreateCourseInput, UpdateCourseInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseBody(body: unknown): CreateCourseInput & UpdateCourseInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input = {
    name: v.requireString('name', b.name),
    imageId: v.id('imageId', b.imageId, false) ?? null,
  };
  v.throwIfInvalid();
  return input;
}

export const courseController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await courseService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await courseService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await courseService.create(parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await courseService.update(id, parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await courseService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
