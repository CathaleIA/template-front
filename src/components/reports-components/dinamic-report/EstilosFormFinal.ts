 const  estiloForm= `
 

.report-container {
  font-family: Arial, sans-serif;
  color: #000;
  line-height: 1.4;
  font-size: 10pt;
  max-width: 800px;
  margin: 0 auto;
  padding: 20px 40px;
}

.report-container h1,
.report-container h2 {
  text-align: center;
  font-weight: bold;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.report-container h1 {
  font-size: 12pt;
  margin-bottom: 20px;
}

.report-container h2 {
  font-size: 11pt;
  text-align: left;
  margin-top: 15px;
}

.report-container p {
  text-align: justify;
  margin-bottom: 12px;
}

.report-container table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9pt;
  margin-bottom: 20px;
}

.report-container table,
.report-container th,
.report-container td {
  border: 1px solid #000;
}

.report-container th,
.report-container td {
  padding: 3px 6px; /* más fino tipo Excel */
  vertical-align: top;
}

.report-container ul {
  list-style-type: square;
  margin-left: 25px;
  margin-bottom: 12px;
  padding-left: 0;
}

.report-container b {
  font-weight: bold;
}

`;

export default estiloForm;