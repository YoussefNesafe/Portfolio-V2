"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { slugify } from "@/app/utils/slugify";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Tag {
  id: string;
  name: string;
  slug: string;
}

interface PostData {
  id?: string;
  title: string;
  slug: string;
  description: string;
  content: string;
  excerpt: string;
  coverImage: string;
  published: boolean;
  categoryIds: string[];
  tagIds: string[];
}

interface PostFormProps {
  initialData?: PostData;
  isEdit?: boolean;
}

export default function PostForm({ initialData, isEdit }: PostFormProps) {
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

  const inputClass =
    "w-full px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg bg-background border border-border-subtle text-foreground placeholder:text-text-muted focus:outline-none focus:border-accent-cyan/50 text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]";

  const labelClass =
    "block text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]";

  return (
    <form onSubmit={handleSubmit} className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-accent-emerald/10 border border-accent-emerald/30 text-accent-emerald p-[3vw] tablet:p-[1.5vw] desktop:p-[0.625vw] rounded-lg text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
          {success}
        </div>
      )}

      {/* Title */}
      <div>
        <label htmlFor="post-title" className={labelClass}>Title *</label>
        <input
          id="post-title"
          type="text"
          value={form.title}
          onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Post title"
          maxLength={255}
          className={inputClass}
        />
      </div>

      {/* Slug */}
      <div>
        <label htmlFor="post-slug" className={labelClass}>Slug</label>
        <input
          id="post-slug"
          type="text"
          value={form.slug}
          onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))}
          placeholder="auto-generated-from-title"
          className={inputClass}
        />
      </div>

      {/* Description */}
      <div>
        <label htmlFor="post-description" className={labelClass}>Description *</label>
        <textarea
          id="post-description"
          value={form.description}
          onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
          placeholder="Brief description of the post"
          maxLength={500}
          rows={3}
          className={inputClass + " resize-y"}
        />
        <p className="text-text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.417vw] mt-[0.667vw] tablet:mt-[0.333vw] desktop:mt-[0.139vw]">
          {form.description.length}/500
        </p>
      </div>

      {/* Content */}
      <div>
        <label htmlFor="post-content" className={labelClass}>Content * (HTML supported)</label>
        <textarea
          id="post-content"
          value={form.content}
          onChange={(e) => setForm((p) => ({ ...p, content: e.target.value }))}
          placeholder="Write your post content here... HTML tags are supported."
          rows={15}
          className={inputClass + " resize-y font-mono"}
        />
      </div>

      {/* Excerpt */}
      <div>
        <label htmlFor="post-excerpt" className={labelClass}>Excerpt (optional)</label>
        <textarea
          id="post-excerpt"
          value={form.excerpt}
          onChange={(e) => setForm((p) => ({ ...p, excerpt: e.target.value }))}
          placeholder="Short excerpt for previews"
          rows={2}
          className={inputClass + " resize-y"}
        />
      </div>

      {/* Cover Image */}
      <div>
        <label htmlFor="post-coverImage" className={labelClass}>Cover Image URL (optional)</label>
        <input
          id="post-coverImage"
          type="url"
          value={form.coverImage}
          onChange={(e) => setForm((p) => ({ ...p, coverImage: e.target.value }))}
          placeholder="https://example.com/image.jpg"
          className={inputClass}
        />
      </div>

      {/* Categories */}
      <div>
        <label className={labelClass}>Categories</label>
        <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleCategory(cat.id)}
              className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
                form.categoryIds.includes(cat.id)
                  ? "bg-accent-cyan/20 text-accent-cyan border-accent-cyan/50"
                  : "border-border-subtle text-text-muted hover:border-accent-cyan/30"
              }`}
            >
              {cat.name}
            </button>
          ))}
          {categories.length === 0 && (
            <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
              No categories yet
            </p>
          )}
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className={labelClass}>Tags</label>
        <div className="flex flex-wrap gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-[3vw] tablet:px-[1.5vw] desktop:px-[0.625vw] py-[1.5vw] tablet:py-[0.75vw] desktop:py-[0.313vw] rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] border transition-colors ${
                form.tagIds.includes(tag.id)
                  ? "bg-accent-purple/20 text-accent-purple border-accent-purple/50"
                  : "border-border-subtle text-text-muted hover:border-accent-purple/30"
              }`}
            >
              #{tag.name}
            </button>
          ))}
          {tags.length === 0 && (
            <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
              No tags yet
            </p>
          )}
        </div>
      </div>

      {/* Published toggle */}
      <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        <button
          type="button"
          role="switch"
          aria-checked={form.published}
          aria-label={form.published ? "Published" : "Draft"}
          onClick={() => setForm((p) => ({ ...p, published: !p.published }))}
          className={`relative w-[10.667vw] tablet:w-[5vw] desktop:w-[2.083vw] h-[5.333vw] tablet:h-[2.5vw] desktop:h-[1.042vw] rounded-full transition-colors ${
            form.published ? "bg-accent-emerald" : "bg-bg-tertiary"
          }`}
        >
          <span
            className={`absolute top-[0.667vw] tablet:top-[0.333vw] desktop:top-[0.139vw] w-[4vw] tablet:w-[1.833vw] desktop:w-[0.764vw] h-[4vw] tablet:h-[1.833vw] desktop:h-[0.764vw] bg-white rounded-full transition-transform ${
              form.published
                ? "translate-x-[6vw] tablet:translate-x-[2.833vw] desktop:translate-x-[1.181vw]"
                : "translate-x-[0.667vw] tablet:translate-x-[0.333vw] desktop:translate-x-[0.139vw]"
            }`}
          />
        </button>
        <span className="text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
          {form.published ? "Published" : "Draft"}
        </span>
      </div>

      {/* Submit */}
      <div className="flex gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
        <button
          type="submit"
          disabled={loading}
          className="btn-gradient px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg text-white font-medium text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw] disabled:opacity-50"
        >
          {loading ? "Saving..." : isEdit ? "Update Post" : "Create Post"}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[2.667vw] tablet:py-[1.333vw] desktop:py-[0.556vw] rounded-lg border border-border-subtle text-text-muted hover:text-foreground hover:border-foreground/30 transition-colors text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
