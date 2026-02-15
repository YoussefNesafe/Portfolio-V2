export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import Link from "next/link";
import PostActions from "./components/PostActions";

export default async function PostsPage() {
  const posts = await db.post.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    include: {
      categories: true,
      tags: true,
    },
  });

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <div className="flex items-center justify-between">
        <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
          Posts
        </h1>
        <Link
          href="/admin/posts/new"
          className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          New Post
        </Link>
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
        {/* Table header */}
        <div className="hidden desktop:grid grid-cols-[1fr_8.333vw_8.333vw_6.25vw] gap-[0.833vw] p-[0.833vw] border-b border-border-subtle text-text-muted text-[0.5vw] font-medium uppercase tracking-wider">
          <span>Title</span>
          <span>Status</span>
          <span>Date</span>
          <span>Actions</span>
        </div>

        {posts.length === 0 ? (
          <p className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-center">
            No posts yet.{" "}
            <Link href="/admin/posts/new" className="text-accent-cyan hover:underline">
              Create your first post
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
                    {post.categories.map((c) => c.name).join(", ") || "Uncategorized"}
                    {post.tags.length > 0 && ` | ${post.tags.map((t) => t.name).join(", ")}`}
                  </p>
                </div>

                {/* Status */}
                <span
                  className={`inline-block w-fit px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] ${
                    post.published
                      ? "bg-accent-emerald/10 text-accent-emerald"
                      : "bg-accent-purple/10 text-accent-purple"
                  }`}
                >
                  {post.published ? "Published" : "Draft"}
                </span>

                {/* Date */}
                <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                  {new Date(post.createdAt).toLocaleDateString()}
                </span>

                {/* Actions */}
                <PostActions postId={post.id} published={post.published} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
