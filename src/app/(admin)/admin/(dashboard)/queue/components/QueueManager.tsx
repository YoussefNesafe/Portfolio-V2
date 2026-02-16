"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { inputClass } from "../../../components/shared/admin-styles";

interface QueueItem {
  id: string;
  title: string;
  position: number;
  status: string;
  postId: string | null;
  post: { id: string; slug: string } | null;
  errorMsg: string | null;
  createdAt: string;
}

interface StatusCounts {
  pending: number;
  generating: number;
  generated: number;
  published: number;
  failed: number;
}

const statusStyles: Record<string, string> = {
  pending: "text-text-muted bg-bg-tertiary",
  generating: "text-amber-400 bg-amber-400/10 animate-pulse",
  generated: "text-accent-cyan bg-accent-cyan/10",
  published: "text-accent-emerald bg-accent-emerald/10",
  failed: "text-red-400 bg-red-400/10",
};

export default function QueueManager({
  initialItems,
  counts,
}: {
  initialItems: QueueItem[];
  counts: StatusCounts;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [singleTitle, setSingleTitle] = useState("");
  const [bulkTitles, setBulkTitles] = useState("");
  const [bulkMode, setBulkMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const refresh = useCallback(() => router.refresh(), [router]);

  const handleAdd = async () => {
    if (!singleTitle.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blog/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: singleTitle.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      setSingleTitle("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAdd = async () => {
    const titles = bulkTitles
      .split("\n")
      .map((t) => t.trim())
      .filter(Boolean);
    if (titles.length === 0) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blog/queue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titles }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add");
      }
      setBulkTitles("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to add");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this queue item?")) return;
    setLoading(true);
    try {
      await fetch(`/api/blog/queue/${id}`, { method: "DELETE" });
      refresh();
    } catch {
      setError("Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    setLoading(true);
    try {
      await fetch(`/api/blog/queue/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "pending" }),
      });
      refresh();
    } catch {
      setError("Failed to retry");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSave = async () => {
    if (!editId || !editTitle.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/blog/queue/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: editTitle.trim() }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to update");
      }
      setEditId(null);
      setEditTitle("");
      refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to update");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]">
      {/* Stats Row */}
      <div className="grid grid-cols-2 tablet:grid-cols-5 gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        {(Object.entries(counts) as [string, number][]).map(([status, count]) => (
          <div
            key={status}
            className="bg-bg-secondary border border-border-subtle rounded-lg p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] text-center"
          >
            <p className="text-[5.333vw] tablet:text-[2.5vw] desktop:text-[1.042vw] font-bold text-foreground">
              {count}
            </p>
            <p className="text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] text-text-muted capitalize">
              {status}
            </p>
          </div>
        ))}
      </div>

      {/* Low Queue Warning */}
      {counts.pending <= 10 && counts.pending > 0 && (
        <div className="bg-amber-400/10 border border-amber-400/30 rounded-lg p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw]">
          <p className="text-amber-400 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] font-medium">
            Queue is running low — only {counts.pending} pending titles remaining. Add more to keep the pipeline going.
          </p>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-red-400 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">{error}</p>
      )}

      {/* Add Form */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
        <div className="flex items-center justify-between">
          <p className="text-foreground font-medium text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.625vw]">
            Add to Queue
          </p>
          <button
            onClick={() => setBulkMode(!bulkMode)}
            className="text-accent-cyan text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] hover:text-accent-cyan/80"
          >
            {bulkMode ? "Single mode" : "Bulk mode"}
          </button>
        </div>

        {bulkMode ? (
          <>
            <textarea
              value={bulkTitles}
              onChange={(e) => setBulkTitles(e.target.value)}
              placeholder="Enter one title per line..."
              rows={5}
              className={`${inputClass} resize-y`}
            />
            <button
              onClick={handleBulkAdd}
              disabled={loading || !bulkTitles.trim()}
              className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg text-white text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add All"}
            </button>
          </>
        ) : (
          <div className="flex gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
            <input
              type="text"
              value={singleTitle}
              onChange={(e) => setSingleTitle(e.target.value)}
              placeholder="Post title..."
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            />
            <button
              onClick={handleAdd}
              disabled={loading || !singleTitle.trim()}
              className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg text-white text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] whitespace-nowrap disabled:opacity-50"
            >
              {loading ? "Adding..." : "Add"}
            </button>
          </div>
        )}
      </div>

      {/* Queue Table */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
        {initialItems.length === 0 ? (
          <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            Queue is empty. Add some post titles to get started.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
              <thead>
                <tr className="border-b border-border-subtle text-text-muted text-left">
                  <th className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] font-medium">#</th>
                  <th className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] font-medium">Title</th>
                  <th className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] font-medium">Status</th>
                  <th className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] font-medium hidden tablet:table-cell">Created</th>
                  <th className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {initialItems.map((item) => (
                  <tr key={item.id} className="hover:bg-bg-tertiary/50 transition-colors">
                    <td className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] text-text-muted">
                      {item.position + 1}
                    </td>
                    <td className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw]">
                      {editId === item.id ? (
                        <div className="flex gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw] items-center">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            className={`${inputClass} flex-1`}
                            onKeyDown={(e) => e.key === "Enter" && handleEditSave()}
                          />
                          <button
                            onClick={handleEditSave}
                            className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => setEditId(null)}
                            className="text-text-muted hover:text-foreground text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div>
                          <p className="text-foreground">{item.title}</p>
                          {item.errorMsg && (
                            <p className="text-red-400 text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] mt-[0.667vw] tablet:mt-[0.333vw] desktop:mt-[0.139vw]">
                              {item.errorMsg}
                            </p>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw]">
                      <span
                        className={`inline-block px-[2vw] tablet:px-[1vw] desktop:px-[0.417vw] py-[0.667vw] tablet:py-[0.333vw] desktop:py-[0.139vw] rounded-full text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw] font-medium ${statusStyles[item.status] || statusStyles.pending}`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] text-text-muted hidden tablet:table-cell">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>
                    <td className="p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw]">
                      <div className="flex gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw] justify-end">
                        {["pending", "failed"].includes(item.status) && editId !== item.id && (
                          <button
                            onClick={() => {
                              setEditId(item.id);
                              setEditTitle(item.title);
                            }}
                            className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                          >
                            Edit
                          </button>
                        )}
                        {item.status === "failed" && (
                          <button
                            onClick={() => handleRetry(item.id)}
                            disabled={loading}
                            className="text-amber-400 hover:text-amber-300 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
                          >
                            Retry
                          </button>
                        )}
                        {["pending", "failed"].includes(item.status) && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            disabled={loading}
                            className="text-red-400 hover:text-red-300 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
