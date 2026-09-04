# Product Requirements Document

## 1. Overview
A system for managing customer information. The system exposes a backend RESTful
API that lets an administrator authenticate and manage administrators, customers,
and file records.

> Scope rule (from the initial idea): **Do not build anything unless there is a
> stated requirement for it.** Everything below is traced to the initial idea.

## 2. Goals
- Provide a secure login for administrators.
- Allow an authenticated admin to create, read, update, and delete every entity
  in the system (admins, customers, files).
- Persist all data in MySQL, accessed directly through SQL (no ORM).

## 3. Out of scope
The following are **not** required by the initial idea and are therefore excluded
until a requirement is added:
- Customer-facing login or self-service.
- Points earning / redemption rules or history.
- File binary upload / download / storage (only the `file` metadata record is
  described).
- Roles or permissions beyond a single "admin" actor.
- Password reset, email verification, refresh tokens, rate limiting.
- Pagination, search, sorting, soft delete, audit logging.

## 4. Actors
| Actor | Description |
|-------|-------------|
| Admin | The only authenticated actor. Can manage all entities. |

## 5. Functional requirements

> The initial idea grants the admin "create, update, and delete". Read (list /
> get) is included as the minimum needed to manage the data through a REST API
> and is not treated as extra scope.

### FR-1 Authentication
- FR-1.1 An admin can log in with `username` and `password`.
- FR-1.2 On success the API returns an access token (JWT).
- FR-1.3 On failure the API returns `401 Unauthorized`.
- FR-1.4 Every management endpoint (FR-2..FR-4) requires a valid token.

### FR-2 Admin management
- FR-2.1 Create an admin (`username`, `password`, `email`).
- FR-2.2 List admins.
- FR-2.3 Get one admin by id.
- FR-2.4 Update an admin.
- FR-2.5 Delete an admin.
- FR-2.6 Passwords are never returned in any response.

### FR-3 Customer management
- FR-3.1 Create a customer. Required: `username`, `password`, `email`,
  `adminId`. Optional: `point` (defaults to `0`), `avatarId` (nullable).
- FR-3.2 List customers.
- FR-3.3 Get one customer by id.
- FR-3.4 Update a customer.
- FR-3.5 Delete a customer.
- FR-3.6 `avatarId` references a `file` record; `adminId` references an `admin`
  record.
- FR-3.7 Passwords are never returned in any response.

### FR-4 File record management
- FR-4.1 Create a file record (`name`, `detail`).
- FR-4.2 List file records.
- FR-4.3 Get one file record by id.
- FR-4.4 Update a file record.
- FR-4.5 Delete a file record.

## 6. Data requirements
Three tables are required: `admin`, `customer`, `file`. Column-level detail is in
[functional-design.md](./functional-design.md) and
[glossary.md](./glossary.md).

## 7. Non-functional requirements
- NFR-1 Stack: Node.js + Express + TypeScript.
- NFR-2 Database: MySQL, accessed with the `mysql2` driver. **ORM is prohibited.**
- NFR-3 All DB connection settings come from environment variables (`.env`).
- NFR-4 Passwords are stored hashed, never in plain text.
- NFR-5 The API returns JSON and uses conventional HTTP status codes.
- NFR-6 Code follows the `services` / `repository` layered structure.

## 8. Acceptance criteria
- An admin seeded in the database can log in and receive a token.
- Requests without a valid token to management endpoints return `401`.
- With a valid token, all CRUD operations on `admin`, `customer`, and `file`
  succeed and are reflected in MySQL.
- No response body ever contains a password field.
