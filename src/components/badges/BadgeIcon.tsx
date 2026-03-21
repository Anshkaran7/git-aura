"use client";

import { cn } from "@/lib/utils";

interface BadgeIconProps {
  icon: string;
  name: string;
  className?: string;
  imageClassName?: string;
  fallbackClassName?: string;
}

function isBadgeImage(icon: string) {
  return icon.startsWith("/badge/") || icon.startsWith("http://") || icon.startsWith("https://");
}

export function BadgeIcon({
  icon,
  name,
  className,
  imageClassName,
  fallbackClassName,
}: BadgeIconProps) {
  if (isBadgeImage(icon)) {
    return (
      <span className={cn("inline-flex items-center justify-center", className)}>
        <img
          src={icon}
          alt={name}
          className={cn("h-full w-full object-contain", imageClassName)}
        />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex items-center justify-center", className, fallbackClassName)}>
      {icon || "★"}
    </span>
  );
}
