import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Github, Zap, Trophy, ArrowRight } from "lucide-react";

export const HowItWorks = () => {
  const steps = [
    {
      number: "01",
      icon: Github,
      title: "Connect Your GitHub",
      subtitle: '"Hi GitHub, meet our AI judge"',
      description: "We'll analyze your commits (yes, even the ones at 3 AM)",
      details: [
        "Secure OAuth connection",
        "No code access required",
        "Public repos only (we're not creeps)",
      ],
      color: "text-primary",
      bgColor: "bg-primary/10",
      href: "/connect-github", 
    },
    {
      number: "02",
      icon: Zap,
      title: "Get Your Aura Score",
      subtitle: "Our AI calculates if you're a coding legend",
      description: "Instant roast— I mean, feedback with detailed breakdown",
      details: [
        "AI analyzes contribution patterns",
        "Consistency & quality metrics",
        "Community engagement scoring",
      ],
      color: "text-accent",
      bgColor: "bg-accent/10",
      href: "/aura-score",
    },
    {
      number: "03",
      icon: Trophy,
      title: "Compete & Flex",
      subtitle: "Join monthly hunger games for developers",
      description: "Earn badges that your mom will be proud of",
      details: [
        "Monthly leaderboards",
        "Achievement badges",
        "Exportable profile cards",
      ],
      color: "text-secondary",
      bgColor: "bg-secondary/10",
      href: "/leaderboards",
    },
  ];

  return (
    <section className="py-12 sm:py-24 bg-card relative overflow-hidden" id="how-it-works">
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
          <Badge variant="outline" className="mb-4 border-border text-primary text-xs sm:text-sm">
            ⚡ Simple 3-Step Process (No Cap)
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            How It Works <span className="text-highlight">(The Magic)</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            From zero to hero in three simple steps. Even a junior developer
            could figure this out.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-8 sm:mb-16">
          {steps.map((step, index) => (
            <Link key={index} href={step.href} className="block group">
              <Card className="card-hover p-4 sm:p-8 h-full relative z-10 hover:scale-105 transition-all duration-500 border border-border group-hover:shadow-lg">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <div className="text-4xl sm:text-6xl font-bold text-primary">
                    {step.number}
                  </div>
                  <div className={`p-3 sm:p-4 rounded-xl bg-muted border border-border text-primary`}>
                    <step.icon className={`w-6 h-6 sm:w-8 sm:h-8 text-primary`} />
                  </div>
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-xl sm:text-2xl font-bold text-foreground">
                    {step.title}
                  </h3>
                  <p className={`font-medium text-sm sm:text-base text-primary`}>
                    {step.subtitle}
                  </p>
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {step.description}
                  </p>
                  <ul className="space-y-2 pt-3 sm:pt-4">
                    {step.details.map((detail, detailIndex) => (
                      <li key={detailIndex} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                        <div className="w-1 sm:w-1.5 h-1 sm:h-1.5 rounded-full bg-muted"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
