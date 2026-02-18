export const dynamic = "force-dynamic";

import Link from "next/link";
import { db } from "@/app/lib/db";
import BragEntryActions from "../../components/brag/BragEntryActions";

export default async function BragEntriesPage() {
  const entries = await db.bragEntry.findMany({
    orderBy: { date: "desc" },
    include: { category: true },
    take: 100,
  });

  // Group entries by week
  const grouped = new Map<string, typeof entries>();
  for (const entry of entries) {
    const d = new Date(entry.date);
    // Get Monday of the week
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(d.setDate(diff));
    const key = monday.toISOString().split("T")[0];
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <div className="flex items-center justify-between">
        <h1 className="text-text-heading text-[6.4vw] tablet:text-[3vw] desktop:text-[1.25vw] font-bold">
          Brag Entries
        </h1>
        <Link
          href="/admin/brag/new"
          className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          New Entry
        </Link>
      </div>

      {entries.length === 0 ? (
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] text-center">
          <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            No entries yet.{" "}
            <Link href="/admin/brag/new" className="text-accent-cyan hover:underline">
              Create your first brag entry
            </Link>
          </p>
        </div>
      ) : (
        <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
          {Array.from(grouped.entries()).map(([weekStart, weekEntries]) => (
            <div key={weekStart}>
              <h2 className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium uppercase tracking-wider mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw]">
                Week of{" "}
                {new Date(weekStart + "T00:00:00").toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </h2>
              <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle">
                {weekEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="grid grid-cols-1 desktop:grid-cols-[5.208vw_1fr_6.25vw_5.208vw_15.625vw] gap-[2.667vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] items-center"
                  >
                    {/* Date */}
                    <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                      {new Date(entry.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </span>

                    {/* Title + Category */}
                    <div className="min-w-0">
                      <Link
                        href={`/admin/brag/${entry.id}`}
                        className="text-foreground hover:text-accent-cyan transition-colors text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.625vw] font-medium truncate block"
                      >
                        {entry.title}
                      </Link>
                      <div className="flex items-center gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw]">
                        <span
                          className="w-[2vw] h-[2vw] tablet:w-[1vw] tablet:h-[1vw] desktop:w-[0.417vw] desktop:h-[0.417vw] rounded-full inline-block"
                          style={{ backgroundColor: entry.category.color || "#06B6D4" }}
                        />
                        <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                          {entry.category.name}
                        </span>
                      </div>
                    </div>

                    {/* Status */}
                    <span
                      className={`inline-block w-fit px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] rounded text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] ${
                        entry.published
                          ? "bg-accent-emerald/10 text-accent-emerald"
                          : "bg-accent-purple/10 text-accent-purple"
                      }`}
                    >
                      {entry.published ? "Published" : "Draft"}
                    </span>

                    {/* Pinned */}
                    <span className="text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                      {entry.pinned && (
                        <span className="text-accent-purple">Pinned</span>
                      )}
                    </span>

                    {/* Actions */}
                    <BragEntryActions
                      entryId={entry.id}
                      published={entry.published}
                      pinned={entry.pinned}
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
