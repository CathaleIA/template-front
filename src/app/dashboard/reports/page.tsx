"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Upload, FileText, X, Download, Calendar, User, Building } from "lucide-react"

interface Comment {
  id: string
  text: string
  timestamp: Date
}

interface UploadedFile {
  id: string
  name: string
  uploadDate: string
  size: number
  type: string
}

interface ReportData {
  empresa: string
  activo: string
  archivo: File | null
  archivoExistente: UploadedFile | null
  comentarios: Comment[]
}

export default function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    empresa: "",
    activo: "",
    archivo: null,
    archivoExistente: null,
    comentarios: [],
  })

  const [newComment, setNewComment] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [fileSelectionMode, setFileSelectionMode] = useState<"upload" | "existing">("upload")
  const [loadingFiles, setLoadingFiles] = useState(false)

  const handleSelectChange = (field: keyof ReportData, value: string) => {
    setReportData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    setReportData((prev) => ({
      ...prev,
      archivo: file,
    }))
  }

  const addComment = () => {
    if (newComment.trim()) {
      const comment: Comment = {
        id: Date.now().toString(),
        text: newComment.trim(),
        timestamp: new Date(),
      }
      setReportData((prev) => ({
        ...prev,
        comentarios: [...prev.comentarios, comment],
      }))
      setNewComment("")
    }
  }

  const removeComment = (id: string) => {
    setReportData((prev) => ({
      ...prev,
      comentarios: prev.comentarios.filter((comment) => comment.id !== id),
    }))
  }

  // ACA SE LLAMA AL SISTEMA DE NEXTJS ROUTER PARA OBTENER LOS ARCHIVOS SUBIDOS
  // CREAR UNA API EN /api/uploaded-files.ts
  const fetchUploadedFiles = async () => {
    setLoadingFiles(true)
    try {
      const response = await fetch("/api/uploaded-files")
      if (response.ok) {
        const files = await response.json()
        setUploadedFiles(files)
      }
    } catch (error) {
      console.error("Error fetching uploaded files:", error)
    } finally {
      setLoadingFiles(false)
    }
  }

  const selectExistingFile = (file: UploadedFile) => {
    setReportData((prev) => ({
      ...prev,
      archivoExistente: file,
      archivo: null, // Limpiar archivo subido si hay uno
    }))
  }

  // ACA SE DEBE IMPLEMENTAR LA LOGICA DEL BOTON ENVIAR DEL FORMULARIO
  // CREAR UNA API EN /api/process-file.ts
  const processFile = async () => {
    const fileToProcess = reportData.archivo || reportData.archivoExistente
    if (!fileToProcess) return

    try {
      const formData = new FormData()

      if (reportData.archivo) {
        formData.append("file", reportData.archivo)
      } else if (reportData.archivoExistente) {
        formData.append("fileId", reportData.archivoExistente.id)
      }

      formData.append("activo", reportData.activo)
      formData.append("empresa", reportData.empresa)

      const response = await fetch("/api/process-file", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        console.log("Archivo procesado exitosamente")
      }
    } catch (error) {
      console.error("Error procesando archivo:", error)
    }
  }

  const saveReport = () => {
    console.log("Guardando reporte del preview", reportData)
    // ACA DEBE IMPLEMENTAR LA LOGICA DE GUARDADO DEL REPORTE DESDE EL PREVIEW
    // SI ES OTRO ENDPOINT DEBE CREAR UNA API NUEVA
  }

  const generateReport = () => {
    // ACA DEBE IMPLEMENTAR LA LOGICA PARA GENERAR EL REPORTE DESDE EL PREVIEW
    // SI ES OTRO ENDPOINT DEBE CREAR UNA API NUEVA
    console.log("Generando reporte con datos:", reportData)
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Reportes</h1>
          <p className="text-muted-foreground">Genera reportes personalizados para tus activos</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Formulario */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Reporte</CardTitle>
              <CardDescription>Completa los datos necesarios para generar tu reporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">

              {/* Activo */}
              <div className="space-y-2">
                <Label htmlFor="activo">Activo</Label>
                <Select value={reportData.activo} onValueChange={(value) => handleSelectChange("activo", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un activo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CT">CTs</SelectItem>
                    <SelectItem value="PT">PTs</SelectItem>
                    <SelectItem value="RL">Reles</SelectItem>
                    <SelectItem value="IB">Interruptores de Baja</SelectItem>
                    <SelectItem value="IM">Interruptores de Media</SelectItem>
                    <SelectItem value="TRANS">Transformadores</SelectItem>
                    <SelectItem value="ALT">Alternadores</SelectItem>
                    <SelectItem value="ENG">Motores</SelectItem>
                    <SelectItem value="DTEST">Pruebas Dinámicas</SelectItem>
                    <SelectItem value="ETEST">Pruebas Estáticas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Nombre de la empresa dueña del activo"
                  value={reportData.empresa}
                  onChange={(e) => setReportData((prev) => ({ ...prev, empresa: e.target.value }))}
                />
              </div>

              {/* Selección de archivo */}
              <div className="space-y-4">
                <Label>Archivo</Label>

                {/* Tabs para seleccionar modo */}
                <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                  <Button
                    type="button"
                    variant={fileSelectionMode === "upload" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setFileSelectionMode("upload")}
                    className="flex-1"
                  >
                    Subir nuevo
                  </Button>
                  <Button
                    type="button"
                    variant={fileSelectionMode === "existing" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => {
                      setFileSelectionMode("existing")
                      if (uploadedFiles.length === 0) {
                        fetchUploadedFiles()
                      }
                    }}
                    className="flex-1"
                  >
                    Archivo existente
                  </Button>
                </div>

                {/* Subir nuevo archivo */}
                {fileSelectionMode === "upload" && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Input id="archivo" type="file" onChange={handleFileUpload} className="hidden" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => document.getElementById("archivo")?.click()}
                        className="w-full"
                      >
                        <Upload className="w-4 h-4 mr-2" />
                        {reportData.archivo ? reportData.archivo.name : "Cargar archivo"}
                      </Button>
                    </div>
                    {reportData.archivo && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <FileText className="w-4 h-4" />
                        <span>{reportData.archivo.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setReportData((prev) => ({ ...prev, archivo: null }))}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Seleccionar archivo existente */}
                {fileSelectionMode === "existing" && (
                  <div className="space-y-2">
                    {loadingFiles ? (
                      <div className="flex items-center justify-center p-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                        <span className="ml-2">Cargando archivos...</span>
                      </div>
                    ) : uploadedFiles.length > 0 ? (
                      <div className="max-h-48 overflow-y-auto space-y-2 border rounded-lg p-2">
                        {uploadedFiles.map((file) => (
                          <div
                            key={file.id}
                            className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                              reportData.archivoExistente?.id === file.id
                                ? "bg-primary/10 border-primary"
                                : "bg-muted hover:bg-muted/80 border-transparent"
                            } border`}
                            onClick={() => selectExistingFile(file)}
                          >
                            <div className="flex items-center gap-2">
                              <FileText className="w-4 h-4" />
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(file.uploadDate).toLocaleDateString()} • {(file.size / 1024).toFixed(1)} KB
                                </p>
                              </div>
                            </div>
                            {reportData.archivoExistente?.id === file.id && (
                              <Badge variant="default" className="text-xs">
                                Seleccionado
                              </Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-muted-foreground">
                        <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p>No hay archivos disponibles</p>
                        <Button type="button" variant="outline" size="sm" onClick={fetchUploadedFiles} className="mt-2">
                          Actualizar
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Botón Gestionar */}
              <div className="pt-4">
                <Button
                  onClick={processFile}
                  disabled={!reportData.activo || (!reportData.archivo && !reportData.archivoExistente)}
                  className="w-full"
                  variant="default"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Comentarios */}
          <Card>
            <CardHeader>
              <CardTitle>Comentarios</CardTitle>
              <CardDescription>Agrega comentarios adicionales al reporte</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="flex-1"
                />
                <Button onClick={addComment} disabled={!newComment.trim()}>
                  Agregar
                </Button>
              </div>

              {reportData.comentarios.length > 0 && (
                <div className="space-y-2">
                  <Separator />
                  <div className="space-y-2">
                    {reportData.comentarios.map((comment) => (
                      <div key={comment.id} className="flex items-start justify-between p-3 bg-muted rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm">{comment.text}</p>
                          <p className="text-xs text-muted-foreground mt-1">{comment.timestamp.toLocaleString()}</p>
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeComment(comment.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Preview del Reporte
              </CardTitle>
              <CardDescription>Vista previa de cómo se verá tu reporte en PDF</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-white border rounded-lg p-6 space-y-4 min-h-[600px]">
                {/* Header del reporte */}
                <div className="text-center border-b pb-4">
                  <h2 className="text-2xl font-bold text-gray-800">REPORTE TÉCNICO</h2>
                  <p className="text-gray-600 mt-2">
                    {new Date().toLocaleDateString("es-ES", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                {/* Información del reporte */}
                <div className="grid grid-cols-2 gap-4">

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">Activo:</span>
                    </div>
                    <p className="text-gray-600 ml-6">{reportData.activo || "No seleccionado"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Building className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">Empresa:</span>
                    </div>
                    <p className="text-gray-600 ml-6">{reportData.empresa || "No especificada"}</p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="font-semibold text-gray-700">Archivo:</span>
                    </div>
                    <p className="text-gray-600 ml-6">
                      {reportData.archivo?.name || reportData.archivoExistente?.name || "No cargado"}
                    </p>
                  </div>
                </div>

                {/* Comentarios en el preview */}
                {reportData.comentarios.length > 0 && (
                  <div className="space-y-2">
                    <h3 className="font-semibold text-gray-700 border-b pb-2">Comentarios Adicionales</h3>
                    <div className="space-y-2">
                      {reportData.comentarios.map((comment, index) => (
                        <div key={comment.id} className="bg-gray-50 p-3 rounded">
                          <p className="text-sm text-gray-700">
                            <span className="font-medium">{index + 1}.</span> {comment.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Estado del reporte */}
                <div className="flex justify-center pt-4">
                  {reportData.activo && reportData.empresa ? (
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      Listo para generar
                    </Badge>
                  ) : (
                    <Badge variant="secondary">Completa los campos requeridos</Badge>
                  )}
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-4">
                <Button onClick={saveReport} disabled={!reportData.activo} variant="outline" className="flex-1">
                  <FileText className="w-4 h-4 mr-2" />
                  Guardar
                </Button>
                <Button onClick={generateReport} disabled={!reportData.activo} className="flex-1">
                  <Download className="w-4 h-4 mr-2" />
                  Generar Reporte PDF
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
