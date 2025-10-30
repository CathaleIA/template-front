export function buildReportTemplate(formData: Record<string, any>): string {
  /**
   * Limpia el HTML completo y devuelve solo el contenido del <body>,
   * ya que TipTap solo entiende nodos HTML del body.
   */
  function extractBodyContent(html: string): string {
    if (typeof window === "undefined") return html; // SSR-safe
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.innerHTML || html;
  }

  // Plantilla base
  const html = `
  <div style="font-family: Arial; color: #000; line-height: 1.4;">
    <h1 style="text-align:center; font-weight:bold; font-size:12pt; text-decoration:underline;">
      INFORME DE PRUEBAS ELÉCTRICAS A ACTIVO INTERVENIDO
    </h1>

    <p><b>CLIENTE:</b> ${formData.cliente?.toUpperCase() || ""}</p>
    <p><b>MUNICIPIO, DEPARTAMENTO:</b> ${formData.municipio?.toUpperCase() || ""}, ${formData.departamento?.toUpperCase() || ""}</p>

    <p style="margin-top:10px; font-weight:bold;">ELABORADO POR: COPOWER LTDA., DPTO. PRUEBAS ELÉCTRICAS</p>

    <table border="1" cellspacing="0" cellpadding="5" style="width:100%; border-collapse:collapse; margin-top:10px; font-size:10pt;">
      <tr>
        <td><b>Código:</b></td>
        <td colspan="3">INF-${formData.codigo || ""}</td>
      </tr>
      <tr>
        <td><b>Versión</b></td>
        <td><b>Elaborado por</b></td>
        <td><b>Revisado por</b></td>
        <td><b>Aprobado por</b></td>
      </tr>
      <tr>
        <td>1</td>
        <td>${formData.elaboradoPor?.join(", ") || ""}</td>
        <td>${formData.revisadoPor?.join(", ") || ""}</td>
        <td>${formData.aprobadoPor?.join(", ") || ""}</td>
      </tr>
      <tr>
        <td colspan="4"><b>Etapa</b></td>
      </tr>
      <tr>
        <td>0</td>
        <td colspan="2">Ejecución de pruebas en campo</td>
        <td>${formData.fechaEjecucion || "Día/Mes/Año"}</td>
      </tr>
      <tr>
        <td>1</td>
        <td colspan="2">Emisión de informe</td>
        <td>${formData.fechaEmision || "Día/Mes/Año"}</td>
      </tr>
    </table>

    <br/>

    <h2 style="font-size:11pt; font-weight:bold;">1. OBJETIVO</h2>
    <p style="text-align:justify;">${formData.objetivo || ""}</p>

    <h2 style="font-size:11pt; font-weight:bold;">2. PERSONAL PRESENTE</h2>
    <ul>
      ${(formData.personalPresente || [])
        .map((p: string) => `<li>${p}</li>`)
        .join("")}
    </ul>

    <h2 style="font-size:11pt; font-weight:bold;">3. ALCANCE</h2>
    <p>${formData.alcance || ""}</p>

    <ul>
      ${(formData.activo || [])
        .map(
          (act: string, i: number) => `
        <li><b>ACTIVO ${i + 1}:</b> ${act}
          <ul>
            ${(formData.prueba || [])
              .map((pr: string) => `<li>${pr}</li>`)
              .join("")}
          </ul>
        </li>`
        )
        .join("")}
    </ul>

    <h2 style="font-size:11pt; font-weight:bold;">4. DOCUMENTACIÓN DE REFERENCIA</h2>
    <ul>
      <li><b>${formData.nombreDoc?.toUpperCase() || ""}</b>. ${
    formData.desDoc || ""
  }</li>
    </ul>

    <h2 style="font-size:11pt; font-weight:bold;">5. EQUIPOS UTILIZADOS</h2>
    <ul>
      <li>${formData.nombreEquipo || ""}</li>
    </ul>

    <h2 style="font-size:11pt; font-weight:bold;">6. RESULTADOS</h2>
    <p>Los resultados obtenidos se muestran en el ANEXO correspondiente.</p>

    <h2 style="font-size:11pt; font-weight:bold;">7. OBSERVACIONES</h2>
    <ul>
      ${(formData.observaciones || [])
        .map((obs: string) => `<li>${obs}</li>`)
        .join("")}
    </ul>

    <h2 style="font-size:11pt; font-weight:bold;">8. CONCLUSIONES Y RECOMENDACIONES</h2>
    <ul>
      ${(formData.conclucionesRecomendaciones || [])
        .map((c: string) => `<li>${c}</li>`)
        .join("")}
    </ul>
  </div>
  `;

  // Retorna solo el contenido del body (limpio y listo para TipTap)
  return extractBodyContent(html);
}
