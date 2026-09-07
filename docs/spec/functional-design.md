# Functional Design

Traces to [product-requirements.md](./product-requirements.md).

## 1. Data model

### 1.1 Tables

#### `admin`
| Column     | Type          | Constraints                         | Notes                |
|------------|---------------|-------------------------------------|----------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                   |                      |
| username   | VARCHAR(255)  | NOT NULL, UNIQUE                     | login identifier     |
| password   | VARCHAR(255)  | NOT NULL                            | bcrypt hash          |
| email      | VARCHAR(255)  | NOT NULL, UNIQUE                     |                      |
| created_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                      |
| updated_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### `file`
| Column     | Type          | Constraints                         | Notes                |
|------------|---------------|-------------------------------------|----------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                   |                      |
| name       | VARCHAR(255)  | NOT NULL                            |                      |
| detail     | VARCHAR(512)  | NULL                               | public URL path of the uploaded file, e.g. `/upload/<uuid>.png` |
| created_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                      |
| updated_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### `customer`
| Column     | Type          | Constraints                         | Notes                          |
|------------|---------------|-------------------------------------|--------------------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                   |                                |
| username   | VARCHAR(255)  | NOT NULL, UNIQUE                     |                                |
| password   | VARCHAR(255)  | NOT NULL                            | bcrypt hash                    |
| email      | VARCHAR(255)  | NOT NULL, UNIQUE                     |                                |
| point      | INT           | NOT NULL, DEFAULT 0                  | loyalty points balance         |
| avatarId   | BIGINT        | NULL, FK -> `file`.id                | source column `avataId` in idea |
| adminId    | BIGINT        | NOT NULL, FK -> `admin`.id           | owning admin                   |
| created_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                                |
| updated_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### `word`
| Column        | Type          | Constraints                         | Notes                          |
|---------------|---------------|-------------------------------------|--------------------------------|
| id            | BIGINT        | PK, AUTO_INCREMENT                   |                                |
| word          | VARCHAR(255)  | NOT NULL                            | the term                       |
| explain       | TEXT          | NULL                               | definition (reserved word — backticked in SQL) |
| imageId       | BIGINT        | NULL, FK -> `file`.id               | attached image                 |
| soundId       | BIGINT        | NULL, FK -> `file`.id               | attached sound                 |
| readExplainId | BIGINT        | NULL, FK -> `file`.id               | spoken-explanation audio       |
| chapterId     | BIGINT        | NULL, FK -> `chapter`.id            | owning chapter (optional)       |
| created_at    | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                                |
| updated_at    | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP | |

#### `course`
| Column     | Type          | Constraints                         | Notes            |
|------------|---------------|-------------------------------------|------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                   |                  |
| name       | VARCHAR(255)  | NOT NULL                            |                  |
| imageId    | BIGINT        | NULL, FK -> `file`.id               | cover image      |
| created_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                  |
| updated_at | DATETIME      | NOT NULL, DEFAULT … ON UPDATE …      |                  |

#### `chapter`
| Column     | Type          | Constraints                         | Notes            |
|------------|---------------|-------------------------------------|------------------|
| id         | BIGINT        | PK, AUTO_INCREMENT                   |                  |
| number     | INT           | NOT NULL                            | order within course |
| name       | VARCHAR(255)  | NOT NULL                            |                  |
| imageId    | BIGINT        | NULL, FK -> `file`.id               |                  |
| courseId   | BIGINT        | NOT NULL, FK -> `course`.id         | owning course    |
| created_at | DATETIME      | NOT NULL, DEFAULT CURRENT_TIMESTAMP  |                  |
| updated_at | DATETIME      | NOT NULL, DEFAULT … ON UPDATE …      |                  |

### 1.2 Relationships
- `customer.adminId` -> `admin.id` (many customers per admin). `ON DELETE RESTRICT`.
- `customer.avatarId` -> `file.id` (optional). `ON DELETE SET NULL`.
- `word.imageId` / `word.soundId` / `word.readExplainId` -> `file.id` (all
  optional). `ON DELETE SET NULL`.
- `word.chapterId` -> `chapter.id` (optional). `ON DELETE SET NULL`.
- `course.imageId` / `chapter.imageId` -> `file.id` (optional). `ON DELETE SET NULL`.
- `chapter.courseId` -> `course.id` (required). `ON DELETE RESTRICT` (delete the
  chapters before the course).

### 1.3 Naming
- Table and column names use the names from the initial idea. `avataId` is
  implemented as `avatarId` (typo corrected; see [glossary.md](./glossary.md)).
  The word idea heads its table `item`; it is implemented as `word` (the name
  used everywhere else in that idea — see
  [steering/word-20260907](../steering/word-20260907/requirement.md)).
- The word idea's `image` / `sound` / `read_explain` "(fileId)" columns are
  implemented with the `…Id` FK style: `imageId`, `soundId`, `readExplainId`.
- The course idea's `image (file.id)` / `course_id` / `chaper_id` become
  `imageId` / `courseId` / `chapterId`. Its `Table (item)`-style heading names
  are taken literally (`course`, `chapter`).
