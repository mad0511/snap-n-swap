"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useInView } from "framer-motion";

export function CtaBanner() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="py-24 px-6">
      <div className="mx-auto max-w-[1400px]">
        <div className="hr-accent mb-24" />

        <div className="max-w-2xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
            className="label-upper text-mint mb-6"
          >
            Ready?
          </motion.p>

          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.76, 0, 0.24, 1] }}
            className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,5vw,4rem)] font-medium tracking-display leading-[1.1] mb-6"
          >
            Give your wardrobe a second life<span className="text-mint">.</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-muted-foreground text-[15px] leading-relaxed mb-10"
          >
            Join thousands selling, swapping, and saving the planet one outfit at a time.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <Link
              href="/upload"
              className="inline-flex items-center justify-center bg-foreground text-background text-sm font-medium px-8 py-3.5 rounded-full hover:opacity-80 transition-opacity"
            >
              Get started — it&apos;s free
            </Link>
          </motion.div>
        </div>

        <div className="hr-accent mt-24" />
      </div>
    </section>
  );
}
