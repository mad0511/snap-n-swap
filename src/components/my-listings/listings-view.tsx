"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Loader2, Trash2, Plus } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import type { MockItem } from "@/lib/mock-data";

function ListingsContent() {
  const { user } = useUser();
  const [items, setItems] = useState<(MockItem & { clerkUserId?: string })[]>([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const fetchItems = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/items?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const handleRemove = async (id: string) => {
    setRemovingId(id);
    try {
      const res = await fetch(`/api/items/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "removed" }),
      });
      if (res.ok) {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status: "removed" as const } : item)));
      }
    } catch {
      // silent
    } finally {
      setRemovingId(null);
    }
  };

  const activeItems = items.filter((i) => i.status === "active");
  const removedItems = items.filter((i) => i.status === "removed");

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12 flex items-end justify-between"
        >
          <div>
            <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-display leading-[1.1]">
              My Listings<span className="text-mint">.</span>
            </h1>
            <p className="text-muted-foreground text-sm mt-2">
              {loading
                ? "Loading..."
                : `${activeItems.length} active ${activeItems.length === 1 ? "listing" : "listings"}`}
            </p>
          </div>
          <Link href="/upload">
            <Button className="bg-foreground text-background hover:opacity-80">
              <Plus className="h-4 w-4 mr-1.5" />
              New listing
            </Button>
          </Link>
        </motion.div>

        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-sm bg-border/30" />
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-2.5 w-16 bg-border/30 rounded" />
                    <div className="h-3.5 w-3/4 bg-border/30 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : items.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32"
            >
              <Package className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-sm mb-4">
                No listings yet. Start selling!
              </p>
              <Link href="/upload">
                <Button className="bg-foreground text-background hover:opacity-80">
                  List your first item
                </Button>
              </Link>
            </motion.div>
          ) : (
            <motion.div key="grid">
              {/* Active items */}
              {activeItems.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {activeItems.map((item, i) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: Math.min(i * 0.05, 0.4),
                        ease: [0.76, 0, 0.24, 1],
                      }}
                    >
                      <div className="group block">
                        <div className="relative overflow-hidden rounded-sm bg-card aspect-[3/4]">
                          <Image
                            src={item.imageUrl}
                            alt={item.title}
                            fill
                            className="object-cover"
                            sizes="25vw"
                            unoptimized={item.imageUrl.startsWith("data:")}
                          />
                          <span className="absolute top-2.5 left-2.5 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-sm">
                            {item.condition}
                          </span>

                          {/* Remove button overlay */}
                          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] p-3">
                            <button
                              onClick={() => handleRemove(item.id)}
                              disabled={removingId === item.id}
                              className="w-full flex items-center justify-center gap-1.5 text-xs font-medium bg-destructive/90 text-white py-2 rounded-sm hover:bg-destructive transition-colors cursor-pointer disabled:opacity-50"
                            >
                              {removingId === item.id ? (
                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                              ) : (
                                <Trash2 className="h-3.5 w-3.5" />
                              )}
                              Remove
                            </button>
                          </div>
                        </div>

                        <div className="mt-2.5">
                          <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
                            {item.brand}
                          </p>
                          <div className="flex items-baseline justify-between mt-0.5">
                            <p className="text-sm font-medium line-clamp-1 pr-3">{item.title}</p>
                            <p className="font-mono text-sm tabular-nums flex-shrink-0">
                              ${item.askingPrice}
                            </p>
                          </div>
                          {item.size && (
                            <p className="text-[11px] text-muted-foreground/40 mt-0.5">
                              Size {item.size}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Removed items */}
              {removedItems.length > 0 && (
                <div className="mt-12">
                  <p className="text-xs font-medium tracking-[0.1em] uppercase text-muted-foreground/50 mb-4">
                    Removed
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {removedItems.map((item, i) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 0.4, y: 0 }}
                        transition={{ duration: 0.4, delay: Math.min(i * 0.05, 0.3) }}
                      >
                        <div className="block">
                          <div className="relative overflow-hidden rounded-sm bg-card aspect-[3/4]">
                            <Image
                              src={item.imageUrl}
                              alt={item.title}
                              fill
                              className="object-cover grayscale"
                              sizes="25vw"
                              unoptimized={item.imageUrl.startsWith("data:")}
                            />
                            <span className="absolute top-2.5 left-2.5 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-sm">
                              Removed
                            </span>
                          </div>
                          <div className="mt-2.5">
                            <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
                              {item.brand}
                            </p>
                            <p className="text-sm font-medium line-clamp-1 mt-0.5">{item.title}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
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

export function MyListingsView() {
  return (
    <AuthGuard>
      <ListingsContent />
    </AuthGuard>
  );
}
