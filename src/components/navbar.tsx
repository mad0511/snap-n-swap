"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import {
  SignInButton,
  SignUpButton,
  useAuth,
  useUser,
  useClerk,
} from "@clerk/nextjs";
import { Camera, Menu, X, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

const navLinks = [
  { href: "/marketplace", label: "Marketplace" },
  { href: "/upload", label: "Sell" },
  { href: "/messages", label: "Swaps" },
];

export function Navbar() {
  const pathname = usePathname();
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const clerk = useClerk();
  const [mobileOpen, setMobileOpen] = useState(false);

  const initials = user?.firstName?.[0] ?? user?.emailAddresses?.[0]?.emailAddress?.[0]?.toUpperCase() ?? "?";

  return (
    <>
      <motion.header
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl"
      >
        <div className="mx-auto max-w-[1400px] px-6">
          <div className="flex h-14 items-center justify-between">
            {/* Logo */}
            <Link href="/" className="flex items-baseline gap-0.5 group">
              <span className="text-[15px] font-medium tracking-tight">snap</span>
              <span className="text-mint text-[15px] font-medium">&apos;</span>
              <span className="text-[15px] font-medium tracking-tight">n</span>
              <span className="text-mint text-[15px] font-medium">&apos;</span>
              <span className="text-[15px] font-medium tracking-tight">swap</span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      "relative text-[13px] font-medium tracking-wide uppercase transition-colors duration-300",
                      isActive ? "text-foreground" : "text-muted-foreground hover:text-foreground"
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
                    <button className="hidden sm:block text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button className="hidden sm:block text-[13px] font-medium bg-foreground text-background px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity cursor-pointer">
                      Get started
                    </button>
                  </SignUpButton>
                </>
              ) : (
                <>
                  <Link
                    href="/upload"
                    className="hidden sm:flex text-[13px] font-medium bg-foreground text-background px-4 py-1.5 rounded-full hover:opacity-80 transition-opacity items-center gap-1.5"
                  >
                    <Camera className="h-3.5 w-3.5" />
                    Sell
                  </Link>

                  <DropdownMenu>
                    <DropdownMenuTrigger className="outline-none cursor-pointer">
                      {user?.imageUrl ? (
                        <img
                          src={user.imageUrl}
                          alt={user.fullName || "Avatar"}
                          className="h-7 w-7 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-7 w-7 rounded-full bg-card border border-border flex items-center justify-center text-xs font-medium">
                          {initials}
                        </div>
                      )}
                    </DropdownMenuTrigger>

                    <DropdownMenuContent align="end" sideOffset={8} className="bg-card border-border min-w-[200px]">
                      <DropdownMenuLabel className="px-2 py-1.5">
                        <p className="text-sm font-medium truncate">{user?.fullName || user?.firstName || "User"}</p>
                        <p className="text-xs text-muted-foreground truncate mt-0.5">
                          {user?.emailAddresses?.[0]?.emailAddress}
                        </p>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => window.location.href = "/my-listings"}>
                        My Listings
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/messages"}>
                        Swap Requests
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => window.location.href = "/profile"}>
                        Edit Profile
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => clerk.signOut()}
                      >
                        <LogOut className="h-4 w-4 mr-1.5" />
                        Sign out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              )}

              {/* Mobile hamburger */}
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                className="md:hidden p-1 text-foreground cursor-pointer"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </motion.header>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-x-0 top-14 z-40 bg-background border-b border-border/50 md:hidden"
          >
            <nav className="flex flex-col px-6 py-4 gap-1">
              {navLinks.map((link) => {
                const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "text-sm font-medium py-3 px-3 rounded-md transition-colors",
                      isActive
                        ? "text-foreground bg-muted"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {link.label}
                  </Link>
                );
              })}

              {isSignedIn ? (
                <div className="mt-3 pt-3 border-t border-border/50 flex flex-col gap-1">
                  <Link
                    href="/my-listings"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium py-3 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    My Listings
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium py-3 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Swap Requests
                  </Link>
                  <Link
                    href="/profile"
                    onClick={() => setMobileOpen(false)}
                    className="text-sm font-medium py-3 px-3 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
                  >
                    Edit Profile
                  </Link>
                  <button
                    onClick={() => {
                      clerk.signOut();
                      setMobileOpen(false);
                    }}
                    className="text-sm font-medium py-3 px-3 rounded-md text-destructive hover:bg-destructive/10 transition-colors text-left cursor-pointer"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <div className="flex gap-3 mt-3 pt-3 border-t border-border/50">
                  <SignInButton mode="modal">
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-sm font-medium py-2.5 rounded-md border border-border text-center cursor-pointer"
                    >
                      Sign in
                    </button>
                  </SignInButton>
                  <SignUpButton mode="modal">
                    <button
                      onClick={() => setMobileOpen(false)}
                      className="flex-1 text-sm font-medium py-2.5 rounded-full bg-foreground text-background text-center cursor-pointer"
                    >
                      Get started
                    </button>
                  </SignUpButton>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
