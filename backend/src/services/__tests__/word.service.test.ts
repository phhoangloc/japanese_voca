import { wordService } from '../word.service';
import { wordRepository } from '../../repository/word.repository';
import { fileRepository } from '../../repository/file.repository';
import { chapterRepository } from '../../repository/chapter.repository';
import { Word } from '../../types/entities';

jest.mock('../../repository/word.repository');
jest.mock('../../repository/file.repository');
jest.mock('../../repository/chapter.repository');

const words = wordRepository as jest.Mocked<typeof wordRepository>;
const files = fileRepository as jest.Mocked<typeof fileRepository>;
const chapters = chapterRepository as jest.Mocked<typeof chapterRepository>;

const row: Word = {
  id: 7,
  word: 'ephemeral',
  explain: 'lasting a very short time',
  imageId: null,
  soundId: null,
  readExplainId: null,
  chapterId: null,
  createdAt: '2026-01-01 00:00:00',
  updatedAt: '2026-01-01 00:00:00',
};

describe('wordService.create', () => {
  it('defaults optional fields to null and returns the created row', async () => {
    words.create.mockResolvedValue(7);
    words.findById.mockResolvedValue(row);

    const result = await wordService.create({ word: 'ephemeral' });

    expect(words.create).toHaveBeenCalledWith({
      word: 'ephemeral',
      explain: null,
      imageId: null,
      soundId: null,
      readExplainId: null,
      chapterId: null,
    });
    expect(result).toEqual(row);
  });

  it('rejects with 400 when chapterId does not reference a chapter', async () => {
    chapters.exists.mockResolvedValue(false);

    await expect(
      wordService.create({ word: 'ephemeral', chapterId: 42 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(words.create).not.toHaveBeenCalled();
  });

  it('accepts file ids that reference existing files', async () => {
    files.exists.mockResolvedValue(true);
    words.create.mockResolvedValue(7);
    words.findById.mockResolvedValue(row);

    await wordService.create({ word: 'ephemeral', imageId: 3, soundId: 4 });

    expect(files.exists).toHaveBeenCalledWith(3);
    expect(files.exists).toHaveBeenCalledWith(4);
    expect(words.create).toHaveBeenCalled();
  });

  it('rejects with 400 when a file id does not exist', async () => {
    files.exists.mockResolvedValue(false);

    await expect(
      wordService.create({ word: 'ephemeral', readExplainId: 99 }),
    ).rejects.toMatchObject({ status: 400 });
    expect(words.create).not.toHaveBeenCalled();
  });
});

describe('wordService.getById / update / remove', () => {
  it('rejects with 404 when the word is missing', async () => {
    words.findById.mockResolvedValue(null);
    await expect(wordService.getById(123)).rejects.toMatchObject({ status: 404 });
  });

  it('rejects update with 404 when the word is missing', async () => {
    words.findById.mockResolvedValue(null);
    await expect(
      wordService.update(123, { word: 'x' }),
    ).rejects.toMatchObject({ status: 404 });
    expect(words.update).not.toHaveBeenCalled();
  });

  it('rejects with 404 when deleting a missing word', async () => {
    words.remove.mockResolvedValue(0);
    await expect(wordService.remove(999)).rejects.toMatchObject({ status: 404 });
  });
});
