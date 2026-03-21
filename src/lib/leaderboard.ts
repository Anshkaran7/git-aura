const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MONTH_YEAR_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;
export const LEADERBOARD_LAUNCH_MONTH = "2025-07";

export interface MonthWindow {
  monthYear: string;
  monthStart: Date;
  monthEnd: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface MonthlyRankingValues {
  aura: number;
  contributions: number;
  username: string;
}

export function compareMonthYear(left: string, right: string) {
  return left.localeCompare(right);
}

export function isMonthBeforeLaunch(monthYear: string) {
  return compareMonthYear(monthYear, LEADERBOARD_LAUNCH_MONTH) < 0;
}

export function clampMonthYearToLaunch(monthYear: string) {
  return isMonthBeforeLaunch(monthYear) ? LEADERBOARD_LAUNCH_MONTH : monthYear;
}

export function getDaysInMonthFromMonthYear(monthYear: string) {
  const [year, month] = monthYear.split("-").map(Number);
  return new Date(year, month, 0).getDate();
}

export function getNormalizedMonthlyAura(
  totalAura: number,
  contributionsCount: number,
  monthYear: string
) {
  const daysInMonth = getDaysInMonthFromMonthYear(monthYear);
  const maxExpectedAura = contributionsCount * 5 + daysInMonth * 10 + 250;

  return Math.min(totalAura, maxExpectedAura);
}

export function getMonthlyRankingValues(
  totalAura: number,
  contributionsCount: number,
  monthYear: string,
  username: string
): MonthlyRankingValues {
  return {
    aura: getNormalizedMonthlyAura(totalAura, contributionsCount, monthYear),
    contributions: contributionsCount,
    username: username.toLowerCase(),
  };
}

export function parsePositiveInt(
  value: string | null,
  fallback: number,
  max = Number.MAX_SAFE_INTEGER
): number {
  if (!value) {
    return fallback;
  }

  const parsedValue = Number.parseInt(value, 10);

  if (!Number.isFinite(parsedValue) || parsedValue < 1) {
    return fallback;
  }

  return Math.min(parsedValue, max);
}

export function parseLeaderboardPagination(searchParams: URLSearchParams) {
  const page = parsePositiveInt(searchParams.get("page"), DEFAULT_PAGE);
  const limit = parsePositiveInt(searchParams.get("limit"), DEFAULT_LIMIT, MAX_LIMIT);

  return { page, limit };
}

export function buildPagination(totalCount: number, { page, limit }: PaginationOptions) {
  const totalPages = Math.max(1, Math.ceil(totalCount / limit));
  const currentPage = Math.min(page, totalPages);

  return {
    currentPage,
    totalPages,
    totalCount,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    limit,
  };
}

export function paginateEntries<T>(entries: T[], pagination: PaginationOptions) {
  const safePage = Math.max(1, pagination.page);
  const safeLimit = Math.max(1, pagination.limit);
  const startIndex = (safePage - 1) * safeLimit;

  return entries.slice(startIndex, startIndex + safeLimit);
}

export function compareMonthlyRankingValues(
  left: MonthlyRankingValues,
  right: MonthlyRankingValues
) {
  if (right.aura !== left.aura) {
    return right.aura - left.aura;
  }

  if (right.contributions !== left.contributions) {
    return right.contributions - left.contributions;
  }

  return left.username.localeCompare(right.username);
}

export function sortMonthlyRankedEntries<T>(
  entries: T[],
  getValues: (entry: T) => MonthlyRankingValues
) {
  return [...entries].sort((left, right) =>
    compareMonthlyRankingValues(getValues(left), getValues(right))
  );
}

export function parseMonthWindow(monthYear: string | null): MonthWindow | null {
  if (!monthYear || !MONTH_YEAR_PATTERN.test(monthYear)) {
    return null;
  }

  if (isMonthBeforeLaunch(monthYear)) {
    return null;
  }

  const [year, month] = monthYear.split("-").map(Number);

  return {
    monthYear,
    monthStart: new Date(year, month - 1, 1),
    monthEnd: new Date(year, month, 0),
  };
}
