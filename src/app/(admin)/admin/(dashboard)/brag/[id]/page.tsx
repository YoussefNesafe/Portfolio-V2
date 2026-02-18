import { notFound } from "next/navigation";
import { db } from "@/app/lib/db";
import BragEntryForm from "../../../components/brag/BragEntryForm";

export const dynamic = "force-dynamic";

export default async function EditBragEntryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const entry = await db.bragEntry.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!entry) notFound();

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
        Edit Brag Entry
      </h1>
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]">
        <BragEntryForm
          entry={{
            id: entry.id,
            title: entry.title,
            description: entry.description,
            impact: entry.impact,
            date: entry.date.toISOString(),
            categoryId: entry.categoryId,
            published: entry.published,
            pinned: entry.pinned,
          }}
        />
      </div>
    </div>
  );
}
