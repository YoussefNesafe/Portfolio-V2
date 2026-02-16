export const dynamic = "force-dynamic";

import { db } from "@/app/lib/db";
import QueueManager from "./components/QueueManager";

export default async function QueuePage() {
  const items = await db.queuedPost.findMany({
    orderBy: { position: "asc" },
    include: { post: { select: { id: true, slug: true } } },
  });

  const serialized = items.map((item) => ({
    ...item,
    createdAt: item.createdAt.toISOString(),
  }));

  const counts = {
    pending: items.filter((i) => i.status === "pending").length,
    generating: items.filter((i) => i.status === "generating").length,
    generated: items.filter((i) => i.status === "generated").length,
    published: items.filter((i) => i.status === "published").length,
    failed: items.filter((i) => i.status === "failed").length,
  };

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Publishing Queue
      </h1>
      <QueueManager initialItems={serialized} counts={counts} />
    </div>
  );
}
