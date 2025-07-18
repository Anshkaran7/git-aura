import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Users, Trophy, Zap, Skull } from "lucide-react";

export const SocialProof = () => {
  const testimonials = [
    {
      quote:
        "I went from 'junior developer' to 'senior developer' just by showing my aura score in standup meetings. 10/10 would recommend.",
      author: "Anonymous Chad Developer",
      auraScore: 1247,
      badges: ["🔥 Commit Addict", "👑 PR Legend"],
    },
    {
      quote:
        "My GitHub contributions were looking like a barcode. Now they look like a Christmas tree! 🎄",
      author: "Reformed Commit Ghost",
      auraScore: 892,
      badges: ["👻 Ghost Committer", "🎯 Issue Hunter"],
    },
    {
      quote:
        "Finally, a way to prove I'm not just Googling StackOverflow answers all day... well, mostly.",
      author: "Honest Developer",
      auraScore: 654,
      badges: ["🤖 AI's Favorite", "💀 Streak Breaker"],
    },
  ];

  const stats = [
    {
      icon: Users,
      number: "10,000+",
      label: "Active Developers",
      sublabel: "(and counting the bodies)",
      color: "text-primary",
    },
    {
      icon: Zap,
      number: "50M+",
      label: "Aura Points Generated",
      sublabel: "(that's a lot of validation)",
      color: "text-accent",
    },
    {
      icon: Trophy,
      number: "25,000+",
      label: "Badges Earned",
      sublabel: "(digital dopamine hits)",
      color: "text-secondary",
    },
    {
      icon: Skull,
      number: "3,247",
      label: "Destroyed Egos",
      sublabel: "(sorry, not sorry)",
      color: "text-destructive",
    },
  ];

  const auraLevels = [
    {
      range: "0-100",
      label: "Are you sure you're a developer?",
      emoji: "💀",
      color: "text-destructive",
    },
    {
      range: "101-300",
      label: "Getting warmer, but still room temperature",
      emoji: "🌡️",
      color: "text-orange-400",
    },
    {
      range: "301-600",
      label: "Respectable human being",
      emoji: "😌",
      color: "text-yellow-400",
    },
    {
      range: "601-900",
      label: "Actually pretty good, ngl",
      emoji: "🔥",
      color: "text-primary",
    },
    {
      range: "901-1200",
      label: "Okay, we're impressed",
      emoji: "👑",
      color: "text-accent",
    },
    {
      range: "1201+",
      label: "Please leave some code for the rest of us",
      emoji: "🚀",
      color: "text-secondary",
    },
  ];

  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-accent/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 border-border text-primary">
            📊 The Receipts
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Social Proof{" "}
            <span className="text-highlight">(The Flexing Zone)</span>
          </h2>
        </div>

        {/* Platform Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="card-hover p-6 text-center border border-border"
            >
              <div className="inline-flex p-3 rounded-lg bg-card mb-4 border border-border">
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="text-3xl font-bold text-foreground mb-2">
                {stat.number}
              </div>
              <div className="text-sm font-medium text-foreground mb-1">
                {stat.label}
              </div>
              <div className="text-xs text-muted-foreground">
                {stat.sublabel}
              </div>
            </Card>
          ))}
        </div>

        {/* Testimonials */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-center mb-8">
            User Testimonials{" "}
            <span className="text-muted-foreground font-normal">
              (But Make Them Relatable)
            </span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="card-hover p-6 border border-border">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 fill-primary text-primary"
                    />
                  ))}
                </div>

                <blockquote className="text-muted-foreground mb-4 italic">
                  "{testimonial.quote}"
                </blockquote>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <cite className="text-sm font-medium text-primary not-italic">
                      - {testimonial.author}
                    </cite>
                    <Badge variant="secondary" className="text-xs">
                      Aura: {testimonial.auraScore}
                    </Badge>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    {testimonial.badges.map((badge, badgeIndex) => (
                      <Badge
                        key={badgeIndex}
                        variant="outline"
                        className="text-xs border-border"
                      >
                        {badge}
                      </Badge>
                    ))}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Aura Levels */}
        <div className="text-center">
          <h3 className="text-2xl font-bold mb-8">Roast-Style Aura Levels</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {auraLevels.map((level, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-card/50 border border-border"
              >
                <span className="text-2xl">{level.emoji}</span>
                <div className="text-left">
                  <div className={`font-bold ${level.color}`}>
                    {level.range}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {level.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
