import BlogCard from "@/app/(public)/blog/components/BlogCard";
import { IBlogPost } from "@/app/models/Blog";

interface RelatedPostsProps {
  posts: IBlogPost[];
  title: string;
}

export default function RelatedPosts({ posts, title }: RelatedPostsProps) {
  if (posts.length === 0) return null;

  return (
    <section>
      <h2 className="gradient-text text-[5.333vw] tablet:text-[2.667vw] desktop:text-[1.111vw] font-bold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        {title}
      </h2>

      <div className="flex flex-col gap-[5.333vw] tablet:gap-[2.667vw] desktop:gap-[1.111vw]">
        {posts.map((post) => (
          <BlogCard
            key={post.id}
            id={post.id}
            slug={post.slug}
            title={post.title}
            description={post.description}
          />
        ))}
      </div>
    </section>
  );
}
