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
| detail     | TEXT          | NULL                               |                      |
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

### 1.2 Relationships
- `customer.adminId` -> `admin.id` (many customers per admin). `ON DELETE RESTRICT`.
- `customer.avatarId` -> `file.id` (optional). `ON DELETE SET NULL`.

### 1.3 Naming
- Table and column names use the names from the initial idea. `avataId` is
  implemented as `avatarId` (typo corrected; see [glossary.md](./glossary.md)).
- API request/response fields use camelCase (`avatarId`, `adminId`).

## 2. API design

Base path: `/api`. All bodies and responses are JSON.

### 2.1 Auth

| Method | Path              | Auth | Body                     | Success       |
|--------|-------------------|------|--------------------------|---------------|
| POST   | `/auth/login`     | none | `{ username, password }` | `200 { token }` |

- Invalid credentials -> `401 { error: "Invalid credentials" }`.
- Token is a JWT signed with `JWT_SECRET`, expiring after `JWT_EXPIRES_IN`.
  Payload: `{ sub: <admin.id>, username }`.
- Send on protected routes as `Authorization: Bearer <token>`.

### 2.2 Resource endpoints

Same shape for `admins`, `customers`, `files`. All require a valid token.

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
- `files`: `{ name, detail? }`

#### Response bodies
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
