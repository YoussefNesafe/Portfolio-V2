import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Youssef Nesafe | Senior Frontend Engineer",
    short_name: "Youssef Nesafe",
    description:
      "Full-stack Software Engineer with 6+ years of experience building scalable, high-performance applications.",
    start_url: "/",
    display: "standalone",
    background_color: "#0A0A0F",
    theme_color: "#06B6D4",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
