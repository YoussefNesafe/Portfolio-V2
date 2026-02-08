export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      tags: true,
    },
  });

  if (!post) {
    return {
      title: "Post Not Found",
    };
  }

  return {
    title: post.title,
    description: post.description,
    keywords: post.tags?.map((t) => t.name).join(", ") || "",
    openGraph: {
      title: post.title,
      description: post.description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverImage ? [{ url: post.coverImage }] : [],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;

  const post = await db.post.findUnique({
    where: { slug },
    include: {
      author: true,
      categories: true,
      tags: true,
    },
  });

  if (!post || !post.published) {
    notFound();
  }

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // Calculate reading time (rough estimate: 200 words per minute)
  const wordCount = post.content.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / 200);

  return (
    <article className="mx-auto max-w-[90vw] tablet:max-w-[80vw] desktop:max-w-[50vw] py-[10.667vw] tablet:py-[5.333vw] desktop:py-[2.222vw]">
      {/* Header */}
      <header className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
        <h1 className="text-heading text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
          {post.title}
        </h1>

        <div className="flex flex-wrap gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] text-muted text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw] mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw]">
          {formattedDate && <span>{formattedDate}</span>}
          {post.author && <span>{post.author.name}</span>}
          <span>{readingTime} min read</span>
        </div>

        {post.coverImage && (
          <div className="mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw] rounded-lg overflow-hidden bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 h-[40vw] tablet:h-[25vw] desktop:h-[10vw]">
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {post.categories.length > 0 && (
          <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw]">
            {post.categories.map((category) => (
              <span
                key={category.id}
                className="inline-block px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] bg-accent-cyan/10 text-accent-cyan rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="prose prose-invert max-w-none mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
        <div
          className="text-foreground text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw] leading-relaxed space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] pt-[6.667vw] tablet:pt-[3.333vw] desktop:pt-[1.389vw] border-t border-subtle">
          {post.tags.map((tag) => (
            <a
              key={tag.id}
              href={`/blog?tag=${tag.id}`}
              className="inline-block px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] bg-accent-purple/10 text-accent-purple rounded hover:bg-accent-purple/20 transition-colors text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
            >
              #{tag.name}
            </a>
          ))}
        </div>
      )}

      {/* Back Link */}
      <div className="mt-[8vw] tablet:mt-[4vw] desktop:mt-[1.667vw]">
        <a
          href="/blog"
          className="inline-block text-accent-cyan hover:text-accent-cyan/80 transition-colors text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw]"
        >
          ← Back to blog
        </a>
      </div>
    </article>
  );
}
