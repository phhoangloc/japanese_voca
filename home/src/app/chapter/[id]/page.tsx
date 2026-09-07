import { ChapterView } from "@/components/ChapterView";

export default function ChapterPage({ params }: { params: { id: string } }) {
  return <ChapterView chapterId={Number(params.id)} />;
}
