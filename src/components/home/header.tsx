"use client";

import { Button } from "@/components/ui/button";
import { Github, Menu, Zap, User, LogOut, RefreshCw } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import Image from "next/image";

export const Header = ({
  leaderboard = false,
  dashboard = false,
  profile = false,
}: {
  leaderboard?: boolean;
  dashboard?: boolean;
  profile?: boolean;
}) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Handle user data synchronization
  useEffect(() => {
    const syncUserData = async () => {
      if (!isLoaded || !isSignedIn || !user) return;

      try {
        setIsSyncing(true);
        const githubAccount = user.externalAccounts?.find(
          (account) => account.provider === "github"
        );

        if (!githubAccount?.username) {
          console.warn("No GitHub account connected");
          return;
        }

        // Sync user data with our backend
        const response = await fetch("/api/sync-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userId: user.id,
            githubUsername: githubAccount.username,
            displayName: user.firstName || githubAccount.username,
            avatarUrl:
              user.imageUrl ||
              `https://github.com/${githubAccount.username}.png`,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to sync user data");
        }

        const data = await response.json();
        if (data.success) {
          console.log("User data synced successfully");
        }
      } catch (error) {
        console.error("Error syncing user data:", error);
        // toast.error("Failed to sync your data. Please try again.");
      } finally {
        setIsSyncing(false);
      }
    };

    syncUserData();
  }, [isLoaded, isSignedIn, user]);

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

  const handleNavigateToProfile = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetPath = profile ? `/${user?.username}` : "/profile";
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  const handleNavigateToLeaderboard = (e: React.MouseEvent) => {
    e.preventDefault();
    const targetPath = isSignedIn
      ? `/${user?.username}/leaderboard`
      : "/leaderboard";
    if (pathname !== targetPath) {
      router.push(targetPath);
    }
  };

  const handleManualSync = async () => {
    if (!isSignedIn || isSyncing) return;

    try {
      setIsSyncing(true);
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.id,
          githubUsername: user.externalAccounts?.find(
            (account) => account.provider === "github"
          )?.username,
          displayName: user.firstName || user.username,
          avatarUrl: user.imageUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync data");
      }

      const data = await response.json();
      if (data.success) {
        toast.success("Data synced successfully!");
      }
    } catch (error) {
      console.error("Error in manual sync:", error);
      // toast.error("Failed to sync. Please try again.");
    } finally {
      setIsSyncing(false);
    }
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
            <div className=" bg-muted border-[1px] border-border rounded-lg">
              <Image
                src="/logo.png"
                alt="Git Aura"
                width={1000}
                height={1000}
                loading="lazy"
                className="w-12 h-12 rounded-lg text-primary"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-sm sm:text-base md:text-lg text-highlight">
                Git Aura
              </span>
            </div>
          </Link>

          {/* Navigation - Desktop */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {/* Home Screen Navigation */}
            {pathname === "/" && (
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

            {/* Non-logged in user on leaderboard page */}
            {!isSignedIn && pathname === "/leaderboard" && (
              <Link
                href="/"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                Home
              </Link>
            )}

            {/* Logged in user navigation */}
            {isSignedIn && pathname !== "/" && (
              <a
                href={profile ? `/${user?.username}` : "/profile"}
                onClick={handleNavigateToProfile}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                My Profile
              </a>
            )}

            <a
              href={
                isSignedIn ? `/${user?.username}/leaderboard` : "/leaderboard"
              }
              onClick={handleNavigateToLeaderboard}
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Leaderboard
            </a>

            {/* Contribute link - shown on all pages */}
            <Link
              href="/contribute"
              className="text-sm text-muted-foreground hover:text-primary transition-colors"
            >
              Contribute
            </Link>
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <>
                {/* Manual Sync Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={handleManualSync}
                  disabled={isSyncing}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                </Button>

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
                {dashboard && pathname === "/" && (
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
                    className="h-8 px-3 text-sm items-center whitespace-nowrap"
                  >
                    <Github className="w-4 h-4 mr-0 md:mr-2" />
                    <span className="hidden sm:inline">Connect GitHub</span>
                    {/* <span className="sm:hidden">Connect</span> */}
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
              {/* Home Screen Navigation */}
              {pathname === "/" && (
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

              {/* Non-logged in user on leaderboard page */}
              {!isSignedIn && pathname === "/leaderboard" && (
                <Link
                  href="/"
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                >
                  Home
                </Link>
              )}

              {/* Logged in user navigation */}
              {isSignedIn && pathname !== "/" && (
                <a
                  href={profile ? `/${user?.username}` : "/profile"}
                  onClick={handleNavigateToProfile}
                  className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
                >
                  My Profile
                </a>
              )}

              <a
                href={
                  isSignedIn ? `/${user?.username}/leaderboard` : "/leaderboard"
                }
                onClick={handleNavigateToLeaderboard}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
              >
                Leaderboard
              </a>

              {/* Contribute link - shown on all pages */}
              <Link
                href="/contribute"
                className="px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors"
              >
                Contribute
              </Link>

              {isSignedIn && (
                <>
                  <button
                    onClick={handleManualSync}
                    disabled={isSyncing}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    Sync Data
                  </button>
                  <SignOutButton>
                    <button className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4 inline mr-2" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};
