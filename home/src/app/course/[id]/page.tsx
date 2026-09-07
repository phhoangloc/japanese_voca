import { CourseView } from "@/components/CourseView";

export default function CoursePage({ params }: { params: { id: string } }) {
  return <CourseView courseId={Number(params.id)} />;
}
