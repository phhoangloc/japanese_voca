# Admin Frontend — Structure

## 1. Location

Everything lives in `/admin` at the repo root, a standalone Next.js project with
its own `package.json` (independent of `/backend`).

## 2. Folder layout

```
admin/
  package.json
  tsconfig.json
  next.config.mjs
  postcss.config.mjs
  tailwind.config.ts
  .eslintrc.json
  .gitignore
  .env.example                 NEXT_PUBLIC_API_BASE_URL
  vitest.config.ts
  src/
    app/
      globals.css
      layout.tsx               root <html>, fonts, ToastProvider
      page.tsx                 redirect -> /dashboard (guard sends to /login)
      login/
        page.tsx               login form
      (app)/
        layout.tsx             auth guard + Sidebar + Topbar shell
        dashboard/page.tsx
        admins/page.tsx
        customers/page.tsx
        files/page.tsx
    components/
      Sidebar.tsx
      Topbar.tsx
      DataTable.tsx            generic table: columns + rows + row actions
      Modal.tsx                accessible dialog (focus trap, Esc, backdrop)
      ConfirmDialog.tsx        delete confirmation
      Field.tsx               label + input + error text
      ImageDropzone.tsx        FR-7 image upload box
      RichTextEditor.tsx       FR-8 rich text editor
      Toast.tsx               ToastProvider + useToast
      Spinner.tsx
    lib/
      types.ts                Admin, Customer, FileRecord + Create/Update inputs
      api.ts                  ApiClient: baseUrl, bearer, JSON, ApiError, 401 hook
      auth.ts                 token storage + useAuth() + parsed JWT username
      image.ts                fileToDownscaledDataUrl(), isImage()
      validation.ts           client pre-submit checks (mirror backend rules)
      format.ts               date + text-preview helpers
    hooks/
      useResource.ts          list/create/update/remove for one endpoint
  src/lib/__tests__/          vitest specs for lib/*
```

## 3. Layering (mirrors the backend's spirit)

```
page (app/**)             screen state, opens modals, calls hooks
  -> hooks/useResource     orchestrates a resource: load, mutate, re-load
    -> lib/api (ApiClient) one place that does fetch + auth + error mapping
      -> backend REST API
components/**               presentational + interaction only, no direct fetch
lib/** (pure)              types, api, auth, image, validation, format — unit tested
```

- Only `lib/api.ts` calls `fetch`. Hooks and pages never touch `fetch` directly.
- Components receive data and callbacks via props; they do not import hooks that
  fetch (except `useToast`).
- `lib/*` modules (except `api`'s network call) are pure and covered by tests.

## 4. Auth flow

1. `login/page.tsx` -> `api.login()` -> `auth.setToken()` -> `router.push('/dashboard')`.
2. `(app)/layout.tsx` reads the token on mount; missing => `router.replace('/login')`.
3. `ApiClient` is constructed with an `onUnauthorized` callback that runs
   `auth.clearToken()` + redirect to `/login`; every non-login 401 triggers it.
4. `Topbar` "Log out" => `auth.clearToken()` + redirect.

## 5. Image / file handling

- `ImageDropzone` and `RichTextEditor`'s upload button both call
  `image.fileToDownscaledDataUrl(file)` (canvas resize, max edge 512, JPEG/PNG
  passthrough) -> `data:` URL string.
- Customer avatar: the customer form calls `POST /api/files`
  `{ name: <filename>, detail: <dataUrl> }`, takes the returned `id`, and submits
  it as `avatarId`. Table thumbnails resolve `avatarId` against the files list
  already loaded on the customers page.
- Rich text inline images: the `data:` URL is inserted straight into the editor
  HTML; no file record is created.

## 6. Naming / conventions

- Components: `PascalCase.tsx`, one component per file, default export.
- Hooks: `useXxx.ts`, named export.
- `lib` modules: `camelCase.ts`, named exports, no React.
- Tailwind utility classes inline; shared bits via `@layer components` in
  `globals.css` (`.btn`, `.btn-primary`, `.input`, `.card`).
- Palette: slate neutrals + indigo accent. Rounded-lg cards, subtle shadow.
