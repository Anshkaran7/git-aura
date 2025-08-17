"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  ProfileCardSkeleton,
  LeaderboardSkeleton,
  ContributionGridSkeleton,
  MonthlyContributionSkeleton,
  AuraPanelSkeleton,
  BadgeDisplaySkeleton,
  BadgeGridSkeleton,
  Skeleton,
  SkeletonAvatar,
  SkeletonText,
  SkeletonCard,
  SkeletonGrid,
  SkeletonButton,
  SkeletonBadge,
} from "./index";

/**
 * Demo component showcasing all skeleton variations
 * This component is for development/testing purposes only
 */
export function SkeletonDemo() {
  const [activeDemo, setActiveDemo] = useState<string>("profile");

  const demos = [
    { id: "profile", label: "Profile Card", component: <ProfileCardSkeleton /> },
    { id: "leaderboard", label: "Leaderboard", component: <LeaderboardSkeleton count={5} /> },
    { id: "contribution", label: "Contribution Grid", component: <ContributionGridSkeleton /> },
    { id: "monthly", label: "Monthly Contribution", component: <MonthlyContributionSkeleton /> },
    { id: "aura", label: "Aura Panel", component: <AuraPanelSkeleton /> },
    { id: "badge", label: "Badge Display", component: <BadgeDisplaySkeleton /> },
    { id: "badge-grid", label: "Badge Grid", component: <BadgeGridSkeleton count={6} /> },
    {
      id: "basic",
      label: "Basic Components",
      component: (
        <div className="space-y-6">
          <SkeletonCard className="p-4">
            <h3 className="text-lg font-semibold mb-4">Basic Skeleton Components</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-2">Avatars</h4>
                <div className="flex gap-2 items-center">
                  <SkeletonAvatar size="sm" />
                  <SkeletonAvatar size="md" />
                  <SkeletonAvatar size="lg" />
                  <SkeletonAvatar size="xl" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Text</h4>
                <SkeletonText lines={3} />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Buttons</h4>
                <div className="flex gap-2">
                  <SkeletonButton size="sm" />
                  <SkeletonButton size="md" />
                  <SkeletonButton size="lg" />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Badges</h4>
                <div className="flex gap-2">
                  <SkeletonBadge />
                  <SkeletonBadge />
                  <SkeletonBadge />
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Grid Pattern</h4>
                <SkeletonGrid rows={5} cols={10} cellClassName="w-4 h-4" />
              </div>

              <div>
                <h4 className="text-sm font-medium mb-2">Custom Shapes</h4>
                <div className="flex gap-2">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-8 w-24 rounded-none" />
                </div>
              </div>
            </div>
          </SkeletonCard>
        </div>
      ),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">Skeleton Components Demo</h1>
        <p className="text-muted-foreground">
          Interactive showcase of all skeleton loading states used throughout the application.
        </p>
      </div>

      {/* Demo Navigation */}
      <div className="mb-8">
        <div className="flex flex-wrap gap-2">
          {demos.map((demo) => (
            <Button
              key={demo.id}
              variant={activeDemo === demo.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveDemo(demo.id)}
            >
              {demo.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Demo Content */}
      <div className="border border-border rounded-lg p-6 bg-background">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">
            {demos.find(d => d.id === activeDemo)?.label}
          </h2>
          <p className="text-sm text-muted-foreground">
            This is how the skeleton appears during loading states.
          </p>
        </div>
        
        <div className="min-h-[400px]">
          {demos.find(d => d.id === activeDemo)?.component}
        </div>
      </div>

      {/* Usage Information */}
      <div className="mt-8 p-6 bg-muted/20 rounded-lg">
        <h3 className="text-lg font-semibold mb-2">Usage</h3>
        <p className="text-sm text-muted-foreground mb-4">
          To use these skeletons in your components, simply replace loading spinners with the appropriate skeleton:
        </p>
        <pre className="bg-background p-4 rounded border text-sm overflow-x-auto">
{`// Before
{loading ? (
  <div className="animate-spin ...">Loading...</div>
) : (
  <YourComponent />
)}

// After
import { ProfileCardSkeleton } from "@/components/skeletons";

{loading ? <ProfileCardSkeleton /> : <YourComponent />}`}
        </pre>
      </div>
    </div>
  );
}

export default SkeletonDemo;
