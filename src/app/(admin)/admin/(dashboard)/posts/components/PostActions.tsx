"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface PostActionsProps {
  postId: string;
  published: boolean;
}

export default function PostActions({ postId, published }: PostActionsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleTogglePublish = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          published: !published,
          publishedAt: !published ? new Date().toISOString() : undefined,
        }),
      });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update post");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this post?")) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/blog/${postId}`, { method: "DELETE" });
      if (res.ok) {
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Failed to delete post");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
      {error && (
        <span className="text-red-400 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">{error}</span>
      )}
      <Link
        href={`/admin/posts/${postId}`}
        className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
      >
        Edit
      </Link>
      <button
        onClick={handleTogglePublish}
        disabled={loading}
        className="text-accent-emerald hover:text-accent-emerald/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
      >
        {published ? "Unpublish" : "Publish"}
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
