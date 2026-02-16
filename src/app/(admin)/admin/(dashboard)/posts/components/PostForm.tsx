"use client";

import usePostForm from "./post-form/usePostForm";
import { inputClass, labelClass } from "../../../components/shared/admin-styles";
import FormAlerts from "./post-form/FormAlerts";
import CategorySelector from "./post-form/CategorySelector";
import TagSelector from "./post-form/TagSelector";
import PublishToggle from "./post-form/PublishToggle";
import FormActions from "./post-form/FormActions";
import type { PostFormProps } from "./post-form/types";

export type { PostFormProps };
export type { PostData, Category, Tag } from "./post-form/types";

export default function PostForm({ initialData, isEdit }: PostFormProps) {
  const {
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
  } = usePostForm({ initialData, isEdit });

  return (
    <form onSubmit={handleSubmit} className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw]">
      <FormAlerts error={error} success={success} />

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
          onChange={(e) => updateField("slug", e.target.value)}
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
          onChange={(e) => updateField("description", e.target.value)}
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
          onChange={(e) => updateField("content", e.target.value)}
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
          onChange={(e) => updateField("excerpt", e.target.value)}
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
          onChange={(e) => updateField("coverImage", e.target.value)}
          placeholder="https://example.com/image.jpg"
          className={inputClass}
        />
      </div>

      <CategorySelector
        categories={categories}
        selectedIds={form.categoryIds}
        onToggle={toggleCategory}
      />

      <TagSelector
        tags={tags}
        selectedIds={form.tagIds}
        onToggle={toggleTag}
      />

      <PublishToggle
        published={form.published}
        onToggle={togglePublished}
      />

      <FormActions loading={loading} isEdit={isEdit} />
    </form>
  );
}
