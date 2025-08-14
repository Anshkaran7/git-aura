import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Check if a user is an admin based on their email or GitHub username
 */
export function isUserAdmin(
  email?: string | null,
  githubUsername?: string | null
): boolean {
  if (!email && !githubUsername) return false;

  // Get admin emails and usernames from environment
  const adminEmails =
    process.env.ADMIN_EMAILS?.split(",").map((email) =>
      email.trim().toLowerCase()
    ) || [];

  const adminUsernames =
    process.env.ADMIN_GITHUB_USERNAMES?.split(",").map((username) =>
      username.trim().toLowerCase()
    ) || [];

  // Check if user's email is in admin list
  if (email && adminEmails.includes(email.toLowerCase())) {
    return true;
  }

  // Check if user's GitHub username is in admin list
  if (githubUsername && adminUsernames.includes(githubUsername.toLowerCase())) {
    return true;
  }

  return false;
}
