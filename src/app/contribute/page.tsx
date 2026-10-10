"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  Analytics01Icon,
  Award01Icon,
  GithubIcon,
  RankingIcon,
  SparklesIcon,
} from "@hugeicons/core-free-icons";
import Contributors from "@/components/Contributors";
import { Header, Footer } from "@/components/home";
import { Button } from "@/components/ui/button";
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

const REPO_URL = "https://github.com/Anshkaran7/git-aura";

function ExternalButton({
  href,
  variant,
  children,
}: {
  href: string;
  variant?: "default" | "outline" | "dark";
  children: ReactNode;
}) {
  return (
    <Button variant={variant} className="w-full sm:w-auto" asChild>
      <Link href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </Link>
    </Button>
  );
}

function SectionHeading({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {description && (
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      )}
    </div>
  );
}

export default function ContributePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-10">
        {/* Page head */}
        <section className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground">
              <HugeIcon icon={GithubIcon} size={16} />
              <Link href={REPO_URL} target="_blank" rel="noopener noreferrer" className="gh-link">
                Anshkaran7/git-aura
              </Link>
              <span className="gh-label">Public</span>
            </p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Contribute to GitAura
            </h1>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              GitAura is built in the open. If you care about better UI,
              cleaner code, stronger edge-case handling, or steadier
              performance, there is meaningful work here for you.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <ExternalButton href={REPO_URL}>
              <HugeIcon icon={GithubIcon} size={16} />
              View repository
            </ExternalButton>
            <ExternalButton href={`${REPO_URL}/issues`} variant="outline">
              Browse issues
            </ExternalButton>
          </div>
        </section>

        {/* Areas */}
        <section className="mt-8">
          <SectionHeading
            title="Where you can help"
            description="Pick an area that matches what you enjoy working on."
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {contributionAreas.map((area) => (
              <div key={area.title} className="gh-box p-4">
                <div className="flex items-center justify-between gap-3">
                  <HugeIcon
                    icon={area.icon}
                    size={16}
                    className="text-muted-foreground"
                  />
                  <span className="gh-label">{area.tag}</span>
                </div>
                <h3 className="mt-3 text-sm font-semibold">{area.title}</h3>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {area.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Workflow + sidebar */}
        <section className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_18rem]">
          <div>
            <SectionHeading
              title="Contribution workflow"
              description="Keep the process simple, focused, and easy for maintainers to review."
            />
            <ol className="relative">
              {workflow.map((item, index) => (
                <li key={item.step} className="relative flex gap-4 pb-6 last:pb-0">
                  {index < workflow.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-[15px] top-8 bottom-0 w-0.5 bg-border"
                    />
                  )}
                  <span className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-canvas-subtle text-xs font-semibold tabular-nums text-foreground">
                    {index + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-sm leading-6 text-muted-foreground">
                      {item.description}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-6">
            <div>
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Tech stack
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {stack.map((item) => (
                  <span
                    key={item}
                    className="gh-label border-transparent bg-accent-subtle text-link"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-6">
              <h2 className="mb-2 text-sm font-semibold text-foreground">
                Contribution standards
              </h2>
              <ul className="space-y-1.5">
                {standards.map((item) => (
                  <li
                    key={item}
                    className="flex gap-2 text-sm leading-5 text-muted-foreground"
                  >
                    <svg
                      aria-hidden
                      viewBox="0 0 16 16"
                      className="mt-0.5 h-4 w-4 shrink-0 fill-current text-success"
                    >
                      <path d="M13.78 4.22a.75.75 0 0 1 0 1.06l-7.25 7.25a.75.75 0 0 1-1.06 0L2.22 9.28a.751.751 0 0 1 .018-1.042.751.751 0 0 1 1.042-.018L6 10.94l6.72-6.72a.75.75 0 0 1 1.06 0Z" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        </section>

        {/* Contributors */}
        <section className="mt-10">
          <Contributors />
        </section>

        {/* CTA */}
        <section className="mt-10">
          <div className="gh-box flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
            <div>
              <h2 className="text-base font-semibold text-foreground">
                Start with one focused improvement
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Small, well-executed changes are far more valuable than noisy,
                oversized pull requests.
              </p>
            </div>
            <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
              <ExternalButton href={`${REPO_URL}/fork`}>
                <HugeIcon icon={GithubIcon} size={16} />
                Fork repository
              </ExternalButton>
              <ExternalButton href={`${REPO_URL}/issues/new`} variant="outline">
                Open an issue
              </ExternalButton>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
