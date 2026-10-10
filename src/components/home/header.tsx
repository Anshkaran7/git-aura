"use client";

import { Button } from "@/components/ui/button";
import { LogoMark } from "@/components/ui/logo";
import { Github, Menu, User, LogOut, Shield, X } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
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
        { href: "/#features", label: "Features" },
        { href: "/#how-it-works", label: "How it works" },
        { href: leaderboardUrl, label: "Ranks" },
        { href: "/monthly-winners", label: "Winners" },
        { href: "/battle", label: "Battle" },
      ];
    },
    [leaderboardUrl]
  );

  // Memoize user profile URL
  const userProfileUrl = useMemo(() => {
    return githubAccount?.username ? `/${githubAccount.username}` : "/sign-in";
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



  // Helper function to check if a link is active
  // The URL hash isn't known during SSR, so read it after mount (and on change)
  // to keep server and client markup identical.
  const [hash, setHash] = useState("");
  useEffect(() => {
    const syncHash = () => setHash(window.location.hash);
    syncHash();
    window.addEventListener("hashchange", syncHash);
    return () => window.removeEventListener("hashchange", syncHash);
  }, [pathname]);

  const isActiveLink = useCallback((href: string) => {
    if (href.startsWith('/#')) {
      // Homepage sections are only active on the homepage with a matching hash
      return pathname === "/" && hash === href.slice(1);
    }
    // For other pages, exact match or starts with the path
    return pathname === href || (href !== "/" && pathname.startsWith(href));
  }, [pathname, hash]);

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
        window.history.replaceState(null, "", href);
        setHash(href.slice(1));
      } else {
        // If on other page, navigate to homepage with hash
        router.push(href);
      }
    }
  }, [pathname, router]);

  // Render navigation items with active state styling (GitHub underline-nav style)
  const renderNavItems = useCallback(
    (items: Array<{ href: string; label: string }>, isMobile = false) => {
      return items.map(({ href, label }) => {
        const isActive = isActiveLink(href);
        if (isMobile) {
          return (
            <Link
              key={href}
              href={href}
              onClick={(e) => handleNavClick(href, e)}
              className={`flex items-center rounded-md px-3 py-2 text-sm transition-colors hover:bg-accent ${
                isActive ? "bg-accent font-semibold text-foreground" : "text-foreground"
              }`}
            >
              {label}
            </Link>
          );
        }
        return (
          <Link
            key={href}
            href={href}
            onClick={(e) => handleNavClick(href, e)}
            aria-current={isActive ? "page" : undefined}
            className={`relative flex h-full items-center px-2 text-sm transition-colors ${
              isActive
                ? "font-semibold text-foreground after:absolute after:inset-x-2 after:-bottom-px after:h-0.5 after:rounded-full after:bg-[#fd8c73]"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="rounded-md px-1 py-1 hover:bg-accent">{label}</span>
          </Link>
        );
      });
    },
    [isActiveLink, handleNavClick]
  );

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-canvas-subtle/95 backdrop-blur supports-[backdrop-filter]:bg-canvas-subtle/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <div className="flex h-full items-center gap-4">
          {/* Mobile Menu Toggle */}
          <Button
            variant="outline"
            size="icon"
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={isMobileMenuOpen}
          >
            {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </Button>

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 rounded-md">
            <LogoMark />
            <span className="text-sm font-semibold text-foreground">GitAura</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden h-full items-stretch lg:flex" aria-label="Primary">
            {renderNavItems(allNavItems)}
          </nav>
        </div>

        {/* CTA Buttons */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {!isLoaded ? (
            <div className="h-8 w-24 animate-pulse rounded-md bg-accent" />
          ) : isSignedIn ? (
            <>
              {isAdmin && (
                <Button asChild variant="outline" size="sm" className="h-8">
                  <Link href="/admin/users">
                    <Shield className="h-4 w-4" />
                    <span className="hidden sm:inline">Admin</span>
                  </Link>
                </Button>
              )}

              <SignOutButton>
                <Button variant="ghost" size="sm" className="hidden h-8 text-muted-foreground sm:flex">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              </SignOutButton>

              <button
                type="button"
                onClick={handleGoToProfile}
                className="flex items-center gap-2 rounded-full transition-opacity hover:opacity-85"
                aria-label="Open your profile"
                title={githubAccount?.username ? `@${githubAccount.username}` : "Profile"}
              >
                {user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt={user?.firstName || "Profile"}
                    className="h-8 w-8 rounded-full border border-border"
                  />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background">
                    <User className="h-4 w-4" />
                  </span>
                )}
              </button>
            </>
          ) : (
            <>
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="hidden h-8 sm:flex">
                  Sign in
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button size="sm" className="h-8">
                  <Github className="h-4 w-4" />
                  <span>Connect GitHub</span>
                </Button>
              </SignInButton>
            </>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden">
          <button
            className="fixed inset-0 top-14 z-40 bg-black/40"
            aria-label="Close mobile menu"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="absolute inset-x-0 top-14 z-50 border-b border-border bg-background gh-shadow">
            <nav className="mx-auto flex max-h-[calc(100vh-4rem)] max-w-6xl flex-col gap-0.5 overflow-y-auto px-3 py-3">
              {renderNavItems(allNavItems, true)}

              {isSignedIn ? (
                <div className="mt-2 flex flex-col gap-0.5 border-t border-border pt-2">
                  <button
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      handleGoToProfile();
                    }}
                    className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm hover:bg-accent"
                  >
                    {user?.imageUrl ? (
                      <img src={user.imageUrl} alt="" className="h-6 w-6 rounded-full" />
                    ) : (
                      <User className="h-4 w-4" />
                    )}
                    <span className="font-medium">Your profile</span>
                  </button>

                  {isAdmin && (
                    <Link
                      href="/admin/users"
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-accent"
                    >
                      <Shield className="h-4 w-4" />
                      Admin panel
                    </Link>
                  )}

                  <SignOutButton>
                    <button
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
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
