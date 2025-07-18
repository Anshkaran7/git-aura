"use client";
import React from "react";
import { useUser, SignInButton } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Theme } from "./types";

interface EmptyStateProps {
  selectedTheme: Theme;
  onLoadProfile: (username: string) => void;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  selectedTheme,
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
    <div
      className={`text-center ${
        selectedTheme.name === "Light" ? "text-gray-600" : "text-gray-300"
      } mt-8 sm:mt-12 md:mt-16 lg:mt-20 font-mona-sans px-4 sm:px-6`}
    >
      {isSignedIn ? (
        <div className="max-w-4xl mx-auto">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">
            🎉
          </div>
          <h2
            className={`text-xl sm:text-2xl md:text-3xl font-bold mb-3 sm:mb-4 ${
              selectedTheme.name === "Light" ? "text-gray-800" : "text-gray-200"
            }`}
          >
            Welcome to GitAura!
          </h2>
          <p className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto leading-relaxed">
            Your GitHub activity is about to get a whole lot more exciting! 🚀
            <br className="hidden sm:block" />
            <span className="block sm:inline mt-2 sm:mt-0">
              Search for any GitHub username (including yours) to see their aura
              score!
            </span>
          </p>

          {/* Quick Load My Profile Button */}
          <div className="mb-4 sm:mb-6">
            <button
              onClick={handleQuickLoad}
              className={`px-4 py-2 sm:px-6 sm:py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation text-sm sm:text-base ${
                selectedTheme.name === "Light"
                  ? "bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 text-white"
                  : "bg-gradient-to-r from-green-600 to-blue-700 hover:from-green-700 hover:to-blue-800 text-white"
              }`}
            >
              🚀 Load My GitHub Profile
            </button>
          </div>
          <div
            className={`mx-auto max-w-xs sm:max-w-sm md:max-w-lg p-3 sm:p-4 rounded-lg border-2 border-dashed ${
              selectedTheme.name === "Light"
                ? "bg-blue-50 border-blue-200"
                : "bg-blue-900/20 border-blue-500/30"
            }`}
          >
            <h3
              className={`font-bold mb-2 text-sm sm:text-base ${
                selectedTheme.name === "Light"
                  ? "text-blue-700"
                  : "text-blue-300"
              }`}
            >
              💡 What's Aura?
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed">
              Aura points are calculated from your GitHub contributions,
              streaks, and consistency. Positive aura = coding hero 🦸‍♀️, negative
              aura = time to get back to coding! 😅
            </p>
          </div>
        </div>
      ) : (
        <div className="max-w-md mx-auto">
          <Search
            className={`h-12 w-12 sm:h-14 sm:w-14 md:h-16 md:w-16 mx-auto mb-3 sm:mb-4 ${
              selectedTheme.name === "Light" ? "opacity-40" : "opacity-30"
            }`}
          />
          <p className="text-base sm:text-lg">
            Enter a GitHub username to view their profile
          </p>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
