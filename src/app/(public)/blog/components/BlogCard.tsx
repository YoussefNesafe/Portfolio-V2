"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { fadeUp } from "@/app/lib/animations";

interface BlogCardProps {
  id: string;
  slug: string;
  title: string;
  description: string;
  coverImage?: string;
  category?: {
    id: string;
    name: string;
    slug: string;
  };
  publishedAt?: Date;
}

export default function BlogCard({
  slug,
  title,
  description,
  coverImage,
  category,
  publishedAt,
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
        <div className="group relative h-full rounded-lg border border-subtle bg-background/50 hover:bg-background/80 overflow-hidden transition-all duration-300 hover:border-accent-cyan/50 hover:shadow-lg hover:shadow-accent-cyan/20 cursor-pointer">
          {coverImage && (
            <div className="w-full h-[30vw] tablet:h-[15vw] desktop:h-[6vw] bg-gradient-to-br from-accent-cyan/10 to-accent-purple/10 overflow-hidden">
              <img
                src={coverImage}
                alt={title}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
              />
            </div>
          )}

          <div className="p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]">
            {category && (
              <span className="inline-block mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw] px-[2.667vw] tablet:px-[1.333vw] desktop:px-[0.556vw] py-[1.333vw] tablet:py-[0.667vw] desktop:py-[0.278vw] bg-accent-cyan/10 text-accent-cyan rounded text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw] font-medium">
                {category.name}
              </span>
            )}

            <h3 className="text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-bold mb-[2.667vw] tablet:mb-[1.333vw] desktop:mb-[0.556vw] group-hover:text-accent-cyan transition-colors duration-300 line-clamp-2">
              {title}
            </h3>

            <p className="text-muted text-[2.933vw] tablet:text-[1.4vw] desktop:text-[0.583vw] mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw] line-clamp-3">
              {description}
            </p>

            {formattedDate && (
              <p className="text-muted text-[2.4vw] tablet:text-[1.1vw] desktop:text-[0.458vw]">
                {formattedDate}
              </p>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
