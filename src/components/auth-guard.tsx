"use client";

import { useAuth, SignInButton } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Lock } from "lucide-react";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-2 border-foreground/20 border-t-foreground rounded-full animate-spin" />
      </div>
    );
  }

  if (!isSignedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <div className="h-14 w-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-5">
            <Lock className="h-6 w-6 text-muted-foreground" />
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-2xl font-medium tracking-display mb-2">
            Sign in to sell<span className="text-mint">.</span>
          </h2>
          <p className="text-sm text-muted-foreground mb-6">
            Create an account or sign in to list your items on the marketplace.
          </p>
          <SignInButton mode="modal">
            <Button className="bg-foreground text-background hover:opacity-80 px-8">
              Sign in
            </Button>
          </SignInButton>
        </motion.div>
      </div>
    );
  }

  return <>{children}</>;
}
