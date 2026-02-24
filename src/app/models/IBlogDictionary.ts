export interface IBlogHeaderDict {
  title: string;
  subtitle: string;
}

export interface IBlogFiltersDict {
  searchPlaceholder: string;
  categoriesLabel: string;
  categoriesPlaceholder: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  clearAll: string;
  noResults: string;
  noPostsFound: string;
  categoriesSearchPlaceholder: string;
  tagsSearchPlaceholder: string;
}

export interface IBlogPaginationDict {
  previous: string;
  next: string;
  page: string;
  of: string;
}

export interface IBlogErrorDict {
  title: string;
  description: string;
  retry: string;
}

export interface IBlogDictionary {
  header: IBlogHeaderDict;
  filters: IBlogFiltersDict;
  pagination: IBlogPaginationDict;
  error: IBlogErrorDict;
}

export interface IBlogPostDictionary {
  backToBlog: string;
  minRead: string;
  relatedPosts: string;
}
