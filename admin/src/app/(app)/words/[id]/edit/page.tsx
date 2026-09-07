import { WordForm } from "@/components/WordForm";

export default function EditWordPage({ params }: { params: { id: string } }) {
  return <WordForm wordId={Number(params.id)} />;
}
