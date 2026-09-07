import { AdminForm } from "@/components/AdminForm";

export default function EditAdminPage({ params }: { params: { id: string } }) {
  return <AdminForm adminId={Number(params.id)} />;
}
