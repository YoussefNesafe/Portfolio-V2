"use client";

import { useRouter } from "next/navigation";

interface FormActionsProps {
  loading: boolean;
  isEdit?: boolean;
}

export default function FormActions({ loading, isEdit }: FormActionsProps) {
  const router = useRouter();

  return (
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
  );
}
