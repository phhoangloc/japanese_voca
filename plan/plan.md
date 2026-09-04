# Plan: Generate the `backend` project (Customer Management API)

## Context
`docs/spec/` holds the agreed PRD, functional design, architecture, repository
structure, dev guidelines, and glossary. No code exists yet (`backend/` is
absent). This plan generates the initial backend implementation: a Node.js +
Express + TypeScript REST API over MySQL (via `mysql2`, **no ORM**), in the
`routes → controller → services → repository` layering, covering admin login and
full CRUD for `admin`, `customer`, and `file`.

Outcome: a runnable, type-checked API with `npm run dev` / `npm run build`, a
checked-in SQL schema, and unit tests for the service and middleware layers.

## Approach

### 1. Scaffold `backend/`
- `package.json` — scripts: `dev` (ts-node-dev), `build` (tsc), `start`
  (node dist), `test` (jest), `lint`.
- Deps: `express@^4`, `mysql2@^3`, `jsonwebtoken@^9`, `bcrypt@^5`, `dotenv@^16`.
- Dev deps: `typescript@^5`, `ts-node-dev`, `@types/{express,node,jsonwebtoken,bcrypt,supertest}`,
  `jest`, `ts-jest`, `@types/jest`, `supertest`,
  `eslint`, `@typescript-eslint/*`, `prettier`.
- `tsconfig.json` — `strict: true`, `outDir: dist`, `rootDir: src`, CommonJS,
  ES2021.
- `.env.example` (all vars), `.gitignore` (`node_modules`, `dist`, `.env`),
  `.eslintrc.json`, `.prettierrc`, `jest.config.js`.

### 2. `src/ult/` (cross-cutting helpers)
- `config.ts` — load `dotenv`, read + validate required env vars
  (`PORT`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`,
  `JWT_SECRET`, `JWT_EXPIRES_IN`); exit on missing var; export typed `config`.
- `db.ts` — single `mysql2/promise` pool from `config`.
- `password.ts` — `hash()` / `compare()` wrapping bcrypt (cost 10).
- `jwt.ts` — `sign({ sub, username })` / `verify()` helpers.
- `api-error.ts` — `ApiError` class (`status`, `message`, `details`) +
  factories `badRequest`, `unauthorized`, `notFound`, `conflict`.
- `validate.ts` — small helpers: `requireString`, `optionalInt`, email regex;
  returns `{ error, details }` shape on failure.

### 3. `src/middleware/` (Express middleware — testable in isolation)
> Deviation from `repository-structure.md`, which placed middleware in `ult`.
> A dedicated `src/middleware/` folder is added so middleware has a clear home
> and its own test folder (the add-feature workflow requires middleware tests).
> `repository-structure.md` is updated to match.
- `auth.middleware.ts` — read `Authorization: Bearer`, verify JWT, attach
  `req.admin = { id, username }`, else throw `ApiError.unauthorized`.
- `error.middleware.ts` — the only place that writes an error response; maps
  `ApiError` → JSON per functional-design §3; catches `ER_DUP_ENTRY` → 409 and
  FK restrict (`ER_ROW_IS_REFERENCED_2`) → 409; unknown → 500.
- `request-logger.middleware.ts` — one-line method/path/status log.

### 4. Domain layers — one file per resource per layer
For `admin`, `customer`, `file`:
- `repository/<res>.repository.ts` — hand-written parameterized SQL via the
  pool: `findAll`, `findById`, `create`, `update`, `remove`; explicit column
  lists (no `SELECT *`); map snake_case rows → camelCase objects
  (`createdAt`, `updatedAt`).
- `services/<res>.service.ts` — business rules:
  - admin/customer: hash password on create + on update-if-present; strip
    `password` from every returned object.
  - customer: verify `adminId` exists (→ `badRequest`) and, if `avatarId`
    given, verify the file exists (→ `badRequest`).
  - `getById` throws `notFound` when missing.
- `controller/<res>.controller.ts` — validate body via `validate.ts`, call
  service, send `200/201/204` per functional-design §2.2.
- `routes/<res>.routes.ts` — REST routes, all behind `auth.middleware`.

### 5. Auth slice
- `services/auth.service.ts` — `login(username, password)`: load admin by
  username, `password.compare`, on success return `jwt.sign`; else
  `ApiError.unauthorized('Invalid credentials')`.
- `controller/auth.controller.ts` — `POST /auth/login` → `{ token }`.
- `routes/auth.routes.ts` — unprotected `/auth/login`.

### 6. App wiring
- `routes/index.ts` — mount `auth`, `admins`, `customers`, `files` under `/api`.
- `app.ts` — `express.json()`, request logger, `/api` router, 404 handler,
  `error.middleware` last. Export `app` (no `listen`) for supertest.
- `index.ts` — `app.listen(config.port)`.

### 7. Database schema
- `backend/db/schema.sql` — `CREATE TABLE` for `admin`, `file`, `customer`
  exactly per functional-design §1.1 (PK auto-increment, unique
  `username`/`email`, `point INT NOT NULL DEFAULT 0`, `avatarId` FK → `file(id)`
  `ON DELETE SET NULL`, `adminId` FK → `admin(id)` `ON DELETE RESTRICT`,
  `created_at` / `updated_at` timestamps). InnoDB, utf8mb4.

### 8. Tests (`jest` + `ts-jest`)
- `src/services/__tests__/` — unit tests with the repository mocked
  (`jest.mock`): `auth`, `admin`, `customer`, `file` service tests.
- `src/middleware/__tests__/` — `auth.middleware` and `error.middleware` tests.
- Run `npm test`; fix any failures.

## Verification
1. `cd backend && npm install`.
2. `npm run build` — TypeScript compiles with no errors.
3. `npm test` — all service + middleware unit tests pass.
4. `npm run lint` — no lint errors.
5. Manual (optional, needs a local MySQL): run `db/schema.sql`, seed one admin,
   copy `.env.example` → `.env`, `npm run dev`; login returns a token; protected
   call without token → 401; with token, CRUD on `/api/customers` works; no
   response contains `password`.
