# User Management Pro

A small customer-management system plus two front-ends, built to the specs in
[`docs/spec`](docs/spec) and the per-feature notes in
[`docs/steering`](docs/steering).

| Part | Stack | Port | What it is |
|------|-------|------|------------|
| [`backend/`](backend) | Node · Express · TypeScript · MySQL (`mysql2`, **no ORM**) | `4000` | REST API — auth + CRUD for `admin`, `customer`, `file`, `word`, `course`, `chapter` |
| [`admin/`](admin) | Next.js 14 (App Router) · TypeScript · Tailwind | `3000` | Admin console — login + routed create/edit pages for every resource |
| [`home/`](home) | Next.js 14 · TypeScript · Tailwind · font *M PLUS 1p* | `3100` | 用語ー図書館 — a login-less Japanese reader / flashcard site over the public `GET` endpoints |

---

## Architecture

```
                 ┌───────────── admin  :3000  (token, full CRUD)
Browser ── HTTP ──┤
                 └───────────── home   :3100  (no token, GET only)
                                    │
                                    ▼
                         backend :4000  ──SQL──▶  MySQL
      routes → controller → services → repository → ult
      uploads written to backend/public/upload, served at /upload/*
```

- **Layering (backend):** dependencies point one way only —
  `routes → controller → services → repository → ult`. SQL lives only in the
  repository layer, always parameterised, never `SELECT *`.
- **Auth:** `POST /api/auth/login` returns a JWT; send it as
  `Authorization: Bearer <token>`.
  - `admins`, `customers` — every verb needs a token.
  - `files`, `courses`, `chapters`, `words` — **`GET` is public**;
    `POST` / `PUT` / `DELETE` need a token (so `home` can run without a login).
- **File uploads:** `POST /api/files` is `multipart/form-data`; the binary is
  written to `backend/public/upload/<uuid><ext>` and served statically at
  `GET /upload/<uuid><ext>`. `file.detail` stores that URL path.

---

## Prerequisites

- Node.js 18+ and npm
- A MySQL / MariaDB server (XAMPP works)

## Setup

### 1. Database

```bash
# create the schema (adjust user / db name to taste)
mysql -u root user_management_pro < backend/db/schema.sql
```

Seed one admin so you can log into the console. Generate a bcrypt hash for your
password first:

```bash
cd backend && node -e "require('bcrypt').hash('admin123', 10).then(console.log)"
```

```sql
-- the hash below is bcrypt('admin123'); replace it with your own
INSERT INTO admin (username, password, email)
VALUES ('admin', '$2b$10$MWVaK8auzLgMBb9eYN/2oebWsc7JSuSoKenij2ogvBEC3MFzMqIFy', 'admin@example.com');
```

Log into the console with `admin` / `admin123`.

### 2. Backend

```bash
cd backend
cp .env.example .env      # then edit .env
npm install
npm run dev               # http://localhost:4000
```

`.env` keys: `PORT` (use `4000`), `DB_HOST`, `DB_PORT`, `DB_USER`,
`DB_PASSWORD` (may be blank), `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`,
`CORS_ORIGINS`.

### 3. Admin console

```bash
cd admin
cp .env.example .env.local          # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                         # http://localhost:3000
```

### 4. Home site

```bash
cd home
cp .env.example .env.local          # NEXT_PUBLIC_API_BASE_URL=http://localhost:4000
npm install
npm run dev                         # http://localhost:3100
```

---

## Scripts

Same in each project:

| Command | Backend | admin / home |
|---------|---------|--------------|
| `npm run dev` | ts-node-dev, port 4000 | `next dev` (3000 / 3100) |
| `npm run build` | `tsc` → `dist/` | `next build` |
| `npm start` | `node dist/index.js` | `next start` |
| `npm test` | Jest (services + middleware) | Vitest (`src/lib/*`) |
| `npm run lint` | ESLint | `next lint` |
| `npm run typecheck` | — | `tsc --noEmit` |

---

## API

Base path `/api`. JSON in/out, except `POST /api/files` (multipart).

| Resource | Endpoints | Body (POST / PUT) |
|----------|-----------|-------------------|
| `auth` | `POST /auth/login` | `{ username, password }` → `{ token }` |
| `admins` | `GET·POST /admins`, `GET·PUT·DELETE /admins/:id` | `{ username, password, email }` |
| `customers` | same shape | `{ username, password, email, point?, avatarId?, adminId }` |
| `files` | GET public · `POST` multipart · `PUT·DELETE` | `file` (binary) + optional `name` |
| `words` | GET public · rest token | `{ word, explain?, imageId?, soundId?, readExplainId?, chapterId? }` |
| `courses` | GET public · rest token | `{ name, imageId? }` |
| `chapters` | GET public · rest token | `{ number, name, courseId, imageId? }` |

Errors: `{ error, details? }` with status `400` / `401` / `404` / `409` / `413`
/ `500`.

### Data model

`admin`, `customer`, `file`, then:

- `word` — `word`, `explain`, `imageId` / `soundId` / `readExplainId` → `file`,
  `chapterId` → `chapter` (all FKs `ON DELETE SET NULL`).
- `course` — `name`, `imageId` → `file`.
- `chapter` — `number`, `name`, `imageId` → `file`, `courseId` → `course`
  (`ON DELETE RESTRICT` — clear the chapters before deleting a course).

Full column detail: [`docs/spec/functional-design.md`](docs/spec/functional-design.md).

---

## The `home` site (用語ー図書館)

A login-less Japanese study site. Routes:

| Route | Screen |
|-------|--------|
| `/` | library grid — courses as procedurally-drawn "book" covers, searchable |
| `/course/[id]` | one course: cover + its chapters |
| `/chapter/[id]` | one chapter: its word list + a "study" link |
| `/flashcard/[id]` | study a chapter's words as flip cards — **front:** picture + word + 発音 audio · **back:** meaning + 解説 audio |

---

## Repository layout

```
backend/    src/{routes,controller,services,repository,middleware,ult}/  db/schema.sql  public/upload/
admin/      src/app/(app)/{dashboard,admins,customers,files,words,courses,chapters}/  src/{components,lib,hooks}/
home/       src/app/{course,chapter,flashcard}/[id]/  src/{components,lib}/
docs/
  spec/      product-requirements · functional-design · architecture · repository-structure · development-guidelines · glossary
  steering/  admin · file-upload-20260907 · word-20260907 · course-20260907 · home
  ideas/     the raw idea notes each feature grew from
```

## Testing

- **Backend:** `cd backend && npm test` — Jest unit tests for every service
  (repository mocked) and the middleware.
- **Front-ends:** `cd admin && npm test` / `cd home && npm test` — Vitest over
  the pure `src/lib/*` helpers (API client, validation, formatting, flashcard
  face mapping, …). A Next front-end has no service/middleware layer, so
  `src/lib` is what the specs cover.

Run `npm run lint` and `npm run build` in each project before committing.
