# Course feature — Requirements

Traces to `docs/ideas/course-idea.md`. Phase 2 of the add-feature workflow —
extends the existing backend API and admin console.

## 1. Overview

Two new managed entities, **course** and **chapter** (a chapter belongs to a
course), each with an optional attached image `file`. Plus one new column on the
existing `word` table linking a word to a chapter.

## 2. Naming decisions

- `course` end to end: table `course`, `/api/courses`, admin `/courses`.
- `chapter` end to end: table `chapter`, `/api/chapters`, admin `/chapters`.
  The idea writes the nav label as **"Chapter"** (singular); implemented as
  **"Chapters"** for consistency with every other nav item (Dashboard, Admins,
  Customers, Words, Files).
- The idea's `image (file.id)` columns use the house `…Id` FK style: `imageId`.
- The idea's `course_id` / `chaper_id` become `courseId` / `chapterId`.

## 3. Data model

### Table `course`
| Column     | Type          | Constraints                                   |
|------------|---------------|----------------------------------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                            |
| name       | VARCHAR(255)  | NOT NULL                                      |
| imageId    | BIGINT        | NULL, FK → `file`.id, ON DELETE SET NULL      |
| created_at | DATETIME      | NOT NULL DEFAULT CURRENT_TIMESTAMP            |
| updated_at | DATETIME      | NOT NULL DEFAULT … ON UPDATE CURRENT_TIMESTAMP|

### Table `chapter`
| Column     | Type          | Constraints                                   |
|------------|---------------|----------------------------------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                            |
| number     | INT           | NOT NULL (chapter order/index)               |
| name       | VARCHAR(255)  | NOT NULL                                      |
| imageId    | BIGINT        | NULL, FK → `file`.id, ON DELETE SET NULL      |
| courseId   | BIGINT        | NOT NULL, FK → `course`.id, ON DELETE RESTRICT|
| created_at | DATETIME      | …                                            |
| updated_at | DATETIME      | …                                            |

- `courseId` uses `ON DELETE RESTRICT` — same philosophy as `customer.adminId`
  (deleting a course that still has chapters → `409`; delete the chapters
  first). `CASCADE` was considered and rejected to match existing FK style.

### Table `word` — new column
| Column    | Type   | Constraints                                     |
|-----------|--------|------------------------------------------------|
| chapterId | BIGINT | NULL, FK → `chapter`.id, ON DELETE SET NULL     |

(added by `ALTER TABLE word` on the running DB; `schema.sql` updated too.)

## 4. Backend API (all require a Bearer token; JSON in/out)

### `/api/courses`
`GET` list · `GET /:id` · `POST` `{ name, imageId? }` · `PUT /:id` · `DELETE /:id`
- `name` required. `imageId` when present must reference an existing `file` → `400`.

### `/api/chapters`
`GET` list · `GET /:id` · `POST` `{ number, name, courseId, imageId? }` ·
`PUT /:id` · `DELETE /:id`
- `number` required integer; `name` required.
- `courseId` required and must reference an existing `course` → `400`.
- `imageId` when present must reference an existing `file` → `400`.
- Deleting a course that still owns chapters → `409` (FK RESTRICT, mapped by the
  existing error middleware).

### `/api/words` — extended
- Request body gains optional `chapterId`; when present must reference an
  existing `chapter` → `400`. Response gains `chapterId`.

## 5. Admin console

- **FR-C1** Two new sidebar entries: **Courses** (`/courses`) and **Chapters**
  (`/chapters`), after Words.
- **FR-C2** `/courses` — table (id, image thumb, name, chapter count, created) +
  row Edit/Delete (confirm dialog). "New course" → `/courses/new`.
- **FR-C3** `/courses/new`, `/courses/[id]/edit` — routed form pages sharing
  `CourseForm`: `name` (text) + `image` (FileDropzone → uploads to `/api/files`).
- **FR-C4** `/chapters` — table (id, image thumb, number, name, course name,
  created) + Edit/Delete. "New chapter" → `/chapters/new`.
- **FR-C5** `/chapters/new`, `/chapters/[id]/edit` — `ChapterForm`: `number`,
  `name`, `course` (select of existing courses, required), `image`
  (FileDropzone).
- **FR-C6** `WordForm` gains an optional **Chapter** select (so the new
  `word.chapterId` column is editable). Not in the idea's admin list but
  required to make the column usable.

## 6. Out of scope

- Ordering/reordering chapters beyond the raw `number` field.
- Nesting words under chapters in the Words list UI (just the select on the form).
- Cascade delete; uniqueness of course/chapter names or chapter numbers.
- Any change to admin/customer/file/word behaviour beyond the above.

## 7. Acceptance

- `POST /api/courses {name}` works; `POST /api/chapters` without a valid
  `courseId` → `400`; deleting a course with chapters → `409`.
- `word` round-trips `chapterId`; deleting the chapter nulls it.
- Console: Courses & Chapters in the nav; create a course with an image, add a
  chapter to it (course select), edit and delete both; assign a word to a
  chapter.
- `tsc` / lint / unit tests / build green on both projects.
