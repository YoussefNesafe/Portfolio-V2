export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import { ADMIN_POSTS_PER_PAGE } from "@/app/lib/constants";
import Link from "next/link";
import PostActions from "./components/PostActions";
import { cn } from "@/app/utils/cn";
import { getDictionary } from "@/get-dictionary";

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  let page = parseInt(params.page || "1", 10);
  if (isNaN(page) || page < 1) page = 1;

  const skip = (page - 1) * ADMIN_POSTS_PER_PAGE;

  const [posts, total, dict] = await Promise.all([
    db.post.findMany({
      orderBy: { createdAt: "desc" },
      skip,
      take: ADMIN_POSTS_PER_PAGE,
      select: {
        id: true,
        slug: true,
        title: true,
        published: true,
        createdAt: true,
        categories: { select: { name: true } },
        tags: { select: { name: true } },
      },
    }),
    db.post.count(),
    getDictionary(),
  ]);

  const t = dict.admin.posts;
  const totalPages = Math.ceil(total / ADMIN_POSTS_PER_PAGE);

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <div className="flex items-center justify-between">
        <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
          {t.title}
        </h1>
        <Link
          href="/admin/posts/new"
          className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          {t.newPost}
        </Link>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="hidden desktop:grid grid-cols-[1fr_8.333vw_8.333vw_6.25vw] gap-[0.833vw] p-[0.833vw] border-b border-border-subtle text-text-muted text-[0.5vw] font-medium uppercase tracking-wider">
          <span>{t.table.titleCol}</span>
          <span>{t.table.statusCol}</span>
          <span>{t.table.dateCol}</span>
          <span>{t.table.actionsCol}</span>
        </div>

        {posts.length === 0 ? (
          <p className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-center">
            {t.empty.message}{" "}
            <Link href="/admin/posts/new" className="text-accent-cyan hover:underline">
              {t.empty.cta}
            </Link>
          </p>
        ) : (
          <div className="divide-y divide-border-subtle">
            {posts.map((post) => (
              <div
                key={post.id}
                className="grid grid-cols-1 desktop:grid-cols-[1fr_8.333vw_8.333vw_6.25vw] gap-[2.667vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] items-center"
              >
                {/* Title & meta */}
                <div className="min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-foreground hover:text-accent-cyan transition-colors text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.625vw] font-medium truncate block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw] truncate">
                    {post.categories.map((c) => c.name).join(", ") || t.fallback.uncategorized}
                    {post.tags.length > 0 && ` | ${post.tags.map((tag) => tag.name).join(", ")}`}
                  </p>
                </div>

                {/* Status */}
                <div className="flex items-center gap-[1.333vw] desktop:block">
                  <span className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:hidden">
                    {t.mobileLabels.status}
                  </span>
                  <span
                    className={cn(
                      "inline-block w-fit px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw]",
                      post.published
                        ? "bg-accent-emerald/10 text-accent-emerald"
                        : "bg-accent-purple/10 text-accent-purple"
                    )}
                  >
                    {post.published ? t.status.published : t.status.draft}
                  </span>
                </div>

                {/* Date */}
                <div className="flex items-center gap-[1.333vw] desktop:block">
                  <span className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:hidden">
                    {t.mobileLabels.date}
                  </span>
                  <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                    {new Date(post.createdAt).toLocaleDateString("en-US")}
                  </span>
                </div>

                {/* Actions */}
                <PostActions postId={post.id} published={post.published} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-[4vw] tablet:pt-[2vw] desktop:pt-[0.833vw]">
          <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
            Page {page} of {totalPages} ({total} posts)
          </span>
          <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
            {page > 1 && (
              <Link
                href={`/admin/posts?page=${page - 1}`}
                className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
              >
                {t.pagination.previous}
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/posts?page=${page + 1}`}
                className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded hover:border-accent-cyan/50 hover:bg-background/50 transition-colors text-[2.667vw] tablet:text-[1.3vw] desktop:text-[0.542vw]"
              >
                {t.pagination.next}
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
