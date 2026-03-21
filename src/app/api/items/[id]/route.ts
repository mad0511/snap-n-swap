import { supabase, supabaseAdmin } from "@/lib/supabase";

function toFrontend(data: Record<string, unknown>) {
  return {
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    brand: (data.brand as string) ?? "Unknown",
    condition: data.condition,
    size: (data.size as string) ?? "",
    color: (data.color as string) ?? "",
    estimatedPrice: Number(data.estimated_price),
    askingPrice: Number(data.asking_price),
    imageUrl: data.image_url,
    status: data.status,
    openToSwaps: data.open_to_swaps,
    views: data.views,
    userName: data.user_name,
    userImage: (data.user_image as string) ?? "",
    clerkUserId: (data.clerk_user_id as string) ?? "",
    createdAt: data.created_at,
  };
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data, error } = await supabase
    .from("items")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    return Response.json({ error: "Item not found" }, { status: 404 });
  }

  // Increment views
  supabaseAdmin.from("items").update({ views: (data.views || 0) + 1 }).eq("id", id).then(() => {});

  return Response.json(toFrontend(data));
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();

    // Build update object — only include fields that are present
    const update: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };

    if (body.status !== undefined) update.status = body.status;
    if (body.title !== undefined) update.title = body.title;
    if (body.description !== undefined) update.description = body.description;
    if (body.category !== undefined) update.category = body.category;
    if (body.brand !== undefined) update.brand = body.brand;
    if (body.condition !== undefined) update.condition = body.condition;
    if (body.size !== undefined) update.size = body.size;
    if (body.color !== undefined) update.color = body.color;
    if (body.asking_price !== undefined) update.asking_price = body.asking_price;
    if (body.open_to_swaps !== undefined) update.open_to_swaps = body.open_to_swaps;

    const { data, error } = await supabaseAdmin
      .from("items")
      .update(update)
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase update item error:", error);
      return Response.json({ error: "Failed to update item" }, { status: 500 });
    }

    return Response.json(toFrontend(data));
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
