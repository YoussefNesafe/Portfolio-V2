export default function TagsLoading() {
  return (
    <div className="space-y-[5.333vw] tablet:space-y-[2.5vw] desktop:space-y-[1.042vw] animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-[6.4vw] tablet:h-[3vw] desktop:h-[1.25vw] w-[13.333vw] tablet:w-[6.25vw] desktop:w-[2.604vw] bg-bg-secondary rounded" />
        <div className="h-[8vw] tablet:h-[4vw] desktop:h-[1.667vw] w-[21.333vw] tablet:w-[10vw] desktop:w-[4.167vw] bg-bg-secondary rounded-lg" />
      </div>

      <div className="space-y-[2.667vw] tablet:space-y-[1.333vw] desktop:space-y-[0.556vw]">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-border-subtle rounded-lg p-[4vw] tablet:p-[2vw] desktop:p-[0.833vw] h-[13.333vw] tablet:h-[6.667vw] desktop:h-[2.778vw]"
          />
        ))}
      </div>
    </div>
  );
}
