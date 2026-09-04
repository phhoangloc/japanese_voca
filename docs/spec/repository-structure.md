# Repository Structure

## 1. Top level
```
user_managerment_pro/
├── CLAUDE.md
├── docs/
│   ├── ideas/
│   │   └── initital-idea.md
│   └── spec/
│       ├── product-requirements.md
│       ├── functional-design.md
│       ├── architecture.md
│       ├── repository-structure.md
│       ├── development-guidelines.md
│       └── glossary.md
└── backend/
```

## 2. Backend
```
backend/
├── .env.example            # documents every required variable (no secrets)
├── .env                    # local only, git-ignored
├── .gitignore
├── package.json
├── tsconfig.json
├── jest.config.js
├── .eslintrc.json
├── .prettierrc
├── db/
│   └── schema.sql          # CREATE TABLE admin / file / customer
└── src/
    ├── index.ts            # app entry: start listening
    ├── app.ts              # express app: middleware + route mounting + error handler (exported for tests)
    ├── routes/
    │   ├── index.ts        # mounts the routers below under /api
    │   ├── auth.routes.ts
    │   ├── admin.routes.ts
    │   ├── customer.routes.ts
    │   └── file.routes.ts
    ├── controller/
    │   ├── auth.controller.ts
    │   ├── admin.controller.ts
    │   ├── customer.controller.ts
    │   └── file.controller.ts
    ├── services/
    │   ├── auth.service.ts
    │   ├── admin.service.ts
    │   ├── customer.service.ts
    │   ├── file.service.ts
    │   └── __tests__/       # unit tests, repository mocked
    ├── repository/
    │   ├── admin.repository.ts
    │   ├── customer.repository.ts
    │   └── file.repository.ts
    ├── middleware/          # Express middleware (own test folder)
    │   ├── auth.middleware.ts
    │   ├── error.middleware.ts
    │   ├── request-logger.middleware.ts
    │   └── __tests__/
    ├── types/
    │   ├── entities.ts      # entity + DTO interfaces
    │   └── express.d.ts     # Request augmentation (req.admin)
    ├── test-support/
    │   └── setup-env.ts     # env defaults for jest
    └── ult/
        ├── config.ts       # typed env config, validated at startup
        ├── db.ts           # mysql2/promise pool
        ├── jwt.ts          # sign / verify helpers
        ├── password.ts     # bcrypt hash / compare
        ├── api-error.ts    # ApiError class + factories (badRequest, notFound, ...)
        └── validate.ts     # tiny request-body validation helpers
```

> `ult` is the folder name mandated by `CLAUDE.md` (a spelling of "util").
> `middleware/` is broken out of `ult` so Express middleware has a clear home
> and its own test folder (the add-feature workflow requires middleware tests).

## 3. Layer mapping
| Concern                | File(s)                                   |
|------------------------|-------------------------------------------|
| HTTP routing + auth    | `src/routes/*`                            |
| Request/response shape | `src/controller/*`                        |
| Business rules         | `src/services/*`                          |
| SQL                    | `src/repository/*`                        |
| Express middleware     | `src/middleware/*`                        |
| Shared helpers         | `src/ult/*`                               |
| Types / DTOs           | `src/types/*`                             |
| Schema                 | `backend/db/schema.sql`                   |

## 4. Naming conventions
- Files: `kebab-case.<layer>.ts` (e.g. `customer.service.ts`).
- One resource per file per layer.
- Exports: named exports; each layer file exports a plain object or set of
  functions (e.g. `customerService.create(...)`).

## 5. Build output
- `tsc` emits to `backend/dist/` (git-ignored).
- Dev: `ts-node-dev src/index.ts`. Prod: `node dist/index.js`.
