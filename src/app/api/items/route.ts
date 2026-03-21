import type { NextRequest } from "next/server";
import { supabase, supabaseAdmin } from "@/lib/supabase";

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

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q") ?? undefined;
  const category = request.nextUrl.searchParams.get("category") ?? undefined;
  const userId = request.nextUrl.searchParams.get("userId") ?? undefined;

  try {
    let query = supabase
      .from("items")
      .select("*")
      .order("created_at", { ascending: false });

    if (userId) {
      query = query.eq("clerk_user_id", userId);
    } else {
      query = query.eq("status", "active");
    }

    if (q) {
      const pattern = `%${q}%`;
      query = query.or(
        `title.ilike.${pattern},description.ilike.${pattern},brand.ilike.${pattern}`
      );
    }

    if (category && category !== "All") {
      query = query.eq("category", category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase GET items error:", error);
      return Response.json([]);
    }

    return Response.json((data as DbItem[]).map(toFrontend));
  } catch (err) {
    console.error("Items GET error:", err);
    return Response.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      title,
      description,
      category,
      brand,
      condition,
      size,
      color,
      estimatedPrice,
      askingPrice,
      imageUrl,
      userName,
      userImage,
      clerkUserId,
      openToSwaps,
    } = body;

    if (!title || !description || !category || !condition || !imageUrl) {
      return Response.json(
        {
          error:
            "Missing required fields: title, description, category, condition, imageUrl",
        },
        { status: 400 }
      );
    }

    // Upload image to Supabase Storage if it's a base64 data URL
    let finalImageUrl = imageUrl;
    if (imageUrl.startsWith("data:")) {
      try {
        // Parse the data URL: data:<mime>;base64,<data>
        const matches = imageUrl.match(
          /^data:([^;]+);base64,(.+)$/
        );
        if (!matches) {
          return Response.json(
            { error: "Invalid base64 image data" },
            { status: 400 }
          );
        }

        const mimeType = matches[1];
        const base64Data = matches[2];
        const ext = mimeType.split("/")[1]?.replace("jpeg", "jpg") || "jpg";
        const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}.${ext}`;

        // Decode base64 to Uint8Array
        const binaryString = atob(base64Data);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          bytes[i] = binaryString.charCodeAt(i);
        }

        const { error: uploadError } = await supabaseAdmin.storage
          .from("items")
          .upload(fileName, bytes, {
            contentType: mimeType,
            upsert: false,
          });

        if (uploadError) {
          console.error("Storage upload error:", uploadError);
          return Response.json(
            { error: `Failed to upload image: ${uploadError.message}` },
            { status: 500 }
          );
        }

        const {
          data: { publicUrl },
        } = supabaseAdmin.storage.from("items").getPublicUrl(fileName);

        finalImageUrl = publicUrl;
      } catch (uploadErr) {
        console.error("Image upload error:", uploadErr);
        return Response.json(
          { error: "Failed to process image" },
          { status: 500 }
        );
      }
    }

    // Insert item into database
    const { data, error } = await supabaseAdmin
      .from("items")
      .insert({
        title,
        description,
        category,
        brand: brand || "Unknown",
        condition,
        size: size || null,
        color: color || null,
        estimated_price: Number(estimatedPrice) || 0,
        asking_price: Number(askingPrice) || 0,
        image_url: finalImageUrl,
        status: "active",
        open_to_swaps: openToSwaps ?? true,
        views: 0,
        user_name: userName || "Anonymous",
        user_image: userImage || null,
        clerk_user_id: clerkUserId || null,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      return Response.json(
        { error: "Failed to create item" },
        { status: 500 }
      );
    }

    return Response.json(toFrontend(data as DbItem), { status: 201 });
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }
}
