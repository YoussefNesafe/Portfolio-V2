"use no memo";

import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";

// ── Types ──────────────────────────────────────────────────────────────────

interface PdfEntry {
  id: string;
  title: string;
  description: string;
  impact: string | null;
  date: string; // YYYY-MM-DD
  pinned: boolean;
  category: { name: string; slug: string; color: string };
  createdAt: string;
}

interface PdfCategory {
  id: string;
  name: string;
  slug: string;
  color: string;
  sortOrder: number;
  entryCount: number;
}

interface PdfMeta {
  totalEntries: number;
  entriesThisMonth: number;
  currentStreak: number;
  categoriesActive: number;
}

interface BragPdfDocumentProps {
  exportedAt: string;
  meta: PdfMeta;
  categories: PdfCategory[];
  entries: PdfEntry[];
}

// ── Styles ─────────────────────────────────────────────────────────────────

const CYAN = "#06B6D4";
const EMERALD = "#10B981";
const MUTED = "#A1A1AA";
const HEADING = "#E4E4E7";
const FOREGROUND = "#D4D4D8";
const BG_PAGE = "#0F0F1A";
const BG_CARD = "#18181F";
const BG_CARD2 = "#1E1E2A";
const BORDER = "#2A2A35";

const styles = StyleSheet.create({
  page: {
    backgroundColor: BG_PAGE,
    paddingTop: 40,
    paddingBottom: 50,
    paddingHorizontal: 40,
    fontFamily: "Helvetica",
    color: FOREGROUND,
  },

  // ── Cover
  coverTitle: {
    fontSize: 28,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    marginBottom: 6,
  },
  coverSubtitle: {
    fontSize: 11,
    color: MUTED,
    marginBottom: 20,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
    marginBottom: 24,
  },

  // ── Section header
  sectionTitle: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: HEADING,
    marginBottom: 10,
    marginTop: 20,
  },

  // ── Meta strip
  metaRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 4,
  },
  metaPill: {
    flex: 1,
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  metaValue: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
    marginBottom: 2,
  },
  metaLabel: {
    fontSize: 8,
    color: MUTED,
    textTransform: "uppercase",
  },

  // ── Category summary
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  categoryItem: {
    width: "48%",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: BG_CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
  },
  categoryName: {
    fontSize: 9,
    color: FOREGROUND,
  },
  categoryCount: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: MUTED,
  },

  // ── Month header
  monthHeader: {
    backgroundColor: BG_CARD2,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 6,
    paddingVertical: 7,
    paddingHorizontal: 10,
    marginTop: 14,
    marginBottom: 6,
  },
  monthLabel: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    color: HEADING,
  },
  monthCount: {
    fontSize: 9,
    color: MUTED,
    marginTop: 1,
  },

  // ── Entry row
  entryRow: {
    flexDirection: "row",
    gap: 10,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  entryDate: {
    width: 34,
    alignItems: "center",
    flexShrink: 0,
  },
  entryDay: {
    fontSize: 13,
    fontFamily: "Helvetica-Bold",
    color: CYAN,
  },
  entryWeekday: {
    fontSize: 7,
    color: MUTED,
  },
  entryContent: {
    flex: 1,
  },
  entryTitleRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 2,
  },
  entryTitle: {
    fontSize: 10,
    fontFamily: "Helvetica-Bold",
    color: HEADING,
    flex: 1,
  },
  entryBadge: {
    fontSize: 7,
    paddingVertical: 2,
    paddingHorizontal: 5,
    borderRadius: 3,
    color: CYAN,
    backgroundColor: "#06B6D41A",
  },
  entryDescription: {
    fontSize: 9,
    color: MUTED,
    lineHeight: 1.4,
    marginBottom: 2,
  },
  entryImpact: {
    fontSize: 9,
    color: EMERALD,
    fontFamily: "Helvetica-Bold",
  },

  // ── Empty state
  emptyText: {
    fontSize: 11,
    color: MUTED,
    textAlign: "center",
    marginTop: 30,
  },

  // ── Footer
  footer: {
    position: "absolute",
    bottom: 20,
    left: 40,
    right: 40,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  footerText: {
    fontSize: 8,
    color: MUTED,
  },
});

// ── Helpers ────────────────────────────────────────────────────────────────

function formatMonthLabel(monthKey: string): string {
  const d = new Date(monthKey + "-01");
  return d.toLocaleString("en-US", { month: "long", year: "numeric" });
}

