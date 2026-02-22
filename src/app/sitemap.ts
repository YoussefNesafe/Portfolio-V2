import type { MetadataRoute } from "next";
import { unstable_cache } from "next/cache";
import { db } from "@/app/lib/db";

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://youssefnesafe.com";

const getCachedPosts = unstable_cache(
  async () => {
    return db.post.findMany({
      where: { published: true },
      select: { slug: true, updatedAt: true, coverImage: true },
      orderBy: { publishedAt: "desc" },
    });
  },
  ["sitemap-published-posts"],
  { revalidate: 3600 }
);

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getCachedPosts();

  const blogPostEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: "weekly",
    priority: 0.7,
    ...(post.coverImage ? { images: [post.coverImage] } : {}),
  }));

  return [
    {
      url: BASE_URL,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: posts[0]?.updatedAt,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...blogPostEntries,
  ];
}
