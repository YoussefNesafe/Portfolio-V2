import { Prisma } from "@prisma/client";

interface FilterParams {
  search?: string;
  category?: string;
  tag?: string;
}

export function buildPostFilter(params: FilterParams): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    published: true,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" } },
      { description: { contains: params.search, mode: "insensitive" } },
    ];
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
