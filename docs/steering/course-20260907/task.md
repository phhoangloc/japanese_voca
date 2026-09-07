# Course feature — Tasks

Status: `[ ]` todo, `[x]` done.

## T1. Backend — schema & types
- [x] T1.1 `db/schema.sql` — `course`, `chapter`; `word.chapterId`; DROP order.
- [x] T1.2 `src/types/entities.ts` — `Course`, `Chapter` + inputs; `Word.chapterId`.

## T2. Backend — course & chapter layers
- [x] T2.1 `repository/course.repository.ts` (incl. `exists`).
- [x] T2.2 `repository/chapter.repository.ts` (incl. `exists`).
- [x] T2.3 `services/course.service.ts` — CRUD + imageId check.
- [x] T2.4 `services/chapter.service.ts` — CRUD + courseId + imageId checks.
- [x] T2.5 `controller/course.controller.ts`, `controller/chapter.controller.ts`.
- [x] T2.6 `routes/course.routes.ts`, `routes/chapter.routes.ts`, mount in `routes/index.ts`.

## T3. Backend — word.chapterId
- [x] T3.1 `repository/word.repository.ts` — add `chapterId`.
- [x] T3.2 `services/word.service.ts` — validate `chapterId` → chapter exists.
- [x] T3.3 `controller/word.controller.ts` — parse `chapterId`.

## T4. Backend — tests
- [x] T4.1 `services/__tests__/course.service.test.ts`.
- [x] T4.2 `services/__tests__/chapter.service.test.ts`.
- [x] T4.3 `word.service.test.ts` — `chapterId` 400 case.

## T5. Admin — lib
- [x] T5.1 `lib/types.ts` — `Course`, `Chapter` + inputs; `Word.chapterId`.
- [x] T5.2 `lib/validation.ts` — `validateCourse`, `validateChapter`.

## T6. Admin — components
- [x] T6.1 `components/CourseForm.tsx`.
- [x] T6.2 `components/ChapterForm.tsx`.
- [x] T6.3 `components/WordForm.tsx` — Chapter select.
- [x] T6.4 `components/Sidebar.tsx` — Courses + Chapters entries.

## T7. Admin — pages
- [x] T7.1 `app/(app)/courses/{page,new/page,[id]/edit/page}.tsx`.
- [x] T7.2 `app/(app)/chapters/{page,new/page,[id]/edit/page}.tsx`.

## T8. Admin — tests
- [x] T8.1 `lib/__tests__/validation.test.ts` — course + chapter cases.

## T9. Spec sync
- [x] T9.1 `functional-design.md`. T9.2 `product-requirements.md`.
  T9.3 `repository-structure.md`.

## T10. Verification
- [x] T10.1 Apply schema to the dev DB (create course/chapter, alter word).
- [x] T10.2 backend `build` / `lint` / `test`.
- [x] T10.3 admin `typecheck` / `lint` / `test` / `build`.
- [x] T10.4 Live API: courses & chapters CRUD; bad `courseId` → 400; delete
  course with a chapter → 409; word `chapterId` round-trip.
- [x] T10.5 Live (headless): Courses & Chapters nav → list → create (with
  image + course select) → edit → delete, 0 console errors.
