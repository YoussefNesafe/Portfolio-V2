import { Prisma } from "@prisma/client";

export const POST_INCLUDE_FULL = {
  author: true,
  categories: true,
  tags: true,
} satisfies Prisma.PostInclude;

export const PUBLISHED_POST_FILTER = {
  published: true,
} satisfies Prisma.PostWhereInput;

export const ENTITY_WITH_PUBLISHED_COUNT = {
  _count: {
    select: { posts: { where: { published: true } } },
  },
} as const;

export const HAS_PUBLISHED_POSTS = {
  posts: { some: { published: true } },
} as const;
