"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";

const SHOWCASE_ITEMS = [
  { src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&h=900&fit=crop", title: "Patagonia Fleece", price: "$85" },
  { src: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&h=900&fit=crop", title: "Levi's 501", price: "$50" },
  { src: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&h=900&fit=crop", title: "Adidas Samba", price: "$75" },
  { src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=700&h=900&fit=crop", title: "Leather Jacket", price: "$245" },
  { src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=700&h=900&fit=crop", title: "Silk Dress", price: "$140" },
  { src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=700&h=900&fit=crop", title: "Gucci Belt", price: "$275" },
  { src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=700&h=900&fit=crop", title: "Cashmere Knit", price: "$95" },
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&h=900&fit=crop", title: "Air Max 97", price: "$165" },
  { src: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=700&h=900&fit=crop&q=90", title: "North Face Vest", price: "$110" },
  { src: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=700&h=900&fit=crop&q=90", title: "Vintage Denim", price: "$65" },
];

export function ParallaxShowcase() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  // Horizontal scroll driven by vertical scroll — NOT sticky, just transform
  const x = useTransform(scrollYProgress, [0.1, 0.9], ["5%", "-65%"]);
  const sectionOpacity = useTransform(scrollYProgress, [0.05, 0.15, 0.85, 0.95], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative py-14 overflow-hidden">
      <motion.div style={{ opacity: sectionOpacity }}>
        {/* Header */}
        <div className="px-6 md:px-12 mb-8">
          <p className="label-upper text-mint mb-3">Trending now</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-display leading-[1.05]">
            Scroll to explore<span className="text-mint">.</span>
          </h2>
        </div>

        {/* Horizontal strip — uses transform, no sticky */}
        <motion.div style={{ x }} className="flex gap-3 md:gap-4">
          {SHOWCASE_ITEMS.map((item, i) => (
            <ParallaxCard key={i} item={item} index={i} scrollProgress={scrollYProgress} />
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
  item: { src: string; title: string; price: string };
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
      <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
        <Image
          src={item.src}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
          sizes="20vw"
        />
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-500" />
        <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)]">
          <p className="text-white text-sm font-medium">{item.title}</p>
          <p className="text-white/60 font-mono text-sm mt-0.5">{item.price}</p>
        </div>
      </div>
    </motion.div>
  );
}
