"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, Check, ArrowLeftRight, ArrowLeft, Loader2, Scissors } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/mock-data";

const CONDITION_OPTIONS = ["Like New", "Excellent", "Good", "Fair"];

// Categories without "All" for the dropdown
const ITEM_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

interface AIResult {
  title: string;
  category: string;
  brand: string;
  condition: string;
  size: string;
  color: string;
  description: string;
  estimatedPrice: number;
}

export function UploadFlow() {
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [preview, setPreview] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<AIResult | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [openToSwaps, setOpenToSwaps] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [processedFile, setProcessedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [removingBg, setRemovingBg] = useState(false);
  const [bgRemoved, setBgRemoved] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [askingPrice, setAskingPrice] = useState("");

  const handleFile = useCallback(async (file: File) => {
    if (!file.type.startsWith("image/")) return;
    setError(null);
    setUploadedFile(file);
    setStep(2);

    // Step 1: Extract clothing (remove person + background, keep only clothes)
    setRemovingBg(true);
    setBgRemoved(false);
    const originalUrl = URL.createObjectURL(file);
    setPreview(originalUrl);

    try {
      const { extractClothing } = await import("@/lib/clothing-extractor");
      const blob = await extractClothing(file);
      const cleanFile = new File([blob], "clothing.png", { type: "image/png" });
      const cleanUrl = URL.createObjectURL(cleanFile);
      setPreview(cleanUrl);
      setProcessedFile(cleanFile);
      setBgRemoved(true);
    } catch (err) {
      console.error("Clothing extraction failed, trying bg removal:", err);
      // Fallback to simple background removal
      try {
        const { removeBackground } = await import("@imgly/background-removal");
        const blob = await removeBackground(file, {
          output: { format: "image/png", quality: 0.9 },
        });
        const cleanFile = new File([blob], "clean.png", { type: "image/png" });
        setPreview(URL.createObjectURL(cleanFile));
        setProcessedFile(cleanFile);
        setBgRemoved(true);
      } catch {
        setProcessedFile(file);
      }
    } finally {
      setRemovingBg(false);
    }

    // Step 2: AI analysis
    setAnalyzing(true);
  }, []);

  // AI analysis — runs after bg removal finishes
  useEffect(() => {
    if (!analyzing || !uploadedFile || removingBg) return;

    const analyzeImage = async () => {
      try {
        const fileToAnalyze = processedFile || uploadedFile;
        const formData = new FormData();
        formData.append("image", fileToAnalyze);

        const res = await fetch("/api/identify", {
          method: "POST",
          body: formData,
        });

        if (!res.ok) throw new Error("API failed");

        const result: AIResult = await res.json();
        setAiResult(result);
        setTitle(result.title);
        setDescription(result.description);
        setCategory(result.category);
        setBrand(result.brand);
        setCondition(result.condition);
        setSize(result.size);
        setColor(result.color);
        setAskingPrice(result.estimatedPrice.toString());
      } catch {
        setError("Couldn't analyze the image. Please try again with a clearer photo.");
        setStep(1);
      } finally {
        setAnalyzing(false);
      }
    };

    analyzeImage();
  }, [analyzing, uploadedFile, processedFile, removingBg]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async () => {
    if (!uploadedFile || !title || !description || !category || !condition) {
      setError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Use processed (bg-removed) file if available, otherwise original
      const fileToUpload = processedFile || uploadedFile;
      const imageUrl = await fileToBase64(fileToUpload);

      const res = await fetch("/api/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          brand,
          condition,
          size,
          color,
          estimatedPrice: aiResult?.estimatedPrice ?? (Number(askingPrice) || 0),
          askingPrice: Number(askingPrice) || 0,
          imageUrl,
          openToSwaps,
          userName: user?.fullName || user?.firstName || "Anonymous",
          userImage: user?.imageUrl || "",
          clerkUserId: user?.id || "",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to list item");
      }

      router.push("/marketplace");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to list item. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-2xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-display leading-[1.1]">
            Sell an item<span className="text-mint">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Upload a photo and let AI handle the details.
          </p>
        </motion.div>

        {/* Error */}
        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {/* Progress */}
        <div className="flex items-center gap-3 mb-10">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-3 flex-1">
              <div
                className={`h-1 flex-1 rounded-full transition-colors duration-500 ${
                  step >= s ? "bg-foreground" : "bg-border"
                }`}
              />
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Upload */}
          {step === 1 && (
            <motion.div
              key="step-1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            >
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-lg p-16 text-center cursor-pointer transition-colors duration-300 ${
                  isDragging
                    ? "border-mint bg-mint-muted"
                    : "border-border hover:border-foreground/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleFile(file);
                  }}
                />
                <Camera className="h-8 w-8 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-sm font-medium">Drop a photo or click to upload</p>
                <p className="text-xs text-muted-foreground mt-1">
                  JPG, PNG, or HEIC — max 25MB
                </p>
              </div>
            </motion.div>
          )}

          {/* Step 2: AI Analysis */}
          {step === 2 && (
            <motion.div
              key="step-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image */}
                <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
                  {preview && (
                    <Image
                      src={preview}
                      alt="Upload preview"
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  )}
                  {bgRemoved && !removingBg && (
                    <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-sm">
                      <Scissors className="h-3 w-3" />
                      Clothing extracted
                    </div>
                  )}
                  {(removingBg || analyzing) && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center">
                      <div className="text-center">
                        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin mx-auto mb-3" />
                        <p className="text-xs text-muted-foreground">
                          {removingBg ? "Extracting clothing from image..." : "Analyzing..."}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Results */}
                <div>
                  <p className="label-upper text-mint mb-6">AI Analysis</p>

                  {analyzing ? (
                    <div className="space-y-4">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className="h-4 bg-border/50 rounded animate-pulse"
                          style={{ width: `${70 + Math.random() * 30}%` }}
                        />
                      ))}
                    </div>
                  ) : (
                    aiResult && (
                      <div className="space-y-4">
                        {[
                          { label: "Category", value: aiResult.category },
                          { label: "Brand", value: aiResult.brand },
                          { label: "Condition", value: aiResult.condition },
                          { label: "Size", value: aiResult.size },
                          { label: "Color", value: aiResult.color },
                        ].map((field, i) => (
                          <motion.div
                            key={field.label}
                            initial={{ opacity: 0, x: 15 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: i * 0.08, duration: 0.4 }}
                            className="flex items-center justify-between py-2 border-b border-border/50"
                          >
                            <span className="text-xs text-muted-foreground">
                              {field.label}
                            </span>
                            <span className="text-sm font-medium">{field.value}</span>
                          </motion.div>
                        ))}

                        <motion.div
                          initial={{ opacity: 0, x: 15 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5, duration: 0.4 }}
                          className="pt-4"
                        >
                          <p className="text-xs text-muted-foreground mb-1">
                            Suggested price
                          </p>
                          <p className="font-[family-name:var(--font-playfair)] text-3xl font-medium tracking-display">
                            ${aiResult.estimatedPrice}
                          </p>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                          className="pt-4 flex gap-2"
                        >
                          <Button
                            variant="outline"
                            onClick={() => setStep(1)}
                            className="px-4"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Back
                          </Button>
                          <Button
                            onClick={() => setStep(3)}
                            className="flex-1 bg-foreground text-background hover:opacity-80"
                          >
                            <Check className="h-4 w-4 mr-2" />
                            Looks good — continue
                          </Button>
                        </motion.div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Listing Details */}
          {step === 3 && (
            <motion.div
              key="step-3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.4, ease: [0.76, 0, 0.24, 1] }}
              className="space-y-6"
            >
              {/* Back button */}
              <button
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to AI results
              </button>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Title
                </Label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-card border-border"
                  placeholder="e.g. Vintage Leather Jacket"
                />
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Description
                </Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="bg-card border-border resize-none"
                  placeholder="Describe the item..."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Category
                  </Label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select category</option>
                    {ITEM_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Brand
                  </Label>
                  <Input
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                    className="bg-card border-border"
                    placeholder="e.g. Nike"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Condition
                  </Label>
                  <select
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                    className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select</option>
                    {CONDITION_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Size
                  </Label>
                  <Input
                    value={size}
                    onChange={(e) => setSize(e.target.value)}
                    className="bg-card border-border"
                    placeholder="e.g. M, 10"
                  />
                </div>

                <div>
                  <Label className="text-xs text-muted-foreground mb-1.5 block">
                    Color
                  </Label>
                  <Input
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="bg-card border-border"
                    placeholder="e.g. Black"
                  />
                </div>
              </div>

              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">
                  Asking price (USD)
                </Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    value={askingPrice}
                    onChange={(e) => setAskingPrice(e.target.value)}
                    className="bg-card border-border pl-7"
                  />
                </div>
                {aiResult && (
                  <p className="text-xs text-muted-foreground mt-1">
                    AI suggested ${aiResult.estimatedPrice}
                  </p>
                )}
              </div>

              {/* Swap toggle */}
              <button
                type="button"
                onClick={() => setOpenToSwaps(!openToSwaps)}
                className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                  openToSwaps
                    ? "border-mint/40 bg-mint/5"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                      openToSwaps ? "bg-mint/15 text-mint" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    <ArrowLeftRight className="h-4 w-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-sm font-medium">Available for swap</p>
                    <p className="text-xs text-muted-foreground">
                      {openToSwaps
                        ? "Others can propose swaps for this item"
                        : "This item is for sale only"}
                    </p>
                  </div>
                </div>
                <div
                  className={`relative h-[24px] w-[44px] rounded-full transition-colors duration-300 flex-shrink-0 ${
                    openToSwaps ? "bg-mint" : "bg-border"
                  }`}
                >
                  <span
                    className={`absolute top-[2px] left-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                      openToSwaps ? "translate-x-[20px]" : "translate-x-0"
                    }`}
                  />
                </div>
              </button>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full bg-foreground text-background hover:opacity-80"
              >
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Listing...
                  </>
                ) : (
                  "List item"
                )}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
