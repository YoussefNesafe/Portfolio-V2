export default function SectionDivider() {
  return (
    <div className="relative w-full py-[4vw] tablet:py-[2vw] desktop:py-[1vw] overflow-hidden">
      <div className="relative h-[0.267vw] tablet:h-[0.125vw] desktop:h-[0.052vw] w-full">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-cyan/40 to-transparent"
          style={{
            maskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
            WebkitMaskImage: "linear-gradient(to right, transparent, black 30%, black 70%, transparent)",
          }}
        />
      </div>
    </div>
  );
}
