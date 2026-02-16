import { Prisma } from "@prisma/client";

export interface FilterParams {
  search?: string;
  category?: string;
  tag?: string;
}

interface FilterOptions {
  includeContent?: boolean;
}

export function buildPostFilter(
  params: FilterParams,
  options: FilterOptions = {},
): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    published: true,
  };

  if (params.search) {
    const searchCondition = { contains: params.search, mode: "insensitive" as const };
    const orClauses: Prisma.PostWhereInput[] = [
      { title: searchCondition },
      { description: searchCondition },
    ];
    if (options.includeContent) {
      orClauses.push({ content: searchCondition });
    }
    where.OR = orClauses;
  }

  const categoryIds = params.category
    ? params.category.split(",").filter(Boolean)
    : [];
  if (categoryIds.length > 0) {
    where.categories = {
      some: { id: { in: categoryIds } },
    };
  }

  const tagIds = params.tag ? params.tag.split(",").filter(Boolean) : [];
  if (tagIds.length > 0) {
    where.tags = {
      some: { id: { in: tagIds } },
    };
  }

  return where;
}
