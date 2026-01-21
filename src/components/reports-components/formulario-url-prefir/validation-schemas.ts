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
  personalPresenteCliente: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
    })
  ).min(1, "Debe haber al menos una persona del cliente presente"),
});

export const step3Schema = z.object({
  elaboradoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
      firma: z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        data: z.string(),
      }, { required_error: "La firma es obligatoria" }),
    })
  ).min(1, "Debe haber al menos un elaborador").refine(
    (arr) => arr.every((item) => item.firma !== null && item.firma !== undefined),
    { message: "Todos los elaboradores deben tener firma" }
  ),
  revisadoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
      firma: z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        data: z.string(),
      }, { required_error: "La firma es obligatoria" }),
    })
  ).min(1, "Debe haber al menos un revisor").refine(
    (arr) => arr.every((item) => item.firma !== null && item.firma !== undefined),
    { message: "Todos los revisores deben tener firma" }
  ),
  aprobadoPor: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
      empresa: z.string().min(2, "Empresa obligatoria"),
      firma: z.object({
        name: z.string(),
        size: z.number(),
        type: z.string(),
        data: z.string(),
      }, { required_error: "La firma es obligatoria" }),
    })
  ).min(1, "Debe haber al menos un aprobador").refine(
    (arr) => arr.every((item) => item.firma !== null && item.firma !== undefined),
    { message: "Todos los aprobadores deben tener firma" }
  ),
});

export const step4Schema = z.object({
  personalPresente: z.array(
    z.object({
      nombre: z.string().min(2, "Nombre obligatorio"),
      cargo: z.string().min(2, "Cargo obligatorio"),
    })
  ).min(1, "Debe haber al menos un personal presente"),
  nombreDoc: z.string().min(2, { message: "Nombre estándar obligatorio" }),
  desDoc: z.string().min(2, { message: "Descripción estándar obligatoria" }),
});

export const step5Schema = z.object({
  objetivo: z.string().min(2, { message: "El objetivo es obligatorio" }),
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

export const step6Schema = z.object({
  conclusiones: z.array(z.string().min(5, { message: "La conclusión es obligatoria (mínimo 5 caracteres)" })).min(1, "Debe haber al menos una conclusión"),
  observaciones: z.array(z.string().min(5, { message: "La observación es obligatoria (mínimo 5 caracteres)" })).min(1, "Debe haber al menos una observación"),
  recomendaciones: z.array(z.string().min(5, { message: "La recomendación es obligatoria (mínimo 5 caracteres)" })).min(1, "Debe haber al menos una recomendación"),
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
