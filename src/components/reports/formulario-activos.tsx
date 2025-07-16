"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Upload, FileText, X, Loader2 } from "lucide-react"

interface FormularioActivosProps {
  tenantLocalHost?: string
  userr?: { userName: string }
  onProcessFile?: (data: FormData) => void
}

export default function FormularioActivos({
  tenantLocalHost = "Empresa Demo",
  userr = { userName: "Usuario Demo" },
  onProcessFile,
}: FormularioActivosProps) {
  const [activo, setActivo] = useState("")
  const [fileName, setFileName] = useState("")
  const [archivo, setArchivo] = useState<File | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)

  const processFile = async () => {
    if (!activo || !archivo) return

    setIsProcessing(true)

    // Simular procesamiento
    setTimeout(() => {
      console.log("Procesando archivo:", {
        activo,
        fileName,
        archivo: archivo.name,
        empresa: tenantLocalHost,
        usuario: userr?.userName,
      })
      setIsProcessing(false)

      if (onProcessFile) {
        const formData = new FormData()
        formData.append("activo", activo)
        formData.append("fileName", fileName)
        formData.append("archivo", archivo)
        formData.append("empresa", tenantLocalHost)
        formData.append("usuario", userr?.userName || "")
        onProcessFile(formData)
      }
    }, 2000)
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-foreground">Procesamiento de Activos</h2>
          <p className="text-muted-foreground">Complete la información para procesar el archivo de datos</p>
        </div>

        {/* Grid 2x2 para los campos principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Tipo de Activo */}
          <div className="space-y-2">
            <Label htmlFor="activo" className="text-sm font-semibold text-foreground">
              Tipo de Activo *
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

          {/* Empresa */}
          <div className="space-y-2">
            <Label htmlFor="empresa" className="text-sm font-semibold text-foreground">
              Empresa
            </Label>
            <Input
              id="empresa"
              type="text"
              disabled
              placeholder="Nombre de la empresa"
              value={tenantLocalHost}
              className="h-11 bg-muted"
            />
          </div>

          {/* Nombre del archivo */}
          <div className="space-y-2">
            <Label htmlFor="fileName" className="text-sm font-semibold text-foreground">
              Nombre del archivo *
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

          {/* Usuario */}
          <div className="space-y-2">
            <Label htmlFor="usuario" className="text-sm font-medium">
              Usuario
            </Label>
            <Input
              id="usuario"
              disabled
              type="text"
              placeholder="Nombre del usuario"
              value={userr?.userName || ""}
              className="h-11 bg-muted"
            />
          </div>
        </div>

        <Separator />

        {/* Sección de carga de archivo - ancho completo */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Archivo de Datos *</Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <Input
              id="archivo"
              type="file"
              accept=".csv,.xlsx,.xls,.json"
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
              {archivo ? archivo.name : "Seleccionar archivo"}
            </Button>

            {archivo && (
              <div className="flex items-center justify-between gap-2 mt-3 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary font-medium">{archivo.name}</span>
                  <span className="text-xs text-muted-foreground">({(archivo.size / 1024).toFixed(1)} KB)</span>
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

        {/* Botón de procesamiento - ancho completo */}
        <Button
          onClick={(e) => {
            e.preventDefault()
            processFile()
          }}
          disabled={!activo || !archivo || !fileName || isProcessing}
          className="w-full h-12 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Procesando archivo...
            </>
          ) : (
            <>
              <Upload className="w-5 h-5 mr-2" />
              Procesar Archivo
            </>
          )}
        </Button>

        {/* Información adicional */}
        <div className="text-center text-sm text-muted-foreground">
          <p>Formatos soportados: CSV, Excel (.xlsx, .xls), JSON</p>
          <p>Tamaño máximo: 10MB</p>
        </div>
      </div>
    </div>
  )
}
