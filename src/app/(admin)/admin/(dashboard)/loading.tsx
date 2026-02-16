export default function DashboardLoading() {
  return (
    <div className="space-y-[6.667vw] tablet:space-y-[3.333vw] desktop:space-y-[1.389vw] animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-[6.4vw] tablet:h-[3vw] desktop:h-[1.25vw] w-[26.667vw] tablet:w-[12.5vw] desktop:w-[5.208vw] bg-bg-secondary rounded" />
        <div className="h-[8vw] tablet:h-[4vw] desktop:h-[1.667vw] w-[21.333vw] tablet:w-[10vw] desktop:w-[4.167vw] bg-bg-secondary rounded-lg" />
      </div>

      {/* Stats grid skeleton */}
      <div className="grid grid-cols-2 tablet:grid-cols-3 desktop:grid-cols-5 gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] h-[16vw] tablet:h-[8vw] desktop:h-[3.333vw]"
          />
        ))}
      </div>

      {/* Recent posts skeleton */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg h-[53.333vw] tablet:h-[26.667vw] desktop:h-[11.111vw]" />
    </div>
  );
}
