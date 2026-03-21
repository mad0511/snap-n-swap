"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Eye, ArrowLeftRight, Pencil } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import type { MockItem } from "@/lib/mock-data";
import { SwapModal } from "@/components/item/swap-modal";

interface ItemCardProps {
  item: MockItem & { clerkUserId?: string };
  index: number;
  featured?: boolean;
}

export function ItemCard({ item, index }: ItemCardProps) {
  const { user } = useUser();
  const isOwn = user?.id && (item as { clerkUserId?: string }).clerkUserId === user.id;
  const [swapOpen, setSwapOpen] = useState(false);

  return (
    <>
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
      >
        <Link href={`/item/${item.id}`} className="group block">
          <div className="relative overflow-hidden rounded-sm bg-card aspect-[3/4]">
            <Image
              src={item.imageUrl}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
              sizes="25vw"
              unoptimized={item.imageUrl.startsWith("data:")}
            />

            {/* Condition badge */}
            <span className="absolute top-2.5 left-2.5 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-sm">
              {item.condition}
            </span>

            {/* Views */}
            <span className="absolute top-2.5 right-2.5 text-[10px] font-mono text-white/50 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {item.views}
            </span>

            {/* Own item badge */}
            {isOwn && (
              <span className="absolute bottom-2.5 left-2.5 text-[10px] font-medium bg-mint/80 text-black px-2 py-0.5 rounded-sm">
                Your listing
              </span>
            )}

            {/* Hover actions */}
            <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-[cubic-bezier(0.76,0,0.24,1)] p-3">
              {isOwn ? (
                <span
                  onClick={(e) => {
                    e.preventDefault();
                    window.location.href = `/edit/${item.id}`;
                  }}
                  className="flex items-center justify-center gap-1.5 w-full text-xs font-medium bg-white text-black py-2 rounded-sm hover:bg-white/90 transition-colors cursor-pointer"
                >
                  <Pencil className="h-3 w-3" />
                  Edit listing
                </span>
              ) : (
                <div className="flex gap-1.5">
                  <span
                    onClick={(e) => e.preventDefault()}
                    className="flex-1 text-center text-xs font-medium bg-white text-black py-2 rounded-sm hover:bg-white/90 transition-colors"
                  >
                    Buy — ${item.askingPrice}
                  </span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSwapOpen(true);
                    }}
                    className="flex items-center justify-center bg-white/20 backdrop-blur-sm text-white px-3 py-2 rounded-sm hover:bg-white/30 transition-colors cursor-pointer"
                  >
                    <ArrowLeftRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Info */}
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

      {/* Swap modal — opens directly from marketplace card */}
      <SwapModal
        isOpen={swapOpen}
        onClose={() => setSwapOpen(false)}
        targetItem={item}
      />
    </>
  );
}
