export async function POST(req: Request) {
  const apiKey = process.env.REMOVE_BG_API_KEY;

  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return Response.json({ error: "No image" }, { status: 400 });
    }

    // If remove.bg API key is available, use it (best quality)
    if (apiKey) {
      const apiForm = new FormData();
      apiForm.append("image_file", imageFile);
      apiForm.append("size", "auto");
      apiForm.append("bg_color", "FFFFFF");

      const res = await fetch("https://api.remove.bg/v1.0/removebg", {
        method: "POST",
        headers: { "X-Api-Key": apiKey },
        body: apiForm,
      });

      if (res.ok) {
        const buffer = await res.arrayBuffer();
        return new Response(buffer, {
          headers: { "Content-Type": "image/png" },
        });
      }

      console.error("remove.bg error:", res.status, await res.text());
    }

    // Fallback: return null so the client uses @imgly
    return Response.json({ fallback: true });
  } catch (error) {
    console.error("BG removal error:", error);
    return Response.json({ fallback: true });
  }
}
