# Admin Frontend — Tasks

Status: `[ ]` todo, `[x]` done.

## T1. Scaffold `/admin`
- [x] T1.1 `package.json` (next, react, react-dom, tailwind, typescript, types,
  eslint-config-next, vitest).
- [x] T1.2 `tsconfig.json`, `next.config.mjs`, `postcss.config.mjs`,
  `tailwind.config.ts`, `.eslintrc.json`, `.gitignore`, `vitest.config.ts`.
- [x] T1.3 `.env.example` with `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`.
- [x] T1.4 `npm install` succeeds.

## T2. `lib/` core
- [x] T2.1 `types.ts` — entity + input types matching the API.
- [x] T2.2 `api.ts` — `ApiClient` (base URL, bearer header, JSON parse,
  `ApiError { status, message, details }`, `onUnauthorized`), `login()` and
  `resource()` helpers.
- [x] T2.3 `auth.ts` — `getToken/setToken/clearToken`, `usernameFromToken()`,
  `useAuth()` hook.
- [x] T2.4 `image.ts` — `isImage()`, `fileToDownscaledDataUrl()`.
- [x] T2.5 `validation.ts` — `validateAdmin`, `validateCustomer`, `validateFile`.
- [x] T2.6 `format.ts` — `formatDate()`, `htmlToPreview()`.

## T3. Shell + auth
- [x] T3.1 `app/layout.tsx` + `globals.css` (Tailwind, component classes).
- [x] T3.2 `Toast.tsx` — `ToastProvider`, `useToast`.
- [x] T3.3 `login/page.tsx`.
- [x] T3.4 `(app)/layout.tsx` — guard + shell.
- [x] T3.5 `Sidebar.tsx`, `Topbar.tsx`.
- [x] T3.6 `app/page.tsx` redirect.

## T4. Shared UI
- [x] T4.1 `Modal.tsx` (Esc, backdrop, focus).
- [x] T4.2 `ConfirmDialog.tsx`.
- [x] T4.3 `DataTable.tsx`.
- [x] T4.4 `Field.tsx`, `Spinner.tsx`.
- [x] T4.5 `hooks/useResource.ts`.

## T5. Components from the idea
- [x] T5.1 `ImageDropzone.tsx` — drag-and-drop + click, preview, remove.
- [x] T5.2 `RichTextEditor.tsx` — H1-H5, B/I/U, link, image URL, image upload at
  cursor.

## T6. Screens
- [x] T6.1 `dashboard/page.tsx` — stat cards + recent customers.
- [x] T6.2 `admins/page.tsx` — table + create/edit/delete modal.
- [x] T6.3 `customers/page.tsx` — table + form with admin select + avatar box.
- [x] T6.4 `files/page.tsx` — table + form with rich text editor.

## T7. Tests (`src/lib/__tests__`, run with vitest)
- [x] T7.1 `api.test.ts` — URL building, bearer header, JSON + error mapping,
  `onUnauthorized` on 401, 204 handling.
- [x] T7.2 `auth.test.ts` — token round-trip, `usernameFromToken` (valid /
  malformed).
- [x] T7.3 `validation.test.ts` — required fields, email pattern, point >= 0,
  adminId required, optional password on update.
- [x] T7.4 `image.test.ts` — `isImage()` accept/reject.
- [x] T7.5 `format.test.ts` — date formatting, HTML-to-preview stripping.
- [x] T7.6 `npm test` green.

