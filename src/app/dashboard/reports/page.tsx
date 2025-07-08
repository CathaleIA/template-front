"use client"
import "@/app/styles/embedStyles.css"
import type React from "react"
import { useUser } from "@/context/UserContext"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, X, Download, Building, Eye, Loader2, BarChart3 } from "lucide-react"
import { ImprovedConclusions } from "@/components/reports/improved-conclusions"
// Reports
import type { ApiResponse } from "../../../types/typeReports"
import DOMPurify from "isomorphic-dompurify"
import {
  generarGraficaBase64,
  convertirArchivoABase64,
  generarGraficaExiBase64,
} from "../../../utils/captureChartAsImage"
import { downloadBase64File, openBase64Pdf } from "@/utils/file-download-utils"
import { divToBase64 } from "@/utils/htmlTobase"

export default function ReportsPage() {
  // Estados y lógica del componente
  const [activo, setActivo] = useState("")
  const [tenant, setTenant] = useState("")
  const [poolUserId, setPoolUserId] = useState("")
  const [archivoToFront, setArchivo] = useState<File | null>(null)
  const [resultadoHtml, setResultadoHtml] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const [pdfBase64, setPdfBase64] = useState<string>("")
  const [isDownloading, setIsDownloading] = useState(false)
  const tenantLocalHost = localStorage.getItem("tenant") || tenant
  const { userr } = useUser()

  // Función para procesar el archivo
  const processFile = async () => {
    if (!archivoToFront) {
      alert("Por favor, seleccionar un archivo")
      return
    }
    setIsProcessing(true)
    try {
      const archivoToFrontBase64 = await convertirArchivoABase64(archivoToFront)
      const response = await fetch("/api/render-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          activo,
          tenant: tenantLocalHost,
          poolUserId: userr?.userName,
          archivoToFront: archivoToFrontBase64,
        }),
      })
      const data: ApiResponse = await response.json()
      const sanitizedHtml = DOMPurify.sanitize(data.archivoHtml)
      localStorage.setItem("report_id", data.report_id)
      console.log(data)
      const decodeHtml = (html: string): string => {
        const txt = document.createElement("textarea")
        txt.innerHTML = html
        return txt.value
      }
      setResultadoHtml(decodeHtml(sanitizedHtml))

      setTimeout(async () => {
        if (data.graficaCNData) {
          const graficaCNBase64 = await generarGraficaBase64(data.graficaCNData)
          const graficaCNContainer = document.getElementById("graficaCNChart-container")
          if (graficaCNContainer) {
            const canvasCN = graficaCNContainer.querySelector("canvas")
            if (canvasCN) {
              const imgCN = document.createElement("img")
              imgCN.src = graficaCNBase64
              imgCN.alt = "Gráfica CN"
              imgCN.style.width = "500px"
              imgCN.style.height = "280px"
              imgCN.style.display = "block"
              imgCN.style.margin = "0 auto"
              canvasCN.replaceWith(imgCN)
            }
          }
        }
        if (data.graficaRCNData) {
          const graficaRCNBase64 = await generarGraficaBase64(data.graficaRCNData)
          const graficaRCNContiner = document.getElementById("graficaRCNChart-container")
          if (graficaRCNContiner) {
            const canvasCN = graficaRCNContiner.querySelector("canvas")
            if (canvasCN) {
              const imgCN = document.createElement("img")
              imgCN.src = graficaRCNBase64
              imgCN.alt = "Gráfica RCN"
              imgCN.style.width = "500px"
              imgCN.style.height = "280px"
              imgCN.style.display = "block"
              imgCN.style.margin = "0 auto"
              canvasCN.replaceWith(imgCN)
            }
          }
        }
        if (data.graficaDataExi) {
          const graficaExitacionBase64 = await generarGraficaExiBase64(data.graficaDataExi)
          const graficaExiContainer = document.getElementById("graficaExiChart-container")
          if (graficaExiContainer) {
            const canvas = graficaExiContainer.querySelector("canvas")
            if (canvas) {
              const img = document.createElement("img")
              img.src = graficaExitacionBase64
              img.alt = "Gráfica Exi"
              img.style.width = "500px"
              img.style.height = "280px"
              img.style.display = "block"
              img.style.margin = "0 auto"
              canvas.replaceWith(img)
            }
          }
        }
      }, 0)

      if (response.ok) {
        console.log("Respuesta del Servidor: ", data)
      } else {
        console.error("Error", data.error)
      }
    } catch (error) {
      console.error("Error al procesar:", error)
      alert("Error al procesar el archivo")
    } finally {
      setIsProcessing(false)
    }
  }

  // Generar reporte PDF
  const generateReport = async () => {
    if (!resultadoHtml || !fileName.trim()) {
      alert("Asegúrate de haber procesado un archivo y especificado un nombre")
      return
    }
    setIsGeneratingPdf(true)
    try {
      const archivoExtracBase = divToBase64("container_to_generate")
      const reportId = localStorage.getItem("report_id")
      const response = await fetch("/api/down-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archivoHtml: archivoExtracBase,
          report_id: reportId,
          fileName: fileName,
          tenant_id: tenantLocalHost,
          poolUserId: userr?.userName,
        }),
      })
      if (response.ok) {
        const data = await response.json()
        if (data.base64File) {
          setPdfBase64(data.base64File)
        }
        console.log("Se generó el archivo")
        alert("PDF generado correctamente")
      } else {
        throw new Error("Error al generar el PDF")
      }
    } catch (error) {
      console.error("Error al procesar la solicitud:", error)
      alert("Error al generar el PDF")
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Descargar archivo
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!fileName.trim()) {
      alert("Especifica un nombre para el archivo")
      return
    }
    setIsDownloading(true)
    try {
      if (pdfBase64) {
        const success = downloadBase64File(pdfBase64, `${fileName}.pdf`)
        if (success) {
          alert("Archivo descargado correctamente")
        } else {
          alert("Error al descargar el archivo")
        }
      } else {
        const response = await fetch("/api/down-file-pdf", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userPoolId: userr?.userName,
            tenantName: tenantLocalHost,
            key: `${fileName}.pdf`,
          }),
        })
        if (response.ok) {
          const data = await response.json()
          const success = downloadBase64File(data.base64File, data.fileName || `${fileName}.pdf`)
          if (success) {
            alert("Archivo descargado correctamente")
          } else {
            alert("Error al descargar el archivo")
          }
        } else {
          alert("Error al obtener el archivo")
        }
      }
    } catch (error) {
      console.error("Error:", error)
      alert("Error al descargar el archivo")
    } finally {
      setIsDownloading(false)
    }
  }

  // Vista previa
  const handlePreview = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (pdfBase64) {
      openBase64Pdf(pdfBase64)
    } else {
      alert("Primero genera el reporte PDF")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary rounded-lg">
              <BarChart3 className="w-6 h-6 text-primary-foreground" />
            </div>
            <h1 className="text-4xl font-bold text-foreground">Generador de Reportes</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Configura y genera reportes técnicos de manera eficiente
          </p>
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-8">
          {/* Columna izquierda: Formulario - 43% */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Configuración del Reporte
                </CardTitle>
                <CardDescription className="text-primary-foreground/80">
                  Completa los datos necesarios para generar el reporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Tu formulario existente */}
                <div className="space-y-2">
                  <Label htmlFor="activo" className="text-sm font-semibold text-foreground">
                    Tipo de Activo
                  </Label>
                  <Select value={activo} onValueChange={(value) => setActivo(value)}>
                    <SelectTrigger className="h-11">
                      <SelectValue placeholder="Selecciona un activo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CT">CTs (Transformadores de Corriente)</SelectItem>
                      <SelectItem value="PT">PTs (Transformadores de Potencial)</SelectItem>
                      <SelectItem value="TRANS">Transformadores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="empresa" className="text-sm font-semibold text-foreground">
                    Empresa
                  </Label>
                  <Input
                    id="empresa"
                    type="text"
                    placeholder="Nombre de la empresa"
                    value={tenantLocalHost}
                    onChange={(e) => setTenant(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fileName" className="text-sm font-semibold text-foreground">
                    Nombre del Archivo
                  </Label>
                  <Input
                    id="fileName"
                    type="text"
                    placeholder="Ingresa el nombre del archivo"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="userPoolId" className="text-sm font-semibold text-foreground">
                    Usuario
                  </Label>
                  <Input
                    id="poolUserId"
                    type="text"
                    placeholder="Nombre del usuario"
                    value={userr?.userName || ""}
                    onChange={(e) => setPoolUserId(e.target.value)}
                    className="h-11"
                  />
                </div>
                {/* Cargar archivo */}
                <div className="space-y-3">
                  <Label className="text-sm font-semibold text-foreground">Archivo de Datos</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
                    <Input
                      id="archivo"
                      type="file"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null
                        setArchivo(file)
                      }}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => document.getElementById("archivo")?.click()}
                      className="w-full h-12 border-2 hover:bg-primary/5 hover:border-primary/50"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      {archivoToFront ? archivoToFront.name : "Seleccionar archivo"}
                    </Button>
                    {archivoToFront && (
                      <div className="flex items-center justify-between gap-2 mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          <span className="text-sm text-primary font-medium">{archivoToFront.name}</span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setArchivo(null)}
                          className="text-primary hover:text-primary/80 hover:bg-primary/10"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
                {/* Botones de acción */}
                <div className="space-y-3">
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      processFile()
                    }}
                    disabled={!activo || !archivoToFront || isProcessing}
                    className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5 mr-2" />
                        Procesar Archivo
                      </>
                    )}
                  </Button>
                  <ImprovedConclusions />
                  <Button
                    onClick={(e) => {
                      e.preventDefault()
                      generateReport()
                    }}
                    disabled={!resultadoHtml || isGeneratingPdf}
                    className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 text-primary-foreground font-semibold"
                  >
                    {isGeneratingPdf ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Generando PDF...
                      </>
                    ) : (
                      <>
                        <Download className="w-5 h-5 mr-2" />
                        Generar Reporte PDF
                      </>
                    )}
                  </Button>
                  {/* Botones simples de descarga */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      disabled={isDownloading || !fileName.trim()}
                      className="flex-1 h-11 bg-green-600 hover:bg-green-700 text-white font-semibold"
                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4 mr-2" />
                      )}
                      Descargar
                    </Button>
                    <Button
                      onClick={handlePreview}
                      disabled={!pdfBase64}
                      variant="outline"
                      className="flex-1 h-11 border-green-600 text-green-600 hover:bg-green-50 bg-transparent"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Vista Previa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Columna derecha: Vista previa del reporte - 57% */}
          <div className="xl:col-span-4 space-y-6">
            <Card className="shadow-lg border-0 bg-card/80 backdrop-blur-sm h-full">
              <CardHeader className="bg-gradient-to-r from-muted-foreground to-muted-foreground/90 text-background rounded-t-lg">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Vista Previa del Reporte
                </CardTitle>
                <CardDescription className="text-background/80">
                  {resultadoHtml
                    ? "Reporte generado exitosamente"
                    : "El reporte aparecerá aquí una vez procesado"}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {resultadoHtml ? (
                  <div className="max-h-[900px] overflow-y-auto">
                    <div
                      id="container_to_generate"
                      className="p-8 bg-background"
                      dangerouslySetInnerHTML={{ __html: resultadoHtml }}
                    />
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-[600px] text-center p-8">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <BarChart3 className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-2">No hay reporte generado</h3>
                    <p className="text-muted-foreground mb-6 max-w-md">
                      Completa el formulario y procesa un archivo para ver la vista previa del reporte aquí.
                    </p>
                    <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Selecciona el tipo de activo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Completa la información de la empresa</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Carga el archivo de datos</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                        <span>Haz clic en &quot;Procesar Archivo&quot;</span>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}