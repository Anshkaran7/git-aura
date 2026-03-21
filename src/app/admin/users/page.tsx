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
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="mx-auto max-w-md rounded-[28px] border border-border bg-card p-8 text-center shadow-[0_30px_80px_-55px_rgba(15,23,42,0.45)]">
          <div className="mb-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
              <svg
                className="h-8 w-8 text-red-300"
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
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground sm:text-3xl">
              Access Denied
            </h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              You do not have permission to access the admin user management
              screen.
            </p>
          </div>
          <div className="rounded-[22px] border border-border bg-background p-4">
            <p className="text-sm leading-6 text-muted-foreground">
              Contact an administrator if you believe this is incorrect.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
        <UserManagement />
      </div>
    </div>
  );
}
