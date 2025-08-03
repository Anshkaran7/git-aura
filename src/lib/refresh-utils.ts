import { prisma } from "@/lib/prisma";

export async function shouldRefreshUserData(userId: string): Promise<{
  shouldRefresh: boolean;
  reason: string;
  lastRefresh?: Date;
}> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        lastContributionDate: true,
        updatedAt: true,
        totalAura: true,
      },
    });

    if (!user) {
      return { shouldRefresh: false, reason: "User not found" };
    }

    const now = new Date();
    const lastContribution = user.lastContributionDate;
    const lastUpdate = user.updatedAt;

    // If user has never contributed, refresh once per day
    if (!lastContribution) {
      const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return {
        shouldRefresh: hoursSinceLastUpdate > 24,
        reason:
          hoursSinceLastUpdate > 24
            ? "No contributions, daily refresh due"
            : "No contributions, recently updated",
        lastRefresh: lastUpdate,
      };
    }

    // If user has recent contributions (last 7 days), refresh more frequently
    const daysSinceLastContribution =
      (now.getTime() - lastContribution.getTime()) / (1000 * 60 * 60 * 24);

    if (daysSinceLastContribution <= 7) {
      // Active users: refresh every 2 hours
      const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return {
        shouldRefresh: hoursSinceLastUpdate > 2,
        reason:
          hoursSinceLastUpdate > 2
            ? "Active user, 2-hour refresh due"
            : "Active user, recently updated",
        lastRefresh: lastUpdate,
      };
    } else if (daysSinceLastContribution <= 30) {
      // Semi-active users: refresh every 6 hours
      const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return {
        shouldRefresh: hoursSinceLastUpdate > 6,
        reason:
          hoursSinceLastUpdate > 6
            ? "Semi-active user, 6-hour refresh due"
            : "Semi-active user, recently updated",
        lastRefresh: lastUpdate,
      };
    } else {
      // Inactive users: refresh once per day
      const hoursSinceLastUpdate =
        (now.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60);
      return {
        shouldRefresh: hoursSinceLastUpdate > 24,
        reason:
          hoursSinceLastUpdate > 24
            ? "Inactive user, daily refresh due"
            : "Inactive user, recently updated",
        lastRefresh: lastUpdate,
      };
    }
  } catch (error) {
    console.error("Error in shouldRefreshUserData:", error);
    return { shouldRefresh: false, reason: "Error checking refresh status" };
  }
}

export async function getUsersNeedingRefresh(): Promise<string[]> {
  try {
    const users = await prisma.user.findMany({
      where: {
        isBanned: false,
        githubUsername: { not: null },
      },
      select: {
        id: true,
      },
    });

    const usersNeedingRefresh: string[] = [];

    for (const user of users) {
      const decision = await shouldRefreshUserData(user.id);
      if (decision.shouldRefresh) {
        usersNeedingRefresh.push(user.id);
      }
    }

    return usersNeedingRefresh;
  } catch (error) {
    console.error("Error in getUsersNeedingRefresh:", error);
    return [];
  }
}
