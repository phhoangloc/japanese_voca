# `home` project — Structure

Standalone Next.js project at repo root `/home`, toolchain mirrored from
`/admin` (Next 14.2, TS 5.6, Tailwind 3.4, vitest 2). Login-less; reads the
public backend `GET` endpoints.

## Layout

```
home/
  package.json            dev/start on port 3100
  tsconfig.json  next.config.mjs  postcss.config.mjs  tailwind.config.ts
  .eslintrc.json  .gitignore  vitest.config.ts  .env.example
  src/
    app/
      globals.css              Tailwind + @layer components (.btn-*, .pill, .input, .card-lift)
      layout.tsx               <html lang="ja">, M PLUS 1p font (--font-mplus), <title> 用語ー図書館
      page.tsx                 "/" — library grid (client)
      course/[id]/page.tsx     -> <CourseView courseId={n} />
      chapter/[id]/page.tsx    -> <ChapterView chapterId={n} />
      flashcard/[id]/page.tsx  -> <FlashcardStudy chapterId={n} />
    components/
      SiteHeader.tsx           用語ー図書館 wordmark bar + optional back link
      BookCover.tsx            procedural dune-gradient cover, or real <img>
      LibraryGrid.tsx          search box + card grid; cards <Link> to /course/[id]
      CourseView.tsx           cover + name + chapter links (client)
      ChapterView.tsx          number + name + word list + flashcard link (client)
      FlashcardStudy.tsx       loads chapter's words; index state; prev/next
      FlashCard.tsx            one flip card (front: pic+name+sound / back: mean+sound)
    lib/
      types.ts                Course, Chapter, Word, FileRecord
      api.ts                  ApiClient (baseUrl, JSON, ApiError) — no token wired
      client.ts               the singleton `new ApiClient()`
      books.ts                hueFromId, coverPalette, filterCourses, resolveFileUrl, isImageDetail
      flashcard.ts            buildCardFaces(word, files), wrapIndex(i, len)
    lib/__tests__/
      books.test.ts           hueFromId, filterCourses, resolveFileUrl
      api.test.ts             URL build, ApiError mapping, 204
      flashcard.test.ts       buildCardFaces front/back mapping, wrapIndex
```

## Layering

```
route page (app/**/page.tsx)   thin wrapper -> a client *View / *Study component
  *View / *Study (components)   screen state; call lib/api; filter client-side
    -> lib/api (ApiClient)      the only fetch(); error mapping
      -> backend REST API (public GET)
FlashCard / BookCover / SiteHeader / LibraryGrid   presentational, props in
lib/books.ts + lib/flashcard.ts                     pure helpers, unit-tested
```

Only `lib/api.ts` calls `fetch`. The API has no query filtering, so each page
`list()`s a resource and filters by `courseId` / `chapterId` in memory.

## Design system in `globals.css`

- `body` ground `#FFECE0`; font **M PLUS 1p** everywhere (`font-sans` and
  `font-display` both resolve to `var(--font-mplus)`; display use = weight 700/800).
- `.btn-primary` (dark pill), `.btn-outline`, `.btn-pill`, `.pill`, `.input`,
  `.card-lift` (hover translateY).
- `BookCover` / `FlashCard` build their gradients inline from
  `coverPalette(hue)` — the port of the design's `decorate()`.

## Backend change (this feature)

`routes/{course,chapter,file,word}.routes.ts` carry `authMiddleware` only on
POST/PUT/DELETE; `routes/index.ts` mounts them without the blanket middleware.
`admins` / `customers` stay fully protected.

## Tests

No `service` / `middleware` folders in a Next front-end (same note as the
`admin` steering); `src/lib/*` is the tested layer.
