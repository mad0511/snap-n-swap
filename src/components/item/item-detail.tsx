"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Eye, ArrowLeftRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SwapModal } from "./swap-modal";
import type { MockItem } from "@/lib/mock-data";

interface ItemDetailProps {
  item: MockItem;
  relatedItems: MockItem[];
}

export function ItemDetail({ item, relatedItems }: ItemDetailProps) {
  const [swapOpen, setSwapOpen] = useState(false);

  const handleBuy = async () => {
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          title: item.title,
          price: item.askingPrice,
          imageUrl: item.imageUrl,
        }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      // Stripe not configured — show feedback
      alert("Stripe not configured yet. Add STRIPE_SECRET_KEY to .env.local");
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-20">
      {/* Back nav */}
      <div className="px-6 max-w-[1400px] mx-auto mb-6">
        <Link
          href="/marketplace"
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to marketplace
        </Link>
      </div>

      {/* Main content */}
      <div className="px-6 max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Image — left, sticky */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: [0.76, 0, 0.24, 1] }}
            className="lg:col-span-7 lg:sticky lg:top-20 lg:self-start"
          >
            <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
              <Image
                src={item.imageUrl}
                alt={item.title}
                fill
                className="object-cover"
                sizes="60vw"
                priority
                unoptimized={item.imageUrl.startsWith("data:")}
              />
              <span className="absolute top-3 left-3 text-[10px] font-medium bg-black/50 backdrop-blur-sm text-white/90 px-2 py-0.5 rounded-sm">
                {item.condition}
              </span>
            </div>
          </motion.div>

          {/* Details — right */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="lg:col-span-5"
          >
            <p className="label-upper mb-3">{item.brand}</p>

            <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(1.75rem,3vw,2.5rem)] font-medium tracking-display leading-[1.1] mb-6">
              {item.title}
            </h1>

            {/* Price */}
            <div className="mb-8">
              <p className="font-mono text-2xl font-medium tabular-nums">
                ${item.askingPrice}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                AI estimated at ${item.estimatedPrice}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 mb-8">
              <Button
                onClick={handleBuy}
                className="flex-1 bg-foreground text-background hover:opacity-80 py-3"
              >
                Buy now
              </Button>
              <Button
                variant="outline"
                onClick={() => setSwapOpen(true)}
                className="px-4 py-3"
              >
                <ArrowLeftRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="hr-accent mb-8" />

            {/* Details grid */}
            <div className="space-y-3 mb-8">
              {[
                { label: "Category", value: item.category },
                { label: "Size", value: item.size },
                { label: "Color", value: item.color },
                { label: "Condition", value: item.condition },
              ].map((d) => (
                <div
                  key={d.label}
                  className="flex items-center justify-between py-1.5"
                >
                  <span className="text-xs text-muted-foreground">{d.label}</span>
                  <span className="text-sm font-medium">{d.value}</span>
                </div>
              ))}
            </div>

            {/* Description */}
            <div className="mb-8">
              <p className="text-xs text-muted-foreground mb-2">Description</p>
              <p className="text-sm leading-relaxed text-foreground/80">
                {item.description}
              </p>
            </div>

            <div className="hr-accent mb-8" />

            {/* Seller */}
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src={item.userImage} />
                <AvatarFallback>{item.userName[0]}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium">{item.userName}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <Eye className="h-3 w-3" />
                  {item.views} views
                </p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Related items */}
        {relatedItems.length > 0 && (
          <div className="mt-24">
            <div className="hr-accent mb-12" />
            <p className="label-upper text-mint mb-6">You might also like</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {relatedItems.map((related) => (
                <Link
                  key={related.id}
                  href={`/item/${related.id}`}
                  className="group block"
                >
                  <div className="relative aspect-[3/4] rounded-sm overflow-hidden bg-card">
                    <Image
                      src={related.imageUrl}
                      alt={related.title}
                      fill
                      className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                      sizes="25vw"
                      unoptimized={related.imageUrl.startsWith("data:")}
                    />
                  </div>
                  <div className="mt-2">
                    <p className="text-[10px] font-medium tracking-[0.1em] uppercase text-muted-foreground/50">
                      {related.brand}
                    </p>
                    <div className="flex items-baseline justify-between mt-0.5">
                      <p className="text-sm font-medium line-clamp-1 pr-3">
                        {related.title}
                      </p>
                      <p className="font-mono text-sm tabular-nums flex-shrink-0">
                        ${related.askingPrice}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <SwapModal
        isOpen={swapOpen}
        onClose={() => setSwapOpen(false)}
        targetItem={item}
      />
    </div>
  );
}
