export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import PostForm from "../components/PostForm";

interface Params {
  id: string;
}

export default async function EditPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { id } = await params;

  const post = await db.post.findUnique({
    where: { id },
    include: {
      categories: true,
      tags: true,
    },
  });

  if (!post) {
    notFound();
  }

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <div className="flex items-center justify-between">
        <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
          Edit Post
        </h1>
        <span
          className={`px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] ${
            post.published
              ? "bg-accent-emerald/10 text-accent-emerald"
              : "bg-accent-purple/10 text-accent-purple"
          }`}
        >
          {post.published ? "Published" : "Draft"}
        </span>
      </div>

      <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
        Last updated: {new Date(post.updatedAt).toLocaleString()}
      </p>

      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]">
        <PostForm
          isEdit
          initialData={{
            id: post.id,
            title: post.title,
            slug: post.slug,
            description: post.description,
            content: post.content,
            excerpt: post.excerpt || "",
            coverImage: post.coverImage || "",
            published: post.published,
            categoryIds: post.categories.map((c) => c.id),
            tagIds: post.tags.map((t) => t.id),
          }}
        />
      </div>
    </div>
  );
}
