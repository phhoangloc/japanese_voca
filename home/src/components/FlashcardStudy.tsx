"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent, MouseEvent as ReactMouseEvent } from "react";
import { FlashCard } from "@/components/FlashCard";
import { SiteHeader } from "@/components/SiteHeader";
import { ApiError } from "@/lib/api";
import { coverPalette, hueFromId } from "@/lib/books";
import { buildCardFaces, wrapIndex } from "@/lib/flashcard";
import { api } from "@/lib/client";
import type { Chapter, FileRecord, Word } from "@/lib/types";

export function FlashcardStudy({ chapterId }: { chapterId: number }) {
  const [chapter, setChapter] = useState<Chapter | null>(null);
  const [words, setWords] = useState<Word[]>([]);
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  // +1 = moved forward (card runs in from the right), -1 = moved back.
  const [dir, setDir] = useState(1);
  // Drag-to-navigate: hold the card and pull it sideways to change word.
  const [dragX, setDragX] = useState(0);
  const [phase, setPhase] = useState<"idle" | "dragging" | "snapping">("idle");
  const drag = useRef({ startX: 0, pointerId: -1, moved: false });
  const flyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const settleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (flyTimer.current) clearTimeout(flyTimer.current);
      if (settleTimer.current) clearTimeout(settleTimer.current);
    },
    [],
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [ch, allWords, f] = await Promise.all([
          api.get<Chapter>("chapters", chapterId),
          api.list<Word>("words"),
          api.list<FileRecord>("files"),
        ]);
        if (!alive) return;
        setChapter(ch);
        setWords(
          allWords
            .filter((w) => w.chapterId === chapterId)
            .sort((a, b) => a.id - b.id),
        );
        setFiles(f);
      } catch (err) {
        if (alive) {
          setError(
            err instanceof ApiError && err.status === 404
              ? "章が見つかりません。"
              : err instanceof ApiError
                ? err.message
                : "読み込みに失敗しました。",
          );
        }
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [chapterId]);

  const palette = coverPalette(
    hueFromId(chapter ? chapter.courseId : chapterId),
  );
  const current = words.length ? words[wrapIndex(index, words.length)] : null;
  const faces = useMemo(
    () => (current ? buildCardFaces(current, files) : null),
    [current, files],
  );

  // Clamp at the ends — no wrap-around from the last card back to the first.
  const step = (delta: number) => {
    setDir(delta >= 0 ? 1 : -1);
    setIndex((i) => Math.min(Math.max(i + delta, 0), words.length - 1));
  };

  const atFirst = wrapIndex(index, words.length) === 0;
  const atLast = wrapIndex(index, words.length) === words.length - 1;

  const DRAG_COMMIT = 90;
  const clamp = (v: number, lo: number, hi: number) =>
    Math.max(lo, Math.min(hi, v));

  const settleToCentre = () => {
    setPhase("snapping");
    setDragX(0);
    settleTimer.current = setTimeout(() => {
      settleTimer.current = null;
      setPhase("idle");
    }, 300);
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (flyTimer.current || phase === "snapping") return;
    drag.current = { startX: e.clientX, pointerId: e.pointerId, moved: false };
    setPhase("dragging");
    setDragX(0);
  };

  const onPointerMove = (e: ReactPointerEvent) => {
    if (phase !== "dragging") return;
    const dx = e.clientX - drag.current.startX;
    // Only treat it as a drag — and grab the pointer — once it has really
    // moved, so a plain click still reaches the card and flips it.
    if (!drag.current.moved && Math.abs(dx) > 5) {
      drag.current.moved = true;
      try {
        e.currentTarget.setPointerCapture(drag.current.pointerId);
      } catch {
        /* pointer already released */
      }
    }
    if (drag.current.moved) setDragX(clamp(dx, -260, 260));
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (phase !== "dragging") return;
    if (!drag.current.moved) {
      setPhase("idle"); // a tap — let the click through to flip
      return;
    }
    const dx = e.clientX - drag.current.startX;
    const goNext = dx <= -DRAG_COMMIT && !atLast;
    const goPrev = dx >= DRAG_COMMIT && !atFirst;
    if (goNext || goPrev) {
      setPhase("snapping");
      setDragX(goNext ? -560 : 560); // fling the card off to the side
      flyTimer.current = setTimeout(() => {
        flyTimer.current = null;
        step(goNext ? 1 : -1); // swap word — the new card runs back in
        setDragX(0);
        setPhase("idle");
      }, 170);
    } else {
      settleToCentre(); // didn't pull far enough
    }
  };

  const onPointerCancel = () => {
    if (phase !== "dragging") return;
    if (drag.current.moved) settleToCentre();
    else setPhase("idle");
  };

  const suppressClickAfterDrag = (e: ReactMouseEvent) => {
    if (drag.current.moved) {
      e.stopPropagation(); // a real drag shouldn't also flip the card
      drag.current.moved = false;
    }
  };

  const cardStyle =
    phase === "idle"
      ? undefined
      : {
          transform: `translateX(${dragX}px) rotate(${dragX / 80}deg)`,
          transition:
            phase === "snapping"
              ? "transform 300ms cubic-bezier(0.22, 1, 0.36, 1)"
              : "none",
        };

  return (
    <div className="flex h-screen h-[100svh] flex-col overflow-hidden bg-paper">
      <SiteHeader backHref={`/chapter/${chapterId}`} backLabel="章へ戻る" />

      {error ? (
        <p className="mx-auto mt-16 max-w-md rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : loading ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">読み込み中…</p>
      ) : !current || !faces ? (
        <p className="mx-auto mt-24 text-sm text-ink-faint">
          この章には単語がありません。
        </p>
      ) : (
        <main className="flex w-full flex-1 animate-fadeUp flex-col items-center gap-3 overflow-hidden px-4 pb-4 pt-3">
          <div className="shrink-0 text-center">
            <div className="text-[13px] font-semibold text-ink-faint">
              {chapter?.name}
            </div>
            <div className="text-[13px] text-ink-soft">
              {wrapIndex(index, words.length) + 1} / {words.length}
            </div>
          </div>

          <div
            className="flex w-full flex-1 select-none items-stretch justify-center [overflow-x:clip]"
            style={{ touchAction: "pan-y" }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onClickCapture={suppressClickAfterDrag}
          >
            <div
              key={current.id}
              style={cardStyle}
              className={`flex w-full max-w-[560px] cursor-grab active:cursor-grabbing motion-reduce:animate-none ${
                phase === "idle"
                  ? dir >= 0
                    ? "animate-cardInNext"
                    : "animate-cardInPrev"
                  : ""
              }`}
            >
              <FlashCard faces={faces} palette={palette} />
            </div>
          </div>

          <p className="shrink-0 text-center text-[12px] text-ink-soft">
            ← カードを横にドラッグして単語を切り替え →
          </p>
        </main>
      )}
    </div>
  );
}
