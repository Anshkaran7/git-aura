"use client";

import { useState, useEffect } from "react";

export default function ProfileCopyRows({ username }: { username: string }) {
  const [absoluteUrl, setAbsoluteUrl] = useState<string>("");

  useEffect(() => {
    if (typeof window !== "undefined" && username) {
      const origin = window.location.origin;
      // Always build the profile URL from username, not from pathname
      setAbsoluteUrl(
        new URL(`/${encodeURIComponent(username)}`, origin).toString()
      );
    }
  }, [username]);

  return (
    <div className="flex flex-col space-y-2">
      <div className="flex items-center justify-between p-2 bg-gray-100 rounded">
        <span className="truncate">{absoluteUrl}</span>
        <button
          onClick={() => navigator.clipboard.writeText(absoluteUrl)}
          className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Copy
        </button>
      </div>
    </div>
  );
}
