"use client";
import React from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Theme } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface EmptyStateProps {
  selectedTheme: Theme;
  onLoadProfile: (username: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  onLoadProfile,
}) => {
  const { isSignedIn } = useUser();


  const handleQuickLoad = () => {
    const myUsername = prompt("Enter your GitHub username:");
    if (myUsername) {
      onLoadProfile(myUsername);
    }
  };

  return (
    <div className="text-center text-muted-foreground mt-8 sm:mt-12 md:mt-16 lg:mt-20 font-mona-sans px-4 sm:px-6">
      {isSignedIn ? (
        <div className="max-w-4xl mx-auto">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🎉</div>
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 text-foreground">
            Welcome to GitAura!
          </h2>
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Your GitHub activity is about to get a whole lot more exciting! 🚀
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">
              Search for any GitHub username (including yours) to see their aura score!
            </span>
          </p>
          <div className="mb-4 sm:mb-6">
            <Button
              onClick={handleQuickLoad}
              size="lg"
              className="shadow-lg"
            >
              🚀 Load My GitHub Profile
            </Button>
          </div>
           <Card className="mx-auto max-w-xs sm:max-w-sm md:max-w-lg bg-card border-border">
            <CardHeader>
              <CardTitle className="font-bold text-sm sm:text-base text-primary">
                💡 What's Aura?
              </CardTitle>
            </CardHeader>
            <CardContent className="text-xs sm:text-sm leading-relaxed text-muted-foreground">
              Aura points are calculated from your GitHub contributions,
              streaks, and consistency. Positive aura = coding hero 🦸‍♀️, negative
              aura = time to get back to coding! 😅
            </CardContent>
          </Card>
        </div>
        ) : (
        <div className="max-w-md mx-auto">
          <Search className="h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 opacity-40" />
          <p className="text-base sm:text-lg">
            Enter a GitHub username to view their profile
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
