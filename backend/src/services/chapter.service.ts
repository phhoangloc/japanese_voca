import { chapterRepository } from '../repository/chapter.repository';
import { courseRepository } from '../repository/course.repository';
import { fileRepository } from '../repository/file.repository';
import { ApiError } from '../ult/api-error';
import {
  Chapter,
  CreateChapterInput,
  UpdateChapterInput,
} from '../types/entities';

async function assertRefs(input: CreateChapterInput): Promise<void> {
  if (!(await courseRepository.exists(input.courseId))) {
    throw ApiError.badRequest(
      `courseId ${input.courseId} does not reference an existing course`,
    );
  }
  if (input.imageId !== undefined && input.imageId !== null) {
    if (!(await fileRepository.exists(input.imageId))) {
      throw ApiError.badRequest(
        `imageId ${input.imageId} does not reference an existing file`,
      );
    }
  }
}

export const chapterService = {
  async list(): Promise<Chapter[]> {
    return chapterRepository.findAll();
  },

  async getById(id: number): Promise<Chapter> {
    const chapter = await chapterRepository.findById(id);
    if (!chapter) throw ApiError.notFound('Chapter not found');
    return chapter;
  },

  async create(input: CreateChapterInput): Promise<Chapter> {
    await assertRefs(input);
    const id = await chapterRepository.create({
      number: input.number,
      name: input.name,
      imageId: input.imageId ?? null,
      courseId: input.courseId,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateChapterInput): Promise<Chapter> {
    const existing = await chapterRepository.findById(id);
    if (!existing) throw ApiError.notFound('Chapter not found');

    await assertRefs(input);
    await chapterRepository.update(id, {
      number: input.number,
      name: input.name,
      imageId: input.imageId ?? null,
      courseId: input.courseId,
    });
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const affected = await chapterRepository.remove(id);
    if (affected === 0) throw ApiError.notFound('Chapter not found');
  },
};
