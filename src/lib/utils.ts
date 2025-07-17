import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format numbers with appropriate suffixes
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
}

// Calculate days between dates
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

// Get current month-year string
export function getCurrentMonthYear(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// Get badge color based on rarity
export function getBadgeColor(rarity: string): string {
  switch (rarity) {
    case "legendary":
      return "from-yellow-400 to-yellow-600";
    case "epic":
      return "from-purple-400 to-purple-600";
    case "rare":
      return "from-blue-400 to-blue-600";
    case "common":
      return "from-gray-400 to-gray-600";
    default:
      return "from-gray-400 to-gray-600";
  }
}

// Format date for display
export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Calculate streak from contribution days
export function calculateStreak(
  contributionDays: Array<{ date: string; contributionCount: number }>
): number {
  if (!contributionDays || contributionDays.length === 0) return 0;

  // Sort days by date (newest first)
  const sortedDays = [...contributionDays].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check each day starting from today, going backwards
  for (let dayOffset = 0; dayOffset < sortedDays.length; dayOffset++) {
    const checkDate = new Date(today);
    checkDate.setDate(today.getDate() - dayOffset);

    // Find contribution for this specific date
    const contribution = sortedDays.find((day) => {
      const dayDate = new Date(day.date);
      dayDate.setHours(0, 0, 0, 0);
      return dayDate.getTime() === checkDate.getTime();
    });

    if (contribution && contribution.contributionCount > 0) {
      streak++;
    } else {
      // If this is the first day (today) and it has 0 contributions,
      // we can still continue to check yesterday
      if (dayOffset === 0) {
        continue;
      }
      // Otherwise, streak is broken
      break;
    }
  }

  return streak;
}

// Get aura status and fun message
export function getAuraStatus(aura: number): {
  status: string;
  message: string;
  color: string;
  emoji: string;
  level: string;
} {
  if (aura >= 10000) {
    return {
      status: "legendary",
      message: "You're basically Neo from The Matrix! 🕶️",
      color: "text-yellow-500",
      emoji: "👑",
      level: "Code Deity",
    };
  } else if (aura >= 5000) {
    return {
      status: "epic",
      message: "GitHub trembles before your commits! 🌟",
      color: "text-purple-500",
      emoji: "🚀",
      level: "Elite Hacker",
    };
  } else if (aura >= 2000) {
    return {
      status: "high",
      message: "Your code radiates pure energy! ⚡",
      color: "text-blue-500",
      emoji: "⚡",
      level: "Code Warrior",
    };
  } else if (aura >= 1000) {
    return {
      status: "good",
      message: "Nice aura, keep the momentum! 💪",
      color: "text-green-500",
      emoji: "🔥",
      level: "Active Coder",
    };
  } else if (aura >= 500) {
    return {
      status: "decent",
      message: "Building that coding karma! 📈",
      color: "text-cyan-500",
      emoji: "📊",
      level: "Code Padawan",
    };
  } else if (aura >= 100) {
    return {
      status: "starting",
      message: "Every master started somewhere! 🌱",
      color: "text-lime-500",
      emoji: "🌱",
      level: "Code Seedling",
    };
  } else if (aura > 0) {
    return {
      status: "low",
      message: "Time to flex those coding muscles! 💻",
      color: "text-orange-500",
      emoji: "💻",
      level: "Code Newbie",
    };
  } else if (aura === 0) {
    return {
      status: "neutral",
      message: "Your coding journey starts here! ✨",
      color: "text-gray-500",
      emoji: "✨",
      level: "Undiscovered",
    };
  } else {
    return {
      status: "negative",
      message: "Even Thanos had bad days... time to commit! 😤",
      color: "text-red-500",
      emoji: "😤",
      level: "Code Villain",
    };
  }
}

// Get streak message
export function getStreakMessage(streak: number): {
  message: string;
  emoji: string;
  color: string;
} {
  if (streak >= 100) {
    return {
      message: "You're unstoppable! Are you even human? 🤖",
      emoji: "🤖",
      color: "text-yellow-500",
    };
  } else if (streak >= 50) {
    return {
      message: "Legendary consistency! You're on fire! 🔥",
      emoji: "🔥",
      color: "text-red-500",
    };
  } else if (streak >= 30) {
    return {
      message: "Amazing streak! GitHub loves you! 💚",
      emoji: "💚",
      color: "text-green-500",
    };
  } else if (streak >= 14) {
    return {
      message: "Two weeks strong! You're in the zone! ⚡",
      emoji: "⚡",
      color: "text-blue-500",
    };
  } else if (streak >= 7) {
    return {
      message: "Week-long warrior! Keep it up! 💪",
      emoji: "💪",
      color: "text-purple-500",
    };
  } else if (streak >= 3) {
    return {
      message: "Building momentum! 📈",
      emoji: "📈",
      color: "text-cyan-500",
    };
  } else if (streak >= 1) {
    return {
      message: "Every journey starts with a single commit! 🌟",
      emoji: "🌟",
      color: "text-lime-500",
    };
  } else {
    return {
      message: "Time to start a new streak! 💻",
      emoji: "💻",
      color: "text-gray-500",
    };
  }
}
