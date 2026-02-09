export interface IBlogPost {
  id: string;
  slug: string;
  title: string;
  description: string;
  content: string;
  excerpt?: string | null;
  coverImage?: string | null;
  published: boolean;
  publishedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;
  author?: IBlogAuthor;
  categories?: IBlogCategory[];
  tags?: IBlogTag[];
}

export interface IBlogAuthor {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
}

export interface IBlogCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  _count?: { posts: number };
}

export interface IBlogTag {
  id: string;
  name: string;
  slug: string;
  _count?: { posts: number };
}

export interface IBlogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface IBlogListResponse {
  posts: IBlogPost[];
  pagination: IBlogPagination;
}
