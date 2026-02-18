import { Prisma } from "@prisma/client";

export const BRAG_ENTRY_INCLUDE = {
  category: true,
} satisfies Prisma.BragEntryInclude;

export const PUBLISHED_BRAG_FILTER = {
  published: true,
} satisfies Prisma.BragEntryWhereInput;
