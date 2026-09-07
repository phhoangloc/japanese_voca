import { NextFunction, Request, Response } from 'express';
import { wordService } from '../services/word.service';
import { CreateWordInput, UpdateWordInput } from '../types/entities';
import { parseIdParam, Validator } from '../ult/validate';

function parseBody(body: unknown): CreateWordInput & UpdateWordInput {
  const b = (body ?? {}) as Record<string, unknown>;
  const v = new Validator();
  const input = {
    word: v.requireString('word', b.word),
    explain: v.optionalString('explain', b.explain) ?? null,
    imageId: v.id('imageId', b.imageId, false) ?? null,
    soundId: v.id('soundId', b.soundId, false) ?? null,
    readExplainId: v.id('readExplainId', b.readExplainId, false) ?? null,
    chapterId: v.id('chapterId', b.chapterId, false) ?? null,
  };
  v.throwIfInvalid();
  return input;
}

export const wordController = {
  async list(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await wordService.list());
    } catch (err) {
      next(err);
    }
  },

  async get(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json(await wordService.getById(parseIdParam(req.params.id)));
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(201).json(await wordService.create(parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseIdParam(req.params.id);
      res.status(200).json(await wordService.update(id, parseBody(req.body)));
    } catch (err) {
      next(err);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await wordService.remove(parseIdParam(req.params.id));
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  },
};
