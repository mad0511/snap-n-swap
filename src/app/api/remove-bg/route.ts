export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return Response.json({ error: "No image" }, { status: 400 });
    }

    const rembgUrl = process.env.REMBG_URL || "http://localhost:7100";

    // model must be a form field, not a query param
    const apiForm = new FormData();
    apiForm.append("file", imageFile);
    apiForm.append("model", "u2net_cloth_seg");

    const res = await fetch(`${rembgUrl}/api/remove`, {
      method: "POST",
      body: apiForm,
    });

    if (res.ok) {
      const buffer = await res.arrayBuffer();
      return new Response(buffer, {
        headers: { "Content-Type": "image/png" },
      });
    }

    console.error("rembg error:", res.status);
    return Response.json({ fallback: true });
  } catch (error) {
    console.error("BG removal error:", error);
    return Response.json({ fallback: true });
  }
}
