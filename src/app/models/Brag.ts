export interface IBragCategory {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
  createdAt: Date;
  entryCount?: number;
}

export interface IBragEntry {
  id: string;
  title: string;
  description: string;
  impact: string | null;
  date: Date;
  published: boolean;
  pinned: boolean;
  categoryId: string;
  category?: IBragCategory;
  createdAt: Date;
  updatedAt: Date;
}

export interface IBragStats {
  totalEntries: number;
  entriesThisMonth: number;
  currentStreak: number;
  categoriesActive: number;
  heatmapData: { date: string; count: number }[];
  categoryDistribution: { name: string; slug: string; color: string; count: number }[];
  monthlyTrend: { month: string; count: number }[];
  pinnedEntries: (IBragEntry & { category: IBragCategory })[];
}

export interface IBragPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IBragListResponse {
  entries: IBragEntry[];
  pagination: IBragPagination;
}
