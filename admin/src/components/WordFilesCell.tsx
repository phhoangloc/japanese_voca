"use client";

import { useRef } from "react";
import { resolveFileUrl } from "@/lib/files";
import type { FileRecord, Word } from "@/lib/types";

/**
 * The image/sound/read-explain indicator icons for a word row. The two audio
 * icons are playable buttons (when that file exists); the image icon is
 * just a presence indicator.
 */
export function WordFilesCell({
  word,
  files,
}: {
  word: Word;
  files: FileRecord[];
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const urlFor = (id: number | null) =>
    id == null
      ? null
      : resolveFileUrl(files.find((f) => f.id === id)?.detail ?? null);

  const play = (id: number | null) => {
    const url = urlFor(id);
    if (!url) return;
    if (!audioRef.current) audioRef.current = new Audio();
    audioRef.current.pause();
    audioRef.current.src = url;
    void audioRef.current.play();
  };

  return (
    <span className="flex items-center gap-1.5 text-base">
      <span className={word.imageId ? "" : "opacity-20"} title="Image" aria-hidden>
        🖼️
      </span>
      <button
        type="button"
        title={word.soundId ? "Play pronunciation" : "No pronunciation audio"}
        disabled={!word.soundId}
        onClick={(e) => {
          e.stopPropagation();
          play(word.soundId);
        }}
        className={
          word.soundId
            ? "cursor-pointer hover:scale-110"
            : "cursor-default opacity-20"
        }
      >
        🔊
      </button>
      <button
        type="button"
        title={word.readExplainId ? "Play explanation" : "No explanation audio"}
        disabled={!word.readExplainId}
        onClick={(e) => {
          e.stopPropagation();
          play(word.readExplainId);
        }}
        className={
          word.readExplainId
            ? "cursor-pointer hover:scale-110"
            : "cursor-default opacity-20"
        }
      >
        🗣️
      </button>
    </span>
  );
}
