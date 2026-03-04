// industrial-iot-lab/dashboard-industrial/src/components/PhaseAnglesPanel.tsx
'use client';

import type { GeneratorData, VariableData } from '@/types/iot.types';

type PhaseKey = 'angulo_fase_A' | 'angulo_fase_B' | 'angulo_fase_C';

type StatusLevel = 'normal' | 'warning' | 'danger' | 'unknown';

interface PhaseAnglesPanelProps {
  generator?: GeneratorData;
  /** Ángulos nominales esperados en grados (por defecto: A=0°, B=120°, C=240°) */
  nominalAngles?: {
    A: number;
    B: number;
    C: number;
  };
  /** Tolerancia en grados para "Normal" (ej: 5°) */
  warningToleranceDeg?: number;
  /** Tolerancia en grados para "Alerta" (ej: 10°) */
  dangerToleranceDeg?: number;
}

interface PhaseConfig {
  key: PhaseKey;
  label: string;
  nominalKey: keyof NonNullable<PhaseAnglesPanelProps['nominalAngles']>;
  colorClass: string;
}

/* ==================== CONFIGURACIÓN ==================== */

const phaseConfigs: PhaseConfig[] = [
  {
    key: 'angulo_fase_A',
    label: 'Fase A',
    nominalKey: 'A',
    colorClass: 'text-emerald-600 stroke-emerald-500',
  },
  {
    key: 'angulo_fase_B',
    label: 'Fase B',
    nominalKey: 'B',
    colorClass: 'text-sky-600 stroke-sky-500',
  },
  {
    key: 'angulo_fase_C',
    label: 'Fase C',
    nominalKey: 'C',
    colorClass: 'text-amber-600 stroke-amber-500',
  },
];

/* ==================== HELPERS ==================== */

const getNumericFromVariable = (data?: VariableData): number | null => {
  if (!data) return null;
  const { value } = data;
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return Number.isNaN(parsed) ? null : parsed;
  }
  return null;
};

const normalizeAngle = (angle: number): number => {
  // Normaliza a rango [-180, 180)
  let a = angle % 360;
  if (a >= 180) a -= 360;
  if (a < -180) a += 360;
  return a;
};

const getStatusFromDeviation = (
  deviationDeg: number | null,
  warningToleranceDeg: number,
  dangerToleranceDeg: number,
): StatusLevel => {
  if (deviationDeg === null) return 'unknown';
  const absDev = Math.abs(deviationDeg);
  if (absDev <= warningToleranceDeg) return 'normal';
  if (absDev <= dangerToleranceDeg) return 'warning';
  return 'danger';
};

const getStatusText = (status: StatusLevel): string => {
  switch (status) {
    case 'normal':
      return 'Normal';
    case 'warning':
      return 'Alerta';
    case 'danger':
      return 'Crítico';
    case 'unknown':
    default:
      return 'Sin datos';
  }
};

const getStatusChipClasses = (status: StatusLevel): string => {
  switch (status) {
    case 'normal':
      return 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50';
    case 'warning':
      return 'bg-amber-50 dark:bg-amber-900/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800/50';
    case 'danger':
      return 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/50';
    case 'unknown':
    default:
      return 'bg-muted text-muted-foreground border-border';
  }
};

const getValueClasses = (status: StatusLevel): string => {
  switch (status) {
    case 'normal':
      return 'text-emerald-800 dark:text-emerald-400';
    case 'warning':
      return 'text-amber-800 dark:text-amber-400';
    case 'danger':
      return 'text-red-800 dark:text-red-400';
    case 'unknown':
    default:
      return 'text-muted-foreground';
  }
};

/* ========== BLOQUE NUMÉRICO (ÁNGULO + Δ PERFECTAMENTE ALINEADOS) ========== */

interface AngleValueProps {
  angle: number | null;
  deviation: number | null;
  status: StatusLevel;
}

