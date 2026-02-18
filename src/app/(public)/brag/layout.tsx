import { ReactNode } from "react";

export default function BragLayout({ children }: { children: ReactNode }) {
  return (
    <section className="relative w-full">
      <div className="relative z-10 mx-auto px-[5.333vw] tablet:px-[2.5vw] desktop:px-[1.042vw] pt-[20vw] tablet:pt-[8vw] desktop:pt-[3.5vw] pb-[10.667vw] tablet:pb-[5vw] desktop:pb-[2.083vw]">
        {children}
      </div>
    </section>
  );
}
