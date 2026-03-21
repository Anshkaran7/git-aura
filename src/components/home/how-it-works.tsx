import Link from "next/link";
import {
  ArrowRight01Icon,
  Award01Icon,
  GithubIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { HugeIcon } from "@/components/ui/huge-icon";

const steps = [
  {
    number: "01",
    title: "Connect your GitHub",
    description:
      "Pull in public activity, contribution history, and profile data without the setup feeling long.",
    icon: GithubIcon,
  },
  {
    number: "02",
    title: "Let the aura cook",
    description:
      "GitAura turns raw activity into cleaner signals like aura, streaks, badges, and rank movement.",
    icon: SparklesIcon,
  },
  {
    number: "03",
    title: "Post your clean flex",
    description:
      "Share a profile, compare with someone, or sit comfortably on the leaderboard if you’re built like that.",
    icon: Award01Icon,
  },
];

export const HowItWorks = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20" id="how-it-works">
      <div className="mx-auto max-w-7xl rounded-[2.2rem] border border-border bg-card/95 p-5 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              How it works
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">
              Plug in once. The whole thing starts looking elite.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              GitAura keeps the flow short, the UI calm, and the output strong.
              No mess. No fake hype. Just a better wrapper for your dev life.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                asChild
                className="h-10 rounded-full px-4 text-sm font-semibold"
              >
                <Link href="/leaderboard">
                  See the leaderboard
                  <HugeIcon icon={ArrowRight01Icon} size={16} />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-10 rounded-full px-4 text-sm font-semibold"
              >
                <Link href="/battle">Run a battle</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step, index) => (
              <div
                key={step.number}
                className={`grid gap-4 rounded-[1.6rem] border border-border bg-background/95 p-4 sm:grid-cols-[72px_1fr] sm:items-start ${
                  index === 1
                    ? "bg-[linear-gradient(135deg,rgba(255,255,255,0.98),rgba(245,245,245,0.88))] dark:bg-[linear-gradient(135deg,rgba(23,23,23,0.95),rgba(10,10,10,0.9))]"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3 sm:block">
                  <div className="text-2xl font-semibold tracking-[-0.06em] text-foreground sm:text-3xl">
                    {step.number}
                  </div>
                  <div className="mt-0 flex h-10 w-10 items-center justify-center rounded-2xl border border-border bg-card text-foreground sm:mt-4">
                    <HugeIcon icon={step.icon} size={17} />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold tracking-[-0.02em] text-foreground">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-xs leading-6 text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
