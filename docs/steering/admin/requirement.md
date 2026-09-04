# Admin Frontend — Requirements

Traces to `docs/ideas/admin-idea.md`, `docs/spec/product-requirements.md`,
`docs/spec/functional-design.md`.

## 1. Overview

A web admin console for **Customer Management Pro**. It is a thin UI on top of the
existing backend REST API (`/backend`). It lets an administrator log in and manage
`admin`, `customer`, and `file` records through the browser.

> Scope rule (inherited from the initial idea): **do not build anything unless a
> requirement calls for it.** No feature below goes past what the backend API and
> the admin idea describe.

## 2. Tech stack (NFR)

- NFR-1 Next.js (App Router) + React + TypeScript.
- NFR-2 Tailwind CSS for styling.
- NFR-3 Talks only to the backend API. Base URL comes from an env var
  (`NEXT_PUBLIC_API_BASE_URL`, default `http://localhost:4000`).
- NFR-4 No backend of its own, no database, no ORM. All persistence is the
  backend API.
- NFR-5 The access token is a JWT obtained from `POST /api/auth/login`; it is sent
  as `Authorization: Bearer <token>` on every other call.

## 3. Backend API surface consumed

| Method | Path                  | Purpose                                    |
|--------|-----------------------|-------------------------------------------|
| POST   | `/api/auth/login`     | `{ username, password }` -> `{ token }`   |
| GET    | `/api/admins`         | list admins                               |
| POST   | `/api/admins`         | `{ username, password, email }`           |
| PUT    | `/api/admins/:id`     | `{ username, email, password? }`          |
| DELETE | `/api/admins/:id`     | remove admin                              |
| GET    | `/api/customers`      | list customers                            |
| POST   | `/api/customers`      | `{ username, password, email, point?, avatarId?, adminId }` |
| PUT    | `/api/customers/:id`  | same body, `password?`                    |
| DELETE | `/api/customers/:id`  | remove customer                           |
| GET    | `/api/files`          | list file records                         |
| POST   | `/api/files`          | `{ name, detail? }`                       |
| PUT    | `/api/files/:id`      | `{ name, detail? }`                       |
| DELETE | `/api/files/:id`      | remove file record                        |

Error shape from the API: `{ error: string, details?: Record<string,string> }`.
`401` on any call => session is invalid => redirect to `/login`.

## 4. Functional requirements

### FR-1 Authentication
- FR-1.1 `/login` page with `username` + `password`. Submitting calls
  `POST /api/auth/login`.
- FR-1.2 On success, store the token (localStorage) and go to `/dashboard`.
- FR-1.3 On failure, show the API error message inline.
- FR-1.4 Every page except `/login` requires a stored token; otherwise redirect
  to `/login`.
- FR-1.5 A "Log out" action clears the token and returns to `/login`.
- FR-1.6 A `401` from any API call clears the token and redirects to `/login`.

### FR-2 App shell
- FR-2.1 Authenticated pages share a layout: left sidebar navigation
  (Dashboard, Admins, Customers, Files) + top bar (page title, logged-in
  username, Log out).
- FR-2.2 Sidebar highlights the active section.
- FR-2.3 Responsive: sidebar collapses to a toggle on narrow screens.

### FR-3 Dashboard
- FR-3.1 Overview cards: total admins, total customers, total files, total
  customer points.
- FR-3.2 A "recent customers" list (last 5 by id).

### FR-4 Admins management
- FR-4.1 Table of admins: id, username, email, created at.
- FR-4.2 "New admin" opens a modal form (`username`, `email`, `password`).
- FR-4.3 Row "Edit" opens the same form (`password` optional — blank = unchanged).
- FR-4.4 Row "Delete" asks for confirmation, then calls the API.
- FR-4.5 Field-level API validation errors (`details`) render under each field.
- FR-4.6 `409` (duplicate username/email, or admin still owns customers) shows a
  readable message.

### FR-5 Customers management
- FR-5.1 Table of customers: id, username, email, point, owning admin, avatar
  thumbnail.
- FR-5.2 "New customer" modal: `username`, `email`, `password`, `point`,
  `adminId` (select of existing admins), `avatar` (image box).
- FR-5.3 Edit: same form, `password` optional.
- FR-5.4 Delete with confirmation.
- FR-5.5 The avatar image box (see FR-7) uploads an image; the app creates a
  `file` record to hold it and sets `avatarId` to that record.
- FR-5.6 Avatar thumbnail in the table is read back from the linked `file`
  record.

### FR-6 Files management
- FR-6.1 Table of file records: id, name, a preview of `detail`, created at.
- FR-6.2 "New file" modal: `name` + `detail` entered with the rich text editor
  (see FR-8).
- FR-6.3 Edit / delete (with confirmation) as for the other resources.

### FR-7 Image upload box (component)
- FR-7.1 Accepts a drop **and** a click that opens the OS file picker.
- FR-7.2 Accepts image files only; shows a preview once chosen.
- FR-7.3 Large images are downscaled client-side (max edge ~512 px) before use so
  the encoded string stays within the backend `TEXT` column.
- FR-7.4 Produces a data URL used as the file record payload.
- FR-7.5 "Remove" clears the selection.

### FR-8 Rich text editor (component)
- FR-8.1 Toolbar: H1, H2, H3, H4, H5, Bold, Italic, Underline, Link (URL),
  Image by URL, Image upload.
- FR-8.2 "Image upload" inserts the (downscaled) image **at the cursor
  position**.
- FR-8.3 Produces an HTML string stored in the file record `detail` field.
- FR-8.4 Renders existing `detail` HTML when editing.

## 5. Out of scope

- Customer-facing UI, registration, self-service.
- Server-side rendering of protected data / Next.js API routes / middleware auth
  (token lives client-side only — the backend is the trust boundary).
- Pagination, column sorting, free-text search, bulk actions.
- Real binary file storage / CDN (backend only stores metadata + the inline
  data URL).
- Refresh tokens, "remember me", password reset.
- Theme switching, i18n.

## 6. Acceptance criteria

- With the backend running and one seeded admin, logging in from `/login` lands
  on `/dashboard`.
- Visiting any protected route without a token redirects to `/login`.
- Each of Admins / Customers / Files supports list + create + edit + delete, and
  the change is visible on reload (i.e. persisted by the API).
- Creating a customer with an uploaded avatar creates a `file` record and links
  it; the thumbnail shows in the table.
- The rich text editor can produce headings, bold/italic/underline, a link, and
  an inline uploaded image, and re-opening the record shows the same content.
- API validation errors appear against the relevant field; `401` bounces to
  `/login`.
