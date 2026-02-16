import { Prisma } from "@prisma/client";

export function buildPostFilter(searchParams: URLSearchParams): Prisma.PostWhereInput {
  const where: Prisma.PostWhereInput = {
    published: true,
  };

  const searchQuery = searchParams.get("search");
  if (searchQuery) {
    where.OR = [
      { title: { contains: searchQuery, mode: "insensitive" } },
      { description: { contains: searchQuery, mode: "insensitive" } },
      { content: { contains: searchQuery, mode: "insensitive" } },
    ];
  }

  const categoryId = searchParams.get("category");
  const categoryIds = categoryId
    ? categoryId.split(",").filter(Boolean)
    : [];
  if (categoryIds.length > 0) {
    where.categories = {
      some: { id: { in: categoryIds } },
    };
  }

  const tagId = searchParams.get("tag");
  const tagIds = tagId ? tagId.split(",").filter(Boolean) : [];
  if (tagIds.length > 0) {
    where.tags = {
      some: { id: { in: tagIds } },
    };
  }

  return where;
}
