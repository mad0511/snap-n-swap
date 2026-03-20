"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ArrowLeftRight } from "lucide-react";
import type { MockItem } from "@/lib/mock-data";

interface ItemCardProps {
  item: MockItem;
  index: number;
  featured?: boolean;
}

export function ItemCard({ item, index, featured }: ItemCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.6,
        delay: Math.min(index * 0.05, 0.4),
        ease: [0.76, 0, 0.24, 1],
      }}
      layout
      className=""
    >
      <Link href={`/item/${item.id}`} className="group block">
        {/* Image */}
        <div
          className="relative overflow-hidden rounded-sm bg-card aspect-[3/4]"
        >
          <Image
            src={item.imageUrl}
            alt={item.title}
            fill
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            sizes="25vw"
            unoptimized={item.imageUrl.startsWith("data:")}
          />

          {/* Condition badge — top left, minimal */}
          <span className="absolute top-2.5 left-2.5 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-sm">
            {item.condition}
          </span>

          {/* Views — top right */}
          <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 flex items-center gap-1">
            <Eye className="h-3 w-3" />
            {item.views}
          </span>

          {/* Hover actions — slide up */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] p-3">
            <div className="flex gap-1.5">
              <span
                onClick={(e) => e.preventDefault()}
                className="flex-1 text-center text-xs font-medium bg-white text-black py-2 rounded-sm hover:bg-white/90 transition-colors"
              >
                Buy — ${item.askingPrice}
              </span>
              <span
                onClick={(e) => e.preventDefault()}
                className="flex items-center justify-center bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-sm hover:bg-white/30 transition-colors"
              >
                <ArrowLeftRight className="h-3.5 w-3.5" />
              </span>
            </div>
          </div>
        </div>

        {/* Info — minimal, below image */}
        <div className="mt-2.5">
          <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
            {item.brand}
          </p>
          <div className="flex items-baseline justify-between mt-0.5">
            <p className="text-sm font-medium line-clamp-1 pr-3">{item.title}</p>
            <p className="font-mono text-sm tabular-nums flex-shrink-0">
              ${item.askingPrice}
            </p>
          </div>
          {item.size && (
            <p className="text-[11px] text-muted-foreground/40 mt-0.5">
              Size {item.size}
            </p>
          )}
        </div>
      </Link>
    </motion.div>
  );
}
