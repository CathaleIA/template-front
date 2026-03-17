"use client";

interface KpiCardProps {
    label: string;
    value: string | number | null;
    unit?: string;
    status?: "normal" | "warning" | "danger" | "info";
    size?: "sm" | "md";
}

const statusColors = {
    normal: "text-[#00ffc2]",
    warning: "text-yellow-400",
    danger: "text-red-400",
    info: "text-blue-400",
};

export default function KpiCard({ label, value, unit, status = "normal", size = "md" }: KpiCardProps) {
    const valueStr = value !== null && value !== undefined
        ? typeof value === "number" ? (value % 1 === 0 ? value.toFixed(0) : value.toFixed(2)) : String(value)
        : "--";

    return (
        <div className="rounded-lg border bg-card px-3 py-2 flex flex-col justify-between gap-0.5">
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground leading-tight truncate">
                {label}
            </p>
            <div className="flex items-baseline gap-1">
                <span className={`font-bold tabular-nums ${size === "md" ? "text-xl" : "text-base"} ${statusColors[status]}`}>
                    {valueStr}
                </span>
                {unit && <span className="text-xs text-muted-foreground">{unit}</span>}
            </div>
        </div>
    );
}
