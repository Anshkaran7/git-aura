import { GitHubSignIn } from "@/components/GitHubSignIn";
import { GithubIcon, SparklesIcon } from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12">
      <div className="w-full max-w-md rounded-[2rem] border border-border bg-card p-6 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.4)] sm:p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-[1.4rem] border border-border bg-background text-foreground">
            <HugeIcon icon={GithubIcon} size={22} />
          </div>
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
            <HugeIcon icon={SparklesIcon} size={14} className="text-primary" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Sign in
            </span>
          </div>
          <h1 className="text-2xl font-semibold tracking-[-0.04em] text-foreground">
            Welcome to GitAura
          </h1>
          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            Connect GitHub to open your profile, badge system, and leaderboard
            view.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <GitHubSignIn />
          <p className="text-center text-[11px] leading-5 text-muted-foreground">
            By continuing, you agree to the platform terms and privacy flow.
          </p>
        </div>
      </div>
    </div>
  );
}
