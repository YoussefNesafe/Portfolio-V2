"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { slugify } from "@/app/utils/slugify";
import type { Category, Tag, PostData, PostFormProps } from "./types";

export default function usePostForm({ initialData, isEdit }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);

  const [form, setForm] = useState<PostData>({
    title: initialData?.title || "",
    slug: initialData?.slug || "",
    description: initialData?.description || "",
    content: initialData?.content || "",
    excerpt: initialData?.excerpt || "",
    coverImage: initialData?.coverImage || "",
    published: initialData?.published || false,
    categoryIds: initialData?.categoryIds || [],
    tagIds: initialData?.tagIds || [],
  });

  // Sync form state when initialData changes (e.g. navigating between edit pages)
  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title || "",
        slug: initialData.slug || "",
        description: initialData.description || "",
        content: initialData.content || "",
        excerpt: initialData.excerpt || "",
        coverImage: initialData.coverImage || "",
        published: initialData.published || false,
        categoryIds: initialData.categoryIds || [],
        tagIds: initialData.tagIds || [],
      });
    }
  }, [initialData?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    async function fetchMeta() {
      try {
        const [catRes, tagRes] = await Promise.all([
          fetch("/api/blog/categories"),
          fetch("/api/blog/tags"),
        ]);
        if (catRes.ok) setCategories(await catRes.json());
        if (tagRes.ok) setTags(await tagRes.json());
      } catch {
        // Network error — categories/tags will remain empty
      }
    }
    fetchMeta();
  }, []);

  const handleTitleChange = (title: string) => {
    setForm((prev) => ({
      ...prev,
      title,
      slug: !isEdit || !prev.slug ? slugify(title) : prev.slug,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.title || !form.description || !form.content) {
      setError("Title, description, and content are required.");
      return;
    }

    setLoading(true);
    try {
      const url = isEdit ? `/api/blog/${initialData?.id}` : "/api/blog";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          slug: form.slug || undefined,
          description: form.description,
          content: form.content,
          excerpt: form.excerpt || undefined,
          coverImage: form.coverImage || undefined,
          published: form.published,
          publishedAt: isEdit
            ? (form.published && !initialData?.published ? new Date().toISOString() : undefined)
            : (form.published ? new Date().toISOString() : null),
          categoryIds: form.categoryIds.length > 0 ? form.categoryIds : undefined,
          tagIds: form.tagIds.length > 0 ? form.tagIds : undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to save post");
        return;
      }

      const post = await res.json();
      setSuccess(isEdit ? "Post updated successfully!" : "Post created successfully!");

      if (!isEdit) {
        router.push(`/admin/posts/${post.id}`);
      } else {
        router.refresh();
      }
    } catch {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  const toggleCategory = (id: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.includes(id)
        ? prev.categoryIds.filter((c) => c !== id)
        : [...prev.categoryIds, id],
    }));
  };

  const toggleTag = (id: string) => {
    setForm((prev) => ({
      ...prev,
      tagIds: prev.tagIds.includes(id)
        ? prev.tagIds.filter((t) => t !== id)
        : [...prev.tagIds, id],
    }));
  };

  const updateField = <K extends keyof PostData>(key: K, value: PostData[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const togglePublished = () => {
    setForm((prev) => ({ ...prev, published: !prev.published }));
  };

  return {
    form,
    loading,
    error,
    success,
    categories,
    tags,
    handleTitleChange,
    handleSubmit,
    toggleCategory,
    toggleTag,
    updateField,
    togglePublished,
  };
}
