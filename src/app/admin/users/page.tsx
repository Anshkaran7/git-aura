import UserManagement from "@/components/admin/UserManagement";
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

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

  if (!userId) {
    redirect("/sign-in");
  }

  if (!(await isAdmin())) {
    return (
      <div className="min-h-screen bg-black transition-colors duration-300 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-red-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                />
              </svg>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-3">
              Access Denied
            </h1>
            <p className="text-[#7d8590] text-sm sm:text-base">
              You don't have permission to access this page.
            </p>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <p className="text-gray-400 text-sm">
              You are not authorized to access this page. Please contact the
              administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black transition-colors duration-300">
      <div className="max-w-[95vw] sm:max-w-[90vw] md:max-w-5xl lg:max-w-6xl mx-auto px-3 sm:px-4 md:px-6 pt-20 sm:pt-24 md:pt-28 pb-8 sm:pb-10">
        <UserManagement />
      </div>
    </div>
  );
}
