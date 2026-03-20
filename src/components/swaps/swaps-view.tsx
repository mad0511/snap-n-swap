"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeftRight,
  ArrowLeft,
  Package,
  Loader2,
  Eye,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CATEGORIES } from "@/lib/mock-data";
import type { MockItem } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

type ViewMode = "browse" | "detail";

export function SwapsView() {
  const [items, setItems] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("All");
  const [viewMode, setViewMode] = useState<ViewMode>("browse");
  const [selectedItem, setSelectedItem] = useState<MockItem | null>(null);
  const [similarItems, setSimilarItems] = useState<MockItem[]>([]);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [swapTarget, setSwapTarget] = useState<MockItem | null>(null);
  const [swapMessage, setSwapMessage] = useState("");
  const [swapSubmitting, setSwapSubmitting] = useState(false);
  const [swapSuccess, setSwapSuccess] = useState(false);

  // Fetch swappable items
  const fetchItems = useCallback(async (cat: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (cat && cat !== "All") params.set("category", cat);
      const res = await fetch(`/api/items/swappable?${params}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // keep existing
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems(category);
  }, [category, fetchItems]);

  // When an item is clicked, fetch similar items
  const handleItemClick = async (item: MockItem) => {
    setSelectedItem(item);
    setViewMode("detail");
    setLoadingSimilar(true);
    setSwapTarget(null);
    setSwapSuccess(false);
    setSwapMessage("");

    try {
      const res = await fetch(
        `/api/items/swappable?similarTo=${item.id}&category=${item.category}`
      );
      if (res.ok) {
        const data = await res.json();
        setSimilarItems(data);
      }
    } catch {
      setSimilarItems([]);
    } finally {
      setLoadingSimilar(false);
    }
  };

  const handleBack = () => {
    setViewMode("browse");
    setSelectedItem(null);
    setSimilarItems([]);
    setSwapTarget(null);
    setSwapSuccess(false);
  };

  const handleProposeSwap = async () => {
    if (!selectedItem || !swapTarget) return;
    setSwapSubmitting(true);
    try {
      const res = await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiatorItemId: swapTarget.id,
          targetItemId: selectedItem.id,
          initiatorUserId: "current",
          targetUserId: "owner",
          message: swapMessage || null,
        }),
      });
      if (res.ok) {
        setSwapSuccess(true);
        setSwapTarget(null);
        setSwapMessage("");
      }
    } catch {
      // silent
    } finally {
      setSwapSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="mx-auto max-w-[1400px]">
        <AnimatePresence mode="wait">
          {viewMode === "browse" ? (
            <motion.div
              key="browse"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-10"
              >
                <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-display leading-[1]">
                  Swap<span className="text-mint">.</span>
                </h1>
                <p className="text-muted-foreground text-sm mt-3">
                  Browse items available for swapping. Tap one to find matches.
                </p>
              </motion.div>

              {/* Category pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar mb-8">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={cn(
                      "relative px-3.5 py-1.5 text-xs font-medium rounded-full whitespace-nowrap transition-colors duration-300 cursor-pointer",
                      category === cat
                        ? "text-background"
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {category === cat && (
                      <motion.span
                        layoutId="swap-cat-pill"
                        className="absolute inset-0 bg-foreground rounded-full"
                        transition={{
                          type: "spring",
                          stiffness: 400,
                          damping: 30,
                        }}
                      />
                    )}
                    <span className="relative z-10">{cat}</span>
                  </button>
                ))}
              </div>

              {/* Grid */}
              {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-[3/4] rounded-sm bg-border/30" />
                      <div className="mt-2.5 space-y-1.5">
                        <div className="h-2.5 w-16 bg-border/30 rounded" />
                        <div className="h-3.5 w-3/4 bg-border/30 rounded" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-32">
                  <Package className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
                  <p className="text-muted-foreground text-sm">
                    No items available for swapping yet.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {items.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: Math.min(i * 0.05, 0.4),
                        duration: 0.5,
                      }}
                    >
                      <button
                        onClick={() => handleItemClick(item)}
                        className="block w-full text-left group cursor-pointer"
                      >
                        <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                            sizes="25vw"
                            unoptimized={item.imageUrl.startsWith("data:")}
                          />
                          <div className="absolute top-2.5 left-2.5">
                            <Badge
                              variant="outline"
                              className="bg-mint/20 text-mint border-mint/30 text-[10px]"
                            >
                              <ArrowLeftRight className="h-2.5 w-2.5 mr-1" />
                              Swappable
                            </Badge>
                          </div>
                          <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {item.views}
                          </span>
                        </div>
                        <div className="mt-2.5">
                          <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
                            {item.brand}
                          </p>
                          <div className="flex items-baseline justify-between mt-0.5">
                            <p className="text-sm font-medium line-clamp-1 pr-3">
                              {item.title}
                            </p>
                            <p className="font-mono text-sm tabular-nums flex-shrink-0">
                              ${item.askingPrice}
                            </p>
                          </div>
                          <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                            {item.category} · {item.condition}
                          </p>
                        </div>
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          ) : (
            /* Detail view — selected item + similar items */
            <motion.div
              key="detail"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Back button */}
              <button
                onClick={handleBack}
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-8 cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to all swappable items
              </button>

              {selectedItem && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                  {/* Selected item — left side */}
                  <div className="lg:col-span-5">
                    <div className="lg:sticky lg:top-20">
                      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
                        <Image
                          src={selectedItem.imageUrl}
                          alt={selectedItem.title}
                          fill
                          className="object-cover"
                          sizes="40vw"
                          unoptimized={selectedItem.imageUrl.startsWith(
                            "data:"
                          )}
                        />
                      </div>
                      <div className="mt-4">
                        <p className="label-upper mb-1">{selectedItem.brand}</p>
                        <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-medium tracking-display">
                          {selectedItem.title}
                        </h2>
                        <div className="flex items-center gap-3 mt-2">
                          <p className="font-mono text-lg tabular-nums">
                            ${selectedItem.askingPrice}
                          </p>
                          <Badge variant="outline" className="text-[10px]">
                            {selectedItem.condition}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {selectedItem.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
                          {selectedItem.description}
                        </p>
                      </div>

                      {/* Swap proposal form */}
                      {swapSuccess ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 rounded-lg bg-mint/10 border border-mint/20 text-center"
                        >
                          <p className="text-sm font-medium text-mint">
                            Swap proposed!
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            You&apos;ll be notified when they respond.
                          </p>
                        </motion.div>
                      ) : swapTarget ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-6 p-4 rounded-lg border border-border bg-card space-y-3"
                        >
                          <div className="flex items-center justify-between">
                            <p className="text-xs text-muted-foreground">
                              Swapping with:
                            </p>
                            <button
                              onClick={() => setSwapTarget(null)}
                              className="text-muted-foreground hover:text-foreground cursor-pointer"
                            >
                              <X className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-sm overflow-hidden relative flex-shrink-0">
                              <Image
                                src={swapTarget.imageUrl}
                                alt={swapTarget.title}
                                fill
                                className="object-cover"
                                unoptimized={swapTarget.imageUrl.startsWith(
                                  "data:"
                                )}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">
                                {swapTarget.title}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                ${swapTarget.askingPrice}
                              </p>
                            </div>
                          </div>
                          <Textarea
                            value={swapMessage}
                            onChange={(e) => setSwapMessage(e.target.value)}
                            rows={2}
                            placeholder="Add a message..."
                            className="bg-background border-border resize-none text-sm"
                          />
                          <Button
                            onClick={handleProposeSwap}
                            disabled={swapSubmitting}
                            className="w-full bg-foreground text-background hover:opacity-80"
                          >
                            {swapSubmitting ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <ArrowLeftRight className="h-4 w-4 mr-2" />
                                Propose swap
                              </>
                            )}
                          </Button>
                        </motion.div>
                      ) : null}
                    </div>
                  </div>

                  {/* Similar items — right side */}
                  <div className="lg:col-span-7">
                    <div className="mb-6">
                      <p className="label-upper text-mint mb-2">
                        Similar items available for swap
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Select an item you&apos;d like to swap for{" "}
                        <span className="text-foreground">
                          {selectedItem.title}
                        </span>
                      </p>
                    </div>

                    {loadingSimilar ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="animate-pulse">
                            <div className="aspect-[3/4] rounded-sm bg-border/30" />
                            <div className="mt-2 space-y-1">
                              <div className="h-2.5 w-16 bg-border/30 rounded" />
                              <div className="h-3 w-3/4 bg-border/30 rounded" />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : similarItems.length === 0 ? (
                      <div className="text-center py-20">
                        <Package className="h-8 w-8 mx-auto text-muted-foreground/20 mb-3" />
                        <p className="text-sm text-muted-foreground">
                          No similar items found for swapping.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {similarItems.map((item, i) => (
                          <motion.div
                            key={item.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.4 }}
                          >
                            <button
                              onClick={() => setSwapTarget(item)}
                              className={cn(
                                "block w-full text-left group cursor-pointer rounded-sm transition-all duration-300",
                                swapTarget?.id === item.id
                                  ? "ring-2 ring-mint ring-offset-2 ring-offset-background"
                                  : ""
                              )}
                            >
                              <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
                                <Image
                                  src={item.imageUrl}
                                  alt={item.title}
                                  fill
                                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                                  sizes="20vw"
                                  unoptimized={item.imageUrl.startsWith(
                                    "data:"
                                  )}
                                />
                                {item.category === selectedItem.category && (
                                  <span className="absolute top-2 left-2 text-[9px] font-medium bg-mint/20 text-mint px-1.5 py-0.5 rounded-sm">
                                    Same category
                                  </span>
                                )}
                              </div>
                              <div className="mt-2">
                                <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
                                  {item.brand}
                                </p>
                                <p className="text-sm font-medium line-clamp-1">
                                  {item.title}
                                </p>
                                <div className="flex items-center justify-between mt-0.5">
                                  <p className="font-mono text-sm tabular-nums">
                                    ${item.askingPrice}
                                  </p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {item.condition}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
