# Glossary

| Term | Definition |
|------|------------|
| **Admin** | The single authenticated actor. Can create, read, update, and delete every entity (admins, customers, files). Stored in the `admin` table. |
| **Customer** | A managed record representing a customer's information: `username`, `password`, `email`, `point`, `avatarId`, `adminId`. Stored in the `customer` table. Customers do **not** log in (out of scope). |
| **File** | A metadata record with `name` and `detail`. Referenced by `customer.avatarId`. The current scope covers only the record, not binary file storage or transfer. |
| **avataId / avatarId** | The initial idea spells this `avataId`. It is implemented as `avatarId`, a nullable foreign key `customer.avatarId -> file.id`, meaning the customer's avatar image record. |
| **adminId** | Foreign key `customer.adminId -> admin.id`. The admin that owns / manages this customer. Not null. |
| **point** | Integer loyalty-point balance on a customer. Defaults to `0`. No earning or redemption logic is in scope — the value is only stored and edited directly. |
| **Login** | `POST /api/auth/login` with `username` + `password`; returns a JWT access token on success, `401` on failure. |
| **JWT / token** | JSON Web Token signed with `JWT_SECRET`, sent as `Authorization: Bearer <token>`. Payload identifies the admin. Expires after `JWT_EXPIRES_IN`. |
| **Access token** | Synonym for the JWT issued at login. No refresh token in scope. |
| **Route** | `src/routes/*` — binds an HTTP method + path to a controller and attaches auth middleware. |
| **Controller** | `src/controller/*` — validates the request, calls a service, shapes the HTTP response. |
| **Service** | `src/services/*` — business rules (hashing, foreign-key checks, orchestration). |
| **Repository** | `src/repository/*` — hand-written parameterized SQL via `mysql2`; maps rows to objects. |
| **ult** | `src/ult/*` — the utility folder (spelling mandated by `CLAUDE.md`). Holds the DB pool, JWT/bcrypt helpers, config, error types, auth middleware. |
| **Pool** | The shared `mysql2/promise` connection pool in `src/ult/db.ts`; the only way the app talks to MySQL. |
| **ApiError** | Typed application error carrying an HTTP `status`, `message`, and optional `details`; converted to a JSON response by the error middleware. |
| **ORM** | Object-Relational Mapper. **Prohibited** in this project; all persistence is raw SQL. |
| **SQL2 / mysql2** | The `mysql2` Node.js driver used for all database access. |
| **DTO** | Data Transfer Object — a typed shape for a request body (e.g. `CreateCustomerInput`). |
| **`.env`** | Local environment file (git-ignored) supplying DB credentials and JWT settings. Documented by `backend/.env.example`. |
| **schema.sql** | `backend/db/schema.sql` — checked-in `CREATE TABLE` script; the only schema tool (no ORM migrations). |
