"use client";

import { useState } from "react";

export default function CopyButton({
  text,
  label = "Copy",
}: {
  text: string;
  label?: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch (err) {
      setCopied(false);
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={label}
      className="
        ml-2 flex items-center justify-center
        w-9 h-9 rounded-full
        bg-gray-200 hover:bg-gray-300
        dark:bg-gray-700 dark:hover:bg-gray-600
        transition
        relative
      "
      type="button"
    >
      {/* Double Rectangle Copy Icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={20}
        height={20}
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
        className="text-gray-600 dark:text-gray-200"
      >
        <rect x="9" y="9" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
        <rect x="5" y="5" width="8" height="8" rx="2" stroke="currentColor" strokeWidth="2" />
      </svg>
      {copied && (
        <span className="absolute left-1/2 top-full -translate-x-1/2 mt-1 text-xs text-green-600 dark:text-green-400 whitespace-nowrap">
          Copied!
        </span>
      )}
    </button>
  );
}