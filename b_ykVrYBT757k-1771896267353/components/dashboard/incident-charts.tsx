"use client"

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
    Legend,
} from "recharts"

const COLORS = ["#0ea5e9", "#f59e0b", "#ef4444", "#10b981", "#8b5cf6", "#f43f5e"]

interface IncidentChartsProps {
    type: "line" | "pie"
    data: any[]
}

export function IncidentCharts({ type, data }: IncidentChartsProps) {
    if (!data || data.length === 0) {
        return (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground italic">
                No specific data available for this category.
            </div>
        )
    }

    if (type === "line") {
        return (
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: "#64748b", fontSize: 12 }}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderRadius: "12px",
                            border: "1px solid hsl(var(--border))",
                            boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                        }}
                        itemStyle={{ fontSize: '12px', fontWeight: 600 }}
                    />
                    <Line
                        type="monotone"
                        name="Incident Flags"
                        dataKey="total"
                        stroke="#0ea5e9"
                        strokeWidth={3}
                        dot={{ r: 4, fill: "#0ea5e9", strokeWidth: 2, stroke: "#fff" }}
                        activeDot={{ r: 6, strokeWidth: 0, fill: "#0ea5e9" }}
                    />
                    {data && data.length > 0 && data[0].searches !== undefined && (
                        <Line
                            type="monotone"
                            name="Search Volume"
                            dataKey="searches"
                            stroke="#94a3b8"
                            strokeWidth={2}
                            strokeDasharray="5 5"
                            dot={false}
                        />
                    )}
                </LineChart>
            </ResponsiveContainer>
        )
    }

    return (
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length] || COLORS[0]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        backgroundColor: "#fff",
                        borderRadius: "12px",
                        border: "1px solid #e2e8f0",
                    }}
                />
                <Legend verticalAlign="bottom" height={36} />
            </PieChart>
        </ResponsiveContainer>
    )
}
