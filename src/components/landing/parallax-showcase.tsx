"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import type { MockItem } from "@/lib/mock-data";

export function ParallaxShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const [items, setItems] = useState<MockItem[]>([]);

  useEffect(() => {
    fetch("/api/items")
      .then((res) => res.json())
      .then((data: MockItem[]) => setItems(data))
      .catch(() => setItems([]));
  }, []);

  const x = useTransform(scrollYProgress, [0.1, 0.9], ["5%", "-65%"]);
  const sectionOpacity = useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0]);

  // Don't render if no items
  if (items.length < 3) return null;

  return (
    <section ref={containerRef} className="relative py-14 overflow-hidden">
      <motion.div style={{ opacity: sectionOpacity }}>
        <div className="px-6 md:px-12 mb-8">
          <p className="label-upper text-mint mb-3">Trending now</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-display leading-[1.05]">
            Scroll to explore<span className="text-mint">.</span>
          </h2>
        </div>

        <motion.div style={{ x }} className="flex gap-3 md:gap-4">
          {items.map((item, i) => (
            <ParallaxCard key={item.id} item={item} index={i} scrollProgress={scrollYProgress} />
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}

function ParallaxCard({
  item,
  index,
  scrollProgress,
}: {
  item: MockItem;
  index: number;
  scrollProgress: ReturnType<typeof useScroll>["scrollYProgress"];
}) {
  const y = useTransform(
    scrollProgress,
    [0, 1],
    [index % 2 === 0 ? 20 : -15, index % 2 === 0 ? -20 : 15]
  );

  return (
    <motion.div
      style={{ y }}
      className="flex-shrink-0 w-[40vw] md:w-[28vw] lg:w-[20vw] group cursor-pointer"
    >
      <a href={`/item/${item.id}`}>
        <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
            sizes="20vw"
            unoptimized={item.imageUrl.startsWith("data:")}
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
          <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
            <p className="text-white text-sm font-medium">{item.title}</p>
            <p className="text-white/60 font-mono text-sm mt-0.5">${item.askingPrice}</p>
          </div>
        </div>
      </a>
    </motion.div>
  );
}
