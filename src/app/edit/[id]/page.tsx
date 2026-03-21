import { EditItemView } from "@/components/edit/edit-item-view";

export const metadata = { title: "Edit Listing — Snap'n'Swap" };

export default async function EditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <EditItemView itemId={id} />;
}
