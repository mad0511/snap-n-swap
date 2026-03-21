/**
 * Clothing Extractor
 *
 * Priority:
 * 1. Server-side: remove.bg API (best quality, 50 free/month)
 * 2. Client-side: @imgly/background-removal (unlimited, runs in browser)
 *
 * Both produce: item on white background with subtle drop shadow.
 */

export async function extractClothing(imageFile: File): Promise<Blob> {
  // Try server-side API first (remove.bg or similar)
  try {
    const formData = new FormData();
    formData.append("image", imageFile);

    const res = await fetch("/api/remove-bg", {
      method: "POST",
      body: formData,
    });

    if (res.ok) {
      const contentType = res.headers.get("content-type") || "";
      if (contentType.includes("image")) {
        // Server returned a processed image — add white bg + shadow
        const blob = await res.blob();
        return compositeOnWhite(blob);
      }
    }
  } catch {
    // Server unavailable, fall back to client
  }

  // Client-side fallback
  const { removeBackground } = await import("@imgly/background-removal");
  const transparentBlob = await removeBackground(imageFile, {
    output: { format: "image/png", quality: 0.95 },
  });

  return compositeOnWhite(transparentBlob);
}

async function compositeOnWhite(transparentBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(transparentBlob);

  try {
    const img = await loadImage(url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    const padding = Math.round(Math.max(width, height) * 0.06);
    const canvasW = width + padding * 2;
    const canvasH = height + padding * 2;

    const canvas = document.createElement("canvas");
    canvas.width = canvasW;
    canvas.height = canvasH;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.12)";
    ctx.shadowBlur = Math.round(padding * 0.7);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(padding * 0.25);
    ctx.drawImage(img, padding, padding, width, height);
    ctx.restore();

    // Crisp image on top
    ctx.drawImage(img, padding, padding, width, height);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob((blob) => resolve(blob || new Blob()), "image/jpeg", 0.92);
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
