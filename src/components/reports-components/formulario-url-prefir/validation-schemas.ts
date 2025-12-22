import { z } from "zod";

export const step1Schema = z.object({
  reportTitle: z.string().min(2, { message: "El título es obligatorio" }),
  codigo: z.string().min(2, { message: "El código es obligatorio" }),
  fechaEjecucion: z.string().min(2, { message: "La fecha es obligatoria" }),
  fechaEmision: z.string().min(2, { message: "La fecha es obligatoria" }),
});

export const step2Schema = z.object({
  cliente: z.string().min(2, { message: "El cliente es obligatorio" }),
  municipio: z.string().min(2, { message: "El municipio es obligatorio" }),
  departamento: z.string().min(2, { message: "El departamento es obligatorio" }),
  primerNombre: z.string().min(2, { message: "El primer nombre es obligatorio" }),
  segundoNombre: z.string().min(2, { message: "El segundo nombre es obligatorio" }),
  cargo: z.string().min(2, { message: "El cargo es obligatorio" }),
});

export const step3Schema = z.object({
  elaboradoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
    })
  ).min(1, "Debe haber al menos un elaborador"),
  revisadoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
    })
  ).min(1, "Debe haber al menos un revisor"),
  aprobadoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
    })
  ).min(1, "Debe haber al menos un aprobador"),
});

export const step4Schema = z.object({
  objetivo: z.string().min(2, { message: "El objetivo es obligatorio" }),
  alcance: z.string().min(2, { message: "El alcance es obligatorio" }),
  centroTransformacion: z.string().regex(/^\d+$/, { message: "Solo se permiten números" }).min(1, { message: "El Centro de Transformación es obligatorio" }),
  activos: z.array(
    z.object({
      nombre: z.string().min(2, { message: "El activo es obligatorio" }),
      pruebas: z.array(
        z.string().min(2, { message: "La prueba es obligatoria" })
      ).min(1, "Debe haber al menos una prueba")
    })
  ).min(1, "Debe haber al menos un activo"),
  equipos: z.array(
    z.object({
      marca: z.string().min(2, { message: "La marca es obligatoria" }),
      referencia: z.string().min(2, { message: "La referencia es obligatoria" }),
      numeroSerie: z.string().min(2, { message: "El número de serie es obligatorio" }),
    })
  ).min(1, "Debe haber al menos un equipo"),
});

export const step5Schema = z.object({
  personalPresente: z.array(z.string().min(2, "Campo obligatorio")).min(1, "Debe haber al menos un personal presente"),
  nombreDoc: z.string().min(2, { message: "Nombre estándar obligatorio" }),
  desDoc: z.string().min(2, { message: "Descripción estándar obligatoria" }),
  nombreEquipo: z.string().min(2, { message: "Equipos utilizados obligatorio" }),
});

export const step6Schema = z.object({
  conclusiones: z.string().min(10, { message: "Las conclusiones son obligatorias (mínimo 10 caracteres)" }),
  observaciones: z.string().min(10, { message: "Las observaciones son obligatorias (mínimo 10 caracteres)" }),
  recomendaciones: z.string().min(10, { message: "Las recomendaciones son obligatorias (mínimo 10 caracteres)" }),
});

export const fullSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(step5Schema)
  .merge(step6Schema);

export const stepSchemas = {
  1: step1Schema,
  2: step2Schema,
  3: step3Schema,
  4: step4Schema,
  5: step5Schema,
  6: step6Schema,
};
