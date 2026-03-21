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
    title: "Connect a GitHub identity",
    description:
      "Bring in public activity, contribution history, and your current profile state without adding clutter.",
    icon: GithubIcon,
  },
  {
    number: "02",
    title: "Let GitAura shape the signal",
    description:
      "Your activity is translated into aura, streaks, and leaderboard position with a more dependable UI flow.",
    icon: SparklesIcon,
  },
  {
    number: "03",
    title: "Share a stronger presence",
    description:
      "Use cleaner profile layouts, better leaderboard cards, and actual badge visuals that feel finished.",
    icon: Award01Icon,
  },
];

export const HowItWorks = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20" id="how-it-works">
      <div className="mx-auto max-w-7xl rounded-[2rem] border border-border bg-card p-5 shadow-[0_24px_80px_-42px_rgba(0,0,0,0.38)] sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Workflow
            </p>
            <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
              Three steps. Lower noise. Better output.
            </h2>
            <p className="mt-4 max-w-md text-sm leading-6 text-muted-foreground">
              The product flow is now easier to scan and less dependent on loud
              gradients or oversized labels. It stays crisp in both light and
              dark.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-10 rounded-full px-4 text-sm font-semibold">
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
                <Link href="/battle">Compare profiles</Link>
              </Button>
            </div>
          </div>

          <div className="grid gap-3">
            {steps.map((step) => (
              <div
                key={step.number}
                className="grid gap-4 rounded-[1.5rem] border border-border bg-background p-4 sm:grid-cols-[72px_1fr] sm:items-start"
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
                  <h3 className="text-sm font-semibold text-foreground">
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
