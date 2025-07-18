"use client";

import { Button } from "@/components/ui/button";
import { Github, Menu, Zap, User, LogOut } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";

export const Header = ({
  leaderboard = false,
  dashboard = false,
  profile = false,
}: {
  leaderboard?: boolean;
  dashboard?: boolean;
  profile?: boolean;
}) => {
  const { isSignedIn, user } = useUser();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleGoToProfile = () => {
    if (user?.externalAccounts) {
      const githubAccount = user.externalAccounts.find(
        (account) => account.provider === "github"
      );
      if (githubAccount?.username) {
        router.push(`/${githubAccount.username}`);
        return;
      }
    }
    router.push("/profile");
  };

  return (
    <header
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/90 
      backdrop-blur-lg transition-all duration-500 ease-linear ${
        isScrolled
          ? "w-[90%] md:w-[80%] rounded-2xl mt-8 border border-border"
          : "w-full border-b border-border"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-1.5 sm:p-2 rounded-lg bg-muted border border-border">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base sm:text-lg text-highlight">
                Git Aura
              </span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {leaderboard && (
              <>
                <a
                  href="#features"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </>
            )}

            {/* {isSignedIn && ( */}
            <a
              href={profile ? `/${user?.username}/leaderboard` : "/leaderboard"}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Leaderboard
            </a>
            {/* )} */}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <>
                {/* User Profile Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 h-8 px-2 sm:px-3"
                  onClick={handleGoToProfile}
                >
                  {user?.imageUrl ? (
                    <img
                      src={user.imageUrl}
                      alt={user?.firstName || "Profile"}
                      className="w-5 h-5 rounded-full"
                    />
                  ) : (
                    <User className="w-4 h-4" />
                  )}
                  <span className="hidden md:inline text-sm">
                    {user?.firstName || "Profile"}
                  </span>
                </Button>

                {/* Go to Dashboard */}
                {dashboard && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGoToProfile}
                    className="h-8 px-3 text-sm"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Dashboard</span>
                    <span className="sm:hidden">View</span>
                  </Button>
                )}

                {/* Sign Out */}
                <SignOutButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden md:flex h-8 px-3 text-sm"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                {/* Connect GitHub Button */}
                <SignInButton mode="modal">
                  <Button
                    variant="default"
                    size="sm"
                    className="h-8 px-3 text-sm whitespace-nowrap"
                  >
                    <Github className="w-4 h-4 mr-2" />
                    <span className="hidden sm:inline">Connect GitHub</span>
                    <span className="sm:hidden">Connect</span>
                  </Button>
                </SignInButton>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden h-8 w-8 px-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {leaderboard && (
                <>
                  <a
                    href="#features"
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                  >
                    How It Works
                  </a>
                </>
              )}
              {isSignedIn && (
                <a
                  href={
                    profile ? `/${user?.username}/leaderboard` : "/leaderboard"
                  }
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Leaderboard
                </a>
              )}
              {isSignedIn && (
                <SignOutButton>
                  <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors">
                    <LogOut className="w-4 h-4 inline mr-2" />
                    Sign Out
                  </button>
                </SignOutButton>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
