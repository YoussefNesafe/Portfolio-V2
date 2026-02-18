export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import BragCategoryManager from "../../components/brag/BragCategoryManager";

export default async function BragCategoriesPage() {
  const categories = await db.bragCategory.findMany({
    include: { _count: { select: { entries: true } } },
    orderBy: { sortOrder: "asc" },
  });

  const data = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    color: cat.color,
    sortOrder: cat.sortOrder,
    entryCount: cat._count.entries,
  }));

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Brag Categories
      </h1>
      <BragCategoryManager initialCategories={data} />
    </div>
  );
}
