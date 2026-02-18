"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";

interface CategoryChartProps {
  data: { name: string; slug: string; color: string; count: number }[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
  if (data.length === 0) return null;

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]"
    >
      <h3 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        By Category
      </h3>
      <div className="flex flex-col tablet:flex-row items-center gap-[4vw] tablet:gap-[2vw] desktop:gap-[0.833vw]">
        <div className="w-[50vw] h-[50vw] tablet:w-[20vw] tablet:h-[20vw] desktop:w-[10.417vw] desktop:h-[10.417vw]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius="55%"
                outerRadius="85%"
                strokeWidth={0}
              >
                {data.map((entry) => (
                  <Cell key={entry.slug} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1A1A2E",
                  border: "1px solid #1E1E2E",
                  borderRadius: "8px",
                  fontSize: "12px",
                  color: "#E4E4E7",
                }}
                itemStyle={{ color: "#E4E4E7" }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="flex flex-col gap-[2.667vw] tablet:gap-[1.333vw] desktop:gap-[0.556vw]">
          {data.map((cat) => (
            <div key={cat.slug} className="flex items-center gap-[2vw] tablet:gap-[1vw] desktop:gap-[0.417vw]">
              <span
                className="w-[3vw] h-[3vw] tablet:w-[1.5vw] tablet:h-[1.5vw] desktop:w-[0.625vw] desktop:h-[0.625vw] rounded-full inline-block flex-shrink-0"
                style={{ backgroundColor: cat.color }}
              />
              <span className="text-foreground text-[3.2vw] tablet:text-[1.5vw] desktop:text-[0.625vw]">
                {cat.name}
              </span>
              <span className="text-text-muted text-[2.667vw] tablet:text-[1.2vw] desktop:text-[0.5vw]">
                ({cat.count})
              </span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
