// Objetivo de este módulo:
// - Recibir un objeto de datos (props) y construir un TEMPLATE HTML a partir de él
// - Retornar ese TEMPLATE como string
// - Para que luego se envíe a un endpoint (server/Lambda) que convierta HTML -> PDF

// Contrato (inputs/outputs breves):
// - Input: IotReportData (datos del reporte)
// - Output: string (HTML completo y autocontenible) o { html: string } como payload
// - Errores: si faltan campos clave, se usan valores por defecto en el template

import {
	BooleanMetric,
	BreakerStatus,
	BusbarMetrics,
	GeneratorMetrics,
	IotData,
	IotMetadata,
	IotReportData,
	NumericMetric,
	TemperatureMetrics,
} from './types';
import switchReportStyles from './switchReportStyles';

type RawMetric<T> = {
	value: T | null | undefined;
	timestamp?: string | null;
};

type RawGeneratorMetrics = Partial<Record<keyof GeneratorMetrics, RawMetric<number>>>;
type RawBusbarMetrics = Partial<Record<keyof BusbarMetrics, RawMetric<number>>>;
type RawTemperatureMetrics = Partial<Record<keyof TemperatureMetrics, RawMetric<number>>>;
type RawBreakerStatus = Partial<Record<keyof BreakerStatus, RawMetric<boolean>>>;

type RawIotData = {
	generator?: RawGeneratorMetrics;
	busbar?: RawBusbarMetrics;
	breaker?: RawBreakerStatus;
	temperature?: RawTemperatureMetrics;
};

type RawIotMetadata = {
	variables_count?: number | null;
	last_update?: string | null;
};

export interface RawIotSnapshot {
	timestamp?: string | null;
	device_id?: string | null;
	device_type?: string | null;
	data?: RawIotData | null;
	metadata?: RawIotMetadata | null;
}

const DEFAULT_NUMERIC: NumericMetric = { value: 0, timestamp: '' };
const DEFAULT_BOOLEAN: BooleanMetric = { value: false, timestamp: '' };

/**
 * Normaliza timestamps para asegurar formato ISO válido
 * @param value - Timestamp en string o null/undefined
 * @returns String ISO o string original si no es una fecha válida, string vacío si no hay valor
 */
const normalizeTimestamp = (value?: string | null) => {
	if (!value) {
		return '';
	}
	const date = new Date(value);
	return Number.isNaN(date.getTime()) ? value : date.toISOString();
};

/**
 * Sanitiza una métrica numérica aplicando valores por defecto si faltan datos
 * @param metric - Métrica raw que puede ser null/undefined
 * @returns NumericMetric con valor 0 y timestamp vacío si falta información
 */
const sanitizeNumericMetric = (metric?: RawMetric<number>): NumericMetric => ({
	value: typeof metric?.value === 'number' ? metric.value : DEFAULT_NUMERIC.value,
	timestamp: normalizeTimestamp(metric?.timestamp) || DEFAULT_NUMERIC.timestamp,
});

/**
 * Sanitiza una métrica booleana aplicando valores por defecto si faltan datos
 * @param metric - Métrica raw que puede ser null/undefined
 * @returns BooleanMetric con valor false y timestamp vacío si falta información
 */
const sanitizeBooleanMetric = (metric?: RawMetric<boolean>): BooleanMetric => ({
	value: typeof metric?.value === 'boolean' ? metric.value : DEFAULT_BOOLEAN.value,
	timestamp: normalizeTimestamp(metric?.timestamp) || DEFAULT_BOOLEAN.timestamp,
});

const GENERATOR_KEYS = [
	'potencia_activa',
	'potencia_aparente',
	'potencia_reactiva',
	'factor_potencia',
	'frecuencia',
	'corriente_L1',
	'corriente_L2',
	'corriente_L3',
	'voltage_L1_L2',
	'voltage_L2_L3',
	'voltage_L1_L3',
	'voltage_L1_N',
	'voltage_L2_N',
	'voltage_L3_N',
	'energia_fase_A',
	'energia_fase_B',
	'energia_fase_C',
	'secuencia_positiva',
	'secuencia_negativa',
	'secuencia_zero',
	'desbalance_corriente',
	'promedio_corrientes',
	'promedio_voltajes',
	'delta_L1_barra',
	'delta_L2_barra',
	'delta_L3_barra',
] as const satisfies ReadonlyArray<keyof GeneratorMetrics>;

