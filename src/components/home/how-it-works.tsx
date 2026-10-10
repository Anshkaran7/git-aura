import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

const steps = [
  {
    title: "Connect your GitHub",
    description:
      "Sign in with GitHub. We only read your public profile and contribution history.",
  },
  {
    title: "Get your aura",
    description:
      "Your activity is scored into aura, streaks and badges, and refreshed automatically.",
  },
  {
    title: "Climb and share",
    description:
      "Track your rank on the leaderboard, battle friends, and export your profile card.",
  },
];

export const HowItWorks = () => {
  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-border bg-canvas-subtle px-4 py-16 sm:px-6 sm:py-20"
    >
      <div className="mx-auto grid max-w-6xl gap-10 lg:grid-cols-[1fr_1.2fr] lg:gap-16">
        <div>
          <p className="gh-eyebrow">How it works</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Three steps. No setup.
          </h2>
          <p className="mt-3 max-w-md text-base text-muted-foreground">
            There&apos;s nothing to install and nothing to configure. Your
            profile is ready the moment you sign in.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button asChild>
              <Link href="/leaderboard">
                See the leaderboard
                <ArrowRight />
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/battle">Run a battle</Link>
            </Button>
          </div>
        </div>

        <ol className="relative space-y-8 before:absolute before:bottom-2 before:left-[15px] before:top-2 before:w-0.5 before:bg-border">
          {steps.map((step, index) => (
            <li key={step.title} className="relative flex gap-4">
              <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-foreground">
                {index + 1}
              </span>
              <div className="pt-1">
                <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{step.description}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
};
