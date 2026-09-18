import { Suspense } from "react";
import { WordForm } from "@/components/WordForm";

export default function EditWordPage({ params }: { params: { id: string } }) {
  return (
    <Suspense>
      <WordForm wordId={Number(params.id)} />
    </Suspense>
  );
}
