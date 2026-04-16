"use client";

import type { FC } from "react";
import { Cell, Pie, PieChart } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface InvoiceStatusChartProps {
  validated: number;
  pending: number;
}

const chartConfig = {
  validated: {
    label: "Validadas",
    color: "var(--color-chart-1)",
  },
  pending: {
    label: "Pendientes",
    color: "var(--color-chart-3)",
  },
} satisfies ChartConfig;

const StatusChart: FC<InvoiceStatusChartProps> = ({ validated, pending }) => {
  const total = validated + pending;

  const chartData = [
    { name: "validated", value: validated, fill: "var(--color-chart-1)" },
    { name: "pending", value: pending, fill: "var(--color-chart-3)" },
  ];

  return (
    <div className="relative flex flex-col items-center">
      <ChartContainer
        config={chartConfig}
        className="h-[180px] w-full max-w-[220px]"
      >
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={52}
            outerRadius={76}
            paddingAngle={total > 0 ? 2 : 0}
            dataKey="value"
            strokeWidth={0}
          >
            {chartData.map((entry) => (
              <Cell key={entry.name} fill={entry.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>

      {/* Center label */}
      <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono text-2xl leading-none font-semibold tabular-nums">
          {total}
        </span>
        <span className="text-muted-foreground mt-1 text-[10px] tracking-widest uppercase">
          Total
        </span>
      </div>
    </div>
  );
};

export default StatusChart;
