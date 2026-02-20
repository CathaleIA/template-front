"use client";

import React, {
  useState,
  useMemo,
  lazy,
  Suspense,
} from "react";
import { useIoTData } from "@/context/IoTDataContext";
import {
  getNumericValue,
  getBooleanValue,
} from "@/types/iot.types";

// Common components
import HeaderStatus from "./HeaderStatus";

// Generator components
import {
  GeneralStatusCard,
  CurrentsChart,
  VoltagesChart,
  KPIVoltage,
  GeneratorSequenceGauge,
  DesbalanceCorrienteIndicator,
} from "./generator";

// Breaker components
import { BreakerCard } from "./breaker";

// Temperature components
import { BearingTemperatures } from "./temperature";

/* --- Lazy Load components for extra tab --- */
const BusbarPhaseTriangle3D = lazy(() =>
  import("./busbar").then((m) => ({ default: m.BusbarPhaseAnglesPolar }))
);
const BusbarSequenceBars = lazy(() =>
  import("./busbar").then((m) => ({ default: m.BusbarSequenceBars }))
);
const BusbarFrequencyGauge = lazy(() =>
  import("./busbar").then((m) => ({ default: m.BusbarFrequencyGauge }))
);
const BreakerOperationFlowPanel = lazy(() =>
  import("./breaker").then((m) => ({ default: m.BreakerOperationFlowPanel }))
);
const BreakerStatusPanel = lazy(() =>
  import("./breaker").then((m) => ({ default: m.BreakerStatusPanel }))
);
const DeltaBusDeltaTrend = lazy(() =>
  import("./busbar").then((m) => ({ default: m.DeltaBusDeltaTrend }))
);

// AI Chat component (lazy loaded)
const ChatSidebar = lazy(() => import("./ChatSidebar"));

/* ============ BUFFER TYPES ============ */
type Row = { idx: number; ts: number } & Record<string, number>;

interface DeltaRow {
  ts: number;
  delta_L1_barra?: number;
  delta_L2_barra?: number;
  delta_L3_barra?: number;
}

/* ============ Card ============ */
function Card({
  title,
  children,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "bg-card rounded-2xl",
        "border border-border",
        "overflow-hidden",
        "shadow-[8px_8px_20px_rgba(0,0,0,0.18)]",
        "dark:shadow-[8px_8px_20px_rgba(0,0,0,0.4)]",
        "hover:shadow-[10px_10px_25px_rgba(0,0,0,0.25)] transition-all duration-300",
        "flex flex-col h-full",
        className,
      ].join(" ")}
    >
      <div className="px-0 py-0">
        <div className="relative flex items-stretch h-8 w-full">
          {/* Banda principal */}
          <div className="bg-[var(--green-dark)] text-white h-8 flex items-center border-b-4 border-gray-400 dark:border-gray-600 w-3/5 min-w-[160px] max-w-full px-3 md:px-4">
            <h3 className="text-[13px] font-bold uppercase tracking-wider leading-none">
              {title}
            </h3>
          </div>

          {/* “Cola” curva a la derecha */}
          <div className="-ml-px h-8 w-9 bg-[var(--green-dark)] border-b-4 border-r-4 border-gray-400 dark:border-gray-600 rounded-br-[9999px]" />
        </div>
      </div>

      <div className="flex-1 px-2 pb-2 pt-1 md:px-3 md:pb-3 md:pt-1 flex flex-col">
        {children}
      </div>
    </div>
  );
}

