import { courseRepository } from '../repository/course.repository';
import { fileRepository } from '../repository/file.repository';
import { ApiError } from '../ult/api-error';
import { Course, CreateCourseInput, UpdateCourseInput } from '../types/entities';

async function assertImageRef(imageId: number | null | undefined): Promise<void> {
  if (imageId === undefined || imageId === null) return;
  if (!(await fileRepository.exists(imageId))) {
    throw ApiError.badRequest(`imageId ${imageId} does not reference an existing file`);
  }
}

export const courseService = {
  async list(): Promise<Course[]> {
    return courseRepository.findAll();
  },

  async getById(id: number): Promise<Course> {
    const course = await courseRepository.findById(id);
    if (!course) throw ApiError.notFound('Course not found');
    return course;
  },

  async create(input: CreateCourseInput): Promise<Course> {
    await assertImageRef(input.imageId);
    const id = await courseRepository.create({
      name: input.name,
      imageId: input.imageId ?? null,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateCourseInput): Promise<Course> {
    const existing = await courseRepository.findById(id);
    if (!existing) throw ApiError.notFound('Course not found');

    await assertImageRef(input.imageId);
    await courseRepository.update(id, {
      name: input.name,
      imageId: input.imageId ?? null,
    });
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const affected = await courseRepository.remove(id);
    if (affected === 0) throw ApiError.notFound('Course not found');
  },
};
