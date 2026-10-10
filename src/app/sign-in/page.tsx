import { LogoMark } from "@/components/ui/logo";
import Link from "next/link";
import { GitHubSignIn } from "@/components/GitHubSignIn";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen flex-col items-center bg-background px-4 pb-12 pt-10 sm:pt-16">
      <Link href="/" aria-label="GitAura home">
        <LogoMark className="h-12 w-12" />
      </Link>

      <h1 className="mt-6 text-2xl font-light tracking-tight text-foreground">
        Sign in to GitAura
      </h1>

      <div className="mt-4 w-full max-w-[340px] rounded-md border border-border bg-canvas-subtle p-4">
        <p className="mb-3 text-sm text-foreground">
          Connect your GitHub account to view your profile, aura score, badges
          and leaderboard rank.
        </p>
        <GitHubSignIn />
      </div>

      <div className="mt-4 w-full max-w-[340px] rounded-md border border-border px-4 py-3 text-center text-sm text-foreground">
        New to GitAura?{" "}
        <span className="text-muted-foreground">
          Signing in creates your account.
        </span>
      </div>

      <p className="mt-6 max-w-[340px] text-center text-xs text-muted-foreground">
        By continuing, you agree to the platform terms and privacy policy.
        GitAura only reads your public GitHub data.
      </p>

      <Link href="/" className="gh-link mt-3 text-xs">
        Back to home
      </Link>
    </div>
  );
}
