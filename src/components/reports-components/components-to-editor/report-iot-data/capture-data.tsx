// Objetivo de este módulo:
// - Recibir un objeto de datos (props) y construir un TEMPLATE HTML a partir de él
// - Retornar ese TEMPLATE como string
// - Para que luego se envíe a un endpoint (server/Lambda) que convierta HTML -> PDF

// Contrato (inputs/outputs breves):
// - Input: IotReportData (datos del reporte)
// - Output: string (HTML completo y autocontenible) o { html: string } como payload
// - Errores: si faltan campos clave, se usan valores por defecto en el template

export type Primitive = string | number | boolean | null | undefined

export interface IotReportMetric {
	label: string
	value: Primitive
	unit?: string
}

export interface IotReportTable {
	headers: string[]
	rows: (Primitive[])[]
}

export interface IotReportData {
	title: string
	date: string | Date
	deviceId?: string
	tenantName?: string
	metrics?: IotReportMetric[]
	table?: IotReportTable
	notes?: string
	// Campo extensible por si necesitas más datos estructurados
	extra?: Record<string, unknown>
}

function renderBaseStyles(): string {
	return `
		:root {
			--bg: #ffffff;
			--fg: #0F172A; /* slate-900 */
			--muted: #64748B; /* slate-500 */
			--primary: #0EA5E9; /* sky-500 */
			--border: #E2E8F0; /* slate-200 */
		}
		* { box-sizing: border-box; }
		html, body { margin: 0; padding: 0; font-family: Inter, ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, "Apple Color Emoji", "Segoe UI Emoji"; color: var(--fg); background: var(--bg); }
		.container { max-width: 900px; margin: 0 auto; padding: 24px; }
		.card { border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
		.header { padding: 20px 24px; border-bottom: 1px solid var(--border); background: #F8FAFC; }
		.title { margin: 0; font-size: 24px; line-height: 28px; }
		.subtitle { margin: 6px 0 0; font-size: 13px; color: var(--muted); }
		.content { padding: 24px; }
		.meta { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 24px; margin-bottom: 18px; }
		.meta-item { font-size: 13px; color: var(--muted); }
		.badge { display: inline-block; padding: 4px 8px; border-radius: 999px; background: rgba(14,165,233,0.1); color: var(--primary); font-size: 12px; border: 1px solid rgba(14,165,233,0.20); }
		.section-title { margin: 18px 0 8px; font-size: 14px; text-transform: uppercase; letter-spacing: .06em; color: var(--muted); }
		.metrics { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px 16px; }
		.metric { padding: 12px; border: 1px solid var(--border); border-radius: 10px; }
		.metric-label { font-size: 12px; color: var(--muted); }
		.metric-value { font-size: 18px; font-weight: 600; }
		table { width: 100%; border-collapse: collapse; margin-top: 8px; }
		th, td { padding: 10px 12px; border-bottom: 1px solid var(--border); font-size: 13px; text-align: left; }
		th { background: #F8FAFC; font-weight: 600; }
		.notes { white-space: pre-wrap; line-height: 1.5; font-size: 13px; color: var(--fg); border: 1px dashed var(--border); padding: 12px; border-radius: 10px; }
		.footer { padding: 16px 24px; border-top: 1px solid var(--border); font-size: 12px; color: var(--muted); text-align: right; }
	`
}

function fmtDate(input: string | Date): string {
	try {
		const d = input instanceof Date ? input : new Date(input)
		return d.toLocaleString()
	} catch {
		return String(input)
	}
}

