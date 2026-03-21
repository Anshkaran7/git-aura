// src/components/theme-aware-providers.tsx

"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"; 
import { Toaster } from "sonner";
import { QueryProvider } from "@/components/query-provider";
import UserSync from "@/components/UserSync";

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ThemeAwareProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <QueryProvider>
      <ClerkProvider
        publishableKey={clerkPublishableKey}
        appearance={{
          baseTheme: resolvedTheme === 'dark' ? dark : undefined,
          variables: {
            colorBackground: resolvedTheme === "dark" ? "#1f1f1f" : "#ffffff",
            colorPrimary: "var(--primary)",
            colorText: "var(--foreground)",
            colorInputBackground: "var(--background)",
            colorInputText: "var(--foreground)",
          },
          elements: {
            card: "border-border shadow-2xl",
            footerActionLink: "text-primary hover:text-primary/90",
          },
        }}
      >
        <Toaster
          theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
          position="top-right"
          closeButton
          richColors
        />

        <UserSync />

        <main id="main-content">{children}</main>
      </ClerkProvider>
    </QueryProvider>
  );
}
