"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform, MotionValue } from "framer-motion";

const LINES = [
  { text: "Snap a photo.", accent: true },
  { text: "AI identifies it instantly.", accent: false },
  { text: "Set your price.", accent: true },
  { text: "Or find someone to swap with.", accent: false },
  { text: "Fashion gets a second life.", accent: true },
];

function RevealLine({ text, accent, index, total, scrollProgress }: {
  text: string; accent: boolean; index: number; total: number;
  scrollProgress: MotionValue<number>;
}) {
  const start = 0.05 + (index / total) * 0.5;
  const end = start + 0.1;
  const opacity = useTransform(scrollProgress, [start, end], [0.06, 1]);
  const x = useTransform(scrollProgress, [start, end], [-20, 0]);
  const blur = useTransform(scrollProgress, [start, end], [6, 0]);
  const filterVal = useTransform(blur, (v) => `blur(${v}px)`);

  return (
    <motion.p
      style={{ opacity, x, filter: filterVal }}
      className={`font-[family-name:var(--font-playfair)] text-[clamp(1.8rem,5vw,4rem)] font-medium tracking-display leading-[1.2] ${
        accent ? "text-foreground" : "text-muted-foreground/60"
      }`}
    >
      {text}
    </motion.p>
  );
}

export function TextRevealSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  return (
    <section ref={containerRef} className="relative py-14 md:py-20 px-6">
      <div className="mx-auto max-w-[1000px]">
        <p className="label-upper text-mint mb-10">The concept</p>
        <div className="space-y-2 md:space-y-3">
          {LINES.map((line, i) => (
            <RevealLine key={i} text={line.text} accent={line.accent} index={i} total={LINES.length} scrollProgress={scrollYProgress} />
          ))}
        </div>
      </div>
    </section>
  );
}
