import { CourseForm } from "@/components/CourseForm";

export default function EditCoursePage({
  params,
}: {
  params: { id: string };
}) {
  return <CourseForm courseId={Number(params.id)} />;
}
