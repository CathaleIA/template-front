import { NextResponse } from "next/server";
import path from "path";
import puppeteer from "puppeteer";
import fs from "fs";
export async function POST(req: Request) {
    try {
        const { html } = await req.json();

        // leer el CSS generado por Next.js/Tailwind
        const cssPath = path.resolve(process.cwd(), ".next/static/css/app/reportStay.css");
        const tailwindCss = fs.readFileSync(cssPath, "utf-8");

        const fullHtml = `
                    <!DOCTYPE html>
                    <html>
                    <head>
                        <meta charset="utf-8"/>
                        <style>${tailwindCss}</style>
           
                    </header>
                    <body style="padding-top: 80px;">
                        ${html}
                    </body>
                    </html>
                `;

        const browser = await puppeteer.launch();
        const page = await browser.newPage();

        await page.setContent(fullHtml, { waitUntil: "networkidle0" });
        await page.emulateMediaType('screen')
        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: { left: "1cm", top: "4cm", right: "1cm", bottom: "4cm" },
            displayHeaderFooter: true,

        });

        await browser.close();

        // ✅ devolvemos PDF como Uint8Array (compatible con BodyInit)
        return new Response(new Uint8Array(pdfBuffer), {
            status: 200,
            headers: {
                "Content-Type": "application/pdf",
                "Content-Disposition": "attachment; filename=report.pdf",
            },
        });
    } catch (error) {
        console.error("Error generating PDF:", error);
        return NextResponse.json({ error: "Error generating PDF" }, { status: 500 });
    }
}

// encabezado
