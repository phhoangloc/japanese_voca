import { coverPalette, hueFromId } from "@/lib/books";

interface BookCoverProps {
  id: number;
  title: string;
  /** Real cover image URL; when present it replaces the procedural art. */
  imageUrl?: string | null;
  size?: "grid" | "detail";
}

/**
 * A book cover. Mirrors the design's procedural dune/sky gradient built from a
 * single hue; falls back to that when the course has no uploaded image.
 */
export function BookCover({
  id,
  title,
  imageUrl,
  size = "grid",
}: BookCoverProps) {
  const p = coverPalette(hueFromId(id));
  const detail = size === "detail";
  const dims = detail
    ? "w-[280px] h-[400px]"
    : "w-[150px] h-[214px]";

  return (
    <div
      className={`relative flex-none overflow-hidden rounded-[2px] ${dims}`}
      style={{
        boxShadow: detail
          ? "0 30px 60px -20px oklch(0.3 0.02 60 / 0.4), 0 10px 20px -8px oklch(0.3 0.02 60 / 0.3)"
          : "0 18px 34px -14px oklch(0.3 0.02 60 / 0.45), 0 6px 12px -6px oklch(0.3 0.02 60 / 0.3)",
      }}
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={title}
          className="h-full w-full object-cover"
        />
      ) : (
        <>
          <div
            className="absolute inset-0"
            style={{
              background: `linear-gradient(180deg, ${p.sky} 0%, ${p.sky} 22%, ${p.mid} 42%, ${p.dune} 62%, ${p.deep} 100%)`,
            }}
          />
          <div
            className="absolute -left-[10%] -bottom-[6%] h-[46%] w-[70%] rounded-full opacity-[0.55]"
            style={{ background: p.mid }}
          />
          <div
            className="absolute -right-[14%] -bottom-[10%] h-[52%] w-[80%] rounded-full opacity-70"
            style={{ background: p.dune }}
          />
          <div
            className="absolute left-[8%] bottom-[6%] h-[30%] w-[60%] rounded-full opacity-[0.85]"
            style={{ background: p.deep }}
          />
          <div
            className={`absolute inset-0 flex flex-col justify-end ${detail ? "p-7" : "p-3.5"}`}
          >
            <div
              className="font-display font-bold leading-[1.08]"
              style={{
                color: p.titleColor,
                fontSize: detail ? 42 : 19,
                textShadow: "0 1px 6px rgba(0,0,0,0.15)",
              }}
            >
              {title}
            </div>
          </div>
        </>
      )}
      <div
        className="absolute inset-y-0 left-0 w-2"
        style={{
          background: "linear-gradient(90deg, rgba(0,0,0,0.18), transparent)",
        }}
      />
    </div>
  );
}
