"use client";

import { useState, useEffect } from "react";

export default function ProfileCopyRows({ username }: { username: string }) {
  const [absoluteUrl, setAbsoluteUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && username) {
      const origin = window.location.origin;
      setAbsoluteUrl(
        new URL(`/${encodeURIComponent(username)}`, origin).toString()
      );
    }
  }, [username]);

  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(absoluteUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch (err) {
      console.error("Clipboard copy failed:", err);
    }
  };

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between p-2 bg-gray-100 dark:bg-gray-800 rounded">
        <span className="truncate">{absoluteUrl}</span>
        <button
          onClick={handleCopy}
          className="
            flex items-center justify-center 
            w-12 h-12 
            rounded-full 
            bg-gray-200 hover:bg-gray-300 
            dark:bg-gray-700 dark:hover:bg-gray-600
            transition
            relative
          "
          aria-label={copied ? "Copied!" : "Copy"}
        >
          {/* Double Rectangle Copy Icon SVG - style changes in dark mode */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={28}
            height={28}
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
            <span className="absolute left-1/2 top-full -translate-x-1/2 mt-2 text-xs text-green-600 dark:text-green-400 animate-fade">
              Copied!
            </span>
          )}
        </button>
      </div>
    </div>
  );
}