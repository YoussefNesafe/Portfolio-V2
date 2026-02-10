"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

interface TagItem {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export default function TagManager({
  initialTags,
}: {
  initialTags: TagItem[];
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const resetForm = () => {
    setName("");
    setEditId(null);
    setShowForm(false);
    setError("");
  };

  const handleCreate = async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/blog/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to create");
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async () => {
    if (!editId || !name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/tags/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update");
        return;
      }
      resetForm();
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tag? Posts will not be deleted.")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/tags/${id}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete tag");
      }
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tag: TagItem) => {
    setEditId(tag.id);
    setName(tag.name);
    setShowForm(true);
  };

  const inputClass =
    "w-full px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg bg-background border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]";

  return (
    <div className="space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]">
      {/* Create / Edit Form */}
      {showForm ? (
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
          {error && (
            <p className="text-red-400 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">{error}</p>
          )}
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tag name"
            className={inputClass}
          />
          <div className="flex gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
            <button
              onClick={editId ? handleUpdate : handleCreate}
              disabled={loading}
              className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg text-white text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] disabled:opacity-50"
            >
              {loading ? "Saving..." : editId ? "Update" : "Create"}
            </button>
            <button
              onClick={resetForm}
              className="px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw] rounded-lg border border-border-subtle text-text-muted hover:text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="btn-gradient px-[4vw] tablet:px-[2vw] desktop:px-[0.833vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          New Tag
        </button>
      )}

      {/* List */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden">
        {initialTags.length === 0 ? (
          <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            No tags yet.
          </p>
        ) : (
          <div className="flex flex-wrap gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]">
            {initialTags.map((tag) => (
              <div
                key={tag.id}
                className="flex items-center gap-[1.333vw] tablet:gap-[0.667vw] desktop:gap-[0.278vw] bg-bg-tertiary border border-border-subtle rounded-lg px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2vw] tablet:py-[1vw] desktop:py-[0.417vw]"
              >
                <span className="text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
                  #{tag.name}
                </span>
                <span className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.417vw]">
                  ({tag.postCount})
                </span>
                <button
                  onClick={() => startEdit(tag)}
                  className="text-accent-cyan hover:text-accent-cyan/80 text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.417vw] ml-[1.333vw] tablet:ml-[0.667vw] desktop:ml-[0.278vw]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.417vw] disabled:opacity-50"
                >
                  Del
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
