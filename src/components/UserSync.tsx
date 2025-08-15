"use client"; // This is now a Client Component

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs"; // We use the client-side hook

export default function UserSync() {
  const { isSignedIn, isLoaded } = useUser();

  useEffect(() => {
    // This function runs only on the client
    const syncUser = async () => {
      // Wait until Clerk is loaded and the user is signed in
      if (isLoaded && isSignedIn) {
        try {
          // Call our new API route to perform the secure sync
          await fetch('/api/sync-user', { method: 'POST' });
        } catch (error) {
          console.error("Failed to trigger user sync:", error);
        }
      }
    };

    syncUser();
    // This effect will re-run if the user's sign-in state changes
  }, [isSignedIn, isLoaded]);

  // This component does not render anything visible
  return null;
}