export function generateIotReportHTML(data: IotReportData): string {
	const title = data.title ?? "Reporte IoT"
	const dateStr = fmtDate(data.date ?? new Date())
	const deviceId = data.deviceId ?? "—"
	const tenantName = data.tenantName ?? "—"
	const metrics = data.metrics ?? []
	const table = data.table
	const notes = data.notes

	const metricsHTML = metrics
		.map(m => `
			<div class="metric">
				<div class="metric-label">${escapeHtml(m.label)}</div>
				<div class="metric-value">${escapeHtml(String(m.value ?? ""))}${m.unit ? ` <span class="badge">${escapeHtml(m.unit)}</span>` : ""}</div>
			</div>
		`)
		.join("")

	const tableHTML = table
		? `
			<div class="section-title">Datos</div>
			<table>
				<thead>
					<tr>
						${table.headers.map(h => `<th>${escapeHtml(h)}</th>`).join("")}
					</tr>
				</thead>
				<tbody>
					${table.rows
						.map(
							r => `<tr>${r.map(c => `<td>${escapeHtml(c == null ? "" : String(c))}</td>`).join("")}</tr>`
						)
						.join("")}
				</tbody>
			</table>
		`
		: ""

	const notesHTML = notes
		? `
			<div class="section-title">Notas</div>
			<div class="notes">${escapeHtml(notes)}</div>
		`
		: ""

	return `<!doctype html>
	<html lang="es">
	<head>
		<meta charset="utf-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1" />
		<title>${escapeHtml(title)}</title>
		<style>${renderBaseStyles()}</style>
	</head>
	<body>
		<div class="container">
			<div class="card">
				<div class="header">
					<h1 class="title">${escapeHtml(title)}</h1>
					<p class="subtitle">Generado: ${escapeHtml(dateStr)}</p>
				</div>
				<div class="content">
					<div class="meta">
						<div class="meta-item"><strong>Dispositivo:</strong> ${escapeHtml(deviceId)}</div>
						<div class="meta-item"><strong>Tenant:</strong> ${escapeHtml(tenantName)}</div>
					</div>

					${metrics.length ? `<div class="section-title">Métricas</div><div class="metrics">${metricsHTML}</div>` : ""}
					${tableHTML}
					${notesHTML}
				</div>
				<div class="footer">Catalella • Reporte IoT</div>
			</div>
		</div>
	</body>
	</html>`
}

export function preparePdfPayload(data: IotReportData): { html: string } {
	return { html: generateIotReportHTML(data) }
}

// Utilidad mínima para escapar texto a HTML seguro
function escapeHtml(input: string): string {
	return input
		.replaceAll("&", "&amp;")
		.replaceAll("<", "&lt;")
		.replaceAll(">", "&gt;")
		.replaceAll('"', "&quot;")
		.replaceAll("'", "&#39;")
}

/*
Paso a paso de uso (cliente o servidor):

1) Define los datos del reporte IotReportData
	 const data: IotReportData = {
		 title: "Reporte de Temperatura del Motor",
		 date: new Date(),
		 deviceId: "MOTOR-123",
		 tenantName: "Cliente ACME",
		 metrics: [
			 { label: "Temp. Aire", value: 72.4, unit: "°C" },
			 { label: "Temp. Cilindro", value: 68.9, unit: "°C" },
		 ],
		 table: {
			 headers: ["Tiempo", "Potencia (kW)", "Estado"],
			 rows: [
				 ["10:00", 12.4, "OK"],
				 ["10:05", 12.9, "OK"],
			 ],
		 },
		 notes: "Observaciones del técnico..."
	 }

2) Genera el HTML string localmente (si sólo lo quieres ver/depurar)
	 const html = generateIotReportHTML(data)

3) Envía el HTML a tu endpoint de conversión a PDF (server/Lambda)
	 - Sugerencia: crear un endpoint /api/pdf/convert que acepte { html }
	 - Este endpoint puede llamar a un servicio (p.ej. AWS Lambda con Puppeteer) y devolver un PDF (content-type: application/pdf) o base64

	 Ejemplo de POST (cliente):
		 const res = await fetch('/api/pdf/convert', {
			 method: 'POST',
			 headers: { 'Content-Type': 'application/json' },
			 body: JSON.stringify(preparePdfPayload(data)),
		 })
		 // Espera un blob/pdf o base64 según definas

4) Descarga o muestra el PDF
	 - Si el endpoint responde application/pdf, puedes hacer res.blob() y crear un link de descarga.
	 - Si responde base64, conviértelo a Blob antes de descargar.

Notas:
 - En este repo existen dependencias como jspdf/html2canvas si quisieras un flujo 100% client-side.
 - Este archivo se limita a construir HTML autocontenible para que el servicio de PDF lo pinte consistente.
*/
