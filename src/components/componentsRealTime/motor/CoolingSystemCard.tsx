// industrial-iot-lab/dashboard-industrial/src/components/motor/CoolingSystemCard.tsx
"use client";

import React, { useMemo, useEffect, useRef, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import type { Layout, Data, PlotlyHTMLElement } from "plotly.js";
import type { CoolingSystemData } from "@/types/iot.types";
import { getNumericValue } from "@/types/iot.types";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

// Internal Plotly runtime shape used to access private _fullLayout safely
type InternalPlotlyHTMLElement = PlotlyHTMLElement & {
  _fullLayout?: {
    xaxis?: { range?: [number | string | Date, number | string | Date] };
  };
};

interface CoolingSystemCardProps {
  data?: CoolingSystemData;
  historicalData?: Array<{
    timestamp: number;
    temp_lt_salida: number | null;
    t_ht_entrada: number | null;
    tem_ht_ref_salida: number | null;
    presion_ht: number | null;
  }>;
}

type AlertStatus = "critical" | "warning" | "normal" | "no-data";

type CoolingRow = {
  ts: number;
  ltSalida: number | null;
  htEntrada: number | null;
  htRefSalida: number | null;
  presion: number | null;
};

/* ===========================
   Helpers para estado de KPIs
   =========================== */

function getTempStatus(
  value: number | null,
  warningThreshold: number,
  criticalDelta: number
): AlertStatus {
  if (value === null) return "no-data";
  if (value > warningThreshold + criticalDelta) return "critical";
  if (value > warningThreshold) return "warning";
  return "normal";
}

function getPressureStatus(
  value: number | null,
  warningMin: number,
  criticalMin: number
): AlertStatus {
  if (value === null) return "no-data";
  if (value < criticalMin) return "critical";
  if (value < warningMin) return "warning";
  return "normal";
}

function getCardStyle(status: AlertStatus): string {
  if (status === "critical") return "border-red-300 bg-red-50";
  if (status === "warning") return "border-amber-300 bg-amber-50";
  if (status === "normal") return "border-emerald-300 bg-emerald-50/40";
  return "border-slate-200 bg-white";
}

function getStatusDotClasses(status: AlertStatus): string {
  if (status === "critical") return "bg-red-500";
  if (status === "warning") return "bg-amber-500";
  if (status === "normal") return "bg-emerald-500";
  return "bg-slate-300";
}

function renderStatusBadge(status: AlertStatus): React.ReactNode {
  if (status === "no-data") return null;

  return (
    <div className="flex items-center gap-1 mt-0.5">
      <span className={`h-1.5 w-1.5 rounded-full ${getStatusDotClasses(status)}`} />
      <span className="text-[9px] font-semibold tracking-wide uppercase">
        {status === "critical"
          ? "CRÍTICO"
          : status === "warning"
          ? "ALERTA"
          : "NORMAL"}
      </span>
    </div>
  );
}

/* ===========================
   Plotly tipo CurrentsChart
   =========================== */

interface CoolingSystemPlotProps {
  data: CoolingRow[];
  height?: number;
}

type Label = "30s" | "1m" | "5m" | "Todo";

function CoolingSystemPlot({ data, height = 300 }: CoolingSystemPlotProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<MutationObserver | null>(null);
  const boundButtons = useRef<WeakSet<Element>>(new WeakSet());
  const graphRef = useRef<PlotlyHTMLElement | null>(null);

  // Estado para ventana temporal (por defecto 1m)
  const [followSec, setFollowSec] = useState<number | null>(60);

  // ✅ Estados para controlar zoom/pan sin que se reseteen
  const [forcedY, setForcedY] = useState<[number, number] | null>(null);
  const [forcedY2, setForcedY2] = useState<[number, number] | null>(null);
  const [forceNonce, setForceNonce] = useState(0);
  const [initialClamp, setInitialClamp] = useState<boolean>(true);

  const colors = useMemo(() => {
    const css =
      typeof window !== "undefined"
        ? getComputedStyle(document.documentElement)
        : null;
    return {
      paper: css?.getPropertyValue("--color-panel-bg").trim() || "#f8f9fa",
      plot: "#F5F5F5",
      text: "#374151",
      grid: "#e2e8f0",
      range: "#e5e7eb",
      rangeActive: "#d1d5db",
      rangeStroke: "rgba(0,0,0,0.15)",
    };
  }, []);

  // ✅ CAMBIO CLAVE: Calcular rango X basado en followSec (igual que CurrentsChart)
  const xRangeFollow: [Date, Date] | undefined = useMemo(() => {
    if (followSec == null || data.length === 0) return undefined;
    const maxDate = new Date(data[data.length - 1].ts);
    const minDate = new Date(maxDate.getTime() - followSec * 1000);
    return [minDate, maxDate];
  }, [data, followSec]);

  // Eje X en Date basado en TODOS los datos disponibles
  const xValues = useMemo(() => {
    if (data.length === 0) return [];
    return data.map((row) => new Date(row.ts));
  }, [data]);

  const labelFromFollow = useCallback((fs: number | null): Label => {
    if (fs === null) return "Todo";
    if (fs === 30) return "30s";
    if (fs === 60) return "1m";
    return "5m";
  }, []);

  // Primero calculamos tempsAll y presAll (necesarios para los rangos)
  const tempsAll = useMemo(() => {
    const lt = data
      .map((d) => d.ltSalida)
      .filter((v): v is number => typeof v === "number");
    const htIn = data
      .map((d) => d.htEntrada)
      .filter((v): v is number => typeof v === "number");
    const htRef = data
      .map((d) => d.htRefSalida)
      .filter((v): v is number => typeof v === "number");
    return [...lt, ...htIn, ...htRef];
  }, [data]);

  const presAll = useMemo(() => {
    return data
      .map((d) => d.presion)
      .filter((v): v is number => typeof v === "number");
  }, [data]);

  // === Helper: obtener rango X actual en ms ===
  const getCurrentXRangeMs = useCallback(
    (gd: PlotlyHTMLElement | null): [number, number] | null => {
      if (!gd) return null;
      const xr = (gd as InternalPlotlyHTMLElement)?._fullLayout?.xaxis?.range as
        | [number | string | Date, number | string | Date]
        | undefined;
      if (!xr) return null;
      const toMs = (v: number | string | Date) =>
        typeof v === "number" ? v : new Date(v).getTime();
      return [toMs(xr[0]), toMs(xr[1])];
    },
    []
  );

  // === Autoscale (solo datos visibles, para temperaturas) ===
  const computeYRangeForVisibleX = useCallback(
    (startMs: number, endMs: number): [number, number] | null => {
      let minVal = Number.POSITIVE_INFINITY;
      let maxVal = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const t = row.ts;
        if (t < startMs || t > endMs) continue;

        const temps = [row.ltSalida, row.htEntrada, row.htRefSalida].filter(
          (v): v is number => typeof v === "number"
        );
        temps.forEach((v) => {
          if (v < minVal) minVal = v;
          if (v > maxVal) maxVal = v;
        });
      }

      if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return null;
      if (minVal === maxVal) {
        const delta = Math.max(1, Math.abs(minVal) * 0.01);
        return [minVal - delta, maxVal + delta];
      }
      const span = maxVal - minVal;
      const pad = Math.max(0.02 * span, 1);
      return [minVal - pad, maxVal + pad];
    },
    [data]
  );

  // Rango Y2 visible (para presión)
  const computeY2RangeForVisibleX = useCallback(
    (startMs: number, endMs: number): [number, number] | null => {
      let minVal = Number.POSITIVE_INFINITY;
      let maxVal = Number.NEGATIVE_INFINITY;

      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const t = row.ts;
        if (t < startMs || t > endMs) continue;

        if (typeof row.presion === "number") {
          if (row.presion < minVal) minVal = row.presion;
          if (row.presion > maxVal) maxVal = row.presion;
        }
      }

      if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) return null;
      if (minVal === maxVal) {
        const delta = Math.max(0.1, Math.abs(minVal) * 0.01);
        return [minVal - delta, maxVal + delta];
      }
      const span = maxVal - minVal;
      const pad = Math.max(0.02 * span, 0.1);
      return [Math.max(0, minVal - pad), maxVal + pad];
    },
    [data]
  );

  // Rango Y visible (para temperatura)
  const visibleYRange: [number, number] | null = useMemo(() => {
    if (!xRangeFollow) return null;
    const [x0, x1] = xRangeFollow;
    return computeYRangeForVisibleX(x0.getTime(), x1.getTime());
  }, [computeYRangeForVisibleX, xRangeFollow]);

  const visibleY2Range: [number, number] | null = useMemo(() => {
    if (!xRangeFollow) return null;
    const [x0, x1] = xRangeFollow;
    return computeY2RangeForVisibleX(x0.getTime(), x1.getTime());
  }, [computeY2RangeForVisibleX, xRangeFollow]);

  // ✅ Rangos iniciales que incluyen los límites de temperatura/presión (solo primer render)
  const [defaultTempMin, defaultTempMax] = useMemo<[number, number]>(() => {
    if (tempsAll.length === 0) return [40, 110];
    const min = Math.min(...tempsAll);
    const max = Math.max(...tempsAll);
    if (min === max) {
      const delta = Math.max(1, Math.abs(min) * 0.05);
      return [min - delta, max + delta];
    }
    const span = max - min;
    const pad = Math.max(2, span * 0.1);
    return [min - pad, max + pad];
  }, [tempsAll]);

  const [defaultPresMin, defaultPresMax] = useMemo<[number, number]>(() => {
    if (presAll.length === 0) return [0, 5];
    const min = Math.min(...presAll);
    const max = Math.max(...presAll);
    if (min === max) {
      const delta = Math.max(0.1, Math.abs(min) * 0.1);
      return [min - delta, max + delta];
    }
    const span = max - min;
    const pad = Math.max(0.1, span * 0.15);
    return [Math.max(0, min - pad), max + pad];
  }, [presAll]);

  const initialYRangeWithThresholds: [number, number] = useMemo(() => {
    const base = visibleYRange ?? [defaultTempMin, defaultTempMax];
    return base;
  }, [visibleYRange, defaultTempMin, defaultTempMax]);

  const initialY2RangeWithThresholds: [number, number] = useMemo(() => {
    const base = visibleY2Range ?? [defaultPresMin, defaultPresMax];
    return base;
  }, [visibleY2Range, defaultPresMin, defaultPresMax]);

  // === Reset a vista por defecto (1m + rangos calculados) ===
  const resetToDefaultView = useCallback(
    (gd: PlotlyHTMLElement | null) => {
      // 1) fijar ventana de 1m
      setFollowSec(60);

      // 2) calcular última ventana de 1m basada en el último dato disponible
      const nowMs =
        xValues.length > 0 ? xValues[xValues.length - 1].getTime() : Date.now();
      const startMs = nowMs - 60_000;

      // 3) Y por defecto = datos visibles EN 1m
      const visTemp = computeYRangeForVisibleX(startMs, nowMs);
      const yDef: [number, number] = visTemp ?? [defaultTempMin, defaultTempMax];

      const visPres = computeY2RangeForVisibleX(startMs, nowMs);
      const y2Def: [number, number] = visPres ?? [defaultPresMin, defaultPresMax];

      // 4) Forzar Y por estado para que el render NO lo reemplace
      setForcedY(yDef);
      setForcedY2(y2Def);
      setInitialClamp(false);
      setForceNonce((n) => n + 1);

      // 5) Relayout directo (sin autorange) para no disparar autoscale
      if (gd && typeof window !== "undefined") {
        const plotlyGlobal = (window as { Plotly?: { relayout: (gd: unknown, update: Record<string, unknown>) => void } }).Plotly;
        if (plotlyGlobal) {
          const x0 = new Date(startMs);
          const x1 = new Date(nowMs);
          plotlyGlobal.relayout(gd, {
            "xaxis.autorange": false,
            "xaxis.range": [x0, x1],
            "yaxis.autorange": false,
            "yaxis.range": yDef,
            "yaxis2.autorange": false,
            "yaxis2.range": y2Def,
          });
        }
      }
    },
    [
      xValues,
      computeYRangeForVisibleX,
      computeY2RangeForVisibleX,
      defaultTempMin,
      defaultTempMax,
      defaultPresMin,
      defaultPresMax,
    ]
  );

  // --- Rangeselector UI (solo estilos + cambiar followSec) ---
  const paintButtons = useCallback(
    (root: HTMLElement | null, active: Label | null) => {
      if (!root) return;
      const btnGroups = root.querySelectorAll<SVGGElement>(
        "g.rangeselector g.button"
      );
      btnGroups.forEach((g) => {
        const textEl = g.querySelector("text");
        const rectEl = g.querySelector("rect");
        const label = (textEl?.textContent || "").trim();
        const isActive = label === active;

        if (rectEl) {
          rectEl.setAttribute(
            "fill",
            isActive ? colors.rangeActive : colors.range
          );
          rectEl.setAttribute("stroke", colors.rangeStroke);
          rectEl.setAttribute("opacity", "1");
        }
        if (textEl) textEl.setAttribute("fill", colors.text);

        g.classList.toggle("grt-active", isActive);
        g.setAttribute("role", "button");
        g.setAttribute("tabindex", "0");
        g.setAttribute("aria-pressed", isActive ? "true" : "false");
      });
    },
    [colors.range, colors.rangeActive, colors.rangeStroke, colors.text]
  );

  const hookRangeSelectorClicks = useCallback(
    (root: HTMLElement | null, bound: WeakSet<Element>) => {
      if (!root) return;
      const btnGroups = root.querySelectorAll<SVGGElement>(
        "g.rangeselector g.button"
      );
      btnGroups.forEach((g) => {
        if (bound.has(g)) return;

        const textEl = g.querySelector("text");
        const raw = (textEl?.textContent || "").trim();
        const label: Label | null =
          raw === "30s" || raw === "1m" || raw === "5m" || raw === "Todo"
            ? (raw as Label)
            : null;
        if (!label) return;

        const clickHandler = () => {
          // ✅ Al cambiar ventana temporal, desactivamos clamp inicial y forzados
          setInitialClamp(false);
          setForcedY(null);
          setForcedY2(null);
          setForceNonce((n) => n + 1);

          if (label === "30s") setFollowSec(30);
          else if (label === "1m") setFollowSec(60);
          else if (label === "5m") setFollowSec(300);
          else setFollowSec(null);

          paintButtons(root, label);
        };

        const keyHandler = (ev: KeyboardEvent) => {
          if (ev.key === "Enter" || ev.key === " ") {
            ev.preventDefault();
            clickHandler();
          }
        };

        g.addEventListener("click", clickHandler);
        g.addEventListener("keydown", keyHandler);
        bound.add(g);
      });
    },
    [paintButtons]
  );

  const toSeries = (values: Array<number | null>): number[] =>
    values.map((v) => (typeof v === "number" ? v : Number.NaN));

  const traces: Data[] = useMemo(
    () => [
      {
        x: xValues,
        y: toSeries(data.map((d) => d.ltSalida)),
        type: "scatter",
        mode: "lines",
        name: "LT Salida",
        line: {
          color: "#06b6d4",
          width: 1.8,
          shape: "spline",
          simplify: true,
        },
        hovertemplate: "LT Salida: %{y:.2f} °C<extra></extra>",
        yaxis: "y",
      },
      {
        x: xValues,
        y: toSeries(data.map((d) => d.htEntrada)),
        type: "scatter",
        mode: "lines",
        name: "HT Entrada",
        line: {
          color: "#dc2626",
          width: 1.8,
          shape: "spline",
          simplify: true,
        },
        hovertemplate: "HT Entrada: %{y:.2f} °C<extra></extra>",
        yaxis: "y",
      },
      {
        x: xValues,
        y: toSeries(data.map((d) => d.htRefSalida)),
        type: "scatter",
        mode: "lines",
        name: "HT Ref. Salida",
        line: {
          color: "#f59e0b",
          width: 1.8,
          shape: "spline",
          simplify: true,
        },
        hovertemplate: "HT Ref. Salida: %{y:.2f} °C<extra></extra>",
        yaxis: "y",
      },
      {
        x: xValues,
        y: toSeries(data.map((d) => d.presion)),
        type: "scatter",
        mode: "lines",
        name: "Presión HT",
        line: {
          color: "#6366f1",
          width: 1.8,
          shape: "spline",
          simplify: true,
        },
        hovertemplate: "Presión HT: %{y:.2f} bar<extra></extra>",
        yaxis: "y2",
      },
    ],
    [data, xValues]
  );

  const layout: Partial<Layout> = useMemo(
  () => ({
    // ✅ uirevision: Mantiene el estado de zoom/pan entre renders
    uirevision: `cooling_v1_fs${followSec ?? "auto"}_${
      forcedY ? "forcedY" : initialClamp ? "init" : "dyn"
    }_${forceNonce}`,
    margin: { l: 64, r: 96, t: 26, b: 56 },
    autosize: true,
    height,
    paper_bgcolor: colors.paper,
    plot_bgcolor: colors.plot,
    font: { color: colors.text, size: 12 },
    hovermode: "closest",
    dragmode: "pan",
    xaxis: {
      type: "date",
      autorange: followSec === null,
      range:
        (xRangeFollow as unknown as
          | [string | number | Date, string | number | Date]
          | undefined) ?? undefined,
      gridcolor: colors.grid,
      zeroline: false,
      tickfont: { size: 11, color: colors.text },
      tickformat: "%H:%M:%S",
      showspikes: true,
      spikemode: "across",
      spikethickness: 1,
      spikedash: "dot",
      spikesnap: "cursor",
      rangeslider: {
        visible: true,
        thickness: 0.14,
        bgcolor: colors.plot,
      },
      rangeselector: {
        buttons: [
          { count: 30, label: "30s", step: "second", stepmode: "backward" },
          { count: 1, label: "1m", step: "minute", stepmode: "backward" },
          { count: 5, label: "5m", step: "minute", stepmode: "backward" },
          { step: "all", label: "Todo" },
        ],
        x: 1,
        xanchor: "right",
        y: 1.1,
        yanchor: "bottom",
        bgcolor: colors.range,
        activecolor: colors.rangeActive,
        font: { size: 11, color: colors.text },
      },
    },
    yaxis: {
      title: {
        text: "Temperatura [°C]",
        font: { size: 12, color: colors.text },
      },
      // ✅ Usa forcedY si existe, sino initialYRangeWithThresholds en primer render, sino visibleYRange
      range:
        forcedY ??
        (initialClamp ? initialYRangeWithThresholds : visibleYRange ?? [defaultTempMin, defaultTempMax]),
      autorange:
        forcedY ? false : initialClamp ? false : visibleYRange ? false : true,
      gridcolor: colors.grid,
      zeroline: false,
      tickfont: { size: 11, color: colors.text },
      fixedrange: false,
    },
    yaxis2: {
      title: {
        text: "Presión HT [bar]",
        font: { size: 12, color: colors.text },
      },
      overlaying: "y",
      side: "right",
      // ✅ Usa forcedY2 si existe, sino initialY2RangeWithThresholds en primer render, sino visibleY2Range
      range:
        forcedY2 ??
        (initialClamp ? initialY2RangeWithThresholds : visibleY2Range ?? [defaultPresMin, defaultPresMax]),
      autorange:
        forcedY2 ? false : initialClamp ? false : visibleY2Range ? false : true,
      tickfont: { size: 11, color: colors.text },
      showgrid: false,
      zeroline: false,
      fixedrange: false,
    },
    legend: {
      orientation: "h",
      x: 0.5,
      xanchor: "center",
      y: -0.68,
      yanchor: "top",
      bgcolor: "rgba(255,255,255,0.9)",
      bordercolor: "#d1d5db",
      borderwidth: 1,
      font: { size: 11, color: colors.text },
    },
  }),
  [
    colors,
    height,
    followSec,
    xRangeFollow,
    forcedY,
    forcedY2,
    forceNonce,
    initialClamp,
    visibleYRange,
    visibleY2Range,
    initialYRangeWithThresholds,
    initialY2RangeWithThresholds,
    defaultTempMin,
    defaultTempMax,
    defaultPresMin,
    defaultPresMax,
  ]
);

  const onAfterPlotCommon = useCallback(
    (root: HTMLElement | null) => {
      hookRangeSelectorClicks(root, boundButtons.current);
      paintButtons(root, labelFromFollow(followSec));
    },
    [hookRangeSelectorClicks, paintButtons, labelFromFollow, followSec]
  );

  // Modebar vertical + enganche de Reset axes
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    let resizeTimer: number | null = null;

    // 👉 engancha el botón Reset axes para forzar nuestra vista por defecto
    const bindResetAxes = () => {
      const modebar = root.querySelector<HTMLElement>(".modebar");
      const resetBtn = modebar?.querySelector<HTMLElement>(
        '.modebar-btn[data-title="Reset axes"]'
      );
      if (resetBtn && !boundButtons.current.has(resetBtn)) {
        const handler = (ev: Event) => {
          ev.preventDefault();
          ev.stopPropagation();
          resetToDefaultView(graphRef.current);
        };
        resetBtn.addEventListener("click", handler);
        boundButtons.current.add(resetBtn);
      }
    };

    const fixModebar = () => {
      const modebar = root.querySelector<HTMLElement>(".modebar");
      if (!modebar) return;

      modebar.style.display = "flex";
      modebar.style.flexDirection = "column";
      modebar.style.alignItems = "center";
      modebar.style.gap = "6px";
      modebar.style.position = "absolute";
      modebar.style.top = "10px";
      modebar.style.right = "8px";
      modebar.style.left = "auto";
      modebar.style.background = "transparent";
      modebar.style.padding = "0";
      modebar.style.willChange = "transform";

      const btns = modebar.querySelectorAll<HTMLElement>(".modebar-btn");
      btns.forEach((b) => {
        b.style.width = "32px";
        b.style.height = "32px";
        b.style.margin = "3px 0";
        b.style.display = "block";
      });

      // Reenganchar Reset axes después de posicionar
      bindResetAxes();
    };

    const onResize = () => {
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(fixModebar, 120);
    };

    const t = window.setTimeout(fixModebar, 80);
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(t);
      if (resizeTimer !== null) window.clearTimeout(resizeTimer);
      window.removeEventListener("resize", onResize);
    };
  }, [resetToDefaultView]);

  // Observer + pintado de botones
  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current = null;
    }

    const obs = new MutationObserver(() => {
      hookRangeSelectorClicks(root, boundButtons.current);
      paintButtons(root, labelFromFollow(followSec));
    });
    obs.observe(root, { childList: true, subtree: true });
    observerRef.current = obs;

    hookRangeSelectorClicks(root, boundButtons.current);
    paintButtons(root, labelFromFollow(followSec));

    return () => {
      obs.disconnect();
      observerRef.current = null;
    };
  }, [followSec, hookRangeSelectorClicks, paintButtons, labelFromFollow]);

  useEffect(() => {
    paintButtons(containerRef.current, labelFromFollow(followSec));
  }, [followSec, labelFromFollow, paintButtons]);

  return (
    <div className="relative w-full" ref={containerRef} style={{ height }}>
      <Plot
        data={traces}
        layout={layout}
        config={{
          responsive: true,
          scrollZoom: true,
          displaylogo: false,
          displayModeBar: true,
        }}
        onInitialized={(_figure, graphDiv) => {
          graphRef.current = graphDiv as PlotlyHTMLElement;
          setTimeout(() => window.dispatchEvent(new Event("resize")), 60);
          onAfterPlotCommon(containerRef.current);
        }}
        onAfterPlot={() => onAfterPlotCommon(containerRef.current)}
        onRelayout={(ev) => {
          // ✅ Captura cuando el usuario usa autoscale manual
          if (
            ev &&
            (("yaxis.autorange" in ev &&
              (ev as Record<string, unknown>)["yaxis.autorange"] === true) ||
              ("autorange" in ev &&
                (ev as Record<string, unknown>)["autorange"] === true))
          ) {
            const xr = getCurrentXRangeMs(graphRef.current);
            if (xr) {
              const r = computeYRangeForVisibleX(xr[0], xr[1]);
              if (r) {
                setForcedY(r);
                setForceNonce((n) => n + 1);
              }
            }
          }
          // Similar para Y2 (presión)
          if (
            ev &&
            "yaxis2.autorange" in ev &&
            (ev as Record<string, unknown>)["yaxis2.autorange"] === true
          ) {
            const xr = getCurrentXRangeMs(graphRef.current);
            if (xr) {
              const r = computeY2RangeForVisibleX(xr[0], xr[1]);
              if (r) {
                setForcedY2(r);
                setForceNonce((n) => n + 1);
              }
            }
          }
          onAfterPlotCommon(containerRef.current);
        }}
        onUpdate={() => onAfterPlotCommon(containerRef.current)}
        style={{ width: "100%", height: "100%" }}
      />
    </div>
  );
}

