export const SIZE_SM =
  "w-[11vw] h-[11vw] tablet:w-[5.5vw] tablet:h-[5.5vw] desktop:w-[3.75vw] desktop:h-[3.75vw]";
export const SIZE_MD =
  "w-[14vw] h-[14vw] tablet:w-[7vw] tablet:h-[7vw] desktop:w-[4.688vw] desktop:h-[4.688vw]";
export const SIZE_LG =
  "w-[16vw] h-[16vw] tablet:w-[8vw] tablet:h-[8vw] desktop:w-[5.625vw] desktop:h-[5.625vw]";

export interface FloatItem {
  svg: React.ReactNode;
  position: string;
  size: string;
  color: string;
  opacity: string;
  animation: string;
  delay: string;
  rotate?: string;
  desktopOnly?: boolean;
}
