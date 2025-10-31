export function buildReportTemplate(formData: Record<string, any>): string {
  function extractBodyContent(html: string): string {
    if (typeof window === "undefined") return html;
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, "text/html");
    return doc.body.innerHTML || html;
  }

  const html = `
  <div class="report-container">

    <h1>Informe de Pruebas Eléctricas a Activo Intervenido</h1>

    <p><b>Cliente:</b> ${formData.cliente?.toUpperCase() || ""}</p>
    <p><b>Municipio, Departamento:</b> ${formData.municipio?.toUpperCase() || ""}, ${formData.departamento?.toUpperCase() || ""}</p>

    <p><b>Elaborado por:</b> COPOWER LTDA., DPTO. PRUEBAS ELÉCTRICAS</p>

    <table>
      <tr>
        <td><b>Código:</b></td>
        <td colspan="3">INF-${formData.codigo || "GA######"}</td>
      </tr>
      <tr>
        <th>Versión</th>
        <th>Elaborado por</th>
        <th>Revisado por</th>
        <th>Aprobado por</th>
      </tr>
      <tr>
        <td>1</td>
        <td>${formData.elaboradoPor?.join(", ") || ""}</td>
        <td>${formData.revisadoPor?.join(", ") || ""}</td>
        <td>${formData.aprobadoPor?.join(", ") || ""}</td>
      </tr>
      <tr>
        <th>Etapa</th>
        <th colspan="2">Descripción</th>
        <th>Fecha</th>
      </tr>
      <tr>
        <td>0</td>
        <td colspan="2">Ejecución de pruebas en campo</td>
        <td>${formData.fechaEjecucion || "Día/mes/año"}</td>
      </tr>
      <tr>
        <td>1</td>
        <td colspan="2">Emisión de informe</td>
        <td>${formData.fechaEmision || "Día/mes/año"}</td>
      </tr>
    </table>

    <h2>1. Objetivo</h2>
    <p>${formData.objetivo || "Realizar pruebas eléctricas a activo/s perteneciente a la subestación o localidad del cliente."}</p>

    <h2>2. Personal Presente</h2>
    <p><b>COPOWER LTDA</b></p>
    <table>
      <tr><th>Nombre</th><th>Cargo</th></tr>
      ${(formData.personalPresente || []).map((p: string) => `<tr><td>${p}</td><td></td></tr>`).join("")}
    </table>

    <p><b>Cliente</b></p>
    <table>
      <tr><th>Nombre</th><th>Cargo</th></tr>
      <tr><td>${formData.primerNombre || ""} ${formData.segundoNombre || ""}</td><td>${formData.cargo || ""}</td></tr>
    </table>

    <h2>3. Alcance</h2>
    <p>Se realizaron las siguientes pruebas eléctricas:</p>
    ${(formData.activo || []).map(
      (act: string, i: number) => `
      <p><b>Activo ${i + 1}:</b> ${act}</p>
      <ul>
        ${(formData.prueba || []).map((pr: string) => `<li>${pr}</li>`).join("")}
      </ul>`
    ).join("")}

    <h2>4. Documentación de Referencia</h2>
    <ul>
      <li><b>${formData.nombreDoc?.toUpperCase() || "NOMBRE ABREVIADO DEL DOCUMENTO"}</b>. ${formData.desDoc || "Nombre completo del documento."}</li>
      <li>IEC 60034-27-3:2016. Dielectric dissipation factor measurement on stator winding insulation of rotating electrical machines.</li>
    </ul>

    <h2>5. Equipos Utilizados</h2>
    <ul>
      <li>${formData.nombreEquipo?.toUpperCase() || "OMICRON, CPC100, S/N: #####"}</li>
    </ul>

    <h2>6. Resultados</h2>
    <p>Los resultados obtenidos en las diferentes pruebas se muestran en el ANEXO correspondiente.</p>

    <h2>7. Observaciones</h2>
    <ul>
      ${(formData.observaciones || []).map((obs: string) => `<li>${obs}</li>`).join("")}
    </ul>

    <h2>8. Conclusiones y Recomendaciones</h2>
    <ul>
      ${(formData.conclucionesRecomendaciones || []).map((c: string) => `<li>${c}</li>`).join("")}
    </ul>

  </div>
  `;

  return html;
}
