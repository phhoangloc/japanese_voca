# File Upload — Tasks

Status: `[x]` done.

## T1. Backend storage layer
- [x] T1.1 `npm i multer @types/multer`
- [x] T1.2 `src/ult/upload.ts` — disk storage, `uploadSingle`, url + unlink helpers
- [x] T1.3 `public/upload/` + `.gitkeep`; `.gitignore` the contents

## T2. Backend API
- [x] T2.1 `app.ts` — `express.static('/upload', UPLOAD_DIR)`
- [x] T2.2 `file.routes.ts` — `uploadSingle` on `POST /`
- [x] T2.3 `file.controller.ts` — multipart `create`, metadata-only `PUT`
- [x] T2.4 `file.service.ts` — `remove` unlinks the backing file
- [x] T2.5 `error.middleware.ts` — `MulterError` → 413 / 400
- [x] T2.6 `db/schema.sql` — `detail VARCHAR(512)`; `ALTER TABLE` applied to the dev DB; legacy `data:` rows deleted

## T3. Admin console
- [x] T3.1 `lib/api.ts` — FormData passthrough + `upload()`
- [x] T3.2 `lib/files.ts` — `resolveFileUrl` / `isImageDetail`
- [x] T3.3 `ImageDropzone` — emit `File`
- [x] T3.4 `RichTextEditor` — upload image, insert served URL
- [x] T3.5 `files/page.tsx` — direct upload + gallery
- [x] T3.6 `customers/page.tsx` — avatar upload via `api.upload`

## T4. Tests
- [x] T4.1 `file.service.test.ts` updated (2 new cases)
- [x] T4.2 `error.middleware.test.ts` — multer cases
- [x] T4.3 `lib/__tests__/files.test.ts` — new
- [x] T4.4 `api.test.ts` — multipart upload case

## T5. Spec sync
- [x] T5.1 `functional-design.md` — multipart `POST /api/files`, `/upload/*`, `detail` type, 413 row
- [x] T5.2 `product-requirements.md` — FR-4 rewritten, removed from "out of scope"
- [x] T5.3 `architecture.md` — `multer` dep + §3.2a File uploads
- [x] T5.4 `repository-structure.md` — `public/upload/`, `src/ult/upload.ts`

## T6. Verification
- [x] T6.1 backend `build` / `lint` / `test` (33) green
- [x] T6.2 admin `typecheck` / `lint` / `test` (38) / `build` (7 routes) green
- [x] T6.3 live API: multipart upload → 201 + served `image/png`; avatar link; no-file → 400; delete unlinks (served → 404)

## Notes
- `npm audit` reports 5 pre-existing transitive vulns (`qs`/`body-parser` via
  express, `tar`/`node-pre-gyp` via bcrypt) — not introduced here; left alone to
  avoid major bumps.
- `RichTextEditor` currently has no screen using it (the Files page dropped its
  form earlier); its image button was still rewired per the chosen scope.
