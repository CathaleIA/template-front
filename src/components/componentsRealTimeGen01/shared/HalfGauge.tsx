"use client";

import React from "react";

interface HalfGaugeProps {
    label: string;
    value: number | null;
    unit: string;
    min?: number;
    max: number;
    warning: number;
    danger: number;
    size?: "sm" | "md" | "lg";
}

function polarToCartesian(cx: number, cy: number, r: number, deg: number) {
    const rad = ((deg - 90) * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function arc(cx: number, cy: number, r: number, a1: number, a2: number) {
    const s = polarToCartesian(cx, cy, r, a2);
    const e = polarToCartesian(cx, cy, r, a1);
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${a2 - a1 <= 180 ? 0 : 1} 0 ${e.x} ${e.y}`;
}

function mapToAngle(value: number, min: number, max: number) {
    const clamped = Math.max(min, Math.min(value, max));
    return -90 + ((clamped - min) / (max - min)) * 180;
}

const SIZES = {
    sm: { vw: 160, vh: 90, cx: 80, cy: 88, r: 68, stroke: 10, needle: 56, textY: 80 },
    md: { vw: 200, vh: 115, cx: 100, cy: 110, r: 85, stroke: 13, needle: 70, textY: 102 },
    lg: { vw: 240, vh: 140, cx: 120, cy: 134, r: 105, stroke: 16, needle: 88, textY: 125 },
};

const HalfGauge: React.FC<HalfGaugeProps> = ({
    label, value, unit, min = 0, max, warning, danger, size = "md",
}) => {
    const d = SIZES[size];
    const safe = value !== null && !isNaN(value) ? value : 0;

    const aWarn = mapToAngle(warning, min, max);
    const aDanger = mapToAngle(danger, min, max);
    const aNeedle = mapToAngle(safe, min, max);
    const needle = polarToCartesian(d.cx, d.cy, d.needle, aNeedle);

    // status color for value text
    const valueColor = value === null ? "text-muted-foreground"
        : safe >= danger ? "text-red-500"
        : safe >= warning ? "text-yellow-500"
        : "text-[#00ffc2]";

    return (
        <div className="flex flex-col items-center gap-1">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground text-center leading-tight">
                {label}
            </p>
            <svg viewBox={`0 0 ${d.vw} ${d.vh}`} className="w-full" style={{ maxWidth: d.vw }}>
                {/* Track */}
                <path d={arc(d.cx, d.cy, d.r, -90, 90)} stroke="currentColor"
                    className="text-muted/20" strokeWidth={d.stroke} fill="none" strokeLinecap="round" />
                {/* Green zone */}
                <path d={arc(d.cx, d.cy, d.r, -90, aWarn)} stroke="#22c55e"
                    strokeWidth={d.stroke} fill="none" strokeLinecap="round" />
                {/* Yellow zone */}
                <path d={arc(d.cx, d.cy, d.r, aWarn, aDanger)} stroke="#eab308"
                    strokeWidth={d.stroke} fill="none" strokeLinecap="round" />
                {/* Red zone */}
                <path d={arc(d.cx, d.cy, d.r, aDanger, 90)} stroke="#ef4444"
                    strokeWidth={d.stroke} fill="none" strokeLinecap="round" />
                {/* Needle */}
                <line x1={d.cx} y1={d.cy} x2={needle.x} y2={needle.y}
                    stroke="#00ffc2" strokeWidth={3} strokeLinecap="round" />
                <circle cx={d.cx} cy={d.cy} r={5} fill="#00ffc2" />
                {/* Min/Max labels */}
                <text x={d.cx - d.r + 4} y={d.textY + 10} fontSize="8"
                    fill="currentColor" className="text-muted-foreground" textAnchor="middle">{min}</text>
                <text x={d.cx + d.r - 4} y={d.textY + 10} fontSize="8"
                    fill="currentColor" className="text-muted-foreground" textAnchor="middle">{max}</text>
            </svg>
            <div className="text-center -mt-1">
                <span className={`text-lg font-bold tabular-nums ${valueColor}`}>
                    {value !== null ? value.toFixed(value % 1 === 0 ? 0 : 1) : "--"}
                </span>
                <span className="text-xs text-muted-foreground ml-0.5">{unit}</span>
            </div>
        </div>
    );
};

export default HalfGauge;
