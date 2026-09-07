import { fileService } from '../file.service';
import { fileRepository } from '../../repository/file.repository';
import { removeUploadedFile } from '../../ult/upload';
import { FileRecord } from '../../types/entities';

jest.mock('../../repository/file.repository');
jest.mock('../../ult/upload');

const repo = fileRepository as jest.Mocked<typeof fileRepository>;
const rmFile = removeUploadedFile as jest.MockedFunction<typeof removeUploadedFile>;

const file: FileRecord = {
  id: 3,
  name: 'avatar.png',
  detail: '/upload/1f2e3d.png',
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('fileService', () => {
  it('creates a record from a name + upload URL and returns it', async () => {
    repo.create.mockResolvedValue(3);
    repo.findById.mockResolvedValue(file);

    const result = await fileService.create({
      name: 'avatar.png',
      detail: '/upload/1f2e3d.png',
    });

    expect(repo.create).toHaveBeenCalledWith({
      name: 'avatar.png',
      detail: '/upload/1f2e3d.png',
    });
    expect(result).toEqual(file);
  });

  it('stores null when no detail is given', async () => {
    repo.create.mockResolvedValue(3);
    repo.findById.mockResolvedValue(file);

    await fileService.create({ name: 'note.txt' });

    expect(repo.create).toHaveBeenCalledWith({ name: 'note.txt', detail: null });
  });

  it('rejects with 404 when the record is missing', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(fileService.getById(999)).rejects.toMatchObject({ status: 404 });
  });

  it('deletes the row and the backing file on remove', async () => {
    repo.findById.mockResolvedValue(file);
    repo.remove.mockResolvedValue(1);

    await fileService.remove(3);

    expect(repo.remove).toHaveBeenCalledWith(3);
    expect(rmFile).toHaveBeenCalledWith('/upload/1f2e3d.png');
  });

  it('rejects with 404 when deleting a missing record (and touches no file)', async () => {
    repo.findById.mockResolvedValue(null);
    await expect(fileService.remove(999)).rejects.toMatchObject({ status: 404 });
    expect(repo.remove).not.toHaveBeenCalled();
    expect(rmFile).not.toHaveBeenCalled();
  });
});
