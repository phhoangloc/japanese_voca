import { FlashcardStudy } from "@/components/FlashcardStudy";

export default function FlashcardPage({
  params,
}: {
  params: { id: string };
}) {
  return <FlashcardStudy chapterId={Number(params.id)} />;
}
