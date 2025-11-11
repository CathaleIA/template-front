// lib/buildReportTemplate.ts

export function buildReportTemplate(formData: Record<string, any>): string {
  const html = `
    <div class="report-container">
      <!-- Título principal -->
      <h1 class="report-title">Informe de Pruebas Eléctricas a Activo Intervenido</h1>

      <!-- Información general -->
      <div class="info-section">
        <p class="info-item"><span class="label">Cliente:</span> ${formData.cliente?.toUpperCase() || ""}</p>
        <p class="info-item"><span class="label">Municipio, Departamento:</span> ${formData.municipio?.toUpperCase() || ""}, ${formData.departamento?.toUpperCase() || ""}</p>
        <p class="info-item"><span class="label">Elaborado por:</span> COPOWER LTDA., DPTO. PRUEBAS ELÉCTRICAS</p>
      </div>

      <!-- Tabla de control de versiones -->
      <table class="control-table">
        <tbody>
          <tr>
            <td class="table-label">Código:</td>
            <td colspan="3" class="table-value">INF-${formData.codigo || "GA######"}</td>
          </tr>
          <tr class="table-header">
            <th>Versión</th>
            <th>Elaborado por</th>
            <th>Revisado por</th>
            <th>Aprobado por</th>
          </tr>
          <tr>
            <td class="center-text">1</td>
            <td>${formData.elaboradoPor?.join(", ") || ""}</td>
            <td>${formData.revisadoPor?.join(", ") || ""}</td>
            <td>${formData.aprobadoPor?.join(", ") || ""}</td>
          </tr>
          <tr class="table-header">
            <th>Etapa</th>
            <th colspan="2">Descripción</th>
            <th>Fecha</th>
          </tr>
          <tr>
            <td class="center-text">0</td>
            <td colspan="2">Ejecución de pruebas en campo</td>
            <td class="center-text">${formData.fechaEjecucion || "Día/mes/año"}</td>
          </tr>
          <tr>
            <td class="center-text">1</td>
            <td colspan="2">Emisión de informe</td>
            <td class="center-text">${formData.fechaEmision || "Día/mes/año"}</td>
          </tr>
        </tbody>
      </table>

      <!-- Sección 1: Objetivo -->
      <section class="report-section">
        <h2 class="section-title">1. Objetivo</h2>
        <p class="section-content">${formData.objetivo || "Realizar pruebas eléctricas a activo/s perteneciente a la subestación o localidad del cliente."}</p>
      </section>

      <!-- Sección 2: Personal Presente -->
      <section class="report-section">
        <h2 class="section-title">2. Personal Presente</h2>
        
        <div class="subsection">
          <p class="subsection-title">COPOWER LTDA</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              ${(formData.personalPresente || []).map((p: string) => `
                <tr>
                  <td>${p}</td>
                  <td></td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>

        <div class="subsection">
          <p class="subsection-title">Cliente</p>
          <table class="data-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Cargo</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${formData.primerNombre || ""} ${formData.segundoNombre || ""}</td>
                <td>${formData.cargo || ""}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <!-- Sección 3: Alcance -->
      <section class="report-section">
        <h2 class="section-title">3. Alcance</h2>
        <p class="section-content">Se realizaron las siguientes pruebas eléctricas:</p>
        
        ${(formData.activos || []).map((activo: any, i: number) => `
          <div class="activo-block">
            <p class="activo-title"><span class="label">Activo ${i + 1}:</span> ${activo.nombre}</p>
            <ul class="pruebas-list">
              ${(activo.pruebas || []).map((prueba: string) => `<li>${prueba}</li>`).join("")}
            </ul>
          </div>
        `).join("")}
      </section>

      <!-- Sección 4: Documentación de Referencia -->
      <section class="report-section">
        <h2 class="section-title">4. Documentación de Referencia</h2>
        <ul class="reference-list">
          <li>
            <span class="doc-abbrev">${formData.nombreDoc?.toUpperCase() || "NOMBRE ABREVIADO DEL DOCUMENTO"}</span>. 
            ${formData.desDoc || "Nombre completo del documento."}
          </li>
          <li>
            <span class="doc-abbrev">IEC 60034-27-3:2016</span>. 
            Dielectric dissipation factor measurement on stator winding insulation of rotating electrical machines.
          </li>
        </ul>
      </section>

      <!-- Sección 5: Equipos Utilizados -->
      <section class="report-section">
        <h2 class="section-title">5. Equipos Utilizados</h2>
        <ul class="equipment-list">
          <li>${formData.nombreEquipo?.toUpperCase() || "OMICRON, CPC100, S/N: #####"}</li>
        </ul>
      </section>

      <!-- Sección 6: Resultados -->
      <section class="report-section">
        <h2 class="section-title">6. Resultados</h2>
        <p class="section-content">Los resultados obtenidos en las diferentes pruebas se muestran en el ANEXO correspondiente.</p>
      </section>

      <!-- Sección 7: Observaciones -->
      <section class="report-section">
        <h2 class="section-title">7. Observaciones</h2>
        <ul class="observations-list">
          ${(formData.observaciones || []).map((obs: string) => `<li>${obs}</li>`).join("")}
        </ul>
      </section>

      <!-- Sección 8: Conclusiones y Recomendaciones -->
      <section class="report-section">
        <h2 class="section-title">8. Conclusiones y Recomendaciones</h2>
        <ul class="conclusions-list">
          ${(formData.conclucionesRecomendaciones || []).map((c: string) => `<li>${c}</li>`).join("")}
        </ul>
      </section>
    </div>
  `;

  return html;
}