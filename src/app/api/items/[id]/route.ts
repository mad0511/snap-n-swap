import { supabaseAdmin } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return Response.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("items")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase update item error:", error);
      return Response.json(
        { error: "Failed to update item" },
        { status: 500 }
      );
    }

    return Response.json({
      id: data.id,
      title: data.title,
      description: data.description,
      category: data.category,
      brand: data.brand ?? "Unknown",
      condition: data.condition,
      size: data.size ?? "",
      color: data.color ?? "",
      estimatedPrice: Number(data.estimated_price),
      askingPrice: Number(data.asking_price),
      imageUrl: data.image_url,
      status: data.status,
      openToSwaps: data.open_to_swaps,
      views: data.views,
      userName: data.user_name,
      userImage: data.user_image ?? "",
      clerkUserId: data.clerk_user_id ?? "",
      createdAt: data.created_at,
    });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
