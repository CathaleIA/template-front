import { NextResponse } from "next/server";
import puppeteer from "puppeteer";
import juice from "juice";
import path from "path";
import fs from "fs";

export async function POST(req: Request) {
    try {
        const { html } = await req.json();

        // 📌 leer el CSS generado por Tailwind
        const cssPath = path.resolve(process.cwd(),  ".next/static/css/app/broke.css");
        const tailwindCss = fs.readFileSync(cssPath, "utf-8");

        // 📌 armar HTML con CSS global
        const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8"/>
          <style>${tailwindCss}</style>
        </head>
        <body class="a4-page">
          ${html}
        </body>
      </html>
    `;

        // 1️⃣ pasar a inline con Juice (combina CSS global + clases)
        const inlineHtml = juice(fullHtml ?? "<html><body><h1>No HTML recibido</h1></body></html>");
        // 2️⃣ generar PDF
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.setContent(inlineHtml, { waitUntil: "networkidle0" });

        const pdfBuffer = await page.pdf({
            format: "A4",
            margin: { top: "20mm", bottom: "20mm", left: "10mm", right: "10mm" },
            printBackground: true,
            footerTemplate: `<div style="font-size:8px; width:100%; text-align:center; color:gray; padding-bottom:5px;">Page <span class="pageNumber"></span> of <span class="totalPages"></span></div>`,
                 headerTemplate: `
                <div style="font-size:12px; width:100%; text-align:left; color:gray; padding-top:5px; display:flex; align-items:center;">

                </div>
            `,
            displayHeaderFooter: true,
            
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
        console.error("Error generating PDF:", error);
        return NextResponse.json({ error: "Error generando PDF" }, { status: 500 });
    }
}
