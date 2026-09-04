# Task Breakdown — Backend generation

Derived from `plan/plan.md`. Check off each task as it is completed.

## T1. Project scaffold
- [x] T1.1 `backend/package.json` with deps, devDeps, scripts
- [x] T1.2 `backend/tsconfig.json` (strict, rootDir src, outDir dist)
- [x] T1.3 `backend/jest.config.js` (ts-jest, node env)
- [x] T1.4 `backend/.env.example` with every env var
- [x] T1.5 `backend/.gitignore` (node_modules, dist, .env)
- [x] T1.6 `backend/.eslintrc.json` + `backend/.prettierrc`

## T2. Database schema
- [x] T2.1 `backend/db/schema.sql` — `admin`, `file`, `customer` per functional-design §1.1

## T3. `src/ult/` helpers
- [x] T3.1 `config.ts` — load + validate env, typed `config`
- [x] T3.2 `db.ts` — `mysql2/promise` pool
- [x] T3.3 `password.ts` — bcrypt hash/compare
- [x] T3.4 `jwt.ts` — sign/verify
- [x] T3.5 `api-error.ts` — `ApiError` + factories
- [x] T3.6 `validate.ts` — body validation helpers

## T4. `src/middleware/`
- [x] T4.1 `auth.middleware.ts` — Bearer JWT verify, attach `req.admin`
- [x] T4.2 `error.middleware.ts` — map `ApiError` / driver errors → JSON
- [x] T4.3 `request-logger.middleware.ts`
- [x] T4.4 `src/types/express.d.ts` — augment `Request` with `admin`

## T5. Repository layer
- [x] T5.1 `admin.repository.ts` — findAll/findById/findByUsername/create/update/remove
- [x] T5.2 `file.repository.ts` — findAll/findById/create/update/remove
- [x] T5.3 `customer.repository.ts` — findAll/findById/create/update/remove

## T6. Service layer
- [x] T6.1 `auth.service.ts` — login → JWT
- [x] T6.2 `admin.service.ts` — CRUD, hash password, strip password
- [x] T6.3 `file.service.ts` — CRUD, notFound on missing
- [x] T6.4 `customer.service.ts` — CRUD, FK checks, hash + strip password

## T7. Controller layer
- [x] T7.1 `auth.controller.ts`
- [x] T7.2 `admin.controller.ts`
- [x] T7.3 `file.controller.ts`
- [x] T7.4 `customer.controller.ts`

## T8. Routes + app wiring
- [x] T8.1 `routes/auth.routes.ts` (unprotected)
- [x] T8.2 `routes/admin.routes.ts` `routes/customer.routes.ts` `routes/file.routes.ts` (protected)
- [x] T8.3 `routes/index.ts` — mount under `/api`
- [x] T8.4 `app.ts` — middleware chain, 404, error handler, export `app`
- [x] T8.5 `index.ts` — `app.listen(config.port)`

## T9. Tests
- [x] T9.1 `services/__tests__/auth.service.test.ts`
- [x] T9.2 `services/__tests__/admin.service.test.ts`
- [x] T9.3 `services/__tests__/customer.service.test.ts`
- [x] T9.4 `services/__tests__/file.service.test.ts`
- [x] T9.5 `middleware/__tests__/auth.middleware.test.ts`
- [x] T9.6 `middleware/__tests__/error.middleware.test.ts`

## T10. Spec sync
- [x] T10.1 Update `docs/spec/repository-structure.md` to add `src/middleware/` + `src/types/`

## T11. Verification
- [x] T11.1 `npm install`
- [x] T11.2 `npm run build` passes
- [x] T11.3 `npm test` passes
- [x] T11.4 `npm run lint` passes
