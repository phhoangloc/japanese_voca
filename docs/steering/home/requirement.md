# `home` project — Requirements

Traces to `docs/ideas/home-idea.md` and the Claude Design project
**"Góc sách - thư viện đọc"** (`claude.ai/design/p/dfaf9bb5-…`, file
`Thư Viện Sách.dc.html`, read via DesignSync on 2026-09-07).

## 1. Overview

A second front-end, saved under `/home`, separate from `/admin`. It is a
**reader / flashcard-study site** (用語ー図書館) that browses the backend's
**courses as "books"**, a course's **chapters**, a chapter's **words**, and
studies those words as **flip cards**. Read-only — no create/edit/delete, and
**no login** (`home-idea.md`: "noneed to login to go to home page").

- **UI language: Japanese** (`home-idea.md`: "language japanese"), matching the
  design's own copy.
- Talks only to the backend API (`NEXT_PUBLIC_API_BASE_URL`, default
  `http://localhost:4000`) — the public `GET` endpoints only.

## 2. Tech (NFR)

- NFR-1 Next.js 14 (App Router) + React 18 + TypeScript (`strict`).
- NFR-2 Tailwind CSS. One Google font — **M PLUS 1p** (`home-idea.md`), via
  `next/font/google`, used for body and (heavier weight) display; it covers
  Japanese glyphs. Manrope / Caveat from the design are dropped.
- NFR-3 No backend of its own; all data from the REST API.
- NFR-4 Its own `package.json`; dev/start on **port 3100** (admin owns 3000).
- NFR-5 No auth. The backend serves `GET /api/{courses,chapters,words,files}`
  publicly (writes still need a token); `home` sends no `Authorization` header
  and has no login page.

## 3. Routes (`home-idea.md` "folder structure")

| Route            | Shows                                                          |
|------------------|---------------------------------------------------------------|
| `/`              | library grid — courses as procedural "book" covers; search by name; each card links to `/course/[id]` |
| `/course/[id]`   | one course: cover + name + its chapters (each → `/chapter/[id]`) |
| `/chapter/[id]`  | one chapter: number + name + list of its words; a "フラッシュカードで学ぶ" link → `/flashcard/[id]` |
| `/flashcard/[id]`| study that chapter's words as flip cards (`id` = chapter id), `useState` for current index + flip |

## 4. Design → data mapping

The design (`Thư Viện Sách.dc.html`) supplies the **look** (peach `#FFECE0`
ground, dune-gradient covers, warm palette, grid→detail flow, footer note). It
shows only a library; the course / chapter / flashcard screens are new, drawn
in the same language.

| Concept              | Backend source                                              |
|----------------------|------------------------------------------------------------|
| "book"               | one `course`; title = `course.name`                        |
| cover art            | procedural gradient from `hueFromId(course.id)`; real image when `course.imageId` set |
| chapters of a course | `GET /api/chapters` filtered by `courseId`, ordered by `number` |
| words of a chapter   | `GET /api/words` filtered by `chapterId`                    |
| genre pills / author / excerpt | dropped — no such fields on our entities         |

## 5. Flash card (`home-idea.md` "component / flash card")

- **Front face**: `word.imageId` → picture, `word.word` → name, `word.soundId`
  → a "発音" play button.
- **Back face**: `word.explain` → meaning, `word.readExplainId` → a "解説を聞く"
  play button.
- Tap the card to flip (CSS `rotateY` + `preserve-3d`); sound buttons
  `stopPropagation` so they don't flip. Prev / 次へ wrap around the word list;
  `key={word.id}` resets the flip on the next card.
- `buildCardFaces(word, files)` in `lib/flashcard.ts` is the pure mapper
  (unit-tested); `wrapIndex(i, len)` handles navigation wrap.

## 6. Functional requirements

- **FR-H1** No auth gate anywhere; every page fetches only public `GET`
  endpoints with no token.
- **FR-H2** All visible copy is Japanese; `<html lang="ja">`; the Google font
  **M PLUS 1p** (`next/font/google`, `preload:false`) is used throughout.
- **FR-H3** `/` grid unchanged (search + responsive cards) — cards now link to
  `/course/[id]` instead of an in-page toggle.
- **FR-H4** `/course/[id]` shows cover + name + chapter links; `/chapter/[id]`
  shows the word list + the flashcard link; each page has a "戻る" header link.
- **FR-H5** Empty states: `章はまだありません。`, `単語はまだありません。`,
  `この章には単語がありません。`. A bad id → `コースが見つかりません。` /
  `章が見つかりません。` (from the API `404`).
- **FR-H6** `/flashcard/[id]` shows `n / total`, one `FlashCard`, and
  prev/next; navigation wraps.

## 7. Acceptance

- No token, empty `localStorage`: `/` renders the library; `/course/<id>` its
  chapters; `/chapter/<id>` its words + a flashcard link; `/flashcard/<id>`
  a card that flips and steps `1/N → 2/N`.
- Front face carries the word's image + name + a 発音 button; back carries the
  meaning + a 解説を聞く button (present only when the file exists).
- `GET /api/{courses,chapters,words,files}` → `200` without a token;
  `POST/PUT/DELETE` and any `admins`/`customers` read still `401`.
- `tsc` / `next lint` / `vitest` / `next build` all green.
