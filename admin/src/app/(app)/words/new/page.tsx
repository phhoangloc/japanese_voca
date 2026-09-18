import { Suspense } from "react";
import { WordForm } from "@/components/WordForm";

export default function NewWordPage() {
  return (
    <Suspense>
      <WordForm />
    </Suspense>
  );
}
