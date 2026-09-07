import { fileRepository } from '../repository/file.repository';
import { ApiError } from '../ult/api-error';
import { removeUploadedFile } from '../ult/upload';
import { CreateFileInput, FileRecord, UpdateFileInput } from '../types/entities';

export const fileService = {
  async list(): Promise<FileRecord[]> {
    return fileRepository.findAll();
  },

  async getById(id: number): Promise<FileRecord> {
    const file = await fileRepository.findById(id);
    if (!file) throw ApiError.notFound('File not found');
    return file;
  },

  async create(input: CreateFileInput): Promise<FileRecord> {
    const id = await fileRepository.create({
      name: input.name,
      detail: input.detail ?? null,
    });
    return this.getById(id);
  },

  async update(id: number, input: UpdateFileInput): Promise<FileRecord> {
    const affected = await fileRepository.update(id, {
      name: input.name,
      detail: input.detail ?? null,
    });
    if (affected === 0) {
      const stillThere = await fileRepository.findById(id);
      if (!stillThere) throw ApiError.notFound('File not found');
    }
    return this.getById(id);
  },

  async remove(id: number): Promise<void> {
    const existing = await fileRepository.findById(id);
    if (!existing) throw ApiError.notFound('File not found');

    await fileRepository.remove(id);
    // Best-effort: drop the backing file from `/public/upload` too.
    await removeUploadedFile(existing.detail);
  },
};
