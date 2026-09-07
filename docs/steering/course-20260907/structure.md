# Course feature — Structure

Mirrors the existing slices. No new layer, no new dependency. `course` follows
the `file` pattern (simple CRUD + one FK check); `chapter` follows the
`customer` pattern (a required parent FK + an optional file FK).

## Backend (`/backend`)

| File | Change |
|------|--------|
| `db/schema.sql` | new `course`, `chapter` tables (before `word`); `word` gains `chapterId`; `DROP` order `word → chapter → course → customer → file → admin` |
| `src/types/entities.ts` | add `Course`, `Chapter`, their `Create*`/`Update*` inputs; add `chapterId` to `Word` + `CreateWordInput` |
| `src/repository/course.repository.ts` | **new** — findAll/findById/**exists**/create/update/remove |
| `src/repository/chapter.repository.ts` | **new** — findAll/findById/**exists**/create/update/remove |
| `src/repository/word.repository.ts` | `chapterId` in COLUMNS / mapRow / INSERT / UPDATE |
| `src/services/course.service.ts` | **new** — CRUD + `imageId` file-ref check |
| `src/services/chapter.service.ts` | **new** — CRUD + `courseId` (course) and `imageId` (file) ref checks |
| `src/services/word.service.ts` | `assertFileRefs` also checks `chapterId` against `chapterRepository.exists` |
| `src/controller/{course,chapter}.controller.ts` | **new** — `Validator`-based parse |
| `src/controller/word.controller.ts` | parse optional `chapterId` |
| `src/routes/{course,chapter}.routes.ts` + `src/routes/index.ts` | mount `/courses`, `/chapters` behind `authMiddleware` |
| `src/services/__tests__/course.service.test.ts` | **new** |
| `src/services/__tests__/chapter.service.test.ts` | **new** |
| `src/services/__tests__/word.service.test.ts` | add a `chapterId` 400 case |

No new middleware → no new middleware test (deleting a course with chapters
reuses the existing `ER_ROW_IS_REFERENCED_2 → 409` mapping, already tested).

## Admin (`/admin`)

| File | Change |
|------|--------|
| `src/lib/types.ts` | `Course`, `Chapter` + inputs; `chapterId` on `Word` + input |
| `src/lib/validation.ts` | `validateCourse` (name), `validateChapter` (number int, name, courseId) |
| `src/components/CourseForm.tsx` | **new** — routed create/edit: `name` + `FileDropzone` image |
| `src/components/ChapterForm.tsx` | **new** — `number`, `name`, course `<select>`, `FileDropzone` image |
| `src/components/WordForm.tsx` | add an optional Chapter `<select>` (loads `/api/chapters`) |
| `src/app/(app)/courses/{page,new/page,[id]/edit/page}.tsx` | **new** |
| `src/app/(app)/chapters/{page,new/page,[id]/edit/page}.tsx` | **new** |
| `src/components/Sidebar.tsx` | add "Courses" and "Chapters" entries |
| `src/lib/__tests__/validation.test.ts` | `validateCourse` / `validateChapter` cases |

### Data flow
- `CourseForm` / `ChapterForm` reuse `FileDropzone` + `api.upload("files", …)`
  exactly like `WordForm` / `CustomerForm` (upload on submit, store the id).
- `chapters/page.tsx` loads `courses` alongside `chapters` to show the course
  name (like `customers/page.tsx` loads `admins`).
- `courses/page.tsx` loads `chapters` to show a per-course chapter count.

## Spec sync
- `functional-design.md` — `course` / `chapter` tables + relationships + `word`
  gains `chapterId`; `/api/courses` & `/api/chapters` in §2.2 + request bodies.
- `product-requirements.md` — new **FR-6 Course & Chapter management**; "six
  tables".
- `repository-structure.md` — the new `course.*` / `chapter.*` files.
