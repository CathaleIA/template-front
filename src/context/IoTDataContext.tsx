"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { IoTMessage, getNumericValue } from "@/types/iot.types";

interface BufferPoint {
    time: number;
    value: Record<string, number>;
}

interface DeltaPoint {
    time: number;
    delta_L1_barra: number | null;
    delta_L2_barra: number | null;
    delta_L3_barra: number | null;
}

interface IoTContextType {
    data: IoTMessage | null;
    buffer: {
        corriente: BufferPoint[];
        voltaje: BufferPoint[];
    };
    deltaBuffer: DeltaPoint[];
    connected: boolean;
    lastUpdate: Date | null;
    error: string | null;
}

const IoTDataContext = createContext<IoTContextType | undefined>(undefined);

const MAX_HISTORIAL_MS = 10 * 60 * 1000;
const MAX_RECONNECTIONS = 5;

export const IoTDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [data, setData] = useState<IoTMessage | null>(null);
    const [buffer, setBuffer] = useState<{
        corriente: BufferPoint[];
        voltaje: BufferPoint[];
    }>({ corriente: [], voltaje: [] });
    const [deltaBuffer, setDeltaBuffer] = useState<DeltaPoint[]>([]);
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    const reconnectAttempts = useRef(0);
    const messageCount = useRef(0);
    const mountTime = useRef(Date.now());

    // Log cuando el contexto se monta
    useEffect(() => {
        console.log("🎯 IoTDataContext MONTADO", new Date().toLocaleTimeString());
        return () => console.log("🔴 IoTDataContext DESMONTADO");
    }, []);

    // Log buffer state
    useEffect(() => {
        console.log(`📊 Buffer state: ${buffer.corriente.length} puntos`);
    }, [buffer]);

    const updateBuffer = useCallback((msg: IoTMessage) => {
        const gen = msg.data.generator;
        const ahora = Date.now();

        setBuffer((prev) => {
            const append = (arr: BufferPoint[], value: Record<string, number>) => {
                const nuevoHistorial = [...arr, { time: ahora, value }];
                return nuevoHistorial.filter(
                    (punto) => ahora - punto.time < MAX_HISTORIAL_MS
                );
            };

            return {
                corriente: append(prev.corriente, {
                    L1: getNumericValue(gen?.corriente_L1) || 0,
                    L2: getNumericValue(gen?.corriente_L2) || 0,
                    L3: getNumericValue(gen?.corriente_L3) || 0,
                    Promedio: getNumericValue(gen?.promedio_corrientes) || 0,
                }),
                voltaje: append(prev.voltaje, {
                    "L1-N": getNumericValue(gen?.voltage_L1_N) || 0,
                    "L2-N": getNumericValue(gen?.voltage_L2_N) || 0,
                    "L3-N": getNumericValue(gen?.voltage_L3_N) || 0,
                    Promedio: getNumericValue(gen?.promedio_voltajes) || 0,
                }),
            };
        });

        setDeltaBuffer((prev) => {
            const deltaL1 = getNumericValue(gen?.delta_L1_barra);
            const deltaL2 = getNumericValue(gen?.delta_L2_barra);
            const deltaL3 = getNumericValue(gen?.delta_L3_barra);

            const next: DeltaPoint[] = [
                ...prev,
                {
                    time: ahora,
                    delta_L1_barra: deltaL1,
                    delta_L2_barra: deltaL2,
                    delta_L3_barra: deltaL3,
                },
            ];
            return next.filter((p) => ahora - p.time < MAX_HISTORIAL_MS);
        });
    }, []);

    useEffect(() => {
        const WEBSOCKET_URL =
            process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
            "wss://657pcrk382.execute-api.us-east-1.amazonaws.com/production/";

        let ws: WebSocket | null = null;
        let reconnectTimer: NodeJS.Timeout | null = null;

        const connectWebSocket = () => {
            ws = new WebSocket(WEBSOCKET_URL);

            ws.onopen = () => {
                reconnectAttempts.current = 0;
                setConnected(true);
                setError(null);
                console.log("✅ WebSocket Context conectado");
            };

            ws.onclose = () => {
                setConnected(false);
                if (reconnectAttempts.current < MAX_RECONNECTIONS) {
                    reconnectAttempts.current += 1;
                    reconnectTimer = setTimeout(connectWebSocket, 3000);
                } else {
                    setError("Conexión fallida: límite de reconexiones");
                }
            };

            ws.onerror = (err) => {
                console.error("❌ Error en WebSocket Context:", err);
                setError("Error de conexión WebSocket");
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg && msg.type === "control") return; // Ignorar mensajes de control

                    const casted = msg as IoTMessage & { subsystem?: string };

                    if (casted.subsystem && casted.subsystem !== "generator") return;
                    if (!casted.subsystem && casted.data && 'cylinders' in casted.data) return;

                    messageCount.current++;
                    console.log(`✅ Mensaje #${messageCount.current} en contexto`);
                    setData(casted);
                    setLastUpdate(new Date());
                    updateBuffer(casted);
                } catch (err) {
                    console.error("⚠️ Error parseando mensaje en Context:", err);
                }
            };
        };

        connectWebSocket();

        return () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (ws) ws.close();
        };
    }, [updateBuffer]);

    return (
        <IoTDataContext.Provider value={{ data, buffer, deltaBuffer, connected, lastUpdate, error }}>
            {children}
        </IoTDataContext.Provider>
    );
};

export const useIoTData = () => {
    const context = useContext(IoTDataContext);
    if (context === undefined) {
        throw new Error("useIoTData must be used within an IoTDataProvider");
    }
    return context;
};
