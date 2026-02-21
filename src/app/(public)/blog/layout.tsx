import { ReactNode } from "react";
import BlogHeader from "./components/BlogHeader";
import GridBackground from "@/app/components/ui/GridBackground";

export default function BlogLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative">
      <GridBackground />
      <BlogHeader />
      {children}
    </div>
  );
}
