/**
 * Clothing Extractor
 *
 * Step 1: Remove background using @imgly/background-removal (reliable, runs in browser)
 * Step 2: Composite the extracted subject onto a clean white background with drop shadow
 *
 * This gives a professional product-photo look: item on white with subtle shadow.
 */

export async function extractClothing(imageFile: File): Promise<Blob> {
  const { removeBackground } = await import("@imgly/background-removal");

  // Step 1: Remove background → transparent PNG
  const transparentBlob = await removeBackground(imageFile, {
    output: { format: "image/png", quality: 0.95 },
  });

  // Step 2: Composite onto white background with shadow
  return compositeOnWhite(transparentBlob);
}

async function compositeOnWhite(transparentBlob: Blob): Promise<Blob> {
  const url = URL.createObjectURL(transparentBlob);

  try {
    const img = await loadImage(url);
    const width = img.naturalWidth;
    const height = img.naturalHeight;

    // Add padding for shadow
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

    // Drop shadow — draw the image offset and blurred, then draw the real image on top
    ctx.save();
    ctx.shadowColor = "rgba(0, 0, 0, 0.15)";
    ctx.shadowBlur = Math.round(padding * 0.8);
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = Math.round(padding * 0.3);
    ctx.drawImage(img, padding, padding, width, height);
    ctx.restore();

    // Draw the actual image on top (without shadow) for crisp edges
    ctx.drawImage(img, padding, padding, width, height);

    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob || new Blob()),
        "image/jpeg",
        0.92
      );
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
