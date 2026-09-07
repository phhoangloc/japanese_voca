import { CustomerForm } from "@/components/CustomerForm";

export default function EditCustomerPage({
  params,
}: {
  params: { id: string };
}) {
  return <CustomerForm customerId={Number(params.id)} />;
}