const BUSBAR_KEYS = [
	'voltage_L1_L2',
	'voltage_L2_L3',
	'voltage_L1_L3',
	'frecuencia',
	'angulo_fase_A',
	'angulo_fase_B',
	'angulo_fase_C',
	'secuencia_positiva',
	'secuencia_negativa',
	'secuencia_zero',
] as const satisfies ReadonlyArray<keyof BusbarMetrics>;

const TEMPERATURE_KEYS = [
	'devanado_u',
	'devanado_v',
	'devanado_w',
	'rodamiento_delantero',
	'rodamiento_trasero',
] as const satisfies ReadonlyArray<keyof TemperatureMetrics>;

const BREAKER_KEYS = [
	'voltage_freq_ok',
	'opened',
	'closed',
	'fault',
	'ready_to_close',
	'sync_in_progress',
	'ready_to_open',
] as const satisfies ReadonlyArray<keyof BreakerStatus>;

/**
 * Construye un bloque de métricas numéricas garantizando que todas las claves existan
 * @param keys - Array de claves esperadas para este bloque de métricas
 * @param raw - Datos raw que pueden estar incompletos o ser null/undefined
 * @returns Record con todas las claves normalizadas como NumericMetric
 */
const buildNumericBlock = <K extends string>(
	keys: readonly K[],
	raw?: Partial<Record<K, RawMetric<number>>>
): Record<K, NumericMetric> => {
	const result: Partial<Record<K, NumericMetric>> = {};
	keys.forEach((key) => {
		result[key] = sanitizeNumericMetric(raw?.[key]);
	});
	return result as Record<K, NumericMetric>;
};


const buildBooleanBlock = <K extends string>(
	keys: readonly K[],
	raw?: Partial<Record<K, RawMetric<boolean>>>
): Record<K, BooleanMetric> => {
	const result: Partial<Record<K, BooleanMetric>> = {};
	keys.forEach((key) => {
		result[key] = sanitizeBooleanMetric(raw?.[key]);
	});
	return result as Record<K, BooleanMetric>;
};

/**
 * Función principal para transformar un snapshot IoT raw a formato normalizado
 * Garantiza que todos los bloques de métricas existan con valores por defecto
 * @param snapshot - Datos IoT crudos del JSON de entrada (pueden estar incompletos)
 * @returns IotReportData completamente normalizado con todas las métricas esperadas
 */
export const fromRawSnapshot = (snapshot: RawIotSnapshot): IotReportData => {
	const data: IotData = {
		generator: buildNumericBlock(GENERATOR_KEYS, snapshot.data?.generator) as GeneratorMetrics,
		busbar: buildNumericBlock(BUSBAR_KEYS, snapshot.data?.busbar) as BusbarMetrics,
		temperature: buildNumericBlock(TEMPERATURE_KEYS, snapshot.data?.temperature) as TemperatureMetrics,
		breaker: buildBooleanBlock(BREAKER_KEYS, snapshot.data?.breaker) as BreakerStatus,
	};

	const metadata: IotMetadata = {
		variables_count: typeof snapshot.metadata?.variables_count === 'number' ? snapshot.metadata.variables_count : 0,
		last_update: normalizeTimestamp(snapshot.metadata?.last_update),
	};

	return {
		timestamp: normalizeTimestamp(snapshot.timestamp),
		device_id: snapshot.device_id ?? '',
		device_type: snapshot.device_type ?? '',
		data,
		metadata,
	};
};

const DEFAULT_TEXT = 'N/D';

const LABEL_MAP: Partial<
	Record<
		keyof GeneratorMetrics |
		keyof BusbarMetrics |
		keyof TemperatureMetrics |
		keyof BreakerStatus,
		string
	>
