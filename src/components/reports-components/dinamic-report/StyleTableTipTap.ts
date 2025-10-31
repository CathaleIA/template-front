const tiptapTableStyles = `
/* 🔹 Tabla con bordes más marcados y centrada */
table {
  border-collapse: collapse;
  width: auto;
  table-layout: auto;
  margin: 2.5rem auto 1rem auto; /* más margen arriba (2.5rem) que abajo (1rem) */
  border: 1.5px solid #444;
  font-size: 9pt;
  page-break-inside: avoid;
}

/* 🔹 Celdas compactas */
th, td {
  border: 1px solid #555;
  padding: 1px 5px; /* espaciado interno reducido */
  vertical-align: top;
  text-align: left;
  background-color: #ffffff;
  color: #111827;
  white-space: nowrap; /* cambiado: evita saltos innecesarios */
  overflow: hidden;
  text-overflow: ellipsis;
  box-sizing: border-box;
  min-width: 50px; /* ancho mínimo para legibilidad */
}

/* 🔹 Cabeceras */
th {
  background-color: #f3f4f6;
  font-weight: bold;
  text-align: center;
  border: 1.5px solid #333;
  padding: 6px 10px; /* un poco más de espacio en headers */
}

/* 🔹 Imágenes dentro de celdas */
img {
  max-width: 90%;
  height: auto;
  display: block;
  margin: 0 auto;
}
`;

export default tiptapTableStyles;