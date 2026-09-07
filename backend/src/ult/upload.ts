import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import multer from 'multer';

/**
 * On-disk storage for uploaded files. The initial idea mandates that files are
 * written to `/public/upload`; the `file.detail` column then only stores the
 * public URL path (e.g. `/upload/<uuid>.png`), never the binary itself.
 */
export const UPLOAD_DIR = path.resolve(__dirname, '../../public/upload');

/** URL path prefix under which the uploads are served (see app.ts). */
export const UPLOAD_URL_PREFIX = '/upload';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_EXT = new Set([
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.bmp',
  '.svg',
  '.avif',
]);

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const safeExt = ALLOWED_EXT.has(ext) ? ext : '';
    cb(null, `${randomUUID()}${safeExt}`);
  },
});

/** `multipart/form-data` parser for a single `file` field, max 10 MB. */
export const uploadSingle = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 },
}).single('file');

/** Build the stored `detail` value for a freshly written upload. */
export function toUploadUrl(filename: string): string {
  return `${UPLOAD_URL_PREFIX}/${filename}`;
}

/**
 * Best-effort removal of the on-disk file behind a `detail` URL path. Silently
 * ignores anything that is not one of our uploads or is already gone.
 */
export async function removeUploadedFile(detail: string | null): Promise<void> {
  if (!detail || !detail.startsWith(`${UPLOAD_URL_PREFIX}/`)) return;
  const abs = path.join(UPLOAD_DIR, path.basename(detail));
  await fs.promises.unlink(abs).catch(() => undefined);
}
