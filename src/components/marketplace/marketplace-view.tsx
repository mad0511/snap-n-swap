"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package } from "lucide-react";
import { CATEGORIES } from "@/lib/mock-data";
import type { MockItem } from "@/lib/mock-data";
import { ItemCard } from "./item-card";
import { SearchBar } from "./search-bar";
import { cn } from "@/lib/utils";

type SortOption = "newest" | "price-low" | "price-high" | "views";

export function MarketplaceView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("All");
  const [sort, setSort] = useState<SortOption>("newest");
  const [items, setItems] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const abortRef = useRef<AbortController | null>(null);

  const fetchItems = useCallback(async (q: string, cat: string) => {
    // Cancel any in-flight request
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (cat && cat !== "All") params.set("category", cat);

      const url = `/api/items${params.toString() ? `?${params}` : ""}`;
      const res = await fetch(url, { signal: controller.signal });

      if (!res.ok) throw new Error("Fetch failed");

      const data: MockItem[] = await res.json();
      setItems(data);
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") return;
      // On error, keep existing items
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch on mount and when search/category changes
  useEffect(() => {
    fetchItems(search, category);
  }, [search, category, fetchItems]);

  const handleSearch = useCallback((q: string) => setSearch(q), []);

  // Client-side sort (API returns items, we sort locally)
  const sorted = (() => {
    const copy = [...items];
    switch (sort) {
      case "price-low":
        return copy.sort((a, b) => a.askingPrice - b.askingPrice);
      case "price-high":
        return copy.sort((a, b) => b.askingPrice - a.askingPrice);
      case "views":
        return copy.sort((a, b) => b.views - a.views);
      default:
        return copy;
    }
  })();

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-12"
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2.5rem,5vw,4rem)] font-medium tracking-display leading-[1]">
            Marketplace<span className="text-mint">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-3">
            {loading
              ? "Loading..."
              : `${sorted.length} ${sorted.length === 1 ? "item" : "items"} available`}
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-10 space-y-5"
        >
          <SearchBar onSearch={handleSearch} />

          <div className="flex items-center justify-between gap-4">
            {/* Category pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
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
                      layoutId="cat-pill"
                      className="absolute inset-0 bg-foreground rounded-full"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10">{cat}</span>
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="text-xs text-muted-foreground bg-transparent border border-border rounded-md px-2.5 py-1.5 cursor-pointer focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="newest">Newest</option>
              <option value="price-low">Price: Low → High</option>
              <option value="price-high">Price: High → Low</option>
              <option value="views">Most viewed</option>
            </select>
          </div>
        </motion.div>

        {/* Grid */}
        <AnimatePresence mode="popLayout">
          {loading ? (
            <motion.div
              key="skeleton"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="aspect-[3/4] rounded-sm bg-border/30" />
                  <div className="mt-2.5 space-y-1.5">
                    <div className="h-2.5 w-16 bg-border/30 rounded" />
                    <div className="h-3.5 w-3/4 bg-border/30 rounded" />
                    <div className="h-2.5 w-12 bg-border/30 rounded" />
                  </div>
                </div>
              ))}
            </motion.div>
          ) : sorted.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32"
            >
              <Package className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
              <p className="text-muted-foreground text-sm">
                No items match your search.
              </p>
              <button
                onClick={() => {
                  setSearch("");
                  setCategory("All");
                }}
                className="mt-3 text-xs text-mint hover:underline cursor-pointer"
              >
                Clear filters
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
            >
              {sorted.map((item, i) => (
                <ItemCard
                  key={item.id}
                  item={item}
                  index={i}
                  featured={false}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
