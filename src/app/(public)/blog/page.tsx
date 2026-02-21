export const revalidate = 3600; // Revalidate every hour

import Link from "next/link";
import { db } from "@/app/lib/db";
import BlogCard from "./components/BlogCard";
import BlogFilters from "./components/BlogFilters";
import { Suspense } from "react";
import { buildPostFilter } from "@/app/lib/build-post-filter";
import { POSTS_PER_PAGE } from "@/app/lib/constants";
import {
  POST_INCLUDE_FULL,
  HAS_PUBLISHED_POSTS,
  ENTITY_WITH_PUBLISHED_COUNT,
} from "@/app/api/blog/helpers/prisma-includes";
import { buildQueryString } from "./build-query-string";

interface SearchParams {
  page?: string;
  category?: string;
  tag?: string;
  search?: string;
}

export const metadata = {
  title: "Blog",
  description: "Read my latest articles and insights",
};

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  let page = parseInt(params.page || "1", 10);
  if (isNaN(page) || page < 1) page = 1;
  const limit = POSTS_PER_PAGE;
  const skip = (page - 1) * limit;

  const where = buildPostFilter(params);

  // Fetch posts and total count
  const [posts, total, categories, tags] = await Promise.all([
    db.post.findMany({
      where,
      include: POST_INCLUDE_FULL,
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.post.count({ where }),
    db.category.findMany({
      where: HAS_PUBLISHED_POSTS,
      include: ENTITY_WITH_PUBLISHED_COUNT,
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      where: HAS_PUBLISHED_POSTS,
      include: ENTITY_WITH_PUBLISHED_COUNT,
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return (
    <section className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw] pb-[10.68vw] tablet:pb-[10vw] desktop:pb-[6.24vw]">
      <Suspense fallback={null}>
        <BlogFilters
          categories={categories.map((c) => ({
            id: c.id,
            name: c.name,
            slug: c.slug,
            postCount: c._count.posts,
          }))}
          tags={tags.map((t) => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            postCount: t._count.posts,
          }))}
        />
      </Suspense>

      {/* Posts Grid */}
      {posts.length > 0 ? (
        <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
          {posts.map((post) => (
            <BlogCard
              key={post.id}
              id={post.id}
              slug={post.slug}
              title={post.title}
              description={post.description}
              coverImage={post.coverImage || undefined}
              categories={post.categories}
              publishedAt={post.publishedAt || undefined}
              searchQuery={params.search}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-[13.333vw] tablet:py-[6.667vw] desktop:py-[2.778vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            No posts found. Try adjusting your filters.
          </p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] py-[8vw] tablet:py-[4vw] desktop:py-[1.667vw]">
          {page > 1 && (
            <Link
              href={buildQueryString(params, { page: String(page - 1) })}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
            >
              Previous
            </Link>
          )}

          <span className="text-text-muted text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]">
            Page {page} of {totalPages}
          </span>

          {page < totalPages && (
            <Link
              href={buildQueryString(params, { page: String(page + 1) })}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </section>
  );
}
