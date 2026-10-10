import { BarChart3, Medal, Swords, Trophy, UserRound, Zap } from "lucide-react";

const features = [
  {
    title: "Aura score",
    description:
      "Commits, PRs, reviews and streaks are rolled into a single score that rewards consistency over noise.",
    icon: Zap,
  },
  {
    title: "Profile overview",
    description:
      "Your contribution graph, top languages and key stats on one clean, shareable page.",
    icon: UserRound,
  },
  {
    title: "Global leaderboard",
    description:
      "See where you stand this month and all time, alongside everyone else on GitAura.",
    icon: Trophy,
  },
  {
    title: "Monthly badges",
    description:
      "Finish in the top three and earn a badge that stays on your profile for good.",
    icon: Medal,
  },
  {
    title: "Battle mode",
    description:
      "Put any two GitHub profiles head-to-head and compare them metric by metric.",
    icon: Swords,
  },
  {
    title: "Useful stats",
    description:
      "Monthly contribution charts and streak history, without spreadsheet energy.",
    icon: BarChart3,
  },
];

export const FeaturesSection = () => {
  return (
    <section id="features" className="scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="gh-eyebrow">Features</p>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            Everything your GitHub profile doesn&apos;t tell you.
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            GitAura reads your public activity and turns it into signals that
            are easy to scan, compare and share.
          </p>
        </div>

        <div className="mt-10 grid overflow-hidden rounded-md border border-border sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <div
              key={title}
              className="-mb-px -mr-px border-b border-r border-border p-6 transition-colors hover:bg-canvas-subtle"
            >
              <Icon className="h-5 w-5 text-muted-foreground" strokeWidth={1.75} />
              <h3 className="mt-4 text-base font-semibold text-foreground">{title}</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
