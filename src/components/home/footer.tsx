import { LogoMark } from "@/components/ui/logo";
import Link from "next/link";
import { Github } from "lucide-react";

type FooterLink = { href: string; label: string; external?: boolean };

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: "Product",
    links: [
      { href: "/leaderboard", label: "Leaderboard" },
      { href: "/monthly-winners", label: "Monthly winners" },
      { href: "/battle", label: "Battle" },
      { href: "/#features", label: "Features" },
    ],
  },
  {
    title: "Open source",
    links: [
      { href: "/contribute", label: "Contribute" },
      { href: "https://github.com/anshkaran7/git-aura", label: "Source code", external: true },
      { href: "https://github.com/anshkaran7/git-aura/issues", label: "Report an issue", external: true },
    ],
  },
  {
    title: "Connect",
    links: [
      { href: "https://x.com/itsmeekaran", label: "X / Twitter", external: true },
      { href: "https://karandev.in", label: "Author", external: true },
    ],
  },
];

function XIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

export const Footer = () => {
  return (
    <footer className="mt-16 border-t border-border bg-canvas-subtle">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_2fr]">
          <div>
            <Link href="/" className="inline-flex items-center gap-2">
              <LogoMark />
              <span className="text-base font-semibold text-foreground">GitAura</span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-muted-foreground">
              Your GitHub activity, scored and ranked. Free and open source,
              built by the community.
            </p>
            <a
              href="https://github.com/anshkaran7/git-aura"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex h-8 items-center gap-2 rounded-md border border-border bg-background px-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
            >
              <Github className="h-4 w-4" />
              Star on GitHub
            </a>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3">
            {columns.map((column) => (
              <div key={column.title}>
                <h3 className="text-sm font-semibold text-foreground">{column.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.href}>
                      {link.external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-muted-foreground transition-colors hover:text-link hover:underline"
                        >
                          {link.label}
                        </a>
                      ) : (
                        <Link
                          href={link.href}
                          className="text-sm text-muted-foreground transition-colors hover:text-link hover:underline"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} GitAura · Not affiliated with GitHub, Inc.
          </p>
          <div className="flex items-center gap-4">
            <a
              href="https://github.com/anshkaran7/git-aura"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitAura on GitHub"
              className="transition-colors hover:text-foreground"
            >
              <Github className="h-4 w-4" />
            </a>
            <a
              href="https://x.com/itsmeekaran"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitAura on X"
              className="transition-colors hover:text-foreground"
            >
              <XIcon className="h-3.5 w-3.5" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};
