"use client";

import type { BreakerData, VariableData } from "@/types/iot.types";

interface BreakerStatusPanelProps {
  breakerData: BreakerData;
  title?: string;
}

type MainStatus = "FAULT" | "CLOSED" | "OPEN" | "UNKNOWN";

const getBooleanValue = (data?: VariableData): boolean => {
  return data?.value === true;
};

const getTriStateLabel = (
  value: boolean,
  hasData: boolean,
  labels: { trueLabel: string; falseLabel: string; noDataLabel?: string }
): string => {
  if (!hasData && labels.noDataLabel) return labels.noDataLabel;
  return value ? labels.trueLabel : labels.falseLabel;
};

const BreakerStatusPanel = ({ breakerData, title }: BreakerStatusPanelProps) => {
  // --- Estados básicos ---
  const hasClosed = breakerData.closed !== undefined;
  const hasOpened = breakerData.opened !== undefined;
  const hasFault = breakerData.fault !== undefined;

  const isClosed = getBooleanValue(breakerData.closed);
  const isOpened = getBooleanValue(breakerData.opened);
  const isFault = getBooleanValue(breakerData.fault);

  const hasAnyMainBit = hasClosed || hasOpened || hasFault;

  let mainStatus: MainStatus = "OPEN";

  if (!hasAnyMainBit) {
    mainStatus = "UNKNOWN";
  } else if (isFault) {
    mainStatus = "FAULT";
  } else if (isClosed) {
    mainStatus = "CLOSED";
  } else if (isOpened) {
    mainStatus = "OPEN";
  } else {
    mainStatus = "UNKNOWN";
  }

  // --- Condiciones eléctricas / sincronismo ---
  const hasVoltageFreqOk = breakerData.voltage_freq_ok !== undefined;
  const voltageFreqOk = getBooleanValue(breakerData.voltage_freq_ok);

  const hasSyncInProgress = breakerData.sync_in_progress !== undefined;
  const syncInProgress = getBooleanValue(breakerData.sync_in_progress);

  // --- Permisos de operación ---
  const hasReadyToClose = breakerData.ready_to_close !== undefined;
  const readyToClose = getBooleanValue(breakerData.ready_to_close);

  const hasReadyToOpen = breakerData.ready_to_open !== undefined;
  const readyToOpen = getBooleanValue(breakerData.ready_to_open);

  // --- Estilos del estado principal ---
  let mainBg = "bg-muted/30";
  let mainBorder = "border-border";
  let mainText = "text-foreground";
  let mainPillBg = "bg-slate-200 dark:bg-slate-800";
  let mainPillText = "text-slate-800 dark:text-slate-200";
  let mainLabel = "SIN DATOS";
  let mainDescription = "Sin telemetría de estado del breaker";

  if (mainStatus === "FAULT") {
    mainBg = "bg-red-50 dark:bg-red-900/10";
    mainBorder = "border-red-300 dark:border-red-800/50";
    mainText = "text-red-900 dark:text-red-400";
    mainPillBg = "bg-red-600";
    mainPillText = "text-white";
    mainLabel = "DISPARO / FALLA";
    mainDescription = "Breaker bloqueado por protección o condición de falla";
  } else if (mainStatus === "CLOSED") {
    mainBg = "bg-emerald-50 dark:bg-emerald-900/10";
    mainBorder = "border-emerald-300 dark:border-emerald-800/50";
    mainText = "text-emerald-900 dark:text-emerald-400";
    mainPillBg = "bg-emerald-600";
    mainPillText = "text-white";
    mainLabel = "CERRADO";
    mainDescription = "Breaker energizado y en servicio";
  } else if (mainStatus === "OPEN") {
    mainBg = "bg-amber-50 dark:bg-amber-900/10";
    mainBorder = "border-amber-300 dark:border-amber-800/50";
    mainText = "text-amber-900 dark:text-amber-400";
    mainPillBg = "bg-amber-500";
    mainPillText = "text-white";
    mainLabel = "ABIERTO";
    mainDescription = "Breaker desenergizado / aislado";
  }

  const getSmallLedClasses = (
    active: boolean,
    mode: "good" | "bad" | "warn" | "info" | "neutral"
  ): string => {
    if (!active && mode === "neutral") {
      return "bg-slate-200 dark:bg-slate-800";
    }

    if (!active) {
      return "bg-slate-300 dark:bg-slate-700";
    }

    switch (mode) {
      case "good":
        return "bg-emerald-500 shadow-emerald-500/40";
      case "bad":
        return "bg-red-500 shadow-red-500/40";
      case "warn":
        return "bg-amber-400 shadow-amber-400/40";
      case "info":
        return "bg-sky-500 shadow-sky-500/40";
      default:
        return "bg-slate-400 dark:bg-slate-600";
    }
  };

  const baseCardClasses =
    "rounded-lg border border-border bg-card shadow-sm px-3 py-2.5 flex items-start justify-between gap-2";

  return (
    <div className="w-full h-full flex flex-col">
      {title && (
        <div className="mb-3">
          <h2 className="text-sm font-semibold text-foreground tracking-tight">
            {title}
          </h2>
        </div>
      )}

      {/* BLOQUE PRINCIPAL: ESTADO DEL BREAKER */}
      <div
        className={`mb-4 rounded-xl border px-4 py-3 transition-colors duration-200 ${mainBg} ${mainBorder} ${mainText}`}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground/80">
              ESTADO DEL BREAKER
            </div>
            <div className="text-lg font-semibold tracking-tight">
              {mainLabel}
            </div>
            <div className="text-xs text-foreground/80">{mainDescription}</div>
          </div>
          <div
            className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-semibold shadow-sm ${mainPillBg} ${mainPillText}`}
          >
            {mainStatus === "FAULT" && "ALERTA"}
            {mainStatus === "CLOSED" && "EN SERVICIO"}
            {mainStatus === "OPEN" && "DESENERGIZADO"}
            {mainStatus === "UNKNOWN" && "SIN DATOS"}
          </div>
        </div>
      </div>

      {/* BLOQUES SECUNDARIOS EN LAYOUT VERTICAL */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* CONDICIONES ELÉCTRICAS */}
        <section className="flex flex-col h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Condiciones eléctricas
          </div>

          <div className="flex-1 grid grid-rows-2 gap-2">
            {/* Voltaje / Frecuencia */}
            <div className={baseCardClasses}>
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${getSmallLedClasses(
                    voltageFreqOk,
                    voltageFreqOk ? "good" : "bad"
                  )}
                    ${voltageFreqOk ? "shadow-md" : ""}
                  `}
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Voltaje / Frecuencia
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {getTriStateLabel(voltageFreqOk, hasVoltageFreqOk, {
                      trueLabel: "Dentro de rango para operación",
                      falseLabel: "Fuera de rango / no apto para conexión",
                      noDataLabel: "Sin datos de condición eléctrica",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Sincronización */}
            <div className={baseCardClasses}>
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${getSmallLedClasses(
                    syncInProgress,
                    syncInProgress ? "info" : "neutral"
                  )}
                    ${syncInProgress ? "shadow-md" : ""}
                  `}
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Sincronización
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {getTriStateLabel(syncInProgress, hasSyncInProgress, {
                      trueLabel: "Sincronización en curso",
                      falseLabel: "No activa",
                      noDataLabel: "Sin datos de sincronismo",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* PERMISOS DE OPERACIÓN */}
        <section className="flex flex-col h-full">
          <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground mb-2">
            Permisos de operación
          </div>

          <div className="flex-1 grid grid-rows-2 gap-2">
            {/* Permiso para cerrar */}
            <div className={baseCardClasses}>
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${getSmallLedClasses(
                    readyToClose,
                    readyToClose ? "good" : "warn"
                  )}
                    ${readyToClose ? "shadow-md" : ""}
                  `}
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Permiso para cerrar
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {getTriStateLabel(readyToClose, hasReadyToClose, {
                      trueLabel: "SÍ: condiciones habilitan el cierre",
                      falseLabel: "NO: condiciones no habilitan el cierre",
                      noDataLabel: "Sin datos de permiso para cierre",
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Permiso para abrir */}
            <div className={baseCardClasses}>
              <div className="flex items-center gap-2">
                <div
                  className={`
                    w-2.5 h-2.5 rounded-full transition-all duration-300
                    ${getSmallLedClasses(
                    readyToOpen,
                    readyToOpen ? "good" : "neutral"
                  )}
                    ${readyToOpen ? "shadow-md" : ""}
                  `}
                />
                <div>
                  <div className="text-xs font-semibold text-foreground">
                    Permiso para abrir
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    {getTriStateLabel(readyToOpen, hasReadyToOpen, {
                      trueLabel: "SÍ: operación de apertura permitida",
                      falseLabel: "NO: operación de apertura no habilitada",
                      noDataLabel: "Sin datos de permiso para apertura",
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default BreakerStatusPanel;
