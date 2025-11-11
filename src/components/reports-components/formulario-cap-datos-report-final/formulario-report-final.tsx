'use client'
import { useState } from "react"
import { useForm } from "@tanstack/react-form"
import { z } from "zod"

import { X } from 'lucide-react';
import { Card, CardContent, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
    Field,
    FieldDescription,
    FieldError,
    FieldGroup,
    FieldSeparator,
    FieldLabel,
    FieldLegend,
    FieldSet,
} from "@/components/ui/field"
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
interface FormReportFinalProps {
    onFormSubmit?: (data: Record<string, any>) => void;
}
const schema = z.object({
    reportTitle: z.string().min(2, { message: "El título es obligatorio" }),
    cliente: z.string().min(2, { message: "La descripción es obligatoria" }),
    municipio: z.string().min(2, { message: "El municipio es obligatorio" }),
    departamento: z.string().min(2, { message: "El departamento es obligatorio" }),
    codigo: z.string().min(2, { message: "El código es obligatorio" }),
    elaboradoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un elaborador"),
    revisadoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un revisador"),
    aprobadoPor: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un aprobador"),
    fechaEjecucion: z.string().min(2, { message: "La fecha es obligatoria" }),
    fechaEmision: z.string().min(2, { message: "La fecha es obligatoria" }),
    objetivo: z.string().min(2, { message: "El objetivo es obligatorio" }),
    primerNombre: z.string().min(2, { message: "El primer nombre es obligatorio" }),
    segundoNombre: z.string().min(2, { message: "El segundo nombre es obligatorio" }),
    cargo: z.string().min(2, { message: "El campo es obligatorio" }),
    alcance: z.string().min(2, { message: "El alcance es obligatorio" }),
    activos: z.array(
        z.object({
            nombre: z.string().min(2, { message: "El activo es obligatorio" }),
            pruebas: z.array(
                z.string().min(2, { message: "La prueba es obligatoria" })
            ).min(1, "Debe haber al menos una prueba")
        })
    ).min(1, "Debe haber al menos un activo"),
    nombreDoc: z.string().min(2, { message: "Referencia de documentación obligatoria" }),

    desDoc: z.string().min(2, { message: "Descripcion de documentacion obligatorio" }),
    nombreEquipo: z.string().min(2, { message: "El nombre del equipo es obligatorio" }),
    observaciones: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos una observación"),
    conclucionesRecomendaciones: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos una conclusión o recomendación"),
    personalPresente: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un personal presente"),
})

