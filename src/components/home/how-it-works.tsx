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
    },
  ];

  return (
    <section
      className="py-24 bg-card relative overflow-hidden"
      id="how-it-works"
    >
      {/* Background Grid */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px)
          `,
            backgroundSize: "50px 50px",
          }}
        ></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-border text-primary">
            ⚡ Simple 3-Step Process (No Cap)
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            How It Works <span className="text-highlight">(The Magic)</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            From zero to hero in three simple steps. Even a junior developer
            could figure this out.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative">
              {/* Connection Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-primary/50 to-transparent z-0">
                  <ArrowRight className="w-4 h-4 text-primary/50 absolute -top-2 right-0" />
                </div>
              )}

              <Card className="card-hover p-8 h-full relative z-10 hover:scale-105 transition-all duration-500 border border-border">
                {/* Step Number */}
                <div className="flex items-center justify-between mb-6">
                  <div className="text-6xl font-bold  text-primary">
                    {step.number}
                  </div>
                  <div
                    className={`p-4 rounded-xl bg-muted border border-border text-primary`}
                  >
                    <step.icon className={`w-8 h-8 text-primary`} />
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                  <h3 className="text-2xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  <p className={`font-medium text-primary`}>{step.subtitle}</p>

                  <p className="text-muted-foreground">{step.description}</p>

                  {/* Details List */}
                  <ul className="space-y-2 pt-4">
                    {step.details.map((detail, detailIndex) => (
                      <li
                        key={detailIndex}
                        className="flex items-center gap-2 text-sm text-muted-foreground"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-muted"></div>
                        {detail}
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <div className="max-w-2xl mx-auto mb-8">
            <h3 className="text-2xl font-bold mb-4">
              Ready to find out if you're actually good or just think you are?
            </h3>
            <p className="text-muted-foreground mb-6">
              Join the ranks of developers who stopped pretending and started
              proving their worth.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="default" size="lg" className="px-8">
              <Github className="w-5 h-5 mr-2" />
              Start Your Aura Journey
            </Button>
            <Button variant="secondary" size="lg" className="px-8">
              I'm Scared, Let Me Browse First
            </Button>
          </div>

          <p className="text-xs text-muted-foreground mt-4">
            No signup required • Takes 30 seconds • Instant results
          </p>
        </div>
      </div>
    </section>
  );
};
