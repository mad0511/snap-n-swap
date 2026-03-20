import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");

  if (!userId) {
    return Response.json(
      { error: "userId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from("swaps")
      .select(
        `
        *,
        initiator_item:items!initiator_item_id(*),
        target_item:items!target_item_id(*)
      `
      )
      .or(`initiator_user_id.eq.${userId},target_user_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase GET swaps error:", error);
      return Response.json([]);
    }

    // Transform to frontend-friendly shape
    const swaps = (data ?? []).map((swap) => ({
      id: swap.id,
      initiatorItemId: swap.initiator_item_id,
      targetItemId: swap.target_item_id,
      initiatorUserId: swap.initiator_user_id,
      targetUserId: swap.target_user_id,
      message: swap.message,
      status: swap.status,
      createdAt: swap.created_at,
      updatedAt: swap.updated_at,
      initiatorItem: swap.initiator_item
        ? {
            id: swap.initiator_item.id,
            title: swap.initiator_item.title,
            description: swap.initiator_item.description,
            category: swap.initiator_item.category,
            brand: swap.initiator_item.brand ?? "Unknown",
            condition: swap.initiator_item.condition,
            size: swap.initiator_item.size ?? "",
            color: swap.initiator_item.color ?? "",
            estimatedPrice: Number(swap.initiator_item.estimated_price),
            askingPrice: Number(swap.initiator_item.asking_price),
            imageUrl: swap.initiator_item.image_url,
            status: swap.initiator_item.status,
            views: swap.initiator_item.views,
            userName: swap.initiator_item.user_name,
            userImage: swap.initiator_item.user_image ?? "",
            createdAt: swap.initiator_item.created_at,
          }
        : null,
      targetItem: swap.target_item
        ? {
            id: swap.target_item.id,
            title: swap.target_item.title,
            description: swap.target_item.description,
            category: swap.target_item.category,
            brand: swap.target_item.brand ?? "Unknown",
            condition: swap.target_item.condition,
            size: swap.target_item.size ?? "",
            color: swap.target_item.color ?? "",
            estimatedPrice: Number(swap.target_item.estimated_price),
            askingPrice: Number(swap.target_item.asking_price),
            imageUrl: swap.target_item.image_url,
            status: swap.target_item.status,
            views: swap.target_item.views,
            userName: swap.target_item.user_name,
            userImage: swap.target_item.user_image ?? "",
            createdAt: swap.target_item.created_at,
          }
        : null,
    }));

    return Response.json(swaps);
  } catch (err) {
    console.error("Swaps GET error:", err);
    return Response.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      initiatorItemId,
      targetItemId,
      initiatorUserId,
      targetUserId,
      message,
    } = body;

    if (
      !initiatorItemId ||
      !targetItemId ||
      !initiatorUserId ||
      !targetUserId
    ) {
      return Response.json(
        {
          error:
            "Missing required fields: initiatorItemId, targetItemId, initiatorUserId, targetUserId",
        },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("swaps")
      .insert({
        initiator_item_id: initiatorItemId,
        target_item_id: targetItemId,
        initiator_user_id: initiatorUserId,
        target_user_id: targetUserId,
        message: message || null,
        status: "pending",
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert swap error:", error);
      return Response.json(
        { error: "Failed to create swap" },
        { status: 500 }
      );
    }

    return Response.json(
      {
        id: data.id,
        initiatorItemId: data.initiator_item_id,
        targetItemId: data.target_item_id,
        initiatorUserId: data.initiator_user_id,
        targetUserId: data.target_user_id,
        message: data.message,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
      },
      { status: 201 }
    );
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
