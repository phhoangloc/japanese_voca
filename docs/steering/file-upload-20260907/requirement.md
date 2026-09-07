# File Upload to `/public/upload` — Requirements

Traces to `docs/ideas/initital-idea.md` line 7: **"The file is upload to
`/public/upload`."**

## 1. Problem

The generated system stored uploaded images as base64 `data:` URLs inside the
`file.detail` column. This contradicts the initial idea and caused upload
failures: bodies over the `express.json` 100 KB limit returned `500`, and bodies
that fit were silently truncated to 64 KB by the `TEXT` column.

## 2. Requirements

- FR-1 `POST /api/files` accepts `multipart/form-data`: field `file` (binary,
  required) and optional `name` (defaults to the uploaded filename).
- FR-2 The binary is written to `backend/public/upload/<uuid><ext>`; the `file`
  row stores only the URL path (`/upload/<uuid><ext>`) in `detail`.
- FR-3 Uploaded files are served as static content at `GET /upload/<file>` with
  no authentication.
- FR-4 `DELETE /api/files/:id` also removes the backing file from disk
  (best-effort).
- FR-5 Upload size limit 10 MB → `413` on exceed. Non-multipart / missing file
  → `400`.
- FR-6 `PUT /api/files/:id` stays JSON and edits metadata (`name`) only.
- FR-7 Admin console: the Files page "New file" button uploads directly; the
  customer avatar box and the rich text editor image button both upload to
  `/api/files` and reference the returned URL. No base64 is sent anywhere.

## 3. Out of scope

- Migrating pre-existing base64 rows (there were none worth keeping; they were
  test data and one truncated row, all removed).
- Access control on served files, image resizing/thumbnails, virus scanning.
- Raising MySQL `max_allowed_packet` (JSON bodies are capped at 1 MB, well
  under it).

## 4. Acceptance

- Uploading an image on the Files page shows it in the horizontal strip after
  reload; the `<img>` loads from `http://<api>/upload/...`.
- Creating a customer with an avatar creates a `file` row pointing at a real
  file on disk and links it via `avatarId`.
- The rich text editor's "upload image" inserts an `<img>` whose `src` is the
  served upload URL.
- Deleting a file removes both the row and the file on disk.