/* ============ DASHBOARD ============ */
export default function GPC300Dashboard() {
  const { data, buffer, deltaBuffer, connected, lastUpdate, error } = useIoTData();

  /* ============ ROWS ============ */
  const corrienteData: Row[] = useMemo(
    () =>
      buffer.corriente.map((p, i): Row => ({
        idx: i,
        ts: p.time,
        ...p.value,
      })),
    [buffer.corriente]
  );

  const voltajeData: Row[] = useMemo(
    () =>
      buffer.voltaje.map((p, i): Row => ({
        idx: i,
        ts: p.time,
        ...p.value,
      })),
    [buffer.voltaje]
  );

  const deltaDataRows: DeltaRow[] = useMemo(
    () =>
      deltaBuffer.map(
        (p): DeltaRow => ({
          ts: p.time,
          delta_L1_barra:
            p.delta_L1_barra !== null && !Number.isNaN(p.delta_L1_barra)
              ? p.delta_L1_barra
              : undefined,
          delta_L2_barra:
            p.delta_L2_barra !== null && !Number.isNaN(p.delta_L2_barra)
              ? p.delta_L2_barra
              : undefined,
          delta_L3_barra:
            p.delta_L3_barra !== null && !Number.isNaN(p.delta_L3_barra)
              ? p.delta_L3_barra
              : undefined,
        })
      ),
    [deltaBuffer]
  );

  const [activeTab, setActiveTab] = useState("main");
  const [chatOpen, setChatOpen] = useState(false);

  return (
    <>
      <div className={`p-4 md:p-6 bg-background min-h-screen font-sans text-foreground transition-all duration-300 ${chatOpen ? 'mr-80' : ''}`}>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
              Dashboard GPC-300
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Sistema de Monitoreo de Generador Industrial
            </p>
          </div>
          <HeaderStatus
            connected={connected}
            lastUpdate={lastUpdate}
            error={error}
          />
        </div>

        <div className="flex space-x-1 bg-muted p-1 rounded-lg mb-6 w-fit">
          <button
            onClick={() => setActiveTab("main")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "main"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-300/20"
              }`}
          >
            Vista Principal
          </button>
          <button
            onClick={() => setActiveTab("extras")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "extras"
              ? "bg-card text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground hover:bg-slate-300/20"
              }`}
          >
            Análisis Detallado
          </button>

        </div>

        <div className="space-y-6">
          {activeTab === "main" ? (
            <>
              <div className="grid grid-cols-12 gap-4 mb-4 items-start">
                <Card title="Estado General" className="col-span-12 lg:col-span-6">
                  <GeneralStatusCard
                    activa={getNumericValue(data?.data.generator?.potencia_activa) ?? 0}
                    reactiva={getNumericValue(data?.data.generator?.potencia_reactiva) ?? 0}
                    aparente={getNumericValue(data?.data.generator?.potencia_aparente) ?? 0}
                    fp={getNumericValue(data?.data.generator?.factor_potencia) ?? 0}
                  />
                </Card>

                <Card title="KPI de Voltaje" className="col-span-12 lg:col-span-6">
                  <KPIVoltage voltages={data?.data.generator ?? {}} />
                </Card>
              </div>

              <div className="grid grid-cols-12 gap-4 mb-4 items-start">
                <Card title="Corriente" className="col-span-12 lg:col-span-6">
                  <CurrentsChart data={corrienteData} height={364} />
                </Card>

                <Card title="Voltaje" className="col-span-12 lg:col-span-6">
                  <VoltagesChart data={voltajeData} height={364} />
                </Card>
              </div>

              <div className="grid grid-cols-12 gap-4 mb-4 items-start">
                <Card
                  title="Temperaturas de Rodamientos"
                  className="col-span-12 lg:col-span-6"
                >
                  <BearingTemperatures
                    rodamientoDelantero={
                      data?.data.temperature?.rodamiento_delantero
                    }
                    rodamientoTrasero={
                      data?.data.temperature?.rodamiento_trasero
                    }
                  />
                </Card>

                <div className="col-span-12 lg:col-span-6 flex flex-col gap-4">
                  <Card title="Secuencias del Generador" className="flex-1">
                    <GeneratorSequenceGauge
                      secuenciaPositiva={
                        data?.data.generator?.secuencia_positiva
                      }
                      secuenciaNegativa={
                        data?.data.generator?.secuencia_negativa
                      }
                      secuenciaZero={data?.data.generator?.secuencia_zero}
                    />
                  </Card>

                  <Card title="Desbalance de Corriente" className="flex-1">
                    <DesbalanceCorrienteIndicator
                      desbalance_corriente={
                        data?.data.generator?.desbalance_corriente
                      }
                    />
                  </Card>
                </div>
              </div>
            </>

          ) : (
            <>
              <div className="grid grid-cols-12 gap-4 mb-4 auto-rows-max">
                <Card
                  title="Flujo de Operación del Interruptor"
                  className="col-span-12 lg:col-span-5 h-[480px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <BreakerOperationFlowPanel
                        breaker={data?.data.breaker}
                        generator={data?.data.generator}
                        busbar={data?.data.busbar}
                      />
                    </Suspense>
                  </div>
                </Card>

                <Card
                  title="Secuencias de Barra de Bus"
                  className="col-span-12 lg:col-span-5 h-[480px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <BusbarSequenceBars busbar={data?.data.busbar} />
                    </Suspense>
                  </div>
                </Card>

                <Card
                  title="Frecuencia de Barra de Bus"
                  className="col-span-12 lg:col-span-2 h-[480px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <BusbarFrequencyGauge busbar={data?.data.busbar} />
                    </Suspense>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-12 gap-4 mb-4 auto-rows-max">
                <Card
                  title="Ángulos de Fase de Barra de Bus"
                  className="col-span-12 lg:col-span-4 h-[480px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <BusbarPhaseTriangle3D busbar={data?.data.busbar} />
                    </Suspense>
                  </div>
                </Card>

                <Card
                  title="Estado del Interruptor"
                  className="col-span-12 lg:col-span-4 h-[480px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <BreakerStatusPanel breakerData={data?.data.breaker ?? {}} />
                    </Suspense>
                  </div>
                </Card>

                <Card
                  title="Δ de Voltaje Generador–Barra"
                  className="col-span-12 lg:col-span-4 h-[220px]"
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <Suspense fallback={<div>Cargando...</div>}>
                      <DeltaBusDeltaTrend
                        data={deltaDataRows}
                        maxRange={10}
                        warningThreshold={2}
                        alarmThreshold={5}
                        height={180}
                      />
                    </Suspense>
                  </div>
                </Card>
              </div>
            </>
          )}
        </div>
      </div>

      <Suspense fallback={null}>
        <ChatSidebar isOpen={chatOpen} onToggle={() => setChatOpen(!chatOpen)} />
      </Suspense>
    </>
  );
}
