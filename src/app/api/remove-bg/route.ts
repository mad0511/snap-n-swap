export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const imageFile = formData.get("image") as File;

    if (!imageFile) {
      return Response.json({ error: "No image" }, { status: 400 });
    }

    // Use local rembg server with u2net_cloth_seg model
    // This model keeps ONLY clothing and removes the person's body/face/hands
    const rembgUrl = process.env.REMBG_URL || "http://localhost:7100";
    const apiForm = new FormData();
    apiForm.append("file", imageFile);

    const res = await fetch(`${rembgUrl}/api/remove?model=u2net_cloth_seg`, {
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
