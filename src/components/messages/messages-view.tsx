"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeftRight, Check, X, Inbox, Send, Loader2, Clock } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface SwapItem {
  id: string;
  title: string;
  imageUrl: string;
  askingPrice: number;
  brand: string;
  userName: string;
}

interface Swap {
  id: string;
  initiatorItemId: string;
  targetItemId: string;
  initiatorUserId: string;
  targetUserId: string;
  message: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  initiatorItem: SwapItem | null;
  targetItem: SwapItem | null;
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    pending: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    accepted: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    rejected: "bg-destructive/10 text-destructive border-destructive/20",
  };

  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded-full border ${
        styles[status] || "bg-muted text-muted-foreground border-border"
      }`}
    >
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

function SwapCard({
  swap,
  type,
  onAccept,
  onDecline,
  actionLoading,
}: {
  swap: Swap;
  type: "incoming" | "outgoing";
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  actionLoading: string | null;
}) {
  const leftItem = type === "incoming" ? swap.initiatorItem : swap.targetItem;
  const rightItem = type === "incoming" ? swap.targetItem : swap.initiatorItem;
  const leftLabel = type === "incoming" ? "Their item" : "Their item";
  const rightLabel = type === "incoming" ? "Your item" : "Your item";

  // For incoming, left is their offer, right is your item
  // For outgoing, left is their item (target), right is your item (initiator)
  const theirItem = type === "incoming" ? swap.initiatorItem : swap.targetItem;
  const yourItem = type === "incoming" ? swap.targetItem : swap.initiatorItem;

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="border border-border/50 rounded-lg p-4 bg-card/50"
    >
      {/* Items side by side */}
      <div className="flex items-center gap-3">
        {/* Their item */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground/60 mb-1.5">{leftLabel}</p>
          {theirItem && (
            <div className="flex items-center gap-2.5">
              <div className="h-14 w-14 rounded-sm overflow-hidden flex-shrink-0 relative bg-card">
                <Image
                  src={theirItem.imageUrl}
                  alt={theirItem.title}
                  fill
                  className="object-cover"
                  unoptimized={theirItem.imageUrl.startsWith("data:")}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{theirItem.title}</p>
                <p className="text-xs text-muted-foreground">${theirItem.askingPrice}</p>
              </div>
            </div>
          )}
        </div>

        {/* Arrow */}
        <div className="flex-shrink-0 px-2">
          <ArrowLeftRight className="h-4 w-4 text-muted-foreground/30" />
        </div>

        {/* Your item */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-muted-foreground/60 mb-1.5">{rightLabel}</p>
          {yourItem && (
            <div className="flex items-center gap-2.5">
              <div className="h-14 w-14 rounded-sm overflow-hidden flex-shrink-0 relative bg-card">
                <Image
                  src={yourItem.imageUrl}
                  alt={yourItem.title}
                  fill
                  className="object-cover"
                  unoptimized={yourItem.imageUrl.startsWith("data:")}
                />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium truncate">{yourItem.title}</p>
                <p className="text-xs text-muted-foreground">${yourItem.askingPrice}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Message */}
      {swap.message && (
        <div className="mt-3 px-3 py-2 bg-background/50 rounded-md border border-border/30">
          <p className="text-xs text-muted-foreground italic">&quot;{swap.message}&quot;</p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <StatusBadge status={swap.status} />
          <span className="text-[10px] text-muted-foreground/50 flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {timeAgo(swap.createdAt)}
          </span>
        </div>

        {type === "incoming" && swap.status === "pending" && (
          <div className="flex items-center gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onDecline(swap.id)}
              disabled={actionLoading === swap.id}
              className="h-7 px-2.5 text-xs border-border hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
            >
              <X className="h-3 w-3 mr-1" />
              Decline
            </Button>
            <Button
              size="sm"
              onClick={() => onAccept(swap.id)}
              disabled={actionLoading === swap.id}
              className="h-7 px-2.5 text-xs bg-foreground text-background hover:opacity-80"
            >
              {actionLoading === swap.id ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <Check className="h-3 w-3 mr-1" />
              )}
              Accept
            </Button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

function MessagesContent() {
  const { user } = useUser();
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchSwaps = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/swaps?userId=${user.id}`);
      if (res.ok) {
        const data = await res.json();
        setSwaps(data);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSwaps();
  }, [fetchSwaps]);

  const handleAction = async (swapId: string, status: "accepted" | "rejected") => {
    setActionLoading(swapId);
    try {
      const res = await fetch(`/api/swaps/${swapId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setSwaps((prev) =>
          prev.map((s) => (s.id === swapId ? { ...s, status } : s))
        );
      }
    } catch {
      // silent
    } finally {
      setActionLoading(null);
    }
  };

  const incoming = swaps.filter((s) => s.targetUserId === user?.id);
  const outgoing = swaps.filter((s) => s.initiatorUserId === user?.id);

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-3xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-display leading-[1.1]">
            Swap Requests<span className="text-mint">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            {loading ? "Loading..." : `${swaps.length} total ${swaps.length === 1 ? "request" : "requests"}`}
          </p>
        </motion.div>

        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse border border-border/30 rounded-lg p-4">
                <div className="flex items-center gap-3">
                  <div className="h-14 w-14 rounded-sm bg-border/30" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-border/30 rounded" />
                    <div className="h-2.5 w-1/4 bg-border/30 rounded" />
                  </div>
                  <div className="h-4 w-4 bg-border/30 rounded" />
                  <div className="h-14 w-14 rounded-sm bg-border/30" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-1/2 bg-border/30 rounded" />
                    <div className="h-2.5 w-1/4 bg-border/30 rounded" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Tabs defaultValue="incoming">
            <TabsList variant="line" className="mb-6">
              <TabsTrigger value="incoming" className="gap-1.5">
                <Inbox className="h-3.5 w-3.5" />
                Incoming
                {incoming.filter((s) => s.status === "pending").length > 0 && (
                  <span className="ml-1 text-[10px] bg-foreground text-background rounded-full h-4 min-w-4 flex items-center justify-center px-1">
                    {incoming.filter((s) => s.status === "pending").length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="outgoing" className="gap-1.5">
                <Send className="h-3.5 w-3.5" />
                Outgoing
              </TabsTrigger>
            </TabsList>

            <TabsContent value="incoming">
              <AnimatePresence mode="popLayout">
                {incoming.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Inbox className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      No incoming swap requests yet.
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {incoming.map((swap) => (
                      <SwapCard
                        key={swap.id}
                        swap={swap}
                        type="incoming"
                        onAccept={(id) => handleAction(id, "accepted")}
                        onDecline={(id) => handleAction(id, "rejected")}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>

            <TabsContent value="outgoing">
              <AnimatePresence mode="popLayout">
                {outgoing.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-20"
                  >
                    <Send className="h-10 w-10 mx-auto text-muted-foreground/20 mb-4" />
                    <p className="text-muted-foreground text-sm">
                      No outgoing swap requests. Browse the marketplace to propose swaps!
                    </p>
                  </motion.div>
                ) : (
                  <div className="space-y-3">
                    {outgoing.map((swap) => (
                      <SwapCard
                        key={swap.id}
                        swap={swap}
                        type="outgoing"
                        onAccept={(id) => handleAction(id, "accepted")}
                        onDecline={(id) => handleAction(id, "rejected")}
                        actionLoading={actionLoading}
                      />
                    ))}
                  </div>
                )}
              </AnimatePresence>
            </TabsContent>
          </Tabs>
        )}
      </div>
    </div>
  );
}

export function MessagesView() {
  return (
    <AuthGuard>
      <MessagesContent />
    </AuthGuard>
  );
}
