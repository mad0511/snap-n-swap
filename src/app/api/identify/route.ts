const HF_API_URL =
  "https://router.huggingface.co/hyperbolic/v1/chat/completions";
const MODEL = "Qwen/Qwen2.5-VL-72B-Instruct";

export async function POST(req: Request) {
  const token = process.env.HF_API_TOKEN;
  if (!token) {
    return Response.json({ error: "HF_API_TOKEN not configured" }, { status: 500 });
  }

  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const bytes = await image.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = image.type || "image/jpeg";

    const res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: { url: `data:${mimeType};base64,${base64}` },
              },
              {
                type: "text",
                text: `Analyze this clothing item for a secondhand marketplace called Snap'n'Swap. Return ONLY valid JSON with no markdown formatting, no code blocks, just the raw JSON object: {"title": "short catchy marketplace title", "category": "one of: Jackets, Shoes, Dresses, Jeans, Sweaters, T-Shirts, Pants, Shorts, Accessories, Bags, Vests, Shirts", "brand": "detected brand or Unknown", "condition": "one of: Like New, Excellent, Good, Fair", "size": "estimated size like S, M, L, XL, or shoe number", "color": "primary color", "estimatedPrice": number_in_usd, "description": "compelling 2-sentence marketplace description"}`,
              },
            ],
          },
        ],
        max_tokens: 400,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error("HF API error:", res.status, err);
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();
    const content: string = data.choices?.[0]?.message?.content || "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON in response");
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate and ensure all fields exist
    const result = {
      title: parsed.title || "Clothing Item",
      category: parsed.category || "Accessories",
      brand: parsed.brand || "Unknown",
      condition: parsed.condition || "Good",
      size: parsed.size || "M",
      color: parsed.color || "Unknown",
      estimatedPrice: Number(parsed.estimatedPrice) || 50,
      description: parsed.description || "A great secondhand find.",
    };

    return Response.json(result);
  } catch (error) {
    console.error("AI identification error:", error);
    return Response.json(
      { error: "Failed to identify item. Please try again." },
      { status: 500 }
    );
  }
}
