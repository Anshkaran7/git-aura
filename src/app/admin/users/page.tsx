import UserManagement from "@/components/admin/UserManagement";
import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

// Helper function to check if user is admin
async function isAdmin(): Promise<boolean> {
  try {
    const user = await currentUser();
    if (!user) return false;

    // Get admin emails and usernames from environment
    const adminEmails =
      process.env.ADMIN_EMAILS?.split(",").map((email) =>
        email.trim().toLowerCase()
      ) || [];
    const adminUsernames =
      process.env.ADMIN_GITHUB_USERNAMES?.split(",").map((username) =>
        username.trim().toLowerCase()
      ) || [];

    // Check primary email
    const primaryEmail = user.emailAddresses
      ?.find((email) => email.id === user.primaryEmailAddressId)
      ?.emailAddress?.toLowerCase();

    if (primaryEmail && adminEmails.includes(primaryEmail)) {
      return true;
    }

    // Check GitHub username from external accounts
    const githubAccount = user.externalAccounts?.find(
      (account) => account.provider === "github"
    );

    if (
      githubAccount?.username &&
      adminUsernames.includes(githubAccount.username.toLowerCase())
    ) {
      return true;
    }

    // Check Clerk username as fallback
    if (user.username && adminUsernames.includes(user.username.toLowerCase())) {
      return true;
    }

    return false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

export default async function AdminUsersPage() {
  const { userId } = await auth();

  // Non-admins (signed in or not) get a plain 404 so the admin area isn't discoverable.
  if (!userId || !(await isAdmin())) {
    notFound();
  }


  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-10">
        <UserManagement />
      </div>
    </div>
  );
}
