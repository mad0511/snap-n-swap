import { supabase } from "@/lib/supabase";

interface DbItem {
  id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  condition: string;
  size: string | null;
  color: string | null;
  estimated_price: number;
  asking_price: number;
  image_url: string;
  status: string;
  open_to_swaps: boolean;
  views: number;
  user_name: string;
  user_image: string | null;
  clerk_user_id: string | null;
  created_at: string;
  updated_at: string;
}

function toFrontend(row: DbItem) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    brand: row.brand ?? "Unknown",
    condition: row.condition,
    size: row.size ?? "",
    color: row.color ?? "",
    estimatedPrice: Number(row.estimated_price),
    askingPrice: Number(row.asking_price),
    imageUrl: row.image_url,
    status: row.status,
    openToSwaps: row.open_to_swaps,
    views: row.views,
    userName: row.user_name,
    userImage: row.user_image ?? "",
    clerkUserId: row.clerk_user_id ?? "",
    createdAt: row.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Fetch the item
    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !data) {
      return Response.json({ error: "Item not found" }, { status: 404 });
    }

    // Increment views (fire-and-forget)
    supabase
      .from("items")
      .update({ views: (data.views ?? 0) + 1 })
      .eq("id", id)
      .then(() => {});

    return Response.json(toFrontend(data as DbItem));
  } catch (err) {
    console.error("Item GET error:", err);
    return Response.json({ error: "Item not found" }, { status: 404 });
  }
}
