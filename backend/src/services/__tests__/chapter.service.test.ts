import { chapterService } from '../chapter.service';
import { chapterRepository } from '../../repository/chapter.repository';
import { courseRepository } from '../../repository/course.repository';
import { fileRepository } from '../../repository/file.repository';
import { Chapter } from '../../types/entities';

jest.mock('../../repository/chapter.repository');
jest.mock('../../repository/course.repository');
jest.mock('../../repository/file.repository');

const chapters = chapterRepository as jest.Mocked<typeof chapterRepository>;
const courses = courseRepository as jest.Mocked<typeof courseRepository>;
const files = fileRepository as jest.Mocked<typeof fileRepository>;

const row: Chapter = {
  id: 2,
  number: 1,
  name: 'Greetings',
  imageId: null,
  courseId: 4,
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

const baseInput = { number: 1, name: 'Greetings', courseId: 4 };

describe('chapterService.create', () => {
  it('creates a chapter when the course exists', async () => {
    courses.exists.mockResolvedValue(true);
    chapters.create.mockResolvedValue(2);
    chapters.findById.mockResolvedValue(row);

    const result = await chapterService.create(baseInput);

    expect(courses.exists).toHaveBeenCalledWith(4);
    expect(chapters.create).toHaveBeenCalledWith({
      number: 1,
      name: 'Greetings',
      imageId: null,
      courseId: 4,
    });
    expect(result).toEqual(row);
  });

  it('rejects with 400 when courseId does not exist', async () => {
    courses.exists.mockResolvedValue(false);
    await expect(chapterService.create(baseInput)).rejects.toMatchObject({
      status: 400,
    });
    expect(chapters.create).not.toHaveBeenCalled();
  });

  it('rejects with 400 when imageId does not reference a file', async () => {
    courses.exists.mockResolvedValue(true);
    files.exists.mockResolvedValue(false);
    await expect(
      chapterService.create({ ...baseInput, imageId: 77 }),
    ).rejects.toMatchObject({ status: 400 });
  });
});

describe('chapterService.getById / remove', () => {
  it('rejects with 404 when the chapter is missing', async () => {
    chapters.findById.mockResolvedValue(null);
    await expect(chapterService.getById(9)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects with 404 when deleting a missing chapter', async () => {
    chapters.remove.mockResolvedValue(0);
    await expect(chapterService.remove(9)).rejects.toMatchObject({ status: 404 });
  });
});
