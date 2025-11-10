// industrial-iot-lab/dashboard-industrial/src/components/Dashboard.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Activity, Terminal, X } from "lucide-react";
import { getNumericValue, getBooleanValue } from "@/types/iot.types";

import HeaderStatus from "./HeaderStatus";
import GeneralStatusCard from "./GeneralStatusCard";
import BreakerCard from "./BreakerCard";
import CurrentsChart from "./CurrentsChart";
import VoltagesChart from "./VoltagesChart";

/* ============ TIPOS ============ */
interface VariableData {
  value: number | boolean;
  timestamp: string;
}

interface IoTData {
  timestamp: string;
  data: {
    generator: {
      potencia_activa?: VariableData;
      potencia_reactiva?: VariableData;
      potencia_aparente?: VariableData;
      factor_potencia?: VariableData;
      frecuencia?: VariableData;

      corriente_L1?: VariableData;
      corriente_L2?: VariableData;
      corriente_L3?: VariableData;
      promedio_corrientes?: VariableData;

      voltage_L1_N?: VariableData;
      voltage_L2_N?: VariableData;
      voltage_L3_N?: VariableData;
      promedio_voltajes?: VariableData;
    };
    busbar?: { frecuencia?: VariableData };
    breaker: {
      closed?: VariableData;
      fault?: VariableData;
      voltage_freq_ok?: VariableData;
    };
    temperature: {
      devanado_u?: VariableData;
      devanado_v?: VariableData;
      devanado_w?: VariableData;
      rodamiento_delantero?: VariableData;
      rodamiento_trasero?: VariableData;
    };
  };
}

/* ============ LOG ENTRY ============ */
interface LogEntry {
  time: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
}

/* ============ BUFFER ============ */
const BUFFER_SIZE = 80;

interface BufferPoint {
  time: number;
  value: Record<string, number>;
}

type Row = { idx: number; ts: number } & Record<string, number>;

