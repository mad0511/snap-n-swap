/**
 * Clothing Extractor — isolates clothing items from a person photo.
 * Uses mattmdjaga/segformer_b2_clothes via @huggingface/transformers (runs in browser).
 *
 * Segmentation labels:
 * 0: Background, 1: Hat, 2: Hair, 3: Sunglasses, 4: Upper-clothes,
 * 5: Skirt, 6: Pants, 7: Dress, 8: Belt, 9: Left-shoe, 10: Right-shoe,
 * 11: Face, 12: Left-leg, 13: Right-leg, 14: Left-arm, 15: Right-arm,
 * 16: Bag, 17: Scarf
 *
 * We keep: 1(Hat), 4(Upper-clothes), 5(Skirt), 6(Pants), 7(Dress),
 *          8(Belt), 9(Left-shoe), 10(Right-shoe), 16(Bag), 17(Scarf)
 * We remove: 0(Background), 2(Hair), 3(Sunglasses), 11(Face),
 *            12-15(Legs/Arms)
 */

// Clothing label IDs to KEEP
const CLOTHING_LABELS = new Set([1, 4, 5, 6, 7, 8, 9, 10, 16, 17]);

export async function extractClothing(imageFile: File): Promise<Blob> {
  // Dynamically import to avoid SSR issues
  const { pipeline, RawImage } = await import("@huggingface/transformers");

  // Load the segmentation pipeline (cached after first load)
  const segmenter = await pipeline(
    "image-segmentation",
    "mattmdjaga/segformer_b2_clothes",
    {
      device: "wasm",
    }
  );

  // Create object URL for the image
  const imageUrl = URL.createObjectURL(imageFile);

  try {
    // Run segmentation
    const results = await segmenter(imageUrl);

    // Load the original image to get pixel data
    const img = await RawImage.fromURL(imageUrl);
    const width = img.width;
    const height = img.height;

    // Create canvas for output
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d")!;

    // Draw original image
    const htmlImg = new Image();
    htmlImg.crossOrigin = "anonymous";
    await new Promise<void>((resolve) => {
      htmlImg.onload = () => resolve();
      htmlImg.src = imageUrl;
    });
    ctx.drawImage(htmlImg, 0, 0, width, height);

    // Get pixel data
    const imageData = ctx.getImageData(0, 0, width, height);
    const pixels = imageData.data;

    // Create a clothing mask from segmentation results
    const clothingMask = new Uint8Array(width * height);

    if (Array.isArray(results)) {
      for (const segment of results) {
        // Check if this segment's label is a clothing item
        const label = segment.label?.toLowerCase() || "";
        const isClothing =
          label.includes("upper") ||
          label.includes("clothes") ||
          label.includes("pants") ||
          label.includes("skirt") ||
          label.includes("dress") ||
          label.includes("shoe") ||
          label.includes("belt") ||
          label.includes("bag") ||
          label.includes("scarf") ||
          label.includes("hat") ||
          label.includes("coat") ||
          label.includes("jacket");

        if (isClothing && segment.mask) {
          // The mask is a RawImage — get its data
          const maskData = segment.mask.data;
          if (maskData) {
            for (let i = 0; i < maskData.length; i++) {
              if (maskData[i] > 0) {
                clothingMask[i] = 1;
              }
            }
          }
        }
      }
    }

    // Apply mask: make non-clothing pixels transparent
    let hasClothingPixels = false;
    for (let i = 0; i < clothingMask.length; i++) {
      if (clothingMask[i] === 1) {
        hasClothingPixels = true;
      } else {
        // Set alpha to 0 (transparent)
        pixels[i * 4 + 3] = 0;
      }
    }

    // If no clothing detected, fall back to background removal only
    if (!hasClothingPixels) {
      // Return original with just bg removal
      const { removeBackground } = await import("@imgly/background-removal");
      return await removeBackground(imageFile, {
        output: { format: "image/png", quality: 0.9 },
      });
    }

    // Put modified pixels back
    ctx.putImageData(imageData, 0, 0);

    // Convert to blob
    return new Promise<Blob>((resolve) => {
      canvas.toBlob(
        (blob) => resolve(blob || new Blob()),
        "image/png",
        0.9
      );
    });
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}