function formatDateShort(dateStr: string): { day: string; weekday: string } {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: String(d.getDate()).padStart(2, "0"),
    weekday: d.toLocaleString("en-US", { weekday: "short" }),
  };
}

function groupByMonth(entries: PdfEntry[]): Map<string, PdfEntry[]> {
  const grouped = new Map<string, PdfEntry[]>();
  for (const entry of entries) {
    const d = new Date(entry.date + "T00:00:00");
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key)!.push(entry);
  }
  return grouped;
}

// ── Component ──────────────────────────────────────────────────────────────

export function BragPdfDocument({
  exportedAt,
  meta,
  categories,
  entries,
}: BragPdfDocumentProps) {
  const grouped = groupByMonth(entries);

  return (
    <Document
      title="Work Log Export"
      author="Portfolio"
      keywords="brag, work log, achievements"
    >
      <Page size="A4" style={styles.page}>
        {/* ── Cover ── */}
        <Text style={styles.coverTitle}>Work Log Export</Text>
        <Text style={styles.coverSubtitle}>
          Generated on {new Date(exportedAt).toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </Text>
        <View style={styles.divider} />

        {/* ── Meta strip ── */}
        <Text style={styles.sectionTitle}>Summary</Text>
        <View style={styles.metaRow}>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue}>{meta.totalEntries}</Text>
            <Text style={styles.metaLabel}>Total Entries</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue}>{meta.entriesThisMonth}</Text>
            <Text style={styles.metaLabel}>This Month</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue}>{meta.currentStreak}w</Text>
            <Text style={styles.metaLabel}>Week Streak</Text>
          </View>
          <View style={styles.metaPill}>
            <Text style={styles.metaValue}>{meta.categoriesActive}</Text>
            <Text style={styles.metaLabel}>Categories</Text>
          </View>
        </View>

        {/* ── Category summary ── */}
        {categories.length > 0 && (
          <>
            <Text style={styles.sectionTitle}>Categories</Text>
            <View style={styles.categoryGrid}>
              {categories.map((cat) => (
                <View key={cat.id} style={styles.categoryItem}>
                  <Text style={[styles.categoryName, { color: cat.color || CYAN }]}>
                    {cat.name}
                  </Text>
                  <Text style={styles.categoryCount}>{cat.entryCount}</Text>
                </View>
              ))}
            </View>
          </>
        )}

        {/* ── Entries by month ── */}
        <Text style={styles.sectionTitle}>Entries</Text>

        {entries.length === 0 ? (
          <Text style={styles.emptyText}>No entries found.</Text>
        ) : (
          Array.from(grouped.entries()).map(([monthKey, monthEntries]) => (
            <View key={monthKey}>
              {/* Month header */}
              <View style={styles.monthHeader}>
                <Text style={styles.monthLabel}>{formatMonthLabel(monthKey)}</Text>
                <Text style={styles.monthCount}>
                  {monthEntries.length} {monthEntries.length === 1 ? "entry" : "entries"}
                </Text>
              </View>

              {/* Entry rows */}
              {monthEntries.map((entry) => {
                const { day, weekday } = formatDateShort(entry.date);
                return (
                  <View key={entry.id} style={styles.entryRow} wrap={false}>
                    {/* Date */}
                    <View style={styles.entryDate}>
                      <Text style={styles.entryDay}>{day}</Text>
                      <Text style={styles.entryWeekday}>{weekday}</Text>
                    </View>

                    {/* Content */}
                    <View style={styles.entryContent}>
                      <View style={styles.entryTitleRow}>
                        <Text style={styles.entryTitle}>{entry.title}</Text>
                        <Text
                          style={[
                            styles.entryBadge,
                            {
                              color: entry.category.color || CYAN,
                              backgroundColor: (entry.category.color || CYAN) + "1A",
                            },
                          ]}
                        >
                          {entry.category.name}
                        </Text>
                      </View>
                      <Text style={styles.entryDescription}>{entry.description}</Text>
                      {entry.impact && (
                        <Text style={styles.entryImpact}>Impact: {entry.impact}</Text>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ))
        )}

        {/* ── Footer ── */}
        <View style={styles.footer} fixed>
          <Text style={styles.footerText}>Work Log Export</Text>
          <Text
            style={styles.footerText}
            render={({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`}
          />
        </View>
      </Page>
    </Document>
  );
}
