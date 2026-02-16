"use client";

interface PublishToggleProps {
  published: boolean;
  onToggle: () => void;
}

export default function PublishToggle({
  published,
  onToggle,
}: PublishToggleProps) {
  return (
    <div className="flex items-center gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
      <button
        type="button"
        role="switch"
        aria-checked={published}
        aria-label={published ? "Published" : "Draft"}
        onClick={onToggle}
        className={`relative w-[10.667vw] tablet:w-[5vw] desktop:w-[2.083vw] h-[5.333vw] tablet:h-[2.5vw] desktop:h-[1.042vw] rounded-full transition-colors ${
          published ? "bg-accent-emerald" : "bg-bg-tertiary"
        }`}
      >
        <span
          className={`absolute top-[0.667vw] tablet:top-[0.333vw] desktop:top-[0.139vw] w-[4vw] tablet:w-[1.833vw] desktop:w-[0.764vw] h-[4vw] tablet:h-[1.833vw] desktop:h-[0.764vw] bg-white rounded-full transition-transform ${
            published
              ? "translate-x-[6vw] tablet:translate-x-[2.833vw] desktop:translate-x-[1.181vw]"
              : "translate-x-[0.667vw] tablet:translate-x-[0.333vw] desktop:translate-x-[0.139vw]"
          }`}
        />
      </button>
      <span className="text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
        {published ? "Published" : "Draft"}
      </span>
    </div>
  );
}
