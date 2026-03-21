"use client";

import Link from "next/link";
import {
  Analytics01Icon,
  ArrowRight01Icon,
  Award01Icon,
  GithubIcon,
  RankingIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import Contributors from "@/components/Contributors";
import { Header } from "@/components/home";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { HugeIcon } from "@/components/ui/huge-icon";

const contributionAreas = [
  {
    title: "Fix bugs",
    description:
      "Polish rough edges, strengthen reliability, and make the product feel more finished.",
    icon: Analytics01Icon,
    tag: "Quality",
  },
  {
    title: "Ship features",
    description:
      "Build focused improvements that make GitAura more useful for developers every day.",
    icon: SparklesIcon,
    tag: "Product",
  },
  {
    title: "Refine UI",
    description:
      "Improve clarity, reduce noise, and help the interface feel sharp across screens.",
    icon: RankingIcon,
    tag: "Design",
  },
  {
    title: "Improve docs",
    description:
      "Help other contributors move faster with better setup steps and clearer guidance.",
    icon: Award01Icon,
    tag: "Docs",
  },
];

const workflow = [
  {
    step: "01",
    title: "Spot something worth improving",
    description:
      "Look for bugs, UI gaps, edge cases, or performance wins that would materially improve the app.",
  },
  {
    step: "02",
    title: "Open an issue with context",
    description:
      "Share the problem, expected behavior, reproduction steps, and any implementation idea you already have.",
  },
  {
    step: "03",
    title: "Fork, build, and keep it focused",
    description:
      "Work in a small branch, stay consistent with the existing stack, and avoid unrelated changes in the same PR.",
  },
  {
    step: "04",
    title: "Submit a clean PR",
    description:
      "Explain the change clearly, link the issue, and make review easy with concise notes or screenshots.",
  },
];

const standards = [
  "Keep changes scoped and easy to review.",
  "Prefer clean TypeScript and predictable component structure.",
  "Handle loading, empty, and error states before calling a screen done.",
  "Match the app's minimal visual system instead of introducing a new style.",
  "Update docs or copy when behavior changes.",
  "Be collaborative and kind in reviews.",
];

const stack = [
  "Next.js App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prisma + PostgreSQL",
  "Clerk",
  "GitHub API",
];

export default function ContributePage() {
  return (
    <>
      <Header />

      <main className="bg-background text-foreground">
        <section className="border-b border-border/80">
          <div className="mx-auto max-w-6xl px-4 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
            <div className="mx-auto max-w-3xl text-center">
              <Badge
                variant="outline"
                className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                Open Source
              </Badge>
              <h1 className="mt-5 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">
                Help shape GitAura with calm, thoughtful contributions.
              </h1>
              <p className="mx-auto mt-4 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-[15px]">
                GitAura is built in the open. If you care about better UI,
                cleaner code, stronger edge-case handling, or steadier
                performance, there is meaningful work here for you.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Link
                  href="https://github.com/Anshkaran7/git-aura"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="w-full sm:w-auto">
                    <HugeIcon icon={GithubIcon} size={16} />
                    View repository
                    <HugeIcon icon={ArrowRight01Icon} size={16} />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/Anshkaran7/git-aura/issues"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button variant="secondary" className="w-full sm:w-auto">
                    Browse issues
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {contributionAreas.map((area) => (
                <Card
                  key={area.title}
                  className="rounded-[24px] border-border/80 bg-card/80 p-5 shadow-[0_20px_60px_-45px_rgba(15,23,42,0.32)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background">
                      <HugeIcon icon={area.icon} size={18} className="text-primary" />
                    </div>
                    <Badge
                      variant="outline"
                      className="rounded-full border-border bg-background px-2.5 py-1 text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
                    >
                      {area.tag}
                    </Badge>
                  </div>
                  <h2 className="mt-5 text-base font-semibold">{area.title}</h2>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-[13px]">
                    {area.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/80">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <Badge
                variant="outline"
                className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                Workflow
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                A clean contribution path.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                Keep the process simple, focused, and easy for maintainers to
                review.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {workflow.map((item) => (
                <Card
                  key={item.step}
                  className="rounded-[24px] border-border/80 bg-card/70 p-5 sm:p-6"
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
                      Step {item.step}
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold tracking-[-0.02em]">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs leading-5 text-muted-foreground sm:text-[13px]">
                    {item.description}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-b border-border/80">
          <div className="mx-auto grid max-w-6xl gap-4 px-4 py-14 sm:px-6 sm:py-20 lg:grid-cols-2 lg:px-8">
            <Card className="rounded-[24px] border-border/80 bg-card/70 p-5 sm:p-6">
              <h3 className="text-lg font-semibold">Tech stack</h3>
              <div className="mt-5 grid gap-2">
                {stack.map((item) => (
                  <div
                    key={item}
                    className="flex items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3 text-sm text-muted-foreground"
                  >
                    <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    {item}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="rounded-[24px] border-border/80 bg-card/70 p-5 sm:p-6">
              <h3 className="text-lg font-semibold">Contribution standards</h3>
              <div className="mt-5 grid gap-2">
                {standards.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-border bg-background px-3 py-3 text-sm leading-6 text-muted-foreground"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </section>

        <section className="border-b border-border/80">
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <div className="mb-8 max-w-2xl">
              <Badge
                variant="outline"
                className="rounded-full border-border bg-card px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
              >
                Contributors
              </Badge>
              <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                People building it forward.
              </h2>
              <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                GitAura is getting better because real people keep improving the
                details.
              </p>
            </div>
            <Contributors />
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
            <Card className="rounded-[28px] border-border/80 bg-card/80 p-6 sm:p-8">
              <div className="max-w-2xl">
                <Badge
                  variant="outline"
                  className="rounded-full border-border bg-background px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-muted-foreground"
                >
                  Ready to contribute
                </Badge>
                <h2 className="mt-4 text-2xl font-semibold tracking-[-0.03em] sm:text-3xl">
                  Start with one focused improvement.
                </h2>
                <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-[15px]">
                  Small, well-executed changes are far more valuable than noisy,
                  oversized pull requests.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link
                    href="https://github.com/Anshkaran7/git-aura/fork"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button className="w-full sm:w-auto">
                      <HugeIcon icon={GithubIcon} size={16} />
                      Fork repository
                    </Button>
                  </Link>
                  <Link
                    href="https://github.com/Anshkaran7/git-aura/issues/new"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button variant="secondary" className="w-full sm:w-auto">
                      Open an issue
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
    </>
  );
}
