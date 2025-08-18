"use client";

import { useState } from "react";
import { copyToClipboard } from "@/lib/copyToClipboard";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      const ok = await copyToClipboard(text);
      if (ok) {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } else {
        console.error("Clipboard copy failed");
        // optionally show error toast/alert here
      }
    } catch (err) {
      console.error("Clipboard copy error:", err);
      // optionally show error toast/alert here
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="px-3 py-1 bg-gray-700 text-white rounded hover:bg-gray-600"
      aria-label={label}
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
