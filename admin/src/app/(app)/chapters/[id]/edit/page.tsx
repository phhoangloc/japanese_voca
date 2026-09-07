import { ChapterForm } from "@/components/ChapterForm";

export default function EditChapterPage({
  params,
}: {
  params: { id: string };
}) {
  return <ChapterForm chapterId={Number(params.id)} />;
}
