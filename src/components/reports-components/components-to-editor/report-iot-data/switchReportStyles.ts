const switchReportStyles = `
/* Layout A4 */
.a4-page {
  width: 190mm;
  min-height: 257mm;
  padding: 0mm;
  margin: auto;
  background: #ffffff;
  box-sizing: border-box;
  font-family: Arial, sans-serif;
  font-size: pt;
 }

/* Table base */
.table-style {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.th-style {
  border: 1px solid #000000;
  background-color: #ffffff;
  text-align: center;
  font-weight: bold;
  padding: 1px 5px;
  vertical-align: top;
  white-space: nowrap;
}

.td-style {
  border: 1px solid #000000;
  padding: 1px 5px;
  vertical-align: top;
  white-space: nowrap;
}

/* Utilities */
.header-table td {
  border: none;
  padding: 2px 5px;
}

.section-title {
  background-color: #00076d;
  text-align: center;
  color: #ffffff;
  font-weight: bold;
  padding: 7px;
  margin-top: 15px;
  margin-bottom: 5px;
}

.text-center {
  text-align: center;
  font-weight: bold;
  padding-top: 3%;
}

.forTable {
  font-weight: bold;
}
`;

export default switchReportStyles;
