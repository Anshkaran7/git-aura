# Skeleton Loading Components

This directory contains reusable skeleton loading components that provide better UX during data fetching.

## Components

### Base Components

- **`Skeleton`** - Basic animated skeleton element
- **`SkeletonAvatar`** - Circular skeleton for profile pictures
- **`SkeletonText`** - Text placeholders with multiple line support
- **`SkeletonCard`** - Container for skeleton content
- **`SkeletonGrid`** - GitHub-style contribution grid skeleton
- **`SkeletonLeaderboardEntry`** - Leaderboard row skeleton

### Specialized Components

- **`ProfileCardSkeleton`** - Complete profile card loading state
- **`UserCardSkeleton`** - User card skeleton for leaderboards
- **`ContributionGridSkeleton`** - Standalone contribution grid skeleton
- **`MontlyContributionSkeleton`** - Monthly contribution chart skeleton
- **`AuraPanelSkeleton`** - Aura panel loading state

## Usage

```tsx
import { Skeleton, SkeletonAvatar, SkeletonText } from "./ui/skeleton";

// Basic skeleton
<Skeleton className="h-4 w-32" />

// Avatar skeleton
<SkeletonAvatar size="lg" />

// Multi-line text
<SkeletonText lines={3} />

// Complete profile card
<ProfileCardSkeleton />
```

## Features

- **Animated**: Smooth pulse animations
- **Responsive**: Works on all screen sizes
- **Accessible**: Proper ARIA attributes
- **Themed**: Matches the dark theme
- **Performant**: Lightweight and optimized

## Design Principles

1. **Match Content Structure**: Skeletons mirror the actual content layout
2. **Smooth Transitions**: Fade from skeleton to real content
3. **Consistent Styling**: Uses the same color scheme as the app
4. **Performance First**: Minimal DOM nodes and CSS
5. **Accessibility**: Screen reader friendly

## Implementation

The skeleton system replaces generic loading spinners throughout the app:

- Profile cards show structured placeholders
- Leaderboards display skeleton rows
- Contribution grids show skeleton squares
- All components maintain visual hierarchy during loading

This creates a more professional and polished user experience.
