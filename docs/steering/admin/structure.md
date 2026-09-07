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
        admins/page.tsx              list (table + delete)
        admins/new/page.tsx         -> <AdminForm />
        admins/[id]/edit/page.tsx   -> <AdminForm adminId=… />
        customers/page.tsx          list (table + delete)
        customers/new/page.tsx      -> <CustomerForm />
        customers/[id]/edit/page.tsx-> <CustomerForm customerId=… />
        files/page.tsx              upload gallery (no form)
    components/
      Sidebar.tsx
      Topbar.tsx
      DataTable.tsx            generic table: columns + rows + row actions
      Modal.tsx                accessible dialog (used by ConfirmDialog)
      ConfirmDialog.tsx        delete confirmation
      Field.tsx               label + input + error text
      AdminForm.tsx            create/edit admin (routed page body)
      CustomerForm.tsx         create/edit customer (routed page body)
      ImageDropzone.tsx        FR-7 image upload box (emits a File)
      RichTextEditor.tsx       FR-8 rich text editor (currently unmounted)
      Toast.tsx               ToastProvider + useToast
      Spinner.tsx
    lib/
      types.ts                Admin, Customer, FileRecord + Create/Update inputs
      api.ts                  ApiClient: baseUrl, bearer, JSON + multipart, ApiError, 401 hook
      auth.ts                 token storage + useAuth() + parsed JWT username
      image.ts                isImage()
      files.ts                resolveFileUrl(), isImageDetail()
      validation.ts           client pre-submit checks (mirror backend rules)
      format.ts               date + text-preview helpers
    hooks/
      useResource.ts          list + delete for one endpoint (list pages)
  src/lib/__tests__/          vitest specs for lib/*
```

## 3. Layering (mirrors the backend's spirit)

```
list page (app/**/page)   table + delete; "New"/"Edit" are <Link>s to routes
form page (new, [id]/edit) thin wrapper -> AdminForm / CustomerForm
  -> hooks/useResource     list pages: load + delete
  -> lib/api (ApiClient)   forms: get one, create, update, upload
    -> backend REST API
components/**               presentational + interaction; AdminForm/CustomerForm
                            own their own submit + redirect (routed pages)
lib/** (pure)              types, api, auth, image, files, validation, format
```

- After a create/edit the form does `router.push(list)` + `router.refresh()`.

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

- Uploads are multipart `POST /api/files` (field `file`). The backend writes the
  binary to `/public/upload` and returns a row whose `detail` is the URL path.
- `lib/files.ts`: `resolveFileUrl(detail)` prefixes `/upload/...` with the API
  host for `<img src>`; `isImageDetail(detail)` gates the image vs. name view.
- `ImageDropzone` emits the chosen `File`; `CustomerForm.resolveAvatarId()`
  uploads it via `api.upload("files", file)` and submits the returned `id` as
  `avatarId`. Table thumbnails resolve `avatarId` against the loaded files list.
- `RichTextEditor`'s upload button `api.upload`s the file and inserts an `<img>`
  with `resolveFileUrl(rec.detail)`.
- Files page: "New file" uploads immediately; the strip renders each row via
  `resolveFileUrl`.

## 6. Naming / conventions

- Components: `PascalCase.tsx`, one component per file, default export.
- Hooks: `useXxx.ts`, named export.
- `lib` modules: `camelCase.ts`, named exports, no React.
- Tailwind utility classes inline; shared bits via `@layer components` in
  `globals.css` (`.btn`, `.btn-primary`, `.input`, `.card`).
- Palette: slate neutrals + indigo accent. Rounded-lg cards, subtle shadow.
