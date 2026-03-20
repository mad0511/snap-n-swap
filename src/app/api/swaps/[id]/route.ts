import { supabase } from "@/lib/supabase";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const body = await request.json();
    const { status } = body;

    if (!status || !["accepted", "rejected"].includes(status)) {
      return Response.json(
        { error: "Status must be 'accepted' or 'rejected'" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("swaps")
      .update({ status, updated_at: new Date().toISOString() })
      .eq("id", id)
      .select()
      .single();

    if (error || !data) {
      console.error("Supabase update swap error:", error);
      return Response.json(
        { error: "Failed to update swap" },
        { status: 500 }
      );
    }

    return Response.json({
      id: data.id,
      initiatorItemId: data.initiator_item_id,
      targetItemId: data.target_item_id,
      initiatorUserId: data.initiator_user_id,
      targetUserId: data.target_user_id,
      message: data.message,
      status: data.status,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
