import { POSTS_PER_PAGE } from "@/app/lib/constants";

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = POSTS_PER_PAGE;
const MAX_LIMIT = 50;

interface PaginationParams {
  page: number;
  limit: number;
  skip: number;
}

export function parsePagination(searchParams: URLSearchParams): PaginationParams {
  let page = parseInt(searchParams.get("page") || "1", 10);
  if (isNaN(page) || page < 1) page = DEFAULT_PAGE;

  let limit = parseInt(searchParams.get("limit") || "9", 10);
  if (isNaN(limit) || limit < 1) limit = DEFAULT_LIMIT;
  limit = Math.min(limit, MAX_LIMIT);

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}
