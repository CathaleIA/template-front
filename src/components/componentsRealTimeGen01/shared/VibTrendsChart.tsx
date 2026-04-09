"use client";

import { useRef, useEffect, useState } from "react";
import { TagValue } from "@/context/IoTTagsContext";
import { appendChartRow, loadChartHistory } from "@/lib/chartHistory";

const VIB_CYLS = Array.from({ length: 20 }, (_, i) => i + 1);

const VIB_COLORS = [
    "#f87171","#fb923c","#fbbf24","#a3e635","#34d399",
    "#22d3ee","#60a5fa","#a78bfa","#f472b6","#e879f9",
    "#ef4444","#f97316","#eab308","#84cc16","#10b981",
    "#06b6d4","#3b82f6","#8b5cf6","#ec4899","#d946ef",
];

// Dotted reference lines every 10 units on Y axis
const GRID_SHAPES = [10, 20, 30, 40, 50].map((y) => ({
    type: "line", xref: "paper", x0: 0, x1: 1, y0: y, y1: y,
    line: { color: "rgba(140,140,140,0.35)", width: 1, dash: "dot" },
}));

const n = (v?: TagValue) => (v ? parseFloat(v.value) : null);

interface Props {
    /** The tag group object to read rVib_Cil_N from (gvl or hmi) */
    data: Record<string, TagValue>;
    historyKey: string;
    /** Accent color for range buttons and rangeslider border */
    accentColor: string;
    /** Additional shapes (e.g. warning/danger threshold lines) */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    extraShapes?: any[];
}

