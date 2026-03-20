"use client";

import { useRef, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform, useMotionValue, useSpring } from "framer-motion";

const HERO_IMAGES = [
  { src: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=600&h=800&fit=crop", alt: "Leather jacket" },
  { src: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&h=800&fit=crop", alt: "Sneakers" },
  { src: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600&h=800&fit=crop", alt: "Dress" },
];

function MagneticButton({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouse = (e: React.MouseEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    x.set((e.clientX - (rect.left + rect.width / 2)) * 0.3);
    y.set((e.clientY - (rect.top + rect.height / 2)) * 0.3);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className="inline-flex items-center justify-center bg-foreground text-background text-[13px] font-medium px-7 py-3 rounded-full hover:opacity-80 transition-opacity"
    >
      {children}
    </motion.a>
  );
}

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });
  const textOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);
  const textY = useTransform(scrollYProgress, [0, 0.4], [0, 60]);
  const imgY1 = useTransform(scrollYProgress, [0, 1], [0, -60]);
  const imgY2 = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const imgY3 = useTransform(scrollYProgress, [0, 1], [0, -90]);

  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <section ref={containerRef} className="relative h-[100svh] overflow-hidden">
      {/* Right side: product images in a tight, intentional composition */}
      <div className="absolute top-14 right-0 bottom-0 w-[55%] hidden lg:flex gap-3 p-4 pr-6">
        {/* Column 1 — tall image */}
        <motion.div
          style={{ y: imgY1 }}
          initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
          animate={loaded ? { opacity: 1, clipPath: "inset(0% 0 0 0)" } : {}}
          transition={{ duration: 1, delay: 0.4, ease: [0.76, 0, 0.24, 1] }}
          className="relative flex-1 rounded-sm overflow-hidden mt-8"
        >
          <Image
            src={HERO_IMAGES[0].src}
            alt={HERO_IMAGES[0].alt}
            fill
            className="object-cover"
            sizes="20vw"
            priority
          />
        </motion.div>

        {/* Column 2 — two stacked images */}
        <div className="flex-1 flex flex-col gap-3">
          <motion.div
            style={{ y: imgY2 }}
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={loaded ? { opacity: 1, clipPath: "inset(0% 0 0 0)" } : {}}
            transition={{ duration: 1, delay: 0.55, ease: [0.76, 0, 0.24, 1] }}
            className="relative flex-1 rounded-sm overflow-hidden"
          >
            <Image
              src={HERO_IMAGES[1].src}
              alt={HERO_IMAGES[1].alt}
              fill
              className="object-cover"
              sizes="20vw"
            />
          </motion.div>
          <motion.div
            style={{ y: imgY3 }}
            initial={{ opacity: 0, clipPath: "inset(100% 0 0 0)" }}
            animate={loaded ? { opacity: 1, clipPath: "inset(0% 0 0 0)" } : {}}
            transition={{ duration: 1, delay: 0.7, ease: [0.76, 0, 0.24, 1] }}
            className="relative flex-[0.7] rounded-sm overflow-hidden"
          >
            <Image
              src={HERO_IMAGES[2].src}
              alt={HERO_IMAGES[2].alt}
              fill
              className="object-cover"
              sizes="20vw"
            />
          </motion.div>
        </div>
      </div>

      {/* Text — left side, vertically centered */}
      <motion.div
        style={{ opacity: textOpacity, y: textY }}
        className="relative z-10 h-full flex items-center px-6"
      >
        <div className="max-w-[1400px] w-full mx-auto">
          <div className="max-w-[480px]">
            {/* Eyebrow */}
            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="label-upper text-mint mb-6"
            >
              The fashion marketplace
            </motion.p>

            {/* Headline — each line reveals up */}
            <h1 className="mb-8">
              {["Snap it.", "List it.", "Swap it."].map((phrase, i) => (
                <span key={i} className="block overflow-hidden">
                  <motion.span
                    initial={{ y: "110%" }}
                    animate={{ y: "0%" }}
                    transition={{
                      duration: 0.9,
                      delay: 0.25 + i * 0.12,
                      ease: [0.76, 0, 0.24, 1],
                    }}
                    className="block font-[family-name:var(--font-playfair)] text-[clamp(2.8rem,6vw,5.2rem)] font-normal tracking-[-0.03em] leading-[1.08]"
                  >
                    {phrase}
                  </motion.span>
                </span>
              ))}
            </h1>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.85 }}
              className="text-[15px] leading-relaxed text-muted-foreground mb-8 max-w-[360px]"
            >
              Photograph your clothes. AI identifies the brand, condition, and fair
              price. Sell or swap in seconds.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="flex items-center gap-5"
            >
              <MagneticButton href="/upload">Start selling</MagneticButton>
              <Link
                href="/marketplace"
                className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors border-b border-muted-foreground/30 hover:border-foreground/50 pb-0.5"
              >
                Browse marketplace
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.div>

      {/* Bottom stats row */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="absolute bottom-0 left-0 right-0 z-10 px-6 pb-6"
      >
        <div className="max-w-[1400px] mx-auto">
          <div className="h-px bg-border mb-5" />
          <div className="flex items-center gap-10">
            {[
              { value: "10K+", label: "Items" },
              { value: "5.2K", label: "Swaps" },
              { value: "98%", label: "Satisfaction" },
            ].map((stat, i) => (
              <div key={i} className="flex items-baseline gap-2">
                <span className="font-mono text-sm tabular-nums">{stat.value}</span>
                <span className="text-[11px] text-muted-foreground/40">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
