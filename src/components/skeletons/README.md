# Loading Skeletons System

This directory contains reusable skeleton components that provide better user experience during loading states by showing placeholder content that matches the actual layout structure.

## Overview

The skeleton system replaces generic loading spinners with structured placeholders that give users a clear indication of what content is loading. This creates a more professional and polished loading experience.

## Components

### Base Components (`src/components/ui/skeleton.tsx`)

#### `Skeleton`

Basic building block for all skeleton components.

```tsx
<Skeleton className="h-4 w-32" />
```

#### `SkeletonAvatar`

Circular placeholder for profile pictures.

```tsx
<SkeletonAvatar size="md" /> // sm, md, lg, xl
```

#### `SkeletonText`

Animated text placeholders with customizable lines and widths.

```tsx
<SkeletonText lines={3} widths={["w-full", "w-3/4", "w-1/2"]} />
```

#### `SkeletonCard`

Card container for grouped skeleton content.

```tsx
<SkeletonCard>
  <SkeletonAvatar size="md" />
  <SkeletonText lines={2} />
</SkeletonCard>
```

#### `SkeletonGrid`

Grid pattern for contribution calendar and similar layouts.

```tsx
<SkeletonGrid rows={7} cols={53} cellClassName="w-[11px] h-[11px]" />
```

#### `SkeletonButton`

Button-shaped placeholders.

```tsx
<SkeletonButton size="md" /> // sm, md, lg
```

#### `SkeletonBadge`

Small pill-shaped placeholders for badges and tags.

```tsx
<SkeletonBadge />
```

### Specialized Skeletons

#### `ProfileCardSkeleton`

Complete skeleton for GitHub profile cards including:

- Browser window controls
- Profile header with avatar, name, and stats
- Bio section
- Contribution grid
- Action buttons

```tsx
import { ProfileCardSkeleton } from "./skeletons/ProfileCardSkeleton";

// Usage
{
  loading ? <ProfileCardSkeleton /> : <ProfileCard {...props} />;
}
```

#### `LeaderboardSkeleton`

Skeleton for leaderboard components including:

- View toggle controls
- User cards
- Leaderboard entries with rankings

```tsx
import { LeaderboardSkeleton } from "./skeletons/LeaderboardSkeleton";

// Usage
{
  loading ? <LeaderboardSkeleton count={10} /> : <Leaderboard {...props} />;
}
```

#### `ContributionGridSkeleton`

Skeleton for GitHub contribution calendar:

- Month labels
- Weekday labels
- 7x53 grid pattern
- Legend

```tsx
import { ContributionGridSkeleton } from "./skeletons/ContributionSkeleton";

// Usage
{
  loading ? <ContributionGridSkeleton /> : <ContributionGrid {...props} />;
}
```

#### `MonthlyContributionSkeleton`

Skeleton for monthly contribution analysis:

- Header with navigation
- Stats grid
- Monthly calendar view

```tsx
import { MonthlyContributionSkeleton } from "./skeletons/ContributionSkeleton";

// Usage
{
  loading ? (
    <MonthlyContributionSkeleton />
  ) : (
    <MonthlyContribution {...props} />
  );
}
```

#### `AuraPanelSkeleton`

Skeleton for aura analysis panel:

- Header with sync controls
- Toggle navigation
- Main aura display
- Stats grid
- AI message section

```tsx
import { AuraPanelSkeleton } from "./skeletons/ContributionSkeleton";

// Usage
{
  loading ? <AuraPanelSkeleton /> : <AuraPanel {...props} />;
}
```

#### `BadgeDisplaySkeleton`

Skeleton for badge display components:

- Badge icon with glow effect
- Title and description
- Metadata

```tsx
import { BadgeDisplaySkeleton } from "./skeletons/BadgeSkeleton";

// Usage
{
  loading ? <BadgeDisplaySkeleton /> : <BadgeDisplay {...props} />;
}
```

## Animation Integration

All skeletons work seamlessly with Framer Motion for smooth transitions:

```tsx
import { motion, AnimatePresence } from "framer-motion";

<AnimatePresence mode="wait">
  {loading ? (
    <motion.div
      key="loading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <ProfileCardSkeleton />
    </motion.div>
  ) : (
    <motion.div
      key="content"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <ProfileCard {...props} />
    </motion.div>
  )}
</AnimatePresence>;
```

## Implementation Examples

### Replacing Spinner Loading States

**Before:**

```tsx
{
  loading ? (
    <div className="flex items-center justify-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-300"></div>
    </div>
  ) : (
    <ProfileCard {...props} />
  );
}
```

**After:**

```tsx
{
  loading ? <ProfileCardSkeleton /> : <ProfileCard {...props} />;
}
```

### Custom Skeleton Composition

```tsx
function CustomComponentSkeleton() {
  return (
    <SkeletonCard className="p-6">
      <div className="flex items-center gap-4 mb-4">
        <SkeletonAvatar size="lg" />
        <div className="flex-1">
          <SkeletonText lines={2} widths={["w-32", "w-24"]} />
        </div>
        <SkeletonButton size="sm" />
      </div>
      <SkeletonText lines={3} />
    </SkeletonCard>
  );
}
```

## Accessibility

All skeleton components include proper ARIA attributes:

- `aria-label="Loading..."` on skeleton containers
- `role="status"` for loading indicators
- Reduced motion support through CSS `prefers-reduced-motion`

## Customization

### Theme Support

Skeletons automatically adapt to light/dark themes using Tailwind's color system:

- `bg-muted/60` in light mode
- `bg-muted/40` in dark mode

### Responsive Design

All skeletons are fully responsive with mobile-first design:

```tsx
<Skeleton className="h-4 w-16 sm:h-5 sm:w-20 md:h-6 md:w-24" />
```

### Animation Customization

Modify the pulse animation by overriding the `animate-pulse` class:

```css
@keyframes skeleton-pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.5;
  }
}

.animate-skeleton-pulse {
  animation: skeleton-pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}
```

## Performance

- Lightweight components with minimal DOM elements
- CSS-only animations (no JavaScript)
- Optimized for 60fps on all devices
- Memory efficient with component reuse

## Files Modified

The skeleton system has been integrated into the following components:

- `src/components/GitHubProfileCard.tsx` - Profile loading states
- `src/components/leaderboard/CustomLeaderboard.tsx` - Leaderboard loading
- `src/components/leaderboard/LoadingState.tsx` - Updated to use skeletons
- `src/components/BadgeDisplay.tsx` - Badge loading states
- `src/components/animated-tooltip-demo.tsx` - Top users loading
- `src/components/AuraPanel.tsx` - Calculation states

## Benefits

1. **Better UX**: Users see content structure while loading
2. **Perceived Performance**: App feels faster with structured loading
3. **Professional Look**: More polished than generic spinners
4. **Accessibility**: Better screen reader support
5. **Consistency**: Unified loading experience across the app
6. **Maintainability**: Reusable components reduce code duplication

## Future Enhancements

- Add skeleton variants for different content types
- Implement smart skeleton generation based on component props
- Add skeleton preview mode for development
- Create skeleton testing utilities
