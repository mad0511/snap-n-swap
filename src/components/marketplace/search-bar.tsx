"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X } from "lucide-react";

interface SearchBarProps {
  onSearch: (query: string) => void;
}

export function SearchBar({ onSearch }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300);
    return () => clearTimeout(timer);
  }, [query, onSearch]);

  return (
    <div
      className={`relative flex items-center border rounded-md px-3.5 py-2.5 transition-colors duration-300 ${
        focused ? "border-foreground/30 bg-card" : "border-border bg-transparent"
      }`}
    >
      <Search className="h-4 w-4 text-muted-foreground/50 flex-shrink-0" />
      <input
        ref={inputRef}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search items, brands, categories..."
        className="flex-1 ml-2.5 bg-transparent text-sm placeholder:text-muted-foreground/40 focus:outline-none"
      />
      <AnimatePresence>
        {query && (
          <motion.button
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            onClick={() => {
              setQuery("");
              inputRef.current?.focus();
            }}
            className="p-0.5 hover:bg-muted rounded-sm transition-colors cursor-pointer"
          >
            <X className="h-3.5 w-3.5 text-muted-foreground" />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
