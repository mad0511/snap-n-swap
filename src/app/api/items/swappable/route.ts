import type { NextRequest } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const similarTo = request.nextUrl.searchParams.get("similarTo") ?? undefined;

  try {
    let query = supabase
      .from("items")
      .select("*")
      .eq("status", "active")
      .eq("open_to_swaps", true)
      .order("created_at", { ascending: false });

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase swappable items error:", error);
      return Response.json([]);
    }

    // If similarTo is provided, sort by similarity (same category first, then similar price range)
    if (similarTo && data) {
      const targetItem = data.find((item: Record<string, unknown>) => item.id === similarTo);
      if (targetItem) {
        const targetPrice = Number(targetItem.asking_price);
        const targetCategory = targetItem.category;

        // Remove the target item itself
        const others = data.filter((item: Record<string, unknown>) => item.id !== similarTo);

        // Score each item by similarity
        const scored = others.map((item: Record<string, unknown>) => {
          let score = 0;
          if (item.category === targetCategory) score += 10;
          const priceDiff = Math.abs(Number(item.asking_price) - targetPrice);
          score += Math.max(0, 5 - priceDiff / 50); // closer price = higher score
          return { item, score };
        });

        scored.sort((a: { score: number }, b: { score: number }) => b.score - a.score);

        const sorted = scored.map((s: { item: Record<string, unknown> }) => s.item);
        return Response.json(sorted.map(toFrontend));
      }
    }

    return Response.json((data ?? []).map(toFrontend));
  } catch {
    return Response.json([]);
  }
}

function toFrontend(row: Record<string, unknown>) {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    category: row.category,
    brand: (row.brand as string) ?? "Unknown",
    condition: row.condition,
    size: (row.size as string) ?? "",
    color: (row.color as string) ?? "",
    estimatedPrice: Number(row.estimated_price),
    askingPrice: Number(row.asking_price),
    imageUrl: row.image_url,
    status: row.status,
    openToSwaps: row.open_to_swaps,
    views: row.views,
    userName: row.user_name,
    userImage: (row.user_image as string) ?? "",
    createdAt: row.created_at,
  };
}
