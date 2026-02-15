export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import Link from "next/link";

export default async function AdminDashboard() {
  const [totalPosts, publishedPosts, draftPosts, totalCategories, totalTags, recentPosts] =
    await Promise.all([
      db.post.count(),
      db.post.count({ where: { published: true } }),
      db.post.count({ where: { published: false } }),
      db.category.count(),
      db.tag.count(),
      db.post.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { categories: true },
      }),
    ]);

  const colorMap: Record<string, string> = {
    "accent-cyan": "text-accent-cyan",
    "accent-emerald": "text-accent-emerald",
    "accent-purple": "text-accent-purple",
  };

  const stats = [
    { label: "Total Posts", value: totalPosts, color: "accent-cyan" },
    { label: "Published", value: publishedPosts, color: "accent-emerald" },
    { label: "Drafts", value: draftPosts, color: "accent-purple" },
    { label: "Categories", value: totalCategories, color: "accent-cyan" },
    { label: "Tags", value: totalTags, color: "accent-purple" },
  ];

  return (
    <div className="space-y-[6.667vw] tablet:space-y-[3.333vw] desktop:space-y-[1.389vw]">
      <div className="flex items-center justify-between">
        <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
          Dashboard
        </h1>
        <Link
          href="/admin/posts/new"
          className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          New Post
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
          >
            <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]">
              {stat.label}
            </p>
            <p className={`${colorMap[stat.color]} text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle">
          <h2 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold">
            Recent Posts
          </h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {recentPosts.length === 0 ? (
            <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
              No posts yet.{" "}
              <Link href="/admin/posts/new" className="text-accent-cyan hover:underline">
                Create your first post
              </Link>
            </p>
          ) : (
            recentPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
              >
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/admin/posts/${post.id}`}
                    className="text-foreground hover:text-accent-cyan transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium truncate block"
                  >
                    {post.title}
                  </Link>
                  <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
                    {post.categories.map((c) => c.name).join(", ") || "Uncategorized"} &middot;{" "}
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span
                  className={`px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] ${
                    post.published
                      ? "bg-accent-emerald/10 text-accent-emerald"
                      : "bg-accent-purple/10 text-accent-purple"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
