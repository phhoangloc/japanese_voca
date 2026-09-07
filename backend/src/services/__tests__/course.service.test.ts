import { courseService } from '../course.service';
import { courseRepository } from '../../repository/course.repository';
import { fileRepository } from '../../repository/file.repository';
import { Course } from '../../types/entities';

jest.mock('../../repository/course.repository');
jest.mock('../../repository/file.repository');

const courses = courseRepository as jest.Mocked<typeof courseRepository>;
const files = fileRepository as jest.Mocked<typeof fileRepository>;

const row: Course = {
  id: 4,
  name: 'Beginner English',
  imageId: null,
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('courseService', () => {
  it('creates a course and returns it', async () => {
    courses.create.mockResolvedValue(4);
    courses.findById.mockResolvedValue(row);

    const result = await courseService.create({ name: 'Beginner English' });

    expect(courses.create).toHaveBeenCalledWith({
      name: 'Beginner English',
      imageId: null,
    });
    expect(result).toEqual(row);
  });

  it('rejects with 400 when imageId does not reference a file', async () => {
    files.exists.mockResolvedValue(false);
    await expect(
      courseService.create({ name: 'x', imageId: 99 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(courses.create).not.toHaveBeenCalled();
  });

  it('rejects with 404 on a missing course', async () => {
    courses.findById.mockResolvedValue(null);
    await expect(courseService.getById(1)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects with 404 when deleting a missing course', async () => {
    courses.remove.mockResolvedValue(0);
    await expect(courseService.remove(1)).rejects.toMatchObject({ status: 404 });
  });
});
