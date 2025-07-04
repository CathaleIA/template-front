"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, X, FileText, CheckCircle, Upload } from "lucide-react"

export function ImprovedConclusions() {
  const [conclusion, setConclusion] = useState("")
  const [conclusiones, setConclusiones] = useState<string[]>([])
  const [isAdding, setIsAdding] = useState(false)

  // Añadir al array local
  const handleAgregar = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!conclusion.trim()) return
    setConclusiones([...conclusiones, conclusion.trim()])
    setConclusion("")
    setIsAdding(false)
  }

  // Eliminar una del array local
  const handleEliminar = (index: number) => {
    const nuevas = [...conclusiones]
    nuevas.splice(index, 1)
    setConclusiones(nuevas)
  }

  // Insertar todas en el HTML (DOM) - Tu lógica original
  const handleCargarEnHTML = () => {
    const ul = document.getElementById("finalConclusionsList")
    if (ul) {
      ul.innerHTML = "" // Limpiar el ul primero
      conclusiones.forEach((con) => {
        const li = document.createElement("li")
        li.textContent = con
        ul.appendChild(li)
      })
      console.log("Conclusiones cargadas en el HTML:", conclusiones)
    } else {
      console.warn("No se encontró el ul con id finalConclusionsList")
    }
  }

  const handleCancel = (e?: React.FormEvent) => {
    e?.preventDefault()
    setConclusion("")
    setIsAdding(false)
  }

  return (
    <Card className="border-border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileText className="w-5 h-5 text-primary" />
          Conclusiones
          {conclusiones.length > 0 && (
            <Badge variant="secondary" className="ml-2">
              {conclusiones.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Lista de conclusiones existentes */}
        {conclusiones.length > 0 && (
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {conclusiones.map((con, index) => (
              <div
                key={index}
                className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-lg group hover:bg-primary/15 transition-colors"
              >
                <CheckCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <p className="text-sm text-foreground flex-1 leading-relaxed">{con}</p>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleEliminar(index)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-primary hover:text-primary/80 hover:bg-primary/20 h-6 w-6 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Formulario para agregar nueva conclusión */}
        {isAdding ? (
          <form onSubmit={handleAgregar} className="space-y-3 p-4 bg-primary/5 border border-primary/20 rounded-lg">
            <Label htmlFor="new-conclusion" className="text-sm font-medium text-primary">
              Nueva Conclusión
            </Label>
            <Textarea
              id="new-conclusion"
              placeholder="Escribe tu conclusión aquí..."
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value)}
              className="min-h-[80px] border-primary/30 focus:border-primary bg-background"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleAgregar(e)
                }
              }}
            />
            <div className="flex gap-2">
              <Button type="submit" disabled={!conclusion.trim()} size="sm" className="bg-primary hover:bg-primary/90">
                <Plus className="w-4 h-4 mr-1" />
                Agregar
              </Button>
              <Button
                type="button"
                onClick={handleCancel}
                variant="outline"
                size="sm"
                className="border-primary/30 text-primary hover:bg-primary/5 bg-transparent"
              >
                Cancelar
              </Button>
            </div>
          </form>
        ) : (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              setIsAdding(true)
            }}
            variant="outline"
            className="w-full h-10 border-dashed border-primary/30 text-primary hover:bg-primary/5 hover:border-primary/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Agregar Conclusión
          </Button>
        )}

        {/* Botón para cargar conclusiones al HTML */}
        {conclusiones.length > 0 && (
          <Button
            type="button"
            onClick={(e) => {
              e.preventDefault()
              handleCargarEnHTML()
            }}
            className="w-full h-12 bg-chart-2 hover:bg-chart-2/90 text-primary-foreground font-semibold"
          >
            <Upload className="w-5 h-5 mr-2" />
            Cargar conclusiones al HTML ({conclusiones.length})
          </Button>
        )}

        {conclusiones.length === 0 && !isAdding && (
          <p className="text-sm text-muted-foreground text-center py-4">No hay conclusiones agregadas aún</p>
        )}
      </CardContent>
    </Card>
  )
}