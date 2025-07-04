import { PdfFile , S3FileInfo } from "@/types/typeListDocs";

export function extractPdfFiles(data: { mapObjetos: Record<string, S3FileInfo[]> }): PdfFile[] {
  const pdfFiles: PdfFile[] = []

  for (const [_, files] of Object.entries(data.mapObjetos)) {
    files.forEach(file => {
      if (file.key.toLowerCase().endsWith(".pdf")) {
        pdfFiles.push({
          ...file,
          fileName: file.key.split("/").pop() || file.key,
        })
      }
    })
  }

  return pdfFiles
}
