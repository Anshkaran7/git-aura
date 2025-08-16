// src/components/ui/theme-toggle.tsx

"use client";

import * as React from "react";
import { Moon, Sun, Laptop } from "lucide-react"; // Import the Laptop icon
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  
  // This state is necessary to avoid hydration mismatch issues,
  // ensuring the server-rendered UI matches the client-side UI
  // after the theme is determined from localStorage.
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const cycleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
    } else if (theme === "dark") {
      setTheme("system");
    } else {
      // This will catch both "system" and any other potential state
      setTheme("light");
    }
  };

  // Until the component is mounted, we can show a placeholder or nothing
  // to prevent the UI from flickering due to theme changes.
  if (!mounted) {
    return (
      <Button
        variant="outline"
        size="icon"
        className="h-8 w-8 px-0"
        disabled
      />
    );
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className="h-8 w-8 px-0"
      onClick={cycleTheme}
      aria-label="Cycle theme"
    >
      <span className="sr-only">Cycle to next theme</span>
      {/* Conditionally render the correct icon based on the current theme */}
      {theme === "light" && <Sun className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "dark" && <Moon className="h-[1.2rem] w-[1.2rem]" />}
      {theme === "system" && <Laptop className="h-[1.2rem] w-[1.2rem]" />}
    </Button>
  );
}