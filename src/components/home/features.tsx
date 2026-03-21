import {
  Award01Icon,
  Chart01Icon,
  GithubIcon,
  RankingIcon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

const features = [
  {
    title: "Profile pages with presence",
    description:
      "Your contribution history stops looking like raw data and starts looking like a proper digital identity.",
    icon: GithubIcon,
  },
  {
    title: "Leaderboards that read in one glance",
    description:
      "No clutter, no weird spacing, no chaos. Just clean rank, aura, badges, and momentum.",
    icon: RankingIcon,
  },
  {
    title: "Badges that actually feel earned",
    description:
      "Top finishes land with real visual weight instead of random shiny UI for no reason.",
    icon: Award01Icon,
  },
  {
    title: "Stats with taste",
    description:
      "Smaller type, sharper hierarchy, and better pacing make the whole thing feel more expensive.",
    icon: Chart01Icon,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Why it hits
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.045em] text-foreground sm:text-4xl">
            Built for people who want their GitHub to look clean, not corny.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            GitAura keeps the vibe minimal, but the signal stays strong. It’s a
            better-looking wrapper around work you already did.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature, index) => (
            <article
              key={feature.title}
              className={`rounded-[1.85rem] border border-border bg-card/95 p-5 shadow-[0_18px_60px_-38px_rgba(0,0,0,0.18)] transition-transform duration-300 hover:-translate-y-0.5 ${
                index === 0
                  ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(245,245,245,0.92))] dark:bg-[linear-gradient(180deg,rgba(23,23,23,0.95),rgba(10,10,10,0.92))]"
                  : ""
              }`}
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-foreground">
                <HugeIcon icon={feature.icon} size={18} />
              </div>
              <h3 className="mt-5 text-sm font-semibold tracking-[-0.02em] text-foreground">
                {feature.title}
              </h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