const AngleValue = ({ angle, deviation, status }: AngleValueProps) => {
  const angleText =
    angle !== null ? angle.toFixed(1) : '—';

  const hasDeviation = deviation !== null;
  const deviationPrefix =
    !hasDeviation || deviation === 0
      ? ''
      : deviation > 0
        ? '+'
        : '−';
  const deviationText = hasDeviation
    ? Math.abs(deviation as number).toFixed(1)
    : '—';

  return (
    <div className="w-[84px] flex flex-col items-center text-right tabular-nums">
      {/* Ángulo */}
      <div className="flex items-baseline justify-center whitespace-nowrap">
        <span
          className={`text-lg font-semibold ${getValueClasses(
            status,
          )}`}
        >
          {angleText}
        </span>
        {angle !== null && (
          <span className="ml-0.5 text-[11px] font-medium text-muted-foreground">
            °
          </span>
        )}
      </div>

      {/* Δ alineado debajo */}
      <div className="mt-0.5 text-[11px] text-muted-foreground whitespace-nowrap">
        {hasDeviation ? (
          <>
            <span>Δ: </span>
            <span>{deviationPrefix}</span>
            <span>{deviationText}°</span>
          </>
        ) : (
          <span>Δ: —</span>
        )}
      </div>
    </div>
  );
};

/* ==================== COMPONENTE PRINCIPAL ==================== */

