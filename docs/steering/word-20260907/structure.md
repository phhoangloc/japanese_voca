# Word feature — Structure

Mirrors the existing `admin` / `customer` / `file` slices. No new layer, no new
dependency.

## Backend (`/backend`)

| File | Change |
|------|--------|
| `db/schema.sql` | **new** `CREATE TABLE word` (after `file`; drop before `file` in the reset block) |
| `src/types/entities.ts` | add `Word`, `CreateWordInput`, `UpdateWordInput` |
| `src/repository/word.repository.ts` | **new** — `findAll`, `findById`, `create`, `update`, `remove`; explicit column list, snake→camel timestamp mapping (pattern = `customer.repository.ts`) |
| `src/services/word.service.ts` | **new** — CRUD + `assertFileRefs()` checking `imageId`/`soundId`/`readExplainId` against `fileRepository.exists` (pattern = `customer.service.ts`'s `assertReferences`) |
| `src/controller/word.controller.ts` | **new** — `parseCreate` / `parseUpdate` via `Validator`, JSON in/out |
| `src/routes/word.routes.ts` | **new** — REST routes |
| `src/routes/index.ts` | mount `api.use('/words', authMiddleware, wordRoutes)` |
| `src/services/__tests__/word.service.test.ts` | **new** — repo + `fileRepository` mocked |

No middleware change → no new middleware test (the feature adds no new
error class or guard).

### Layering
`routes → controller → services → repository → ult`, one-way, as enforced
project-wide. SQL only in the repository, parameterized, no `SELECT *`.

## Admin (`/admin`)

| File | Change |
|------|--------|
| `src/lib/types.ts` | add `Word`, `CreateWordInput`, `UpdateWordInput` |
| `src/lib/validation.ts` | add `validateWord` (word required) |
| `src/components/FileDropzone.tsx` | **new** — generalises `ImageDropzone` to any file type; shows an image preview when the value/file is an image, else the file name; drop + click; emits `File | null` |
| `src/components/WordForm.tsx` | **new** — create/edit; `word`, `explain` (textarea), 3× `FileDropzone`; uploads dirty files via `api.upload("files", …)` then submits the ids; `router.push("/words")` + `refresh()` |
| `src/app/(app)/words/page.tsx` | **new** — list table + delete confirm; "New word" → `/words/new` |
| `src/app/(app)/words/new/page.tsx` | **new** — `<WordForm />` |
| `src/app/(app)/words/[id]/edit/page.tsx` | **new** — `<WordForm wordId={…} />` |
| `src/components/Sidebar.tsx` | add the "Words" `MENU` entry (icon + `/words`) |
| `src/lib/__tests__/validation.test.ts` | add `validateWord` cases |
| `src/lib/__tests__/files.test.ts` | (already covers `resolveFileUrl` / `isImageDetail` used by the preview) |

### Data flow (mirrors customer avatars)
`WordForm` loads the word (edit) + the files list → resolves each of the 3 ids
to a `file.detail` URL for preview via `resolveFileUrl`. On submit, for each
field that changed: `api.upload<FileRecord>("files", file)` → use `created.id`;
unchanged → keep the existing id; cleared → `null`. Then `api.create` /
`api.update` on `words`.

The list page loads `words` (via `useResource`) plus the `files` list (to render
the image thumbnail / name badges), like `customers/page.tsx`.

## Spec sync (kept in step, per development-guidelines §12)

- `functional-design.md` — `word` table row + `/api/words` endpoints + request
  bodies.
- `product-requirements.md` — new **FR-5 Word management** (renumber "Data
  requirements" note to four tables).
- `repository-structure.md` — the new `word.*` files.
