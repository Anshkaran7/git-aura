import { NextRequest, NextResponse } from "next/server";

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

export async function POST(request: NextRequest) {
  try {
    const profileData: GitHubProfileData = await request.json();

    const openaiApiKey = process.env.OPEN_AI_API_KEY;

    if (!openaiApiKey) {
      // Return fallback message if no API key
      return NextResponse.json({
        funnyMessage: `🔥 ${profileData.username} is crushing it with ${profileData.contributions} contributions! When they say "I'll fix it in a commit," they mean they'll rewrite the entire codebase!`,
        personality: "Code Warrior",
        motivation:
          profileData.currentStreak > 7
            ? "You're on fire! 🔥 Don't let that streak die!"
            : "Time to start a new streak! 🚀",
      });
    }

    const prompt = `Generate a funny, personalized message for a GitHub developer based on their profile data. The message should be:
    - Funny and entertaining
    - Personalized to their stats
    - Encouraging and motivational
    - Include emojis
    - Maximum 2 sentences
    - Make it unique based on their specific data
    
    Developer Profile:
    - Username: ${profileData.username}
    - Display Name: ${profileData.displayName}
    - Bio: ${profileData.bio || "No bio"}
    - Location: ${profileData.location || "Unknown"}
    - Company: ${profileData.company || "Independent"}
    - Public Repos: ${profileData.publicRepos}
    - Followers: ${profileData.followers}
    - Following: ${profileData.following}
    - Account Created: ${profileData.createdAt}
    - Account Age: ${profileData.accountAge} days
    - Total Contributions: ${profileData.contributions}
    - Current Streak: ${profileData.currentStreak} days
    - Total Aura: ${profileData.totalAura}
    - Monthly Aura: ${profileData.monthlyAura}
    - Active Days This Month: ${profileData.activeDays}
    - Average Contributions per Day: ${profileData.averageContributions.toFixed(
      1
    )}
    - Max Contributions in a Day: ${profileData.maxContributions}
    - User ID: ${profileData.userId}
    
    Also provide:
    - A personality type (e.g., "Code Deity", "Git Master", "Commit Crusher", "Code Enthusiast", "Rising Star")
    - A motivational message (1 sentence with emoji)
    
    Make the message unique and funny based on their specific stats. If they have high contributions, make it about being a coding machine. If they have a long streak, mention their consistency. If they're new, encourage them.
    
    Format the response as JSON with keys: funnyMessage, personality, motivation`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content:
              "You are a funny, encouraging AI that creates personalized messages for developers based on their GitHub activity. Keep responses light-hearted and motivational. Make each message unique based on the specific user's data.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 300,
        temperature: 0.9, // Increased temperature for more creative responses
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.statusText}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error("No response from OpenAI");
    }

    // Try to parse JSON response, fallback to structured text if needed
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(aiResponse);
    } catch {
      // If JSON parsing fails, create a structured response
      parsedResponse = {
        funnyMessage: aiResponse,
        personality: getPersonalityFromStats(profileData),
        motivation: getMotivationFromStats(profileData),
      };
    }

    return NextResponse.json({
      funnyMessage:
        parsedResponse.funnyMessage ||
        `🔥 ${profileData.username} is absolutely crushing it with ${profileData.contributions} contributions! Their keyboard probably has a permanent indent from all that coding!`,
      personality: parsedResponse.personality || "Code Warrior",
      motivation: parsedResponse.motivation || "Keep pushing those commits! 💪",
    });
  } catch (error) {
    console.error("Error generating AI message:", error);

    // Return a fallback message
    return NextResponse.json({
      funnyMessage: "🔥 You're doing amazing! Keep coding and keep pushing!",
      personality: "Code Warrior",
      motivation: "Every commit counts! 💪",
    });
  }
}

function getPersonalityFromStats(profileData: GitHubProfileData): string {
  if (profileData.contributions > 2000) return "Code Deity";
  if (profileData.contributions > 1000) return "Git Master";
  if (profileData.contributions > 500) return "Commit Crusher";
  if (profileData.contributions > 100) return "Code Enthusiast";
  return "Rising Star";
}

function getMotivationFromStats(profileData: GitHubProfileData): string {
  if (profileData.currentStreak > 50)
    return "You're absolutely unstoppable! 🔥 Don't let that streak die!";
  if (profileData.currentStreak > 30)
    return "You're on fire! 🔥 Keep that streak alive!";
  if (profileData.currentStreak > 7) return "Nice streak! Keep it going! 💪";
  if (profileData.currentStreak > 0)
    return "Every streak starts with one commit! 🚀";
  return "Time to start a new streak! 🚀";
}
