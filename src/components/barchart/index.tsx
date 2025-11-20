import React from "react";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import styles from "./barchart.module.scss";
import { DEFAULT_COLORS } from "@src/constant";

export type BarSeriesConfig = {
  dataKey: string;
  name?: string;
  color?: string;
  stackId?: string;
};

export type BarChartProps<T extends object = Record<string, unknown>> = {
  data: T[];
  xKey: keyof T & string;
  series: BarSeriesConfig[];
  height?: number; // container height (width is responsive)
  showGrid?: boolean;
  showLegend?: boolean;
  stacked?: boolean;
  barRadius?: number | [number, number, number, number];
  margin?: { top?: number; right?: number; bottom?: number; left?: number };
  xTickFormatter?: (value: unknown) => string | number;
  yTickFormatter?: (value: number) => string | number;
  tooltipFormatter?: (value: number, name: string) => React.ReactNode;
  hideYAxis?: boolean;
  xTickColor?: string;
  yTickColor?: string;
  barCategoryGap?: number | string;
  barGap?: number;
};

export function BarChart<T extends object = Record<string, unknown>>({
  data,
  xKey,
  series,
  height = 300,
  showGrid = false,
  showLegend = false,
  stacked = false,
  barRadius = 6,
  margin = { top: 8, right: 8, bottom: 8, left: 8 },
  xTickFormatter,
  yTickFormatter,
  tooltipFormatter,
  hideYAxis = true,
  xTickColor = "#94a3b8",
  yTickColor = "#94a3b8",
  barCategoryGap = "20%",
  barGap = 8,
}: BarChartProps<T>) {
  return (
    <div className={styles.container} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={data}
          margin={margin}
          barCategoryGap={barCategoryGap}
          barGap={barGap}
        >
          {showGrid ? (
            <CartesianGrid strokeDasharray="3 3" opacity={0.15} />
          ) : null}
          <XAxis
            dataKey={xKey}
            tickFormatter={xTickFormatter as any}
            axisLine={false}
            tickLine={false}
            tick={{ fill: xTickColor, fontSize: 12 }}
          />
          {hideYAxis ? null : (
            <YAxis
              tickFormatter={yTickFormatter as any}
              axisLine={false}
              tickLine={false}
              tick={{ fill: yTickColor, fontSize: 12 }}
            />
          )}
          <Tooltip
            formatter={(value: any, name: any) => {
              const numeric = typeof value === "number" ? value : Number(value);
              if (tooltipFormatter && !Number.isNaN(numeric)) {
                return [tooltipFormatter(numeric, String(name)), name];
              }
              return [value, name];
            }}
          />
          {showLegend ? <Legend /> : null}

          {series.map((s, i) => (
            <Bar
              key={s.dataKey}
              dataKey={s.dataKey}
              name={s.name}
              fill={s.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length]}
              radius={barRadius as any}
              stackId={stacked ? "stack" : s.stackId}
            />
          ))}
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