> = {
	potencia_activa: 'Potencia activa',
	potencia_aparente: 'Potencia aparente',
	potencia_reactiva: 'Potencia reactiva',
	factor_potencia: 'Factor de potencia',
	frecuencia: 'Frecuencia',
	corriente_L1: 'Corriente L1',
	corriente_L2: 'Corriente L2',
	corriente_L3: 'Corriente L3',
	voltage_L1_L2: 'Voltaje L1-L2',
	voltage_L2_L3: 'Voltaje L2-L3',
	voltage_L1_L3: 'Voltaje L1-L3',
	voltage_L1_N: 'Voltaje L1-N',
	voltage_L2_N: 'Voltaje L2-N',
	voltage_L3_N: 'Voltaje L3-N',
	energia_fase_A: 'Energía fase A',
	energia_fase_B: 'Energía fase B',
	energia_fase_C: 'Energía fase C',
	secuencia_positiva: 'Secuencia positiva',
	secuencia_negativa: 'Secuencia negativa',
	secuencia_zero: 'Secuencia cero',
	desbalance_corriente: 'Desbalance corriente',
	promedio_corrientes: 'Promedio corrientes',
	promedio_voltajes: 'Promedio voltajes',
	delta_L1_barra: 'Delta L1 barra',
	delta_L2_barra: 'Delta L2 barra',
	delta_L3_barra: 'Delta L3 barra',
	angulo_fase_A: 'Ángulo fase A',
	angulo_fase_B: 'Ángulo fase B',
	angulo_fase_C: 'Ángulo fase C',
	voltage_freq_ok: 'Voltaje y frecuencia OK',
	opened: 'Breaker abierto',
	closed: 'Breaker cerrado',
	fault: 'Breaker en falla',
	ready_to_close: 'Listo para cerrar',
	sync_in_progress: 'Sincronizando',
	ready_to_open: 'Listo para abrir',
	devanado_u: 'Devanado U',
	devanado_v: 'Devanado V',
	devanado_w: 'Devanado W',
	rodamiento_delantero: 'Rodamiento delantero',
	rodamiento_trasero: 'Rodamiento trasero',
};

/**
 * Escapa caracteres HTML para prevenir inyección de código
 * @param value - String a escapar
 * @returns String con caracteres HTML especiales escapados
 */
const escapeHtml = (value: string) =>
	value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

/**
 * Obtiene etiqueta legible para una clave de métrica
 * @param key - Clave de la métrica (ej: "potencia_activa")
 * @returns Etiqueta traducida o fallback formateado (ej: "Potencia activa")
 */
const labelFor = (key: string) => LABEL_MAP[key as keyof typeof LABEL_MAP] ?? key.replace(/_/g, ' ').replace(/\b\w/g, (match) => match.toUpperCase());

/**
 * Formatea número con localización colombiana
 * @param value - Número a formatear
 * @param options - Opciones adicionales de formateo
 * @returns String formateado o "N/D" si el valor no es válido
 */
const formatNumber = (value?: number, options: Intl.NumberFormatOptions = {}) =>
	typeof value === 'number' && Number.isFinite(value)
		? value.toLocaleString('es-CO', {
			minimumFractionDigits: 2,
			maximumFractionDigits: 2,
			...options,
		})
		: DEFAULT_TEXT;

/**
 * Formatea valor booleano a texto legible
 * @param value - Booleano a formatear
 * @returns "Sí", "No" o "N/D"
 */
const formatBoolean = (value?: boolean) => (value === true ? 'Sí' : value === false ? 'No' : DEFAULT_TEXT);

/**
 * Formatea timestamp a fecha/hora legible en zona horaria de Bogotá
 * @param value - Timestamp ISO string
 * @returns Fecha formateada o "N/D" si es inválido
 */
const formatTimestampHuman = (value?: string) => {
	if (!value) {
		return DEFAULT_TEXT;
	}
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) {
		return escapeHtml(value);
	}
	return date.toLocaleString('es-CO', { timeZone: 'America/Bogota', hour12: false });
};

/**
 * Genera filas HTML para métricas numéricas
 * @param entries - Array de tuplas [clave, métrica] para renderizar
 * @returns String HTML con las filas de tabla o mensaje de "Sin datos"
 */
const renderMetricRows = (entries: Array<[string, NumericMetric]>) =>
	entries
		.map(([key, metric]) => {
			const label = escapeHtml(labelFor(key));
			const value = escapeHtml(formatNumber(metric.value));
			const timestamp = escapeHtml(formatTimestampHuman(metric.timestamp));
			return `<tr><td class="td-style forTable">${label}</td><td class="td-style value-cell">${value}</td><td class="td-style">${timestamp}</td></tr>`;
		})
		.join('') || `<tr><td class="td-style" colspan="3">Sin datos registrados</td></tr>`;

