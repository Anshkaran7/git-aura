"use client";
import { useSignIn } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";

export function GitHubSignIn() {
  const { signIn, isLoaded } = useSignIn();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const signInWithGitHub = async () => {
    if (!isLoaded) return;

    try {
      setIsLoading(true);
      const result = await signIn.authenticateWithRedirect({
        strategy: "oauth_github",
        redirectUrl: "/sso-callback",
        redirectUrlComplete: "/",
      });
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="default"
      className="w-full"
      onClick={signInWithGitHub}
      disabled={isLoading || !isLoaded}
    >
      {isLoading ? (
        <>
          <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
          Connecting to GitHub...
        </>
      ) : (
        <>
          <Github />
          Continue with GitHub
        </>
      )}
    </Button>
  );
}
