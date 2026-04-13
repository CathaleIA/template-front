"use client";

import { useEffect, useState, useCallback, useRef, useMemo } from "react";

/* ═══════════════════════════════════════════════════════════════
   Capability Curve — Diagrama P–Q  (Industrial SCADA)
   Semi-ellipse MVA envelope · Bézier operating silhouette ·
   Green 37° sector · Concentric ellipses · Radial cos φ lines ·
   Animated operating point · Theme-aware (light / dark).
   ═══════════════════════════════════════════════════════════════ */

interface CapabilityCurveProps {
    activePowerKw?: number | null;
    reactivePowerKvar?: number | null;
    ratedKva?: number;
}

/* ── Layout ───────────────────────────────────────────────────── */
const VW = 860, VH = 420;
const ML = 55, MT = 20, MR = 30, MB = 42;
const PW = VW - ML - MR;   // 775
const PH = VH - MT - MB;   // 358
const Q_LO = -1.18, Q_HI = 1.18;
const P_LO = -0.06, P_HI = 1.12;
const MAX_TRAIL = 25;
const DEG = Math.PI / 180;

/* ── Coordinate mapping (data → SVG px) ──────────────────────── */
const mx = (q: number) => ML + ((q - Q_LO) / (Q_HI - Q_LO)) * PW;
const my = (p: number) => MT + PH - ((p - P_LO) / (P_HI - P_LO)) * PH;

/* ── Path generators ──────────────────────────────────────────── */
function ellipsePath(r: number, n = 100): string {
    const pts: string[] = [];
    for (let i = 0; i <= n; i++) {
        const θ = Math.PI - (Math.PI * i) / n;
        pts.push(`${mx(Math.cos(θ) * r).toFixed(1)},${my(Math.sin(θ) * r).toFixed(1)}`);
    }
    return "M" + pts.join(" L");
}

function sectorPath(deg1: number, deg2: number, r: number, n = 50): string {
    let d = `M${mx(0).toFixed(1)},${my(0).toFixed(1)}`;
    for (let i = 0; i <= n; i++) {
        const θ = (deg1 + ((deg2 - deg1) * i) / n) * DEG;
        d += ` L${mx(Math.cos(θ) * r).toFixed(1)},${my(Math.sin(θ) * r).toFixed(1)}`;
    }
    return d + " Z";
}

/* ── Operating-area Bézier silhouette ─────────────────────────── *
 * Control points computed to match reference canvas shape:
 * (-0.22,0) → (-0.25,0.1) → (-0.24,0.97) → (0.6,0.8) → (0.84,0)  */
type V2 = [number, number];
const SEG: [V2, V2, V2, V2][] = [
    [[-0.22, 0], [-0.22, 0.03], [-0.245, 0.065], [-0.25, 0.1]],
    [[-0.25, 0.1], [-0.19, 0.35], [-0.17, 0.72], [-0.24, 0.97]],
    [[-0.24, 0.97], [-0.02, 1.06], [0.38, 0.99], [0.6, 0.8]],
    [[0.6, 0.8], [0.72, 0.6], [0.853, 0.2], [0.84, 0]],
];

function bezierD(segs: typeof SEG): string {
    let d = `M${mx(segs[0][0][0]).toFixed(1)},${my(segs[0][0][1]).toFixed(1)}`;
    for (const s of segs)
        d += ` C${mx(s[1][0]).toFixed(1)},${my(s[1][1]).toFixed(1)} ${mx(s[2][0]).toFixed(1)},${my(s[2][1]).toFixed(1)} ${mx(s[3][0]).toFixed(1)},${my(s[3][1]).toFixed(1)}`;
    return d + " Z";
}

