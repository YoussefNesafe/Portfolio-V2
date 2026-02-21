const GridBackground = () => {
  return (
    <div className="pointer-events-none absolute inset-0 ">
      <div
        className="absolute inset-0 min-h-full opacity-[0.1] "
        style={{
          backgroundImage:
            "radial-gradient(circle, #06B6D4 1px, transparent 1px)",
          backgroundSize: "4vw 4vw",
          backgroundRepeat: "repeat",
        }}
      />
    </div>
  );
};

export default GridBackground;
