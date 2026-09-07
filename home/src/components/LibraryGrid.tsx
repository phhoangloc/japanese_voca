import Link from "next/link";
import { BookCover } from "@/components/BookCover";
import type { Chapter, Course } from "@/lib/types";

interface LibraryGridProps {
  courses: Course[];
  chapters: Chapter[];
  query: string;
  onQuery: (q: string) => void;
  coverUrl: (course: Course) => string | null;
}

export function LibraryGrid({
  courses,
  chapters,
  query,
  onQuery,
  coverUrl,
}: LibraryGridProps) {
  const count = (courseId: number) =>
    chapters.filter((c) => c.courseId === courseId).length;

  return (
    <main className="mx-auto w-full max-w-[1200px] px-8 pb-24 pt-14">
      <div className="mb-10 max-w-[560px]">
        <h1 className="m-0 text-[32px] font-extrabold text-ink">
          読みたいコースを選んでください
        </h1>
        <p className="m-0 mt-2.5 text-[15px] leading-relaxed text-ink-soft">
          それぞれのコースは実際の表紙のように展示されています —
          クリックして章の一覧とフラッシュカードへ進めます。
        </p>
      </div>

      <div className="mb-7 flex flex-wrap items-center gap-2.5">
        <input
          className="input ml-auto min-w-[220px] max-w-xs"
          value={query}
          onChange={(e) => onQuery(e.target.value)}
          placeholder="コース名で検索..."
        />
      </div>

      {courses.length === 0 ? (
        <p className="py-16 text-center text-sm text-ink-faint">
          {query ? "一致する本がありません。" : "図書館にはまだ本がありません。"}
        </p>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-7">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/course/${course.id}`}
              className="card-lift flex flex-col items-center gap-3.5 px-4 py-6"
            >
              <BookCover
                id={course.id}
                title={course.name}
                imageUrl={coverUrl(course)}
              />
              <div className="text-center">
                <div className="text-[13.5px] font-bold text-ink">
                  {course.name}
                </div>
                <div className="mt-0.5 text-[12px] text-ink-soft">
                  全{count(course.id)}章
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
