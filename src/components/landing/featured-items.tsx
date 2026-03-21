"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight, Package } from "lucide-react";
import type { MockItem } from "@/lib/mock-data";

export function FeaturedItems() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [items, setItems] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/items?limit=5")
      .then((res) => res.json())
      .then((data: MockItem[]) => setItems(data.slice(0, 5)))
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, []);

  // Don't render section if no items and done loading
  if (!loading && items.length === 0) {
    return (
      <section ref={ref} className="py-14 px-6">
        <div className="mx-auto max-w-[1400px] text-center py-16">
          <Package className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(1.5rem,3vw,2.5rem)] font-medium tracking-display mb-3">
            No items yet<span className="text-mint">.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Be the first to list something on the marketplace.
          </p>
          <Link
            href="/upload"
            className="inline-flex items-center justify-center bg-foreground text-background text-sm font-medium px-6 py-2.5 rounded-full hover:opacity-80 transition-opacity"
          >
            List your first item
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="py-14 px-6">
      <div className="mx-auto max-w-[1400px]">
        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <p className="label-upper text-mint mb-4">Just listed</p>
            <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-display leading-[1.1]">
              Fresh finds<span className="text-mint">.</span>
            </h2>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.4, duration: 0.5 }}
          >
            <Link
              href="/marketplace"
              className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
            >
              View all
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className={`animate-pulse ${i === 0 ? "col-span-2 row-span-2" : ""}`}>
                <div className={`rounded-sm bg-border/30 ${i === 0 ? "aspect-square" : "aspect-[3/4]"}`} />
                <div className="mt-2.5 space-y-1.5">
                  <div className="h-2.5 w-16 bg-border/30 rounded" />
                  <div className="h-3.5 w-3/4 bg-border/30 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {items.map((item, i) => {
              const isLarge = i === 0 && items.length >= 3;
              return (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 40 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{
                    duration: 0.8,
                    delay: 0.15 + i * 0.08,
                    ease: [0.76, 0, 0.24, 1],
                  }}
                  className={isLarge ? "col-span-2 row-span-2" : "col-span-1"}
                >
                  <Link href={`/item/${item.id}`} className="group block relative">
                    <div
                      className={`relative overflow-hidden rounded-sm bg-card ${
                        isLarge ? "aspect-square" : "aspect-[3/4]"
                      }`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                        sizes={isLarge ? "50vw" : "25vw"}
                        unoptimized={item.imageUrl.startsWith("data:")}
                      />

                      <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-16">
                        <p className="text-white text-sm font-medium">{item.title}</p>
                        <p className="text-white/60 text-xs mt-0.5">{item.brand}</p>
                      </div>
                    </div>

                    <div className="mt-2.5 flex items-baseline justify-between">
                      <div>
                        <p className="label-upper !text-muted-foreground/60 !text-[10px]">
                          {item.brand}
                        </p>
                        <p className="text-sm font-medium mt-0.5 line-clamp-1">
                          {item.title}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-medium tabular-nums">
                        ${item.askingPrice}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        )}

        <div className="mt-8 sm:hidden text-center">
          <Link
            href="/marketplace"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            View all items →
          </Link>
        </div>
      </div>
    </section>
  );
}
