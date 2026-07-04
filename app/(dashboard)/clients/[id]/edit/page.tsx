import { notFound } from "next/navigation";
import { getClient } from "@/lib/actions/clients";
import { ClientForm } from "@/components/forms/client-form";

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = await getClient(id);
  if (!client) notFound();

  return <ClientForm client={client} />;
}
