// src/components/ui/ProfileCopyRows.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import CopyButton from "@/components/ui/CopyButton";  // ✅ default import

export default function ProfileCopyRows({ username }: { username: string }) {
  const pathname = usePathname();
  const [absoluteUrl, setAbsoluteUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const origin = window.location.origin;
      setAbsoluteUrl(origin + (pathname || `/`));
    }
  }, [pathname]);

  return (
    <div className="space-y-3">
      <div className="flex items-center">
        <h1 className="text-xl font-semibold">{username}</h1>
        <CopyButton text={username} label="Copy username" />
      </div>

      <div className="flex items-center">
        <span className="text-sm text-gray-600 break-all">{absoluteUrl}</span>
        {absoluteUrl && (
          <CopyButton text={absoluteUrl} label="Copy profile URL" />
        )}
      </div>
    </div>
  );
}
