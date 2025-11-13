import { NextResponse } from "next/server";
import chromium from "@sparticuz/chromium";
import puppeteer from "puppeteer-core";
import cabeceraPagina from "@/components/reports-components/dinamic-report/cabecera-pagina";
import piePagina from "@/components/reports-components/dinamic-report/piepagina";

export async function POST(req: Request) {
  try {
    const { html, styles } = await req.json();

    const executablePath = await chromium.executablePath();

    const browser = await puppeteer.launch({
      args: chromium.args,
      executablePath,
      headless: true, // o "new" si usas Puppeteer >= 22
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

    const headerTemplate = `
      <div style="width:100%;margin:0;padding:0;display:block;">
        <img src="data:image/png;base64,${cabeceraPagina}" style="width:100%;height:auto;display:block;margin:0;padding:0;border:0;" />
      </div>`;

    const footerTemplate = `
      <div style="width:100%;margin:0;padding:0;display:block;">
        <img src="data:image/png;base64,${piePagina}" style="width:100%;height:auto;display:block;margin:0;padding:0;border:0;" />
      </div>`;

    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      displayHeaderFooter: true,
      headerTemplate,
      footerTemplate,
      margin: {
        top: "190px",
        bottom: "155px",
        left: "96px",
        right: "96px",
      },
    });

    await browser.close();

    return new Response(Buffer.from(pdfBuffer), {
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
