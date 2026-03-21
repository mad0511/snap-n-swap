"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeft, Loader2, Check, ArrowLeftRight } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { CATEGORIES } from "@/lib/mock-data";
import type { MockItem } from "@/lib/mock-data";
import { AuthGuard } from "@/components/auth-guard";
import Link from "next/link";

const CONDITION_OPTIONS = ["Like New", "Excellent", "Good", "Fair"];
const ITEM_CATEGORIES = CATEGORIES.filter((c) => c !== "All");

export function EditItemView({ itemId }: { itemId: string }) {
  return (
    <AuthGuard>
      <EditForm itemId={itemId} />
    </AuthGuard>
  );
}

function EditForm({ itemId }: { itemId: string }) {
  const router = useRouter();
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [item, setItem] = useState<(MockItem & { clerkUserId?: string }) | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [condition, setCondition] = useState("");
  const [size, setSize] = useState("");
  const [color, setColor] = useState("");
  const [askingPrice, setAskingPrice] = useState("");
  const [openToSwaps, setOpenToSwaps] = useState(true);

  useEffect(() => {
    fetch(`/api/items/${itemId}`)
      .then((res) => {
        if (!res.ok) throw new Error("Not found");
        return res.json();
      })
      .then((data: MockItem & { clerkUserId?: string; openToSwaps?: boolean }) => {
        setItem(data);
        setTitle(data.title);
        setDescription(data.description);
        setCategory(data.category);
        setBrand(data.brand);
        setCondition(data.condition);
        setSize(data.size);
        setColor(data.color);
        setAskingPrice(data.askingPrice.toString());
        setOpenToSwaps(data.openToSwaps ?? true);
      })
      .catch(() => setError("Item not found"))
      .finally(() => setLoading(false));
  }, [itemId]);

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          category,
          brand,
          condition,
          size,
          color,
          asking_price: Number(askingPrice) || 0,
          open_to_swaps: openToSwaps,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setSuccess(true);
      setTimeout(() => router.push(`/item/${itemId}`), 1500);
    } catch {
      setError("Failed to save changes");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!item || (user?.id && item.clerkUserId !== user.id)) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">You can only edit your own listings.</p>
          <Link href="/marketplace">
            <Button variant="outline">Back to marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-2xl">
        <Link
          href={`/item/${itemId}`}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to listing
        </Link>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-display">
            Edit listing<span className="text-mint">.</span>
          </h1>
        </motion.div>

        {error && (
          <div className="mb-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md px-4 py-3">
            {error}
          </div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-sm text-mint bg-mint/10 border border-mint/20 rounded-md px-4 py-3 flex items-center gap-2"
          >
            <Check className="h-4 w-4" />
            Changes saved! Redirecting...
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Image preview */}
          <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover"
              unoptimized={item.imageUrl.startsWith("data:")}
            />
          </div>

          {/* Form */}
          <div className="md:col-span-2 space-y-5">
            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} className="bg-card border-border" />
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="bg-card border-border resize-none" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Category</Label>
                <select value={category} onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {ITEM_CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Brand</Label>
                <Input value={brand} onChange={(e) => setBrand(e.target.value)} className="bg-card border-border" />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Condition</Label>
                <select value={condition} onChange={(e) => setCondition(e.target.value)}
                  className="w-full h-9 rounded-md border border-border bg-card px-3 text-sm focus:outline-none focus:ring-1 focus:ring-ring">
                  {CONDITION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Size</Label>
                <Input value={size} onChange={(e) => setSize(e.target.value)} className="bg-card border-border" />
              </div>
              <div>
                <Label className="text-xs text-muted-foreground mb-1.5 block">Color</Label>
                <Input value={color} onChange={(e) => setColor(e.target.value)} className="bg-card border-border" />
              </div>
            </div>

            <div>
              <Label className="text-xs text-muted-foreground mb-1.5 block">Asking price (USD)</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                <Input type="number" value={askingPrice} onChange={(e) => setAskingPrice(e.target.value)} className="bg-card border-border pl-7" />
              </div>
            </div>

            {/* Swap toggle */}
            <button
              type="button"
              onClick={() => setOpenToSwaps(!openToSwaps)}
              className={`w-full flex items-center justify-between p-4 rounded-lg border transition-all duration-300 cursor-pointer ${
                openToSwaps ? "border-mint/40 bg-mint/5" : "border-border bg-card"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-full flex items-center justify-center transition-colors duration-300 ${
                  openToSwaps ? "bg-mint/15 text-mint" : "bg-muted text-muted-foreground"
                }`}>
                  <ArrowLeftRight className="h-4 w-4" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-medium">Available for swap</p>
                  <p className="text-xs text-muted-foreground">
                    {openToSwaps ? "Others can propose swaps" : "Sale only"}
                  </p>
                </div>
              </div>
              <div className={`relative h-[24px] w-[44px] rounded-full transition-colors duration-300 flex-shrink-0 ${
                openToSwaps ? "bg-mint" : "bg-border"
              }`}>
                <span className={`absolute top-[2px] left-[2px] h-[20px] w-[20px] rounded-full bg-white shadow-sm transition-transform duration-300 ${
                  openToSwaps ? "translate-x-[20px]" : "translate-x-0"
                }`} />
              </div>
            </button>

            <Button onClick={handleSave} disabled={saving} className="w-full bg-foreground text-background hover:opacity-80">
              {saving ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Saving...</> : "Save changes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
