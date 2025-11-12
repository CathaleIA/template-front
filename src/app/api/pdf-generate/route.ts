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

    const finalHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              margin: 0 !important;
              padding: 0 !important;
            }
            
            ${styles}
          </style>
        </head>
        <body>
          ${html}
        </body>
      </html>
    `;

    await page.setContent(finalHTML, { waitUntil: "networkidle0" });

    // 🔥 Templates SIN márgenes ni padding
    const headerTemplate = `
      <div style="width: 100%; margin: 0; padding: 0; display: block;">
        <img 
          src="data:image/png;base64,${cabeceraPagina}" 
          style="
            width: 100%; 
            height: auto;
            display: block; 
            margin: 0; 
            padding: 0;
            border: 0;
          " 
        />
      </div>
    `;

    const footerTemplate = `
      <div style="width: 100%; margin: 0; padding: 0; display: block;">
        <img 
          src="data:image/png;base64,${piePagina}" 
          style="
            width: 100%; 
            height: auto;
            display: block; 
            margin: 0; 
            padding: 0;
            border: 0;
          " 
        />
      </div>
    `;

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate: headerTemplate,
      footerTemplate: footerTemplate,
      margin: {
        top: "190px",    // Altura exacta de tu header
        bottom: "155px", // Altura exacta de tu footer
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