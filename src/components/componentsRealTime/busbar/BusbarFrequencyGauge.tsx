// industrial-iot-lab/dashboard-industrial/src/components/BusbarFrequencyGauge.tsx
"use client";

import React, { useEffect, useRef, useState } from "react";
import type { BusbarData } from "@/types/iot.types";
import { getNumericValue } from "@/types/iot.types";

import { useTheme } from "next-themes";

type StatusLevel = "normal" | "warning" | "danger" | "unknown";

type Props = {
  busbar?: BusbarData;
  nominal?: number;
  warningTolerancePercent?: number;
  dangerTolerancePercent?: number;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function getStatus(
  valueHz: number | null,
  nominal: number,
  warningTol: number,
  dangerTol: number
): StatusLevel {
  if (valueHz === null) return "unknown";
  const diffPercent = (Math.abs(valueHz - nominal) / nominal) * 100;

  if (diffPercent <= warningTol) return "normal";
  if (diffPercent <= dangerTol) return "warning";
  return "danger";
}

const MIN_HEIGHT_FOR_VERTICAL = 120; // px – si el panel es más bajo, usamos barra horizontal

export default function BusbarFrequencyGauge({
  busbar,
  nominal = 60,
  warningTolerancePercent = 0.5,
  dangerTolerancePercent = 1,
}: Props) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isHorizontal, setIsHorizontal] = useState<boolean>(false);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const freqHz = getNumericValue(busbar?.frecuencia);
  const status = getStatus(
    freqHz,
    nominal,
    warningTolerancePercent,
    dangerTolerancePercent
  );

  const getStyles = (status: StatusLevel) => {
    switch (status) {
      case "normal":
        return {
          bg: isDark ? "rgba(52,211,153,0.1)" : "rgba(22,163,74,0.10)",
          border: isDark ? "rgba(52,211,153,0.3)" : "rgba(22,163,74,0.35)",
          fg: isDark ? "#34d399" : "#166534",
          bar: "#16a34a",
        };
      case "warning":
        return {
          bg: isDark ? "rgba(fbbf24,0.1)" : "rgba(245,158,11,0.10)",
          border: isDark ? "rgba(fbbf24,0.3)" : "rgba(245,158,11,0.35)",
          fg: isDark ? "#fbbf24" : "#92400e",
          bar: "#f59e0b",
        };
      case "danger":
        return {
          bg: isDark ? "rgba(f87171,0.1)" : "rgba(239,68,68,0.10)",
          border: isDark ? "rgba(f87171,0.3)" : "rgba(239,68,68,0.35)",
          fg: isDark ? "#f87171" : "#991b1b",
          bar: "#ef4444",
        };
      default:
        return {
          bg: isDark ? "rgba(156,163,175,0.1)" : "rgba(156,163,175,0.10)",
          border: isDark ? "rgba(156,163,175,0.3)" : "rgba(156,163,175,0.40)",
          fg: isDark ? "#9ca3af" : "#4b5563",
          bar: "#9ca3af",
        };
    }
  };

  const styles = getStyles(status);
  const displayHz = freqHz !== null ? freqHz.toFixed(2) : "—";

  const diffPercent =
    freqHz !== null ? (Math.abs(freqHz - nominal) / nominal) * 100 : 0;

  /** 0% en nominal – 100% en límite de alarma */
  const barFill = clamp(
    dangerTolerancePercent > 0 ? diffPercent / dangerTolerancePercent : 1,
    0,
    1
  );

  // Detectar altura del contenedor y cambiar orientación
  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const height = entry.contentRect.height;
      setIsHorizontal(height < MIN_HEIGHT_FOR_VERTICAL);
    });

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, []);

  // Encabezado: valor + estado (contenido centrado)
  const header = (
    <div className="flex items-center justify-center gap-2">
      <div className="flex flex-col items-end">
        <span className="text-2xl font-semibold tabular-nums text-foreground leading-none">
          {displayHz}
        </span>
        <span className="text-[10px] text-muted-foreground leading-none">Hz</span>
      </div>

      <span
        className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full border transition-colors duration-200"
        style={{
          color: styles.fg,
          backgroundColor: styles.bg,
          borderColor: styles.border,
        }}
      >
        {status === "normal"
          ? "Normal"
          : status === "warning"
            ? "ATENCIÓN"
            : status === "danger"
              ? "ALARMA"
              : "—"}
      </span>
    </div>
  );

  // Texto inferior (leyendas centradas en horizontal)
  const footer = (
    <div className="mt-1 w-full flex flex-col items-center text-[9px] text-muted-foreground text-center leading-tight">
      <div>Nom: {nominal} Hz</div>
      <div>
        ±{warningTolerancePercent}% Normal · ±{dangerTolerancePercent}% Alerta
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className="flex flex-col items-center w-full h-full py-1"
    >
      {/* Layout vertical clásico (cuando hay altura suficiente) */}
      {!isHorizontal && (
        <>
          <div className="mb-1 w-full flex justify-center">{header}</div>

          <div className="flex-1 w-3 flex items-end">
            <div className="relative w-full h-full bg-muted rounded-full overflow-hidden">
              <div
                className="absolute bottom-0 left-0 w-full"
                style={{
                  height: `${barFill * 100}%`,
                  backgroundColor: styles.bar,
                  transition: "height 0.2s ease",
                }}
              />
            </div>
          </div>

          {footer}
        </>
      )}

      {/* Layout horizontal (cuando el panel tiene poca altura) */}
      {isHorizontal && (
        <>
          <div className="mb-1 w-full flex justify-center">{header}</div>

          <div className="w-full mt-1 mb-1 flex justify-center">
            <div className="relative w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="absolute left-0 top-0 h-full"
                style={{
                  width: `${barFill * 100}%`,
                  backgroundColor: styles.bar,
                  transition: "width 0.2s ease",
                }}
              />
            </div>
          </div>

          {footer}
        </>
      )}
    </div>
  );
}
