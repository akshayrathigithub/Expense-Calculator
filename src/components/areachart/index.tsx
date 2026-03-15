import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

const STROKE = "#13ec5b";
const GRAD_ID = "areaGreen";

interface CustomAreaChartProps {
    data?: { name: string; value: number }[];
    height?: number | `${number}%`;
}

export const CustomAreaChart = ({
    data,
    height = 300,
}: CustomAreaChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <AreaChart
                data={data}
                margin={{ top: 8, right: 0, left: 0, bottom: 0 }}
            >
                {/* Gradient: vivid green at top → transparent at bottom */}
                <defs>
                    <linearGradient id={GRAD_ID} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={STROKE} stopOpacity={0.45} />
                        <stop offset="100%" stopColor={STROKE} stopOpacity={0} />
                    </linearGradient>
                </defs>

                {/* No grid, no visible axes */}
                <XAxis dataKey="name" hide />
                <YAxis hide />

                <Tooltip
                    contentStyle={{
                        background: "#111813",
                        border: "1px solid #115e2a",
                        borderRadius: 8,
                        color: "#f0fdf4",
                        fontSize: 13,
                    }}
                    itemStyle={{ color: STROKE }}
                    cursor={{ stroke: STROKE, strokeWidth: 1, strokeDasharray: "4 4" }}
                />

                <Area
                    type="monotoneX"
                    dataKey="value"
                    stroke={STROKE}
                    strokeWidth={2.5}
                    fill={`url(#${GRAD_ID})`}
                    dot={false}
                    activeDot={{ r: 4, fill: STROKE, strokeWidth: 0 }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};
