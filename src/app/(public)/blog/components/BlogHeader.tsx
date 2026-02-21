import GradientBlob from "@/app/components/ui/GradientBlob";

const BlogHeader = () => {
  return (
    <section className="flex flex-col gap-[2.67vw] tablet:gap-[1.75vw] desktop:gap-[1.04vw] pb-[16.02vw] pt-[32.04vw] tablet:pt-[21.25vw] tablet:pb-[12.5vw] desktop:pt-[10.4vw] desktop:pb-[7.8vw] justify-center items-center relative overflow-x-clip">
      <GradientBlob
        color="cyan"
        className="-top-[20vw] -right-[20vw] tablet:-top-[10vw] tablet:-right-[10vw] desktop:-top-[5.208vw] desktop:-right-[5.208vw] animate-wave-glow"
      />
      <GradientBlob
        color="purple"
        className="-bottom-[20vw] -left-[20vw] tablet:-bottom-[10vw] tablet:-left-[10vw] desktop:-bottom-[5.208vw] desktop:-left-[5.208vw] animate-wave-glow"
      />
      <h1 className="text-heading font-semibold text-[7.476vw] tablet:text-[4.5vw] desktop:text-[2.912vw]">
        Blog
      </h1>
      <p className="text-muted text-[4.272vw] tablet:text-[2vw] desktop:text-[1.04vw] text-center">
        Where technology meets curiosity, creativity, and real-world thinking.
      </p>
    </section>
  );
};

export default BlogHeader;
