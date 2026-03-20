"use client";

// Lenis was causing scroll issues with dynamic content (marketplace loading, AnimatePresence).
// Using native CSS smooth-scroll instead (set in globals.css on html element).
// This component is kept as a no-op to avoid breaking the layout import.

export function SmoothScroll() {
  return null;
}
