"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { inputClass, labelClass } from "../shared/admin-styles";

interface BragCategory {
  id: string;
  name: string;
  color: string | null;
}

interface BragEntryFormProps {
  entry?: {
    id: string;
    title: string;
    description: string;
    impact: string | null;
    date: string;
    categoryId: string;
    published: boolean;
    pinned: boolean;
  };
}

export default function BragEntryForm({ entry }: BragEntryFormProps) {
  const router = useRouter();
  const isEditing = !!entry;

  const [title, setTitle] = useState(entry?.title || "");
  const [description, setDescription] = useState(entry?.description || "");
  const [impact, setImpact] = useState(entry?.impact || "");
  const [date, setDate] = useState(
    entry?.date
      ? new Date(entry.date).toISOString().split("T")[0]
      : new Date().toISOString().split("T")[0],
  );
  const [categoryId, setCategoryId] = useState(entry?.categoryId || "");
  const [published, setPublished] = useState(entry?.published ?? false);
  const [pinned, setPinned] = useState(entry?.pinned ?? false);
  const [categories, setCategories] = useState<BragCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/brag/categories")
      .then((res) => res.json())
      .then((data) => {
        setCategories(data);
        if (!categoryId && data.length > 0) {
          setCategoryId(data[0].id);
        }
      })
      .catch(() => setError("Failed to load categories"));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const body = {
        title,
        description,
        impact: impact || undefined,
        date: new Date(date).toISOString(),
        categoryId,
        published,
        pinned,
      };

      const url = isEditing ? `/api/brag/entries/${entry.id}` : "/api/brag/entries";
      const method = isEditing ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save entry");
        return;
      }

      router.push("/admin/brag");
      router.refresh();
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]">
      {error && (
        <p className="text-red-400 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">{error}</p>
      )}

      {/* Title */}
      <div>
        <label htmlFor="title" className={labelClass}>Title</label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What did you accomplish?"
          required
          className={inputClass}
        />
      </div>

      {/* Date + Category row */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <div>
          <label htmlFor="date" className={labelClass}>Date</label>
          <input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="category" className={labelClass}>Category</label>
          <select
            id="category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            required
            className={inputClass}
          >
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className={labelClass}>Description</label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe what you did..."
          required
          rows={5}
          className={inputClass + " resize-y"}
        />
      </div>

      {/* Impact */}
      <div>
        <label htmlFor="impact" className={labelClass}>Impact (optional)</label>
        <input
          id="impact"
          type="text"
          value={impact}
          onChange={(e) => setImpact(e.target.value)}
          placeholder="e.g., Reduced load time by 40%"
          className={inputClass}
        />
      </div>

      {/* Checkboxes */}
      <div className="flex gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
        <label className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
            className="accent-accent-cyan"
          />
          Published
        </label>
        <label className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw] text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] text-foreground cursor-pointer">
          <input
            type="checkbox"
            checked={pinned}
            onChange={(e) => setPinned(e.target.checked)}
            className="accent-accent-purple"
          />
          Pinned
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] disabled:opacity-50"
        >
          {loading ? "Saving..." : isEditing ? "Update Entry" : "Create Entry"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg border border-border-subtle text-text-muted hover:text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