/**
 * Genera filas HTML para métricas booleanas
 * @param entries - Array de tuplas [clave, métrica] para renderizar
 * @returns String HTML con las filas de tabla o mensaje de "Sin datos"
 */
const renderBooleanRows = (entries: Array<[string, BooleanMetric]>) =>
	entries
		.map(([key, metric]) => {
			const label = escapeHtml(labelFor(key));
			const value = escapeHtml(formatBoolean(metric.value));
			const timestamp = escapeHtml(formatTimestampHuman(metric.timestamp));
			return `<tr><td class="td-style forTable">${label}</td><td class="td-style value-cell">${value}</td><td class="td-style">${timestamp}</td></tr>`;
		})
		.join('') || `<tr><td class="td-style" colspan="3">Sin datos registrados</td></tr>`;

/**
 * Renderiza una sección completa del reporte con título y tabla
 * @param title - Título de la sección
 * @param headers - Array de headers para la tabla
 * @param tableContent - Contenido HTML de las filas de la tabla
 * @returns String HTML de la sección completa
 */
const renderSection = (title: string, headers: string[], tableContent: string) => {
	const headerRow = headers
		.map((header) => `<th class="th-style">${escapeHtml(header)}</th>`)
		.join('');

	return `
	<section class="section">
		<div class="section-title">${escapeHtml(title)}</div>
		<table class="table-style">
			<thead><tr>${headerRow}</tr></thead>
			<tbody>${tableContent}</tbody>
		</table>
	</section>
	`;
};

export const buildIotReportHtml = (report: IotReportData): string => {
	const generatorRows = renderMetricRows(Object.entries(report.data.generator) as Array<[string, NumericMetric]>);
	const busbarRows = renderMetricRows(Object.entries(report.data.busbar) as Array<[string, NumericMetric]>);
	const temperatureRows = renderMetricRows(Object.entries(report.data.temperature) as Array<[string, NumericMetric]>);
	const breakerRows = renderBooleanRows(Object.entries(report.data.breaker) as Array<[string, BooleanMetric]>);

	const summarySection = `
		<section class="section">
			<div class="section-title">Resumen del dispositivo</div>
			<table class="table-style">
				<tbody>
					<tr>
						<td class="td-style forTable">Dispositivo</td>
						<td class="td-style">${escapeHtml(report.device_id || DEFAULT_TEXT)}</td>
						<td class="td-style forTable">Tipo</td>
						<td class="td-style">${escapeHtml(report.device_type || DEFAULT_TEXT)}</td>
					</tr>
					<tr>
						<td class="td-style forTable">Variables</td>
						<td class="td-style">${report.metadata.variables_count ?? 0}</td>
						<td class="td-style forTable">Última lectura</td>
						<td class="td-style">${escapeHtml(formatTimestampHuman(report.metadata.last_update))}</td>
					</tr>
					<tr>
						<td class="td-style forTable">Evento</td>
						<td class="td-style" colspan="3">${escapeHtml(formatTimestampHuman(report.timestamp))}</td>
					</tr>
				</tbody>
			</table>
		</section>
		`;

	return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>Reporte IoT ${escapeHtml(report.device_id || '')}</title>
<style>
${switchReportStyles}
.value-cell { font-variant-numeric: tabular-nums; text-align: right; }
</style>
</head>
<body>
	<div class="a4-page">
		<h1>Reporte IoT</h1>
		${summarySection}
		${renderSection('Métricas del generador', ['Variable', 'Valor', 'Última actualización'], generatorRows)}
		${renderSection('Métricas del busbar', ['Variable', 'Valor', 'Última actualización'], busbarRows)}
		${renderSection('Temperaturas del equipo', ['Variable', 'Valor', 'Última actualización'], temperatureRows)}
		${renderSection('Estado del breaker', ['Variable', 'Estado', 'Última actualización'], breakerRows)}
		<footer>Generado automáticamente por el sistema IoT</footer>
	</div>
</body>
</html>`;
};

export const toHtmlPayload = (report: IotReportData) => ({ html: buildIotReportHtml(report) });
