export const getBpClassName = (
  tabletClassName: string,
  desktopClassName?: string
) =>
  `${tabletClassName
    .trim()
    .split(" ")
    .map((c) => `tablet:${c}`)
    .join(" ")}${
    desktopClassName
      ? ` ${desktopClassName
          .trim()
          .split(" ")
          .map((c) => `desktop:${c}`)
          .join(" ")}`
      : ""
  }`;
