 const  estilosA4= `
 
 

.a4-page {
    width: 190mm;
    min-height: 257mm;
    padding: 10mm;
    margin: auto;
    background: rgb(255, 255, 255);
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    font-size: 9pt;
}

@page {
    size: A4;
    margin: 5mm;
}


.table-style {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.th-style {
    border: 1px solid black;
    background-color: #ffffff;
    text-align: center;
    font-weight: bold;
    padding: 1px 5px;
    vertical-align: top;
    white-space: nowrap;
}

.td-style {
    border: 1px solid black;
    padding: 1px 5px;
    vertical-align: top;
    white-space: nowrap;
}

/* Misc utility styles */
.header-table td {
    border: none;
    padding: 2px 5px;
}

.section-title {
    background-color: #00076d;
    text-align: center;
    color: white;
    font-weight: bold;
    padding: 7px;
    margin-top: 15px;
    margin-bottom: 5px;
}

.logo {
    width: 80px;
    height: auto;
    float: left;
    margin-right: 10px;
}

.clear {
    clear: both;
}

.text-center {
    padding-top: 3%;
    text-align: center;
    font-weight: bold;
}

.box {
    border: 1px solid black;
    padding: 5px;
}

.forTable {
    font-weight: bold;
}

.page-break {
    page-break-before: always;
}


.scroll-container::-webkit-scrollbar {
  display: none;
}


.modebar-container .modebar {

  right: 0 !important;

}


.raw-html-block {
  all: revert; 
  width: 100%;
  display: block;
}

.raw-html-block .a4-page {
    width: 190mm;
    min-height: 257mm;
    padding: 10mm;
    margin: auto;
    background: rgb(255, 255, 255);
    box-sizing: border-box;
    font-family: Arial, sans-serif;
    font-size: 9pt;
}



.raw-html-block .table-style {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 15px;
}

.raw-html-block .th-style {
    border: 1px solid black;
    background-color: #ffffff;
    text-align: center;
    font-weight: bold;
    padding: 1px 5px;
    vertical-align: top;
    white-space: nowrap;
}

.raw-html-block .td-style {
    border: 1px solid black;
    padding: 1px 5px;
    vertical-align: top;
    white-space: nowrap;
}


.raw-html-block .header-table td {
    border: none;
    padding: 2px 5px;
}

.raw-html-block .section-title {
    background-color: #00076d;
    text-align: center;
    color: white;
    font-weight: bold;
    padding: 7px;
    margin-top: 15px;
    margin-bottom: 5px;
}

.raw-html-block .logo {
    width: 80px;
    height: auto;
    float: left;
    margin-right: 10px;
}

.raw-html-block .clear {
    clear: both;
}

.raw-html-block .text-center {
    padding-top: 3%;
    text-align: center;
    font-weight: bold;
}

.raw-html-block .box {
    border: 1px solid black;
    padding: 5px;
}

.raw-html-block .forTable {
    font-weight: bold;
}

.raw-html-block .page-break {
    page-break-before: always;
}

`;

export default estilosA4;