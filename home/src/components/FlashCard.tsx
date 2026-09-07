"use client";

import { useState } from "react";
import type { CardFaces } from "@/lib/flashcard";
import type { CoverPalette } from "@/lib/books";

interface FlashCardProps {
  faces: CardFaces;
  palette: CoverPalette;
}

function playAudio(url: string | null) {
  if (!url) return;
  const audio = new Audio(url);
  void audio.play().catch(() => {
    /* autoplay/format blocked — ignore */
  });
}

function SoundButton({
  url,
  label,
  accent,
}: {
  url: string | null;
  label: string;
  accent: string;
}) {
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        playAudio(url);
      }}
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-semibold text-white"
      style={{ background: accent }}
    >
      🔊 {label}
    </button>
  );
}

/**
 * One flip card. Front = picture + name + sound; back = meaning + read-explain
 * sound (home-idea.md). Click the card to flip; the sound buttons don't flip.
 * Give it `key={word.id}` from the parent so it resets on the next word.
 */
export function FlashCard({ faces, palette }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="[perspective:1400px] mx-auto w-full max-w-[440px]"
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        className="relative h-[420px] w-full cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "none" }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl p-8 text-center [backface-visibility:hidden]"
          style={{
            background: `linear-gradient(180deg, ${palette.sky}, ${palette.dune})`,
            boxShadow: "0 24px 50px -20px oklch(0.3 0.02 60 / 0.4)",
          }}
        >
          {faces.front.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={faces.front.imageUrl}
              alt={faces.front.name}
              className="max-h-[190px] w-auto rounded-xl object-contain"
            />
          ) : (
            <span className="text-6xl" aria-hidden>
              📖
            </span>
          )}
          <div
            className="font-display text-[34px] font-extrabold leading-tight"
            style={{ color: palette.titleColor }}
          >
            {faces.front.name}
          </div>
          <SoundButton
            url={faces.front.soundUrl}
            label="発音"
            accent={palette.ink}
          />
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex flex-col items-center justify-center gap-5 rounded-2xl bg-white p-8 text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
          style={{
            border: `1px solid ${palette.accent}`,
            boxShadow: "0 24px 50px -20px oklch(0.3 0.02 60 / 0.3)",
          }}
        >
          <span
            className="rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.1em]"
            style={{ color: palette.accent, background: palette.accentBg }}
          >
            意味
          </span>
          <p className="m-0 text-[19px] leading-relaxed text-ink">
            {faces.back.mean || "（説明はまだありません）"}
          </p>
          <SoundButton
            url={faces.back.soundUrl}
            label="解説を聞く"
            accent={palette.accent}
          />
        </div>
      </div>

      <p className="mt-3 text-center text-[12px] text-ink-faint">
        カードをタップして{flipped ? "表" : "裏"}を見る
      </p>
    </div>
  );
}
