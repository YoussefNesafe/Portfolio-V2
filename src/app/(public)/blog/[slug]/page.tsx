export const revalidate = 86400;

import { cache } from "react";
import sanitizeHtml from "sanitize-html";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import { POST_INCLUDE_FULL } from "@/app/api/blog/helpers/prisma-includes";
import { sanitizeOptions } from "./sanitize-config";
import { calculateReadingTime } from "./reading-time";
import { getRelatedPosts } from "./related-posts";
import RelatedPosts from "./RelatedPosts";
import { getDictionary } from "@/get-dictionary";

export async function generateStaticParams() {
  try {
    const posts = await db.post.findMany({
      where: { published: true },
      select: { slug: true },
    });
    return posts.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

const getPost = cache(async (slug: string) => {
  return db.post.findUnique({
    where: { slug },
    include: POST_INCLUDE_FULL,
  });
});

interface Params {
  slug: string;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) {
    return { title: "Post Not Found" };
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
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<Params>;
}) {
  const [{ slug }, dict] = await Promise.all([params, getDictionary()]);
  const { backToBlog, minRead, relatedPosts } = dict.blogPost;

  const post = await getPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const related = await getRelatedPosts(post, 3);

  const formattedDate = post.publishedAt
    ? new Date(post.publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  const readingTime = calculateReadingTime(post.content);

  return (
    <div className="mx-auto desktop:mx-0 desktop:px-[6.24vw] max-w-[90vw] tablet:max-w-[70vw]  py-[10.667vw] tablet:py-[5.333vw] desktop:py-[2.222vw] desktop:flex desktop:gap-[3.333vw] desktop:items-start desktop:justify-between desktop:max-w-full">
      {/* Main Article */}
      <article className="desktop:flex-1 desktop:min-w-0">
        {/* Header */}
        <header className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[1.667vw]">
          <h1 className="text-heading text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
            {post.title}
          </h1>

          <div className="flex flex-wrap gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] text-muted text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw] mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw]">
            {formattedDate && <span>{formattedDate}</span>}
            {post.author && <span>{post.author.name}</span>}
            <span>{readingTime} {minRead}</span>
          </div>

          {post.coverImage && (
            <div className="relative mb-[6.667vw] tablet:mb-[3.333vw] desktop:mb-[1.389vw] rounded-lg overflow-hidden bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 h-[40vw] tablet:h-[25vw] desktop:h-[10vw]">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                className="object-cover"
                sizes="(max-width: 480px) 90vw, (max-width: 1024px) 80vw, 50vw"
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
            dangerouslySetInnerHTML={{
              __html: sanitizeHtml(post.content, sanitizeOptions),
            }}
          />
        </div>

        {/* Tags */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] pt-[6.667vw] tablet:pt-[3.333vw] desktop:pt-[1.389vw] border-t border-subtle">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/blog?tag=${tag.id}`}
                className="inline-block px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] bg-accent-purple/10 text-accent-purple rounded hover:bg-accent-purple/20 transition-colors text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
      </article>

      {/* Sidebar */}
      <aside className="mt-[10.667vw] tablet:mt-[8vw] desktop:mt-[2.08vw] desktop:w-[27vw] desktop:flex-shrink-0 desktop:sticky desktop:top-[3.2vw]">
        <Link
          href="/blog"
          className="block mb-[6.667vw] tablet:mb-[4vw] desktop:mb-[1.667vw] text-accent-cyan hover:text-accent-cyan/80 transition-colors text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw]"
        >
          {backToBlog}
        </Link>

        <RelatedPosts posts={related} title={relatedPosts} />
      </aside>
    </div>
  );
}
