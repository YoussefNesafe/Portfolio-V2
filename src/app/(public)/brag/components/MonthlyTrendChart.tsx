"use client";

import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { motion } from "framer-motion";
import { fadeUp, defaultViewport } from "@/app/lib/animations";

interface MonthlyTrendChartProps {
  data: { month: string; count: number }[];
}

export default function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  if (data.length === 0) return null;

  const chartData = data.map((d) => ({
    ...d,
    label: new Date(d.month + "-01").toLocaleString("en-US", { month: "short" }),
  }));

  return (
    <motion.div
      variants={fadeUp}
      initial="hidden"
      whileInView="visible"
      viewport={defaultViewport}
      className="bg-bg-secondary border border-border-subtle rounded-lg p-[5.333vw] tablet:p-[2.5vw] desktop:p-[1.042vw]"
    >
      <h3 className="text-text-heading text-[4.267vw] tablet:text-[2vw] desktop:text-[0.833vw] font-semibold mb-[4vw] tablet:mb-[2vw] desktop:mb-[0.833vw]">
        Monthly Trend
      </h3>
      <div className="h-[40vw] tablet:h-[20vw] desktop:h-[10.417vw]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#06B6D4" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
            />
            <YAxis
              axisLine={false}
              tickLine={false}
              tick={{ fill: "#A1A1AA", fontSize: 11 }}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#1A1A2E",
                border: "1px solid #1E1E2E",
                borderRadius: "8px",
                fontSize: "12px",
                color: "#E4E4E7",
              }}
              labelStyle={{ color: "#A1A1AA" }}
              itemStyle={{ color: "#06B6D4" }}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#06B6D4"
              strokeWidth={2}
              fill="url(#colorCount)"
              name="Entries"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
