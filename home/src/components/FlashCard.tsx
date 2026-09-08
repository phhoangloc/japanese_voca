"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { CardFaces } from "@/lib/flashcard";
import type { CoverPalette } from "@/lib/books";

interface FlashCardProps {
  faces: CardFaces;
  palette: CoverPalette;
}

function SoundButton({
  url,
  label,
  accent,
  onPlay,
}: {
  url: string | null;
  label: string;
  accent: string;
  onPlay: () => void;
}) {
  if (!url) return null;
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onPlay();
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
 * Fills the height of its parent — the study screen stretches it full-page.
 * The parent remounts it (via `key`) on the next word so state resets.
 *
 * The sound of whichever face is showing plays automatically: the front sound
 * when the card first appears, and the back sound when the user flips it.
 */
export function FlashCard({ faces, palette }: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const play = useCallback((url: string | null) => {
    // Stop whatever is already playing before starting the next clip.
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    if (!url) return;
    const audio = new Audio(url);
    audioRef.current = audio;
    void audio.play().catch(() => {
      /* autoplay/format blocked — ignore */
    });
  }, []);

  // Auto-play on appear (front) and on every flip (the now-visible face).
  useEffect(() => {
    play(flipped ? faces.back.soundUrl : faces.front.soundUrl);
  }, [flipped, faces, play]);

  // Silence any playing clip when the card unmounts (moving to the next word).
  useEffect(() => {
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, []);

  return (
    <div
      className="[perspective:1400px] mx-auto flex h-full w-full max-w-[560px] flex-col"
      onClick={() => setFlipped((v) => !v)}
    >
      <div
        className="relative min-h-[340px] w-full flex-1 cursor-pointer transition-transform duration-500 [transform-style:preserve-3d]"
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
              className="max-h-[42%] w-auto rounded-xl object-contain"
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
            onPlay={() => play(faces.front.soundUrl)}
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
          {/* Vertical (tategaki) explanation, centred, ~2/3 of the card tall.
              `upright` keeps Latin/romaji (AI, 5G…) standing, not rotated. */}
          <p className="m-0 max-h-[66%] max-w-full overflow-auto text-[19px] leading-loose text-ink [text-align:center] [text-orientation:upright] [writing-mode:vertical-rl]">
            {faces.back.mean || "（説明はまだありません）"}
          </p>
          <SoundButton
            url={faces.back.soundUrl}
            label="解説を聞く"
            accent={palette.accent}
            onPlay={() => play(faces.back.soundUrl)}
          />
        </div>
      </div>

      <p className="mt-3 shrink-0 text-center text-[12px] text-ink-faint">
        カードをタップして{flipped ? "表" : "裏"}を見る
      </p>
    </div>
  );
}
