"use client";

import { motion } from "framer-motion";
import { useUser, useClerk } from "@clerk/nextjs";
import { AuthGuard } from "@/components/auth-guard";
import { Button } from "@/components/ui/button";
import { Mail, User, Pencil } from "lucide-react";

function ProfileContent() {
  const { user } = useUser();
  const clerk = useClerk();

  const initials =
    user?.firstName?.[0] ??
    user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ??
    "?";

  return (
    <div className="min-h-screen pt-24 pb-20 px-6">
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <h1 className="font-[family-name:var(--font-playfair)] text-[clamp(2rem,4vw,3rem)] font-medium tracking-display leading-[1.1]">
            Profile<span className="text-mint">.</span>
          </h1>
          <p className="text-muted-foreground text-sm mt-2">
            Manage your account details.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="border border-border/50 rounded-lg bg-card/50 p-6"
        >
          {/* Avatar + Name */}
          <div className="flex items-center gap-4 mb-6">
            {user?.imageUrl ? (
              <img
                src={user.imageUrl}
                alt={user.fullName || "Avatar"}
                className="h-16 w-16 rounded-full object-cover"
              />
            ) : (
              <div className="h-16 w-16 rounded-full bg-card border border-border flex items-center justify-center text-lg font-medium">
                {initials}
              </div>
            )}
            <div>
              <h2 className="text-lg font-medium">
                {user?.fullName || user?.firstName || "User"}
              </h2>
              <p className="text-sm text-muted-foreground">
                Member since{" "}
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString("en-US", {
                      month: "long",
                      year: "numeric",
                    })
                  : "recently"}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-muted-foreground/50" />
                <div>
                  <p className="text-xs text-muted-foreground">Full name</p>
                  <p className="text-sm font-medium">
                    {user?.fullName || user?.firstName || "Not set"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-border/50">
              <div className="flex items-center gap-2.5">
                <Mail className="h-4 w-4 text-muted-foreground/50" />
                <div>
                  <p className="text-xs text-muted-foreground">Email</p>
                  <p className="text-sm font-medium">
                    {user?.emailAddresses?.[0]?.emailAddress || "Not set"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Edit button */}
          <div className="mt-6">
            <Button
              onClick={() => clerk.openUserProfile()}
              className="bg-foreground text-background hover:opacity-80"
            >
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit profile
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <AuthGuard>
      <ProfileContent />
    </AuthGuard>
  );
}
