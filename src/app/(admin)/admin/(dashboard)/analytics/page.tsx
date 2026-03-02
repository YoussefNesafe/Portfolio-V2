export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import Link from "next/link";

export default async function AnalyticsPage() {
  const [viewsResult, posts] = await Promise.all([
    db.post.aggregate({ _sum: { viewCount: true } }),
    db.post.findMany({
      orderBy: { viewCount: "desc" },
      select: {
        id: true,
        title: true,
        slug: true,
        published: true,
        publishedAt: true,
        viewCount: true,
      },
    }),
  ]);

  const totalViews = viewsResult._sum.viewCount ?? 0;
  const topPosts = posts.slice(0, 5);

  return (
    <div className="space-y-[6.667vw] tablet:space-y-[3.333vw] desktop:space-y-[1.389vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Analytics
      </h1>

      {/* Total Views Card */}
      <div className="grid grid-cols-1 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]">
          <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]">
            Total Views (All Time)
          </p>
          <p className="text-accent-cyan text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
            {totalViews.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Top 5 Posts */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle">
          <h2 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold">
            Top Posts
          </h2>
        </div>
        <div className="divide-y divide-border-subtle">
          {topPosts.length === 0 ? (
            <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
              No posts with views yet.
            </p>
          ) : (
            topPosts.map((post, index) => (
              <div
                key={post.id}
                className="flex items-center gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
              >
                <span className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-bold w-[5.333vw] tablet:w-[2.667vw] desktop:w-[1.111vw] flex-shrink-0">
                  #{index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    className="text-foreground hover:text-accent-cyan transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium truncate block"
                  >
                    {post.title}
                  </Link>
                </div>
                <span
                  className={`px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] flex-shrink-0 ${
                    post.published
                      ? "bg-accent-emerald/10 text-accent-emerald"
                      : "bg-accent-purple/10 text-accent-purple"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>
                <span className="text-accent-cyan text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold flex-shrink-0 w-[16vw] tablet:w-[8vw] desktop:w-[3.333vw] text-right">
                  {post.viewCount.toLocaleString()} views
                </span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* All Posts Table */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle">
          <h2 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold">
            All Posts by Views
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-subtle">
                <th className="text-left p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium w-[10.667vw] tablet:w-[5.333vw] desktop:w-[2.222vw]">
                  Rank
                </th>
                <th className="text-left p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium">
                  Title
                </th>
                <th className="text-left p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium hidden tablet:table-cell">
                  Status
                </th>
                <th className="text-right p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium">
                  Views
                </th>
                <th className="text-right p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium hidden tablet:table-cell">
                  Published
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle">
              {posts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-center"
                  >
                    No posts yet.
                  </td>
                </tr>
              ) : (
                posts.map((post, index) => (
                  <tr key={post.id} className="hover:bg-bg-tertiary/50 transition-colors">
                    <td className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
                      {index + 1}
                    </td>
                    <td className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]">
                      <Link
                        href={`/blog/${post.slug}`}
                        target="_blank"
                        className="text-foreground hover:text-accent-cyan transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium"
                      >
                        {post.title}
                      </Link>
                    </td>
                    <td className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] hidden tablet:table-cell">
                      <span
                        className={`px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] ${
                          post.published
                            ? "bg-accent-emerald/10 text-accent-emerald"
                            : "bg-accent-purple/10 text-accent-purple"
                        }`}
                      >
                        {post.published ? "Published" : "Draft"}
                      </span>
                    </td>
                    <td className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-accent-cyan text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-semibold text-right">
                      {post.viewCount.toLocaleString()}
                    </td>
                    <td className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] text-right hidden tablet:table-cell">
                      {post.publishedAt
                        ? new Date(post.publishedAt).toLocaleDateString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })
                        : "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
