"use client"
import '@/app/styles/embedStyles.css';
import type React from "react"
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { DataTable } from "@/components/reports/report-table";
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

// Reporst
import { ApiResponse } from "../../../types/typeReports";
import DOMPurify from 'isomorphic-dompurify';
import { generarGraficaBase64, convertirArchivoABase64, generarGraficaExiBase64 } from "../../../utils/captureChartAsImage";
import { AgregarConclusion } from '@/components/reports/report-conclucion';
import { requestToRender } from "../../../types/typePdfRender"
import { divToBase64 } from "@/utils/htmlTobase";
import { a } from "@aws-amplify/backend"

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

export default  function ReportsPage() {
  const [reportData, setReportData] = useState<ReportData>({
    empresa: "",
    activo: "",
    archivo: null,
    archivoExistente: null,
    comentarios: [],
  })

  //Elidev
  const [activo, setActivo] = useState("");
  const [tenant, setTenant] = useState("");
  const [poolUserId, setPoolUserId] = useState("");
  const [archivoToFront, setArchivo] = useState<File | null>(null);
  const [resultadoHtml, setResultadoHtml] = useState<string>('')
  const [fileName , setFileName] = useState<string>('');
  const [conclusions, setConclusions] = useState<string[]>([]);

  const [newComment, setNewComment] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [fileSelectionMode, setFileSelectionMode] = useState<"upload" | "existing">("upload")
  const [loadingFiles, setLoadingFiles] = useState(false)


  // funcion para crear una conclucion
  const addConclusion = () => {
    if (newComment.trim()) {
      setConclusions((prev) => [...prev, newComment.trim()]);
      setNewComment(""); // Limpiar el campo de entrada
    }
  };

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


  const processFile = async () => {
    if (!archivoToFront) {
      alert("Por favor, seleccionar un sapo perro archivoToFront")
      return;
    };

    // aca estamos tomando el dato que viene del formulario para procesarlo  al momento de enviarlo
    const archivoToFrontBase64 = await convertirArchivoABase64(archivoToFront)

    // enviamos los datos al backend que es donde esta implementdo el apiextorno
    // aca configuramos un api interno

    const response = await fetch("/api/render-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        activo,
        tenant,
        poolUserId,
        archivoToFront: archivoToFrontBase64,
      }),
    });

    const data: ApiResponse = await response.json();
    const sanitizedHtml = DOMPurify.sanitize(data.archivoHtml);
    localStorage.setItem('report_id', data.report_id);
    console.log(data)

    const decodeHtml = (html: string): string => {
      const txt = document.createElement('textarea');
      txt.innerHTML = html;
      return txt.value;
    };

    setResultadoHtml(decodeHtml(sanitizedHtml));

    // Generacion de pdf y graficas
    setTimeout(async () => {
      if (data.graficaCNData) {
        const graficaCNBase64 = await generarGraficaBase64(data.graficaCNData);
        const graficaCNContainer = document.getElementById('graficaCNChart-container');
        if (graficaCNContainer) {
          const canvasCN = graficaCNContainer.querySelector('canvas');
          if (canvasCN) {
            const imgCN = document.createElement('img');
            imgCN.src = graficaCNBase64;
            imgCN.alt = "Gráfica CN";
            imgCN.style.width = "500px";
            imgCN.style.height = "280px";
            imgCN.style.display = "block";
            imgCN.style.margin = "0 auto";
            //imgCN.style.objectFit = "contain"; // Opcional: ajusta el estilo si es necesario
            canvasCN.replaceWith(imgCN);
          }
        }
      }
      if (data.graficaRCNData) {
        const graficaRCNBase64 = await generarGraficaBase64(data.graficaRCNData);
        const graficaRCNContiner = document.getElementById('graficaRCNChart-container');
        if (graficaRCNContiner) {
          const canvasCN = graficaRCNContiner.querySelector('canvas');
          if (canvasCN) {
            const imgCN = document.createElement('img');
            imgCN.src = graficaRCNBase64;
            imgCN.alt = "Gráfica RCN";
            imgCN.style.width = "500px";
            imgCN.style.height = "280px";
            imgCN.style.display = "block";
            imgCN.style.margin = "0 auto";
            canvasCN.replaceWith(imgCN);
          }
        }

      }
      if (data.graficaDataExi) {
        const graficaExitacionBase64 = await generarGraficaExiBase64(data.graficaDataExi);

        const graficaExiContainer = document.getElementById('graficaExiChart-container');
        if (graficaExiContainer) {
          const canvas = graficaExiContainer.querySelector('canvas');
          if (canvas) {
            const img = document.createElement('img');
            img.src = graficaExitacionBase64;
            img.alt = "Gráfica Exi";
            img.style.width = "500px";
            img.style.height = "280px";
            img.style.display = "block";
            img.style.margin = "0 auto";
            canvas.replaceWith(img);
          }
        }
      }


    }, 0);

    if (response.ok) {
      console.log("Respuesta del Servidor: ", data);

    } else {
      console.error("Error", data.error);
    }
  }

  const saveReport = () => {
    console.log("Guardando reporte del preview", reportData)
    // ACA DEBE IMPLEMENTAR LA LOGICA DE GUARDADO DEL REPORTE DESDE EL PREVIEW
    // SI ES OTRO ENDPOINT DEBE CREAR UNA API NUEVA
  }

  const generateReport = async () => {
    const archivoExtracBase = divToBase64('container_to_generate');
    const reportId = localStorage.getItem('report_id');
    try {
      const response = await fetch('/api/down-pdf', {
        method: 'POST',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          archivoHtml: archivoExtracBase,
          report_id: reportId,
          fileName: fileName,
          tenant_id: tenant,
          poolUserId: poolUserId,
        })
      })
      console.log("Se genero el archivo")

    } catch (error) {
      console.error("Error al procesar la solicitud:", error);
      return ('error al descargar generar el PDF');
    }
  }





  return (
    (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Columna izquierda: Formulario */}
        <div>
          <h1 className="text-3xl font-bold mb-4">Reportes</h1>
          <Card>
            <CardHeader>
              <CardTitle>Configuración del Reporte</CardTitle>
              <CardDescription>Completa los datos necesarios para enviar el archivo</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Activo */}
              <div className="space-y-2">
                <Label htmlFor="activo">Activo</Label>
                <Select value={activo} onValueChange={(value) => setActivo(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un activo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CT">CTs</SelectItem>
                    <SelectItem value="PT">PTs</SelectItem>
                    <SelectItem value="TRANS">Transformadores</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="empresa">Empresa</Label>
                <Input
                  id="empresa"
                  type="text"
                  placeholder="Nombre de la empresa"
                  value={tenant}
                  onChange={(e) => setTenant(e.target.value)}
                />
              </div>

              
              {/* Empresa */}
              <div className="space-y-2">
                <Label htmlFor="fileName">Nombre del Archivo</Label>
                <Input
                  id="fileName"
                  type="text"
                  placeholder="fileName"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                />
              </div>

              {/* Usuario */}
              <div className="space-y-2">
                <Label htmlFor="userPoolId">Usuario</Label>
                <Input
                  id="poolUserId"
                  type="text"
                  placeholder="Nombre del usuario"
                  value={poolUserId}
                  onChange={(e) => setPoolUserId(e.target.value)}
                />
              </div>

              {/* Cargar archivo */}
              <div className="space-y-2">
                <Label>Archivo</Label>
                <div className="flex items-center gap-2">
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
                    className="w-full"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {archivoToFront ? archivoToFront.name : "Cargar archivo"}
                  </Button>
                </div>

                {archivoToFront && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>{archivoToFront.name}</span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setArchivo(null)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                )}
              </div>

              {/* Botón Enviar */}
              <div className="pt-4">
                <Button
                  onClick={processFile}
                  disabled={!activo || !archivoToFront}
                  className="w-full"
                  variant="default"
                >
                  <Upload className="w-4 h-4 mr-2" />
                  Enviar
                </Button>
              </div>
              <AgregarConclusion />

              <div className="pt-4">
                <button
                  onClick={() => generateReport()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                  Generar Reporte
                </button>
              </div>
                <div className="pt-4">
                    <DataTable tenantName={tenant} userPoolid={poolUserId} />
                </div>
            </CardContent>
          </Card>
        </div>

        {/* Columna derecha: Resultado HTML */}
        {resultadoHtml && (
          <div className="max-h-[800px] overflow-y-auto border rounded-lg p-4 shadow-inner">
            <div id="container_to_generate" dangerouslySetInnerHTML={{ __html: resultadoHtml }} />
              

          </div>
        )}

      </div>




    )
  )
}