/* ============ DEBUG CONSOLE COMPONENT ============ */
function DebugConsole({ 
  logs, 
  onClose 
}: { 
  logs: LogEntry[]; 
  onClose: () => void;
}) {
  const logColors = {
    info: 'text-blue-400',
    success: 'text-green-400',
    error: 'text-red-400',
    warning: 'text-yellow-400'
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 bg-gray-900 rounded-lg shadow-2xl border border-gray-700 overflow-hidden z-50">
      {/* Header */}
      <div className="flex items-center justify-between bg-gray-800 px-4 py-2 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-green-400" />
          <span className="text-sm font-semibold text-white">Debug Console</span>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Logs */}
      <div className="overflow-y-auto max-h-80 p-3 space-y-1 font-mono text-xs">
        {logs.length === 0 ? (
          <div className="text-gray-500 text-center py-4">
            Esperando logs...
          </div>
        ) : (
          logs.map((log, idx) => (
            <div key={idx} className="flex gap-2">
              <span className="text-gray-500">{log.time}</span>
              <span className={logColors[log.type]}>{log.message}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ============ Card con "base" ancha y píldora verde ============ */
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
        "relative rounded-2xl bg-[var(--gray-soft)]",
        "border border-[var(--color-panel-border)] shadow-lg",
        "px-3 pb-3 pt-6",
        className,
      ].join(" ")}
    >
      <div className="absolute -top-4 left-5">
        <div
          className={[
            "h-8 rounded-full",
            "bg-[rgba(0,0,0,0.06)]",
            "backdrop-blur-[1px]",
            "px-6",
            "inline-flex items-center shadow-sm",
          ].join(" ")}
          style={{ minWidth: 160 }}
        >
          <div className="inline-flex items-center rounded-full bg-[var(--green-medium)] text-white px-4 py-1 font-semibold uppercase tracking-wide text-[11px] relative -top-[2px] shadow">
            {title}
          </div>
        </div>
      </div>

      <div className="mt-2 rounded-xl bg-white/70 p-3">
        {children}
      </div>
    </div>
  );
}

export default function GPC300Dashboard() {
  const [data, setData] = useState<IoTData | null>(null);
  const [buffer, setBuffer] = useState<{
    corriente: BufferPoint[];
    voltaje: BufferPoint[];
  }>({ corriente: [], voltaje: [] });

  const [connected, setConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  // 🆕 Estado para logs
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [showDebug, setShowDebug] = useState(true);

  // 🆕 Función para añadir logs
  const addLog = useCallback((type: LogEntry['type'], message: string) => {
    const time = new Date().toLocaleTimeString('es-CO', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
    
    setLogs(prev => [...prev, { time, type, message }].slice(-50)); // Últimos 50 logs
  }, []);

  /* ============ ACTUALIZAR BUFFER ============ */
  const updateBuffer = useCallback((msg: IoTData) => {
    const gen = msg.data.generator;
    const t = Date.now();

    setBuffer((prev) => {
      const append = (arr: BufferPoint[], value: Record<string, number>) =>
        [...arr, { time: t, value }].slice(-BUFFER_SIZE);

      return {
        corriente: append(prev.corriente, {
          L1: getNumericValue(gen.corriente_L1) || 0,
          L2: getNumericValue(gen.corriente_L2) || 0,
          L3: getNumericValue(gen.corriente_L3) || 0,
          Promedio: getNumericValue(gen.promedio_corrientes) || 0,
        }),
        voltaje: append(prev.voltaje, {
          "L1-N": getNumericValue(gen.voltage_L1_N) || 0,
          "L2-N": getNumericValue(gen.voltage_L2_N) || 0,
          "L3-N": getNumericValue(gen.voltage_L3_N) || 0,
          Promedio: getNumericValue(gen.promedio_voltajes) || 0,
        }),
      };
    });
  }, []);

  /* ============ SSE CON LOGS ============ */
  useEffect(() => {
    addLog('info', '🔄 Iniciando conexión EventSource...');
    addLog('info', `📍 Endpoint: /api/iot/stream`);
    addLog('info', `🌍 Environment: ${process.env.NODE_ENV || 'unknown'}`);
    
    const es = new EventSource("/api/iot/stream");
    
    es.onopen = () => {
      setConnected(true);
      setError(null);
      addLog('success', '✅ EventSource conectado correctamente');
    };
    
    es.onerror = (e) => {
      setConnected(false);
      setError("Error de conexión");
      addLog('error', `❌ Error EventSource: ${JSON.stringify(e)}`);
      
      // Información adicional del error
      if (es.readyState === EventSource.CLOSED) {
        addLog('error', '🔌 Conexión cerrada por el servidor');
      } else if (es.readyState === EventSource.CONNECTING) {
        addLog('warning', '⏳ Intentando reconectar...');
      }
    };
    
    es.onmessage = (e) => {
      try {
        addLog('info', `📨 Mensaje recibido (${e.data.length} chars)`);
        
        const msg: unknown = JSON.parse(e.data);
        
        // Verificar si es un mensaje de control
        if (typeof msg === "object" && msg !== null && "type" in (msg as Record<string, unknown>)) {
          const controlMsg = msg as { type: string };
          
          if (controlMsg.type === 'connected') {
            addLog('success', '🎉 Conexión SSE establecida');
          } else if (controlMsg.type === 'heartbeat') {
            addLog('info', '💓 Heartbeat recibido');
          } else if (controlMsg.type === 'error') {
            addLog('error', `⚠️ Error del servidor: ${JSON.stringify(msg)}`);
          }
          return;
        }
        
        // Mensaje de datos IoT
        const casted = msg as IoTData;
        setData(casted);
        setLastUpdate(new Date());
        updateBuffer(casted);
        addLog('success', `📊 Datos IoT actualizados (${casted.timestamp})`);
        
      } catch (err) {
        addLog('error', `❌ Error parseando mensaje: ${err}`);
        console.error(err);
      }
    };
    
    return () => {
      addLog('warning', '🔌 Cerrando conexión EventSource');
      es.close();
    };
  }, [updateBuffer, addLog]);

  /* ============ FILAS PARA GRÁFICAS ============ */
  const corrienteData: Row[] = buffer.corriente.map((p, i) => ({
    idx: i,
    ts: p.time,
    ...p.value,
  }));

  const voltajeData: Row[] = buffer.voltaje.map((p, i) => ({
    idx: i,
    ts: p.time,
    ...p.value,
  }));

  /* ============ RENDER ============ */
  return (
    <div className="min-h-screen p-6 bg-gradient-to-b from-[var(--green-dark)] via-[var(--gray-soft)] to-[var(--gray-soft)] text-gray-900">
      {/* Estado conexión */}
      <div className="absolute right-6 top-6 z-50 flex gap-2">
        {/* Botón para toggle debug console */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-md bg-gray-800 text-white hover:bg-gray-700 transition-colors"
          title="Toggle Debug Console"
        >
          <Terminal className="w-4 h-4" />
          <span>Debug</span>
        </button>

        {/* Estado de conexión */}
        <div
          className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium shadow-md ${
            error
              ? "bg-red-600 text-white"
              : connected
              ? "bg-[var(--green-light)] text-white"
              : "bg-yellow-500 text-black"
          }`}
          title={lastUpdate ? `Última: ${lastUpdate.toLocaleTimeString()}` : ""}
        >
          <Activity className={`w-4 h-4 ${connected ? "animate-pulse" : ""}`} />
          <span>{error ? error : connected ? "Conectado" : "Conectando..."}</span>
        </div>
      </div>

      {/* Debug Console */}
      {showDebug && (
        <DebugConsole 
          logs={logs} 
          onClose={() => setShowDebug(false)} 
        />
      )}

      {/* Header superior */}
      <HeaderStatus
        title="DASHBOARD GPC-300"
        subtitle="Generador Principal - Estado Actual"
        lastUpdate={lastUpdate}
      />

      {/* PANEL 1: ESTADO GENERAL */}
      <div className="grid grid-cols-12 gap-4 mb-4">
        <Card title="Estado General" className="col-span-12 lg:col-span-8">
          <GeneralStatusCard
            activa={getNumericValue(data?.data.generator.potencia_activa) || 0}
            reactiva={getNumericValue(data?.data.generator.potencia_reactiva) || 0}
            aparente={getNumericValue(data?.data.generator.potencia_aparente) || 0}
            fp={(getNumericValue(data?.data.generator.factor_potencia) || 0) * 100}
          />
        </Card>

        <Card title="Breaker" className="col-span-12 lg:col-span-4">
          <BreakerCard
            closed={!!getBooleanValue(data?.data.breaker.closed)}
            ok={!!getBooleanValue(data?.data.breaker.voltage_freq_ok)}
            fault={!!getBooleanValue(data?.data.breaker.fault)}
            frecuencia={getNumericValue(data?.data.generator.frecuencia) || 0}
          />
        </Card>
      </div>

      {/* PANEL 2: CORRIENTE Y VOLTAJE */}
      <Card title="Mediciones Eléctricas" className="mb-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card title="Corriente">
            <CurrentsChart data={corrienteData} height={360} />
          </Card>

          <Card title="Voltaje">
            <VoltagesChart data={voltajeData} height={360} />
          </Card>
        </div>
      </Card>
    </div>
  );
}