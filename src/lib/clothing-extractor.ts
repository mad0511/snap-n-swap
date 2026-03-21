/**
 * Clothing Extractor
 *
 * 1. Sends image to rembg server with u2net_cloth_seg model
 * 2. Gets back transparent PNG with only clothing pixels
 * 3. Auto-crops to the clothing bounds (removes empty space)
 * 4. Composites on white background with drop shadow
 */

export async function extractClothing(imageFile: File): Promise<Blob> {
  // Try server-side cloth segmentation
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
        const blob = await res.blob();
        return cropAndComposite(blob);
      }
    }
  } catch {
    // Server unavailable
  }

  // Fallback: client-side background removal
  const { removeBackground } = await import("@imgly/background-removal");
  const transparentBlob = await removeBackground(imageFile, {
    output: { format: "image/png", quality: 0.95 },
  });
  return cropAndComposite(transparentBlob);
}

/**
 * Auto-crop to non-transparent bounds, then composite on white with shadow
 */
async function cropAndComposite(transparentBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(transparentBlob);

  try {
    const img = await loadImage(url);
    const w = img.naturalWidth;
    const h = img.naturalHeight;

    // Draw to canvas to read pixels
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = w;
    tempCanvas.height = h;
    const tempCtx = tempCanvas.getContext("2d")!;
    tempCtx.drawImage(img, 0, 0);
    const imageData = tempCtx.getImageData(0, 0, w, h);
    const pixels = imageData.data;

    // Find bounding box of non-transparent pixels
    let minX = w, minY = h, maxX = 0, maxY = 0;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const alpha = pixels[(y * w + x) * 4 + 3];
        if (alpha > 10) { // threshold to ignore near-transparent edges
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }

    // If nothing found, return original
    if (maxX <= minX || maxY <= minY) {
      return transparentBlob;
    }

    // Crop dimensions
    const cropW = maxX - minX + 1;
    const cropH = maxY - minY + 1;

    // Add padding (8% of largest dimension)
    const padding = Math.round(Math.max(cropW, cropH) * 0.08);
    const finalW = cropW + padding * 2;
    const finalH = cropH + padding * 2;

    // Create final canvas
    const canvas = document.createElement("canvas");
    canvas.width = finalW;
    canvas.height = finalH;
    const ctx = canvas.getContext("2d")!;

    // White background
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, finalW, finalH);

    // Drop shadow
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.10)";
    ctx.shadowBlur = Math.round(padding * 0.6);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(padding * 0.2);
    // Draw only the cropped region
    ctx.drawImage(img, minX, minY, cropW, cropH, padding, padding, cropW, cropH);
    ctx.restore();

    // Crisp image on top
    ctx.drawImage(img, minX, minY, cropW, cropH, padding, padding, cropW, cropH);

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