export function VibTrendsChart({ data, historyKey, accentColor, extraShapes = [] }: Props) {
    const containerRef = useRef<HTMLDivElement>(null);
    const divRef = useRef<HTMLDivElement>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const PlotlyRef = useRef<any>(null);
    const initialized = useRef(false);
    const [hidden, setHidden] = useState<Set<number>>(new Set());
    const [activeRangeBtn, setActiveRangeBtn] = useState<"30s" | "1m" | "3m" | "1h" | "∞">("∞");
    const [isFullscreen, setIsFullscreen] = useState(false);

    useEffect(() => {
        const onFsChange = () => setIsFullscreen(!!document.fullscreenElement);
        document.addEventListener("fullscreenchange", onFsChange);
        return () => document.removeEventListener("fullscreenchange", onFsChange);
    }, []);

    const toggleFullscreen = () => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    };

    const isLiveModeRef = useRef(true);
    const windowMinsRef = useRef<number | null>(null);
    const isInternalRef = useRef(false);

    const activateLive = (label: "30s" | "1m" | "3m" | "1h" | "∞", minutes: number | null) => {
        isLiveModeRef.current = true;
        windowMinsRef.current = minutes;
        setActiveRangeBtn(label);
        if (!PlotlyRef.current || !divRef.current) return;
        isInternalRef.current = true;
        const update = minutes === null
            ? { "xaxis.autorange": true }
            : { "xaxis.range": [Date.now() - minutes * 60_000, Date.now()], "xaxis.autorange": false };
        PlotlyRef.current.relayout(divRef.current, update).finally(() => { isInternalRef.current = false; });
    };

    useEffect(() => {
        if (!divRef.current) return;
        const div = divRef.current;
        Promise.all([import("plotly.js-dist-min"), loadChartHistory(historyKey)]).then(([mod, history]) => {
            if (!div.isConnected) return;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Plotly: any = (mod as any).default ?? mod;
            PlotlyRef.current = Plotly;

            const traceX: number[][] = VIB_CYLS.map(() => []);
            const traceY: number[][] = VIB_CYLS.map(() => []);
            history.forEach((row) => {
                VIB_CYLS.forEach((_, i) => {
                    const v = row.values[i];
                    if (v != null && !isNaN(v)) { traceX[i].push(row.t); traceY[i].push(v); }
                });
            });

            const traces = VIB_CYLS.map((num, i) => ({
                x: traceX[i], y: traceY[i], type: "scatter", mode: "lines",
                name: `C${String(num).padStart(2, "0")}`, showlegend: false,
                line: { color: VIB_COLORS[i % VIB_COLORS.length], width: 1.5 },
                hovertemplate: `C${num}: <b>%{y:.2f} mm/s</b>  %{x|%H:%M:%S}<extra></extra>`,
            }));

            Plotly.newPlot(div, traces, {
                uirevision: `vib-chart-${historyKey}`,
                autosize: true,
                margin: { l: 36, r: 8, t: 8, b: 22 },
                paper_bgcolor: "rgba(0,0,0,0)",
                plot_bgcolor: "rgba(0,0,0,0)",
                showlegend: false,
                shapes: [...GRID_SHAPES, ...extraShapes],
                xaxis: {
                    type: "date",
                    tickformat: "%H:%M:%S",
                    tickfont: { size: 7, color: "#6b7280" },
                    gridcolor: "rgba(255,255,255,0.05)",
                    linecolor: `${accentColor}26`,
                    rangeslider: {
                        visible: true,
                        bgcolor: "rgba(0,0,0,0.15)",
                        bordercolor: `${accentColor}26`,
                        borderwidth: 1,
                        thickness: 0.06,
                    },
                },
                yaxis: {
                    tickfont: { size: 7, color: "#6b7280" },
                    gridcolor: "rgba(255,255,255,0.04)",
                    range: [0, 50],
                    fixedrange: false,
                    dtick: 10,
                    title: { text: "mm/s", font: { size: 7, color: "#6b7280" }, standoff: 2 },
                },
            }, { displayModeBar: false, responsive: true, scrollZoom: true });

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (div as any).on("plotly_relayout", (eventData: any) => {
                if (isInternalRef.current) return;
                if (eventData["xaxis.range[0]"] !== undefined || eventData["xaxis.range"] !== undefined) {
                    isLiveModeRef.current = false;
                    setActiveRangeBtn("∞");
                }
            });
            initialized.current = true;
        });
        return () => { initialized.current = false; PlotlyRef.current?.purge(div); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (!initialized.current || !PlotlyRef.current || !divRef.current) return;
        const t = Date.now();
        const values = VIB_CYLS.map((num) => n(data[`rVib_Cil_${num}`]) ?? NaN);
        appendChartRow(historyKey, t, values);

        const newX: number[][] = [];
        const newY: number[][] = [];
        const indices: number[] = [];
        VIB_CYLS.forEach((_, i) => {
            const v = values[i];
            if (isNaN(v)) return;
            newX.push([t]); newY.push([v]); indices.push(i);
        });
        if (indices.length === 0) return;

        isInternalRef.current = true;
        PlotlyRef.current.extendTraces(divRef.current, { x: newX, y: newY }, indices)
            .then(() => {
                if (!isLiveModeRef.current) return;
                const end = Date.now();
                return PlotlyRef.current.relayout(divRef.current,
                    windowMinsRef.current === null
                        ? { "xaxis.autorange": true }
                        : { "xaxis.range": [end - windowMinsRef.current * 60_000, end], "xaxis.autorange": false }
                );
            })
            .finally(() => { isInternalRef.current = false; });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data]);

    const toggleCyl = (i: number) =>
        setHidden(prev => {
            const s = new Set(prev);
            s.has(i) ? s.delete(i) : s.add(i);
            if (PlotlyRef.current && divRef.current)
                PlotlyRef.current.restyle(divRef.current, { visible: [!s.has(i)] }, [i]);
            return s;
        });

    return (
        <div
            ref={containerRef}
            className="flex-1 min-h-0 flex flex-col gap-1"
            style={isFullscreen ? { background: "#0f1117", padding: "12px" } : undefined}
        >
            {/* Range buttons + fullscreen toggle */}
            <div className="shrink-0 flex flex-wrap items-center gap-1">
                {(["30s", "1m", "3m", "1h", "∞"] as const).map((label) => {
                    const isActive = activeRangeBtn === label;
                    const mins = label === "30s" ? 0.5 : label === "1m" ? 1 : label === "3m" ? 3 : label === "1h" ? 60 : null;
                    return (
                        <button
                            key={label}
                            onClick={() => activateLive(label, mins)}
                            className="rounded px-2 py-1 text-[8px] font-semibold leading-none transition-all"
                            style={{
                                background: isActive ? `${accentColor}33` : "transparent",
                                color: isActive ? accentColor : "#9ca3af",
                                border: `1px solid ${isActive ? `${accentColor}80` : `${accentColor}33`}`,
                            }}
                        >{label}</button>
                    );
                })}
                <button
                    onClick={toggleFullscreen}
                    title={isFullscreen ? "Salir de pantalla completa" : "Pantalla completa"}
                    className="ml-auto rounded px-1.5 py-1 text-[8px] leading-none transition-all"
                    style={{
                        background: "transparent",
                        color: "#9ca3af",
                        border: `1px solid ${accentColor}33`,
                    }}
                >
                    {isFullscreen ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 3v3a2 2 0 0 1-2 2H3"/><path d="M21 8h-3a2 2 0 0 1-2-2V3"/>
                            <path d="M3 16h3a2 2 0 0 1 2 2v3"/><path d="M16 21v-3a2 2 0 0 1 2-2h3"/>
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M3 7V3h4"/><path d="M17 3h4v4"/>
                            <path d="M21 17v4h-4"/><path d="M7 21H3v-4"/>
                        </svg>
                    )}
                </button>
            </div>
            {/* Cylinder toggle chips */}
            <div className="shrink-0 flex flex-wrap gap-0.5">
                {VIB_CYLS.map((num, i) => {
                    const color = VIB_COLORS[i % VIB_COLORS.length];
                    const off = hidden.has(i);
                    return (
                        <button
                            key={num}
                            onClick={() => toggleCyl(i)}
                            className="rounded px-1 py-0.5 text-[8px] font-bold leading-none transition-all"
                            style={{
                                background: off ? "transparent" : `${color}22`,
                                color: off ? "#374151" : color,
                                border: `1px solid ${off ? "#374151" : `${color}55`}`,
                            }}
                        >C{num}</button>
                    );
                })}
            </div>
            {/* Chart */}
            <div ref={divRef} className="flex-1 min-h-0" style={{ width: "100%", height: "100%" }} />
        </div>
    );
}
