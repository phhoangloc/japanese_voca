import { chapterRepository } from '../repository/chapter.repository';
import { fileRepository } from '../repository/file.repository';
import { wordRepository } from '../repository/word.repository';
import { ApiError } from '../ult/api-error';
import { CreateWordInput, UpdateWordInput, Word } from '../types/entities';

/** Every provided reference id must point at an existing row. */
async function assertRefs(input: CreateWordInput): Promise<void> {
  const fileChecks: [string, number | null | undefined][] = [
    ['imageId', input.imageId],
    ['soundId', input.soundId],
    ['readExplainId', input.readExplainId],
  ];
  for (const [field, id] of fileChecks) {
    if (id === undefined || id === null) continue;
    if (!(await fileRepository.exists(id))) {
      throw ApiError.badRequest(`${field} ${id} does not reference an existing file`);
    }
  }
  if (input.chapterId !== undefined && input.chapterId !== null) {
    if (!(await chapterRepository.exists(input.chapterId))) {
      throw ApiError.badRequest(
        `chapterId ${input.chapterId} does not reference an existing chapter`,
      );
    }
  }
}

export const wordService = {
  async list(): Promise<Word[]> {
    return wordRepository.findAll();
  },

  async getById(id: number): Promise<Word> {
    const word = await wordRepository.findById(id);
    if (!word) throw ApiError.notFound('Word not found');
    return word;
  },

  async create(input: CreateWordInput): Promise<Word> {
    await assertRefs(input);
    const id = await wordRepository.create({
      word: input.word,
      explain: input.explain ?? null,
      imageId: input.imageId ?? null,
      soundId: input.soundId ?? null,
      readExplainId: input.readExplainId ?? null,
      chapterId: input.chapterId ?? null,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateWordInput): Promise<Word> {
    const existing = await wordRepository.findById(id);
    if (!existing) throw ApiError.notFound('Word not found');

    await assertRefs(input);
    await wordRepository.update(id, {
      word: input.word,
      explain: input.explain ?? null,
      imageId: input.imageId ?? null,
      soundId: input.soundId ?? null,
      readExplainId: input.readExplainId ?? null,
      chapterId: input.chapterId ?? null,
    });
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const affected = await wordRepository.remove(id);
    if (affected === 0) throw ApiError.notFound('Word not found');
  },
};
