import { prisma } from "./prisma";

export interface BanCheckResult {
  isBanned: boolean;
  reason?: string;
  bannedAt?: Date;
  expiresAt?: Date;
  isExpired?: boolean;
}

// Remove banned user from leaderboards
export async function removeBannedUserFromLeaderboards(
  userId: string
): Promise<void> {
  try {
    console.log(`🚫 [Ban] Removing user ${userId} from leaderboards`);

    // Remove from monthly leaderboards
    await prisma.monthlyLeaderboard.deleteMany({
      where: { userId },
    });

    // Remove from global leaderboard
    await prisma.globalLeaderboard.deleteMany({
      where: { userId },
    });

    console.log(
      `✅ [Ban] Successfully removed user ${userId} from leaderboards`
    );
  } catch (error) {
    console.error("Error removing banned user from leaderboards:", error);
  }
}

export async function checkUserBanStatus(
  userId: string
): Promise<BanCheckResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        isBanned: true,
        banReason: true,
        bannedAt: true,
        banExpiresAt: true,
      },
    });

    if (!user) {
      return { isBanned: false };
    }

    // If not banned, return early
    if (!user.isBanned) {
      return { isBanned: false };
    }

    // Check if temporary ban has expired
    if (user.banExpiresAt && new Date() > user.banExpiresAt) {
      // Auto-unban expired user
      await prisma.user.update({
        where: { id: userId },
        data: {
          isBanned: false,
          banReason: null,
          bannedAt: null,
          bannedBy: null,
          banExpiresAt: null,
        },
      });

      console.log(`⏰ [Ban Check] Auto-unbanned expired user: ${userId}`);

      return {
        isBanned: false,
        isExpired: true,
      };
    }

    return {
      isBanned: true,
      reason: user.banReason || undefined,
      bannedAt: user.bannedAt || undefined,
      expiresAt: user.banExpiresAt || undefined,
    };
  } catch (error) {
    console.error("Error checking ban status:", error);
    // In case of error, err on the side of caution and allow access
    return { isBanned: false };
  }
}

export async function checkGithubUsernameBanStatus(
  githubUsername: string
): Promise<BanCheckResult> {
  try {
    const user = await prisma.user.findUnique({
      where: { githubUsername },
      select: {
        id: true,
        isBanned: true,
        banReason: true,
        bannedAt: true,
        banExpiresAt: true,
      },
    });

    if (!user) {
      return { isBanned: false };
    }

    return await checkUserBanStatus(user.id);
  } catch (error) {
    console.error("Error checking ban status by username:", error);
    return { isBanned: false };
  }
}
