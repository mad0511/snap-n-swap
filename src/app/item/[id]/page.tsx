import { notFound } from "next/navigation";
import { ItemDetail } from "@/components/item/item-detail";
import { supabase } from "@/lib/supabase";

function toFrontend(row: Record<string, unknown>) {
  return {
    id: row.id as string,
    title: row.title as string,
    description: row.description as string,
    category: row.category as string,
    brand: (row.brand as string) ?? "Unknown",
    condition: row.condition as string,
    size: (row.size as string) ?? "",
    color: (row.color as string) ?? "",
    estimatedPrice: Number(row.estimated_price),
    askingPrice: Number(row.asking_price),
    imageUrl: row.image_url as string,
    status: row.status as "active" | "sold" | "swapped",
    views: row.views as number,
    userName: row.user_name as string,
    userImage: (row.user_image as string) ?? "",
    clerkUserId: (row.clerk_user_id as string) ?? "",
    createdAt: row.created_at as string,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { data } = await supabase.from("items").select("*").eq("id", id).single();
  if (!data) return { title: "Item Not Found" };
  return {
    title: `${data.title} — Snap'n'Swap`,
    description: data.description,
  };
}

export default async function ItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  // Fetch item directly from Supabase
  const { data, error } = await supabase.from("items").select("*").eq("id", id).single();
  if (error || !data) notFound();

  // Increment views (fire and forget)
  supabase.from("items").update({ views: (data.views || 0) + 1 }).eq("id", id).then(() => {});

  const item = toFrontend(data);

  // Related items: same category or random
  const { data: related } = await supabase
    .from("items")
    .select("*")
    .eq("status", "active")
    .neq("id", id)
    .limit(4);

  const relatedItems = (related ?? []).map(toFrontend);

  return <ItemDetail item={item} relatedItems={relatedItems} />;
}
