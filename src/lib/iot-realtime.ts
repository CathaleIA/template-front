/**
 * Server-side WebSocket cache for real-time IoT data.
 * Connects to the IoT WebSocket API Gateway and keeps the latest
 * tag values in memory so Bedrock can answer real-time queries.
 *
 * Message format received from WebSocket:
 *   { generador: string, grupo: string, tags: [{displayName, value, quality, opcTimestamp}] }
 */

// ws is a transitive dependency of mqtt (already in package.json)
import WebSocket from 'ws';

interface TagValue {
    value: string;
    quality: string;
    opcTimestamp: number;
}

// tags[generador][grupo][displayName] = TagValue
type TagsState = Record<string, Record<string, Record<string, TagValue>>>;

// Use globalThis so the cache survives Next.js hot-reloads
declare global {
    var __iotTagsCache: TagsState | undefined;
    var __iotLastUpdate: Date | null | undefined;
    var __iotWsConnection: WebSocket | null | undefined;
    var __iotReconnectTimer: NodeJS.Timeout | null | undefined;
}

if (!global.__iotTagsCache) global.__iotTagsCache = {};
if (global.__iotLastUpdate === undefined) global.__iotLastUpdate = null;
if (global.__iotWsConnection === undefined) global.__iotWsConnection = null;
if (global.__iotReconnectTimer === undefined) global.__iotReconnectTimer = null;

const WEBSOCKET_URL =
    process.env.NEXT_PUBLIC_WEBSOCKET_URL ||
    'wss://657pcrk382.execute-api.us-east-1.amazonaws.com/production/';

function connectToWebSocket() {
    if (global.__iotWsConnection?.readyState === WebSocket.OPEN) return;

    console.log('🔌 [IoT Cache] Connecting to WebSocket...');
    const ws = new WebSocket(WEBSOCKET_URL);
    global.__iotWsConnection = ws;

    ws.on('open', () => {
        console.log('✅ [IoT Cache] WebSocket connected');
        if (global.__iotReconnectTimer) {
            clearTimeout(global.__iotReconnectTimer);
            global.__iotReconnectTimer = null;
        }
    });

    ws.on('message', (data: WebSocket.Data) => {
        try {
            const msg = JSON.parse(data.toString());

            // Skip control/ping messages
            if (msg.type) return;

            // Require the new tag structure
            if (!msg.generador || !msg.grupo || !Array.isArray(msg.tags)) return;

            const generador = msg.generador as string;
            const grupo = msg.grupo as string;
            const tagArray = msg.tags as Array<{
                displayName: string;
                value: string;
                quality: string;
                opcTimestamp: number;
            }>;

            if (!global.__iotTagsCache![generador]) global.__iotTagsCache![generador] = {};
            if (!global.__iotTagsCache![generador][grupo]) global.__iotTagsCache![generador][grupo] = {};

            for (const tag of tagArray) {
                if (!tag.displayName) continue;
                global.__iotTagsCache![generador][grupo][tag.displayName] = {
                    value: tag.value,
                    quality: tag.quality,
                    opcTimestamp: tag.opcTimestamp,
                };
            }

            global.__iotLastUpdate = new Date();
        } catch (e) {
            console.error('❌ [IoT Cache] Error parsing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('🔌 [IoT Cache] Disconnected. Reconnecting in 5s...');
        global.__iotWsConnection = null;
        if (!global.__iotReconnectTimer) {
            global.__iotReconnectTimer = setTimeout(connectToWebSocket, 5000);
        }
    });

    ws.on('error', (e) => console.error('❌ [IoT Cache] WebSocket error:', e));
}

// Key groups we want to be populated before returning data
// AGC_4 contains electrical measurements (currents, voltages, power)
const REQUIRED_GROUPS: Array<[string, string]> = [
    ['Generador_55', 'AGC_4'],
];

function hasRequiredGroups(): boolean {
    for (const [gen, grupo] of REQUIRED_GROUPS) {
        const g = global.__iotTagsCache?.[gen]?.[grupo];
        if (!g || Object.keys(g).length === 0) return false;
    }
    return true;
}

/**
 * Returns the latest IoT state from the WebSocket cache.
 * Waits up to `maxWaitMs` for all required groups (including AGC_4)
 * to be populated before returning.
 */
export async function getLatestRealtimeData(maxWaitMs = 6000): Promise<{
    tags: TagsState;
    lastUpdate: Date | null;
    hasData: boolean;
}> {
    // Ensure connection is alive
    if (!global.__iotWsConnection || global.__iotWsConnection.readyState !== WebSocket.OPEN) {
        connectToWebSocket();
    }

    // Wait until required groups (AGC_4 etc.) are in the cache
    const interval = 500;
    let waited = 0;
    while (!hasRequiredGroups() && waited < maxWaitMs) {
        await new Promise((r) => setTimeout(r, interval));
        waited += interval;
    }

    if (!hasRequiredGroups()) {
        console.warn('⚠️ [IoT Cache] AGC_4 group not received within timeout — returning partial cache');
    }

    return {
        tags: global.__iotTagsCache!,
        lastUpdate: global.__iotLastUpdate ?? null,
        hasData: Object.keys(global.__iotTagsCache!).length > 0,
    };
}

/**
 * Formats the cached IoT state as a readable text block for Bedrock.
 * Example output:
 *   generador_55 — Global:
 *     Presion_aceite = 4.41
 *     Tem_cyl_1 = 546.95
 *   ...
 */
export function formatRealtimeContext(tags: TagsState, lastUpdate: Date | null): string {
    const lines: string[] = [];
    const ts = lastUpdate
        ? lastUpdate.toLocaleString('es-CO', { timeZone: 'America/Bogota' })
        : 'desconocida';

    lines.push(`[DATOS EN TIEMPO REAL — ${ts} hora Colombia]`);
    lines.push('Fuente: WebSocket IoT (mismo canal que el dashboard)');
    lines.push('');

    for (const [generador, grupos] of Object.entries(tags)) {
        for (const [grupo, displayNames] of Object.entries(grupos)) {
            lines.push(`${generador} — ${grupo}:`);
            for (const [displayName, tv] of Object.entries(displayNames)) {
                if (tv.quality === 'Good') {
                    lines.push(`  ${displayName} = ${tv.value}`);
                }
            }
            lines.push('');
        }
    }

    return lines.join('\n');
}

// Auto-connect when this module is loaded on the server
if (typeof window === 'undefined') {
    connectToWebSocket();
}
