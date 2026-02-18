"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface BragEntryActionsProps {
  entryId: string;
  published: boolean;
  pinned: boolean;
}

export default function BragEntryActions({ entryId, published, pinned }: BragEntryActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleToggle = async (field: "published" | "pinned", currentValue: boolean) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/brag/entries/${entryId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: !currentValue }),
      });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this entry?")) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/brag/entries/${entryId}`, { method: "DELETE" });
      if (res.ok) router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
      <Link
        href={`/admin/brag/${entryId}`}
        className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
      >
        Edit
      </Link>
      <button
        onClick={() => handleToggle("published", published)}
        disabled={loading}
        className="text-accent-emerald hover:text-accent-emerald/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        {published ? "Unpublish" : "Publish"}
      </button>
      <button
        onClick={() => handleToggle("pinned", pinned)}
        disabled={loading}
        className="text-accent-purple hover:text-accent-purple/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        {pinned ? "Unpin" : "Pin"}
      </button>
      <button
        onClick={handleDelete}
        disabled={loading}
        className="text-red-400 hover:text-red-300 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        Delete
      </button>
    </div>
  );
}
