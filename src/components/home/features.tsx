import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Brain, Trophy, Target, Zap, Users, Download } from "lucide-react";

export const FeaturesSection = () => {
  const features = [
    {
      icon: Trophy,
      title: "Leaderboard Domination",
      description:
        'Finally beat that one colleague who commits "fix typo" 47 times a day',
      badge: "🏆 Competitive",
      gradient: "from-gray-900/5 to-slate-800/10",
    },
    {
      icon: Zap,
      title: "Instant Aura Score",
      description:
        "Turns your GitHub into a dating profile rating (but for developers)",
      badge: "⚡ Fast",
      gradient: "from-slate-900/5 to-gray-800/10",
    },
    {
      icon: Users,
      title: "Global Rankings",
      description: "Find out if you're actually good or just think you are",
      badge: "🌍 Global",
      gradient: "from-zinc-900/5 to-slate-700/10",
    },
    {
      icon: Download,
      title: "Profile Export",
      description:
        "Make your GitHub look so good, recruiters will slide into your DMs",
      badge: "📊 Professional",
      gradient: "from-slate-800/5 to-zinc-900/10",
    },
  ];

  return (
    <section
      className="py-12 sm:py-24 bg-background relative overflow-hidden"
      id="features"
    >
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-36 sm:w-72 h-36 sm:h-72 bg-muted/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-48 sm:w-96 h-48 sm:h-96 bg-accent/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-8 sm:mb-16">
          <Badge
            variant="outline"
            className="mb-4 border-border text-primary text-xs sm:text-sm"
          >
            🔥 Core Features That Actually Matter
          </Badge>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Features Overview{" "}
            <span className="text-highlight">(The Good Stuff)</span>
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-3xl mx-auto px-4">
            Stop being a commit ghost and start building your developer street
            cred with features that actually matter
          </p>
        </div>

        {/* Features Grid - Optimized for 4 features */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card
              key={index}
              className={`
                group relative p-4 sm:p-6 hover:scale-105 transition-all duration-300 
                border border-border bg-gradient-to-br ${feature.gradient}
                hover:shadow-lg hover:shadow-primary/5
                animate-in fade-in-50 slide-in-from-bottom-10
              `}
              style={{
                animationDelay: `${index * 0.1}s`,
              }}
            >
              {/* Background gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-transparent to-muted/5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2 sm:p-3 rounded-lg bg-muted/50 border border-border group-hover:bg-primary/10 transition-colors duration-300">
                    <feature.icon className="w-4 h-4 sm:w-6 sm:h-6 text-primary group-hover:scale-110 transition-transform duration-300" />
                  </div>
                  <Badge variant="secondary" className="text-xs shrink-0">
                    {feature.badge}
                  </Badge>
                </div>

                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-3 text-foreground group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
                  {feature.description}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8 sm:mt-16">
          <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
            Ready to discover if you're a coding legend or just another
            "console.log" warrior?
          </p>
          <div className="inline-flex items-center gap-2 text-primary text-sm sm:text-base">
            <Zap className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="font-medium">Get roasted in under 30 seconds</span>
          </div>
        </div>
      </div>
    </section>
  );
};
