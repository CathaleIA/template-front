import {
  Field,
  FieldDescription,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X } from "lucide-react";

export function FormField({ field, label, placeholder, type = "text" }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name} className="font-semibold text-slate-700">{label}</FieldLabel>
      <Input
        id={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function FormTextarea({ field, label, placeholder }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name} className="font-semibold text-slate-700">{label}</FieldLabel>
      <Textarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        rows={3}
        className="rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all resize-none"
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function ResponsableArrayField({ field, label, description }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <div className="space-y-4 p-4 bg-slate-50 rounded-lg border border-slate-200">
      <div>
        <FieldLabel className="font-semibold text-slate-700">{label}</FieldLabel>
        <FieldDescription className="text-slate-600">{description}</FieldDescription>
      </div>
      {field.state.value.map((_: any, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <Input
            value={field.state.value[index] ?? ""}
            onChange={(e) => {
              const newValue = [...field.state.value];
              newValue[index] = e.target.value;
              field.handleChange(newValue);
            }}
            onBlur={() => field.handleBlur()}
            placeholder={`Nombre ${index + 1}`}
            className="flex-1 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 transition-all"
          />
          <button
            type="button"
            onClick={() => field.removeValue(index)}
            className="p-2 rounded-lg hover:bg-red-100 transition-all border border-red-200"
          >
            <X className="w-4 h-4 text-red-600" />
          </button>
        </div>
      ))}
      <Button 
        type="button" 
        variant="outline" 
        size="sm" 
        onClick={() => field.pushValue("")}
        className="w-full rounded-lg hover:bg-blue-50 transition-all"
      >
        + {label === "Elaborado Por" ? "Agregar Elaborador" : label === "Revisado Por" ? "Agregar Revisor" : "Agregar Aprobador"}
      </Button>
      {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
    </div>
  );
}

export function FormArrayItem({ field, index }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  
  return (
    <div className="flex items-center gap-2">
      <Input
        value={field.state.value[index] ?? ""}
        onChange={(e) => {
          const newValue = [...field.state.value];
          newValue[index] = e.target.value;
          field.handleChange(newValue);
        }}
        onBlur={() => field.handleBlur()}
        placeholder={`Nombre ${index + 1}`}
        aria-invalid={isInvalid}
        className="flex-1"
      />
      <button
        type="button"
        onClick={() => field.removeValue(index)}
        className="p-2 rounded hover:bg-red-50 transition-colors border"
      >
        <X className="w-4 h-4 text-red-600" />
      </button>
    </div>
  );
}
