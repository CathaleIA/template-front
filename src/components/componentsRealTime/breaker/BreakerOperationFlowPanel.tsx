// src/components/BreakerOperationFlowPanel.tsx
"use client";

import React from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Power,
  Zap,
  ArrowRightLeft,
} from "lucide-react";
import {
  BreakerData,
  BusbarData,
  GeneratorData,
  getBooleanValue,
  getNumericValue,
} from "@/types/iot.types";

type Props = {
  breaker?: BreakerData;
  generator?: GeneratorData;
  busbar?: BusbarData;
};

type StepState = "inactive" | "active" | "blocked";

function getStepClasses(state: StepState): string {
  if (state === "blocked") {
    return "bg-red-500 border-red-600 dark:border-red-400 text-white";
  }
  if (state === "active") {
    return "bg-[var(--green-dark)] border-[var(--green-dark)] text-white dark:bg-[var(--green-medium)] dark:border-[var(--green-medium)]";
  }
  return "bg-muted border-border text-muted-foreground";
}

const BreakerOperationFlowPanel: React.FC<Props> = ({
  breaker,
  generator,
  busbar,
}) => {
  // --- Breaker flags ---
  const voltageOk = !!getBooleanValue(breaker?.voltage_freq_ok);
  const opened = !!getBooleanValue(breaker?.opened);
  const closed = !!getBooleanValue(breaker?.closed);
  const fault = !!getBooleanValue(breaker?.fault);
  const readyToClose = !!getBooleanValue(breaker?.ready_to_close);
  const syncInProgress = !!getBooleanValue(breaker?.sync_in_progress);
  const readyToOpen = !!getBooleanValue(breaker?.ready_to_open);

  // --- Frecuencias GEN / BUS ---
  const genFreq = getNumericValue(generator?.frecuencia);
  const busFreq = getNumericValue(busbar?.frecuencia);
  const deltaFreq =
    genFreq !== null && busFreq !== null ? genFreq - busFreq : null;

  // --- Estados de los pasos de operación ---
  const stepReadyToClose: StepState = fault
    ? "blocked"
    : readyToClose
      ? "active"
      : "inactive";

  const stepSync: StepState = fault
    ? "blocked"
    : syncInProgress
      ? "active"
      : "inactive";

  const stepClosed: StepState = fault
    ? "blocked"
    : closed
      ? "active"
      : "inactive";

  const stepReadyToOpen: StepState = fault
    ? "blocked"
    : readyToOpen
      ? "active"
      : "inactive";

  // --- Estado textual abierto/cerrado ---
  const stateLabel = fault
    ? "FALLA"
    : closed
      ? "CERRADO"
      : opened
        ? "ABIERTO"
        : "INTERMEDIO";

  const stateColorClass = fault
    ? "bg-red-600 text-white"
    : closed
      ? "bg-[var(--green-dark)] text-white dark:bg-[var(--green-medium)]"
      : opened
        ? "bg-muted text-foreground"
        : "bg-amber-400 text-black";

  return (
    <div className="flex h-full w-full flex-col gap-3 text-xs text-foreground">
      {/* Resumen superior: frecuencias + estado general */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2">
        {/* GEN / BUS / Δf */}
        <div className="col-span-12 md:col-span-7 grid grid-cols-3 gap-2">
          <div className="flex flex-col rounded-lg border border-border bg-muted/30 px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>FREQ GEN</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {genFreq !== null ? `${genFreq.toFixed(2)} Hz` : "--"}
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-border bg-muted/30 px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <Zap className="h-3 w-3" />
              <span>FREQ BARRA</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {busFreq !== null ? `${busFreq.toFixed(2)} Hz` : "--"}
            </div>
          </div>

          <div className="flex flex-col rounded-lg border border-border bg-muted/30 px-2 py-1.5">
            <div className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <ArrowRightLeft className="h-3 w-3" />
              <span>ΔF GEN-BARRA</span>
            </div>
            <div className="mt-1 text-sm font-semibold text-foreground">
              {deltaFreq !== null ? `${deltaFreq.toFixed(2)} Hz` : "--"}
            </div>
          </div>
        </div>

        {/* Estado principal del breaker */}
        <div className="col-span-12 md:col-span-5 flex flex-col rounded-lg border border-border bg-muted/30 px-2 py-1.5">
          <div className="flex items-center justify-between text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Power className="h-3 w-3" />
              Estado del Interruptor
            </span>
            <span className="inline-flex items-center gap-1">
              <CheckCircle2
                className={`h-3 w-3 ${voltageOk ? "text-[var(--green-live)]" : "text-muted-foreground/50"
                  }`}
              />
              <span className="text-[10px]">
                {voltageOk ? "V/F OK" : "V/F NO OK"}
              </span>
            </span>
          </div>
          <div className="mt-1 inline-flex items-center gap-2">
            <span
              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${stateColorClass}`}
            >
              {stateLabel}
            </span>
            {fault && (
              <span className="inline-flex items-center gap-1 rounded-full bg-red-50 dark:bg-red-900/20 px-2 py-0.5 text-[11px] font-medium text-red-600 dark:text-red-400">
                <AlertTriangle className="h-3 w-3" />
                FALLA ACTIVA
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Línea de pasos de operación */}
      <div className="mt-1 rounded-xl border border-border bg-card/50 px-3 py-2">
        <div className="mb-2 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
          Secuencia de Operación
        </div>
        <div className="flex items-center justify-between gap-3">
          {/* Paso 1: Ready to Close */}
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getStepClasses(
                stepReadyToClose
              )}`}
            >
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-foreground/80">
              Listo para Cerrar
            </span>
          </div>

          <div className="h-px flex-1 bg-border" />

          {/* Paso 2: Sync in Progress */}
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getStepClasses(
                stepSync
              )}`}
            >
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-foreground/80">
              Sincronización en Curso
            </span>
          </div>

          <div className="h-px flex-1 bg-border" />

          {/* Paso 3: Closed */}
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getStepClasses(
                stepClosed
              )}`}
            >
              <Power className="h-4 w-4" />
            </div>
            <span className="text-[11px] font-medium text-foreground/80">
              Cerrado
            </span>
          </div>

          <div className="h-px flex-1 bg-border" />

          {/* Paso 4: Ready to Open */}
          <div className="flex flex-1 flex-col items-center gap-1 text-center">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 ${getStepClasses(
                stepReadyToOpen
              )}`}
            >
              <Power className="h-4 w-4 rotate-180" />
            </div>
            <span className="text-[11px] font-medium text-foreground/80">
              Listo para Abrir
            </span>
          </div>
        </div>

        {/* Indicadores inferiores: OPENED / CLOSED flags brutos */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[11px] text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${opened ? "bg-[var(--green-live)]" : "bg-muted"
                }`}
            />
            INDICADOR ABIERTO
          </span>
          <span className="inline-flex items-center gap-1">
            <span
              className={`h-2 w-2 rounded-full ${closed ? "bg-[var(--green-live)]" : "bg-muted"
                }`}
            />
            INDICADOR CERRADO
          </span>
        </div>
      </div>
    </div>
  );
};

export default BreakerOperationFlowPanel;
