"use client";

import { format, startOfMonth, subMonths } from "date-fns";
import { es } from "date-fns/locale";
import type { FC } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface MonthlyRevenueItem {
  month: string; // "YYYY-MM"
  revenue: number;
  count: number;
}

interface RevenueChartProps {
  data: MonthlyRevenueItem[];
}

const chartConfig = {
  revenue: {
    label: "Ingresos",
    color: "var(--color-chart-1)",
  },
} satisfies ChartConfig;

/** Always returns the last 6 calendar months, oldest → newest. */
function getLast6Months(): { month: string; label: string }[] {
  const now = startOfMonth(new Date());
  return Array.from({ length: 6 }, (_, i) => {
    const date = subMonths(now, 5 - i);
    return {
      month: format(date, "yyyy-MM"),
      label: format(date, "MMM yy", { locale: es }),
    };
  });
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) {
    return `$${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `$${(value / 1_000).toFixed(0)}K`;
  }
  return `$${value.toFixed(0)}`;
}

const RevenueChart: FC<RevenueChartProps> = ({ data }) => {
  const slots = getLast6Months();
  const byMonth = new Map(data.map((item) => [item.month, item]));

  const chartData = slots.map(({ month, label }) => {
    const item = byMonth.get(month);
    return {
      label,
      revenue: item?.revenue ?? 0,
      count: item?.count ?? 0,
    };
  });

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <BarChart
        data={chartData}
        margin={{ top: 4, right: 4, left: 0, bottom: 0 }}
      >
        <CartesianGrid
          vertical={false}
          strokeDasharray="3 3"
          stroke="var(--color-border)"
          strokeOpacity={0.5}
        />

        <XAxis
          dataKey="label"
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          dy={4}
        />

        <YAxis
          tickLine={false}
          axisLine={false}
          tick={{ fontSize: 11, fontFamily: "var(--font-mono)" }}
          tickFormatter={formatCurrency}
          width={52}
        />

        <ChartTooltip
          content={
            <ChartTooltipContent
              labelKey="label"
              formatter={(value) => (
                <div className="flex flex-1 items-center justify-between gap-2 leading-none">
                  <span className="text-muted-foreground">Ingresos</span>
                  <span className="font-mono font-medium tabular-nums">
                    {`$${Number(value).toLocaleString("es-CO")}`}
                  </span>
                </div>
              )}
            />
          }
        />

        <Bar dataKey="revenue" fill="var(--color-chart-1)" radius={0} />
      </BarChart>
    </ChartContainer>
  );
};

export default RevenueChart;
