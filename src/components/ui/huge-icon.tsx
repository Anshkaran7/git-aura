"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import { cn } from "@/lib/utils";

interface HugeIconProps {
  icon: IconSvgElement;
  size?: number | string;
  color?: string;
  strokeWidth?: number;
  className?: string;
}

export function HugeIcon({
  icon,
  size = 18,
  color = "currentColor",
  strokeWidth = 1.7,
  className,
}: HugeIconProps) {
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      className={cn("shrink-0", className)}
    />
  );
}
