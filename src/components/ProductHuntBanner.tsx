"use client";

import { useState } from "react";
import { X } from "lucide-react";

/** Thin GitHub-style announcement bar. Renders in normal flow (not fixed) above the sticky header. */
export function ProductHuntBanner() {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="border-b border-border bg-accent-subtle text-sm text-foreground">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-2 sm:px-6">
        <p className="min-w-0 flex-1 truncate text-center">
          <span className="gh-label mr-2 border-transparent bg-done-subtle text-done">
            New
          </span>
          <span className="hidden sm:inline">GitAura is live on Product Hunt. </span>
          <a
            href="https://www.producthunt.com/posts/gitaura"
            target="_blank"
            rel="noopener noreferrer"
            className="gh-link font-medium"
          >
            Support us with your upvote
          </a>
        </p>
        <button
          type="button"
          onClick={() => setIsVisible(false)}
          aria-label="Dismiss announcement"
          className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
