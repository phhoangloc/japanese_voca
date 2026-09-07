# Customer Management Pro — Admin console

Next.js (App Router) + TypeScript + Tailwind front end for the backend REST API
in [`../backend`](../backend). It has no server of its own — every action is a
call to the backend.

## Requirements

- Node.js 20+
- The backend API running and reachable (default `http://localhost:4000`)
- At least one `admin` row seeded in the backend database (needed to log in)

## Setup

```bash
cd admin
npm install
cp .env.example .env.local        # then edit NEXT_PUBLIC_API_BASE_URL if needed
npm run dev                       # http://localhost:3000
```

`NEXT_PUBLIC_API_BASE_URL` is the backend origin **without** the `/api` suffix;
the client appends `/api/...` itself.

## Scripts

| Command            | What it does                              |
|--------------------|-------------------------------------------|
| `npm run dev`      | Dev server on port 3000                   |
| `npm run build`    | Production build                          |
| `npm start`        | Serve the production build (port 3000)    |
| `npm run lint`     | ESLint (`next lint`)                      |
| `npm run typecheck`| `tsc --noEmit`                            |
| `npm test`         | Vitest unit tests (`src/lib`)             |

## Structure

See [`../docs/steering/admin/structure.md`](../docs/steering/admin/structure.md).
Short version:

- `src/app/login` — sign-in screen.
- `src/app/(app)/*` — authenticated shell (sidebar + top bar) with the
  Dashboard, Admins, Customers and Files screens.
- `src/components` — presentational + interaction components, incl.
  `ImageDropzone` (drag-and-drop / click upload) and `RichTextEditor`
  (H1–H5, B/I/U, link, image URL, image upload at the caret).
- `src/lib` — pure logic: `api` (the only `fetch` caller), `auth` (token +
  JWT claim), `image`, `validation`, `format`. Unit tested under
  `src/lib/__tests__`.

## How auth works

1. `POST /api/auth/login` returns a JWT; it is stored in `localStorage`.
2. Every other call sends `Authorization: Bearer <token>`.
3. Any non-login `401` clears the token and redirects to `/login`.
4. The `(app)` layout redirects to `/login` when no token is present.

## Images and the rich text editor

The backend `file` table only stores metadata (`name`, `detail` TEXT). Uploaded
images are **downscaled client-side to a 512 px max edge** and encoded as a
`data:` URL:

- **Customer avatar** — the customer form creates a `file` record
  (`name = avatar-<username>`, `detail = <data URL>`) and links it via
  `avatarId`.
- **Rich text images** — embedded directly in the `detail` HTML.

Very large source images therefore lose resolution by design, so the encoded
string fits the `TEXT` column.

## Manual smoke test

With the backend up and one admin seeded:

1. `npm run dev`, open `http://localhost:3000` → redirected to `/login`.
2. Sign in with the seeded admin → lands on `/dashboard` with stat cards.
3. **Admins**: create, edit (blank password keeps it), delete. Duplicate
   username/email surfaces the backend `409` message. Deleting an admin that
   still owns customers surfaces a `409`.
4. **Customers**: create with an owning admin selected and an avatar dropped on
   the upload box → row shows the thumbnail. Edit and delete work.
5. **Files**: create with the rich text editor — add a heading, bold text, a
   link and an uploaded image; save; "View" renders it; re-open "Edit" shows the
   same content.
6. Delete the token in devtools (Application → Local Storage) and reload a
   protected page → redirected to `/login`.

## Known limitations / deviations

- The referenced design link
  (`https://claude.ai/design/p/272c578e-…`) was not reachable (HTTP 403), so the
  layout is a conventional slate/indigo sidebar console.
- No pagination / sorting / search (not in scope).
- The token lives in `localStorage`; there is no SSR of protected data.