const PhaseAnglesPanel = ({
  generator,
  nominalAngles = { A: 0, B: 120, C: 240 },
  warningToleranceDeg = 5,
  dangerToleranceDeg = 10,
}: PhaseAnglesPanelProps) => {
  // Preparamos los datos por fase
  const phaseRows = phaseConfigs.map((config) => {
    const rawAngle = getNumericFromVariable(generator?.[config.key]);
    const nominal = nominalAngles[config.nominalKey] ?? 0;

    const angle = rawAngle !== null ? normalizeAngle(rawAngle) : null;
    const deviation =
      angle !== null ? normalizeAngle(angle - nominal) : null;

    const status = getStatusFromDeviation(
      deviation,
      warningToleranceDeg,
      dangerToleranceDeg,
    );

    return {
      config,
      angle,
      nominal,
      deviation,
      status,
    };
  });

  // Datos para el diagrama fasorial
  const phasorData = phaseRows.map(({ config, angle }) => {
    const angleDeg = angle ?? nominalAngles[config.nominalKey] ?? 0;
    const normalized = normalizeAngle(angleDeg);

    return {
      config,
      angleDeg: normalized,
    };
  });

  // SVG: parámetros del fasor
  const size = 160;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 55;

  const toSvgCoords = (angleDeg: number): { x: number; y: number } => {
    // 0° hacia arriba (eje Y negativo), sentido antihorario
    const rad = ((angleDeg - 90) * Math.PI) / 180;
    const x = cx + radius * Math.cos(rad);
    const y = cy + radius * Math.sin(rad);
    return { x, y };
  };

  return (
    <div className="w-full h-full grid grid-cols-1 md:grid-cols-[2fr_minmax(160px,1fr)] gap-4 items-stretch">
      {/* Tabla de ángulos y desviaciones */}
      <div className="space-y-2 flex flex-col h-full">
        {/* Leyenda de referencia superior */}
        <div className="mb-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
          <span className="font-semibold text-foreground">
            Ángulos de fase (generador)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50 text-[10px] whitespace-nowrap">
            |Δ| ≤ {warningToleranceDeg}° normal
          </span>
          <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 text-[10px] whitespace-nowrap">
            |Δ| ≤ {dangerToleranceDeg}° alerta
          </span>
        </div>

        {/* Contenedor de filas */}
        <div className="flex-1 flex flex-col divide-y divide-border rounded-md border border-border bg-card/50 overflow-hidden">
          {phaseRows.map(({ config, angle, nominal, deviation, status }) => (
            <div
              key={config.key}
              className="flex-1 min-h-[48px] flex items-center justify-between gap-3 px-3 py-2"
            >
              {/* Nombre de fase */}
              <div className="flex flex-col">
                <span
                  className={`text-xs font-semibold tracking-wide ${config.colorClass.replace(
                    'stroke-',
                    '',
                  )}`}
                >
                  {config.label}
                </span>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  Nominal: {nominal.toFixed(0)}°
                </span>
              </div>

              {/* Ángulo actual + Δ (alineados y de ancho fijo) */}
              <AngleValue angle={angle} deviation={deviation} status={status} />

              {/* Chip de estado */}
              <div
                className={`px-2 py-0.5 rounded-full border text-[10px] font-medium uppercase tracking-wide whitespace-nowrap ${getStatusChipClasses(
                  status,
                )}`}
              >
                {getStatusText(status)}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diagrama fasorial compacto */}
      <div className="flex flex-col items-center justify-center h-full">
        <div className="w-full h-full flex items-center justify-center">
          <div className="w-full h-full max-w-[220px] max-h-[220px]">
            <svg
              viewBox={`0 0 ${size} ${size}`}
              className="w-full h-full"
              preserveAspectRatio="xMidYMid meet"
            >
              {/* Fondo */}
              <defs>
                <radialGradient id="phasorBg" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="var(--card)" stopOpacity="1" />
                  <stop offset="100%" stopColor="var(--muted)" stopOpacity="0.8" />
                </radialGradient>
              </defs>

              <circle
                cx={cx}
                cy={cy}
                r={radius + 8}
                fill="url(#phasorBg)"
                stroke="currentColor"
                className="text-border"
                strokeWidth={1}
              />

              {/* Ejes de referencia */}
              <line
                x1={cx}
                y1={cy - (radius + 4)}
                x2={cx}
                y2={cy + (radius + 4)}
                stroke="currentColor"
                className="text-border"
                strokeWidth={0.75}
                strokeDasharray="3 3"
              />
              <line
                x1={cx - (radius + 4)}
                y1={cy}
                x2={cx + (radius + 4)}
                y2={cy}
                stroke="currentColor"
                className="text-border"
                strokeWidth={0.75}
                strokeDasharray="3 3"
              />

              {/* Fasores */}
              {phasorData.map(({ config, angleDeg }) => {
                const { x, y } = toSvgCoords(angleDeg);
                const baseColorClass = config.colorClass
                  .split(' ')
                  .find((c) => c.startsWith('stroke-'));
                const strokeColor =
                  baseColorClass === 'stroke-emerald-500'
                    ? '#10b981'
                    : baseColorClass === 'stroke-sky-500'
                      ? '#0ea5e9'
                      : baseColorClass === 'stroke-amber-500'
                        ? '#f59e0b'
                        : '#6b7280';

                return (
                  <g key={config.key}>
                    <line
                      x1={cx}
                      y1={cy}
                      x2={x}
                      y2={y}
                      stroke={strokeColor}
                      strokeWidth={3}
                      strokeLinecap="round"
                    />
                    <circle
                      cx={x}
                      cy={y}
                      r={3.5}
                      fill={strokeColor}
                      stroke="#ffffff"
                      strokeWidth={1}
                    />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>

        {/* Leyenda de fases */}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-3 text-[10px] text-muted-foreground">
          {phaseConfigs.map((config) => {
            const baseColorClass = config.colorClass
              .split(' ')
              .find((c) => c.startsWith('stroke-'));
            const bgClass =
              baseColorClass === 'stroke-emerald-500'
                ? 'bg-emerald-100 dark:bg-emerald-900/30'
                : baseColorClass === 'stroke-sky-500'
                  ? 'bg-sky-100 dark:bg-sky-900/30'
                  : baseColorClass === 'stroke-amber-500'
                    ? 'bg-amber-100 dark:bg-amber-900/30'
                    : 'bg-muted';

            const dotClass =
              baseColorClass === 'stroke-emerald-500'
                ? 'bg-emerald-500 dark:bg-emerald-400'
                : baseColorClass === 'stroke-sky-500'
                  ? 'bg-sky-500 dark:bg-sky-400'
                  : baseColorClass === 'stroke-amber-500'
                    ? 'bg-amber-500 dark:bg-amber-400'
                    : 'bg-muted-foreground';

            return (
              <div
                key={config.key}
                className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full ${bgClass}`}
              >
                <span className={`w-2 h-2 rounded-full ${dotClass}`} />
                <span className="font-medium whitespace-nowrap">
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default PhaseAnglesPanel;
