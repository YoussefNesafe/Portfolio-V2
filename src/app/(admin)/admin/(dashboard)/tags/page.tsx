export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import TagManager from "./components/TagManager";

export default async function TagsPage() {
  const tags = await db.tag.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });

  const data = tags.map((tag) => ({
    id: tag.id,
    name: tag.name,
    slug: tag.slug,
    postCount: tag._count.posts,
  }));

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Tags
      </h1>
      <TagManager initialTags={data} />
    </div>
  );
}