export default function FormReportFinal({ onFormSubmit }: FormReportFinalProps) {
    const [savedValues, setSavedValues] = useState({});

    const form = useForm({
        defaultValues: {
            reportTitle: '',
            cliente: '',
            municipio: '',
            departamento: '',
            codigo: '',
            elaboradoPor: [] as string[],
            revisadoPor: [] as string[],
            aprobadoPor: [] as string[],
            fechaEjecucion: '',
            fechaEmision: '',
            primerNombre: '',
            segundoNombre: '',
            cargo: '',
            alcance: '',
            objetivo: '',
            activos: [
                { nombre: '', pruebas: [''] }
            ],
            personalPresente: [] as string[],
            nombreDoc: '',
            desDoc: '',
            nombreEquipo: '',
            observaciones: [] as string[],
            conclucionesRecomendaciones: [] as string[]
        },
        onSubmit: async ({ value }) => {
            // Validación manual con Zod antes de guardar
            const validation = schema.safeParse(value);

            if (!validation.success) {
                console.error('❌ Errores de validación:', validation.error.errors);
                const errorMessages = validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('\n');
                toast("", {
                    description: `Errores de validación:\n${errorMessages}`,
                    position: 'top-center',
                    action: {
                        label: 'Cerrar',
                        onClick: () => toast.dismiss(),
                    }

                });
                return;
            }

            toast.info('✅ Formulario válido! Valores:' + validation.data);
            setSavedValues(validation.data);

            toast.success('¡Formulario guardado exitosamente!');
            if (onFormSubmit) onFormSubmit(validation.data);
        },
    })

    return (
        <Card className="w-2xl mx-auto">
            <CardTitle className="text-center text-lg font-bold mt-4">
                Formulario Captura Datos Reporte Final
            </CardTitle>

            <CardContent>
                <form
                    id="report-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        form.handleSubmit()
                    }}
                    className="space-y-4"
                >
                    <FieldGroup>
                        {/* SECCIÓN 1: Información General */}
                        <FieldSet>
                            <FieldLegend>Información General del Reporte</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                <form.Field name="reportTitle">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Título del Reporte *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Ingrese el título del reporte"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="codigo">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Código *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Código del reporte"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="fechaEjecucion">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Fecha de Ejecución *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="date"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                    <form.Field name="fechaEmision">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Fecha de Emisión *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        type="date"
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>
                                </div>

                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Información del Cliente</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">

                                <form.Field name="cliente">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Cliente *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Nombre del cliente"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="municipio">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Municipio *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Municipio"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                    <form.Field name="departamento">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Departamento *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Departamento"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <form.Field name="primerNombre">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Primer Nombre *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Primer nombre"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                    <form.Field name="segundoNombre">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Segundo Nombre *</FieldLabel>
                                                    <Input
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Segundo nombre"
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>
                                </div>

                                <form.Field name="cargo">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Cargo *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Cargo"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                            </FieldGroup>
                        </FieldSet>
                        {/* SECCIÓN 3: Responsables */}
                        <FieldSet>
                            <FieldLegend>Responsables del Reporte</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-6">
                                {/* Elaborado Por */}
                                <form.Field name="elaboradoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Elaborado Por *</FieldLabel>
                                                <FieldDescription>Personas que elaboraron el reporte</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`elaboradoPor[${index}]`}>
                                                        {(subField) => {
                                                            const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            value={subField.state.value ?? ""}
                                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                                            onBlur={subField.handleBlur}
                                                                            placeholder={`Nombre ${index + 1}`}
                                                                            aria-invalid={isSubFieldInvalid}
                                                                            className="flex-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.removeValue(index)}
                                                                            className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                            aria-label="Eliminar"
                                                                        >
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                    {isSubFieldInvalid && (
                                                                        <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                    )}
                                                                </div>
                                                            )
                                                        }}
                                                    </form.Field>

                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Elaborador
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                {/* Revisado Por */}
                                <form.Field name="revisadoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0

                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Revisado Por *</FieldLabel>
                                                <FieldDescription>Personas que revisaron el reporte</FieldDescription>

                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`revisadoPor[${index}]`}>
                                                        {(subField) => {
                                                            const isSubFieldInvalid =
                                                                subField.state.meta.isTouched && subField.state.meta.errors.length > 0

                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            value={subField.state.value ?? ""}
                                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                                            onBlur={subField.handleBlur}
                                                                            placeholder={`Nombre ${index + 1}`}
                                                                            aria-invalid={isSubFieldInvalid}
                                                                            className="flex-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.removeValue(index)}
                                                                            className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                            aria-label="Eliminar"
                                                                        >
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                    </div>

                                                                    {isSubFieldInvalid && (
                                                                        <FieldError>
                                                                            {subField.state.meta.errors.join(", ")}
                                                                        </FieldError>
                                                                    )}
                                                                </div>
                                                            )
                                                        }}
                                                    </form.Field>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => field.pushValue("")}
                                                >
                                                    + Agregar Revisor
                                                </Button>

                                                {isInvalid && (
                                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>


                                {/* Aprobado Por */}
                                <form.Field name="aprobadoPor" mode="array">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Aprobado Por *</FieldLabel>
                                                <FieldDescription>Personas que aprobaron el reporte</FieldDescription>
                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`aprobadoPor[${index}]`} children={(subField) => {
                                                        const isSubFieldInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0
                                                        return (
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <Input
                                                                        value={subField.state.value ?? ""}
                                                                        onChange={(e) => subField.handleChange(e.target.value)}
                                                                        onBlur={subField.handleBlur}
                                                                        placeholder={`Nombre ${index + 1}`}
                                                                        aria-invalid={isSubFieldInvalid}
                                                                        className="flex-1"
                                                                    />
                                                                    <button
                                                                        type="button"
                                                                        onClick={() => field.removeValue(index)}
                                                                        className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                        aria-label="Eliminar"
                                                                    >
                                                                        <X className="w-4 h-4 text-red-600" />
                                                                    </button>
                                                                </div>
                                                                {isSubFieldInvalid && (
                                                                    <FieldError>{subField.state.meta.errors.join(", ")}</FieldError>
                                                                )}
                                                            </div>
                                                        )
                                                    }} />
                                                ))}
                                                <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
                                                    + Agregar Aprobador
                                                </Button>
                                                {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Detalles del Trabajo</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                <FieldSeparator />
                                <FieldGroup className="gap-4">

                                    <form.Field name="objetivo">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Objetivo *</FieldLabel>
                                                    <Textarea
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Describa el objetivo del reporte"
                                                        rows={3}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                    <form.Field name="alcance">
                                        {(field) => {
                                            const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                            return (
                                                <Field data-invalid={isInvalid}>
                                                    <FieldLabel htmlFor={field.name}>Alcance *</FieldLabel>
                                                    <Textarea
                                                        id={field.name}
                                                        value={field.state.value}
                                                        onBlur={field.handleBlur}
                                                        onChange={(e) => field.handleChange(e.target.value)}
                                                        aria-invalid={isInvalid}
                                                        placeholder="Describa el alcance"
                                                        rows={3}
                                                    />
                                                    {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                                </Field>
                                            )
                                        }}
                                    </form.Field>

                                </FieldGroup>

                                <form.Field name="activos" mode="array">
                                    {(activosField) => (
                                        <div className="space-y-4">
                                            <FieldLabel>Activos *</FieldLabel>

                                            {activosField.state.value.map((_, activoIndex) => (
                                                <form.Field key={activoIndex} name={`activos[${activoIndex}]`}>
                                                    {(activoField) => (
                                                        <div className="p-4 border rounded-lg space-y-3 bg-slate-50">

                                                            {/* Campo: Nombre del Activo */}
                                                            <form.Field name={`activos[${activoIndex}].nombre`}>
                                                                {(nombreField) => (
                                                                    <div className="space-y-1">
                                                                        <FieldLabel>Nombre del activo</FieldLabel>
                                                                        <Input
                                                                            value={nombreField.state.value ?? ""}
                                                                            onChange={(e) => nombreField.handleChange(e.target.value)}
                                                                            onBlur={nombreField.handleBlur}
                                                                            placeholder={`Activo ${activoIndex + 1}`}
                                                                        />
                                                                        {nombreField.state.meta.errors.length > 0 && (
                                                                            <FieldError>
                                                                                {nombreField.state.meta.errors.join(", ")}
                                                                            </FieldError>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </form.Field>

                                                            {/* Campo: Pruebas asociadas a este activo */}
                                                            <form.Field name={`activos[${activoIndex}].pruebas`} mode="array">
                                                                {(pruebasField) => (
                                                                    <div className="pl-4 border-l-2 border-gray-200 space-y-2">
                                                                        <FieldLabel>Pruebas del activo</FieldLabel>
                                                                        {pruebasField.state.value.map((_, pruebaIndex) => (
                                                                            <form.Field
                                                                                key={pruebaIndex}
                                                                                name={`activos[${activoIndex}].pruebas[${pruebaIndex}]`}
                                                                            >
                                                                                {(pruebaField) => (
                                                                                    <div className="flex items-center gap-2">
                                                                                        <Input
                                                                                            value={pruebaField.state.value ?? ""}
                                                                                            onChange={(e) => pruebaField.handleChange(e.target.value)}
                                                                                            onBlur={pruebaField.handleBlur}
                                                                                            placeholder={`Prueba ${pruebaIndex + 1}`}
                                                                                            className="flex-1"
                                                                                        />
                                                                                        <button
                                                                                            type="button"
                                                                                            onClick={() => pruebasField.removeValue(pruebaIndex)}
                                                                                            className="p-2 border rounded hover:bg-red-50"
                                                                                        >
                                                                                            <X className="w-4 h-4 text-red-600" />
                                                                                        </button>
                                                                                    </div>
                                                                                )}
                                                                            </form.Field>
                                                                        ))}
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => pruebasField.pushValue("")}
                                                                        >
                                                                            + Agregar Prueba
                                                                        </Button>
                                                                        {pruebasField.state.meta.errors.length > 0 && (
                                                                            <FieldError>{pruebasField.state.meta.errors.join(", ")}</FieldError>
                                                                        )}
                                                                    </div>
                                                                )}
                                                            </form.Field>

                                                            {/* Botón eliminar activo */}
                                                            <button
                                                                type="button"
                                                                onClick={() => activosField.removeValue(activoIndex)}
                                                                className="text-red-600 text-sm mt-2"
                                                            >
                                                                Eliminar Activo
                                                            </button>
                                                        </div>
                                                    )}
                                                </form.Field>
                                            ))}

                                            {/* Botón agregar activo */}
                                            <Button
                                                type="button"
                                                variant="outline"
                                                size="sm"
                                                onClick={() => activosField.pushValue({ nombre: "", pruebas: [""] })}
                                            >
                                                + Agregar Activo
                                            </Button>

                                            {activosField.state.meta.errors.length > 0 && (
                                                <FieldError>{activosField.state.meta.errors.join(", ")}</FieldError>
                                            )}
                                        </div>
                                    )}
                                </form.Field>


                            </FieldGroup>
                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Personal Presente</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                <form.Field name="personalPresente" mode="array">
                                    {(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Personal Intermediario</FieldLabel>
                                                <FieldDescription>
                                                    Personal que intervino a la hora de hacer pruebas
                                                </FieldDescription>

                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`personalPresente[${index}]`}>
                                                        {(subField) => {
                                                            const isSubFieldInvalid =
                                                                subField.state.meta.isTouched &&
                                                                subField.state.meta.errors.length > 0
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Input
                                                                            value={subField.state.value ?? ""}
                                                                            onChange={(e) =>
                                                                                subField.handleChange(e.target.value)
                                                                            }
                                                                            onBlur={subField.handleBlur}
                                                                            placeholder={`Personal ${index + 1}`}
                                                                            aria-invalid={isSubFieldInvalid}
                                                                            className="flex-1"
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.removeValue(index)}
                                                                            className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                            aria-label="Eliminar"
                                                                        >
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                    {isSubFieldInvalid && (
                                                                        <FieldError>
                                                                            {subField.state.meta.errors.join(", ")}
                                                                        </FieldError>
                                                                    )}
                                                                </div>
                                                            )
                                                        }}
                                                    </form.Field>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => field.pushValue("")}
                                                >
                                                    + Agregar Personal
                                                </Button>

                                                {isInvalid && (
                                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>

                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Estandar de la Prueba</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">

                                <form.Field name="nombreDoc">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Nombre Estándar *</FieldLabel>
                                                <Input
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Nombre estándar"
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="desDoc">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Descripción Estándar *</FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Descripción del estándar"
                                                    rows={3}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                                <form.Field name="nombreEquipo">
                                    {(field) => {
                                        const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <Field data-invalid={isInvalid}>
                                                <FieldLabel htmlFor={field.name}>Equipos Utilizados *</FieldLabel>
                                                <Textarea
                                                    id={field.name}
                                                    value={field.state.value}
                                                    onBlur={field.handleBlur}
                                                    onChange={(e) => field.handleChange(e.target.value)}
                                                    aria-invalid={isInvalid}
                                                    placeholder="Descripción de equipos utilizados"
                                                    rows={3}
                                                />
                                                {isInvalid && <FieldError errors={field.state.meta.errors} />}
                                            </Field>
                                        )
                                    }}
                                </form.Field>

                            </FieldGroup>


                        </FieldSet>
                        <FieldSet>
                            <FieldLegend>Observaciones, Recomendaciones y Conclusiones</FieldLegend>
                            <FieldSeparator />
                            <FieldGroup className="gap-4">
                                {/* Conclusiones y Recomendaciones */}
                                <form.Field name="conclucionesRecomendaciones" mode="array">
                                    {(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Conclusiones y Recomendaciones</FieldLabel>
                                                <FieldDescription>
                                                    Recomendaciones y Conclusiones de la Prueba Realizada
                                                </FieldDescription>

                                                {field.state.value.map((_, index) => (
                                                    <form.Field
                                                        key={index}
                                                        name={`conclucionesRecomendaciones[${index}]`}
                                                    >
                                                        {(subField) => {
                                                            const isSubFieldInvalid =
                                                                subField.state.meta.isTouched &&
                                                                subField.state.meta.errors.length > 0
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Textarea
                                                                            value={subField.state.value ?? ""}
                                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                                            onBlur={subField.handleBlur}
                                                                            placeholder={`Conclusión o Recomendación ${index + 1
                                                                                }`}
                                                                            aria-invalid={isSubFieldInvalid}
                                                                            className="flex-1"
                                                                            rows={3}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.removeValue(index)}
                                                                            className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                            aria-label="Eliminar"
                                                                        >
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                    {isSubFieldInvalid && (
                                                                        <FieldError>
                                                                            {subField.state.meta.errors.join(", ")}
                                                                        </FieldError>
                                                                    )}
                                                                </div>
                                                            )
                                                        }}
                                                    </form.Field>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => field.pushValue("")}
                                                >
                                                    + Agregar Conclusión o Recomendación
                                                </Button>

                                                {isInvalid && (
                                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>

                                {/* Observaciones */}
                                <form.Field name="observaciones" mode="array">
                                    {(field) => {
                                        const isInvalid =
                                            field.state.meta.isTouched && field.state.meta.errors.length > 0
                                        return (
                                            <div className="space-y-3">
                                                <FieldLabel>Observaciones</FieldLabel>
                                                <FieldDescription>
                                                    Observaciones de la Prueba Realizada
                                                </FieldDescription>

                                                {field.state.value.map((_, index) => (
                                                    <form.Field key={index} name={`observaciones[${index}]`}>
                                                        {(subField) => {
                                                            const isSubFieldInvalid =
                                                                subField.state.meta.isTouched &&
                                                                subField.state.meta.errors.length > 0
                                                            return (
                                                                <div className="space-y-1">
                                                                    <div className="flex items-center gap-2">
                                                                        <Textarea
                                                                            value={subField.state.value ?? ""}
                                                                            onChange={(e) => subField.handleChange(e.target.value)}
                                                                            onBlur={subField.handleBlur}
                                                                            placeholder={`Observación ${index + 1}`}
                                                                            aria-invalid={isSubFieldInvalid}
                                                                            className="flex-1"
                                                                            rows={3}
                                                                        />
                                                                        <button
                                                                            type="button"
                                                                            onClick={() => field.removeValue(index)}
                                                                            className="p-2 rounded hover:bg-red-50 transition-colors border"
                                                                            aria-label="Eliminar"
                                                                        >
                                                                            <X className="w-4 h-4 text-red-600" />
                                                                        </button>
                                                                    </div>
                                                                    {isSubFieldInvalid && (
                                                                        <FieldError>
                                                                            {subField.state.meta.errors.join(", ")}
                                                                        </FieldError>
                                                                    )}
                                                                </div>
                                                            )
                                                        }}
                                                    </form.Field>
                                                ))}

                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => field.pushValue("")}
                                                >
                                                    + Agregar Observación
                                                </Button>

                                                {isInvalid && (
                                                    <FieldError>{field.state.meta.errors.join(", ")}</FieldError>
                                                )}
                                            </div>
                                        )
                                    }}
                                </form.Field>
                            </FieldGroup>


                        </FieldSet>

                    </FieldGroup>

                    <Field orientation="horizontal" className="justify-end">
                        <Button
                            type="button"
                            variant="custom"
                            size="custom"
                            onClick={() => {
                                form.reset()
                                setSavedValues({})
                            }}
                        >
                            Reset
                        </Button>
                        <Button
                            type="submit"
                            variant="custom"
                            size="custom"
                        >
                            Save
                        </Button>
                    </Field>
                </form>

                {savedValues && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                        <h3 className="font-semibold text-green-800 mb-2">✅ Datos guardados exitosamente:</h3>
                        <pre className="text-sm text-green-700 overflow-auto max-h-60 bg-white p-3 rounded">
                            {JSON.stringify(savedValues, null, 2)}
                        </pre>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}