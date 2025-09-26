export interface User {
  id: string;
  display_name: string;
  github_username: string;
  avatar_url: string;
  total_aura: number;
  current_streak: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  rarity: string;
  month_year?: string;
  rank?: number;
}

export interface LeaderboardEntry {
  rank: number;
  user: User;
  aura: number;
  contributions?: number;
  badges: Badge[];
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  limit: number;
}

export type ViewType = "monthly" | "alltime";

// Virtual scrolling types
export interface VirtualScrollItemData<T = any> {
  items: T[];
  itemCount: number;
  additionalData?: Record<string, any>;
}

export interface ScrollPosition {
  scrollTop: number;
  scrollLeft: number;
}