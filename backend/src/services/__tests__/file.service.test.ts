import { fileService } from '../file.service';
import { fileRepository } from '../../repository/file.repository';
import { FileRecord } from '../../types/entities';

jest.mock('../../repository/file.repository');

const repo = fileRepository as jest.Mocked<typeof fileRepository>;

const file: FileRecord = {
  id: 3,
  name: 'avatar.png',
  detail: 'profile picture',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('fileService', () => {
  it('creates a record and returns it', async () => {
    repo.create.mockResolvedValue(3);
    repo.findById.mockResolvedValue(file);

    const result = await fileService.create({ name: 'avatar.png', detail: 'profile picture' });

    expect(repo.create).toHaveBeenCalledWith({ name: 'avatar.png', detail: 'profile picture' });
    expect(result).toEqual(file);
  });

  it('defaults a missing detail to null on create', async () => {
    repo.create.mockResolvedValue(3);
    repo.findById.mockResolvedValue(file);

    await fileService.create({ name: 'avatar.png' });

    expect(repo.create).toHaveBeenCalledWith({ name: 'avatar.png', detail: null });
  });

  it('rejects with 404 when the record is missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(fileService.getById(999)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects with 404 when deleting a missing record', async () => {
    repo.remove.mockResolvedValue(0);
    await expect(fileService.remove(999)).rejects.toMatchObject({ status: 404 });
  });
});
