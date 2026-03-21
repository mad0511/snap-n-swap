"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowLeftRight, Check, Loader2, Package } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { MockItem } from "@/lib/mock-data";

interface SwapModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetItem: MockItem;
}

export function SwapModal({ isOpen, onClose, targetItem }: SwapModalProps) {
  const { user } = useUser();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [myItems, setMyItems] = useState<MockItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch user's own swappable items from Supabase
  useEffect(() => {
    if (!isOpen) return;
    setLoading(true);
    fetch(`/api/items/swappable${user?.id ? `?excludeUser=${user.id}` : ""}`)
      .then((res) => res.json())
      .then((data: MockItem[]) => {
        // Exclude the target item
        setMyItems(data.filter((i) => i.id !== targetItem.id));
      })
      .catch(() => setMyItems([]))
      .finally(() => setLoading(false));
  }, [isOpen, targetItem.id]);

  const handleSubmit = async () => {
    if (!selectedItem) return;
    setSubmitted(true);

    try {
      await fetch("/api/swaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          initiatorItemId: selectedItem,
          targetItemId: targetItem.id,
          initiatorUserId: user?.id || "unknown",
          targetUserId: (targetItem as MockItem & { clerkUserId?: string }).clerkUserId || "unknown",
          message: message || null,
        }),
      });
    } catch {
      // silent
    }

    setTimeout(() => {
      onClose();
      setSubmitted(false);
      setSelectedItem(null);
      setMessage("");
    }, 2000);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg bg-background border-border max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-medium">
            Propose a swap
          </DialogTitle>
        </DialogHeader>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-12 text-center"
          >
            <div className="h-12 w-12 rounded-full bg-mint/10 flex items-center justify-center mx-auto mb-4">
              <Check className="h-6 w-6 text-mint" />
            </div>
            <p className="font-medium">Swap proposed!</p>
            <p className="text-sm text-muted-foreground mt-1">
              You&apos;ll be notified when they respond.
            </p>
          </motion.div>
        ) : (
          <div className="space-y-5 pt-2">
            {/* Target item */}
            <div className="flex items-center gap-3 p-3 bg-card rounded-md border border-border/50">
              <div className="h-12 w-12 rounded-sm overflow-hidden flex-shrink-0 relative">
                <Image
                  src={targetItem.imageUrl}
                  alt={targetItem.title}
                  fill
                  className="object-cover"
                  unoptimized={targetItem.imageUrl.startsWith("data:")}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">Their item</p>
                <p className="text-sm font-medium truncate">{targetItem.title}</p>
              </div>
              <p className="font-mono text-sm tabular-nums">${targetItem.askingPrice}</p>
            </div>

            <div className="flex items-center justify-center">
              <ArrowLeftRight className="h-4 w-4 text-muted-foreground/30" />
            </div>

            {/* Select your item */}
            <div>
              <p className="text-xs text-muted-foreground mb-2.5">Select your item</p>

              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                </div>
              ) : myItems.length === 0 ? (
                <div className="text-center py-8">
                  <Package className="h-8 w-8 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-sm text-muted-foreground">
                    No items to swap. List an item first.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {myItems.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setSelectedItem(item.id)}
                      className={`relative aspect-[3/4] rounded-sm overflow-hidden cursor-pointer transition-all duration-300 ${
                        selectedItem === item.id
                          ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                          : "opacity-60 hover:opacity-100"
                      }`}
                    >
                      <Image
                        src={item.imageUrl}
                        alt={item.title}
                        fill
                        className="object-cover"
                        unoptimized={item.imageUrl.startsWith("data:")}
                      />
                      {selectedItem === item.id && (
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Message */}
            <div>
              <p className="text-xs text-muted-foreground mb-1.5">
                Message (optional)
              </p>
              <Textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={2}
                placeholder="Hey! Interested in swapping..."
                className="bg-card border-border resize-none text-sm"
              />
            </div>

            <Button
              onClick={handleSubmit}
              disabled={!selectedItem}
              className="w-full bg-foreground text-background hover:opacity-80 disabled:opacity-30"
            >
              Propose swap
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
