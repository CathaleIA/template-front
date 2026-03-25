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

    const handleMessage = useCallback((msg: unknown) => {
        const m = msg as Record<string, unknown>;

        // Solo mensajes con la nueva estructura
        if (!m.tags || !Array.isArray(m.tags)) return;
        if (!m.generador || !m.grupo) return;

        const generador = m.generador as string;
        const grupo = m.grupo as string;
        const tagArray = m.tags as Array<{
            displayName: string;
            value: string;
            quality: string;
            opcTimestamp: number;
        }>;

        setTags((prev) => {
            const next = { ...prev };
            if (!next[generador]) next[generador] = {};
            if (!next[generador][grupo]) next[generador][grupo] = {};

            const grupoData = { ...next[generador][grupo] };
            for (const tag of tagArray) {
                grupoData[tag.displayName] = {
                    value: tag.value,
                    quality: tag.quality,
                    opcTimestamp: tag.opcTimestamp,
                };
            }
            next[generador] = { ...next[generador], [grupo]: grupoData };
            return next;
        });

        setLastUpdate(prev => {
            const now = Date.now();
            // Solo actualizar si han pasado más de 500ms (evita re-renders excesivos)
            if (prev && now - prev.getTime() < 500) return prev;
            return new Date(now);
        });
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
