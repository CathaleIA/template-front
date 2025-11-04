// components/reports-components/dinamic-report/ReportStylesPDF.ts

const reportStylesPDF = `
  /* ========================================
     ESTILOS PARA PDF - Basados en el HTML que genera Tiptap
     ======================================== */
  
  /* Contenedor principal */
  body {
    font-family: Arial, Helvetica, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    font-size: 10pt;
  }

  .ProseMirror {
    padding: 40px 60px !important;
    background: white !important;
  }

  /* Títulos H1 - Título principal */
  h1 {
    text-align: center;
    font-size: 16pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-bottom: 30px;
    margin-top: 40px;
    color: #000;
    letter-spacing: 0.5px;
    page-break-after: avoid;
  }

  /* Títulos H2 - Secciones */
  h2 {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    margin-top: 60px;
    margin-bottom: 16px;
    color: #000;
    border-bottom: 2px solid #333;
    padding-bottom: 6px;
    page-break-after: avoid;
  }

  /* Párrafos */
  p {
    text-align: justify;
    margin-bottom: 12px;
    line-height: 1.6;
    font-size: 10pt;
  }

  /* Primeros 3 párrafos después del h1 (info general) - centrados */
  h1 + p,
  h1 + p + p,
  h1 + p + p + p {
    text-align: center;
    text-transform: uppercase;
    margin-top: 20px;
    margin-bottom: 20px;
  }

  /* Tablas */
  .tableWrapper {
    margin: 30px 0;
    page-break-inside: avoid;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 20px;
    font-size: 9pt;
    page-break-inside: avoid;
  }

  table td,
  table th {
    border: 1px solid #333;
    padding: 8px 12px;
    vertical-align: top;
  }

  table th {
    background-color: #f3f4f6;
    font-weight: bold;
    text-align: center;
    color: #000;
  }

  /* Centrar contenido de ciertas celdas */
  table td:first-child {
    text-align: center;
  }

  /* Listas */
  ul.list-disc {
    margin-left: 30px;
    margin-bottom: 16px;
    padding-left: 10px;
  }

  ul.list-disc li {
    margin-bottom: 8px;
    line-height: 1.5;
    list-style-type: disc;
  }

  ul.list-disc li p {
    margin: 0;
    text-align: justify;
  }

  /* Párrafos después de h2 */
  h2 + p {
    margin-top: 12px;
  }

  /* Texto en negritas */
  b, strong {
    font-weight: bold;
    color: #000;
  }

  /* Saltos de página */
  h1, h2 {
    page-break-after: avoid;
  }

  table, .tableWrapper {
    page-break-inside: avoid;
  }

  /* Espaciado entre secciones */
  section {
    margin-bottom: 40px;
  }

  /* Evitar líneas huérfanas */
  p {
    orphans: 3;
    widows: 3;
  }
`;

export default reportStylesPDF;