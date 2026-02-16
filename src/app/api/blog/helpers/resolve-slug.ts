import { slugify, generateUniqueSlug } from "@/app/utils/slugify";

type TransactionClient = {
  post: {
    findUnique: (args: { where: { slug: string } }) => Promise<{ id: string; slug: string } | null>;
  };
};

/**
 * Resolve the slug for a new post.
 * Uses the custom slug if provided, otherwise generates one from the title.
 * Ensures uniqueness within the transaction.
 */
export async function resolveNewPostSlug(
  tx: TransactionClient,
  title: string,
  customSlug?: string,
): Promise<string> {
  let slug = customSlug || slugify(title);

  const existingPost = await tx.post.findUnique({ where: { slug } });

  if (existingPost) {
    slug = await generateUniqueSlug(slug, undefined, async (testSlug) => {
      const p = await tx.post.findUnique({ where: { slug: testSlug } });
      return !!p;
    });
  }

  return slug;
}

/**
 * Resolve the slug for an existing post being updated.
 * Only recalculates when the title changes or a custom slug is provided.
 * Ensures uniqueness excluding the current post.
 */
export async function resolveUpdatedPostSlug(
  tx: TransactionClient,
  postId: string,
  existingPost: { title: string; slug: string },
  title?: string,
  customSlug?: string,
): Promise<string> {
  const titleChanged = title && title !== existingPost.title;
  if (!titleChanged && !customSlug) {
    return existingPost.slug;
  }

  const slug = customSlug || slugify(title || existingPost.title);

  const slugConflict = await tx.post.findUnique({ where: { slug } });

  if (slugConflict && slugConflict.id !== postId) {
    return generateUniqueSlug(slug, existingPost.slug, async (testSlug) => {
      const post = await tx.post.findUnique({ where: { slug: testSlug } });
      return !!post && post.id !== postId;
    });
  }

  return slug;
}
