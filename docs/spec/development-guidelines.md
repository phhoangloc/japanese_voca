# Development Guidelines

## 1. Language & stack
- All code, comments, identifiers, and docs in **English**.
- Node.js (LTS), Express, TypeScript (`strict: true`), MySQL via `mysql2`.
- **No ORM.** No query builder. SQL is written by hand in the repository layer.

## 2. Layering rules
- Import direction is one-way: `routes -> controller -> services -> repository -> ult`.
- A controller never runs SQL. A repository never validates HTTP input or hashes
  passwords. Business rules live only in services.
- `ult` holds cross-cutting helpers and may not import from any other layer.

## 3. Database
- Connect only through the shared pool in `src/ult/db.ts`.
- Every query uses placeholders: `pool.execute('... WHERE id = ?', [id])`.
  Never interpolate values into SQL strings.
- Column list is explicit in `SELECT` (no `SELECT *`).
- Repository functions return plain objects / arrays, not driver result tuples.
- Credentials come from `config` (env), never hard-coded.

## 4. Configuration
- Read env only in `src/ult/config.ts`; the rest of the app imports `config`.
- Keep `backend/.env.example` in sync with every variable that is read.
- `.env` is git-ignored and never committed.

## 5. API conventions
- Base path `/api`. Resource paths are plural nouns (`/customers`).
- Status codes and error body follow
  [functional-design.md](./functional-design.md#3-error-model).
- Responses for `admin` and `customer` must strip `password` (do it in the
  service or a mapper, not ad hoc).
- Request validation happens in the controller (or a `validate.ts` helper)
  before the service is called.

## 6. Security
- Hash passwords with `bcrypt` (cost 10) on create and on password change.
- Compare with `bcrypt.compare`; never compare hashes as strings.
- JWT signed with `JWT_SECRET`; verify on every protected route via
  `auth.middleware.ts`.
- Do not log passwords, hashes, tokens, or full request bodies.

## 7. TypeScript style
- `strict` on; no `any` unless justified with a comment.
- Define an interface per entity (`Admin`, `Customer`, `File`) and per request
  DTO (`CreateCustomerInput`, ...).
- Prefer `async/await`; no floating promises.
- Named exports only.

## 8. Errors
- Throw `ApiError.badRequest(...)`, `ApiError.notFound(...)`, etc. from services
  and controllers.
- One Express error-handling middleware is the only place that writes an error
  response.
- Catch driver duplicate-key errors (`ER_DUP_ENTRY`) and translate to `409`.

## 9. Formatting & tooling
- Prettier defaults + ESLint (`@typescript-eslint/recommended`).
- 2-space indent, semicolons, single quotes.

## 10. Testing (when added)
- Unit-test services with the repository mocked.
- Keep SQL in repositories so it can be integration-tested against a real MySQL.
- Not required by current scope; add alongside the first feature that needs it.

## 11. Git
- Conventional commit style (`feat:`, `fix:`, `chore:`, `docs:`).
- `dist/`, `node_modules/`, `.env` are git-ignored.

## 12. Scope discipline
- Per the initial idea: **do not implement anything without a written
  requirement.** New behaviour starts with an update to
  [product-requirements.md](./product-requirements.md).
