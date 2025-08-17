// src/components/ui/CopyButton.tsx
"use client";

import { useState } from "react";

export default function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <button
      onClick={handleCopy}
      className="ml-2 px-3 py-1 text-sm rounded bg-gray-200 hover:bg-gray-300"
    >
      {copied ? "Copied!" : label}
    </button>
  );
}
