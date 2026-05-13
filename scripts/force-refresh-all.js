const { PrismaClient } = require('@prisma/client');
require('dotenv').config();

// We need to replicate some logic from src/lib because we can't easily import TS
// Or we can try to use jiti/tsx to run the TS logic directly.
// Let's use a simpler approach: use the Prisma client and fetch directly.

const prisma = new PrismaClient();
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;

async function fetchGitHubContributions(username) {
  const graphqlQuery = {
    query: `query($userName:String!) { 
      user(login: $userName) {
        contributionsCollection { 
          contributionCalendar { 
            totalContributions
            weeks {
              contributionDays {
                date
                contributionCount
              }
            }
          } 
        }
        followers { totalCount }
        following { totalCount }
        repositories(privacy: PUBLIC, isFork: false, first: 100) {
          totalCount
        }
        createdAt
        bio
      }
    }`,
    variables: { userName: username },
  };

  const response = await fetch("https://api.github.com/graphql", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(graphqlQuery),
  });

  const data = await response.json();
  if (!data.data || !data.data.user) return null;

  const calendar = data.data.user.contributionsCollection.contributionCalendar;
  const contributionDays = calendar.weeks.flatMap(w => w.contributionDays);

  return {
    contributionDays,
    githubProfile: {
      public_repos: data.data.user.repositories.totalCount,
      followers: data.data.user.followers.totalCount,
      following: data.data.user.following.totalCount,
      created_at: data.data.user.createdAt,
      bio: data.data.user.bio,
      login: username
    }
  };
}

// Replicate calculateStreak from aura-calculations.ts
function calculateStreak(contributionDays) {
  if (!contributionDays.length) return 0;
  const sortedDays = [...contributionDays].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  let streak = 0;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  let expectedDiff = 0;
  for (const day of sortedDays) {
    const dayDate = new Date(day.date);
    dayDate.setHours(0, 0, 0, 0);
    const dayDiff = Math.floor((today.getTime() - dayDate.getTime()) / (1000 * 60 * 60 * 24));
    if (day.contributionCount > 0) {
      if (dayDiff === expectedDiff) { streak++; expectedDiff++; }
      else if (dayDiff === 1 && expectedDiff === 0) { streak = 1; expectedDiff = 2; }
      else break;
    } else {
      if (dayDiff === expectedDiff) {
        if (dayDiff === 0) expectedDiff = 1;
        else break;
      } else if (dayDiff > expectedDiff) continue;
    }
  }
  return streak;
}

function calculateMonthlyAura(monthlyContributions, activeDays, daysInMonth) {
  const contributionAura = monthlyContributions * 5;
  const activityBonus = activeDays * 10;
  const consistencyRatio = activeDays / daysInMonth;
  const consistencyBonus = Math.round(consistencyRatio * 250);
  return Math.round(contributionAura + activityBonus + consistencyBonus);
}

async function refreshUser(user) {
  try {
    const data = await fetchGitHubContributions(user.githubUsername);
    if (!data) return false;

    const { contributionDays, githubProfile } = data;
    const currentStreak = calculateStreak(contributionDays);
    const now = new Date();
    const currentMonthYear = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
    
    // Group by month
    const groupedByMonth = {};
    contributionDays.forEach(day => {
      const monthYear = day.date.substring(0, 7);
      if (!groupedByMonth[monthYear]) groupedByMonth[monthYear] = [];
      groupedByMonth[monthYear].push(day);
    });

    for (const [monthYear, monthlyContributions] of Object.entries(groupedByMonth)) {
      const [y, m] = monthYear.split("-").map(Number);
      const daysInMonth = new Date(y, m, 0).getDate();
      const count = monthlyContributions.reduce((s, d) => s + d.contributionCount, 0);
      const activeDays = monthlyContributions.filter(d => d.contributionCount > 0).length;
      const aura = calculateMonthlyAura(count, activeDays, daysInMonth);

      await prisma.monthlyLeaderboard.upsert({
        where: { userId_monthYear: { userId: user.id, monthYear } },
        create: { userId: user.id, monthYear, totalAura: aura, contributionsCount: count, rank: 999999 },
        update: { totalAura: aura, contributionsCount: count }
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { currentStreak, updatedAt: new Date() }
    });

    console.log(`✅ Refreshed ${user.githubUsername}`);
    return true;
  } catch (e) {
    console.error(`❌ Error refreshing ${user.githubUsername}:`, e.message);
    return false;
  }
}

async function recalculateRanks(monthYear) {
  console.log(`🏆 Recalculating ranks for ${monthYear}...`);
  
  const leaderboard = await prisma.monthlyLeaderboard.findMany({
    where: { monthYear: monthYear },
    orderBy: { totalAura: "desc" },
  });

  for (let i = 0; i < leaderboard.length; i++) {
    await prisma.monthlyLeaderboard.update({
      where: { id: leaderboard[i].id },
      data: { rank: i + 1 }
    });
  }
  console.log(`✅ Ranks updated for ${monthYear}!`);
}

async function awardBadges() {
  console.log("🏅 Awarding badges...");
  try {
    const response = await fetch("http://localhost:3000/api/award-badges", {
      method: "POST"
    });
    const result = await response.json();
    console.log(`✅ Badges updated: ${result.message}`);
  } catch (e) {
    console.error("❌ Failed to award badges (server might be down):", e.message);
  }
}

async function main() {
  const users = await prisma.user.findMany({
    where: { isBanned: false, githubUsername: { not: null } }
  });

  console.log(`Starting refresh for ${users.length} users...`);
  let successCount = 0;

  for (const user of users) {
    const success = await refreshUser(user);
    if (success) successCount++;
    await new Promise(r => setTimeout(r, 200)); // Small delay
  }

  console.log(`Finished! Successfully refreshed ${successCount}/${users.length} users.`);
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  
  // Get previous month (April)
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonth = `${prevDate.getFullYear()}-${String(prevDate.getMonth() + 1).padStart(2, "0")}`;

  await recalculateRanks(prevMonth); // Finalize April
  await recalculateRanks(currentMonth); // Update May
  await awardBadges();
}

main().catch(console.error).finally(() => prisma.$disconnect());
