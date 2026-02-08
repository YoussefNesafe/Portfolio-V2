import { ReactNode } from "react";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-full">
      <div className="relative z-10 mx-auto px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] py-[10.667vw] tablet:py-[5vw] desktop:py-[2.083vw]">
        <div className="mb-[8vw] tablet:mb-[4vw] desktop:mb-[2vw]">
          <h1 className="text-heading text-[8vw] tablet:text-[4vw] desktop:text-[1.667vw] font-bold mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw]">
            Blog
          </h1>
          <p className="text-muted text-[3.733vw] tablet:text-[1.8vw] desktop:text-[0.75vw]">
            Thoughts, stories, and ideas
          </p>
        </div>

        {children}
      </div>
    </section>
  );
}
