// src/components/theme-aware-providers.tsx

"use client";

import { useTheme } from "next-themes";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes"; 
import { Toaster } from "sonner";
import UserSync from "@/components/UserSync";

const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

export function ThemeAwareProviders({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useTheme();

  return (
    <ClerkProvider
      publishableKey={clerkPublishableKey}
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorBackground: resolvedTheme === 'dark' ? '#1f1f1f' : '#ffffff',
          
          // These other variables can remain as they are.
          colorPrimary: `oklch(var(--primary))`,
          colorText: `oklch(var(--foreground))`,
          colorInputBackground: `oklch(var(--background))`,
          colorInputText: `oklch(var(--foreground))`,
        },
        elements: {
          // We keep this clean and let the `variables` above do the work.
          card: "border-border shadow-2xl",
        //   formButtonPrimary:
        //     "[background:oklch(var(--primary))] [color:oklch(var(--primary-foreground))] hover:opacity-90",
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
  );
}