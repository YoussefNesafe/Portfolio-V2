export default function BlogLoading() {
  return (
    <div className="space-y-[8vw] tablet:space-y-[4vw] desktop:space-y-[1.667vw]">
      {/* Search skeleton */}
      <div className="flex flex-col tablet:flex-row gap-[2.5vw] tablet:gap-[1.25vw] desktop:gap-[0.521vw]">
        <div className="flex-1 h-[10vw] tablet:h-[5vw] desktop:h-[2.083vw] bg-bg-secondary rounded-lg animate-pulse" />
        <div className="w-full tablet:w-[20vw] desktop:w-[10vw] h-[10vw] tablet:h-[5vw] desktop:h-[2.083vw] bg-bg-secondary rounded-lg animate-pulse" />
        <div className="w-full tablet:w-[20vw] desktop:w-[10vw] h-[10vw] tablet:h-[5vw] desktop:h-[2.083vw] bg-bg-secondary rounded-lg animate-pulse" />
      </div>

      {/* Posts grid skeleton */}
      <div className="grid grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3 gap-[5.333vw] tablet:gap-[2.5vw] desktop:gap-[1.042vw]">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-border-subtle bg-background/50 overflow-hidden"
          >
            <div className="w-full h-[30vw] tablet:h-[15vw] desktop:h-[6vw] bg-bg-secondary animate-pulse" />
            <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw] space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
              <div className="h-[3vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-1/4 bg-bg-secondary rounded animate-pulse" />
              <div className="h-[4vw] tablet:h-[2vw] desktop:h-[0.833vw] w-3/4 bg-bg-secondary rounded animate-pulse" />
              <div className="h-[3vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-full bg-bg-secondary rounded animate-pulse" />
              <div className="h-[3vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-2/3 bg-bg-secondary rounded animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
