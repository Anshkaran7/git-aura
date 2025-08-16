import { useMemo } from "react";
import { useUser } from "@clerk/nextjs";

export const useNavigationUrls = () => {
  const { user } = useUser();
  const githubAccount = user?.externalAccounts?.find(
    (acc) => acc.provider === "github"
  );
  const username = githubAccount?.username;

  
  const leaderboardUrl = useMemo(
    () => (username ? `/${username}/leaderboard` : "/leaderboard"),
    [username]
  );

  const userProfileUrl = useMemo(
    () => (username ? `/${username}` : "/profile"),
    [username]
  );

 
  const mainNavItems = useMemo(
    () => [
      { href: leaderboardUrl, label: "Leaderboard" },
      { href: "/monthly-winners", label: "Monthly Winners" },
      { href: "/battle", label: "Profile Compare" },
      { href: "/contribute", label: "Contribute" },
      { href: userProfileUrl, label: "My Profile" }, 
    ],
    [leaderboardUrl, userProfileUrl]
  );

  return { leaderboardUrl, userProfileUrl, mainNavItems, username };
};
