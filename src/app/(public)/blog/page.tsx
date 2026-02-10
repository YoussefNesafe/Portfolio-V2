export const revalidate = 3600; // Revalidate every hour

import Link from "next/link";
import { db } from "@/app/lib/db";
import BlogCard from "./components/BlogCard";
import SearchBar from "./components/SearchBar";
import { Suspense } from "react";

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
  const limit = 9;
  const skip = (page - 1) * limit;

  // Build filter conditions
  const where: {
    published: boolean;
    OR?: { title?: object; description?: object }[];
    categories?: object;
    tags?: object;
  } = {
    published: true,
  };

  if (params.search) {
    where.OR = [
      { title: { contains: params.search, mode: "insensitive" as const } },
      {
        description: {
          contains: params.search,
          mode: "insensitive" as const,
        },
      },
    ];
  }

  if (params.category) {
    where.categories = {
      some: { id: params.category },
    };
  }

  if (params.tag) {
    where.tags = {
      some: { id: params.tag },
    };
  }

  // Fetch posts and total count
  const [posts, total, categories, tags] = await Promise.all([
    db.post.findMany({
      where,
      include: {
        author: true,
        categories: true,
        tags: true,
      },
      orderBy: { publishedAt: "desc" },
      skip,
      take: limit,
    }),
    db.post.count({ where }),
    db.category.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
    db.tag.findMany({
      include: { _count: { select: { posts: true } } },
      orderBy: { name: "asc" },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  const buildQueryString = (overrides: Record<string, string>) => {
    const p = new URLSearchParams();
    if (params.search) p.set("search", params.search);
    if (params.category) p.set("category", params.category);
    if (params.tag) p.set("tag", params.tag);
    for (const [key, value] of Object.entries(overrides)) {
      p.set(key, value);
    }
    if (!overrides.page) p.set("page", "1");
    return `?${p.toString()}`;
  };

  return (
    <div className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw]">
      {/* Search & Filters */}
      <div className="space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]">
        <Suspense fallback={null}>
          <SearchBar />
        </Suspense>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
            <Link
              href="/blog"
              className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
                !params.category
                  ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50"
                  : "border-border-subtle text-text-muted hover:border-accent-cyan/30"
              }`}
            >
              All
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildQueryString({ category: cat.id })}
                className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
                  params.category === cat.id
                    ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50"
                    : "border-border-subtle text-text-muted hover:border-accent-cyan/30"
                }`}
              >
                {cat.name} ({cat._count.posts})
              </Link>
            ))}
          </div>
        )}

        {/* Tag Filters */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
            {tags.map((tag) => (
              <Link
                key={tag.id}
                href={buildQueryString({ tag: tag.id })}
                className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
                  params.tag === tag.id
                    ? "bg-accent-purple/20 text-accent-purple border-accent-purple/50"
                    : "border-border-subtle text-text-muted hover:border-accent-purple/30"
                }`}
              >
                #{tag.name} ({tag._count.posts})
              </Link>
            ))}
          </div>
        )}
      </div>
        
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
              category={post.categories[0]}
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
              href={buildQueryString({ page: String(page - 1) })}
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
              href={buildQueryString({ page: String(page + 1) })}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
            >
              Next
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
