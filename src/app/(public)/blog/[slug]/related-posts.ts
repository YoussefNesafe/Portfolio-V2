import { db } from "@/app/lib/db";
import { IBlogPost } from "@/app/models/Blog";

export async function getRelatedPosts(
  currentPost: { id: string; categories: { id: string }[]; tags: { id: string }[] },
  limit = 3,
): Promise<IBlogPost[]> {
  const categoryIds = currentPost.categories.map((c) => c.id);
  const tagIds = currentPost.tags.map((t) => t.id);

  const hasOverlap = categoryIds.length > 0 || tagIds.length > 0;

  if (hasOverlap) {
    const candidates = await db.post.findMany({
      where: {
        published: true,
        NOT: { id: currentPost.id },
        OR: [
          ...(categoryIds.length > 0
            ? [{ categories: { some: { id: { in: categoryIds } } } }]
            : []),
          ...(tagIds.length > 0
            ? [{ tags: { some: { id: { in: tagIds } } } }]
            : []),
        ],
      },
      include: { categories: true, tags: true, author: true },
      take: 20,
    });

    if (candidates.length > 0) {
      const catSet = new Set(categoryIds);
      const tagSet = new Set(tagIds);

      candidates.sort((a, b) => {
        const scoreA =
          a.categories.filter((c) => catSet.has(c.id)).length +
          a.tags.filter((t) => tagSet.has(t.id)).length;
        const scoreB =
          b.categories.filter((c) => catSet.has(c.id)).length +
          b.tags.filter((t) => tagSet.has(t.id)).length;
        return scoreB - scoreA;
      });

      return candidates.slice(0, limit) as IBlogPost[];
    }
  }

  // Fallback: most recent posts
  const fallback = await db.post.findMany({
    where: { published: true, NOT: { id: currentPost.id } },
    orderBy: { publishedAt: "desc" },
    take: limit,
    include: { categories: true, tags: true, author: true },
  });

  return fallback as IBlogPost[];
}
