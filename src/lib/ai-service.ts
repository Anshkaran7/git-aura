interface GitHubProfileData {
  username: string;
  displayName: string;
  bio?: string;
  location?: string;
  company?: string;
  publicRepos: number;
  followers: number;
  following: number;
  createdAt: string;
  contributions: number;
  currentStreak: number;
  totalAura: number;
  monthlyAura: number;
  activeDays: number;
  userId: string;
  accountAge: number;
  averageContributions: number;
  maxContributions: number;
}

interface AIResponse {
  funnyMessage: string;
  personality: string;
  motivation: string;
}

export async function generateFunnyProfileMessage(
  profileData: GitHubProfileData
): Promise<AIResponse> {
  try {
    const response = await fetch("/api/ai/generate-profile-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(profileData),
    });

    if (!response.ok) {
      throw new Error("Failed to generate AI message");
    }

    return await response.json();
  } catch (error) {
    console.error("Error generating AI message:", error);

    // Fallback messages based on profile data
    return generateFallbackMessage(profileData);
  }
}

function generateFallbackMessage(profileData: GitHubProfileData): AIResponse {
  const {
    username,
    contributions,
    currentStreak,
    totalAura,
    followers,
    accountAge,
    averageContributions,
    maxContributions,
  } = profileData;

  let personality = "Code Warrior";
  let motivation = "Keep pushing those commits!";
  let funnyMessage = "";

  // More unique personality types based on various factors
  if (contributions > 2000) {
    personality = "Code Deity";
    funnyMessage = `👑 ${username} is basically Neo from The Matrix! 🕶️ When they say "I'll fix it in a commit," they mean they'll rewrite the entire codebase!`;
  } else if (contributions > 1000) {
    personality = "Git Master";
    funnyMessage = `🔥 ${username} is basically a walking git repository at this point. Their keyboard probably has a permanent indent from all that coding!`;
  } else if (contributions > 500) {
    personality = "Commit Crusher";
    funnyMessage = `⚡ ${username} commits so much, their IDE probably has a "commit" button that's more worn out than the spacebar!`;
  } else if (contributions > 100) {
    personality = "Code Enthusiast";
    funnyMessage = `🚀 ${username} is building the future, one commit at a time. Every great developer was once a beginner who couldn't remember if it's 'git push' or 'git pull'!`;
  } else {
    personality = "Rising Star";
    funnyMessage = `🌟 ${username} is just getting started on their coding journey. The best time to plant a tree was 20 years ago, the second best time is now!`;
  }

  // More personalized motivation based on streak and performance
  if (currentStreak > 50) {
    motivation = "You're absolutely unstoppable! 🔥 Don't let that streak die!";
  } else if (currentStreak > 30) {
    motivation = "You're on fire! 🔥 Keep that streak alive!";
  } else if (currentStreak > 7) {
    motivation = "Nice streak! Keep it going! 💪";
  } else if (currentStreak > 0) {
    motivation = "Every streak starts with one commit! 🚀";
  } else {
    motivation = "Time to start a new streak! 🚀";
  }

  return {
    funnyMessage,
    personality,
    motivation,
  };
}
