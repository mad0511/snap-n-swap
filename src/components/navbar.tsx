"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  UserButton,
  useAuth,
} from "@clerk/nextjs";
import { Camera, ArrowLeftRight } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/upload", label: "Sell" },
  { href: "/swaps", label: "Swaps" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();

  return (
    <motion.header
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
    >
      <div className="mx-auto max-w-[1400px] px-6">
        <div className="flex h-14 items-center justify-between">
          {/* Logo — typographic, no icon */}
          <Link href="/" className="flex items-baseline gap-0.5 group">
            <span className="text-[15px] font-medium tracking-tight">
              snap
            </span>
            <span className="text-mint text-[15px] font-medium">&apos;</span>
            <span className="text-[15px] font-medium tracking-tight">n</span>
            <span className="text-mint text-[15px] font-medium">&apos;</span>
            <span className="text-[15px] font-medium tracking-tight">swap</span>
          </Link>

          {/* Nav Links — minimal */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => {
              const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={cn(
                    "relative text-[13px] font-medium tracking-wide uppercase transition-colors duration-300",
                    isActive
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {link.label}
                  {isActive && (
                    <motion.span
                      layoutId="nav-underline"
                      className="absolute -bottom-[18px] left-0 right-0 h-px bg-foreground"
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {!isSignedIn ? (
              <>
                <SignInButton mode="modal">
                  <button className="text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                    Sign in
                  </button>
                </SignInButton>
                <SignUpButton mode="modal">
                  <button className="text-[13px] font-medium bg-foreground text-background px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
                    Get started
                  </button>
                </SignUpButton>
              </>
            ) : (
              <>
                <Link
                  href="/upload"
                  className="text-[13px] font-medium bg-foreground text-background px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity flex items-center gap-1.5"
                >
                  <Camera className="h-3.5 w-3.5" />
                  Sell
                </Link>
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "h-7 w-7",
                    },
                  }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
}
