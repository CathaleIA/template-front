
import cabeceraPagina from "@/components/reports-components/dinamic-report/cabecera-pagina";
import piePagina from "@/components/reports-components/dinamic-report/piepagina";

import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function POST(req: Request) {
  try {
    const { html, styles } = await req.json();

    const browser = await puppeteer.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const page = await browser.newPage();

    // 🔥 Inyectamos el HTML y los estilos juntos
    const finalHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>

          ${styles}</style>
        </head>
        <body>${html}</body>
      </html>
    `;

    await page.setContent(finalHTML, { waitUntil: "networkidle0" });

    const headerTemplate = `
     
        <img src="data:image/png;base64,${cabeceraPagina}" style="width: 100%; padding-top: 0%; object-fit: contain; display: block;" />
      
    `;

    const footerTemplate = `

        <img src="data:image/png;base64,${piePagina}" style="width: 100%; padding-bottom: 0%; object-fit: contain; display: block;" />

    `;
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      margin: {
        top: "190px",    // 170px de imagen + 20px de buffer
        bottom: "150px", // 170px de imagen + 20px de buffer
        left: "96px",
        right: "96px"
      },
  
    });
    await browser.close();

    return new Response(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": "attachment; filename=reporte.pdf",
      },
    });
  } catch (error) {
    console.error("Error generando PDF:", error);
    return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
  }
}
