export default function AnalyticsLoading() {
  return (
    <div className="space-y-[6.667vw] tablet:space-y-[3.333vw] desktop:space-y-[1.389vw] animate-pulse">
      {/* Header skeleton */}
      <div className="h-[6.4vw] tablet:h-[3vw] desktop:h-[1.25vw] w-[26.667vw] tablet:w-[12.5vw] desktop:w-[5.208vw] bg-bg-secondary rounded" />

      {/* Stat card skeleton */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] h-[16vw] tablet:h-[8vw] desktop:h-[3.333vw]" />

      {/* Top posts skeleton */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle">
          <div className="h-[4.267vw] tablet:h-[2vw] desktop:h-[0.833vw] w-[24vw] tablet:w-[11.667vw] desktop:w-[4.861vw] bg-bg-tertiary rounded" />
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
            >
              <div className="h-[3.2vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-[5.333vw] tablet:w-[2.667vw] desktop:w-[1.111vw] bg-bg-tertiary rounded flex-shrink-0" />
              <div className="flex-1 h-[3.2vw] tablet:h-[1.5vw] desktop:h-[0.625vw] bg-bg-tertiary rounded" />
              <div className="h-[5.333vw] tablet:h-[2.667vw] desktop:h-[1.111vw] w-[16vw] tablet:w-[8vw] desktop:w-[3.333vw] bg-bg-tertiary rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>

      {/* All posts table skeleton */}
      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        <div className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle">
          <div className="h-[4.267vw] tablet:h-[2vw] desktop:h-[0.833vw] w-[40vw] tablet:w-[20vw] desktop:w-[8.333vw] bg-bg-tertiary rounded" />
        </div>
        <div className="divide-y divide-border-subtle">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw] p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw]"
            >
              <div className="h-[3.2vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-[8vw] tablet:w-[4vw] desktop:w-[1.667vw] bg-bg-tertiary rounded flex-shrink-0" />
              <div className="flex-1 h-[3.2vw] tablet:h-[1.5vw] desktop:h-[0.625vw] bg-bg-tertiary rounded" />
              <div className="h-[3.2vw] tablet:h-[1.5vw] desktop:h-[0.625vw] w-[13.333vw] tablet:w-[6.667vw] desktop:w-[2.778vw] bg-bg-tertiary rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