function cBez(t: number, a: V2, b: V2, c: V2, d: V2): V2 {
    const u = 1 - t;
    return [
        u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * c[0] + t * t * t * d[0],
        u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * c[1] + t * t * t * d[1],
    ];
}
function samplePoly(segs: typeof SEG, n = 20): V2[] {
    const pts: V2[] = [];
    for (const s of segs)
        for (let i = 0; i <= n; i++) pts.push(cBez(i / n, s[0], s[1], s[2], s[3]));
    pts.push([-0.22, 0]);
    return pts;
}
function pip(qx: number, py: number, poly: V2[]): boolean {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i], [xj, yj] = poly[j];
        if ((yi > py) !== (yj > py) && qx < ((xj - xi) * (py - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
}

/* ── Pre-compute static paths ─────────────────────────────────── */
const SILHOUETTE = bezierD(SEG);
const POLY = samplePoly(SEG);
const ELLIPSE_1 = ellipsePath(1);
const ELLIPSES = Array.from({ length: 10 }, (_, i) => ({
    r: (i + 1) / 10,
    d: ellipsePath((i + 1) / 10),
}));
const GREEN_SECTOR = sectorPath(53, 90, 1);

/* ── Radial / diagonal line definitions ───────────────────────── */
const LEFT_RADIALS = Array.from({ length: 9 }, (_, i) => ({
    deg: 180 - i * 11.25, lbl: (i * 0.1).toFixed(1), hi: i === 0 || i === 8,
}));
const RIGHT_DIAGS: { deg: number; lbl: string; hi: boolean }[] = [
    ...Array.from({ length: 8 }, (_, i) => ({
        deg: i * 7.5, lbl: ((i + 1) * 0.1).toFixed(1), hi: i === 0 || i === 7,
    })),
    { deg: 63, lbl: "0.9", hi: false },
    { deg: 72, lbl: "0.95", hi: false },
];

/* ── Tick / grid arrays ───────────────────────────────────────── */
const Q_TICKS = Array.from({ length: 11 }, (_, i) => -1 + i * 0.2);
const P_TICKS = [0, 0.2, 0.4, 0.6, 0.8, 1.0];
const Q_GRID = Array.from({ length: 21 }, (_, i) => -1 + i * 0.1);
const P_GRID = Array.from({ length: 11 }, (_, i) => i * 0.1);

/* ── Theme palette ────────────────────────────────────────────── */
function pal(dk: boolean) {
    return dk ? {
        bg: "#111827",
        plotBg: "#0d1520",
        dotPat: "rgba(96,165,250,0.07)",
        corner: "#3b82f6",
        envS: "#3b82f6", envF: "rgba(59,130,246,0.06)", envGl: "#3b82f6", envGO: 0,
        silF: "rgba(251,113,20,0.30)", silS: "rgba(234,88,12,0.85)",
        grn: "rgba(22,163,74,0.82)",
        gD: "rgba(148,163,184,0.08)", gE: "rgba(148,163,184,0.22)",
        rL: "rgba(148,163,184,0.18)", rB: "rgba(148,163,184,0.55)", rT: "#94a3b8",
        ax: "#64748b", lb: "#94a3b8", tt: "#e2e8f0",
        oD: "#f59e0b", oG: "#d97706", oTr: "#f59e0b", ok: "#22c55e", wn: "#ef4444",
        bBg: "rgba(15,23,42,0.97)", bTx: "#cbd5e1", bBd: "#3b82f6",
        hud: "#475569", on: "#22c55e",
        lBg: "rgba(15,23,42,0.95)", lBd: "rgba(71,85,105,0.40)",
        rgn: "rgba(148,163,184,0.35)",
        ticker: "#1e293b",
        nom: "rgba(59,130,246,0.55)",
        hdrBg: "#0f172a",
        ftBg: "#0f172a",
    } : {
        bg: "#f1f5f9",
        plotBg: "#e9eef7",
        dotPat: "rgba(30,64,175,0.08)",
        corner: "#1d4ed8",
        envS: "#1d4ed8", envF: "rgba(29,78,216,0.06)", envGl: "#1d4ed8", envGO: 0,
        silF: "rgba(194,65,12,0.22)", silS: "rgba(154,52,18,0.82)",
        grn: "rgba(21,128,61,0.78)",
        gD: "rgba(30,64,175,0.09)", gE: "rgba(30,64,175,0.30)",
        rL: "rgba(30,64,175,0.22)", rB: "rgba(30,64,175,0.68)", rT: "#1e40af",
        ax: "#1e3a8a", lb: "#1e3a8a", tt: "#0f172a",
        oD: "#b45309", oG: "#d97706", oTr: "#b45309", ok: "#15803d", wn: "#b91c1c",
        bBg: "rgba(241,245,249,0.98)", bTx: "#0f172a", bBd: "#1d4ed8",
        hud: "#475569", on: "#15803d",
        lBg: "rgba(236,244,255,0.97)", lBd: "rgba(30,64,175,0.28)",
        rgn: "rgba(30,64,175,0.28)",
        ticker: "#cbd5e1",
        nom: "rgba(29,78,216,0.55)",
        hdrBg: "#dde6f5",
        ftBg: "#dde6f5",
    };
}

/* ═════════════════════════════════════════════════════════════════
   Component
   ═════════════════════════════════════════════════════════════════ */
export default function CapabilityCurve({
    activePowerKw = null,
    reactivePowerKvar = null,
    ratedKva = 1500,
}: CapabilityCurveProps) {
    const [isDark, setIsDark] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const trailRef = useRef<{ x: number; y: number }[]>([]);
    const [trail, setTrail] = useState<{ x: number; y: number }[]>([]);

    const detect = useCallback(() => setIsDark(document.documentElement.classList.contains("dark")), []);
    useEffect(() => {
        detect();
        const obs = new MutationObserver(detect);
        obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
        return () => obs.disconnect();
    }, [detect]);
    useEffect(() => { const id = requestAnimationFrame(() => setLoaded(true)); return () => cancelAnimationFrame(id); }, []);

    /* Per-unit */
    const pPu = activePowerKw != null ? activePowerKw / ratedKva : null;
    const qPu = reactivePowerKvar != null ? reactivePowerKvar / ratedKva : null;
    const has = pPu != null && qPu != null;
    const sPu = has ? Math.sqrt(pPu! ** 2 + qPu! ** 2) : null;
    const cosP = has && sPu! > 0.001 ? Math.abs(pPu! / sPu!) : null;
    const inZ = has ? pip(qPu!, pPu!, POLY) : false;

    useEffect(() => {
        if (pPu == null || qPu == null) return;
        const sx = mx(qPu), sy = my(pPu);
        const t = trailRef.current;
        const last = t[t.length - 1];
        if (!last || Math.abs(last.x - sx) > 0.5 || Math.abs(last.y - sy) > 0.5) {
            t.push({ x: sx, y: sy });
            if (t.length > MAX_TRAIL) t.shift();
            setTrail([...t]);
        }
    }, [pPu, qPu]);

    const opX = qPu != null ? mx(qPu) : 0;
    const opY = pPu != null ? my(pPu) : 0;
    const C = useMemo(() => pal(isDark), [isDark]);
    const fade = (d: number) => `transition-opacity duration-${d} ${loaded ? "opacity-100" : "opacity-0"}`;

    /* Angle φ (from P-axis towards Q) */
    const phiDeg = has ? Math.atan2(qPu!, pPu!) * (180 / Math.PI) : null;
    const phiRad = has ? Math.atan2(qPu!, pPu!) : null;

    /* Arc path for φ angle indicator (from P-axis = 90° SVG to operating point direction) */
    const angleArc = useMemo(() => {
        if (!has || phiRad == null || pPu == null || qPu == null) return null;
        const arcR = 38; // px radius for the arc
        const startAngle = 90 * DEG; // P-axis (vertical up = 90° in data space)
        const opAngle = Math.atan2(qPu!, pPu!); // angle from P-axis toward Q
        // SVG arc: from P-axis (straight up) sweeping toward Q
        // In SVG coords: P-axis up → angle 0 is at (0, -arcR) from origin
        const ox = mx(0), oy = my(0);
        const x1 = ox + 0; // straight up on P-axis
        const y1 = oy - arcR;
        // End point: rotate by φ from P-axis
        const x2 = ox + Math.sin(opAngle) * arcR; // Q direction
        const y2 = oy - Math.cos(opAngle) * arcR; // P direction (inverted Y)
        const sweep = opAngle >= 0 ? 1 : 0;
        const largeArc = Math.abs(opAngle) > Math.PI ? 1 : 0;
        // Label position at midpoint of arc
        const midAngle = opAngle / 2;
        const lblR = arcR + 14;
        const lx = ox + Math.sin(midAngle) * lblR;
        const ly = oy - Math.cos(midAngle) * lblR;
        const sectorD = `M${ox.toFixed(1)},${oy.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)} A${arcR},${arcR} 0 ${largeArc},${sweep} ${x2.toFixed(1)},${y2.toFixed(1)} Z`;
        return { x1, y1, x2, y2, arcR, sweep, largeArc, lx, ly, sectorD };
    }, [has, phiRad, pPu, qPu]);

    /* Memoize static grid elements */
    const gridLines = useMemo(() => ({
        qLines: Q_GRID.filter(q => q >= -1 && q <= 1).map(q => ({ q, x: mx(q) })),
        pLines: P_GRID.filter(p => p > 0 && p <= 1).map(p => ({ p, y: my(p) })),
    }), []);
    const tickMarks = useMemo(() => ({
        qTicks: Q_TICKS.map(q => ({ q, x: mx(q) })),
        pTicks: P_TICKS.filter(p => p > 0).map(p => ({ p, y: my(p) })),
    }), []);

    return (
        <div className="relative w-full h-full flex flex-col overflow-hidden rounded-lg"
             style={{ background: C.bg, border: `1px solid ${C.lBd}` }}>

            {/* ── Header strip ───────────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-2 shrink-0"
                 style={{ background: C.hdrBg, borderBottom: `1.5px solid ${C.ticker}` }}>
                <div className="flex items-center gap-3">
                    <div className="w-1 h-5 rounded-full" style={{ background: C.corner }} />
                    <div>
                        <div className="text-base font-mono font-bold tracking-widest uppercase leading-tight"
                             style={{ color: C.tt }}>Curva de Capacidad P–Q</div>
                        <div className="text-[12px] font-mono tracking-[0.15em] mt-0.5"
                             style={{ color: `${C.hud}99` }}>SCADA · IEC 60034 · Sₙ {ratedKva.toLocaleString('en-US')} kVA</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 text-[13px] font-mono font-bold px-2.5 py-1 rounded"
                     style={{
                         color: has ? C.ok : C.hud,
                         background: has ? `${C.ok}10` : `${C.hud}0a`,
                         border: `1px solid ${has ? C.ok : C.hud}30`,
                     }}>
                    <span className="inline-block w-2 h-2 rounded-full shrink-0"
                          style={{
                              background: has ? C.ok : C.hud,
                              boxShadow: has ? `0 0 6px ${C.ok}88` : 'none',
                          }} />
                    {has ? 'EN LÍNEA' : 'SIN DATOS'}
                </div>
            </div>


            {/* ── Chart canvas + SCADA sidebar ───────────────────── */}
            <div className="flex-1 min-h-0 flex flex-row overflow-hidden">

            {/* SVG chart */}
            <div className="flex-1 min-w-0 relative">
            <svg viewBox={`0 0 ${VW} ${VH}`}
                 className="w-full h-full select-none"
                 preserveAspectRatio="xMidYMid meet"
                 shapeRendering="geometricPrecision">
                <defs>
                    <filter id="cc-ge"><feGaussianBlur stdDeviation="5" /></filter>
                    <filter id="cc-go"><feGaussianBlur stdDeviation="9" /></filter>
                    <filter id="cc-glow">
                        <feGaussianBlur stdDeviation="12" result="blur" />
                        <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                    </filter>
                    <clipPath id="cc-cp"><rect x={ML} y={MT} width={PW} height={PH} /></clipPath>
                    <pattern id="cc-dots" x={ML} y={MT} width="20" height="20" patternUnits="userSpaceOnUse">
                        <circle cx="10" cy="10" r="0.9" fill={C.dotPat} />
                    </pattern>
                    <linearGradient id="cc-sil-grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={C.silS} stopOpacity="0.52" />
                        <stop offset="100%" stopColor={C.silS} stopOpacity="0.06" />
                    </linearGradient>
                    <radialGradient id="cc-op-halo" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" stopColor={C.oD} stopOpacity="0.28" />
                        <stop offset="100%" stopColor={C.oD} stopOpacity="0" />
                    </radialGradient>
                    <radialGradient id="cc-env-glow" cx="50%" cy="50%" r="50%">
                        <stop offset="20%" stopColor={C.envGl} stopOpacity="0.12" />
                        <stop offset="100%" stopColor={C.envGl} stopOpacity="0" />
                    </radialGradient>
                </defs>
                <style>{`
                    @keyframes cc-pulse-ring {
                        0%,100% { transform: scale(1);    opacity: 0.45; }
                        50%     { transform: scale(2.6);  opacity: 0;    }
                    }
                    @keyframes cc-dot-beat {
                        0%,100% { transform: scale(1);   }
                        50%     { transform: scale(1.35); }
                    }
                    @keyframes cc-idle-ring {
                        0%,100% { transform: scale(1);   opacity: 0.30; }
                        50%     { transform: scale(2.0);  opacity: 0.04; }
                    }
                    @keyframes cc-idle-core {
                        0%,100% { transform: scale(1);   }
                        50%     { transform: scale(1.35); }
                    }
                    @keyframes cc-breathe {
                        0%,100% { opacity: 0.35; }
                        50%     { opacity: 0.62; }
                    }
                    @keyframes cc-envelope-draw {
                        from { stroke-dashoffset: 1800; }
                        to   { stroke-dashoffset: 0;    }
                    }
                    @keyframes cc-fade-in {
                        from { opacity: 0; }
                        to   { opacity: 1; }
                    }
                    @keyframes cc-panel-in {
                        from { opacity: 0; transform: translateY(-10px); }
                        to   { opacity: 1; transform: translateY(0px);   }
                    }
                    @keyframes cc-bracket-draw {
                        from { stroke-dashoffset: 42; opacity: 0;    }
                        to   { stroke-dashoffset: 0;  opacity: 0.60; }
                    }
                    .cc-pulse-ring   { transform-box: fill-box; transform-origin: center;
                        animation: cc-pulse-ring 2s ease-in-out infinite; }
                    .cc-dot-beat     { transform-box: fill-box; transform-origin: center;
                        animation: cc-dot-beat 1.5s ease-in-out infinite; }
                    .cc-idle-ring    { transform-box: fill-box; transform-origin: center;
                        animation: cc-idle-ring 2.5s ease-in-out infinite; }
                    .cc-idle-core    { transform-box: fill-box; transform-origin: center;
                        animation: cc-idle-core 2.5s ease-in-out infinite; }
                    .cc-breathe      { animation: cc-breathe 3.5s ease-in-out infinite; }
                    .cc-env-draw     { stroke-dasharray: 1800;
                        animation: cc-envelope-draw 1.6s cubic-bezier(0.4,0,0.2,1) 0.2s both; }
                    .cc-xh-v         { animation: cc-fade-in 0.45s ease-out both; }
                    .cc-xh-h         { animation: cc-fade-in 0.45s ease-out 0.18s both; }
                    .cc-panel-in     { transform-box: fill-box; transform-origin: top center;
                        animation: cc-panel-in 0.5s ease-out both; }
                    .cc-bracket-draw { stroke-dasharray: 42;
                        animation: cc-bracket-draw 0.6s ease-out both; }
                `}</style>

                {/* Plot background + dot matrix */}
                <rect x={ML} y={MT} width={PW} height={PH} fill={C.plotBg} />
                <rect x={ML} y={MT} width={PW} height={PH} fill="url(#cc-dots)" />

                <g clipPath="url(#cc-cp)">
                    {/* ── 1. Ellipse fill ──────────────────────── */}
                    <path d={ELLIPSE_1 + " Z"} fill={C.envF} className={fade(700)} />

                    {/* ── 2. Operating silhouette (soft red fill, green paints on top) ── */}
                    <path d={SILHOUETTE} fill={C.silF} stroke={C.silS} strokeWidth={2}
                          className={fade(600)} />

                    {/* ── 3. Green 37° sector ──────────────────── */}
                    <path d={GREEN_SECTOR} fill={C.grn} className="cc-breathe" />

                    {/* ── 4. Cartesian dashed grid ─────────────── */}
                    {gridLines.qLines.map(({ q, x }) => (
                        <line key={`gq${q}`} x1={x} y1={MT} x2={x} y2={MT + PH}
                              stroke={C.gD} strokeWidth={0.6} strokeDasharray="4 4" />
                    ))}
                    {gridLines.pLines.map(({ p, y }) => (
                        <line key={`gp${p}`} x1={ML} y1={y} x2={ML + PW} y2={y}
                              stroke={C.gD} strokeWidth={0.6} strokeDasharray="4 4" />
                    ))}

                    {/* ── 5. Concentric ellipses ───────────────── */}
                    {ELLIPSES.map(({ r, d }, i) => (
                        <path key={`el${r}`} d={d} fill="none" stroke={C.gE}
                              strokeWidth={r === 1 ? 1.2 : 0.8}
                              style={{ animation: `cc-fade-in 0.5s ease-out ${(0.1 + i * 0.07).toFixed(2)}s both` }} />
                    ))}

                    {/* ── 6. Radial lines — LEFT (sub-excited) ── */}
                    {LEFT_RADIALS.map(({ deg, lbl, hi }) => {
                        const θ = deg * DEG;
                        const ext = 1.18;
                        return (
                            <g key={`rl${deg}`}>
                                <line x1={mx(0)} y1={my(0)}
                                      x2={mx(Math.cos(θ) * ext)} y2={my(Math.sin(θ) * ext)}
                                      stroke={hi ? C.rB : C.rL}
                                      strokeWidth={hi ? 1.6 : 0.8}
                                      strokeDasharray="3 3" />
                                <text x={mx(Math.cos(θ) * 1.04)}
                                      y={my(Math.sin(θ) * 1.04) - 6}
                                      textAnchor="middle"
                                      fontSize={hi ? 10 : 9}
                                      fontWeight={hi ? 700 : 400}
                                      style={{ fill: C.rT }} fontFamily="monospace">
                                    {lbl}
                                </text>
                            </g>
                        );
                    })}

                    {/* ── 7. Diagonal lines — RIGHT (over-excited) */}
                    {RIGHT_DIAGS.map(({ deg, lbl, hi }) => {
                        const θ = deg * DEG;
                        const ext = 1.18;
                        return (
                            <g key={`rr${deg}`}>
                                <line x1={mx(0)} y1={my(0)}
                                      x2={mx(Math.cos(θ) * ext)} y2={my(Math.sin(θ) * ext)}
                                      stroke={hi ? C.rB : C.rL}
                                      strokeWidth={hi ? 1.6 : 0.8}
                                      strokeDasharray={hi ? "5 5" : "3 3"} />
                                <text x={mx(Math.cos(θ) * 1.06)}
                                      y={my(Math.sin(θ) * 1.06) - 6}
                                      textAnchor="middle"
                                      fontSize={hi ? 10 : 9}
                                      fontWeight={hi ? 700 : 400}
                                      style={{ fill: C.rT }} fontFamily="monospace">
                                    {lbl}
                                </text>
                            </g>
                        );
                    })}

                    {/* ── 8. Envelope glow + stroke ────────────── */}
                    <path d={ELLIPSE_1} fill="none" stroke={C.envS} strokeWidth={2.2}
                          className="cc-env-draw" />
                    <line x1={mx(-1)} y1={my(0)} x2={mx(1)} y2={my(0)}
                          stroke={C.envS} strokeWidth={2.2}
                          style={{ animation: 'cc-fade-in 0.6s ease-out 0.9s both' }} />

                    {/* ── 9. Nominal active power reference line ─── */}
                    <line x1={ML} y1={my(1.0)} x2={ML + PW} y2={my(1.0)}
                          stroke={C.nom} strokeWidth={1} strokeDasharray="8 4"
                          className={fade(900)} />
                    <text x={ML + PW - 6} y={my(1.0) - 5}
                          textAnchor="end" fontSize={7} fontFamily="monospace"
                          style={{ fill: C.nom }} letterSpacing={0.5}>
                        Pₙ 1.00 pu
                    </text>

                </g>

                {/* ── Corner brackets ──────────────────────────────── */}
                <g stroke={C.corner} strokeWidth={1.6} fill="none">
                    <polyline points={`${ML},${MT + 20} ${ML},${MT} ${ML + 20},${MT}`}
                              className="cc-bracket-draw" style={{ animationDelay: '0.20s' }} />
                    <polyline points={`${ML + PW - 20},${MT} ${ML + PW},${MT} ${ML + PW},${MT + 20}`}
                              className="cc-bracket-draw" style={{ animationDelay: '0.35s' }} />
                    <polyline points={`${ML},${MT + PH - 20} ${ML},${MT + PH} ${ML + 20},${MT + PH}`}
                              className="cc-bracket-draw" style={{ animationDelay: '0.50s' }} />
                    <polyline points={`${ML + PW - 20},${MT + PH} ${ML + PW},${MT + PH} ${ML + PW},${MT + PH - 20}`}
                              className="cc-bracket-draw" style={{ animationDelay: '0.65s' }} />
                </g>

                {/* ── Axes ─────────────────────────────────────── */}
                <line x1={ML} y1={my(0)} x2={ML + PW + 8} y2={my(0)}
                      style={{ stroke: C.ax }} strokeWidth={1.2} />
                <polygon points={`${ML + PW + 13},${my(0)} ${ML + PW + 5},${my(0) - 4} ${ML + PW + 5},${my(0) + 4}`}
                         style={{ fill: C.ax }} />
                <line x1={mx(0)} y1={my(0)} x2={mx(0)} y2={MT - 6}
                      style={{ stroke: C.ax }} strokeWidth={1.2} />
                <polygon points={`${mx(0)},${MT - 10} ${mx(0) - 4},${MT - 3} ${mx(0) + 4},${MT - 3}`}
                         style={{ fill: C.ax }} />

                {/* ── Tick marks ────────────────────────────────── */}
                {tickMarks.qTicks.map(({ q, x }) => (
                    <g key={`tq${q}`}>
                        <line x1={x} y1={my(0) - 4} x2={x} y2={my(0) + 4}
                              style={{ stroke: C.ax }} strokeWidth={0.8} />
                        <text x={x} y={my(0) + 15} textAnchor="middle" fontSize={8}
                              style={{ fill: C.lb }} fontFamily="monospace">
                            {q.toFixed(1)}
                        </text>
                    </g>
                ))}
                {tickMarks.pTicks.map(({ p, y }) => (
                    <g key={`tp${p}`}>
                        <line x1={mx(0) - 4} y1={y} x2={mx(0) + 4} y2={y}
                              style={{ stroke: C.ax }} strokeWidth={0.8} />
                        <text x={mx(0) - 8} y={y + 3} textAnchor="end" fontSize={8}
                              style={{ fill: C.lb }} fontFamily="monospace">
                            {p.toFixed(1)}
                        </text>
                    </g>
                ))}

                {/* Axis titles */}
                <text x={mx(0) - 25} y={MT - 1} fontSize={9} fontWeight={700}
                      style={{ fill: C.tt }} fontFamily="monospace" letterSpacing={1}>P [pu]</text>
                <text x={ML + PW - 38} y={my(0) - 8} fontSize={9} fontWeight={700}
                      style={{ fill: C.tt }} fontFamily="monospace" letterSpacing={1}>Q [pu]</text>

                {/* ── Region labels ─────────────────────────────── */}
                <text x={(ML + mx(0)) / 2} y={MT + PH + 14}
                      textAnchor="middle" fontSize={7} fontFamily="monospace"
                      letterSpacing={1} fontWeight={600} style={{ fill: C.rgn }}>
                    ◀ CAPACITIVO / SUB-EXC
                </text>
                <text x={(mx(0) + ML + PW) / 2} y={MT + PH + 14}
                      textAnchor="middle" fontSize={7} fontFamily="monospace"
                      letterSpacing={1} fontWeight={600} style={{ fill: C.rgn }}>
                    INDUCTIVO / SOBRE-EXC ▶
                </text>

                {/* ── Operating point + trail ──────────────────── */}
                {has && (
                    <g className="transition-opacity duration-500" style={{ opacity: loaded ? 1 : 0 }}
                       clipPath="url(#cc-cp)">
                        {trail.length > 1 && (
                            <polyline points={trail.map(t => `${t.x},${t.y}`).join(" ")}
                                      fill="none" stroke={C.oTr} strokeWidth={1.5} opacity={0.3}
                                      strokeLinecap="round" strokeLinejoin="round" />
                        )}
                        {trail.map((t, i) => (
                            <circle key={i} cx={t.x} cy={t.y} r={1.5} fill={C.oTr}
                                    opacity={0.08 + (0.35 * i) / trail.length} />
                        ))}
                        <g className="cc-xh-v">
                            <line x1={opX} y1={my(0)} x2={opX} y2={opY}
                                  stroke={C.oD} strokeWidth={0.7} opacity={0.35} strokeDasharray="3 3" />
                        </g>
                        <g className="cc-xh-h">
                            <line x1={mx(0)} y1={opY} x2={opX} y2={opY}
                                  stroke={C.oD} strokeWidth={0.7} opacity={0.35} strokeDasharray="3 3" />
                        </g>
                        <circle cx={opX} cy={opY} r={28} fill={C.oG} opacity={0.18} />
                        <circle cx={opX} cy={opY} r={16} fill={C.oG} opacity={0.22} />
                        <circle cx={opX} cy={opY} r={10} fill="none" stroke={C.oD} strokeWidth={1.5}
                                className="cc-pulse-ring" />
                        <circle cx={opX} cy={opY} r={6.5} fill="none" stroke={C.oD} strokeWidth={1.2} opacity={0.65} />
                        <circle cx={opX} cy={opY} r={4} fill={inZ ? C.oD : C.wn}
                                stroke="white" strokeWidth={1.2} opacity={1}
                                className="cc-dot-beat" />

                        {/* ── Angle φ arc ─────────────────────────── */}
                        {angleArc && phiDeg != null && (
                            <g opacity={1}>
                                {/* Shaded sector fill */}
                                <path d={angleArc.sectorD} fill={C.oD} opacity={0.28} />
                                {/* P-axis leg */}
                                <line x1={mx(0)} y1={my(0)} x2={angleArc.x1} y2={angleArc.y1}
                                      stroke={C.oD} strokeWidth={1.5} opacity={0.70} />
                                {/* Vector line — solid, bright */}
                                <line x1={mx(0)} y1={my(0)} x2={opX} y2={opY}
                                      stroke={C.oD} strokeWidth={1.8} opacity={0.90} />
                                {/* Arrowhead at operating point */}
                                <circle cx={opX} cy={opY} r={2.5} fill={C.oD} opacity={0.95} />
                                {/* Arc */}
                                <path d={`M${angleArc.x1},${angleArc.y1} A${angleArc.arcR},${angleArc.arcR} 0 ${angleArc.largeArc},${angleArc.sweep} ${angleArc.x2},${angleArc.y2}`}
                                      fill="none" stroke={C.oD} strokeWidth={2} />
                                {/* Angle label with background */}
                                <rect x={angleArc.lx - 22} y={angleArc.ly - 8}
                                      width={44} height={14} rx={2}
                                      fill={C.bBg} opacity={0.88} />
                                <text x={angleArc.lx} y={angleArc.ly + 1}
                                      textAnchor="middle" dominantBaseline="central"
                                      fontSize={9} fontWeight={700}
                                      style={{ fill: C.oD }} fontFamily="monospace">
                                    φ = {Math.abs(phiDeg).toFixed(1)}°
                                </text>
                            </g>
                        )}
                    </g>
                )}

                {!has && (
                    <g>
                        <circle cx={mx(0)} cy={my(0)} r={3.5} fill={C.on} opacity={0.8}
                                className="cc-idle-core" />
                        <circle cx={mx(0)} cy={my(0)} r={8} fill="none" stroke={C.on} strokeWidth={1}
                                className="cc-idle-ring" />
                    </g>
                )}

            </svg>
            </div>

            {/* ── SCADA Sidebar ──────────────────────────────────────── */}
            <div className="w-96 shrink-0 flex flex-col overflow-y-auto overflow-x-hidden font-mono"
                 style={{ background: C.hdrBg, borderLeft: `1.5px solid ${C.ticker}` }}>

                {/* ▌1. ESTADO OPERATIVO */}
                <div className="shrink-0 px-5 py-4"
                     style={{ borderBottom: `1px solid ${C.ticker}` }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-sm"
                             style={{ background: !has ? C.hud : inZ ? C.ok : C.wn }} />
                        <span className="text-[15px] font-bold tracking-[0.2em] uppercase"
                              style={{ color: C.hud }}>Estado Operativo</span>
                    </div>
                    <div className="flex flex-col items-center py-4 rounded-md"
                         style={{
                             background: !has ? `${C.hud}0a`
                                       : inZ  ? `${C.ok}0f` : `${C.wn}0f`,
                             border: `1.5px solid ${!has ? C.hud : inZ ? C.ok : C.wn}40`,
                             boxShadow: has ? `inset 0 1px 12px ${inZ ? C.ok : C.wn}0a` : 'none',
                         }}>
                        <div className="text-[40px] leading-none mb-2"
                             style={{ color: !has ? C.hud : inZ ? C.ok : C.wn }}>
                            {!has ? '○' : inZ ? '●' : '▲'}
                        </div>
                        <div className="text-[22px] font-bold tracking-[0.2em]"
                             style={{ color: !has ? C.hud : inZ ? C.ok : C.wn }}>
                            {!has ? 'SIN DATOS' : inZ ? 'ZONA OK' : 'FUERA ZONA'}
                        </div>
                        <div className="text-[14px] mt-1.5 tracking-wider opacity-60"
                             style={{ color: !has ? C.hud : inZ ? C.ok : C.wn }}>
                            {!has ? 'Esperando señal' : inZ ? 'Operación normal' : 'Atención requerida'}
                        </div>
                    </div>
                </div>

                {/* ▌2. OPERACIÓN */}
                <div className="shrink-0 px-5 py-3.5"
                     style={{ borderBottom: `1px solid ${C.ticker}` }}>
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-1 h-4 rounded-sm" style={{ background: C.envS }} />
                        <span className="text-[15px] font-bold tracking-[0.2em] uppercase"
                              style={{ color: C.hud }}>Operación</span>
                    </div>

                    {/* P / Q / S metric cards */}
                    {([
                        { lbl: 'P', name: 'Activa',   val: activePowerKw,                       unit: 'kW',   max: ratedKva, color: C.oD },
                        { lbl: 'Q', name: 'Reactiva', val: reactivePowerKvar,                   unit: 'kVAr', max: ratedKva, color: '#a78bfa' },
                        { lbl: 'S', name: 'Aparente', val: sPu != null ? sPu * ratedKva : null, unit: 'kVA',  max: ratedKva, color: C.envS },
                    ] as { lbl: string; name: string; val: number | null; unit: string; max: number; color: string }[]).map(({ lbl, name, val, unit, max, color }) => {
                        const pct = val != null ? Math.min(Math.abs(val) / max * 100, 100) : 0;
                        return (
                            <div key={lbl} className="mb-2.5 px-3 py-2 rounded-md"
                                 style={{ background: `${color}08`, border: `1px solid ${color}12` }}>
                                <div className="flex items-baseline justify-between mb-1">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-0.5 h-4 rounded-full" style={{ background: color }} />
                                        <span className="text-[16px] font-bold" style={{ color }}>
                                            {lbl}
                                            <span className="font-normal text-[14px] ml-1 opacity-50">{name}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-baseline gap-0.5">
                                        <span className="text-[30px] font-bold leading-none"
                                              style={{ color: val != null ? color : `${C.hud}44`, fontVariantNumeric: 'tabular-nums' }}>
                                            {val != null ? val.toFixed(0) : '—'}
                                        </span>
                                        <span className="text-[14px] opacity-55" style={{ color }}>{unit}</span>
                                    </div>
                                </div>
                                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${color}15` }}>
                                    <div className="h-1.5 rounded-full transition-all duration-700 ease-out"
                                         style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${color}88, ${color})` }} />
                                </div>
                            </div>
                        );
                    })}

                    {/* cos φ + φ */}
                    {(() => {
                        const cc: string = cosP != null
                            ? (cosP >= 0.95 ? C.ok : cosP >= 0.85 ? C.oD : C.wn)
                            : C.hud;
                        return (
                            <div className="flex items-end justify-between mt-1 pt-3 pb-0.5"
                                 style={{ borderTop: `1px solid ${C.ticker}` }}>
                                <div>
                                    <div className="text-[14px] tracking-wider mb-1 uppercase opacity-60"
                                         style={{ color: cc }}>cos φ</div>
                                    <div className="text-[34px] font-bold leading-none"
                                         style={{ color: cosP != null ? cc : `${C.hud}44`, fontVariantNumeric: 'tabular-nums' }}>
                                        {cosP != null ? cosP.toFixed(3) : '—'}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[14px] tracking-wider mb-1 uppercase opacity-50"
                                         style={{ color: C.hud }}>φ</div>
                                    <div className="text-[30px] font-bold leading-none"
                                         style={{ color: C.oD, fontVariantNumeric: 'tabular-nums' }}>
                                        {phiDeg != null ? `${Math.abs(phiDeg).toFixed(1)}°` : '—'}
                                    </div>
                                </div>
                            </div>
                        );
                    })()}

                    {/* Semáforo cos φ */}
                    <div className="flex gap-1.5 mt-3">
                        {([
                            { lbl: '< 0.85',     c: C.wn, active: cosP != null && cosP < 0.85 },
                            { lbl: '0.85 – 0.95', c: C.oD, active: cosP != null && cosP >= 0.85 && cosP < 0.95 },
                            { lbl: '≥ 0.95',     c: C.ok, active: cosP != null && cosP >= 0.95 },
                        ] as { lbl: string; c: string; active: boolean }[]).map(({ lbl, c, active }) => (
                            <div key={lbl} className="flex-1 text-center py-1.5 rounded text-[13px] font-bold transition-all duration-500"
                                 style={{
                                     background: active ? `${c}25` : `${c}08`,
                                     color:      active ? c        : `${c}33`,
                                     border:     `1px solid ${active ? c + '55' : c + '12'}`,
                                     boxShadow:  active ? `0 0 8px ${c}15` : 'none',
                                 }}>
                                {lbl}
                            </div>
                        ))}
                    </div>
                </div>

                {/* ▌3. ALERTAS */}
                <div className="shrink-0 px-5 py-3.5">
                    <div className="flex items-center gap-2 mb-2.5">
                        <div className="w-1 h-4 rounded-sm" style={{ background: C.wn }} />
                        <span className="text-[15px] font-bold tracking-[0.2em] uppercase"
                              style={{ color: C.hud }}>Alertas</span>
                    </div>
                    {(() => {
                        if (!has) return (
                            <div className="text-[14px] py-2 text-center rounded-md opacity-50"
                                 style={{ color: C.hud, background: `${C.hud}08` }}>
                                Sin datos activos
                            </div>
                        );
                        const items: { level: 'error' | 'warn' | 'ok'; msg: string; sub?: string }[] = [];
                        if (!inZ)
                            items.push({ level: 'error', msg: 'Fuera de envolvente', sub: 'Riesgo operativo' });
                        if (cosP != null && cosP < 0.85)
                            items.push({ level: 'error', msg: 'cos φ crítico', sub: `${cosP.toFixed(3)} < 0.85` });
                        else if (cosP != null && cosP < 0.90)
                            items.push({ level: 'warn',  msg: 'cos φ bajo',    sub: `${cosP.toFixed(3)} < 0.90` });
                        if (sPu != null && sPu > 1.0)
                            items.push({ level: 'error', msg: 'Sobrecarga',     sub: `S = ${(sPu * 100).toFixed(1)} %` });
                        if (pPu != null && pPu < 0)
                            items.push({ level: 'warn',  msg: 'P negativa',     sub: `${pPu.toFixed(3)} pu` });
                        if (qPu != null && Math.abs(qPu) > 1.0)
                            items.push({ level: 'warn',  msg: 'Q fuera límite', sub: `|Q| = ${Math.abs(qPu).toFixed(3)} pu` });
                        if (items.length === 0)
                            items.push({ level: 'ok', msg: 'Sin alertas activas' });
                        const colMap  = { error: C.wn, warn: C.oD, ok: C.ok } as const;
                        const iconMap = { error: '▲', warn: '◆', ok: '●' }   as const;
                        return items.map((a, i) => {
                            const col = colMap[a.level];
                            return (
                                <div key={i} className="flex gap-2.5 items-start mb-2 rounded-md px-3 py-2"
                                     style={{ background: `${col}0c`, border: `1px solid ${col}20` }}>
                                    <span className="text-[15px] shrink-0 mt-0.5 leading-none" style={{ color: col }}>{iconMap[a.level]}</span>
                                    <div>
                                        <div className="text-[14px] font-bold leading-tight"
                                             style={{ color: col }}>{a.msg}</div>
                                        {a.sub && (
                                            <div className="text-[12px] leading-tight mt-0.5 opacity-65"
                                                 style={{ color: col }}>{a.sub}</div>
                                        )}
                                    </div>
                                </div>
                            );
                        });
                    })()}
                </div>

            </div>{/* end sidebar */}
            </div>{/* end flex-row wrapper */}

            {/* ── Bottom info strip: Leyenda + Límites ─────────────── */}
            <div className="shrink-0 flex font-mono"
                 style={{ background: C.hdrBg, borderTop: `1.5px solid ${C.ticker}` }}>

                {/* Leyenda */}
                <div className="flex-1 flex flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2"
                     style={{ borderRight: `1px solid ${C.ticker}` }}>
                    <span className="text-[14px] font-bold tracking-[0.18em] uppercase mr-1"
                          style={{ color: C.hud }}>Leyenda</span>
                    {([
                        { swatch: C.envS, type: 'line', label: 'Envolvente MVA' },
                        { swatch: C.silF, type: 'rect', label: 'Zona operativa' },
                        { swatch: C.grn,  type: 'rect', label: 'cos φ ≥ 0.9' },
                        { swatch: C.nom,  type: 'dash', label: 'Pₙ nominal' },
                        { swatch: C.gE,   type: 'dash', label: 'Líneas cos φ' },
                        { swatch: C.oD,   type: 'dot',  label: 'Punto operativo' },
                    ] as { swatch: string; type: string; label: string }[]).map(({ swatch, type, label }) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <div className="shrink-0 w-5 h-3 flex items-center justify-center">
                                {type === 'line' && <div className="w-full h-0.5 rounded-full" style={{ background: swatch }} />}
                                {type === 'rect' && <div className="w-full h-3 rounded-sm" style={{ background: swatch }} />}
                                {type === 'dash' && <div className="w-full h-0" style={{ borderTop: `1.5px dashed ${swatch}` }} />}
                                {type === 'dot'  && <div className="w-2.5 h-2.5 rounded-full mx-auto" style={{ background: swatch }} />}
                            </div>
                            <span className="text-[13px]" style={{ color: C.lb ?? C.hud }}>{label}</span>
                        </div>
                    ))}
                </div>

                {/* Límites Diseño */}
                <div className="shrink-0 flex flex-wrap items-center gap-x-4 gap-y-0.5 px-4 py-2">
                    <span className="text-[14px] font-bold tracking-[0.18em] uppercase mr-1"
                          style={{ color: C.hud }}>Límites</span>
                    {([
                        { label: 'Sₙ',        val: `${ratedKva.toLocaleString('en-US')} kVA` },
                        { label: 'Pₙ',        val: `${ratedKva.toLocaleString('en-US')} kW` },
                        { label: 'Q cap/ind', val: `±${(ratedKva * 1.18).toFixed(0)} kVAr` },
                        { label: 'cos φ mín', val: '0.85' },
                        { label: 'cos φ opt', val: '≥ 0.95' },
                    ] as { label: string; val: string }[]).map(({ label, val }) => (
                        <div key={label} className="flex items-baseline gap-1">
                            <span className="text-[13px] opacity-60" style={{ color: C.hud }}>{label}</span>
                            <span className="text-[13px] font-bold" style={{ color: C.tt, fontVariantNumeric: 'tabular-nums' }}>{val}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Footer info strip ──────────────────────────────── */}
            <div className="flex items-center justify-between px-4 py-1.5 shrink-0 text-[12px] font-mono"
                 style={{ background: C.ftBg, borderTop: `1px solid ${C.ticker}`, color: C.hud }}>
                <span className="tracking-widest">GEN · Diagrama P–Q</span>
                <span className="tracking-widest opacity-60">P · Q · S · cos φ  [pu]</span>
                <span className="tracking-[0.06em] font-bold" style={{ color: has ? (inZ ? C.ok : C.wn) : C.hud }}>
                    {has
                        ? `S=${(sPu! * ratedKva).toFixed(0)} kVA · cosφ=${cosP?.toFixed(3)} · ${inZ ? "ZONA OK" : "FUERA"}`
                        : "Esperando señal de operación"}
                </span>
            </div>
        </div>
    );
}
