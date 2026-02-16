"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";

interface UseCrudManagerOptions<T extends { id: string; name: string }> {
  apiEndpoint: string;
  deleteConfirmMessage: string;
  buildCreateBody: (name: string) => Record<string, unknown>;
  buildUpdateBody: (name: string) => Record<string, unknown>;
  onResetForm?: () => void;
  onStartEdit?: (item: T) => void;
}

export function useCrudManager<T extends { id: string; name: string }>(
  options: UseCrudManagerOptions<T>,
) {
  const {
    apiEndpoint,
    deleteConfirmMessage,
    buildCreateBody,
    buildUpdateBody,
    onResetForm,
    onStartEdit,
  } = options;

  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setName("");
    setEditId(null);
    setShowForm(false);
    setError("");
    onResetForm?.();
  }, [onResetForm]);

  const handleCreate = useCallback(async () => {
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch(apiEndpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildCreateBody(name)),
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
  }, [name, apiEndpoint, buildCreateBody, resetForm, router]);

  const handleUpdate = useCallback(async () => {
    if (!editId || !name.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiEndpoint}/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildUpdateBody(name)),
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
  }, [editId, name, apiEndpoint, buildUpdateBody, resetForm, router]);

  const handleDelete = useCallback(
    async (id: string) => {
      if (!confirm(deleteConfirmMessage)) return;
      setLoading(true);
      setError("");
      try {
        const res = await fetch(`${apiEndpoint}/${id}`, { method: "DELETE" });
        if (res.ok) {
          router.refresh();
        } else {
          const data = await res.json();
          setError(data.error || "Failed to delete");
        }
      } finally {
        setLoading(false);
      }
    },
    [apiEndpoint, deleteConfirmMessage, router],
  );

  const startEdit = useCallback(
    (item: T) => {
      setEditId(item.id);
      setName(item.name);
      setShowForm(true);
      onStartEdit?.(item);
    },
    [onStartEdit],
  );

  return {
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
  };
}
