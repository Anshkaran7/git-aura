"use client";

import { Button } from "@/components/ui/button";
import { Github, Menu, User, LogOut, Shield, X } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { ThemeToggle } from "@/components/ui/theme-toggle";

// Navigation items configuration - now unified for consistency across all pages

export const Header = ({
  leaderboard,
  dashboard,
  profile,
}: {
  leaderboard?: boolean;
  dashboard?: boolean;
  profile?: boolean;
} = {}) => {
  const { isSignedIn, user, isLoaded } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  // Memoize all navigation items (always show all 6 items)
  const allNavItems = useMemo(
    () => {
      return [
        { href: "/#features", label: "Why It Hits" },
        { href: "/#how-it-works", label: "How It Works" },
        { href: leaderboardUrl, label: "Leaderboard" },
        { href: "/monthly-winners", label: "Hall of Fame" },
        { href: "/battle", label: "Battle" },
        { href: "/contribute", label: "Build With Us" },
      ];
    },
    [leaderboardUrl]
  );

  // Memoize user profile URL
  const userProfileUrl = useMemo(() => {
    return githubAccount?.username ? `/${githubAccount.username}` : "/profile";
  }, [githubAccount?.username]);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin status when user signs in
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!isSignedIn || !user) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch("/api/check-admin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: user.emailAddresses?.[0]?.emailAddress,
            githubUsername: githubAccount?.username,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        }
      } catch (error) {
        console.error("Error checking admin status:", error);
        setIsAdmin(false);
      }
    };

    checkAdminStatus();
  }, [isSignedIn, user, githubAccount?.username]);

  // Scroll handler for floating navbar effect
  const handleScroll = useCallback(() => {
    const scrollPosition = window.scrollY;
    setIsScrolled(scrollPosition > 50);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!isMobileMenuOpen) {
      document.body.style.overflow = "";
      return;
    }

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

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



  // Memoize header classes with scroll animation
  const headerClasses = useMemo(() => {
    return `fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/78 
    backdrop-blur-xl transition-all duration-500 ease-linear ${
      isScrolled
        ? "w-[92%] md:w-[90%] rounded-full mt-5 border border-border shadow-[0_18px_60px_-34px_rgba(0,0,0,0.42)]"
        : "w-full border-b border-border/80"
    }`;
  }, [isScrolled]);

  // Helper function to check if a link is active
  const isActiveLink = useCallback((href: string) => {
    if (href.startsWith('/#')) {
      // For homepage sections, only active when on homepage
      // Check if window is defined (client-side only) to avoid SSR errors
      return pathname === "/" && typeof window !== 'undefined' && window.location.hash === href.slice(1);
    }
    // For other pages, exact match or starts with the path
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }, [pathname]);

  // Handle navigation to homepage sections from other pages
  const handleNavClick = useCallback((href: string, e: React.MouseEvent) => {
    setIsMobileMenuOpen(false);

    if (href.startsWith('/#') && typeof window !== 'undefined') {
      e.preventDefault();
      if (pathname === '/') {
        // If already on homepage, scroll to section
        const section = href.slice(2); // Remove /#
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      } else {
        // If on other page, navigate to homepage with hash
        router.push(href);
      }
    }
  }, [pathname, router]);

  // Render navigation items with active state styling
  const renderNavItems = useCallback(
    (items: Array<{ href: string; label: string }>, isMobile = false) => {
      return items.map(({ href, label }) => {
        const isActive = isActiveLink(href);
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleNavClick(href, e)}
            className={`text-[13px] transition-colors ${
              isActive 
                ? "text-primary font-semibold" 
                : "text-muted-foreground hover:text-primary"
            } ${
              isMobile ? "px-4 py-2 hover:bg-muted/50 rounded-lg" : ""
            }`}
          >
            {label}
          </Link>
        );
      });
    },
    [isActiveLink, handleNavClick]
  );

  return (
    <header className={headerClasses}>
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-2 hover:opacity-80 transition-opacity"
          >
            <div className="bg-card border border-border rounded-2xl p-1">
              <Image
                src="/logo.png"
                alt="Git Aura"
                width={48}
                height={48}
                loading="lazy"
                className="w-10 h-10 rounded-xl text-primary"
              />
            </div>
            <span className="hidden xl:block text-sm font-semibold tracking-[-0.03em] text-foreground">
              Git Aura
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-5">
            {renderNavItems(allNavItems)}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            <ThemeToggle />
            {isSignedIn ? (
              <>
                {/* Admin Button - Only show for admin users */}
                {isAdmin && (
                  <Link href="/admin/users">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 rounded-full px-3 text-xs items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      <span className="hidden sm:inline">Admin</span>
                    </Button>
                  </Link>
                )}

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
                  className="flex items-center gap-2 h-8 rounded-full px-2"
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
                  <span className="hidden md:inline text-xs">
                    {user?.firstName || "Profile"}
                  </span>
                </Button>

                <SignOutButton>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden sm:flex h-8 rounded-full px-3 text-xs"
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
                  className="h-8 rounded-full px-3 text-xs items-center whitespace-nowrap"
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
              className="xl:hidden h-8 w-8 rounded-full px-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
              aria-expanded={isMobileMenuOpen}
            >
              {isMobileMenuOpen ? (
                <X className="w-4 h-4" />
              ) : (
                <Menu className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="xl:hidden">
          <button
            className="fixed inset-0 top-16 z-40 bg-background/72 backdrop-blur-[2px]"
            aria-label="Close mobile menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="fixed inset-x-4 top-[4.7rem] z-50 overflow-hidden rounded-[2rem] border border-border bg-background/96 shadow-[0_28px_90px_-44px_rgba(0,0,0,0.7)] backdrop-blur-2xl">
            <nav className="flex max-h-[calc(100vh-6rem)] flex-col overflow-y-auto px-3 py-3">
              {renderNavItems(allNavItems, true)}

              {isSignedIn ? (
                <div className="mt-3 border-t border-border/70 pt-3">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleGoToProfile();
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                  >
                    {user?.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user?.firstName || "Profile"}
                        className="h-8 w-8 rounded-full"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border">
                        <User className="h-4 w-4" />
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-foreground">
                        {user?.firstName || "Profile"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Open your profile
                      </p>
                    </div>
                  </button>

                  {isAdmin && (
                    <Link
                      href="/admin/users"
                      className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Panel
                    </Link>
                  )}

                  <SignOutButton>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mt-1 flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-sm text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </SignOutButton>
                </div>
              ) : null}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
};
