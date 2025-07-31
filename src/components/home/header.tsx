"use client";

import { Button } from "@/components/ui/button";
import { Github, Menu, User, LogOut, RefreshCw } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import Image from "next/image";

// Navigation items configuration
const NAV_ITEMS = {
  home: [
    { href: "#features", label: "Features" },
    { href: "#how-it-works", label: "How It Works" },
  ],
  main: [
    { href: "/leaderboard", label: "Leaderboard" },
    { href: "/monthly-winners", label: "Monthly Winners" },
    { href: "/contribute", label: "Contribute" },
  ],
};

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

  // Memoize GitHub account lookup
  const githubAccount = useMemo(() => {
    return user?.externalAccounts?.find(
      (account) => account.provider === "github"
    );
  }, [user?.externalAccounts]);

  // Memoize leaderboard URL
  const leaderboardUrl = useMemo(() => {
    if (isSignedIn && githubAccount?.username) {
      return `/${githubAccount.username}/leaderboard`;
    }
    return "/leaderboard";
  }, [isSignedIn, githubAccount?.username]);

  // Memoize main navigation items
  const mainNavItems = useMemo(
    () => [
      { href: leaderboardUrl, label: "Leaderboard" },
      { href: "/monthly-winners", label: "Monthly Winners" },
      { href: "/contribute", label: "Contribute" },
    ],
    [leaderboardUrl]
  );

  // Memoize user profile URL
  const userProfileUrl = useMemo(() => {
    return githubAccount?.username ? `/${githubAccount.username}` : "/profile";
  }, [githubAccount?.username]);

  // Optimize scroll handler with useCallback
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setIsScrolled(scrollPosition > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Memoize navigation handlers
  const handleGoToProfile = useCallback(() => {
    router.push(userProfileUrl);
  }, [router, userProfileUrl]);

  // const handleNavigateToProfile = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.preventDefault();
  //     const targetPath = profile ? `/${user?.username}` : "/profile";
  //     if (pathname !== targetPath) {
  //       router.push(targetPath);
  //     }
  //   },
  //   [profile, user?.username, pathname, router]
  // );

  // const handleNavigateToLeaderboard = useCallback(
  //   (e: React.MouseEvent) => {
  //     e.preventDefault();
  //     const targetPath = isSignedIn
  //       ? `/${user?.username}/leaderboard`
  //       : "/leaderboard";
  //     if (pathname !== targetPath) {
  //       router.push(targetPath);
  //     }
  //   },
  //   [isSignedIn, user?.username, pathname, router]
  // );

  // Optimize sync function
  const syncUserData = useCallback(async () => {
    if (!isLoaded || !isSignedIn || !user || !githubAccount?.username) return;

    try {
      setIsSyncing(true);
      const response = await fetch("/api/sync-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubUsername: githubAccount.username,
          displayName: user.firstName || githubAccount.username,
          avatarUrl:
            user.imageUrl || `https://github.com/${githubAccount.username}.png`,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to sync data");
      }

      const data = await response.json();
      // if (data.success) {
      //   toast.success("Data synced successfully!");
      // }
    } catch (error) {
      console.error("Error syncing user data:", error);
    } finally {
      setIsSyncing(false);
    }
  }, [isLoaded, isSignedIn, user, githubAccount?.username]);

  useEffect(() => {
    syncUserData();
  }, [syncUserData]);

  // Memoize header classes
  const headerClasses = useMemo(() => {
    return `fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/90 
    backdrop-blur-lg transition-all duration-500 ease-linear ${
      isScrolled
        ? "w-[90%] md:w-[80%] rounded-2xl mt-8 border border-border"
        : "w-full border-b border-border"
    }`;
  }, [isScrolled]);

  // Render navigation items
  const renderNavItems = useCallback(
    (items: Array<{ href: string; label: string }>, isMobile = false) => {
      return items.map(({ href, label }) => (
        <Link
          key={href}
          href={href}
          className={`text-sm text-muted-foreground hover:text-primary transition-colors ${
            isMobile ? "px-4 py-2 hover:bg-muted/50 rounded-lg" : ""
          }`}
        >
          {label}
        </Link>
      ));
    },
    []
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1.5 sm:gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-muted border-[1px] border-border rounded-lg">
              <Image
                src="/logo.png"
                alt="Git Aura"
                width={48}
                height={48}
                loading="lazy"
                className="w-12 h-12 rounded-lg text-primary"
              />
            </div>
            <span className="font-bold text-sm sm:text-base md:text-lg text-highlight">
              Git Aura
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {pathname === "/" && renderNavItems(NAV_ITEMS.home)}
            {renderNavItems(mainNavItems)}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <>
                {/* <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 px-2"
                  onClick={syncUserData}
                  disabled={isSyncing}
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                  />
                </Button> */}

                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex items-center gap-2 h-8 px-2"
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
              <SignInButton mode="modal">
                <Button
                  variant="default"
                  size="sm"
                  className="h-8 px-3 text-sm items-center whitespace-nowrap"
                >
                  <Github className="w-4 h-4 mr-0 md:mr-2" />
                  <span className="hidden sm:inline">Connect GitHub</span>
                </Button>
              </SignInButton>
            )}

            {/* Mobile Menu Toggle */}
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
              {pathname === "/" && renderNavItems(NAV_ITEMS.home, true)}
              {renderNavItems(mainNavItems, true)}
              {isSignedIn && (
                <>
                  {/* <button
                    onClick={syncUserData}
                    disabled={isSyncing}
                    className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
                  >
                    <RefreshCw
                      className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
                    />
                    Sync Data
                  </button> */}
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
