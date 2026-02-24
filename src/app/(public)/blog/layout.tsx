import { ReactNode } from "react";
import BlogHeader from "./components/BlogHeader";
import GridBackground from "@/app/components/ui/GridBackground";
import { getDictionary } from "@/get-dictionary";

export default async function BlogLayout({ children }: { children: ReactNode }) {
  const dict = await getDictionary();

  return (
    <div className="relative">
      <GridBackground />
      <BlogHeader title={dict.blog.header.title} subtitle={dict.blog.header.subtitle} />
      {children}
    </div>
  );
}
