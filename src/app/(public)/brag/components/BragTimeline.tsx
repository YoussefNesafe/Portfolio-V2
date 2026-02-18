"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeUp, staggerContainer, defaultViewport } from "@/app/lib/animations";
import { FiChevronDown } from "react-icons/fi";

interface BragEntry {
  id: string;
  title: string;
  description: string;
  impact: string | null;
  date: string;
  category: { name: string; slug: string; color: string | null };
}

interface CategoryFilter {
  name: string;
  slug: string;
  color: string;
}

interface BragTimelineProps {
  categories: CategoryFilter[];
}

export default function BragTimeline({ categories }: BragTimelineProps) {
  const [entries, setEntries] = useState<BragEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set());

  const fetchEntries = useCallback(async (pageNum: number, append: boolean) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(pageNum),
        limit: "50",
        year: String(year),
      });
      if (activeCategory) params.set("category", activeCategory);

      const res = await fetch(`/api/brag/entries?${params}`);
      const data = await res.json();

      const newEntries = append ? [...entries, ...data.entries] : data.entries;
      setEntries(newEntries);
      setHasMore(data.pagination.hasNextPage);

      // Auto-open the first month on initial load
      if (!append && data.entries.length > 0) {
        const firstDate = new Date(data.entries[0].date);
        const firstKey = `${firstDate.getFullYear()}-${String(firstDate.getMonth() + 1).padStart(2, "0")}`;
        setOpenMonths(new Set([firstKey]));
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }, [activeCategory, year]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setPage(1);
    fetchEntries(1, false);
  }, [fetchEntries]);

  const loadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchEntries(nextPage, true);
  };

  const toggleMonth = (monthKey: string) => {
    setOpenMonths((prev) => {
      const next = new Set(prev);
      if (next.has(monthKey)) {
        next.delete(monthKey);
      } else {
        next.add(monthKey);
      }
      return next;
    });
  };

  // Group entries by month
  const grouped = new Map<string, BragEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <h3 className="text-text-heading text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.042vw] font-semibold">
        Timeline
      </h3>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        {/* Year select */}
        <select
          value={year}
          onChange={(e) => setYear(parseInt(e.target.value))}
          className="bg-bg-secondary border border-border-subtle rounded-lg px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] focus:outline-none focus:border-accent-cyan/50"
        >
          {years.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>

        {/* Category chips */}
        <button
          onClick={() => setActiveCategory(null)}
          className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-full text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
            activeCategory === null
              ? "border-accent-cyan bg-accent-cyan/10 text-accent-cyan"
              : "border-border-subtle text-text-muted hover:border-accent-cyan/30"
          }`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.slug}
            onClick={() => setActiveCategory(activeCategory === cat.slug ? null : cat.slug)}
            className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-full text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
              activeCategory === cat.slug
                ? "bg-opacity-10 border-current"
                : "border-border-subtle text-text-muted hover:border-current"
            }`}
            style={activeCategory === cat.slug ? { color: cat.color, backgroundColor: cat.color + "1A" } : undefined}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Timeline entries grouped by month — accordion */}
      {loading && entries.length === 0 ? (
        <div className="text-center py-[8vw] tablet:py-[4vw] desktop:py-[1.667vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">Loading...</p>
        </div>
      ) : entries.length === 0 ? (
        <div className="text-center py-[8vw] tablet:py-[4vw] desktop:py-[1.667vw]">
          <p className="text-text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            No entries found for this period.
          </p>
        </div>
      ) : (
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={defaultViewport}
          className="space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]"
        >
          {Array.from(grouped.entries()).map(([monthKey, monthEntries]) => {
            const isOpen = openMonths.has(monthKey);
            const monthLabel = new Date(monthKey + "-01").toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            });

            return (
              <motion.div
                key={monthKey}
                variants={fadeUp}
                className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden"
              >
                {/* Accordion header */}
                <button
                  onClick={() => toggleMonth(monthKey)}
                  className="w-full flex items-center justify-between p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] hover:bg-bg-tertiary/50 transition-colors"
                >
                  <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
                    <h4 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold">
                      {monthLabel}
                    </h4>
                    <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
                      ({monthEntries.length} {monthEntries.length === 1 ? "entry" : "entries"})
                    </span>
                  </div>
                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="text-text-muted"
                  >
                    <FiChevronDown className="w-[4vw] h-[4vw] tablet:w-[2vw] tablet:h-[2vw] desktop:w-[0.833vw] desktop:h-[0.833vw]" />
                  </motion.span>
                </button>

                {/* Accordion body */}
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="border-t border-border-subtle divide-y divide-border-subtle">
                        {monthEntries.map((entry) => (
                          <div
                            key={entry.id}
                            className="flex gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
                          >
                            {/* Date column */}
                            <div className="flex-shrink-0 w-[12vw] tablet:w-[5vw] desktop:w-[2.604vw] text-center">
                              <p className="text-accent-cyan text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-bold leading-none">
                                {new Date(entry.date).getDate()}
                              </p>
                              <p className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] mt-[0.533vw] tablet:mt-[0.25vw] desktop:mt-[0.104vw]">
                                {new Date(entry.date).toLocaleString("en-US", { weekday: "short" })}
                              </p>
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0 space-y-[1.333vw] tablet:space-y-[0.667vw] desktop:space-y-[0.278vw]">
                              <div className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw] flex-wrap">
                                <h5 className="text-text-heading text-[3.733vw] tablet:text-[1.75vw] desktop:text-[0.729vw] font-medium">
                                  {entry.title}
                                </h5>
                                <span
                                  className="px-[2vw] tablet:px-[1vw] desktop:px-[0.417vw] py-[0.533vw] tablet:py-[0.25vw] desktop:py-[0.104vw] rounded-full text-[2.133vw] tablet:text-[1vw] desktop:text-[0.417vw]"
                                  style={{
                                    backgroundColor: (entry.category.color || "#06B6D4") + "1A",
                                    color: entry.category.color || "#06B6D4",
                                  }}
                                >
                                  {entry.category.name}
                                </span>
                              </div>
                              <p className="text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
                                {entry.description}
                              </p>
                              {entry.impact && (
                                <p className="text-accent-emerald text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium">
                                  {entry.impact}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {/* Load more */}
      {hasMore && (
        <div className="text-center pt-[2.667vw] tablet:pt-[1.333vw] desktop:pt-[0.556vw]">
          <button
            onClick={loadMore}
            disabled={loading}
            className="px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] border border-border-subtle rounded-lg text-text-muted hover:text-foreground hover:border-accent-cyan/30 transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] disabled:opacity-50"
          >
            {loading ? "Loading..." : "Load More"}
          </button>
        </div>
      )}
    </div>
  );
}
