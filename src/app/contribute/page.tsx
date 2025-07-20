import type { Metadata } from "next";
import { Header } from "@/components/home";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Github,
  GitFork,
  Bug,
  Code,
  Users,
  Star,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";
import Squares from "@/components/ui/Squares";

export const metadata: Metadata = {
  title: "Contribute to GitAura | Help Build the Future of GitHub Analytics",
  description:
    "Join the GitAura community! Learn how to contribute by finding bugs, raising issues, and submitting pull requests to make GitAura even better.",
  openGraph: {
    title: "Contribute to GitAura",
    description:
      "Help build the future of GitHub analytics. Contribute to GitAura by reporting bugs, suggesting features, or submitting code.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Contribute to GitAura",
    description:
      "Help build the future of GitHub analytics. Join our open-source community!",
  },
};

const contributionSteps = [
  {
    number: "01",
    icon: Bug,
    title: "Find Issues or Bugs",
    subtitle: "Time to play detective with our codebase",
    description:
      "Explore GitAura and spot bugs that need fixing or features that could be better",
    details: [
      "Test different features thoroughly",
      "Check existing GitHub issues",
      "Look for UI/UX improvements",
      "Think about new useful features",
    ],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    number: "02",
    icon: Github,
    title: "Raise an Issue",
    subtitle: "Document your findings like a pro",
    description:
      "Create detailed GitHub issues that make our team say 'wow, this person gets it'",
    details: [
      "Use clear, descriptive titles",
      "Provide reproduction steps",
      "Include screenshots if relevant",
      "Suggest implementation ideas",
    ],
    color: "text-accent",
    bgColor: "bg-accent/10",
  },
  {
    number: "03",
    icon: GitFork,
    title: "Fork & Work",
    subtitle: "Time to get your hands dirty with code",
    description:
      "Fork our repo, create your branch, and start building the solution",
    details: [
      "Fork the GitAura repository",
      "Create feature branch",
      "Follow our coding standards",
      "Write tests for changes",
    ],
    color: "text-secondary",
    bgColor: "bg-secondary/10",
  },
  {
    number: "04",
    icon: Code,
    title: "Submit PR",
    subtitle: "The moment of truth - get your code reviewed",
    description:
      "Submit a clean PR and watch our team marvel at your coding skills",
    details: [
      "Create detailed pull request",
      "Link to original issue",
      "Ensure all tests pass",
      "Respond to review feedback",
    ],
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
];

const contributionTypes = [
  {
    icon: Bug,
    title: "Bug Fixes",
    description: "Help us squash bugs and improve stability",
    badge: "🐛 Critical",
    gradient: "from-red-900/5 to-red-800/10",
  },
  {
    icon: Star,
    title: "New Features",
    description: "Build exciting new functionality",
    badge: "✨ Creative",
    gradient: "from-blue-900/5 to-blue-800/10",
  },
  {
    icon: Code,
    title: "Code Quality",
    description: "Improve performance and structure",
    badge: "⚡ Performance",
    gradient: "from-green-900/5 to-green-800/10",
  },
  {
    icon: Users,
    title: "Documentation",
    description: "Help others understand GitAura",
    badge: "📚 Knowledge",
    gradient: "from-purple-900/5 to-purple-800/10",
  },
];

const techStack = [
  "Next.js 14 with App Router",
  "TypeScript",
  "Tailwind CSS",
  "Prisma & PostgreSQL",
  "Clerk Authentication",
  "GitHub API",
];

const guidelines = [
  "Follow TypeScript best practices",
  "Write meaningful commit messages",
  "Add tests for new features",
  "Keep PRs focused and small",
  "Update documentation when needed",
  "Be respectful in all interactions",
];

export default function ContributePage() {
  return (
    <>
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center bg-background overflow-hidden py-12">
        {/* Animated Squares Background */}
        <div className="absolute w-full h-full z-30 pointer-events-auto">
          <Squares
            speed={0.3}
            squareSize={20}
            direction="diagonal"
            borderColor="#ffffff15"
            hoverFillColor="#00ff25"
          />
        </div>

        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-muted/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 text-center relative z-40 pointer-events-none">
          <div className="max-w-4xl mx-auto">
            {/* Badge */}
            <Badge
              variant="outline"
              className="mb-4 border-border text-primary text-xs sm:text-sm"
            >
              🚀 Open Source Project
            </Badge>

            <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold mb-4 sm:mb-6 leading-tight">
              Help Build <span className="text-highlight">GitAura</span>
            </h1>

            <p className="text-base sm:text-lg md:text-xl text-muted-foreground mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
              Join our community of developers and help shape the future of
              GitHub analytics. Whether you're fixing bugs, adding features, or
              improving docs - every contribution matters!
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pointer-events-auto">
              <Link
                href="https://github.com/Anshkaran7/git-aura"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="default"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto group"
                >
                  <Github className="w-4 h-4 sm:w-5 sm:h-5 mr-2 group-hover:rotate-12 transition-transform" />
                  View on GitHub
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              </Link>

              <Link
                href="https://github.com/Anshkaran7/git-aura/issues"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button
                  variant="secondary"
                  size="lg"
                  className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6 w-full sm:w-auto"
                >
                  <Bug className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Browse Issues
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Contribute */}
      <section className="py-12 sm:py-24 bg-card relative overflow-hidden">
        {/* Background Grid */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
              `,
              backgroundSize: "25px 25px",
            }}
          ></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-border text-primary text-xs sm:text-sm"
            >
              🔥 Multiple Ways to Help
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              Ways to <span className="text-highlight">Contribute</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              From code warriors to documentation heroes - there's a place for
              everyone in our community
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
            {contributionTypes.map((type, index) => (
              <Card
                key={index}
                className={`
                  group relative p-4 sm:p-6 hover:scale-105 transition-all duration-300 
                  border border-border bg-gradient-to-br ${type.gradient}
                  hover:shadow-lg hover:shadow-primary/5
                  animate-in fade-in-50 slide-in-from-bottom-10
                `}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="relative z-10">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border group-hover:bg-primary/10 transition-colors duration-300">
                      <type.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {type.badge}
                    </Badge>
                  </div>

                  <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                    {type.title}
                  </h3>

                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                    {type.description}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How to Contribute Process */}
      <section className="py-12 sm:py-24 bg-background relative overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-muted/10 rounded-full blur-3xl"></div>
          <div className="absolute top-0 right-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-accent/10 rounded-full blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center mb-8 sm:mb-16">
            <Badge
              variant="outline"
              className="mb-4 border-border text-primary text-xs sm:text-sm"
            >
              📋 Simple 4-Step Process
            </Badge>
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
              How to <span className="text-highlight">Contribute</span>
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
              From finding issues to merging PRs - here's your roadmap to
              becoming a GitAura contributor
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8 sm:mb-16">
            {contributionSteps.map((step, index) => (
              <div key={index} className="relative">
                <Card className="card-hover p-4 sm:p-8 h-full relative z-10 hover:scale-105 transition-all duration-500 border border-border">
                  {/* Step Number */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6">
                    <div className="text-4xl sm:text-6xl font-bold text-primary">
                      {step.number}
                    </div>
                    <div className="p-3 sm:p-4 rounded-xl bg-muted border border-border text-primary">
                      <step.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                    </div>
                  </div>

                  {/* Content */}
                  <div className="space-y-3 sm:space-y-4">
                    <div>
                      <h3 className="text-xl sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                        {step.title}
                      </h3>
                      <p className="text-sm sm:text-base text-primary font-medium mb-3 sm:mb-4">
                        {step.subtitle}
                      </p>
                      <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                        {step.description}
                      </p>
                    </div>

                    <ul className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <li
                          key={detailIndex}
                          className="flex items-start gap-2 text-muted-foreground text-sm"
                        >
                          <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack & Guidelines */}
      <section className="py-12 sm:py-24 bg-card relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Tech Stack */}
            <Card className="card-hover p-6 sm:p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Tech Stack We Use
              </h3>
              <div className="space-y-3">
                {techStack.map((tech, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <span className="w-2 h-2 bg-primary rounded-full"></span>
                    <span className="text-muted-foreground">{tech}</span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Guidelines */}
            <Card className="card-hover p-6 sm:p-8 border border-border">
              <h3 className="text-2xl font-bold text-foreground mb-6">
                Contribution Guidelines
              </h3>
              <div className="space-y-3">
                {guidelines.map((guideline, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <span className="w-2 h-2 bg-accent rounded-full mt-2 flex-shrink-0"></span>
                    <span className="text-muted-foreground">{guideline}</span>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-12 sm:py-24 bg-background relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center">
            <Card className="card-hover p-8 sm:p-12 max-w-4xl mx-auto border border-border bg-gradient-to-br from-muted/50 to-card">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground mb-4">
                Ready to <span className="text-highlight">Contribute</span>?
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Join our community of contributors and help make GitAura the
                best GitHub analytics platform. Every contribution, no matter
                how small, makes a difference!
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="https://github.com/Anshkaran7/git-aura/fork"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="default"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base group"
                  >
                    <GitFork className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                    Fork Repository
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>

                <Link
                  href="https://github.com/Anshkaran7/git-aura/issues/new"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="secondary"
                    size="lg"
                    className="w-full sm:w-auto px-6 sm:px-8 py-3 text-base"
                  >
                    <Bug className="w-5 h-5 mr-2" />
                    Report Issue
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>
    </>
  );
}
