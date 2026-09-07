# `home` project — Tasks

Status: `[x]` done.

## T1. Scaffold `/home`
- [x] T1.1 `package.json` (next 14.2, react 18.3, tailwind 3.4, vitest 2; `-p 3100`).
- [x] T1.2 configs; `.env.example`; `npm install`.

## T2. lib
- [x] T2.1 `lib/types.ts` — `Course`, `Chapter`, `Word`, `FileRecord`.
- [x] T2.2 `lib/api.ts` — `ApiClient` + `ApiError`.
- [x] T2.3 `lib/client.ts` — plain `new ApiClient()` (no token, no login).
- [x] T2.4 `lib/books.ts` — `hueFromId`, `coverPalette`, `filterCourses`,
  `resolveFileUrl`, `isImageDetail`.
- [x] T2.5 `lib/flashcard.ts` — `buildCardFaces(word, files)`, `wrapIndex(i, len)`.

## T3. App shell
- [x] T3.1 `app/globals.css` — Tailwind + component classes + peach ground.
- [x] T3.2 `app/layout.tsx` — Google font **M PLUS 1p** (`preload:false`),
  `<html lang="ja">`, `<title>` 用語ー図書館.
- [x] T3.3 `components/SiteHeader.tsx` — shared wordmark bar + back link.

## T4. Routes (Japanese UI)
- [x] T4.1 `app/page.tsx` + `components/LibraryGrid.tsx` — grid, cards `<Link>`
  to `/course/[id]`.
- [x] T4.2 `app/course/[id]/page.tsx` + `components/CourseView.tsx` — course +
  chapter links.
- [x] T4.3 `app/chapter/[id]/page.tsx` + `components/ChapterView.tsx` — chapter
  + word list + `フラッシュカードで学ぶ` link.
- [x] T4.4 `app/flashcard/[id]/page.tsx` + `components/FlashcardStudy.tsx` +
  `components/FlashCard.tsx` — flip card, prev/next, `n / total`.
- [x] T4.5 removed the old `components/BookDetail.tsx`.

## T5. Backend — public reads
- [x] T5.1 `routes/{course,chapter,file,word}.routes.ts` — `authMiddleware` only
  on POST/PUT/DELETE.
- [x] T5.2 `routes/index.ts` — `/files` `/courses` `/chapters` `/words` mounted
  without the blanket middleware (`admins`/`customers` unchanged).

## T6. Tests (`src/lib/__tests__`, vitest)
- [x] T6.1 `books.test.ts` (8).
- [x] T6.2 `api.test.ts` (6).
- [x] T6.3 `flashcard.test.ts` — `buildCardFaces` front/back, `wrapIndex` (4).

## T7. Verification
- [x] T7.1 backend `build` / `lint` / `test` (49); `GET /api/words` public,
  `POST /api/words` + `GET /api/admins` still `401`.
- [x] T7.2 home `typecheck` / `lint` / `test` (18) / `build` (4 routes).
- [x] T7.3 Live (headless, seeded demo): `/` grid → `/course/[id]` chapters →
  `/chapter/[id]` word list → `/flashcard/[id]` card with image + 発音 button,
  flip shows meaning + 解説を聞く button, 次へ → `2 / 2`. 0 console errors.

## T8. Spec sync
- [x] T8.1 `functional-design.md` §2.2 — `words` GET now public.
- [x] T8.2 `product-requirements.md` — FR-1.4 + FR-6.6 (home routes + flashcard).
- [x] T8.3 `repository-structure.md` — top-level tree lists `admin/` + `home/`.
