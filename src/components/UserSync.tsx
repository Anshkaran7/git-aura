"use client"; // This is now a Client Component

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs"; // We use the client-side hook

export default function UserSync() {
  const { isSignedIn, isLoaded, user } = useUser();

  useEffect(() => {
    // This function runs only on the client
    const syncUser = async () => {
      // Wait until Clerk is loaded and the user is signed in
      if (isLoaded && isSignedIn && user) {
        try {
          // Call our new API route to perform the secure sync
          await fetch('/api/sync-user', { 
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              githubUsername: user.username,
              displayName: user.fullName || user.firstName || user.username,
              avatarUrl: user.imageUrl,
            })
          });
        } catch (error) {
          console.error("Failed to trigger user sync:", error);
        }
      }
    };

    syncUser();
    // This effect will re-run if the user's sign-in state changes
  }, [isSignedIn, isLoaded, user]);

  // This component does not render anything visible
  return null;
}