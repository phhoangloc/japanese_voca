# Word feature — Requirements

Traces to `docs/ideas/word-idea.md`. Extends the existing backend API and admin
console (Phase 2 of the add-feature workflow).

## 1. Overview

A fifth managed entity, **word**, with full CRUD on both the backend REST API
and the admin console. A word carries a term, an explanation, and up to three
attached files (image, sound, and a spoken-explanation audio), each linked by a
`file` id.

## 2. Naming decision

`word-idea.md` heads the table `Table (item)`, but every other reference — the
feature title, the `word` column, the nav label **Words**, and "CRUD word" —
says *word*. Following the `avataId` → `avatarId` normalization precedent
(`docs/spec/functional-design.md` §1.3) the entity is implemented as **`word`**
end to end: table `word`, `/api/words`, admin routes `/words`.

The three file columns are annotated "(fileId)" in the idea and are implemented
with the house `…Id` FK style (cf. `customer.avatarId`): `imageId`, `soundId`,
`readExplainId`.

## 3. Data model

### Table `word`

| Column        | Type          | Constraints                                   |
|---------------|---------------|----------------------------------------------|
| id            | BIGINT        | PK, AUTO_INCREMENT                            |
| word          | VARCHAR(255)  | NOT NULL                                      |
| explain       | TEXT          | NULL                                         |
| imageId       | BIGINT        | NULL, FK → `file`.id, ON DELETE SET NULL      |
| soundId       | BIGINT        | NULL, FK → `file`.id, ON DELETE SET NULL      |
| readExplainId | BIGINT        | NULL, FK → `file`.id, ON DELETE SET NULL      |
| created_at    | DATETIME      | NOT NULL DEFAULT CURRENT_TIMESTAMP            |
| updated_at    | DATETIME      | NOT NULL DEFAULT … ON UPDATE CURRENT_TIMESTAMP|

- No uniqueness on `word` (duplicates allowed; the idea states none).
- `ON DELETE SET NULL` matches `customer.avatarId` — deleting a `file` clears
  the reference rather than blocking the delete.

## 4. Backend API — `/api/words` (all require a Bearer token)

| Method | Path             | Body                                              | Success |
|--------|------------------|---------------------------------------------------|---------|
| GET    | `/api/words`     | —                                                 | `200 [ … ]` |
| GET    | `/api/words/:id` | —                                                 | `200 { … }` / `404` |
| POST   | `/api/words`     | `{ word, explain?, imageId?, soundId?, readExplainId? }` | `201 { … }` |
| PUT    | `/api/words/:id` | same body (full update)                            | `200 { … }` / `404` |
| DELETE | `/api/words/:id` | —                                                 | `204` / `404` |

### Validation (controller + service)
- `word` required, non-empty string.
- `explain` optional string (stored `null` when absent/blank).
- `imageId` / `soundId` / `readExplainId` optional positive integers; when
  present each must reference an existing `file` row → else `400`
  (`{ error, details }`), same as `customer.avatarId`.
- Unknown fields ignored.

### Response body
- `{ id, word, explain, imageId, soundId, readExplainId, createdAt, updatedAt }`
  (snake_case timestamps mapped to camelCase in the repository).

## 5. Admin console

- **FR-W1** New sidebar entry **"Words"** → `/words`, between Customers and
  Files, active-highlighted like the others.
- **FR-W2** `/words` — a table (id, word, explain preview, small badges for
  which of image/sound/read_explain are set, created at) + row Edit/Delete.
  Delete uses the confirm dialog. "New word" links to `/words/new`.
- **FR-W3** `/words/new` and `/words/[id]/edit` — routed form pages (per
  `admin-idea.md` "folder structure"), sharing a `WordForm` component.
- **FR-W4** The form has: `word` (text, required), `explain` (textarea), and
  three **file upload boxes** for image / sound / read_explain.
- **FR-W5** Each upload box supports drag-and-drop **and** click to open the OS
  picker. On submit, a newly chosen file is POSTed to `/api/files`
  (multipart) and the returned `file` id is stored on the word.
- **FR-W6** Preview rule (from the idea): if the linked file is an image, show
  the image; otherwise show the file name.
- **FR-W7** On save the form returns to `/words` (with `router.refresh()`).

## 6. Out of scope

- Uniqueness / dedupe of `word`; search or pagination on the list.
- Playing audio in the browser (the box shows the file name / a link only).
- Bulk import, tags, categories, examples — not in the idea.
- Any change to admin / customer / file behaviour beyond adding the nav link.

## 7. Acceptance

- `POST /api/words` with just `{ word }` creates a row; with a bad `imageId`
  returns `400`.
- The three file ids round-trip and, after deleting a referenced `file`, come
  back `null`.
- In the console: Words appears in the nav; create a word with an uploaded
  image + sound, see it listed; edit it (image preview shows, sound shows its
  name); delete it.
- `tsc` / lint / unit tests / build green on both projects.
