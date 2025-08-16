"use client";

import { Button } from "@/components/ui/button";
import { Github, Menu, User, LogOut, Shield } from "lucide-react";
import { useUser, SignInButton, SignOutButton } from "@clerk/nextjs";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";

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
      const items = [
        { href: "/#features", label: "Features" },
        { href: "/#how-it-works", label: "How It Works" },
        { href: leaderboardUrl, label: "Leaderboard" },
        { href: "/monthly-winners", label: "Monthly Winners" },
        { href: "/battle", label: "Profile Compare" },
        { href: "/contribute", label: "Contribute" },
      ];
      console.log(`Navigation items for ${pathname}:`, items);
      return items;
    },
    [leaderboardUrl, pathname]
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
    return `fixed top-0 left-1/2 -translate-x-1/2 z-50 bg-background/90 
    backdrop-blur-lg transition-all duration-500 ease-linear ${
      isScrolled
        ? "w-[90%] md:w-[90%] rounded-2xl mt-8 border border-border shadow-lg"
        : "w-full border-b border-border"
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
    if (href.startsWith('/#') && typeof window !== 'undefined') {
      e.preventDefault();
      if (pathname === '/') {
        // If already on homepage, scroll to section
        const section = href.slice(2); // Remove /#
        const element = document.getElementById(section);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          console.log(`Scrolling to section: ${section}`);
        } else {
          console.log(`Section not found: ${section}`);
        }
      } else {
        // If on other page, navigate to homepage with hash
        console.log(`Navigating from ${pathname} to homepage section: ${href}`);
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
            className={`text-sm transition-colors ${
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
            <span className="hidden xl:block font-bold text-sm sm:text-base md:text-lg text-highlight">
              Git Aura
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden xl:flex items-center gap-6 lg:gap-8">
            {renderNavItems(allNavItems)}
          </nav>

          {/* CTA Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {isSignedIn ? (
              <>
                {/* Admin Button - Only show for admin users */}
                {isAdmin && (
                  <Link href="/admin/users">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 text-sm items-center gap-2"
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
                  className="flex items-center gap-2 h-8 px-2"
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
                    className="hidden sm:flex h-8 px-3 text-sm"
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
              className="xl:hidden h-8 w-8 px-0"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <Menu className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-2">
              {renderNavItems(allNavItems, true)}
              {isSignedIn && (
                <>
                  {/* Admin Button in mobile menu */}
                  {isAdmin && (
                    <Link
                      href="/admin/users"
                      className="w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors flex items-center gap-2"
                    >
                      <Shield className="w-4 h-4" />
                      Admin Panel
                    </Link>
                  )}
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
                    <button className="sm:hidden w-full text-left px-4 py-2 text-sm text-muted-foreground hover:text-primary hover:bg-muted/50 rounded-lg transition-colors">
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
