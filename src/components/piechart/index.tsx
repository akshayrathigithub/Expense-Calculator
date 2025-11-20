import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  PieChart as RPieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";
import styles from "./piechart.module.scss";
import { DEFAULT_COLORS } from "@src/constant";

export type PieNode = {
  name: string;
  value?: number; // optional: if omitted, sums of children will be used
  children?: PieNode[];
};

type PieSegment = {
  name: string;
  value: number;
  color: string;
  key: string; // unique path key
};

export type MultiRingPieChartProps = {
  data: PieNode[]; // one or many roots
  height?: number;
  maxDepth?: number; // how many rings to render (levels starting at 1)
  innerRadius?: number; // radius in px for the innermost ring
  radiusStep?: number; // thickness per ring
  showLegend?: boolean;
  showLabels?: boolean;
  tooltipFormatter?: (name: string, value: number) => React.ReactNode;
};

function sumNode(node: PieNode): number {
  if (typeof node.value === "number") return node.value;
  if (!node.children || node.children.length === 0) return 0;
  return node.children.reduce((acc, c) => acc + sumNode(c), 0);
}

function buildLevels(
  roots: PieNode[],
  maxDepth: number,
  colors: string[]
): PieSegment[][] {
  const levels: PieSegment[][] = Array.from({ length: maxDepth }, () => []);

  function walk(node: PieNode, depth: number, path: string, topIndex: number) {
    if (depth > maxDepth) return;
    const value = sumNode(node);
    const color = colors[topIndex % colors.length];
    levels[depth - 1].push({ name: node.name, value, color, key: path });

    if (node.children && node.children.length > 0) {
      node.children.forEach((child, idx) => {
        walk(
          child,
          depth + 1,
          `${path}/${idx}`,
          topIndex // keep the same top-level color lineage
        );
      });
    }
  }

  roots.forEach((root, i) => {
    walk(root, 1, `root-${i}`, i);
  });

  // trim empty trailing levels
  while (levels.length > 0 && levels[levels.length - 1].length === 0) {
    levels.pop();
  }
  return levels;
}

export function MultiRingPieChart({
  data,
  height = 320,
  maxDepth = 4,
  innerRadius = 30,
  radiusStep = 24,
  showLegend = false,
  showLabels = false,
  tooltipFormatter,
}: MultiRingPieChartProps) {
  const rings = useMemo(
    () => buildLevels(data, maxDepth, DEFAULT_COLORS),
    [data, maxDepth]
  );

  return (
    <div className={styles.container} style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          {rings.map((segments, idx) => {
            const inner = innerRadius + idx * radiusStep;
            const outer = inner + radiusStep - 4; // small gap between rings
            return (
              <Pie
                key={`ring-${idx}`}
                data={segments}
                dataKey="value"
                nameKey="name"
                innerRadius={inner}
                outerRadius={outer}
                paddingAngle={1}
                isAnimationActive={false}
                label={showLabels ? ({ name }) => name : undefined}
              >
                {segments.map((seg) => (
                  <Cell key={seg.key} fill={seg.color} />
                ))}
              </Pie>
            );
          })}
          <Tooltip
            formatter={(value: any, name: any) => {
              const v = Number(value);
              if (tooltipFormatter && !Number.isNaN(v)) {
                return [tooltipFormatter(name as string, v), name];
              }
              return [value, name];
            }}
          />
          {showLegend ? <Legend /> : null}
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}
