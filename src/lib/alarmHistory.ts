// IndexedDB-backed alarm event history — persists across page reloads
// Keeps events from the last 24 h per generator, max 500 per generator

const DB_NAME = "iot-alarm-history";
const DB_VER  = 1;
const MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours
export const MAX_EVENTS = 500;

export interface AlarmEvent {
    id?:        number;              // autoincrement PK
    ts:         number;              // Unix ms
    genId:      string;
    tag:        string;
    category:   string;
    severity:   "shutdown" | "warning" | "info";
    transition: "onset" | "cleared";
}

let _db: Promise<IDBDatabase> | null = null;

function openDB(): Promise<IDBDatabase> {
    if (typeof indexedDB === "undefined") return Promise.reject("no-idb");
    if (_db) return _db;
    _db = new Promise<IDBDatabase>((res, rej) => {
        const r = indexedDB.open(DB_NAME, DB_VER);
        r.onupgradeneeded = () => {
            const db = r.result;
            if (!db.objectStoreNames.contains("events")) {
                const store = db.createObjectStore("events", { keyPath: "id", autoIncrement: true });
                store.createIndex("genId_ts", ["genId", "ts"]);
                store.createIndex("genId",    "genId");
            }
        };
        r.onsuccess = () => res(r.result);
        r.onerror   = () => { _db = null; rej(r.error); };
    });
    return _db;
}

/** Append an alarm transition event and prune entries older than 24 h for this genId. */
export async function appendAlarmEvent(event: Omit<AlarmEvent, "id">): Promise<void> {
    try {
        const db = await openDB();
        await new Promise<void>((res, rej) => {
            const tx    = db.transaction("events", "readwrite");
            const store = tx.objectStore("events");
            store.add(event);

            // Prune events older than MAX_AGE_MS for this generator
            const cutoff = event.ts - MAX_AGE_MS;
            const pruneReq = store.index("genId_ts").openCursor(
                IDBKeyRange.bound([event.genId, 0], [event.genId, cutoff]),
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

/** Load all alarm events for a genId, newest first. */
export async function loadAlarmEvents(genId: string): Promise<AlarmEvent[]> {
    try {
        const db = await openDB();
        return await new Promise<AlarmEvent[]>((res, rej) => {
            const tx    = db.transaction("events", "readonly");
            const store = tx.objectStore("events");
            const req   = store.index("genId").getAll(genId);
            req.onsuccess = () => {
                const sorted = (req.result as AlarmEvent[]).sort((a, b) => b.ts - a.ts);
                res(sorted.slice(0, MAX_EVENTS));
            };
            req.onerror = () => rej(req.error);
        });
    } catch {
        return [];
    }
}

/** Delete all alarm events for specific tags within a genId. */
export async function deleteAlarmEventsByTag(genId: string, tags: string[]): Promise<void> {
    if (tags.length === 0) return;
    const tagSet = new Set(tags);
    try {
        const db = await openDB();
        await new Promise<void>((res, rej) => {
            const tx    = db.transaction("events", "readwrite");
            const store = tx.objectStore("events");
            const req   = store.index("genId").openCursor(IDBKeyRange.only(genId));
            req.onsuccess = (e) => {
                const cur = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (cur) {
                    if (tagSet.has((cur.value as AlarmEvent).tag)) cur.delete();
                    cur.continue();
                }
            };
            tx.oncomplete = () => res();
            tx.onerror    = () => rej(tx.error);
        });
    } catch { /* ignore */ }
}

/** Delete all alarm events for a genId. */
export async function clearAlarmEvents(genId: string): Promise<void> {
    try {
        const db = await openDB();
        await new Promise<void>((res, rej) => {
            const tx    = db.transaction("events", "readwrite");
            const store = tx.objectStore("events");
            const req   = store.index("genId").openCursor(IDBKeyRange.only(genId));
            req.onsuccess = (e) => {
                const cur = (e.target as IDBRequest<IDBCursorWithValue>).result;
                if (cur) { cur.delete(); cur.continue(); }
            };
            tx.oncomplete = () => res();
            tx.onerror    = () => rej(tx.error);
        });
    } catch { /* ignore */ }
}
