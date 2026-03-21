"use client";

import { useEffect, useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { getAvatarInitials, getGitHubAvatarFallback } from "@/lib/avatar";

interface UserAvatarProps {
  src?: string | null;
  githubUsername?: string | null;
  displayName?: string | null;
  alt?: string;
  className?: string;
  imageClassName?: string;
  initialsClassName?: string;
  size?: number;
}

export function UserAvatar({
  src,
  githubUsername,
  displayName,
  alt,
  className,
  imageClassName,
  initialsClassName,
  size = 200,
}: UserAvatarProps) {
  const fallbackSrc = useMemo(
    () => getGitHubAvatarFallback(githubUsername, size),
    [githubUsername, size]
  );
  const [currentSrc, setCurrentSrc] = useState(src || fallbackSrc);
  const [showInitials, setShowInitials] = useState(!src && !fallbackSrc);

  useEffect(() => {
    setCurrentSrc(src || fallbackSrc);
    setShowInitials(!src && !fallbackSrc);
  }, [fallbackSrc, src]);

  const initials = getAvatarInitials(displayName, githubUsername);

  return (
    <div
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted text-foreground",
        className
      )}
    >
      {!showInitials && currentSrc ? (
        <img
          src={currentSrc}
          alt={alt || displayName || githubUsername || "User avatar"}
          className={cn("h-full w-full object-cover", imageClassName)}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            if (currentSrc !== fallbackSrc && fallbackSrc) {
              setCurrentSrc(fallbackSrc);
              return;
            }

            setShowInitials(true);
          }}
        />
      ) : (
        <span
          className={cn(
            "text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground",
            initialsClassName
          )}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
