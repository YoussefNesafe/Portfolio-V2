"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { fadeUp } from "@/app/lib/animations";
import { BsCalendar } from "react-icons/bs";

interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  categories?: {
    id: string;
    name: string;
    slug: string;
  }[];
  publishedAt?: Date | string;
  searchQuery?: string;
}

function highlightText(text: string, query?: string) {
  if (!query || !query.trim()) return text;

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const parts = text.split(new RegExp(`(${escaped})`, "gi"));

  return parts.map((part, i) =>
    part.toLowerCase() === query.toLowerCase() ? (
      <mark
        key={i}
        className="bg-accent-cyan/30 text-accent-cyan rounded-sm px-[0.534vw] tablet:px-[0.25vw] desktop:px-[0.104vw]"
      >
        {part}
      </mark>
    ) : (
      part
    ),
  );
}

export default function BlogCard({
  slug,
  title,
  description,
  coverImage,
  categories,
  publishedAt,
  searchQuery,
}: BlogCardProps) {
  const formattedDate = publishedAt
    ? new Date(publishedAt).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/blog/${slug}`}>
        <div className="group relative h-full rounded-lg border border-border-subtle bg-background/50 hover:bg-background/80 overflow-hidden transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-lg hover:shadow-accent-cyan/20 cursor-pointer ">
          {coverImage && (
            <div className="relative w-full h-[30.171vw] tablet:h-[15vw] desktop:h-[6.032vw] bg-linear-to-br from-accent-cyan/10 to-accent-purple/10 overflow-hidden">
              <Image
                src={coverImage}
                alt={title}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-300"
                sizes="(max-width: 480px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
            </div>
          )}

          <div className="p-[5.34vw] tablet:p-[2.5vw] desktop:p-[1.092vw] h-full flex flex-col justify-between">
            <div>
              {categories && categories.length > 0 && (
                <div className="flex flex-wrap gap-[1.335vw] tablet:gap-[0.75vw] desktop:gap-[0.312vw] mb-[2.67vw] tablet:mb-[1.375vw] desktop:mb-[0.572vw]">
                  {categories.map((cat) => (
                    <span
                      key={cat.id}
                      className="inline-block px-[2.67vw] tablet:px-[1.375vw] desktop:px-[0.572vw] py-[1.335vw] tablet:py-[0.75vw] desktop:py-[0.312vw] bg-accent-cyan/10 text-accent-cyan rounded text-[2.67vw] tablet:text-[1.25vw] desktop:text-[0.52vw] font-medium"
                    >
                      {cat.name}
                    </span>
                  ))}
                </div>
              )}

              <h3 className="text-heading text-[4.272vw] tablet:text-[2vw] desktop:text-[0.884vw] font-bold mb-[2.67vw] tablet:mb-[1.375vw] desktop:mb-[0.572vw] group-hover:text-accent-cyan transition-colors duration-300 line-clamp-2">
                {highlightText(title, searchQuery)}
              </h3>

              <p className="text-gray-400 text-[2.937vw] tablet:text-[1.5vw] desktop:text-[0.624vw] mb-[4.005vw] tablet:mb-[2vw] desktop:mb-[0.884vw] line-clamp-3">
                {highlightText(description, searchQuery)}
              </p>
            </div>

            {formattedDate && (
              <div className="flex  text-[3.204vw] tablet:text-[1.5vw] desktop:text-[0.624vw] gap-[1.068vw] tablet:gap-[1vw] desktop:gap-[0.416vw] items-center text-gray-700">
                <BsCalendar />
                <p>{formattedDate}</p>
              </div>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