/* ===========================
   Card principal
   =========================== */

export function CoolingSystemCard({
  data,
  historicalData = [],
}: CoolingSystemCardProps) {
  const tempLTSalida = getNumericValue(data?.Temp_LT_salida);
  const tempHTEntrada = getNumericValue(data?.T_HT_ENTRADA);
  const tempHTRefSalida = getNumericValue(data?.Tem_HT_ref_salida);
  const presionHT = getNumericValue(data?.Presion_HT);

  const chartRows: CoolingRow[] = useMemo(() => {
    if (historicalData.length > 0) {
      return historicalData.map((point) => ({
        ts: point.timestamp,
        ltSalida: point.temp_lt_salida,
        htEntrada: point.t_ht_entrada,
        htRefSalida: point.tem_ht_ref_salida,
        presion: point.presion_ht,
      }));
    }

    // Placeholder cuando no hay histórico (timestamps sintéticos)
    return Array.from({ length: 20 }, (_, idx) => {
      const ts = (idx + 1) * 1000; // 1s, 2s, 3s...
      return {
        ts,
        ltSalida: 45,
        htEntrada: 85,
        htRefSalida: 80,
        presion: 2.5,
      };
    });
  }, [historicalData]);

  // Estados individuales para las 4 cajas
  const ltStatus = getTempStatus(tempLTSalida, 50, 5);
  const htEntradaStatus = getTempStatus(tempHTEntrada, 90, 5);
  const htRefStatus = getTempStatus(tempHTRefSalida, 85, 5);
  const presionStatus = getPressureStatus(presionHT, 2.0, 1.5);

  return (
    <div>
      {/* KPIs Grid más compacto */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        {/* LT Salida */}
        <div
          className={`h-full p-2.5 rounded-lg border shadow-sm flex flex-col ${getCardStyle(
            ltStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[10px] text-slate-600 uppercase font-semibold">
              LT Salida
            </div>
            <span
              className={`h-1.5 w-5 rounded-full ${getStatusDotClasses(
                ltStatus
              )}`}
            />
          </div>
          <div className="text-lg font-semibold text-slate-900 leading-tight">
            {tempLTSalida !== null ? `${tempLTSalida.toFixed(1)}°C` : "--"}
          </div>
          {renderStatusBadge(ltStatus)}
        </div>

        {/* HT Entrada */}
        <div
          className={`h-full p-2.5 rounded-lg border shadow-sm flex flex-col ${getCardStyle(
            htEntradaStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[10px] text-slate-600 uppercase font-semibold">
              HT Entrada
            </div>
            <span
              className={`h-1.5 w-5 rounded-full ${getStatusDotClasses(
                htEntradaStatus
              )}`}
            />
          </div>
          <div className="text-lg font-semibold text-slate-900 leading-tight">
            {tempHTEntrada !== null ? `${tempHTEntrada.toFixed(1)}°C` : "--"}
          </div>
          {renderStatusBadge(htEntradaStatus)}
        </div>

        {/* HT Ref. Salida */}
        <div
          className={`h-full p-2.5 rounded-lg border shadow-sm flex flex-col ${getCardStyle(
            htRefStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[10px] text-slate-600 uppercase font-semibold">
              HT Ref. Salida
            </div>
            <span
              className={`h-1.5 w-5 rounded-full ${getStatusDotClasses(
                htRefStatus
              )}`}
            />
          </div>
          <div className="text-lg font-semibold text-slate-900 leading-tight">
            {tempHTRefSalida !== null
              ? `${tempHTRefSalida.toFixed(1)}°C`
              : "--"}
          </div>
          {renderStatusBadge(htRefStatus)}
        </div>

        {/* Presión HT */}
        <div
          className={`h-full p-2.5 rounded-lg border shadow-sm flex flex-col ${getCardStyle(
            presionStatus
          )}`}
        >
          <div className="flex items-center justify-between mb-0.5">
            <div className="text-[10px] text-slate-600 uppercase font-semibold">
              Presión HT
            </div>
            <span
              className={`h-1.5 w-5 rounded-full ${getStatusDotClasses(
                presionStatus
              )}`}
            />
          </div>
          <div className="text-lg font-semibold text-slate-900 leading-tight">
            {presionHT !== null ? `${presionHT.toFixed(2)} bar` : "--"}
          </div>
          {renderStatusBadge(presionStatus)}
        </div>
      </div>

      {/* Gráfica principal tipo CurrentsChart */}
      <CoolingSystemPlot data={chartRows} height={300} />

      {/* Rangos de referencia (texto) */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-600 space-y-1">
          <div className="flex justify-between">
            <span>Rangos normales:</span>
            <span className="font-mono">
              LT Salida: 40-50°C | HT Entrada: 80-90°C | HT Ref: 75-85°C |
              Presión: 2.0-3.0 bar
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}