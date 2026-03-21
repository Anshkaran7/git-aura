export function getGitHubAvatarFallback(
  githubUsername?: string | null,
  size = 200
) {
  const username = githubUsername?.trim();

  if (!username) {
    return null;
  }

  return `https://avatars.githubusercontent.com/${encodeURIComponent(
    username
  )}?size=${size}`;
}

export function getAvatarInitials(
  displayName?: string | null,
  githubUsername?: string | null
) {
  const source = (displayName || githubUsername || "?").trim();

  if (!source) {
    return "?";
  }

  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  return `${parts[0][0] || ""}${parts[1][0] || ""}`.toUpperCase();
}
