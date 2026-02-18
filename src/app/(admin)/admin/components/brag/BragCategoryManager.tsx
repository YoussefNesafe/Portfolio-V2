"use client";

import { useCallback, useState } from "react";
import { inputClass } from "../shared/admin-styles";
import { useCrudManager } from "../shared/useCrudManager";

interface BragCategoryItem {
  id: string;
  name: string;
  slug: string;
  color: string | null;
  sortOrder: number;
  entryCount: number;
}

export default function BragCategoryManager({
  initialCategories,
}: {
  initialCategories: BragCategoryItem[];
}) {
  const [color, setColor] = useState("#06B6D4");
  const [sortOrder, setSortOrder] = useState(0);

  const onResetForm = useCallback(() => {
    setColor("#06B6D4");
    setSortOrder(0);
  }, []);

  const onStartEdit = useCallback((item: BragCategoryItem) => {
    setColor(item.color || "#06B6D4");
    setSortOrder(item.sortOrder);
  }, []);

  const buildBody = useCallback(
    (name: string) => ({ name, color, sortOrder }),
    [color, sortOrder],
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
  } = useCrudManager<BragCategoryItem>({
    apiEndpoint: "/api/brag/categories",
    deleteConfirmMessage: "Delete this category? It must have no entries.",
    buildCreateBody: buildBody,
    buildUpdateBody: buildBody,
    onResetForm,
    onStartEdit,
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
            <label htmlFor="brag-cat-name" className="sr-only">Category name</label>
            <input
              id="brag-cat-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Category name"
              className={inputClass}
            />
          </div>
          <div className="flex gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw] items-end">
            <div className="flex-1">
              <label htmlFor="brag-cat-color" className="sr-only">Color</label>
              <div className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
                <input
                  id="brag-cat-color"
                  type="color"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  className="w-[8vw] h-[8vw] tablet:w-[4vw] tablet:h-[4vw] desktop:w-[1.667vw] desktop:h-[1.667vw] rounded cursor-pointer border border-border-subtle bg-transparent"
                />
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="#06B6D4"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="w-[20vw] tablet:w-[10vw] desktop:w-[4.167vw]">
              <label htmlFor="brag-cat-order" className="sr-only">Sort order</label>
              <input
                id="brag-cat-order"
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                placeholder="Order"
                min={0}
                className={inputClass}
              />
            </div>
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
          New Category
        </button>
      )}

      {/* List */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg overflow-hidden divide-y divide-border-subtle">
        {initialCategories.length === 0 ? (
          <p className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] text-text-muted text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
            No brag categories yet.
          </p>
        ) : (
          initialCategories.map((cat) => (
            <div
              key={cat.id}
              className="flex items-center justify-between p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
            >
              <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
                <span
                  className="w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] rounded-full inline-block"
                  style={{ backgroundColor: cat.color || "#06B6D4" }}
                />
                <div>
                  <p className="text-foreground text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.625vw] font-medium">
                    {cat.name}
                  </p>
                  <p className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.458vw]">
                    /{cat.slug} {"\u00B7"} {cat.entryCount} entries {"\u00B7"} order: {cat.sortOrder}
                  </p>
                </div>
              </div>
              <div className="flex gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
                <button
                  onClick={() => startEdit(cat)}
                  className="text-accent-cyan hover:text-accent-cyan/80 text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
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
