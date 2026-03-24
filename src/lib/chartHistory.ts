// IndexedDB-backed chart history — persists up to 12 h across page reloads
// With optional S3 bootstrap via Lambda for initial 12h load

const DB_NAME = "iot-chart-history";
const DB_VER  = 1;
export const MAX_AGE_MS = 12 * 60 * 60 * 1000; // 12 hours

// Lambda API endpoint for loading 12h history from S3
// Set this to your API Gateway URL once deployed
export const S3_HISTORY_API = process.env.NEXT_PUBLIC_S3_HISTORY_API || "";

export type HistoryRow = { t: number; values: number[] };

let _db: Promise<IDBDatabase> | null = null;
let _s3LoadedCharts = new Set<string>();  // Track which charts were loaded from S3

function openDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === "undefined") return Promise.reject("no-idb");
    if (_db) return _db;
    _db = new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(DB_NAME, DB_VER);
        r.onupgradeneeded = () => {
            const store = r.result.createObjectStore("pts", { keyPath: ["c", "t"] });
            store.createIndex("ct", ["c", "t"]);
        };
        r.onsuccess = () => res(r.result);
        r.onerror   = () => { _db = null; rej(r.error); };
    });
    return _db;
}

/** Append a row and prune entries older than 12 h for the given chart. */
export async function appendChartRow(
    chart: string,
    t: number,
    values: number[],
): Promise<void> {
    try {
        const db = await openDB();
        await new Promise<void>((res, rej) => {
            const tx    = db.transaction("pts", "readwrite");
            const store = tx.objectStore("pts");
            store.put({ c: chart, t, values });

            // Delete rows older than MAX_AGE_MS for this chart
            const cutoff = t - MAX_AGE_MS;
            const pruneReq = store.index("ct").openCursor(
                IDBKeyRange.bound([chart, 0], [chart, cutoff]),
            );
            pruneReq.onsuccess = (e) => {
                const cur = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (cur) { cur.delete(); cur.continue(); }
            };

            tx.oncomplete = () => res();
            tx.onerror    = () => rej(tx.error);
        });
    } catch { /* quota exceeded or unavailable — ignore */ }
}

/** Load from S3 via Lambda and populate IndexedDB (one-time per session per chart) */
async function loadFromS3AndSync(chart: string): Promise<HistoryRow[]> {
    if (!S3_HISTORY_API || _s3LoadedCharts.has(chart)) {
        return [];  // Already loaded or no API configured
    }

    try {
        const response = await fetch(S3_HISTORY_API, { method: "GET" });
        if (!response.ok) return [];

        const allData: Record<string, HistoryRow[]> = await response.json();
        const rows = allData[chart] || [];

        if (rows.length === 0) return [];

        // Sync to IndexedDB for future loads
        const db = await openDB();
        await new Promise<void>((res, rej) => {
            const tx = db.transaction("pts", "readwrite");
            const store = tx.objectStore("pts");

            rows.forEach((row) => {
                store.put({ c: chart, t: row.t, values: row.values });
            });

            tx.oncomplete = () => res();
            tx.onerror = () => rej(tx.error);
        });

        _s3LoadedCharts.add(chart);
        return rows;
    } catch {
        return [];
    }
}

/** Load up to 12 h of history for the given chart, sorted by time. */
export async function loadChartHistory(chart: string): Promise<HistoryRow[]> {
    try {
        // Try S3 first (only once per session)
        const s3Rows = await loadFromS3AndSync(chart);
        if (s3Rows.length > 0) {
            return s3Rows;
        }

        // Fall back to IndexedDB
        const db     = await openDB();
        const cutoff = Date.now() - MAX_AGE_MS;
        return await new Promise<HistoryRow[]>((res, rej) => {
            const tx  = db.transaction("pts", "readonly");
            const req = tx.objectStore("pts").index("ct").getAll(
                IDBKeyRange.bound([chart, cutoff], [chart, Infinity]),
            );
            req.onsuccess = () =>
                res(
                    (req.result as Array<{ c: string; t: number; values: number[] }>).map(
                        (r) => ({ t: r.t, values: r.values }),
                    ),
                );
            req.onerror = () => rej(req.error);
        });
    } catch {
        return [];
    }
}