## T8. Verification
- [x] T8.1 `npm run lint` clean — "No ESLint warnings or errors".
- [x] T8.2 `npx tsc --noEmit` clean.
- [x] T8.3 `npm run build` succeeds — 7 routes, all static.
- [x] T8.4 `npm test` — 31 tests / 5 files pass.
- [x] T8.5 `next start` boots; `/login` renders; every route returns 200.
- [~] T8.6 Live end-to-end login could NOT be completed: a backend instance is
  running on `:3000` (not the idea's default `:4000`) but its DB is not
  connected — `POST /api/auth/login` returns `500 Internal error`. The
  unauthenticated path was verified: `GET /api/admins` with no token returns
  `401 { "error": "Missing or malformed Authorization header" }`, which the
  client maps to `ApiError` + `onUnauthorized`. Full smoke steps are in
  `admin/README.md` for when a seeded backend is available.

## Notes / deviations
- The design reference `https://claude.ai/design/p/272c578e-...` was read on
  2026-09-04 via the DesignSync tool (project "Thiết kế trang admin Projek",
  file `Admin Dashboard.dc.html`) after `/design-login`. The UI was re-skinned
  to match it — see "Re-skin to Claude Design canvas" below.
- Backend `file.detail` is `TEXT` (~64 KB). Uploaded images are downscaled to a
  512 px max edge to fit; very large originals lose resolution by design.
- No dedicated `service` / `middleware` folders exist in a Next.js frontend; per
  the skill's testing step, the equivalent logic layer (`src/lib/*`) is what the
  tests cover.
- `NEXT_PUBLIC_API_BASE_URL` defaults to `http://localhost:4000` (the value in
  `admin-idea.md`). The backend's own default port is `3000`; set the env var to
  match whatever the backend actually listens on.
- The admin dev/start server defaults to port `4100`; for the live run the user
  asked for backend on `4000` and admin on `3000` (`next dev -p 3000`, with
  `admin/.env.local` -> `NEXT_PUBLIC_API_BASE_URL=http://localhost:4000`).

## Live run (2026-09-04) — both projects together

Backend on `:4000` (`npm run dev`), admin on `:3000` (`next dev -p 3000`),
MariaDB via XAMPP, DB `user_management_pro` (schema applied, one admin seeded:
`admin` / `admin123`). Driven end-to-end with Playwright/Chromium — 0 console
errors:

- unauthenticated `/` and `/customers` redirect to `/login`; login → `/dashboard`
- create admin (modal) — row appears, toast shown
- create customer with a drag/drop-style avatar upload — a `file` record is
  created and linked via `avatarId`; table thumbnail renders
- edit customer (blank password kept, points 150 → 999) — persisted
- create file with the rich text editor (typing + Enter + select-all Bold) —
  HTML persisted and round-trips in the "View" modal
- deleting an admin that still owns a customer → API `409`
  `"Record is still referenced by another record"` (surfaced as a toast)
- log out → `/login`

### Fixes made during the run
1. `admin/src/components/Modal.tsx` — the focus effect depended on the `onClose`
   prop identity, which changed on every parent re-render (every keystroke),
   causing `panelRef.focus()` to steal focus from the field being typed into
   (only the first character of each run survived). Now it runs only when `open`
   flips, via a stable `useEventCallback` wrapper. Root cause of lost input in
   the rich text editor and other modal fields.
2. `backend/src/ult/config.ts` — `DB_PASSWORD` was `readRequired`, so an **empty**
   password (valid for a local XAMPP/MariaDB `root`) aborted boot. Now read
   separately and allowed to be blank.
3. `backend/src/middleware/cors.middleware.ts` (new) + wired in `app.ts` — the
   API had no CORS, so the browser client on another origin was blocked. Minimal
   reflecting CORS; origins configurable via `CORS_ORIGINS` (default `*`).
   Covered by `cors.middleware.test.ts` (backend suite now 27 tests).

## Re-skin to Claude Design canvas (2026-09-04)

Source: DesignSync project `272c578e-…` → `Admin Dashboard.dc.html`
("Thiết kế trang admin Projek"). Functionality, routes, backend calls, and the
`src/lib/*` unit tests are unchanged — this pass is purely visual.

Design language applied:
- **Font** Manrope (via `next/font/google`).
- **Palette** deep-green accent `oklch(0.32 0.07 155)` (Tailwind `brand-600`),
  warm-mint page ground `oklch(0.965 0.006 150)` (`paper`), near-black hero
  `oklch(0.22 0.01 150)` (`night`), neutral `ink` / `line` scales. All custom
  colors carry `<alpha-value>` so `/opacity` modifiers work.
- **Shell** rounded (20px) white sidebar with an "Admin" wordmark + MENU /
  GENERAL sections and a green active pill; top bar = search box + mail/bell
  icons + user chip (orange avatar, name, "Administrator").
- **Dashboard** dark hero card (Total loyalty points), 4 stat cards (first
  green), "Customers per admin" bar chart, "Recent customers", and a
  "Top customers by points" / "Recently added files" split card — the design's
  revenue/top-spender widgets adapted to real entities.
- **Archive tables** white rounded-16 card, 11px uppercase headers, bold first
  column, pill status badges (customer points), small bordered Edit/Delete
  buttons (`.btn-row`).
- **Forms** kept as modals (not the design's full pages) but styled to the
  design's form card: 12.5px bold labels, rounded-8 inputs, green Save / plain
  Cancel.
- **Top-bar search** wired to a `SearchProvider`; each archive page filters its
  rows by the query and clears it on navigation.

Files touched: `tailwind.config.ts`, `src/app/globals.css`, `src/app/layout.tsx`,
`src/app/page.tsx`, `src/app/login/page.tsx`, `src/app/(app)/layout.tsx`,
`src/app/(app)/dashboard/page.tsx`, the three archive pages, `Sidebar`,
`Topbar`, `PageHeader`, `DataTable`, `Modal`, `Field`, `Toast`, `Spinner`,
`ImageDropzone`, `RichTextEditor`, plus new `src/components/SearchContext.tsx`.

Verification: `tsc --noEmit` clean, `next lint` clean, `vitest` 31/31,
`next build` OK (7 routes). Playwright/Chromium drove login → dashboard →
admin create → customer create with avatar upload → file create with rich text
→ customer edit, 0 console errors; screenshots confirm the new look.
