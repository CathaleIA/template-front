import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from 'pdfmake/build/vfs_fonts';
import {divToHtml} from '@/utils/htmlTobase'
(<any>pdfMake).addVirtualFileSystem(pdfFonts);


export default function createPdfAxeno(){
    const htmlToPdfmake= require('html-to-pdfmake');

    const htmlToRender: string | null= divToHtml("Report_PDF_Component")
    const converted = htmlToPdfmake(htmlToRender, {window});
    const docDefinition = { content: converted };
    pdfMake.createPdf(docDefinition).download("output.pdf");
}