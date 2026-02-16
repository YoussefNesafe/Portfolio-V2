export interface FilterOption {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface BlogFiltersProps {
  categories: FilterOption[];
  tags: FilterOption[];
}
