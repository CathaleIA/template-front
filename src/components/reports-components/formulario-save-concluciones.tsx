"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Trash2, Edit2, Save, X, Upload } from "lucide-react"

interface Conclusion {
    id: number
    text: string
}

export default function ConclusionsFormSave() {
    const [conclusions, setConclusions] = useState<Conclusion[]>([])
    const [newConclusion, setNewConclusion] = useState("")
    const [editingId, setEditingId] = useState<number | null>(null)
    const [editText, setEditText] = useState("")

    const addConclusion = () => {
        if (newConclusion.trim()) {
            const newId = Date.now()
            setConclusions([...conclusions, { id: newId, text: newConclusion.trim() }])
            setNewConclusion("")
        }
    }

    const deleteConclusion = (id: number) => {
        setConclusions(conclusions.filter((c) => c.id !== id))
    }

    const startEdit = (conclusion: Conclusion) => {
        setEditingId(conclusion.id)
        setEditText(conclusion.text)
    }

    const saveEdit = () => {
        if (editText.trim()) {
            setConclusions(conclusions.map((c) => (c.id === editingId ? { ...c, text: editText.trim() } : c)))
        }
        setEditingId(null)
        setEditText("")
    }

    const cancelEdit = () => {
        setEditingId(null)
        setEditText("")
    }

    // 🔹 Nueva función: insertar las conclusiones en el DOM externo
    const loadConclusionsToDOM = () => {
        const listElement = document.getElementById("finalConclusionsList")
        if (listElement) {
            listElement.innerHTML = "" // limpiar lista previa
            conclusions.forEach((c) => {
                const li = document.createElement("li")
                li.textContent = c.text
                listElement.appendChild(li)
            })
        }
    }

    return (
        <div className="h-screen p-6">
            <div className="max-w-4xl mx-auto h-full border p-6 bg-white">
                <h2 className="text-lg font-semibold mb-4">Gestión de Conclusiones</h2>

                {/* Formulario para agregar nueva conclusión */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Nueva Conclusión</label>
                    <Textarea
                        value={newConclusion}
                        onChange={(e) => setNewConclusion(e.target.value)}
                        placeholder="Escribe tu conclusión aquí..."
                        className="min-h-[100px] border rounded-sm"
                    />
                    <Button
                        variant='custom'
                        size='custom'
                        onClick={addConclusion}
                        disabled={!newConclusion.trim()}
                        className="mt-3 w-full rounded-sm bg-blue-600 text-white hover:bg-blue-700"
                    >
                        Agregar Conclusión
                    </Button>
                </div>

                {/* Lista de conclusiones */}
                <div>
                    <h3 className="text-base font-semibold mb-3">
                        Conclusiones ({conclusions.length})
                    </h3>

                    {conclusions.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No hay conclusiones agregadas
                        </p>
                    ) : (
                        <div className="space-y-3 max-h-[400px] overflow-y-auto">
                            {conclusions.map((conclusion) => (
                                <Card key={conclusion.id} className="p-3 border rounded-sm">
                                    <CardContent className="p-0">
                                        {editingId === conclusion.id ? (
                                            <div>
                                                <Textarea
                                                    value={editText}
                                                    onChange={(e) => setEditText(e.target.value)}
                                                    className="min-h-[80px] border rounded-sm"
                                                />
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        variant='custom'
                                                        size='custom'
                                                        onClick={saveEdit}
                                                        disabled={!editText.trim()}
                                                        className="rounded-sm bg-green-600 text-white hover:bg-green-700"
                                                    >
                                                        <Save className="w-4 h-4 mr-1" />
                                                        Guardar
                                                    </Button>
                                                    <Button
                                                        variant='custom'
                                                        size="custom"
                                                        onClick={cancelEdit}
                                                        className="rounded-sm border"
                                                    >
                                                        <X className="w-4 h-4 mr-1" />
                                                        Cancelar
                                                    </Button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div>
                                                <p className="text-sm leading-relaxed">{conclusion.text}</p>
                                                <div className="flex gap-2 mt-2">
                                                    <Button
                                                        size='custom'
                                                        variant="custom"
                                                        onClick={() => startEdit(conclusion)}
                                                        className="rounded-sm border"
                                                    >
                                                        <Edit2 className="w-4 h-4 mr-1" />
                                                        Editar
                                                    </Button>
                                                    <Button
                                                        size="custom"
                                                        variant="custom"
                                                        onClick={() => deleteConclusion(conclusion.id)}
                                                        className="rounded-sm bg-red-600 text-white hover:bg-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4 mr-1" />
                                                        Eliminar
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* 🔹 Botón para cargar en el DOM */}
                <div className="mt-6">
                    <Button
                        variant='custom'
                        size='custom'
                        onClick={loadConclusionsToDOM}
                        disabled={conclusions.length === 0}
                        className="w-full rounded-sm bg-purple-600 text-white hover:bg-purple-700"
                    >
                        <Upload className="w-4 h-4 mr-1" />
                        Cargar Conclusiones en Documento
                    </Button>
                </div>
            </div>
        </div>
    )
}
