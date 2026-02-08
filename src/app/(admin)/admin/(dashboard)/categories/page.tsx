export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import CategoryManager from "./components/CategoryManager";

export default async function CategoriesPage() {
  const categories = await db.category.findMany({
    include: {
      _count: { select: { posts: true } },
    },
    orderBy: { name: "asc" },
  });

  const data = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    description: cat.description,
    postCount: cat._count.posts,
  }));

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Categories
      </h1>
      <CategoryManager initialCategories={data} />
    </div>
  );
}
