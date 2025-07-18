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

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 50); // Change after 50px scroll
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
    // Fallback to profile page if no GitHub username found
    router.push("/profile");
  };

  return (
    <header
      className={`fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/90 backdrop-blur-lg transition-all duration-500 ease-linear ${
        isScrolled
          ? "w-[80%] rounded-2xl mt-8 border border-border"
          : "w-full border-b border-border"
      }`}
    >
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="p-2 rounded-lg bg-muted border border-border">
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg text-highlight">Git Aura</span>
              {/* <span className="text-xs text-muted-foreground -mt-1">
                Checker
              </span> */}
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {leaderboard && (
              <>
                <a
                  href="#features"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  How It Works
                </a>
              </>
            )}

            {isSignedIn &&
              (profile ? (
                <a
                  href={`/${user?.username}/leaderboard`}
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Leaderboard
                </a>
              ) : (
                <a
                  href="/leaderboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  Leaderboard
                </a>
              ))}

            {/* <a
              href="#faq"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              FAQ
            </a> */}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-3">
            {isSignedIn ? (
              <>
                {/* User Profile Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2"
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
                  <span className="hidden md:inline">
                    {user?.firstName || "Profile"}
                  </span>
                </Button>

                {/* Go to Dashboard */}
                {dashboard && (
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleGoToProfile}
                  >
                    <Github className="w-4 h-4 mr-2" />
                    Dashboard
                  </Button>
                )}

                {/* Sign Out */}
                <SignOutButton>
                  <Button variant="ghost" size="sm" className="hidden md:flex">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </Button>
                </SignOutButton>
              </>
            ) : (
              <>
                {/* Sign In Button */}
                {/* <SignInButton mode="modal">
                  <Button variant="ghost" size="sm" className="hidden sm:flex">
                    Sign In
                  </Button>
                </SignInButton> */}

                {/* Connect GitHub Button */}
                <SignInButton mode="modal">
                  <Button variant="default" size="sm">
                    <Github className="w-4 h-4 mr-2" />
                    Connect GitHub
                  </Button>
                </SignInButton>
              </>
            )}

            {/* Mobile Menu */}
            <Button variant="ghost" size="sm" className="md:hidden">
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
