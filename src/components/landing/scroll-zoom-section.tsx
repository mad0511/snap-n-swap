"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const ITEMS = [
  { src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&h=1000&fit=crop", label: "Jackets" },
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&h=1000&fit=crop", label: "Sneakers" },
  { src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=800&h=1000&fit=crop", label: "Dresses" },
  { src: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&h=1000&fit=crop", label: "Accessories" },
  { src: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=800&h=1000&fit=crop", label: "Knitwear" },
];

function Card({ src, label, index, spread, cardScale }: {
  src: string; label: string; index: number;
  spread: MotionValue<number>; cardScale: MotionValue<number>;
}) {
  const angle = (index - 2) * 15;
  const xOffset = (index - 2) * 280;
  const x = useTransform(spread, [0, 1], [0, xOffset]);
  const rotate = useTransform(spread, [0, 1], [0, angle]);

  return (
    <motion.div
      style={{ scale: cardScale, x, rotate }}
      className="absolute w-[280px] md:w-[320px] aspect-[3/4] rounded-md overflow-hidden"
    >
      <Image src={src} alt={label} fill className="object-cover" sizes="320px" />
      <div className="absolute inset-0 bg-black/20" />
      <p className="absolute bottom-4 left-4 text-white text-sm font-medium tracking-wide">{label}</p>
    </motion.div>
  );
}

export function ScrollZoomSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  const spread = useTransform(scrollYProgress, [0, 0.6], [1, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 0.3, 0.6], [0.7, 1.05, 0.85]);
  const containerOpacity = useTransform(scrollYProgress, [0, 0.08, 0.5, 0.65], [0, 1, 1, 0]);
  const textScale = useTransform(scrollYProgress, [0, 0.35, 0.6], [0.5, 1, 1.8]);
  const textOpacity = useTransform(scrollYProgress, [0.1, 0.3, 0.5, 0.65], [0, 1, 1, 0]);

  return (
    <section ref={containerRef} className="relative h-[120vh]">
      <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
        <motion.div style={{ opacity: containerOpacity }} className="absolute inset-0 flex items-center justify-center">
          {ITEMS.map((item, i) => (
            <Card key={i} src={item.src} label={item.label} index={i} spread={spread} cardScale={cardScale} />
          ))}
          <motion.div style={{ scale: textScale, opacity: textOpacity }} className="relative z-20 text-center px-6">
            <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(3rem,8vw,7rem)] font-medium tracking-[-0.04em] leading-[0.95] text-white mix-blend-difference">
              Your closet,<br />reimagined<span className="text-mint">.</span>
            </h2>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
