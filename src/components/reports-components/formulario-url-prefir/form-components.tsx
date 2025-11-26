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
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Input
        id={field.name}
        type={type}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function FormTextarea({ field, label, placeholder }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <Field data-invalid={isInvalid}>
      <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
      <Textarea
        id={field.name}
        value={field.state.value}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        aria-invalid={isInvalid}
        placeholder={placeholder}
        rows={3}
      />
      {isInvalid && <FieldError errors={field.state.meta.errors} />}
    </Field>
  );
}

export function ResponsableArrayField({ field, label, description }: any) {
  const isInvalid = field.state.meta.isTouched && field.state.meta.errors.length > 0;
  return (
    <div className="space-y-3">
      <FieldLabel>{label}</FieldLabel>
      <FieldDescription>{description}</FieldDescription>
      {field.state.value.map((_: any, index: number) => (
        <FormArrayItem key={index} field={field} index={index} />
      ))}
      <Button type="button" variant="outline" size="sm" onClick={() => field.pushValue("")}>
        + {label === "Elaborado Por" ? "Agregar Elaborador" : label === "Revisado Por" ? "Agregar Revisor" : "Agregar Aprobador"}
      </Button>
      {isInvalid && <FieldError>{field.state.meta.errors.join(", ")}</FieldError>}
    </div>
  );
}

export function FormArrayItem({ field, index }: any) {
  return (
    <field.index name={index}>
      {(subField: any) => {
        const isInvalid = subField.state.meta.isTouched && subField.state.meta.errors.length > 0;
        return (
          <div className="flex items-center gap-2">
            <Input
              value={subField.state.value ?? ""}
              onChange={(e) => subField.handleChange(e.target.value)}
              onBlur={subField.handleBlur}
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
      }}
    </field.index>
  );
}
