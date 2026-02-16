"use client";

import { useCallback } from "react";
import { inputClass } from "../../../components/shared/admin-styles";
import { useCrudManager } from "../../../components/shared/useCrudManager";

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
  const buildBody = useCallback(
    (name: string) => ({ name }),
    [],
  );

  const {
    loading,
    showForm,
    setShowForm,
    editId,
    name,
    setName,
    error,
    resetForm,
    handleCreate,
    handleUpdate,
    handleDelete,
    startEdit,
  } = useCrudManager<TagItem>({
    apiEndpoint: "/api/blog/tags",
    deleteConfirmMessage: "Delete this tag? Posts will not be deleted.",
    buildCreateBody: buildBody,
    buildUpdateBody: buildBody,
  });

  return (
    <div className="space-y-[4vw] tablet:space-y-[2vw] desktop:space-y-[0.833vw]">
      {/* Create / Edit Form */}
      {showForm ? (
        <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
          {error && (
            <p className="text-red-400 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">{error}</p>
          )}
          <div>
            <label htmlFor="tag-name" className="sr-only">Tag name</label>
            <input
              id="tag-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Tag name"
              className={inputClass}
            />
          </div>
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
      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle">
        {initialTags.length === 0 ? (
          <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            No tags yet.
          </p>
        ) : (
          initialTags.map((tag) => (
            <div
              key={tag.id}
              className="flex items-center justify-between p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
            >
              <div>
                <p className="text-foreground text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.625vw] font-medium">
                  {tag.name}
                </p>
                <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                  /{tag.slug} {"\u00B7"} {tag.postCount} posts
                </p>
              </div>
              <div className="flex gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
                <button
                  onClick={() => startEdit(tag)}
                  className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(tag.id)}
                  disabled={loading}
                  className="text-red-400 hover:text-red-300 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
