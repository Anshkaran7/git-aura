import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

export default function SSOCallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
        Completing sign in...
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
