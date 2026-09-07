# Word feature — Tasks

Status: `[ ]` todo, `[x]` done.

## T1. Backend — schema & types
- [x] T1.1 `db/schema.sql` — `CREATE TABLE word` (id, word, explain, imageId,
  soundId, readExplainId, timestamps; 3 FKs → `file` ON DELETE SET NULL); add to
  the `DROP TABLE` reset block before `file`.
- [x] T1.2 `src/types/entities.ts` — `Word`, `CreateWordInput`, `UpdateWordInput`.

## T2. Backend — layers
- [x] T2.1 `src/repository/word.repository.ts` — findAll / findById / create /
  update / remove.
- [x] T2.2 `src/services/word.service.ts` — CRUD + `assertFileRefs` (400 on a
  non-existent imageId/soundId/readExplainId).
- [x] T2.3 `src/controller/word.controller.ts` — validate + shape.
- [x] T2.4 `src/routes/word.routes.ts` + mount in `src/routes/index.ts`
  (`/words`, behind `authMiddleware`).

## T3. Backend — tests
- [x] T3.1 `src/services/__tests__/word.service.test.ts` — create defaults,
  404 on missing, 400 on bad file ref, delete 404. (Repository + fileRepository
  mocked.)

## T4. Admin — lib
- [x] T4.1 `src/lib/types.ts` — `Word` + inputs.
- [x] T4.2 `src/lib/validation.ts` — `validateWord`.

## T5. Admin — components
- [x] T5.1 `src/components/FileDropzone.tsx` — any-type upload box, image-or-name
  preview, drop + click.
- [x] T5.2 `src/components/WordForm.tsx` — routed create/edit form.
- [x] T5.3 `src/components/Sidebar.tsx` — "Words" nav entry.

## T6. Admin — pages
- [x] T6.1 `src/app/(app)/words/page.tsx` — list + delete.
- [x] T6.2 `src/app/(app)/words/new/page.tsx`.
- [x] T6.3 `src/app/(app)/words/[id]/edit/page.tsx`.

## T7. Admin — tests
- [x] T7.1 `src/lib/__tests__/validation.test.ts` — `validateWord`.

## T8. Spec sync
- [x] T8.1 `functional-design.md` — table + endpoints.
- [x] T8.2 `product-requirements.md` — FR-5 Word management.
- [x] T8.3 `repository-structure.md` — new files.

## T9. Verification
- [x] T9.1 Apply schema to the dev DB (`CREATE TABLE word …`).
- [x] T9.2 backend `build` / `lint` / `test`.
- [x] T9.3 admin `typecheck` / `lint` / `test` / `build`.
- [x] T9.4 Live: `POST/GET/PUT/DELETE /api/words`; bad `imageId` → 400.
- [x] T9.5 Live (headless): Words nav → list → create with uploads → edit →
  delete, 0 console errors.
