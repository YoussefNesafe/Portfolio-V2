"use client";

import { motion, useReducedMotion } from "framer-motion";

interface SplitTextProps {
  children: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "span";
  delay?: number;
}

const wordVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.04,
      duration: 0.5,
      ease: [0.33, 1, 0.68, 1] as [number, number, number, number],
    },
  }),
};

export default function SplitText({
  children,
  className,
  as: Tag = "span",
  delay = 0,
}: SplitTextProps) {
  const prefersReducedMotion = useReducedMotion();
  const words = children.split(" ");

  if (prefersReducedMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag className={className}>
      {words.map((word, i) => (
        <motion.span
          key={`${word}-${i}`}
          custom={i + delay}
          variants={wordVariants}
          className="inline-block mr-[1.067vw] tablet:mr-[0.5vw] desktop:mr-[0.208vw]"
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
}
