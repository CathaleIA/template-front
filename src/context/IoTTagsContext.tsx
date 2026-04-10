"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";

export interface TagValue {
    value: string;
    quality: string;
    opcTimestamp: number;
}

// { generador -> { grupo -> { displayName -> TagValue } } }
export type TagsState = Record<string, Record<string, Record<string, TagValue>>>;

interface IoTTagsContextType {
    tags: TagsState;
    connected: boolean;
    lastUpdate: Date | null;
    error: string | null;
}

const IoTTagsContext = createContext<IoTTagsContextType | undefined>(undefined);

const MAX_RECONNECTIONS = 5;

export const IoTTagsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [tags, setTags] = useState<TagsState>({});
    const [connected, setConnected] = useState(false);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
    const [error, setError] = useState<string | null>(null);

    // Cargar cache después del montaje (evita hydration mismatch con SSR)
    useEffect(() => {
        try {
            const stored = localStorage.getItem("iot_tags_cache");
            if (stored) setTags(JSON.parse(stored));
        } catch { /* ignore */ }
    }, []);

    useEffect(() => {
        try { localStorage.setItem("iot_tags_cache", JSON.stringify(tags)); } catch { /* quota */ }
    }, [tags]);

    const reconnectAttempts = useRef(0);

    // Buffer pending updates; flush once per event-loop tick to avoid
    // triggering "Maximum update depth exceeded" on rapid WebSocket bursts.
    const pendingRef = useRef<TagsState>({});
    const flushScheduledRef = useRef(false);

    const handleMessage = useCallback((msg: unknown) => {
        const m = msg as Record<string, unknown>;

        // Solo mensajes con la nueva estructura
        if (!m.tags || !Array.isArray(m.tags)) return;
        if (!m.generador || !m.grupo) return;

        // Normalizar: minúsculas + guiones bajos → guiones (ej: Generador_51 → generador-51)
        const generador = (m.generador as string).toLowerCase().replace(/_/g, "-");
        const grupo = m.grupo as string;
        const tagArray = m.tags as Array<{
            displayName: string;
            value: string;
            quality: string;
            opcTimestamp: number;
        }>;

        // Accumulate into pending buffer
        if (!pendingRef.current[generador]) pendingRef.current[generador] = {};
        if (!pendingRef.current[generador][grupo]) pendingRef.current[generador][grupo] = {};
        for (const tag of tagArray) {
            pendingRef.current[generador][grupo][tag.displayName] = {
                value: tag.value,
                quality: tag.quality,
                opcTimestamp: tag.opcTimestamp,
            };
        }

        // Schedule a single flush per tick
        if (!flushScheduledRef.current) {
            flushScheduledRef.current = true;
            setTimeout(() => {
                flushScheduledRef.current = false;
                const pending = pendingRef.current;
                pendingRef.current = {};

                setTags(prev => {
                    const next = { ...prev };
                    for (const gen of Object.keys(pending)) {
                        next[gen] = { ...next[gen] };
                        for (const grp of Object.keys(pending[gen])) {
                            next[gen][grp] = { ...next[gen]?.[grp], ...pending[gen][grp] };
                        }
                    }
                    return next;
                });

                setLastUpdate(new Date());
            }, 0);
        }
    }, []);

    useEffect(() => {
        const WEBSOCKET_URL =
            process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
            "wss://657pcrk382.execute-api.us-east-1.amazonaws.com/production/";

        let ws: WebSocket | null = null;
        let reconnectTimer: NodeJS.Timeout | null = null;

        const connect = () => {
            ws = new WebSocket(WEBSOCKET_URL);

            ws.onopen = () => {
                reconnectAttempts.current = 0;
                setConnected(true);
                setError(null);
            };

            ws.onclose = () => {
                setConnected(false);
                if (reconnectAttempts.current < MAX_RECONNECTIONS) {
                    reconnectAttempts.current += 1;
                    reconnectTimer = setTimeout(connect, 3000);
                } else {
                    setError("Conexión fallida: límite de reconexiones");
                }
            };

            ws.onerror = () => setError("Error de conexión WebSocket");

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg?.type === "control") return;
                    handleMessage(msg);
                } catch {
                    // ignore parse errors
                }
            };
        };

        connect();

        return () => {
            if (reconnectTimer) clearTimeout(reconnectTimer);
            if (ws) ws.close();
        };
    }, [handleMessage]);

    return (
        <IoTTagsContext.Provider value={{ tags, connected, lastUpdate, error }}>
            {children}
        </IoTTagsContext.Provider>
    );
};

export const useIoTTags = () => {
    const context = useContext(IoTTagsContext);
    if (!context) throw new Error("useIoTTags must be used within IoTTagsProvider");
    return context;
};
