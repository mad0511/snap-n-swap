"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

const steps = [
  { number: "01", title: "Snap a photo", description: "Point your camera at any clothing item. One photo is all it takes." },
  { number: "02", title: "AI does the rest", description: "Brand, category, condition, and fair price — identified in seconds." },
  { number: "03", title: "Sell or swap", description: "List for sale or find someone to trade with. Both agree, done." },
];

export function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <section ref={ref} className="py-12 px-6">
      <div className="mx-auto max-w-[1400px]">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          className="mb-10"
        >
          <p className="label-upper text-mint mb-4">How it works</p>
          <h2 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3.5rem)] font-medium tracking-display leading-[1.1] max-w-lg">
            Three steps to a<br />lighter wardrobe<span className="text-mint">.</span>
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-border/30 rounded-lg overflow-hidden">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 40 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.15 + i * 0.12, ease: [0.76, 0, 0.24, 1] }}
              className="bg-background p-8 md:p-10 group"
            >
              <span className="font-mono text-xs text-muted-foreground/30">{step.number}</span>
              <h3 className="text-lg font-medium mt-5 mb-3 tracking-tight group-hover:text-mint transition-colors duration-500">
                {step.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
