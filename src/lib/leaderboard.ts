const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 100;
const MONTH_YEAR_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

export interface MonthWindow {
  monthYear: string;
  monthStart: Date;
  monthEnd: Date;
}

export interface PaginationOptions {
  page: number;
  limit: number;
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

export function parseMonthWindow(monthYear: string | null): MonthWindow | null {
  if (!monthYear || !MONTH_YEAR_PATTERN.test(monthYear)) {
    return null;
  }

  const [year, month] = monthYear.split("-").map(Number);

  return {
    monthYear,
    monthStart: new Date(year, month - 1, 1),
    monthEnd: new Date(year, month, 0),
  };
}
