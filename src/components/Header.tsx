"use client";
import React from "react";
import { useUser, SignInButton, UserButton } from "@clerk/nextjs";
import { Search, Trophy, Target, LogIn } from "lucide-react";
import { Theme, ViewType } from "./types";
import { themes } from "./themes";
import { formatNumber, getAuraStatus } from "@/lib/utils2";

interface HeaderProps {
  selectedTheme: Theme;
  setSelectedTheme: (theme: Theme) => void;
  currentView: ViewType;
  setCurrentView: (view: ViewType) => void;
  userAura: number;
}

const Header: React.FC<HeaderProps> = ({
  selectedTheme,
  setSelectedTheme,
  currentView,
  setCurrentView,
  userAura,
}) => {
  const { isSignedIn, user } = useUser();

  return (
    <>
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 w-full sm:w-auto">
          <div className="flex-shrink-0">
            <h1
              className={`text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold ${
                selectedTheme.name === "Light"
                  ? "bg-gradient-to-r from-blue-600 to-purple-600"
                  : selectedTheme.name === "Ocean Dark"
                  ? "bg-gradient-to-r from-cyan-400 to-blue-500"
                  : "bg-gradient-to-r from-blue-400 to-purple-500"
              } bg-clip-text text-transparent font-mona-sans`}
            >
              GitAura
            </h1>
            <p
              className={`mt-0.5 text-xs sm:text-sm md:text-base ${
                selectedTheme.name === "Light"
                  ? "text-gray-600"
                  : "text-gray-300"
              } font-mona-sans max-w-xs sm:max-w-none`}
            >
              Beautiful GitHub profile visualization with aura system
            </p>
          </div>

          {/* Navigation */}
          <nav className="hidden lg:flex items-center gap-2 bg-opacity-50 backdrop-blur-sm rounded-xl p-1 border border-gray-200/50">
            <button
              onClick={() => setCurrentView("profile")}
              className={`px-3 py-2 xl:px-4 xl:py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 ${
                currentView === "profile"
                  ? "bg-blue-500 text-white shadow-lg"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:text-gray-800 hover:bg-white/70"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/70"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setCurrentView("leaderboard")}
              className={`px-3 py-2 xl:px-4 xl:py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center gap-1 ${
                currentView === "leaderboard"
                  ? "bg-blue-500 text-white shadow-lg"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:text-gray-800 hover:bg-white/70"
                  : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/70"
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span className="hidden xl:inline">Leaderboard</span>
              <span className="xl:hidden">Board</span>
            </button>
            {isSignedIn && (
              <button
                onClick={() => setCurrentView("badges")}
                className={`px-3 py-2 xl:px-4 xl:py-2 rounded-lg text-sm font-medium transition-all transform hover:scale-105 flex items-center gap-1 ${
                  currentView === "badges"
                    ? "bg-blue-500 text-white shadow-lg"
                    : selectedTheme.name === "Light"
                    ? "text-gray-600 hover:text-gray-800 hover:bg-white/70"
                    : "text-gray-400 hover:text-gray-200 hover:bg-gray-700/70"
                }`}
              >
                <Target className="w-4 h-4" />
                Badges
              </button>
            )}
          </nav>

          {/* Mobile & Tablet Navigation */}
          <div className="lg:hidden flex items-center gap-1 sm:gap-2 bg-opacity-50 backdrop-blur-sm rounded-lg p-1 border border-gray-200/50">
            <button
              onClick={() => setCurrentView("profile")}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg transition-all touch-manipulation flex items-center gap-1 ${
                currentView === "profile"
                  ? "bg-blue-500 text-white shadow-lg"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  : "text-gray-400 hover:bg-gray-700 active:bg-gray-600"
              }`}
              title="Profile"
            >
              <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs">Profile</span>
            </button>
            <button
              onClick={() => setCurrentView("leaderboard")}
              className={`p-2 sm:px-3 sm:py-2 rounded-lg transition-all touch-manipulation flex items-center gap-1 ${
                currentView === "leaderboard"
                  ? "bg-blue-500 text-white shadow-lg"
                  : selectedTheme.name === "Light"
                  ? "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                  : "text-gray-400 hover:bg-gray-700 active:bg-gray-600"
              }`}
              title="Leaderboard"
            >
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="hidden sm:inline text-xs">Board</span>
            </button>
            {isSignedIn && (
              <button
                onClick={() => setCurrentView("badges")}
                className={`p-2 sm:px-3 sm:py-2 rounded-lg transition-all touch-manipulation flex items-center gap-1 ${
                  currentView === "badges"
                    ? "bg-blue-500 text-white shadow-lg"
                    : selectedTheme.name === "Light"
                    ? "text-gray-600 hover:bg-gray-100 active:bg-gray-200"
                    : "text-gray-400 hover:bg-gray-700 active:bg-gray-600"
                }`}
                title="Badges"
              >
                <Target className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-xs">Badges</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
          {/* Authentication */}
          {isSignedIn ? (
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3">
              {userAura !== 0 && (
                <div
                  className={`flex items-center gap-2 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 rounded-lg sm:rounded-xl shadow-lg border-2 ${(() => {
                    const auraStatus = getAuraStatus(userAura);
                    if (selectedTheme.name === "Light") {
                      return userAura > 0
                        ? "bg-gradient-to-r from-green-100 to-blue-100 border-green-300 text-green-700"
                        : "bg-gradient-to-r from-red-100 to-orange-100 border-red-300 text-red-700";
                    } else {
                      return userAura > 0
                        ? "bg-gradient-to-r from-green-900/30 to-blue-900/30 border-green-500/30 text-green-300"
                        : "bg-gradient-to-r from-red-900/30 to-orange-900/30 border-red-500/30 text-red-300";
                    }
                  })()}`}
                >
                  <div className="text-sm sm:text-base md:text-lg">
                    {getAuraStatus(userAura).emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-xs sm:text-sm truncate">
                      {formatNumber(userAura)} Aura
                    </div>
                    <div className="text-xs opacity-75 truncate">
                      {getAuraStatus(userAura).level}
                    </div>
                  </div>
                </div>
              )}
              <UserButton
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10",
                  },
                }}
              />
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <SignInButton mode="modal">
                <button
                  className={`flex items-center justify-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium transition-all transform hover:scale-105 active:scale-95 shadow-lg touch-manipulation ${
                    selectedTheme.name === "Light"
                      ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
                      : "bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white"
                  }`}
                >
                  <LogIn className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
              </SignInButton>
            </div>
          )}

          <a
            href="https://github.com/anshkaran7/git-aura"
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center justify-center gap-1 sm:gap-2 px-2 py-1.5 sm:px-3 sm:py-1.5 rounded-lg shadow-sm transition-colors touch-manipulation ${
              selectedTheme.name === "Light"
                ? "bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-800"
                : "bg-gray-700 hover:bg-gray-600 active:bg-gray-500 text-gray-300"
            }`}
          >
            <img
              src="https://img.shields.io/github/stars/anshkaran7/git-aura?style=social"
              alt="GitHub Stars"
              className="h-4 sm:h-5 max-w-full"
            />
          </a>
        </div>
      </div>

      {/* Theme Selector */}
      <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4 md:mb-6">
        {themes.map((theme) => (
          <button
            key={theme.name}
            onClick={() => setSelectedTheme(theme)}
            className={`flex-1 min-w-0 sm:flex-none px-2 py-1.5 sm:px-3 sm:py-2 md:px-4 md:py-2 font-medium rounded-lg text-xs sm:text-sm md:text-base touch-manipulation ${
              selectedTheme.name === theme.name
                ? "ring-2 ring-blue-500 bg-blue-500 text-white shadow-lg transform scale-105"
                : selectedTheme.name === "Light"
                ? "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:bg-gray-100"
                : "bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700 hover:text-white hover:border-gray-600 active:bg-gray-600"
            } transition-all duration-200 shadow-sm font-mona-sans truncate`}
          >
            {theme.name}
          </button>
        ))}
      </div>
    </>
  );
};

export default Header;
