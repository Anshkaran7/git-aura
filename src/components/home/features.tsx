import {
  Award01Icon,
  Chart01Icon,
  GithubIcon,
  RankingIcon,
} from "@hugeicons/core-free-icons";
import { HugeIcon } from "@/components/ui/huge-icon";

const features = [
  {
    title: "A refined public profile",
    description:
      "Turn commit history, streaks, and contribution density into a profile layout that looks intentional.",
    icon: GithubIcon,
  },
  {
    title: "Rank movement that reads fast",
    description:
      "Monthly and all-time leaderboards stay compact, scannable, and stable even when data is still loading.",
    icon: RankingIcon,
  },
  {
    title: "Badges that feel earned",
    description:
      "Placement rewards, profile highlights, and actual badge assets instead of broken placeholders or noisy tokens.",
    icon: Award01Icon,
  },
  {
    title: "Metrics with better hierarchy",
    description:
      "Clear visual rhythm, lower font sizes, and quieter contrast keep the interface sharp without feeling crowded.",
    icon: Chart01Icon,
  },
];

export const FeaturesSection = () => {
  return (
    <section className="px-4 py-12 sm:px-6 sm:py-20" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="mb-10 max-w-2xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            What Changed
          </p>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-foreground sm:text-4xl">
            Cleaner surfaces, smaller typography, and stronger hierarchy.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground">
            The product now leans into a grayscale editorial feel instead of a
            generic SaaS aesthetic, with better spacing and less visual noise.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {features.map((feature) => (
            <article
              key={feature.title}
              className="rounded-[1.75rem] border border-border bg-card p-5 shadow-[0_18px_60px_-38px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border bg-background text-foreground">
                <HugeIcon icon={feature.icon} size={18} />
              </div>
              <h3 className="mt-5 text-sm font-semibold text-foreground">
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
