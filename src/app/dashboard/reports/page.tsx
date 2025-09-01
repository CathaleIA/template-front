"use client"

import type React from "react"
import { useUser } from "@/context/UserContext"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, X, Download, Eye, Loader2, BarChart3, Settings, View } from "lucide-react"
import { ImprovedConclusions } from "@/components/reports/improved-conclusions"
// Reports
import type { ApiResponse } from "@/types"
import DOMPurify from "isomorphic-dompurify"
import {
  generarGraficaBase64,
  convertirArchivoABase64,
  generarGraficaExiBase64,
} from "../../../utils/captureChartAsImage"
import { downloadBase64File, openBase64Pdf } from "@/utils/file-download-utils"
import { divToBase64 } from "@/utils/htmlTobase"

import { useNotifications } from "@/context/notification-context"

import { PageHeader } from "@/components/page-header"
import { toast } from "sonner"

export default function ReportsPage() {
  const { addNotification } = useNotifications()

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
        //console.log("Respuesta del Servidor: ", data)
        addNotification({
          type: "success",
          title: "Archivo procesado correctamente.",
          message: "El archivo ha sido formateado correctamente, agrega los ultimos detalles!",
        })
      } else {
        addNotification({
          type: "error",
          title: "Error al procesar el archivo",
          message: `Error, ${data.error}`,
        })
        //console.error("Error", data.error)
      }
    } catch (error) {
      addNotification({
        type: "error",
        title: "Error al procesar el archivo",
        message: `Error, ${error}`,
      })
      //console.error("Error al procesar:", error)
      alert("Error al procesar el archivo")
    } finally {
      setIsProcessing(false)
    }
  }

  // Generar reporte PDF
  const generateReport = async () => {
    if (!resultadoHtml || !fileName.trim()) {
      alert("Asegúrate de haber procesado un archivo y especificado un nombre")
      addNotification({
        type: "error",
        title: "Error al generar.",
        message: "Asegurese de haber procesado un archivo y especificado un nombre.",
      })
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
        //console.log("Se generó el archivo")
        addNotification({
          type: "success",
          title: "Creacion exitosa!",
          message: "El PDF se genero y cargo a la nube exitosamente, ya puedes descargarlo.",
        })
        //alert("PDF generado correctamente")
      } else {
        //throw new Error("Error al generar el PDF")
        addNotification({
          type: "error",
          title: "Error al crear PDF",
          message: `No se pudo crear el pdf. Detalles: ${response}`,
        })
      }
    } catch (error) {
      //console.error("Error al procesar la solicitud:", error)
      //alert("Error al generar el PDF")
      addNotification({
        type: "error",
        title: "Error al crear PDF",
        message: `No se pudo crear el pdf. Detalles: ${error}`,
      })
    } finally {
      setIsGeneratingPdf(false)
    }
  }

  // Descargar archivo
  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (!fileName.trim()) {
      //alert("Especifica un nombre para el archivo")
      addNotification({
        type: "error",
        title: "Error al descargar.",
        message: "Especifica un nombre para el archivo",
      })
      return
    }
    setIsDownloading(true)
    try {
      if (pdfBase64) {
        const success = downloadBase64File(pdfBase64, `${fileName}.pdf`)
        if (success) {
          //alert("Archivo descargado correctamente")
          toast("Success", { description: "Archivo descargado correctamente", })
        } else {
          //alert("Error al descargar el archivo")
          toast("Error", { description: "Error al descargar el archivo", })
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
            //alert("Archivo descargado correctamente")
            toast("Success", { description: "Archivo descargado correctamente", })
          } else {
            //alert("Error al descargar el archivo")
            toast("Error", { description: "Error al descargar el archivo", })
          }
        } else {
          //alert("Error al obtener el archivo")
          toast("Error", { description: "Error al obtener el archivo", })
        }
      }
    } catch (error) {
      //console.error("Error:", error)
      //alert("Error al descargar el archivo")
      addNotification({
        type: "error",
        title: "Error al descargar el archivo.",
        message: `No se pudo descargar el archivo. Detalles: ${error}`,
      })
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
      //alert("Primero genera el reporte PDF")
      toast("Error", { description: "Primero genera el reporte PDF", })
    }
  }

  return (
    <div className="container mx-auto">
      <div className="max-w-[1600px]">
        <PageHeader
          title="Generador de Reportes"
          description="Configura y genera reportes técnicos de manera eficiente."
        />
        <div className="grid grid-cols-1 xl:grid-cols-7 gap-6 p-5 bg-card">
          {/* Columna izquierda: Formulario - 43% */}
          <div className="xl:col-span-3 space-y-6">
            <Card className="bg-background border-none">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Configuración del Reporte
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Completa los datos necesarios para generar el reporte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                {/* Tu formulario existente */}
                <div className="space-y-4">
                  {/* Fila 1: Select de Tipo de Activo */}
                  <div className="space-y-2">
                    <Label htmlFor="activo" className="text-sm font-medium">
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

                  {/* Fila 2: Usuario y Empresa (con overflow hidden) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-hidden">
                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="userPoolId" className="text-sm font-medium">
                        Usuario
                      </Label>
                      <Input
                        id="poolUserId"
                        disabled
                        type="text"
                        placeholder="Nombre del usuario"
                        value={userr?.userName || ""}
                        onChange={(e) => setPoolUserId(e.target.value)}
                        className="truncate"
                      />
                    </div>

                    <div className="space-y-2 min-w-0">
                      <Label htmlFor="empresa" className="text-sm font-medium">
                        Empresa
                      </Label>
                      <Input
                        id="empresa"
                        type="text"
                        disabled
                        placeholder="Nombre de la empresa"
                        value={tenantLocalHost}
                        onChange={(e) => setTenant(e.target.value)}
                        className="truncate"
                      />
                    </div>
                  </div>

                  {/* Fila 3: Nombre del archivo */}
                  <div className="space-y-2">
                    <Label htmlFor="fileName" className="text-sm font-medium">
                      Nombre del archivo
                    </Label>
                    <Input
                      id="fileName"
                      type="text"
                      placeholder="Ingresa el nombre del archivo"
                      value={fileName}
                      onChange={(e) => setFileName(e.target.value)}
                    />
                  </div>

                  {/* Cargar archivo - ancho completo */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Archivo de Datos</Label>
                    <div className="border-1 border-dashed border-border rounded-lg p-2 hover:border-primary/50 transition-colors">
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
                        variant="customdestructive"
                        size="custom"
                        className="gap-1 w-full"
                        onClick={() => document.getElementById("archivo")?.click()}
                      >
                        <Upload />
                        {archivoToFront ? archivoToFront.name : "Seleccionar archivo"}
                      </Button>
                      {archivoToFront && (
                        <div className="flex items-center justify-between gap-2 mt-3 p-1 rounded-sm border border-border">
                          <div className="flex items-center gap-1">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm text-primary">{archivoToFront.name}</span>
                          </div>
                          <Button
                            type="button"
                            variant="customclose"
                            size="customicon"
                            onClick={() => setArchivo(null)}
                            className=""
                          >
                            <X />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Botón de procesamiento - ancho completo */}
                  <Button
                    variant="custom"
                    size="custom"
                    className="gap-1 w-full"
                    onClick={(e) => {
                      e.preventDefault()
                      processFile()
                    }}
                    disabled={!activo || !archivoToFront || isProcessing}
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      <p>Procesar Archivo</p>
                    )}
                  </Button>

                  <Separator />
                </div>
                {/* Botones de acción */}
                <div className="space-y-3">
                  <ImprovedConclusions />
                  <Button
                    className="w-full"
                    variant="customdestructive"
                    size="custom"
                    disabled={!resultadoHtml || isGeneratingPdf}
                    onClick={(e) => {
                      e.preventDefault()
                      generateReport()
                    }}
                  >
                    {isGeneratingPdf ? (
                      <p>Generando PDF...</p>
                    ) : (
                      <p>Generar Reporte PDF</p>
                    )}
                  </Button>
                  {/* Botones simples de descarga */}
                  <div className="flex gap-2">
                    <Button
                      variant="custom"
                      size="custom"
                      className="flex-1 gap-1"
                      onClick={handleDownload}
                      disabled={isDownloading || !fileName.trim()}

                    >
                      {isDownloading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      Descargar
                    </Button>
                    <Button
                      variant="customdestructive"
                      size="custom"
                      className="flex-1 gap-1"
                      onClick={handlePreview}
                      disabled={!pdfBase64}
                    >
                      <Eye className="w-4 h-4" />
                      Vista Previa
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          {/* Columna derecha: Vista previa del reporte - 57% */}
          <div className="xl:col-span-4 space-y-6">
            <Card className="bg-background border-none h-full">
              <CardHeader className="border-b">
                <CardTitle className="flex items-center gap-2">
                  <View className="w-5 h-5" />
                  Vista Previa del Reporte
                </CardTitle>
                <CardDescription className="text-muted-foreground">
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