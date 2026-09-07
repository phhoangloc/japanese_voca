# File Upload — Structure

## Backend (`/backend`)

| File | Change |
|------|--------|
| `package.json` | add `multer` + `@types/multer` |
| `src/ult/upload.ts` | **new** — `UPLOAD_DIR`, `multer` disk storage (`<uuid><ext>`, 10 MB cap), `uploadSingle` middleware, `toUploadUrl()`, `removeUploadedFile()` |
| `src/app.ts` | mount `express.static` at `/upload`; `express.json` stays at `1mb` |
| `src/routes/file.routes.ts` | `POST /` runs `uploadSingle` before the controller |
| `src/controller/file.controller.ts` | `create` reads `req.file` + `req.body.name`, builds `detail` from `toUploadUrl()`; `PUT` body parser is metadata-only |
| `src/services/file.service.ts` | `remove` loads the row first, then unlinks the file via `removeUploadedFile()` |
| `src/middleware/error.middleware.ts` | map `MulterError` (`LIMIT_FILE_SIZE` → 413, else 400); keep body-parser 413/400 |
| `db/schema.sql` | `file.detail` → `VARCHAR(512)` (URL path, not a blob) |
| `.gitignore` | ignore `public/upload/*` except `.gitkeep` |
| `public/upload/.gitkeep` | **new** |

Layering unchanged: `ult/upload.ts` is a cross-cutting helper; the controller
owns request shape, the service owns the "row + file" lifecycle.

## Admin (`/admin`)

| File | Change |
|------|--------|
| `src/lib/api.ts` | `request()` passes a `FormData` body through untouched (no JSON `Content-Type`); new `upload(resource, file, fields?)` |
| `src/lib/files.ts` | **new** — `resolveFileUrl()` (prefix `/upload/...` with API host), `isImageDetail()` |
| `src/lib/image.ts` | drop `fileToDownscaledDataUrl` (no longer needed); keep `isImage` |
| `src/components/ImageDropzone.tsx` | emits a `File` (+ local object-URL preview) instead of a downscaled data URL |
| `src/components/RichTextEditor.tsx` | "upload image" POSTs to `/api/files`, inserts the served URL |
| `src/app/(app)/files/page.tsx` | "New file" → OS picker → `api.upload` per file → reload; gallery `<img>` uses `resolveFileUrl` |
| `src/app/(app)/customers/page.tsx` | avatar draft holds a `File`; `resolveAvatarId` uploads it; thumbnails via `resolveFileUrl` |

## Tests

- Backend: `file.service.test.ts` (create from URL, remove unlinks the file),
  `error.middleware.test.ts` (multer 413/400).
- Admin: `lib/__tests__/files.test.ts` (`resolveFileUrl`, `isImageDetail`),
  `api.test.ts` (multipart upload — FormData body, no JSON header, bearer).