- API request/response fields use camelCase (`avatarId`, `adminId`, `imageId`,
  `courseId`, `chapterId`).

## 2. API design

Base path: `/api`. All bodies and responses are JSON, **except** `POST /api/files`,
which is `multipart/form-data` (a binary upload).

Uploaded files are written to `backend/public/upload/<uuid><ext>` on disk and
served statically at `GET /upload/<uuid><ext>` (no auth). The `file.detail`
column stores that URL path, never the binary.

### 2.1 Auth

| Method | Path              | Auth | Body                     | Success       |
|--------|-------------------|------|--------------------------|---------------|
| POST   | `/auth/login`     | none | `{ username, password }` | `200 { token }` |

- Invalid credentials -> `401 { error: "Invalid credentials" }`.
- Token is a JWT signed with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN`.
  Payload: `{ sub: <admin.id>, username }`.
- Send on protected routes as `Authorization: Bearer <token>`.

### 2.2 Resource endpoints

Same shape for `admins`, `customers`, `files`, `words`, `courses`, `chapters`.
(`POST /files` is multipart — see above; the rest are JSON.)

**Auth per resource:**
- `admins`, `customers` — every verb requires a valid token.
- `files`, `courses`, `chapters`, `words` — `GET` (list and `/:id`) is
  **public**; `POST` / `PUT` / `DELETE` require a token. This lets the
  login-less `home` reader / flashcard site read the catalogue.

| Method | Path                | Success        | Notes                        |
|--------|---------------------|----------------|------------------------------|
| GET    | `/{resource}`       | `200 [ ... ]`  | list all                     |
| GET    | `/{resource}/:id`   | `200 { ... }`  | `404` if not found           |
| POST   | `/{resource}`       | `201 { ... }`  | returns created record       |
| PUT    | `/{resource}/:id`   | `200 { ... }`  | full update; `404` if absent |
| DELETE | `/{resource}/:id`   | `204`          | `404` if absent              |

#### Request bodies
- `admins`: `{ username, password, email }`
- `customers`: `{ username, password, email, point?, avatarId?, adminId }`
- `files` **POST**: `multipart/form-data` with `file` (binary, required) and an
  optional `name` text field (defaults to the uploaded filename). Response
  `detail` is the `/upload/...` URL path.
- `files` **PUT**: `{ name, detail? }` — metadata only; does not replace the
  binary. `413` if an upload exceeds 10 MB.
- `words`: `{ word, explain?, imageId?, soundId?, readExplainId?, chapterId? }`.
  `word` required; each file id must reference an existing `file`, `chapterId`
  an existing `chapter` -> else `400`.
- `courses`: `{ name, imageId? }`. `name` required; `imageId` must reference an
  existing `file` -> else `400`.
- `chapters`: `{ number, name, courseId, imageId? }`. `number` (int >= 0) and
  `name` required; `courseId` must reference an existing `course`, `imageId` an
  existing `file` -> else `400`. Deleting a `course` that still has chapters
  -> `409`.

#### Response bodies
- `word`: `{ id, word, explain, imageId, soundId, readExplainId, chapterId,
  createdAt, updatedAt }`.
- `course`: `{ id, name, imageId, createdAt, updatedAt }`.
- `chapter`: `{ id, number, name, imageId, courseId, createdAt, updatedAt }`.
- `admin` / `customer` objects **omit `password`**.
- All objects include `id`, `createdAt`, `updatedAt`. The repository maps the
  snake_case DB columns (`created_at`, `updated_at`) to these camelCase fields.

### 2.3 Validation rules
- `username`, `email`, `password` required and non-empty on create.
- `email` must match a basic email pattern.
- `point` if present must be an integer `>= 0`; defaults to `0`.
- `adminId` on customer create must reference an existing admin -> else `400`.
- `avatarId` if present must reference an existing file -> else `400`.
- Unknown fields are ignored.
- Validation failure -> `400 { error, details }`.

## 3. Error model
| Status | When                                         | Body                          |
|--------|----------------------------------------------|-------------------------------|
| 400    | validation / bad foreign key                 | `{ error, details? }`         |
| 401    | missing / invalid / expired token, bad login | `{ error }`                   |
| 404    | resource id not found                        | `{ error }`                   |
| 409    | duplicate `username` / `email`, or deleting an admin that still owns customers (`adminId` is `ON DELETE RESTRICT`) | `{ error }` |
| 413    | upload over 10 MB, or a JSON body over 1 MB   | `{ error }`                   |
| 500    | unexpected error                             | `{ error: "Internal error" }` |

## 4. Request flow
```
HTTP request
  -> route (src/routes)
  -> auth middleware (protected routes)
  -> controller (src/controller)      parse & validate input, shape response
  -> service (src/services)           business rules, hashing, FK checks
  -> repository (src/repository)      parameterized SQL via mysql2 pool
  -> MySQL
```

## 5. Security
- Passwords hashed with `bcrypt` (cost 10) before insert/update.
- All SQL uses parameterized queries (no string concatenation).
- JWT secret and DB credentials only from `.env`.
