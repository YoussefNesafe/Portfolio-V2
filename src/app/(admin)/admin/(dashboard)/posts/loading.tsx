export default function PostsLoading() {
  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw] animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-[6.4vw] tablet:h-[3vw] desktop:h-[1.25vw] w-[16vw] tablet:w-[7.5vw] desktop:w-[3.125vw] bg-bg-secondary rounded" />
        <div className="h-[8vw] tablet:h-[4vw] desktop:h-[1.667vw] w-[21.333vw] tablet:w-[10vw] desktop:w-[4.167vw] bg-bg-secondary rounded-lg" />
      </div>

      <div className="bg-bg-secondary border border-border-subtle rounded-lg">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] border-b border-border-subtle last:border-b-0"
          >
            <div className="h-[3.733vw] tablet:h-[1.8vw] desktop:h-[0.625vw] w-3/4 bg-background rounded mb-[1.333vw] tablet:mb-[0.667vw] desktop:mb-[0.278vw]" />
            <div className="h-[2.667vw] tablet:h-[1.2vw] desktop:h-[0.458vw] w-1/2 bg-background rounded" />
          </div>
        ))}
      </div>
    </div>
  );
}
