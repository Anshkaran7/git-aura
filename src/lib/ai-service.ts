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
  const { username, contributions, currentStreak, totalAura, followers } =
    profileData;

  let personality = "Code Warrior";
  let motivation = "Keep pushing those commits!";
  let funnyMessage = "";

  if (contributions > 1000) {
    personality = "Git Master";
    funnyMessage = `🔥 ${username} is basically a walking git repository at this point. When they say "I'll fix it in a commit," they mean they'll rewrite the entire codebase!`;
  } else if (contributions > 500) {
    personality = "Commit Crusher";
    funnyMessage = `⚡ ${username} commits so much, their keyboard has a permanent indent from the 'git add' shortcut!`;
  } else if (contributions > 100) {
    personality = "Code Enthusiast";
    funnyMessage = `🚀 ${username} is building the future, one commit at a time. Their IDE probably has a "commit" button that's more worn out than the spacebar!`;
  } else {
    personality = "Rising Star";
    funnyMessage = `🌟 ${username} is just getting started on their coding journey. Every great developer was once a beginner who couldn't remember if it's 'git push' or 'git pull'!`;
  }

  if (currentStreak > 30) {
    motivation = "You're on fire! 🔥 Don't let that streak die!";
  } else if (currentStreak > 7) {
    motivation = "Nice streak! Keep it going! 💪";
  } else {
    motivation = "Time to start a new streak! 🚀";
  }

  return {
    funnyMessage,
    personality,
    motivation,
  };
}
