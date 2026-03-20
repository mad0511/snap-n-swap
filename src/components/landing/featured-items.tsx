"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { MOCK_ITEMS } from "@/lib/mock-data";

const featured = MOCK_ITEMS.slice(0, 5);

export function FeaturedItems() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

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

        {/* Bento grid — asymmetric */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {featured.map((item, i) => {
            const isLarge = i === 0;
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
                    />

                    {/* Hover overlay — slide up from bottom */}
                    <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] bg-gradient-to-t from-black/70 via-black/40 to-transparent p-4 pt-16">
                      <p className="text-white text-sm font-medium">{item.title}</p>
                      <p className="text-white/60 text-xs mt-0.5">{item.brand}</p>
                    </div>
                  </div>

                  {/* Info below image */}
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

        {/* Mobile "view all" */}
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
