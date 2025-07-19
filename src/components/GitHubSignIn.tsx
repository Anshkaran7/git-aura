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
      size="lg"
      className="w-full"
      onClick={signInWithGitHub}
      disabled={isLoading || !isLoaded}
    >
      {isLoading ? (
        <div className="flex items-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
          Connecting to GitHub...
        </div>
      ) : (
        <>
          <Github className="mr-2 h-5 w-5" />
          Continue with GitHub
        </>
      )}
    </Button>
  );
}
